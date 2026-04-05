const TWILIO_PHONE_NUMBER = Deno.env.get("TWILIO_PHONE_NUMBER")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  // Parse les params POST de Twilio (application/x-www-form-urlencoded)
  const formData = await req.formData();
  const to = formData.get("To") as string;

  const statusCallbackUrl = `${SUPABASE_URL}/functions/v1/twilio-status-webhook`;

  // Retourner TwiML
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial callerId="${TWILIO_PHONE_NUMBER}" record="record-from-answer-dual"
        statusCallback="${statusCallbackUrl}"
        statusCallbackMethod="POST"
        statusCallbackEvent="initiated ringing answered completed">
    <Number>${to}</Number>
  </Dial>
</Response>`;

  return new Response(twiml, {
    headers: {
      "Content-Type": "text/xml",
      "Access-Control-Allow-Origin": "*",
    },
  });
});
