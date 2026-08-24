// Espace client : expose un devis, une facture ou l'avancement d'un projet
// à partir d'un lien à jeton, sans compte ni connexion.
// Toute lecture passe par ici : les tables restent fermées au public.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const admin = createClient(SUPABASE_URL, SERVICE_KEY);

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, apikey",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

  const url = new URL(req.url);
  const token = url.searchParams.get("token") ??
    (req.method === "POST" ? (await req.clone().json().catch(() => ({}))).token : null);

  if (!token || typeof token !== "string" || token.length < 20) {
    return json({ error: "Lien invalide." }, 400);
  }

  const { data: link } = await admin
    .from("share_links")
    .select("*")
    .eq("token", token)
    .maybeSingle();

  if (!link) return json({ error: "Ce lien n'existe pas." }, 404);
  if (link.revoked_at) return json({ error: "Ce lien a été désactivé." }, 410);
  if (link.expires_at && new Date(link.expires_at) < new Date()) {
    return json({ error: "Ce lien a expiré. Demandez-en un nouveau." }, 410);
  }

  // --- Dépôt de contenus par le client ---
  if (req.method === "POST") {
    const body = await req.json().catch(() => ({}));

    if (body.action && link.entity_type === "project") {
      // La demande doit appartenir au projet que ce lien ouvre
      const { data: request } = await admin
        .from("content_requests")
        .select("id, project_id, label, kind")
        .eq("id", body.requestId ?? "")
        .maybeSingle();

      if (!request || request.project_id !== link.entity_id) {
        return json({ error: "Élément introuvable." }, 404);
      }

      if (body.action === "content_text") {
        const text = typeof body.text === "string" ? body.text.slice(0, 5000) : "";
        const { error } = await admin.from("content_requests").update({
          response_text: text || null,
          status: text ? "received" : "pending",
          received_at: text ? new Date().toISOString() : null,
        }).eq("id", request.id);
        if (error) return json({ error: "Votre réponse n'a pas pu être enregistrée." }, 500);
        return json({ ok: true });
      }

      if (body.action === "content_upload") {
        const name = typeof body.fileName === "string" ? body.fileName : "";
        const size = Number(body.size) || 0;
        if (!name) return json({ error: "Nom de fichier manquant." }, 400);
        if (size > 25 * 1024 * 1024) {
          return json({ error: "Ce fichier dépasse 25 Mo. Envoyez-le via un lien de partage." }, 413);
        }
        const safe = name.replace(/[^\w.\-]+/g, "_").slice(-80);
        const path = `${link.entity_id}/client/${Date.now()}-${safe}`;
        const { data, error } = await admin.storage
          .from("project-files")
          .createSignedUploadUrl(path);
        if (error || !data) return json({ error: "Le dépôt n'a pas pu être préparé." }, 500);
        return json({ ok: true, path, token: data.token, signedUrl: data.signedUrl });
      }

      if (body.action === "content_uploaded") {
        const path = typeof body.path === "string" ? body.path : "";
        if (!path.startsWith(`${link.entity_id}/client/`)) {
          return json({ error: "Dépôt invalide." }, 400);
        }
        const { error } = await admin.from("project_files").insert({
          project_id: link.entity_id,
          content_request_id: request.id,
          name: typeof body.fileName === "string" ? body.fileName.slice(0, 200) : "Document",
          url: path,
          storage_path: path,
          file_type: "upload",
          size_bytes: Number(body.size) || null,
          mime_type: typeof body.contentType === "string" ? body.contentType : null,
          uploaded_by_client: true,
          client_name: typeof body.clientName === "string" ? body.clientName.slice(0, 120) : null,
        });
        if (error) return json({ error: "Le document n'a pas pu être référencé." }, 500);

        await admin.from("content_requests").update({
          status: "received",
          received_at: new Date().toISOString(),
        }).eq("id", request.id);

        return json({ ok: true });
      }

      return json({ error: "Action inconnue." }, 400);
    }

    const response = body.response;
    const name = typeof body.name === "string" ? body.name.slice(0, 120) : null;

    if (response !== "accepted" && response !== "rejected") {
      return json({ error: "Réponse inconnue." }, 400);
    }

    const { data, error } = await admin.rpc("record_share_response", {
      p_token: token,
      p_response: response,
      p_name: name,
    });

    if (error) return json({ error: "La réponse n'a pas pu être enregistrée." }, 500);
    return json(data);
  }

  // --- Consultation ---
  await admin
    .from("share_links")
    .update({
      first_viewed_at: link.first_viewed_at ?? new Date().toISOString(),
      last_viewed_at: new Date().toISOString(),
      view_count: (link.view_count ?? 0) + 1,
    })
    .eq("id", link.id);

  const shared = {
    entityType: link.entity_type,
    allowAccept: link.allow_accept && !link.responded_at,
    respondedAt: link.responded_at,
    response: link.response,
  };

  if (link.entity_type === "quote" || link.entity_type === "invoice") {
    const table = link.entity_type === "quote" ? "quotes" : "invoices";
    const itemsTable = link.entity_type === "quote" ? "quote_items" : "invoice_items";
    const fk = link.entity_type === "quote" ? "quote_id" : "invoice_id";

    const [{ data: doc }, { data: items }] = await Promise.all([
      admin.from(table).select("*, client:clients(name, email)").eq("id", link.entity_id).maybeSingle(),
      admin.from(itemsTable).select("*").eq(fk, link.entity_id).order("position"),
    ]);

    if (!doc) return json({ error: "Document introuvable." }, 404);

    // On ne renvoie que ce qui figure sur le document imprimé
    return json({
      ...shared,
      document: {
        number: doc.quote_number ?? doc.invoice_number,
        title: doc.title,
        description: doc.description,
        status: doc.status,
        total: doc.total_amount,
        paidAmount: doc.paid_amount ?? null,
        issueDate: doc.issue_date ?? doc.created_at,
        dueDate: doc.due_date ?? doc.valid_until,
        terms: doc.terms,
        notes: doc.notes,
        clientName: doc.client?.name ?? null,
        items: (items ?? []).map((i) => ({
          description: i.description,
          quantity: i.quantity,
          unitPrice: i.unit_price,
          total: i.total,
        })),
      },
    });
  }

  // Avancement d'un projet
  const [{ data: project }, { data: tasks }, { data: milestones }, { data: contents }, { data: files }] = await Promise.all([
    admin.from("projects").select("name, status, description, start_date, end_date").eq("id", link.entity_id).maybeSingle(),
    admin.from("tasks").select("status").eq("project_id", link.entity_id),
    admin.from("milestones").select("title, due_date, status").eq("project_id", link.entity_id)
      .eq("is_client_commitment", true).order("due_date"),
    admin.from("content_requests")
      .select("id, label, description, kind, category, is_required, status, response_text, review_note, due_date")
      .eq("project_id", link.entity_id).order("position"),
    admin.from("project_files")
      .select("id, name, content_request_id, size_bytes, created_at")
      .eq("project_id", link.entity_id).not("content_request_id", "is", null),
  ]);

  if (!project) return json({ error: "Projet introuvable." }, 404);

  const total = tasks?.length ?? 0;
  const done = tasks?.filter((t) => t.status === "done").length ?? 0;

  return json({
    ...shared,
    project: {
      name: project.name,
      status: project.status,
      description: project.description,
      startDate: project.start_date,
      endDate: project.end_date,
      progress: total ? Math.round((done / total) * 100) : 0,
      tasksDone: done,
      tasksTotal: total,
      milestones: milestones ?? [],
    },
    contents: (contents ?? []).map((c) => ({
      ...c,
      files: (files ?? [])
        .filter((f) => f.content_request_id === c.id)
        .map((f) => ({ id: f.id, name: f.name, size: f.size_bytes, at: f.created_at })),
    })),
  });
});
