import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState, useRef, useCallback, useEffect } from "react";
import { useParams } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { B as BUSINESS, f as formatCurrency } from "./business-BrCN7LhG.js";
const STATUS_META = {
  pending: { label: "À fournir", className: "bg-gray-100 text-gray-600" },
  received: { label: "Reçu", className: "bg-amber-100 text-amber-700" },
  validated: { label: "Validé", className: "bg-green-100 text-green-700" },
  rejected: { label: "À revoir", className: "bg-red-100 text-red-700" }
};
function ClientContentSection({ items, functionUrl, token, onChanged }) {
  const [busy, setBusy] = useState(null);
  const [drafts, setDrafts] = useState({});
  const [error, setError] = useState(null);
  const [name, setName] = useState("");
  const inputs = useRef({});
  if (items.length === 0) return null;
  const post = async (payload) => {
    const res = await fetch(functionUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, ...payload })
    });
    const data = await res.json();
    if (!res.ok || data.error) throw new Error(data.error || "Une erreur est survenue.");
    return data;
  };
  const sendText = async (item) => {
    setBusy(item.id);
    setError(null);
    try {
      await post({ action: "content_text", requestId: item.id, text: drafts[item.id] ?? item.response_text ?? "" });
      onChanged();
    } catch (e) {
      setError(e.message);
    }
    setBusy(null);
  };
  const sendFile = async (item, file) => {
    setBusy(item.id);
    setError(null);
    try {
      const prep = await post({
        action: "content_upload",
        requestId: item.id,
        fileName: file.name,
        size: file.size,
        contentType: file.type
      });
      const upload = await fetch(prep.signedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file
      });
      if (!upload.ok) throw new Error("Le document n'a pas pu être envoyé.");
      await post({
        action: "content_uploaded",
        requestId: item.id,
        path: prep.path,
        fileName: file.name,
        size: file.size,
        contentType: file.type,
        clientName: name || null
      });
      onChanged();
    } catch (e) {
      setError(e.message);
    }
    setBusy(null);
    if (inputs.current[item.id]) inputs.current[item.id].value = "";
  };
  const remaining = items.filter((i) => i.is_required && i.status === "pending").length;
  return /* @__PURE__ */ jsxs("section", { className: "bg-white border border-gray-200 rounded-xl p-6 mb-8", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-baseline justify-between gap-3 mb-1 flex-wrap", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold", children: "Ce que nous attendons de vous" }),
      /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-500", children: remaining === 0 ? "Tout est arrivé, merci" : `${remaining} élément${remaining > 1 ? "s" : ""} à fournir` })
    ] }),
    /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 mb-5", children: "Déposez vos documents et complétez les informations demandées. Vous pouvez revenir sur cette page autant de fois que nécessaire." }),
    /* @__PURE__ */ jsxs("div", { className: "mb-5", children: [
      /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-600 mb-1", children: "Votre nom (pour qu'on sache qui a envoyé)" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          value: name,
          onChange: (e) => setName(e.target.value),
          placeholder: "Nom et prénom",
          className: "w-full sm:w-72 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900"
        }
      )
    ] }),
    error && /* @__PURE__ */ jsx("div", { className: "mb-4 px-3 py-2 bg-red-50 border border-red-200 rounded-lg", children: /* @__PURE__ */ jsx("p", { className: "text-sm text-red-700", children: error }) }),
    /* @__PURE__ */ jsx("div", { className: "space-y-3", children: items.map((item) => {
      const meta = STATUS_META[item.status];
      const wantsFile = item.kind === "file" || item.kind === "both";
      const wantsText = item.kind === "text" || item.kind === "both";
      const value = drafts[item.id] ?? item.response_text ?? "";
      return /* @__PURE__ */ jsxs("div", { className: "border border-gray-200 rounded-lg p-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3 mb-1 flex-wrap", children: [
          /* @__PURE__ */ jsxs("p", { className: "font-medium", children: [
            item.label,
            item.is_required && /* @__PURE__ */ jsx("span", { className: "text-red-600 ml-1", title: "Obligatoire", children: "*" })
          ] }),
          /* @__PURE__ */ jsx("span", { className: `px-2 py-0.5 text-xs rounded-full ${meta.className}`, children: meta.label })
        ] }),
        item.description && /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 mb-3", children: item.description }),
        item.review_note && /* @__PURE__ */ jsx("p", { className: "text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3", children: item.review_note }),
        item.files.length > 0 && /* @__PURE__ */ jsx("ul", { className: "text-sm text-gray-600 mb-3 space-y-1", children: item.files.map((f) => /* @__PURE__ */ jsxs("li", { children: [
          "✓ ",
          f.name,
          " ",
          /* @__PURE__ */ jsx("span", { className: "text-gray-400", children: "reçu" })
        ] }, f.id)) }),
        wantsText && /* @__PURE__ */ jsxs("div", { className: "mb-3", children: [
          /* @__PURE__ */ jsx(
            "textarea",
            {
              value,
              onChange: (e) => setDrafts((d) => ({ ...d, [item.id]: e.target.value })),
              rows: 3,
              placeholder: "Votre réponse…",
              className: "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-900 resize-none"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => sendText(item),
              disabled: busy === item.id || !value.trim(),
              className: "mt-2 px-4 py-1.5 bg-gray-900 hover:bg-gray-800 disabled:opacity-40 text-white text-sm rounded-lg transition-colors",
              children: busy === item.id ? "Envoi…" : "Enregistrer"
            }
          )
        ] }),
        wantsFile && /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              ref: (el) => {
                inputs.current[item.id] = el;
              },
              type: "file",
              disabled: busy === item.id,
              onChange: (e) => {
                var _a;
                const f = (_a = e.target.files) == null ? void 0 : _a[0];
                if (f) sendFile(item, f);
              },
              className: "text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-gray-900 file:text-white hover:file:bg-gray-800 file:cursor-pointer"
            }
          ),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-400 mt-1", children: "25 Mo par document" })
        ] })
      ] }, item.id);
    }) })
  ] });
}
const FUNCTION_URL = `${"https://uipxlesrpdocqpblmrrr.supabase.co"}/functions/v1/client-portal`;
const MILESTONE_LABEL = {
  planned: "Prévu",
  at_risk: "À confirmer",
  reached: "Livré",
  missed: "Décalé"
};
const PROJECT_STATUS_LABEL = {
  briefing: "Cadrage",
  design: "Design",
  development: "Développement",
  review: "Recette",
  delivered: "Livré",
  active: "En cours",
  archived: "Clos"
};
function ClientPortal() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [name, setName] = useState("");
  const [sending, setSending] = useState(false);
  const load = useCallback(async () => {
    try {
      const res = await fetch(`${FUNCTION_URL}?token=${encodeURIComponent(token || "")}`);
      const payload = await res.json();
      if (!res.ok) {
        setError(payload.error || "Ce lien ne peut pas être ouvert.");
        setLoading(false);
        return;
      }
      setData(payload);
    } catch {
      setError("Impossible de charger ce document. Vérifiez votre connexion.");
    }
    setLoading(false);
  }, [token]);
  useEffect(() => {
    load();
  }, [load]);
  const respond = async (response) => {
    if (!name.trim()) {
      setError("Indiquez votre nom pour valider.");
      return;
    }
    setSending(true);
    setError(null);
    try {
      const res = await fetch(FUNCTION_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, response, name: name.trim() })
      });
      const payload = await res.json();
      if (!res.ok || payload.ok === false) {
        setError(payload.error || "Votre réponse n'a pas pu être enregistrée.");
      } else {
        await load();
      }
    } catch {
      setError("Votre réponse n'a pas pu être envoyée. Réessayez.");
    }
    setSending(false);
  };
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center", children: /* @__PURE__ */ jsx("div", { className: "w-6 h-6 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin" }) });
  }
  if (error && !data) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center px-4", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md text-center", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-xl font-semibold text-gray-900 mb-2", children: "Lien indisponible" }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-600", children: error }),
      /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-500 mt-4", children: [
        "Contactez ",
        BUSINESS.tradeName,
        " à ",
        BUSINESS.email,
        " pour recevoir un nouveau lien."
      ] })
    ] }) });
  }
  const doc = data == null ? void 0 : data.document;
  const project = data == null ? void 0 : data.project;
  const isQuote = (data == null ? void 0 : data.entityType) === "quote";
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-gray-50 text-gray-900", children: [
    /* @__PURE__ */ jsx("header", { className: "bg-white border-b border-gray-200", children: /* @__PURE__ */ jsxs("div", { className: "max-w-3xl mx-auto px-6 py-5 flex items-center justify-between flex-wrap gap-2", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "font-semibold", children: BUSINESS.tradeName }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: BUSINESS.email })
      ] }),
      doc && /* @__PURE__ */ jsx("p", { className: "text-sm font-mono text-gray-500", children: doc.number })
    ] }) }),
    /* @__PURE__ */ jsxs("main", { className: "max-w-3xl mx-auto px-6 py-10", children: [
      doc && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold mb-1", children: doc.title }),
        doc.clientName && /* @__PURE__ */ jsxs("p", { className: "text-gray-600 mb-6", children: [
          "Pour ",
          doc.clientName
        ] }),
        doc.description && /* @__PURE__ */ jsx("p", { className: "text-gray-700 mb-6 whitespace-pre-wrap", children: doc.description }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white border border-gray-200 rounded-xl overflow-hidden mb-6", children: [
          /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
            /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-200 bg-gray-50", children: [
              /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3 font-medium text-gray-600", children: "Prestation" }),
              /* @__PURE__ */ jsx("th", { className: "text-right px-4 py-3 font-medium text-gray-600 whitespace-nowrap", children: "Qté" }),
              /* @__PURE__ */ jsx("th", { className: "text-right px-4 py-3 font-medium text-gray-600 whitespace-nowrap", children: "Prix unitaire" }),
              /* @__PURE__ */ jsx("th", { className: "text-right px-4 py-3 font-medium text-gray-600", children: "Total" })
            ] }) }),
            /* @__PURE__ */ jsx("tbody", { children: doc.items.map((item, i) => /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-100 last:border-0", children: [
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: item.description }),
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-right tabular-nums", children: item.quantity }),
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-right tabular-nums", children: formatCurrency(Number(item.unitPrice)) }),
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-right tabular-nums font-medium", children: formatCurrency(Number(item.total)) })
            ] }, i)) })
          ] }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-4 py-4 bg-gray-50 border-t border-gray-200", children: [
            /* @__PURE__ */ jsx("span", { className: "font-medium", children: "Total" }),
            /* @__PURE__ */ jsx("span", { className: "text-xl font-semibold tabular-nums", children: formatCurrency(Number(doc.total)) })
          ] })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mb-2", children: BUSINESS.tvaMessage }),
        doc.dueDate && /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-600 mb-6", children: [
          isQuote ? "Valable jusqu’au " : "À régler avant le ",
          format(parseISO(doc.dueDate), "d MMMM yyyy", { locale: fr })
        ] }),
        doc.terms && /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mb-8 whitespace-pre-wrap", children: doc.terms })
      ] }),
      project && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold mb-1", children: project.name }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-600 mb-6", children: PROJECT_STATUS_LABEL[project.status] || project.status }),
        project.description && /* @__PURE__ */ jsx("p", { className: "text-gray-700 mb-6 whitespace-pre-wrap", children: project.description }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white border border-gray-200 rounded-xl p-6 mb-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: "Avancement" }),
            /* @__PURE__ */ jsxs("span", { className: "text-sm text-gray-600 tabular-nums", children: [
              project.tasksDone,
              "/",
              project.tasksTotal,
              " · ",
              project.progress,
              " %"
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "w-full h-2 bg-gray-100 rounded-full overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "h-full bg-gray-900 rounded-full transition-all", style: { width: `${project.progress}%` } }) })
        ] }),
        project.milestones.length > 0 && /* @__PURE__ */ jsxs("div", { className: "bg-white border border-gray-200 rounded-xl p-6 mb-8", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-sm font-medium mb-4", children: "Étapes" }),
          /* @__PURE__ */ jsx("div", { className: "space-y-3", children: project.milestones.map((m, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm", children: m.title }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: format(parseISO(m.due_date), "d MMMM yyyy", { locale: fr }) })
            ] }),
            /* @__PURE__ */ jsx("span", { className: `text-xs px-2 py-0.5 rounded-full ${m.status === "reached" ? "bg-green-100 text-green-700" : m.status === "missed" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"}`, children: MILESTONE_LABEL[m.status] || m.status })
          ] }, i)) })
        ] })
      ] }),
      project && (data == null ? void 0 : data.contents) && /* @__PURE__ */ jsx(
        ClientContentSection,
        {
          items: data.contents,
          functionUrl: FUNCTION_URL,
          token: token || "",
          onChanged: load
        }
      ),
      (data == null ? void 0 : data.respondedAt) ? /* @__PURE__ */ jsxs("div", { className: `rounded-xl p-5 ${data.response === "accepted" ? "bg-green-50 border border-green-200" : "bg-gray-100 border border-gray-200"}`, children: [
        /* @__PURE__ */ jsxs("p", { className: "text-sm font-medium", children: [
          data.response === "accepted" ? "Document accepté" : "Document refusé",
          " · ",
          format(parseISO(data.respondedAt), "d MMMM yyyy à HH:mm", { locale: fr })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-600 mt-1", children: [
          "Merci, ",
          BUSINESS.tradeName,
          " a été prévenu et revient vers vous."
        ] })
      ] }) : (data == null ? void 0 : data.allowAccept) ? /* @__PURE__ */ jsxs("div", { className: "bg-white border border-gray-200 rounded-xl p-6", children: [
        /* @__PURE__ */ jsx("h2", { className: "font-medium mb-1", children: "Votre réponse" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 mb-4", children: "Votre nom vaut signature électronique et horodate votre accord." }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: name,
            onChange: (e) => setName(e.target.value),
            placeholder: "Nom et prénom",
            className: "w-full px-3 py-2 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:border-gray-900"
          }
        ),
        error && /* @__PURE__ */ jsx("p", { className: "text-sm text-red-600 mb-3", children: error }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-3", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => respond("accepted"),
              disabled: sending,
              className: "px-5 py-2.5 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors",
              children: sending ? "Envoi…" : "Accepter"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => respond("rejected"),
              disabled: sending,
              className: "px-5 py-2.5 border border-gray-300 hover:bg-gray-50 disabled:opacity-50 text-gray-700 text-sm font-medium rounded-lg transition-colors",
              children: "Refuser"
            }
          )
        ] })
      ] }) : null
    ] }),
    /* @__PURE__ */ jsxs("footer", { className: "max-w-3xl mx-auto px-6 py-8 text-xs text-gray-500", children: [
      BUSINESS.tradeName,
      " · SIRET ",
      BUSINESS.siret,
      " · ",
      BUSINESS.website
    ] })
  ] });
}
export {
  ClientPortal as default
};
