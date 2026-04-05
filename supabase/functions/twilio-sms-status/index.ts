import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Map Twilio SMS status
function mapSmsStatus(twilioStatus: string): string {
  const map: Record<string, string> = {
    queued: "queued",
    sent: "sent",
    delivered: "delivered",
    undelivered: "failed",
    failed: "failed",
  };
  return map[twilioStatus] || twilioStatus;
}

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
    const messageSid = formData.get("MessageSid") as string;
    const messageStatus = formData.get("MessageStatus") as string;

    console.log(`SMS status: ${messageSid} → ${messageStatus}`);

    const mappedStatus = mapSmsStatus(messageStatus);

    const { error } = await supabase
      .from("sms")
      .update({ status: mappedStatus })
      .eq("twilio_message_sid", messageSid);

    if (error) {
      console.error("Update SMS status error:", error);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("SMS status webhook error:", error);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
