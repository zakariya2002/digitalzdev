import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import twilio from "https://esm.sh/twilio@5";

const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID")!;
const TWILIO_API_KEY = Deno.env.get("TWILIO_API_KEY")!;
const TWILIO_API_SECRET = Deno.env.get("TWILIO_API_SECRET")!;
const TWILIO_TWIML_APP_SID = Deno.env.get("TWILIO_TWIML_APP_SID")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

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
    return new Response(JSON.stringify({ error: "Missing auth header" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return new Response(JSON.stringify({ error: "Non authentifié" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Générer un AccessToken Twilio avec VoiceGrant
  const { jwt: { AccessToken }, VoiceGrant } =
    twilio as unknown as {
      jwt: {
        AccessToken: new (
          accountSid: string,
          apiKey: string,
          apiSecret: string,
          opts?: { identity?: string; ttl?: number }
        ) => {
          addGrant: (grant: unknown) => void;
          toJwt: () => string;
        };
      };
      VoiceGrant: new () => {
        outgoingApplicationSid: string;
        incomingAllow: boolean;
      };
    };

  const token = new AccessToken(TWILIO_ACCOUNT_SID, TWILIO_API_KEY, TWILIO_API_SECRET, {
    identity: user.id,
    ttl: 3600,
  });

  const voiceGrant = new VoiceGrant();
  voiceGrant.outgoingApplicationSid = TWILIO_TWIML_APP_SID;
  voiceGrant.incomingAllow = true;
  token.addGrant(voiceGrant);

  return new Response(JSON.stringify({ token: token.toJwt() }), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
});
