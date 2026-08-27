// Lecture intelligente d'un devis : le document est envoyé tel quel à Claude,
// qui en restitue les informations structurées. Un PDF part en pièce jointe
// plutôt qu'en texte extrait : la mise en page porte le sens des colonnes.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Anthropic from "npm:@anthropic-ai/sdk@0.70.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, apikey",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}

/** Ce qu'on attend en retour. Tout est facultatif sauf les lignes : mieux vaut
 *  un champ vide qu'une valeur inventée. */
const SCHEMA = {
  type: "object",
  properties: {
    number: { type: ["string", "null"], description: "Numéro du devis tel qu'il figure sur le document" },
    title: { type: ["string", "null"], description: "Objet du devis, en une phrase courte" },
    clientName: { type: ["string", "null"], description: "Raison sociale du client destinataire, pas celle de l'émetteur" },
    clientEmail: { type: ["string", "null"], description: "Adresse électronique du client destinataire" },
    client: {
      type: ["object", "null"],
      description: "Mentions complètes du destinataire, telles qu'elles figurent sur le document",
      properties: {
        tradeName: { type: ["string", "null"], description: "Enseigne ou nom commercial, souvent entre parenthèses" },
        legalForm: { type: ["string", "null"], description: "Forme juridique : SARL, SAS, association…" },
        shareCapital: { type: ["string", "null"], description: "Capital social avec sa monnaie" },
        registrationNumber: { type: ["string", "null"], description: "SIREN ou SIRET, chiffres et espaces uniquement" },
        rcs: { type: ["string", "null"], description: "Mention du registre du commerce telle qu'écrite, par exemple « RCS Paris 884 345 828 »" },
        vatNumber: { type: ["string", "null"], description: "Numéro de TVA intracommunautaire" },
        address: { type: ["string", "null"], description: "Adresse postale complète, les lignes séparées par des retours à la ligne" },
        representative: { type: ["string", "null"], description: "Personne qui représente la société" },
        contactName: { type: ["string", "null"], description: "Interlocuteur nommé, s'il diffère du représentant" },
        phone: { type: ["string", "null"], description: "Téléphone du destinataire" },
      },
      required: [],
      additionalProperties: false,
    },
    validUntil: { type: ["string", "null"], description: "Date de validité au format AAAA-MM-JJ" },
    items: {
      type: "array",
      description: "Les lignes de prestation facturées, dans l'ordre du document",
      items: {
        type: "object",
        properties: {
          description: { type: "string" },
          quantity: { type: "number" },
          unit_price: { type: "number", description: "Prix unitaire hors taxes" },
        },
        required: ["description", "quantity", "unit_price"],
        additionalProperties: false,
      },
    },
    total: { type: ["number", "null"], description: "Total hors taxes indiqué sur le document" },
    currency: { type: ["string", "null"], description: "Code de la monnaie, EUR par défaut" },
    confidence: {
      type: "string",
      enum: ["haute", "moyenne", "basse"],
      description: "Fiabilité de la lecture : basse si le document est ambigu ou mal structuré",
    },
    warnings: {
      type: "array",
      items: { type: "string" },
      description: "Ce qui mérite une vérification humaine, en français, une phrase par point",
    },
  },
  required: ["items", "confidence", "warnings"],
  additionalProperties: false,
} as const;

const SYSTEM = `Tu lis des devis de prestation pour une agence web française et tu en extrais les informations.

Règles :
- N'invente jamais. Si une information n'est pas lisible, renvoie null plutôt qu'une supposition.
- Les montants sont hors taxes. Les nombres français utilisent la virgule décimale et l'espace pour les milliers : « 1 200,50 » vaut 1200.5.
- Ne prends pour lignes de prestation que ce qui est facturé. Ignore les totaux, sous-totaux, remises globales, mentions de TVA, conditions de paiement, coordonnées bancaires et numéros d'identification.
- Le client est le destinataire du devis, jamais l'émetteur. Si les deux apparaissent, choisis celui à qui le devis est adressé.
- Relève toutes ses mentions légales : enseigne, forme juridique, capital, SIREN ou SIRET, RCS, TVA, adresse, représentant, interlocuteur. Recopie-les telles quelles, sans les reformater. Laisse à null ce qui n'apparaît pas, et n'invente jamais un numéro d'immatriculation.
- Un texte entre crochets comme « [Nom du contact] » est un emplacement à remplir, pas une valeur : renvoie null.
- Quand une ligne porte une quantité et un prix unitaire, respecte-les. Quand seul un montant figure, mets la quantité à 1.
- Signale dans warnings tout écart entre la somme des lignes et le total affiché, ainsi que toute ambiguïté.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  if (req.method !== "POST") return json({ error: "Méthode non autorisée." }, 405);

  // Réservé aux membres connectés : l'analyse est facturée à l'agence
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ error: "Authentification requise." }, 401);

  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return json({ error: "Session invalide." }, 401);

  if (!ANTHROPIC_API_KEY) {
    return json({
      error: "L'analyse intelligente n'est pas configurée. Ajoute la clé ANTHROPIC_API_KEY dans les secrets Supabase.",
      code: "missing_key",
    }, 503);
  }

  const body = await req.json().catch(() => ({}));
  const { text, fileBase64, mediaType, fileName } = body as {
    text?: string; fileBase64?: string; mediaType?: string; fileName?: string
  };

  if (!text && !fileBase64) return json({ error: "Aucun document fourni." }, 400);
  if (fileBase64 && fileBase64.length > 28_000_000) {
    return json({ error: "Ce document dépasse la taille acceptée. Réduis-le ou colle son contenu." }, 413);
  }

  const content: unknown[] = []
  if (fileBase64 && mediaType === "application/pdf") {
    content.push({
      type: "document",
      source: { type: "base64", media_type: "application/pdf", data: fileBase64 },
    });
  } else if (text) {
    content.push({ type: "text", text: `Contenu du devis :\n\n${text.slice(0, 120_000)}` });
  } else {
    return json({ error: "Format de document non pris en charge." }, 400);
  }
  content.push({
    type: "text",
    text: fileName
      ? `Extrais les informations de ce devis (fichier « ${fileName} »).`
      : "Extrais les informations de ce devis.",
  });

  const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

  try {
    const stream = anthropic.messages.stream({
      model: "claude-opus-5",
      max_tokens: 8000,
      system: SYSTEM,
      thinking: { type: "adaptive" },
      output_config: {
        effort: "low",
        format: { type: "json_schema", schema: SCHEMA },
      },
      messages: [{ role: "user", content: content as never }],
    });
    const message = await stream.finalMessage();

    if (message.stop_reason === "refusal") {
      return json({ error: "Ce document n'a pas pu être analysé." }, 422);
    }

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return json({ error: "Réponse illisible du service d'analyse." }, 502);
    }

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(textBlock.text);
    } catch {
      return json({ error: "Réponse illisible du service d'analyse." }, 502);
    }

    return json({
      ok: true,
      result: parsed,
      usage: {
        input: message.usage.input_tokens,
        output: message.usage.output_tokens,
      },
    });
  } catch (e) {
    const err = e as { status?: number; message?: string };
    console.error("analyze-quote:", err.status, err.message);
    if (err.status === 401) return json({ error: "La clé d'analyse est refusée. Vérifie ANTHROPIC_API_KEY." }, 502);
    if (err.status === 429) return json({ error: "Trop de demandes d'analyse. Réessaie dans un instant." }, 429);
    if (err.status === 400) return json({ error: "Ce document n'a pas pu être analysé tel quel." }, 422);
    return json({ error: "Le service d'analyse est indisponible." }, 502);
  }
});
