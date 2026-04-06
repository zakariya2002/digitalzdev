import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS });
  }

  // Facebook webhook verification (GET) — conservé pour compatibilité
  if (req.method === "GET") {
    const VERIFY_TOKEN = Deno.env.get("FB_VERIFY_TOKEN") || "";
    const url = new URL(req.url);
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("Webhook verified");
      return new Response(challenge, { status: 200, headers: CORS });
    }
    return new Response("Forbidden", { status: 403, headers: CORS });
  }

  // POST — Réception des leads
  if (req.method === "POST") {
    try {
      const body = await req.json();
      console.log("Received lead data:", JSON.stringify(body));

      // Format Make.com / n8n : les champs sont directement dans le body
      // Ou le body est une string JSON dans jsonStringBodyContent
      let leadData = body;

      // Si c'est le format brut avec jsonStringBodyContent
      if (typeof body === "string") {
        leadData = JSON.parse(body);
      }

      // Détecter si c'est le format Facebook webhook natif (entry[].changes[])
      if (leadData.entry && Array.isArray(leadData.entry)) {
        // Format Facebook natif — traiter comme avant
        const FB_ACCESS_TOKEN = Deno.env.get("FB_PAGE_ACCESS_TOKEN") || "";
        for (const entry of leadData.entry) {
          for (const change of entry.changes || []) {
            if (change.field === "leadgen") {
              const leadgenId = change.value.leadgen_id;
              await processNativeLead(leadgenId, FB_ACCESS_TOKEN);
            }
          }
        }
        return jsonResponse({ success: true, source: "facebook_native" });
      }

      // Format Make.com / n8n — champs parsés directement
      const name = leadData["nom_complet"] || leadData["full_name"] || leadData["name"] || "Lead Facebook";
      const email = leadData["e-mail"] || leadData["email"] || null;
      const phone = leadData["numéro_de_téléphone"] || leadData["phone_number"] || leadData["phone"] || null;

      // Champs supplémentaires du formulaire Facebook → notes
      const extraFields: string[] = [];
      for (const [key, value] of Object.entries(leadData)) {
        const lowerKey = key.toLowerCase();
        if (
          lowerKey !== "nom_complet" &&
          lowerKey !== "full_name" &&
          lowerKey !== "name" &&
          lowerKey !== "e-mail" &&
          lowerKey !== "email" &&
          lowerKey !== "numéro_de_téléphone" &&
          lowerKey !== "phone_number" &&
          lowerKey !== "phone"
        ) {
          const displayValue = Array.isArray(value) ? value.join(", ") : String(value);
          extraFields.push(`${key}: ${displayValue}`);
        }
      }

      const notes = extraFields.length > 0
        ? `Facebook Lead — ${new Date().toLocaleDateString("fr-FR")}\n${extraFields.join("\n")}`
        : `Facebook Lead — ${new Date().toLocaleDateString("fr-FR")}`;

      const clientData = {
        name,
        email,
        phone,
        source: "facebook",
        status: "new_lead",
        notes,
      };

      console.log("Inserting client:", clientData);

      const { data, error } = await supabase.from("clients").insert(clientData).select().single();

      if (error) {
        console.error("Supabase insert error:", error);
        return jsonResponse({ error: "Erreur insertion", details: error.message }, 500);
      }

      console.log("Lead inserted:", data.id, clientData.name);
      return jsonResponse({ success: true, id: data.id, name: clientData.name });
    } catch (error) {
      console.error("Error processing lead:", error);
      return jsonResponse({ error: "Erreur interne", details: String(error) }, 500);
    }
  }

  return jsonResponse({ error: "Method not allowed" }, 405);
});

// Traitement des leads Facebook natifs (via Graph API)
async function processNativeLead(leadgenId: string, accessToken: string) {
  if (!accessToken) {
    console.error("FB_PAGE_ACCESS_TOKEN not configured");
    return;
  }

  const fbResponse = await fetch(
    `https://graph.facebook.com/v19.0/${leadgenId}?access_token=${accessToken}`
  );

  if (!fbResponse.ok) {
    console.error("Facebook API error:", await fbResponse.text());
    return;
  }

  const leadData = await fbResponse.json();
  const fields: Record<string, string> = {};
  for (const field of leadData.field_data || []) {
    fields[field.name] = field.values?.[0] || "";
  }

  const clientData = {
    name: fields.full_name || fields.first_name
      ? `${fields.first_name || ""} ${fields.last_name || ""}`.trim()
      : "Lead Facebook",
    email: fields.email || null,
    phone: fields.phone_number || fields.phone || null,
    source: "facebook",
    status: "new_lead",
    notes: `Lead Facebook #${leadgenId} — ${new Date().toLocaleDateString("fr-FR")}`,
  };

  const { error } = await supabase.from("clients").insert(clientData);
  if (error) {
    console.error("Supabase insert error:", error);
  } else {
    console.log("Native lead inserted:", clientData.name);
  }
}
