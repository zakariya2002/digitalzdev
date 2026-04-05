import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const VERIFY_TOKEN = Deno.env.get("FB_VERIFY_TOKEN")!;
const FB_ACCESS_TOKEN = Deno.env.get("FB_PAGE_ACCESS_TOKEN")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

Deno.serve(async (req) => {
  // Facebook webhook verification (GET)
  if (req.method === "GET") {
    const url = new URL(req.url);
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("Webhook verified");
      return new Response(challenge, { status: 200 });
    }
    return new Response("Forbidden", { status: 403 });
  }

  // Facebook lead event (POST)
  if (req.method === "POST") {
    try {
      const body = await req.json();
      console.log("Received webhook:", JSON.stringify(body));

      // Facebook envoie un objet avec entry[] > changes[] > value.leadgen_id
      for (const entry of body.entry || []) {
        for (const change of entry.changes || []) {
          if (change.field === "leadgen") {
            const leadgenId = change.value.leadgen_id;
            await processLead(leadgenId);
          }
        }
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error processing webhook:", error);
      return new Response(JSON.stringify({ error: "Internal error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  return new Response("Method not allowed", { status: 405 });
});

async function processLead(leadgenId: string) {
  // Récupérer les données du lead via Facebook Graph API
  const fbResponse = await fetch(
    `https://graph.facebook.com/v19.0/${leadgenId}?access_token=${FB_ACCESS_TOKEN}`
  );

  if (!fbResponse.ok) {
    console.error("Facebook API error:", await fbResponse.text());
    return;
  }

  const leadData = await fbResponse.json();
  console.log("Lead data:", JSON.stringify(leadData));

  // Extraire les champs du formulaire Facebook
  const fields: Record<string, string> = {};
  for (const field of leadData.field_data || []) {
    fields[field.name] = field.values?.[0] || "";
  }

  // Mapper vers notre table clients
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
    console.log("Lead inserted:", clientData.name);
  }
}
