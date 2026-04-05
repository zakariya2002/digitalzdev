import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Map Twilio status to our status
function mapCallStatus(twilioStatus: string): string {
  const map: Record<string, string> = {
    queued: "initiated",
    initiated: "initiated",
    ringing: "ringing",
    "in-progress": "in_progress",
    completed: "completed",
    busy: "busy",
    "no-answer": "no_answer",
    failed: "failed",
    canceled: "canceled",
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
    const callSid = formData.get("CallSid") as string;
    const callStatus = formData.get("CallStatus") as string;
    const callDuration = formData.get("CallDuration") as string | null;
    const recordingUrl = formData.get("RecordingUrl") as string | null;

    console.log(`Status callback: ${callSid} → ${callStatus}`);

    const mappedStatus = mapCallStatus(callStatus);

    // Update the call record
    const updateData: Record<string, unknown> = {
      status: mappedStatus,
    };

    if (callDuration) {
      updateData.duration = parseInt(callDuration, 10);
    }
    if (recordingUrl) {
      updateData.recording_url = recordingUrl;
    }

    const { error: callError } = await supabase
      .from("calls")
      .update(updateData)
      .eq("twilio_call_sid", callSid);

    if (callError) {
      console.error("Error updating call:", callError);
    }

    // Si l'appel est terminé, mettre à jour le client
    if (mappedStatus === "completed" || mappedStatus === "no_answer" || mappedStatus === "busy" || mappedStatus === "failed") {
      // Récupérer le call pour trouver le client_id
      const { data: call } = await supabase
        .from("calls")
        .select("client_id")
        .eq("twilio_call_sid", callSid)
        .single();

      if (call) {
        // Mettre à jour last_contacted_at et incrémenter call_count
        const { error: clientError } = await supabase.rpc("increment_call_count", {
          p_client_id: call.client_id,
        });

        // Fallback si la RPC n'existe pas
        if (clientError) {
          await supabase
            .from("clients")
            .update({ last_contacted_at: new Date().toISOString() })
            .eq("id", call.client_id);
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Status webhook error:", error);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
