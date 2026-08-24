// Envoie un devis ou une facture au client par e-mail, avec le lien de l'espace client.
// Marque le document comme envoyé et trace l'envoi dans le journal.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = Deno.env.get("DOCUMENT_FROM_EMAIL") ?? "contact@digitalzdev.com";
const SITE_URL = Deno.env.get("SITE_URL") ?? "https://www.digitalzdev.com";

const admin = createClient(SUPABASE_URL, SERVICE_KEY);

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, apikey",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!)
  );
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  if (req.method !== "POST") return json({ error: "Méthode non autorisée." }, 405);

  // Seul un membre connecté peut déclencher un envoi
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ error: "Authentification requise." }, 401);

  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return json({ error: "Session invalide." }, 401);

  if (!RESEND_API_KEY) {
    return json({
      error:
        "L'envoi d'e-mails n'est pas encore configuré. Ajoute la clé RESEND_API_KEY dans les secrets du projet Supabase.",
    }, 503);
  }

  const body = await req.json().catch(() => ({}));
  const { entityType, entityId, to, message } = body;

  if (entityType !== "quote" && entityType !== "invoice") {
    return json({ error: "Type de document inconnu." }, 400);
  }
  if (!entityId || typeof to !== "string" || !to.includes("@")) {
    return json({ error: "Adresse du destinataire manquante ou invalide." }, 400);
  }

  const table = entityType === "quote" ? "quotes" : "invoices";
  const { data: doc } = await admin
    .from(table)
    .select("*, client:clients(name)")
    .eq("id", entityId)
    .maybeSingle();

  if (!doc) return json({ error: "Document introuvable." }, 404);

  // Un lien d'espace client par envoi, pour suivre qui ouvre quoi
  const { data: link, error: linkError } = await admin
    .from("share_links")
    .insert({
      entity_type: entityType,
      entity_id: entityId,
      allow_accept: entityType === "quote",
      created_by: user.id,
      label: `Envoi à ${to}`,
    })
    .select("token")
    .single();

  if (linkError || !link) return json({ error: "Le lien client n'a pas pu être créé." }, 500);

  const number = doc.quote_number ?? doc.invoice_number;
  const label = entityType === "quote" ? "Devis" : "Facture";
  const url = `${SITE_URL}/espace/${link.token}`;
  const intro = typeof message === "string" && message.trim()
    ? escapeHtml(message.trim()).replace(/\n/g, "<br>")
    : `Vous trouverez ci-dessous ${entityType === "quote" ? "votre devis" : "votre facture"}.`;

  const html = `
    <div style="font-family:system-ui,-apple-system,sans-serif;max-width:560px;margin:0 auto;color:#111">
      <p>Bonjour${doc.client?.name ? " " + escapeHtml(doc.client.name) : ""},</p>
      <p>${intro}</p>
      <p style="margin:24px 0">
        <a href="${url}" style="display:inline-block;background:#111;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none">
          Consulter ${label.toLowerCase()} ${escapeHtml(number)}
        </a>
      </p>
      <p style="color:#666;font-size:14px">
        ${entityType === "quote"
          ? "Vous pouvez accepter ou refuser directement depuis cette page."
          : "Le détail du règlement figure sur cette page."}
      </p>
      <p style="color:#666;font-size:13px">Si le bouton ne fonctionne pas : <br>${url}</p>
    </div>
  `;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [to],
      subject: `${label} ${number}${doc.title ? " · " + doc.title : ""}`,
      html,
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    console.error("Resend error:", detail);
    return json({ error: "L'e-mail n'a pas pu être envoyé par le service de messagerie." }, 502);
  }

  await admin.from(table)
    .update({ status: doc.status === "draft" ? "sent" : doc.status, sent_at: new Date().toISOString() })
    .eq("id", entityId);

  await admin.from("activity").insert({
    actor_id: user.id,
    entity_type: entityType,
    entity_id: entityId,
    project_id: doc.project_id,
    action: "sent",
    summary: `a envoyé ${entityType === "quote" ? "le devis" : "la facture"} ${number} à ${to}`,
  });

  return json({ ok: true, url });
});
