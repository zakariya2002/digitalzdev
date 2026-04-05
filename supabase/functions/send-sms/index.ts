import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID")!;
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN")!;
const TWILIO_PHONE_NUMBER = Deno.env.get("TWILIO_PHONE_NUMBER")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  // Vérifier l'auth Supabase
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return jsonResponse({ error: "Missing auth" }, 401);
  }

  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: { user }, error: authError } = await userClient.auth.getUser();
  if (authError || !user) {
    return jsonResponse({ error: "Non authentifié" }, 401);
  }

  try {
    const { clientId, body, templateId } = await req.json();

    // Récupérer le client
    const { data: client, error: clientError } = await adminClient
      .from("clients")
      .select("*")
      .eq("id", clientId)
      .single();

    if (clientError || !client) {
      return jsonResponse({ error: "Client introuvable" }, 404);
    }

    const phone = client.phone;
    if (!phone) {
      return jsonResponse({ error: "Ce client n'a pas de numéro de téléphone" }, 400);
    }

    // Déterminer le contenu du SMS
    let smsBody = body || "";
    let usedTemplateId: string | null = null;

    if (templateId) {
      const { data: template } = await adminClient
        .from("sms_templates")
        .select("*")
        .eq("id", templateId)
        .single();

      if (template) {
        const prenom = client.name?.split(" ")[0] || "";
        smsBody = template.body
          .replace(/\{\{prenom\}\}/g, prenom)
          .replace(/\{\{entreprise\}\}/g, "");
        usedTemplateId = template.id;
      }
    }

    if (!smsBody) {
      return jsonResponse({ error: "Corps du SMS vide" }, 400);
    }

    // Envoyer via Twilio REST API
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
    const statusCallbackUrl = `${SUPABASE_URL}/functions/v1/twilio-sms-status`;

    const twilioParams = new URLSearchParams({
      From: TWILIO_PHONE_NUMBER,
      To: phone,
      Body: smsBody,
      StatusCallback: statusCallbackUrl,
    });

    const twilioResponse = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        "Authorization": "Basic " + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: twilioParams.toString(),
    });

    if (!twilioResponse.ok) {
      const err = await twilioResponse.text();
      console.error("Twilio send error:", err);
      return jsonResponse({ error: "Erreur envoi Twilio", details: err }, 500);
    }

    const twilioData = await twilioResponse.json();

    // Insérer le SMS en BDD
    const { error: smsError } = await adminClient.from("sms").insert({
      client_id: clientId,
      twilio_message_sid: twilioData.sid,
      direction: "outbound",
      body: smsBody,
      status: "queued",
      template_id: usedTemplateId,
    });

    if (smsError) {
      console.error("SMS insert error:", smsError);
    }

    // Mettre à jour le client
    await adminClient
      .from("clients")
      .update({
        last_contacted_at: new Date().toISOString(),
        sms_count: (client.sms_count || 0) + 1,
      })
      .eq("id", clientId);

    return jsonResponse({ messageSid: twilioData.sid });
  } catch (error) {
    console.error("send-sms error:", error);
    return jsonResponse({ error: "Erreur interne" }, 500);
  }
});
