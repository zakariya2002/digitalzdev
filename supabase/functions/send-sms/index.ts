import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID")!;
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN")!;
const TWILIO_PHONE_NUMBER = Deno.env.get("TWILIO_PHONE_NUMBER")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, content-type",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  // Vérifier l'auth Supabase
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Missing auth" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: { user }, error: authError } = await userClient.auth.getUser();
  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Non authentifié" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
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
      return new Response(JSON.stringify({ error: "Client introuvable" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const phone = client.phone;
    if (!phone) {
      return new Response(JSON.stringify({ error: "Ce client n'a pas de numéro de téléphone" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
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
      return new Response(JSON.stringify({ error: "Corps du SMS vide" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
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
      return new Response(JSON.stringify({ error: "Erreur envoi Twilio", details: err }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
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

    return new Response(JSON.stringify({ messageSid: twilioData.sid }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("send-sms error:", error);
    return new Response(JSON.stringify({ error: "Erreur interne" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
