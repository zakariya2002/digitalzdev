import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const formData = await req.formData();
    const from = formData.get("From") as string;
    const body = formData.get("Body") as string;
    const messageSid = formData.get("MessageSid") as string;

    console.log(`Incoming SMS from ${from}: ${body}`);

    // Chercher le client par numéro de téléphone
    const { data: client } = await supabase
      .from("clients")
      .select("id")
      .or(`phone.eq.${from},phone_secondary.eq.${from}`)
      .single();

    if (client) {
      // Insérer le SMS entrant
      const { error } = await supabase.from("sms").insert({
        client_id: client.id,
        twilio_message_sid: messageSid,
        direction: "inbound",
        body: body || "",
        status: "received",
      });

      if (error) {
        console.error("Insert inbound SMS error:", error);
      }

      // Mettre à jour le client
      await supabase
        .from("clients")
        .update({
          last_contacted_at: new Date().toISOString(),
          sms_count: undefined, // On ne peut pas incrémenter simplement ici
        })
        .eq("id", client.id);
    } else {
      console.log(`No client found for phone: ${from}`);
    }

    // Retourner TwiML vide
    const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`;
    return new Response(twiml, {
      headers: {
        "Content-Type": "text/xml",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("SMS webhook error:", error);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`,
      { headers: { "Content-Type": "text/xml" } }
    );
  }
});
