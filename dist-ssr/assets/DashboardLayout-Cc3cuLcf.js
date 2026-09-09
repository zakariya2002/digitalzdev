import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useState, useCallback, useEffect, useContext, createContext, useId, useRef, useMemo } from "react";
import { NavLink, useNavigate, useLocation, useParams, Link, Routes, Route } from "react-router-dom";
import { u as useAuth, s as supabase } from "../entry-server.js";
import { formatDistanceToNow, format, differenceInCalendarDays, parseISO, startOfWeek, endOfWeek, differenceInDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, startOfDay, isSameMonth, isToday, addMonths, subMonths, addWeeks, subWeeks, addDays, isPast, startOfYear, endOfYear, isYesterday } from "date-fns";
import { fr } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { Device } from "@twilio/voice-sdk";
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Legend, Bar, CartesianGrid } from "recharts";
import { useSensors, useSensor, PointerSensor, DndContext, DragOverlay, useDroppable } from "@dnd-kit/core";
import { useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { f as formatCurrency, B as BUSINESS, P as PRICING_GRID } from "./business-BrCN7LhG.js";
import { createPortal } from "react-dom";
import "react-dom/server";
import "react-router-dom/server.mjs";
import "@supabase/supabase-js";
import "lenis";
import "three";
import "@emailjs/browser";
const TeamContext = createContext(void 0);
function TeamProvider({ children }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const refresh = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setMembers([]);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase.from("profiles").select("*").eq("is_active", true).order("full_name");
    if (error) {
      console.error("Fetch profiles error:", error);
      setLoading(false);
      return;
    }
    const list = data || [];
    setMembers(list);
    setProfile(list.find((p) => p.id === user.id) || null);
    setLoading(false);
  }, [user]);
  useEffect(() => {
    refresh();
  }, [refresh]);
  const role = profile == null ? void 0 : profile.role;
  const noTeamYet = !loading && !!user && !profile;
  const value = {
    profile,
    members,
    loading,
    isOwner: role === "owner" || noTeamYet,
    canManage: role === "owner" || role === "manager" || noTeamYet,
    refresh,
    memberById: (id) => id ? members.find((m) => m.id === id) : void 0
  };
  return /* @__PURE__ */ jsx(TeamContext.Provider, { value, children });
}
function useTeam() {
  const context = useContext(TeamContext);
  if (!context) throw new Error("useTeam must be used within TeamProvider");
  return context;
}
function useMessaging() {
  const { profile } = useTeam();
  const instanceId = useId();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchConversations = useCallback(async () => {
    if (!profile) {
      setConversations([]);
      setLoading(false);
      return;
    }
    const [{ data: memberships, error: me }, { data: convs }] = await Promise.all([
      supabase.from("conversation_members").select("conversation_id, profile_id, last_read_at"),
      supabase.from("conversations").select("*").order("last_message_at", { ascending: false })
    ]);
    if (me) {
      setError("Impossible de charger les conversations.");
      setLoading(false);
      return;
    }
    const mine = (memberships || []).filter((m) => m.profile_id === profile.id);
    const ids = mine.map((m) => m.conversation_id);
    if (ids.length === 0) {
      setConversations([]);
      setLoading(false);
      return;
    }
    const { data: recent } = await supabase.from("messages").select("conversation_id, body, created_at, author_id").in("conversation_id", ids).order("created_at", { ascending: false }).limit(300);
    const result = (convs || []).filter((c) => ids.includes(c.id)).map((c) => {
      var _a;
      const membership = mine.find((m) => m.conversation_id === c.id);
      const lastReadAt = membership.last_read_at;
      const msgs = (recent || []).filter((m) => m.conversation_id === c.id);
      return {
        id: c.id,
        kind: c.kind,
        name: c.name,
        last_message_at: c.last_message_at,
        otherIds: (memberships || []).filter((m) => m.conversation_id === c.id && m.profile_id !== profile.id).map((m) => m.profile_id),
        lastReadAt,
        unread: msgs.filter((m) => m.created_at > lastReadAt && m.author_id !== profile.id).length,
        preview: ((_a = msgs[0]) == null ? void 0 : _a.body) ?? null
      };
    });
    setConversations(result);
    setLoading(false);
  }, [profile]);
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);
  useEffect(() => {
    if (!profile) return;
    const channel = supabase.channel(`messaging-overview-${instanceId}`).on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, () => {
      fetchConversations();
    }).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile, fetchConversations, instanceId]);
  const openDirect = useCallback(async (otherId) => {
    const { data, error: e } = await supabase.rpc("open_direct_conversation", { p_other: otherId });
    if (e) {
      setError("La conversation n'a pas pu être ouverte.");
      return null;
    }
    await fetchConversations();
    return data;
  }, [fetchConversations]);
  const markRead = useCallback(async (conversationId) => {
    if (!profile) return;
    setConversations((prev) => prev.map((c) => c.id === conversationId ? { ...c, unread: 0 } : c));
    await supabase.from("conversation_members").update({ last_read_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("conversation_id", conversationId).eq("profile_id", profile.id);
  }, [profile]);
  return {
    conversations,
    totalUnread: conversations.reduce((sum, c) => sum + c.unread, 0),
    loading,
    error,
    refresh: fetchConversations,
    openDirect,
    markRead
  };
}
const SIZES = {
  xs: "w-5 h-5 text-[9px]",
  sm: "w-6 h-6 text-[10px]",
  md: "w-8 h-8 text-xs",
  lg: "w-10 h-10 text-sm"
};
function initials(name) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}
function Avatar({ profile, size = "sm", showName = false, className = "" }) {
  if (!profile) {
    return /* @__PURE__ */ jsx(
      "span",
      {
        className: `${SIZES[size]} rounded-full bg-gray-800 border border-dashed border-gray-600 text-gray-500 flex items-center justify-center flex-shrink-0 ${className}`,
        title: "Non assignée",
        children: "?"
      }
    );
  }
  return /* @__PURE__ */ jsxs("span", { className: `inline-flex items-center gap-1.5 ${className}`, children: [
    /* @__PURE__ */ jsx(
      "span",
      {
        className: `${SIZES[size]} rounded-full flex items-center justify-center font-semibold flex-shrink-0 text-white`,
        style: { backgroundColor: profile.color || "#3B82F6" },
        title: profile.full_name,
        children: initials(profile.full_name)
      }
    ),
    showName && /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-300 truncate", children: profile.full_name })
  ] });
}
const navSections = [
  {
    title: "Commercial",
    items: [
      { to: "/dashboard", label: "Dashboard", icon: DashboardIcon, end: true },
      { to: "/dashboard/clients", label: "Leads & Clients", icon: ClientsIcon },
      { to: "/dashboard/proposals", label: "Propositions", icon: ProposalIcon },
      { to: "/dashboard/quotes", label: "Devis", icon: QuoteIcon },
      { to: "/dashboard/invoices", label: "Factures", icon: InvoiceIcon }
    ]
  },
  {
    title: "Équipe",
    items: [
      { to: "/dashboard/messages", label: "Messagerie", icon: MessagesIcon, badge: "messages" },
      { to: "/dashboard/pointage", label: "Temps de travail", icon: ClockIcon }
    ]
  },
  {
    title: "Production",
    items: [
      { to: "/dashboard/projects", label: "Projets", icon: ProjectsIcon },
      { to: "/dashboard/kanban", label: "Kanban", icon: KanbanIcon },
      { to: "/dashboard/calendar", label: "Calendrier", icon: CalendarIcon }
    ]
  },
  {
    title: "Finances",
    items: [
      { to: "/dashboard/comptabilite", label: "Simulateur", icon: CalculatorIcon },
      { to: "/dashboard/finances", label: "Finances", icon: RevenuesIcon, ownerOnly: true }
    ]
  },
  {
    title: "Réglages",
    items: [
      { to: "/dashboard/sms-templates", label: "Templates SMS", icon: SmsIcon },
      { to: "/dashboard/mes-documents", label: "Mes documents", icon: DocumentIcon },
      { to: "/dashboard/automation", label: "Automatisation", icon: AutomationIcon }
    ]
  }
];
const ROLE_LABELS = {
  owner: "Propriétaire",
  manager: "Cheffe de projet",
  member: "Équipe"
};
function Sidebar({ open, onClose }) {
  const { signOut, user } = useAuth();
  const { profile, isOwner } = useTeam();
  const { totalUnread } = useMessaging();
  const sections = navSections.map((section) => ({
    ...section,
    items: section.items.filter((item) => !item.ownerOnly || isOwner)
  })).filter((section) => section.items.length > 0);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    open && /* @__PURE__ */ jsx(
      "div",
      {
        className: "fixed inset-0 bg-black/60 z-40 lg:hidden",
        onClick: onClose
      }
    ),
    /* @__PURE__ */ jsxs("aside", { className: `fixed left-0 top-0 h-screen w-64 bg-gray-900 border-r border-gray-800 flex flex-col z-50 transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`, children: [
      /* @__PURE__ */ jsxs("div", { className: "px-6 py-5 border-b border-gray-800 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-lg font-bold text-white tracking-wide", children: "Digitalz Dev" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-0.5", children: "Agence web" })
        ] }),
        /* @__PURE__ */ jsx("button", { onClick: onClose, className: "lg:hidden p-1 text-gray-400 hover:text-white", children: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M6 18L18 6M6 6l12 12" }) }) })
      ] }),
      /* @__PURE__ */ jsx("nav", { className: "flex-1 px-3 py-4 overflow-y-auto", children: sections.map((section) => /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
        /* @__PURE__ */ jsx("div", { className: "px-3 py-2", children: /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold text-gray-600 uppercase tracking-wider", children: section.title }) }),
        /* @__PURE__ */ jsx("div", { className: "space-y-1", children: section.items.map((item) => /* @__PURE__ */ jsxs(
          NavLink,
          {
            to: item.to,
            end: item.end,
            onClick: onClose,
            className: ({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? "bg-blue-600/10 text-blue-400" : "text-gray-400 hover:text-white hover:bg-gray-800"}`,
            children: [
              /* @__PURE__ */ jsx(item.icon, {}),
              /* @__PURE__ */ jsx("span", { className: "flex-1", children: item.label }),
              item.badge === "messages" && totalUnread > 0 && /* @__PURE__ */ jsx("span", { className: "px-1.5 min-w-5 h-5 flex items-center justify-center bg-blue-600 text-white text-[10px] font-bold rounded-full", children: totalUnread > 99 ? "99+" : totalUnread })
            ]
          },
          item.to
        )) })
      ] }, section.title)) }),
      /* @__PURE__ */ jsxs("div", { className: "px-3 py-4 border-t border-gray-800", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5 px-3 mb-3", children: [
          /* @__PURE__ */ jsx(Avatar, { profile, size: "md" }),
          /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm text-white font-medium truncate", children: (profile == null ? void 0 : profile.full_name) || (user == null ? void 0 : user.email) }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 truncate", children: (profile == null ? void 0 : profile.job_title) || (profile ? ROLE_LABELS[profile.role] : "") })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: signOut,
            className: "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors",
            children: [
              /* @__PURE__ */ jsx(LogoutIcon, {}),
              "Se déconnecter"
            ]
          }
        )
      ] })
    ] })
  ] });
}
function DashboardIcon() {
  return /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 1.5, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" }) });
}
function DocumentIcon() {
  return /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 1.5, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" }) });
}
function ClockIcon() {
  return /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 1.5, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" }) });
}
function MessagesIcon() {
  return /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 1.5, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" }) });
}
function ProjectsIcon() {
  return /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 1.5, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" }) });
}
function KanbanIcon() {
  return /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 1.5, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M9 4.5v15m6-15v15m-10.875 0h15.75c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H4.125C3.504 4.5 3 5.004 3 5.625v12.75c0 .621.504 1.125 1.125 1.125z" }) });
}
function CalendarIcon() {
  return /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 1.5, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" }) });
}
function ClientsIcon() {
  return /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 1.5, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" }) });
}
function ProposalIcon() {
  return /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 1.5, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" }) });
}
function QuoteIcon() {
  return /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 1.5, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" }) });
}
function InvoiceIcon() {
  return /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 1.5, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" }) });
}
function SmsIcon() {
  return /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 1.5, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" }) });
}
function CalculatorIcon() {
  return /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 1.5, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V13.5zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V18zm2.498-6.75h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V13.5zm0 2.25h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V18zm2.504-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zm0 2.25h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V18zm2.498-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zM8.25 6h7.5v2.25h-7.5V6zM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.65 4.5 4.757V19.5a2.25 2.25 0 002.25 2.25h10.5a2.25 2.25 0 002.25-2.25V4.757c0-1.108-.806-2.057-1.907-2.185A48.507 48.507 0 0012 2.25z" }) });
}
function RevenuesIcon() {
  return /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 1.5, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) });
}
function AutomationIcon() {
  return /* @__PURE__ */ jsxs("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 1.5, children: [
    /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" }),
    /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M15 12a3 3 0 11-6 0 3 3 0 016 0z" })
  ] });
}
function LogoutIcon() {
  return /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 1.5, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" }) });
}
const BADGE_LABEL = {
  mention: "Mention",
  assignment: "Assignée",
  comment: "Message"
};
function NotificationCenter({
  items,
  unreadCount,
  onOpen,
  onDismiss,
  onMarkAllRead
}) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("team");
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);
  const teamItems = items.filter((i) => i.kind === "team");
  const alertItems = items.filter((i) => i.kind === "alert");
  const teamUnread = teamItems.filter((i) => !i.read).length;
  const visible = tab === "team" ? teamItems : alertItems;
  function handleView(item) {
    onOpen(item);
    navigate(item.link);
    setOpen(false);
  }
  return /* @__PURE__ */ jsxs("div", { className: "relative", ref: dropdownRef, children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => setOpen(!open),
        className: "relative p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800",
        "aria-label": "Notifications",
        children: [
          /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" }) }),
          unreadCount > 0 && /* @__PURE__ */ jsx("span", { className: "absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center", children: unreadCount > 99 ? "99+" : unreadCount })
        ]
      }
    ),
    open && /* @__PURE__ */ jsxs("div", { className: "absolute right-0 top-full mt-2 w-80 sm:w-96 bg-gray-900 border border-gray-800 rounded-xl shadow-xl z-50 max-h-[28rem] overflow-hidden flex flex-col", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 px-3 pt-3 flex-shrink-0", children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setTab("team"),
            className: `flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${tab === "team" ? "bg-gray-800 text-white" : "text-gray-400 hover:text-white"}`,
            children: [
              "Équipe",
              teamUnread > 0 && /* @__PURE__ */ jsx("span", { className: "px-1.5 bg-red-500 text-white text-[10px] rounded-full", children: teamUnread })
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setTab("alert"),
            className: `flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${tab === "alert" ? "bg-gray-800 text-white" : "text-gray-400 hover:text-white"}`,
            children: [
              "Relances",
              alertItems.length > 0 && /* @__PURE__ */ jsx("span", { className: "px-1.5 bg-gray-700 text-gray-300 text-[10px] rounded-full", children: alertItems.length })
            ]
          }
        ),
        teamUnread > 0 && tab === "team" && /* @__PURE__ */ jsx(
          "button",
          {
            onClick: onMarkAllRead,
            className: "ml-auto text-xs text-blue-400 hover:text-blue-300 transition-colors",
            children: "Tout lire"
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mt-2 border-t border-gray-800 overflow-y-auto", children: visible.length === 0 ? /* @__PURE__ */ jsx("div", { className: "px-4 py-8 text-center text-gray-500 text-sm", children: tab === "team" ? "Rien de nouveau. Les mentions et les tâches qu’on t’assigne arrivent ici." : "Aucune relance en attente." }) : /* @__PURE__ */ jsx("div", { className: "divide-y divide-gray-800", children: visible.map((item) => /* @__PURE__ */ jsxs(
        "div",
        {
          className: `px-4 py-3 flex items-start gap-3 ${!item.read ? "bg-blue-500/5" : ""}`,
          children: [
            item.kind === "team" ? /* @__PURE__ */ jsx(Avatar, { profile: item.actor, size: "md" }) : /* @__PURE__ */ jsx("span", { className: "w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsx("svg", { className: "w-4 h-4 text-amber-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" }) }) }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 flex-wrap", children: [
                item.badge && /* @__PURE__ */ jsx("span", { className: `px-1.5 py-0.5 text-[10px] font-medium rounded ${item.badge === "mention" ? "bg-blue-500/20 text-blue-400" : item.badge === "assignment" ? "bg-purple-500/20 text-purple-400" : "bg-gray-700 text-gray-300"}`, children: BADGE_LABEL[item.badge] }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-white leading-snug", children: item.title })
              ] }),
              item.body && /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-400 mt-0.5 line-clamp-2", children: item.body }),
              /* @__PURE__ */ jsx("p", { className: "text-[11px] text-gray-500 mt-1", children: formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: fr }) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-end gap-1 flex-shrink-0", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => handleView(item),
                  className: "text-xs text-blue-400 hover:text-blue-300 px-2 py-1 rounded hover:bg-gray-800 transition-colors",
                  children: "Ouvrir"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => onDismiss(item),
                  className: "text-xs text-gray-500 hover:text-gray-300 px-2 py-1 rounded hover:bg-gray-800 transition-colors",
                  children: "Ignorer"
                }
              )
            ] })
          ]
        },
        item.id
      )) }) })
    ] })
  ] });
}
function useTimeClock(days = 30) {
  const { profile } = useTeam();
  const instanceId = useId();
  const [sessions, setSessions] = useState([]);
  const [workDays, setWorkDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchAll = useCallback(async () => {
    if (!profile) {
      setLoading(false);
      return;
    }
    const since = /* @__PURE__ */ new Date();
    since.setDate(since.getDate() - days);
    const [{ data: s, error: e }, { data: d }] = await Promise.all([
      supabase.from("work_sessions").select("*").gte("started_at", since.toISOString()).order("started_at", { ascending: false }),
      supabase.from("work_days").select("*").gte("day", since.toISOString().slice(0, 10)).order("day", { ascending: false })
    ]);
    if (e) setError("Impossible de charger les pointages.");
    setSessions(s || []);
    setWorkDays(d || []);
    setLoading(false);
  }, [profile, days]);
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);
  useEffect(() => {
    const channel = supabase.channel(`timeclock-${instanceId}`).on("postgres_changes", { event: "*", schema: "public", table: "work_sessions" }, () => {
      fetchAll();
    }).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAll, instanceId]);
  const openSession = sessions.find((s) => s.profile_id === (profile == null ? void 0 : profile.id) && !s.ended_at) ?? null;
  const punch = useCallback(async (note) => {
    setError(null);
    const { data, error: e } = await supabase.rpc("punch", note ? { p_note: note } : {});
    if (e) {
      setError("Le pointage n'a pas pu être enregistré.");
      return null;
    }
    await fetchAll();
    return data;
  }, [fetchAll]);
  const addManual = useCallback(async (startedAt, endedAt, note) => {
    if (!profile) return false;
    const { error: e } = await supabase.from("work_sessions").insert({
      profile_id: profile.id,
      started_at: startedAt,
      ended_at: endedAt,
      note: note || null,
      is_manual: true
    });
    if (e) {
      setError("La saisie n'a pas pu être ajoutée. Vérifie que l'heure de fin suit l'heure de début.");
      return false;
    }
    await fetchAll();
    return true;
  }, [profile, fetchAll]);
  const removeSession = useCallback(async (id) => {
    const { error: e } = await supabase.from("work_sessions").delete().eq("id", id);
    if (e) {
      setError("Suppression impossible.");
      return;
    }
    await fetchAll();
  }, [fetchAll]);
  return { sessions, workDays, openSession, loading, error, punch, addManual, removeSession, refresh: fetchAll };
}
function formatHours(hours) {
  const total = Math.round(hours * 60);
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${String(m).padStart(2, "0")}`;
}
function PunchButton() {
  const { profile } = useTeam();
  const { openSession, workDays, punch, error } = useTimeClock(7);
  const [elapsed, setElapsed] = useState(0);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!openSession) {
      setElapsed(0);
      return;
    }
    const tick = () => setElapsed(Math.floor((Date.now() - new Date(openSession.started_at).getTime()) / 1e3));
    tick();
    const id = setInterval(tick, 1e3);
    return () => clearInterval(id);
  }, [openSession]);
  if (!profile) return null;
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const todayHours = workDays.filter((d) => d.profile_id === profile.id && d.day === today).reduce((sum, d) => sum + Number(d.hours), 0);
  const running = !!openSession;
  const clock = `${String(Math.floor(elapsed / 3600)).padStart(2, "0")}:${String(Math.floor(elapsed % 3600 / 60)).padStart(2, "0")}`;
  return /* @__PURE__ */ jsxs(
    "button",
    {
      onClick: async () => {
        setBusy(true);
        await punch();
        setBusy(false);
      },
      disabled: busy,
      title: running ? "Badger le départ" : "Badger l'arrivée",
      className: `flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${running ? "bg-green-600/15 text-green-400 hover:bg-green-600/25" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`,
      children: [
        running ? /* @__PURE__ */ jsxs("span", { className: "relative flex h-2 w-2 flex-shrink-0", children: [
          /* @__PURE__ */ jsx("span", { className: "animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-60" }),
          /* @__PURE__ */ jsx("span", { className: "relative inline-flex rounded-full h-2 w-2 bg-green-500" })
        ] }) : /* @__PURE__ */ jsx("svg", { className: "w-4 h-4 flex-shrink-0", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 1.8, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" }) }),
        /* @__PURE__ */ jsx("span", { className: "tabular-nums", children: running ? clock : formatHours(todayHours) }),
        /* @__PURE__ */ jsx("span", { className: "hidden sm:inline", children: running ? "Départ" : "Badger" }),
        error && /* @__PURE__ */ jsx("span", { className: "sr-only", children: error })
      ]
    }
  );
}
function useAutomation() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const checkRules = useCallback(async () => {
    var _a, _b;
    setLoading(true);
    const newNotifications = [];
    const { data: rules } = await supabase.from("automation_rules").select("*").eq("is_active", true);
    if (!rules) {
      setLoading(false);
      return;
    }
    const yesterday = /* @__PURE__ */ new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const { data: recentLogs } = await supabase.from("automation_logs").select("rule_id, entity_id").gte("executed_at", yesterday.toISOString());
    const loggedSet = new Set(
      (recentLogs || []).map((l) => `${l.rule_id}:${l.entity_id}`)
    );
    for (const rule of rules) {
      const alreadyLogged = (entityId) => loggedSet.has(`${rule.id}:${entityId}`);
      if (rule.trigger_type === "lead_no_activity") {
        const cutoff = /* @__PURE__ */ new Date();
        cutoff.setDate(cutoff.getDate() - rule.trigger_delay_days);
        const { data: leads } = await supabase.from("clients").select("id, name, last_contacted_at").in("status", ["new_lead", "contacted"]).or(`last_contacted_at.is.null,last_contacted_at.lt.${cutoff.toISOString()}`);
        for (const lead of leads || []) {
          if (alreadyLogged(lead.id)) continue;
          const message = (rule.action_template || "").replace(/\{\{name\}\}/g, lead.name);
          newNotifications.push({
            id: `${rule.id}-${lead.id}`,
            ruleId: rule.id,
            entityType: "client",
            entityId: lead.id,
            message,
            createdAt: (/* @__PURE__ */ new Date()).toISOString(),
            read: false
          });
        }
      }
      if (rule.trigger_type === "quote_no_response") {
        const cutoff = /* @__PURE__ */ new Date();
        cutoff.setDate(cutoff.getDate() - rule.trigger_delay_days);
        const { data: quotes } = await supabase.from("quotes").select("id, quote_number, client_id, sent_at, client:clients(name)").eq("status", "sent").lt("sent_at", cutoff.toISOString());
        for (const quote of quotes || []) {
          if (alreadyLogged(quote.id)) continue;
          const clientName = ((_a = quote.client) == null ? void 0 : _a.name) || "";
          const message = (rule.action_template || "").replace(/\{\{quote_number\}\}/g, quote.quote_number).replace(/\{\{client_name\}\}/g, clientName);
          newNotifications.push({
            id: `${rule.id}-${quote.id}`,
            ruleId: rule.id,
            entityType: "quote",
            entityId: quote.id,
            message,
            createdAt: (/* @__PURE__ */ new Date()).toISOString(),
            read: false
          });
        }
      }
      if (rule.trigger_type === "invoice_overdue") {
        const cutoff = /* @__PURE__ */ new Date();
        cutoff.setDate(cutoff.getDate() - rule.trigger_delay_days);
        const { data: invoices } = await supabase.from("invoices").select("id, invoice_number, client_id, due_date, client:clients(name)").in("status", ["sent", "partial"]).lt("due_date", cutoff.toISOString().slice(0, 10));
        for (const inv of invoices || []) {
          if (alreadyLogged(inv.id)) continue;
          const clientName = ((_b = inv.client) == null ? void 0 : _b.name) || "";
          const message = (rule.action_template || "").replace(/\{\{invoice_number\}\}/g, inv.invoice_number).replace(/\{\{client_name\}\}/g, clientName);
          newNotifications.push({
            id: `${rule.id}-${inv.id}`,
            ruleId: rule.id,
            entityType: "invoice",
            entityId: inv.id,
            message,
            createdAt: (/* @__PURE__ */ new Date()).toISOString(),
            read: false
          });
        }
      }
      if (rule.trigger_type === "follow_up_due") {
        const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
        const { data: clients } = await supabase.from("clients").select("id, name, next_follow_up_at").lte("next_follow_up_at", today + "T23:59:59").not("next_follow_up_at", "is", null);
        for (const client of clients || []) {
          if (alreadyLogged(client.id)) continue;
          const message = (rule.action_template || "").replace(/\{\{name\}\}/g, client.name);
          newNotifications.push({
            id: `${rule.id}-${client.id}`,
            ruleId: rule.id,
            entityType: "client",
            entityId: client.id,
            message,
            createdAt: (/* @__PURE__ */ new Date()).toISOString(),
            read: false
          });
        }
      }
    }
    if (newNotifications.length > 0) {
      await supabase.from("automation_logs").insert(
        newNotifications.map((n) => ({
          rule_id: n.ruleId,
          entity_type: n.entityType,
          entity_id: n.entityId,
          action_taken: n.message,
          success: true
        }))
      );
    }
    setNotifications(newNotifications);
    setLoading(false);
  }, []);
  useEffect(() => {
    checkRules();
  }, [checkRules]);
  const dismissNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };
  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };
  const unreadCount = notifications.filter((n) => !n.read).length;
  return { notifications, unreadCount, dismissNotification, markAllRead, loading };
}
const PAGE_SIZE = 40;
function useNotifications() {
  const { profile } = useTeam();
  const instanceId = useId();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetchNotifications = useCallback(async () => {
    if (!profile) {
      setNotifications([]);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(PAGE_SIZE);
    if (error) console.error("Fetch notifications error:", error);
    setNotifications(data || []);
    setLoading(false);
  }, [profile]);
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);
  useEffect(() => {
    if (!profile) return;
    const channel = supabase.channel(`notifications-${profile.id}-${instanceId}`).on(
      "postgres_changes",
      { event: "*", schema: "public", table: "notifications", filter: `recipient_id=eq.${profile.id}` },
      () => {
        fetchNotifications();
      }
    ).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile, fetchNotifications, instanceId]);
  const markRead = useCallback(async (id) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read_at: (/* @__PURE__ */ new Date()).toISOString() } : n));
    await supabase.from("notifications").update({ read_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", id);
  }, []);
  const markAllRead = useCallback(async () => {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    setNotifications((prev) => prev.map((n) => n.read_at ? n : { ...n, read_at: now }));
    await supabase.from("notifications").update({ read_at: now }).is("read_at", null);
  }, []);
  const dismiss = useCallback(async (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    await supabase.from("notifications").delete().eq("id", id);
  }, []);
  return {
    notifications,
    unreadCount: notifications.filter((n) => !n.read_at).length,
    loading,
    markRead,
    markAllRead,
    dismiss,
    refresh: fetchNotifications
  };
}
const pageTitles = {
  "/dashboard": "Dashboard",
  "/dashboard/projects": "Projets",
  "/dashboard/kanban": "Kanban",
  "/dashboard/calendar": "Calendrier",
  "/dashboard/clients": "Leads & Clients",
  "/dashboard/sms-templates": "Templates SMS",
  "/dashboard/quotes": "Devis",
  "/dashboard/quotes/new": "Nouveau devis",
  "/dashboard/invoices": "Factures",
  "/dashboard/invoices/new": "Nouvelle facture",
  "/dashboard/finances": "Finances",
  "/dashboard/comptabilite": "Simulateur de statut",
  "/dashboard/messages": "Messagerie",
  "/dashboard/pointage": "Temps de travail",
  "/dashboard/mes-documents": "Mes documents",
  "/dashboard/proposals": "Propositions",
  "/dashboard/proposals/new": "Nouvelle proposition",
  "/dashboard/automation": "Automatisation"
};
const ENTITY_PATH = {
  client: (id) => `/dashboard/clients/${id}`,
  quote: (id) => `/dashboard/quotes/${id}`,
  invoice: (id) => `/dashboard/invoices/${id}`,
  project: (id) => `/dashboard/projects/${id}`,
  task: () => "/dashboard/kanban"
};
function Header({ onMenuClick }) {
  const location = useLocation();
  const { memberById } = useTeam();
  const { notifications, unreadCount, markRead, markAllRead, dismiss } = useNotifications();
  const alerts = useAutomation();
  const teamItems = notifications.map((n) => ({
    id: n.id,
    kind: "team",
    title: n.title,
    body: n.body,
    link: n.link || "/dashboard",
    createdAt: n.created_at,
    read: !!n.read_at,
    actor: memberById(n.actor_id),
    badge: n.type === "activity" ? void 0 : n.type
  }));
  const alertItems = alerts.notifications.map((a) => ({
    id: a.id,
    kind: "alert",
    title: a.message,
    link: (ENTITY_PATH[a.entityType] || (() => "/dashboard"))(a.entityId),
    createdAt: a.createdAt,
    read: a.read
  }));
  const items = [...teamItems, ...alertItems];
  const title = pageTitles[location.pathname] || (location.pathname.startsWith("/dashboard/clients/") ? "Fiche client" : "") || (location.pathname.startsWith("/dashboard/quotes/") ? "Détail devis" : "") || (location.pathname.startsWith("/dashboard/invoices/") ? "Détail facture" : "") || (location.pathname.startsWith("/dashboard/proposals/") ? "Détail proposition" : "") || (location.pathname.startsWith("/dashboard/messages/") ? "Messagerie" : "") || (location.pathname.startsWith("/dashboard/projects/") ? "Détail projet" : "") || "Dashboard";
  const now = /* @__PURE__ */ new Date();
  const dateStr = now.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });
  return /* @__PURE__ */ jsxs("header", { className: "h-16 border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: onMenuClick,
          className: "lg:hidden p-2 -ml-2 text-gray-400 hover:text-white transition-colors",
          "aria-label": "Ouvrir le menu",
          children: /* @__PURE__ */ jsx("svg", { className: "w-6 h-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" }) })
        }
      ),
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-white", children: title })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 sm:gap-3", children: [
      /* @__PURE__ */ jsx(PunchButton, {}),
      /* @__PURE__ */ jsx(
        NotificationCenter,
        {
          items,
          unreadCount: unreadCount + alerts.unreadCount,
          onOpen: (item) => {
            if (item.kind === "team") markRead(item.id);
          },
          onDismiss: (item) => {
            if (item.kind === "team") dismiss(item.id);
            else alerts.dismissNotification(item.id);
          },
          onMarkAllRead: () => {
            markAllRead();
            alerts.markAllRead();
          }
        }
      ),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 capitalize hidden xl:block", children: dateStr })
    ] })
  ] });
}
async function fetchTwilioToken() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Non authentifié");
  const response = await fetch(
    `${"https://uipxlesrpdocqpblmrrr.supabase.co"}/functions/v1/twilio-token`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${session.access_token}`,
        "Content-Type": "application/json"
      }
    }
  );
  if (!response.ok) throw new Error("Erreur génération token Twilio");
  const { token } = await response.json();
  return token;
}
async function sendSms(params) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Non authentifié");
  const response = await fetch(
    `${"https://uipxlesrpdocqpblmrrr.supabase.co"}/functions/v1/send-sms`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${session.access_token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(params)
    }
  );
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "Erreur envoi SMS");
  }
  return response.json();
}
function parseTemplate(template, variables) {
  return template.replace(
    /\{\{(\w+)\}\}/g,
    (_, key) => variables[key] || `{{${key}}}`
  );
}
function useTwilioDevice() {
  const [status, setStatus] = useState("idle");
  const [activeCall, setActiveCall] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [error, setError] = useState(null);
  const deviceRef = useRef(null);
  const timerRef = useRef(null);
  const initializingRef = useRef(false);
  const startTimer = useCallback(() => {
    setCallDuration(0);
    timerRef.current = setInterval(() => {
      setCallDuration((d) => d + 1);
    }, 1e3);
  }, []);
  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);
  const cleanupCall = useCallback(() => {
    setActiveCall(null);
    setIsMuted(false);
    stopTimer();
    setStatus("idle");
  }, [stopTimer]);
  const setupCallEvents = useCallback(
    (call) => {
      call.on("accept", () => {
        setStatus("in-call");
        startTimer();
      });
      call.on("disconnect", () => {
        cleanupCall();
      });
      call.on("cancel", () => {
        cleanupCall();
      });
      call.on("reject", () => {
        cleanupCall();
      });
    },
    [startTimer, cleanupCall]
  );
  const ensureDevice = useCallback(async () => {
    var _a, _b;
    if (deviceRef.current) return deviceRef.current;
    if (initializingRef.current) return null;
    initializingRef.current = true;
    try {
      const token = await fetchTwilioToken();
      let audioElement = document.getElementById("twilio-audio");
      if (!audioElement) {
        audioElement = document.createElement("audio");
        audioElement.id = "twilio-audio";
        audioElement.autoplay = true;
        document.body.appendChild(audioElement);
      }
      const device = new Device(token, {
        edge: "ashburn",
        closeProtection: true,
        sounds: {
          incoming: void 0,
          outgoing: void 0,
          disconnect: void 0
        }
      });
      (_a = device.audio) == null ? void 0 : _a.speakerDevices.set("default");
      (_b = device.audio) == null ? void 0 : _b.ringtoneDevices.set("default");
      device.on("registered", () => {
        setStatus("idle");
      });
      device.on("incoming", (call) => {
        setActiveCall(call);
        setStatus("incoming");
        setupCallEvents(call);
      });
      device.on("tokenWillExpire", async () => {
        try {
          const newToken = await fetchTwilioToken();
          device.updateToken(newToken);
        } catch (e) {
          console.error("Token refresh error:", e);
        }
      });
      device.on("error", (err) => {
        console.error("Twilio device error:", err);
        setError(err.message || "Erreur Twilio");
        setStatus("error");
      });
      await device.register();
      deviceRef.current = device;
      initializingRef.current = false;
      return device;
    } catch (e) {
      console.error("Twilio init error:", e);
      setError(e instanceof Error ? e.message : "Erreur initialisation Twilio");
      setStatus("error");
      initializingRef.current = false;
      return null;
    }
  }, [setupCallEvents]);
  const makeCall = useCallback(
    async (phoneNumber) => {
      setStatus("calling");
      try {
        const device = await ensureDevice();
        if (!device) {
          setStatus("idle");
          return;
        }
        const call = await device.connect({
          params: { To: phoneNumber }
        });
        setActiveCall(call);
        setupCallEvents(call);
      } catch (e) {
        console.error("makeCall error:", e);
        setError(e instanceof Error ? e.message : "Erreur appel");
        setStatus("idle");
      }
    },
    [ensureDevice, setupCallEvents]
  );
  const hangup = useCallback(() => {
    activeCall == null ? void 0 : activeCall.disconnect();
  }, [activeCall]);
  const toggleMute = useCallback(() => {
    if (activeCall) {
      const newMuted = !isMuted;
      activeCall.mute(newMuted);
      setIsMuted(newMuted);
    }
  }, [activeCall, isMuted]);
  const acceptIncoming = useCallback(() => {
    activeCall == null ? void 0 : activeCall.accept();
  }, [activeCall]);
  const rejectIncoming = useCallback(() => {
    activeCall == null ? void 0 : activeCall.reject();
  }, [activeCall]);
  const sendDigit = useCallback((digit) => {
    activeCall == null ? void 0 : activeCall.sendDigits(digit);
  }, [activeCall]);
  return {
    status,
    activeCall,
    isMuted,
    callDuration,
    error,
    makeCall,
    hangup,
    toggleMute,
    acceptIncoming,
    rejectIncoming,
    sendDigit
  };
}
const TwilioContext = createContext(null);
function TwilioDeviceProvider({ children }) {
  const state = useTwilioDevice();
  return /* @__PURE__ */ jsx(TwilioContext.Provider, { value: state, children });
}
function TwilioProvider({ children }) {
  const { user } = useAuth();
  if (!user) {
    return /* @__PURE__ */ jsx(Fragment, { children });
  }
  return /* @__PURE__ */ jsx(TwilioDeviceProvider, { children });
}
function useTwilio() {
  const context = useContext(TwilioContext);
  if (!context) {
    return {
      status: "loading",
      activeCall: null,
      isMuted: false,
      callDuration: 0,
      error: null,
      makeCall: async () => {
      },
      hangup: () => {
      },
      toggleMute: () => {
      },
      acceptIncoming: () => {
      },
      rejectIncoming: () => {
      },
      sendDigit: () => {
      }
    };
  }
  return context;
}
function toE164(phone) {
  const cleaned = phone.replace(/[\s.\-()]/g, "");
  if (cleaned.startsWith("+")) return cleaned;
  if (cleaned.startsWith("00")) return "+" + cleaned.slice(2);
  if (cleaned.startsWith("0") && cleaned.length === 10) return "+33" + cleaned.slice(1);
  return cleaned;
}
function formatPhone(phone) {
  if (!phone) return "-";
  const matchFr = phone.match(/^\+33(\d)(\d{2})(\d{2})(\d{2})(\d{2})$/);
  if (matchFr) return `0${matchFr[1]} ${matchFr[2]} ${matchFr[3]} ${matchFr[4]} ${matchFr[5]}`;
  return phone;
}
function isValidPhone(phone) {
  const e164 = toE164(phone);
  return /^\+\d{8,15}$/.test(e164);
}
function Softphone() {
  const { status, callDuration, isMuted, makeCall, hangup, toggleMute, acceptIncoming, rejectIncoming, activeCall, sendDigit } = useTwilio();
  const [callNote, setCallNote] = useState("");
  const [showPostCall, setShowPostCall] = useState(false);
  const [postCallData, setPostCallData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [dialerOpen, setDialerOpen] = useState(false);
  const [dialNumber, setDialNumber] = useState("");
  const [keypadOpen, setKeypadOpen] = useState(false);
  const [dtmfHistory, setDtmfHistory] = useState("");
  const handleDtmf = (digit) => {
    sendDigit(digit);
    setDtmfHistory((prev) => prev + digit);
  };
  const minutes = Math.floor(callDuration / 60).toString().padStart(2, "0");
  const seconds = (callDuration % 60).toString().padStart(2, "0");
  const handleDial = () => {
    if (!dialNumber.trim()) return;
    const e164 = toE164(dialNumber.trim());
    makeCall(e164);
    setDialerOpen(false);
  };
  const handleDialPad = (digit) => {
    setDialNumber((prev) => prev + digit);
  };
  const handleBackspace = () => {
    setDialNumber((prev) => prev.slice(0, -1));
  };
  const handleHangup = () => {
    const params = (activeCall == null ? void 0 : activeCall.parameters) || {};
    setPostCallData({
      clientId: params.clientId || "",
      clientName: params.clientName || "Appel",
      callNote,
      newStatus: "",
      followUpDate: "",
      callSid: params.CallSid || null
    });
    hangup();
    setKeypadOpen(false);
    setDtmfHistory("");
    setShowPostCall(true);
  };
  const handleSavePostCall = async () => {
    if (!postCallData) return;
    setSaving(true);
    if (postCallData.callSid) {
      await supabase.from("calls").update({ call_note: postCallData.callNote || null }).eq("twilio_call_sid", postCallData.callSid);
    }
    if (postCallData.clientId) {
      const updateData = {};
      if (postCallData.newStatus) updateData.status = postCallData.newStatus;
      if (postCallData.followUpDate) updateData.next_follow_up_at = postCallData.followUpDate;
      if (Object.keys(updateData).length > 0) {
        await supabase.from("clients").update(updateData).eq("id", postCallData.clientId);
      }
    }
    setSaving(false);
    setShowPostCall(false);
    setPostCallData(null);
    setCallNote("");
  };
  const handleIgnorePostCall = () => {
    setShowPostCall(false);
    setPostCallData(null);
    setCallNote("");
  };
  const dialPadKeys = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    ["*", "0", "#"]
  ];
  if (showPostCall && postCallData) {
    return /* @__PURE__ */ jsx("div", { className: "fixed bottom-6 right-6 z-50", children: /* @__PURE__ */ jsxs(
      motion.div,
      {
        initial: { opacity: 0, y: 20, scale: 0.95 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 20, scale: 0.95 },
        className: "w-80 bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl p-4",
        children: [
          /* @__PURE__ */ jsx("h4", { className: "text-sm font-semibold text-white mb-3", children: "Notes d'appel" }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              value: postCallData.callNote,
              onChange: (e) => setPostCallData({ ...postCallData, callNote: e.target.value }),
              rows: 3,
              className: "w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none mb-3",
              placeholder: "Notes de l'appel..."
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "mb-3", children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs text-gray-400 mb-1", children: "Mettre à jour le statut" }),
            /* @__PURE__ */ jsxs(
              "select",
              {
                value: postCallData.newStatus,
                onChange: (e) => setPostCallData({ ...postCallData, newStatus: e.target.value }),
                className: "w-full px-3 py-1.5 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500",
                children: [
                  /* @__PURE__ */ jsx("option", { value: "", children: "Ne pas modifier" }),
                  /* @__PURE__ */ jsx("option", { value: "contacted", children: "Contacté" }),
                  /* @__PURE__ */ jsx("option", { value: "qualified", children: "Qualifié" }),
                  /* @__PURE__ */ jsx("option", { value: "active", children: "Client actif" }),
                  /* @__PURE__ */ jsx("option", { value: "completed", children: "Terminé" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs text-gray-400 mb-1", children: "Prochaine relance" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "datetime-local",
                value: postCallData.followUpDate,
                onChange: (e) => setPostCallData({ ...postCallData, followUpDate: e.target.value }),
                className: "w-full px-3 py-1.5 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: handleSavePostCall,
                disabled: saving,
                className: "flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors",
                children: saving ? "Enregistrement..." : "Sauvegarder"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: handleIgnorePostCall,
                className: "px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-lg transition-colors",
                children: "Ignorer"
              }
            )
          ] })
        ]
      }
    ) });
  }
  return /* @__PURE__ */ jsx("div", { className: "fixed bottom-6 right-6 z-50", children: /* @__PURE__ */ jsxs(AnimatePresence, { mode: "wait", children: [
    status === "idle" && !dialerOpen && /* @__PURE__ */ jsx(
      motion.button,
      {
        initial: { scale: 0 },
        animate: { scale: 1 },
        exit: { scale: 0 },
        onClick: () => setDialerOpen(true),
        className: "w-14 h-14 bg-green-600 hover:bg-green-700 rounded-full flex items-center justify-center shadow-lg cursor-pointer transition-colors",
        title: "Composer un numéro",
        children: /* @__PURE__ */ jsx("svg", { className: "w-6 h-6 text-white", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" }) })
      },
      "idle"
    ),
    status === "idle" && dialerOpen && /* @__PURE__ */ jsxs(
      motion.div,
      {
        initial: { opacity: 0, y: 20, scale: 0.95 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 20, scale: 0.95 },
        className: "w-72 bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl p-4",
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-3", children: [
            /* @__PURE__ */ jsx("h4", { className: "text-sm font-semibold text-white", children: "Composer" }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => {
                  setDialerOpen(false);
                  setDialNumber("");
                },
                className: "p-1 text-gray-400 hover:text-white transition-colors",
                children: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M6 18L18 6M6 6l12 12" }) })
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "relative mb-3", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "tel",
                value: dialNumber,
                onChange: (e) => setDialNumber(e.target.value),
                onKeyDown: (e) => {
                  if (e.key === "Enter") handleDial();
                },
                placeholder: "+33 6 12 34 56 78",
                className: "w-full px-3 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white text-center text-lg font-mono tracking-wider placeholder-gray-600 focus:outline-none focus:border-blue-500",
                autoFocus: true
              }
            ),
            dialNumber && /* @__PURE__ */ jsx(
              "button",
              {
                onClick: handleBackspace,
                className: "absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-white transition-colors",
                children: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 9.75L14.25 12m0 0l2.25 2.25M14.25 12l2.25-2.25M14.25 12L12 14.25m-2.58 4.92l-6.374-6.375a1.125 1.125 0 010-1.59L9.42 4.83c.21-.211.497-.33.795-.33H19.5a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25 2.25h-9.284c-.298 0-.585-.119-.795-.33z" }) })
              }
            )
          ] }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-3 gap-2 mb-3", children: dialPadKeys.map(
            (row) => row.map((key) => /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => handleDialPad(key),
                className: "py-3 bg-gray-700 hover:bg-gray-600 text-white text-lg font-medium rounded-xl transition-colors active:bg-gray-500",
                children: key
              },
              key
            ))
          ) }),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: handleDial,
              disabled: !dialNumber.trim(),
              className: "w-full py-3 bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2",
              children: [
                /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" }) }),
                "Appeler"
              ]
            }
          )
        ]
      },
      "dialer"
    ),
    status === "loading" && /* @__PURE__ */ jsx(
      motion.div,
      {
        initial: { scale: 0 },
        animate: { scale: 1 },
        exit: { scale: 0 },
        className: "w-14 h-14 bg-gray-700 rounded-full flex items-center justify-center shadow-lg",
        children: /* @__PURE__ */ jsx("div", { className: "w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" })
      },
      "loading"
    ),
    status === "error" && /* @__PURE__ */ jsx(
      motion.div,
      {
        initial: { scale: 0 },
        animate: { scale: 1 },
        exit: { scale: 0 },
        className: "w-14 h-14 bg-red-600/20 border border-red-500/30 rounded-full flex items-center justify-center shadow-lg cursor-pointer",
        title: "Erreur Twilio, cliquer pour réessayer",
        onClick: () => window.location.reload(),
        children: /* @__PURE__ */ jsx("svg", { className: "w-6 h-6 text-red-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" }) })
      },
      "error"
    ),
    status === "calling" && /* @__PURE__ */ jsxs(
      motion.div,
      {
        initial: { opacity: 0, y: 20, scale: 0.95 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 20, scale: 0.95 },
        className: "w-72 bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl p-4",
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-4", children: [
            /* @__PURE__ */ jsx("div", { className: "w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center", children: /* @__PURE__ */ jsx("div", { className: "w-3 h-3 bg-blue-400 rounded-full animate-pulse" }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-white", children: "Appel en cours..." }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-400", children: "Connexion" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: handleHangup,
              className: "w-full py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2",
              children: [
                /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M15.536 8.464a5 5 0 010 7.072M12 12h.01M8.464 8.464a5 5 0 000 7.072M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) }),
                "Raccrocher"
              ]
            }
          )
        ]
      },
      "calling"
    ),
    status === "in-call" && /* @__PURE__ */ jsxs(
      motion.div,
      {
        initial: { opacity: 0, y: 20, scale: 0.95 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 20, scale: 0.95 },
        className: "w-80 bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl p-4",
        children: [
          /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between mb-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: "w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center", children: /* @__PURE__ */ jsx("div", { className: "w-3 h-3 bg-green-400 rounded-full" }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-white", children: "En appel" }),
              /* @__PURE__ */ jsxs("p", { className: "text-lg font-mono text-green-400", children: [
                minutes,
                ":",
                seconds
              ] })
            ] })
          ] }) }),
          keypadOpen && /* @__PURE__ */ jsxs("div", { className: "mb-3 p-3 bg-gray-900 rounded-xl", children: [
            dtmfHistory && /* @__PURE__ */ jsx("div", { className: "text-center text-lg font-mono text-green-400 mb-2 tracking-widest", children: dtmfHistory }),
            /* @__PURE__ */ jsx("div", { className: "grid grid-cols-3 gap-1.5", children: dialPadKeys.map(
              (row) => row.map((key) => /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => handleDtmf(key),
                  className: "py-2.5 bg-gray-700 hover:bg-gray-600 text-white text-base font-medium rounded-lg transition-colors active:bg-gray-500",
                  children: key
                },
                key
              ))
            ) }),
            dtmfHistory && /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setDtmfHistory(""),
                className: "mt-2 w-full py-1.5 text-xs text-gray-400 hover:text-white transition-colors",
                children: "Effacer l'affichage"
              }
            )
          ] }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              value: callNote,
              onChange: (e) => setCallNote(e.target.value),
              rows: 2,
              className: "w-full px-3 py-2 mb-3 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none",
              placeholder: "Notes d'appel..."
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-2", children: [
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: toggleMute,
                className: `py-2.5 text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-1 ${isMuted ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`,
                children: [
                  isMuted ? /* @__PURE__ */ jsxs("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: [
                    /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M19 19L17.591 17.591L5.409 5.409L4 4" }),
                    /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 18.75C8.27 18.75 5.25 15.73 5.25 12V10.5M12 18.75V22.5M8.25 22.5h7.5M18.75 10.5v1.5M12 1.5a3 3 0 00-3 3v6" })
                  ] }) : /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" }) }),
                  isMuted ? "Muté" : "Mute"
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => setKeypadOpen(!keypadOpen),
                className: `py-2.5 text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-1 ${keypadOpen ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`,
                title: "Pavé numérique (DTMF)",
                children: [
                  /* @__PURE__ */ jsxs("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: [
                    /* @__PURE__ */ jsx("rect", { x: "3", y: "3", width: "6", height: "6", rx: "1" }),
                    /* @__PURE__ */ jsx("rect", { x: "15", y: "3", width: "6", height: "6", rx: "1" }),
                    /* @__PURE__ */ jsx("rect", { x: "3", y: "15", width: "6", height: "6", rx: "1" }),
                    /* @__PURE__ */ jsx("rect", { x: "15", y: "15", width: "6", height: "6", rx: "1" }),
                    /* @__PURE__ */ jsx("rect", { x: "9", y: "9", width: "6", height: "6", rx: "1" })
                  ] }),
                  "Clavier"
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: handleHangup,
                className: "py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-1",
                children: [
                  /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M15.536 8.464a5 5 0 010 7.072M12 12h.01M8.464 8.464a5 5 0 000 7.072M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) }),
                  "Fin"
                ]
              }
            )
          ] })
        ]
      },
      "in-call"
    ),
    status === "incoming" && /* @__PURE__ */ jsxs(
      motion.div,
      {
        initial: { opacity: 0, y: 20, scale: 0.95 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 20, scale: 0.95 },
        className: "w-72 bg-gray-800 border-2 border-green-500/50 rounded-2xl shadow-2xl p-4 animate-pulse",
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-4", children: [
            /* @__PURE__ */ jsx("div", { className: "w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center", children: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5 text-green-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" }) }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-white", children: "Appel entrant" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-400", children: (activeCall == null ? void 0 : activeCall.parameters) ? activeCall.parameters.From || "Inconnu" : "Inconnu" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: acceptIncoming,
                className: "flex-1 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-xl transition-colors",
                children: "Accepter"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: rejectIncoming,
                className: "flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-xl transition-colors",
                children: "Rejeter"
              }
            )
          ] })
        ]
      },
      "incoming"
    )
  ] }) });
}
const TimerContext = createContext(void 0);
function TimerProvider({ children }) {
  const { profile } = useTeam();
  const [timer, setTimer] = useState(null);
  const [taskTitle, setTaskTitle] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [error, setError] = useState(null);
  const load = useCallback(async () => {
    if (!profile) {
      setTimer(null);
      return;
    }
    const { data } = await supabase.from("active_timers").select("*").eq("profile_id", profile.id).maybeSingle();
    if (!data) {
      setTimer(null);
      setTaskTitle(null);
      return;
    }
    setTimer(data);
    const { data: task } = await supabase.from("tasks").select("title").eq("id", data.task_id).maybeSingle();
    setTaskTitle((task == null ? void 0 : task.title) ?? null);
  }, [profile]);
  useEffect(() => {
    load();
  }, [load]);
  useEffect(() => {
    if (!timer) {
      setElapsedSeconds(0);
      return;
    }
    const tick = () => setElapsedSeconds(Math.floor((Date.now() - new Date(timer.started_at).getTime()) / 1e3));
    tick();
    const interval = setInterval(tick, 1e3);
    return () => clearInterval(interval);
  }, [timer]);
  const start = useCallback(async (task) => {
    if (!profile) return;
    setError(null);
    if (timer) await supabase.rpc("stop_timer", {});
    const { error: e } = await supabase.from("active_timers").upsert({
      profile_id: profile.id,
      task_id: task.id,
      project_id: task.project_id,
      description: task.title,
      started_at: (/* @__PURE__ */ new Date()).toISOString()
    });
    if (e) {
      setError("Le chronomètre n'a pas pu démarrer.");
      return;
    }
    await load();
  }, [profile, timer, load]);
  const stop = useCallback(async (note) => {
    if (!timer) return null;
    setError(null);
    const { data, error: e } = await supabase.rpc("stop_timer", note ? { p_note: note } : {});
    if (e) {
      setError("Le temps n'a pas pu être enregistré.");
      return null;
    }
    setTimer(null);
    setTaskTitle(null);
    const row = Array.isArray(data) ? data[0] : void 0;
    const hours = row ? Number(row.hours) : null;
    return hours;
  }, [timer]);
  return /* @__PURE__ */ jsx(TimerContext.Provider, { value: { timer, taskTitle, elapsedSeconds, running: !!timer, start, stop, error }, children });
}
function useTimer() {
  const context = useContext(TimerContext);
  if (!context) throw new Error("useTimer must be used within TimerProvider");
  return context;
}
function formatElapsed(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor(totalSeconds % 3600 / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}
function TimerBar() {
  const { running, taskTitle, elapsedSeconds, stop, error } = useTimer();
  if (!running) return null;
  return /* @__PURE__ */ jsxs("div", { className: "fixed bottom-4 left-4 lg:left-[17rem] z-40 flex items-center gap-3 px-4 py-2.5 bg-gray-900 border border-blue-600/50 rounded-xl shadow-2xl", children: [
    /* @__PURE__ */ jsxs("span", { className: "relative flex h-2.5 w-2.5 flex-shrink-0", children: [
      /* @__PURE__ */ jsx("span", { className: "animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-60" }),
      /* @__PURE__ */ jsx("span", { className: "relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm font-mono font-semibold text-white tabular-nums leading-tight", children: formatElapsed(elapsedSeconds) }),
      /* @__PURE__ */ jsx("p", { className: "text-[11px] text-gray-400 truncate max-w-[14rem]", children: taskTitle || "Tâche en cours" }),
      error && /* @__PURE__ */ jsx("p", { className: "text-[11px] text-red-400", children: error })
    ] }),
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => stop(),
        className: "px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors flex-shrink-0",
        children: "Arrêter"
      }
    )
  ] });
}
function RequireOwner({ children }) {
  const { isOwner, loading } = useTeam();
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "p-8 flex items-center justify-center", children: /* @__PURE__ */ jsx("div", { className: "w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" }) });
  }
  if (!isOwner) {
    return /* @__PURE__ */ jsx("div", { className: "p-8", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md mx-auto text-center bg-gray-900 border border-gray-800 rounded-xl p-8", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-white mb-2", children: "Espace réservé" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-400", children: "Cette section contient la comptabilité personnelle de l'entreprise. Le chiffre d'affaires par projet reste accessible depuis les fiches projet." })
    ] }) });
  }
  return /* @__PURE__ */ jsx(Fragment, { children });
}
function KPIWidgets({ widgets }) {
  return /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4", children: widgets.map((w, i) => /* @__PURE__ */ jsxs("div", { className: "bg-gray-900 border border-gray-800 rounded-xl p-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-3", children: [
      /* @__PURE__ */ jsx("span", { className: "text-xs font-medium text-gray-500 uppercase tracking-wider", children: w.label }),
      /* @__PURE__ */ jsx("div", { className: `w-8 h-8 rounded-lg flex items-center justify-center ${w.color}`, children: w.icon })
    ] }),
    /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-white", children: w.value }),
    w.sub && /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-1", children: w.sub })
  ] }, i)) });
}
const PRIORITY_DOT = {
  urgent: "bg-red-500",
  high: "bg-orange-500",
  medium: "bg-yellow-500",
  low: "bg-green-500"
};
function MyWeek({ tasks, projects }) {
  const navigate = useNavigate();
  const { profile } = useTeam();
  const mine = tasks.filter((t) => t.assignee_id === (profile == null ? void 0 : profile.id) && t.status !== "done").sort((a, b) => {
    if (!a.deadline && !b.deadline) return 0;
    if (!a.deadline) return 1;
    if (!b.deadline) return -1;
    return a.deadline.localeCompare(b.deadline);
  }).slice(0, 8);
  const today = /* @__PURE__ */ new Date();
  const lateCount = tasks.filter(
    (t) => t.assignee_id === (profile == null ? void 0 : profile.id) && t.status !== "done" && t.deadline && t.deadline < format(today, "yyyy-MM-dd")
  ).length;
  return /* @__PURE__ */ jsxs("div", { className: "bg-gray-900 border border-gray-800 rounded-xl p-5", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Avatar, { profile, size: "sm" }),
        /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-white", children: "Ma semaine" })
      ] }),
      lateCount > 0 && /* @__PURE__ */ jsxs("span", { className: "text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-medium", children: [
        lateCount,
        " en retard"
      ] })
    ] }),
    mine.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: "Aucune tâche ne t'est assignée. Ouvre le Kanban pour en prendre une." }) : /* @__PURE__ */ jsx("div", { className: "space-y-1.5", children: mine.map((task) => {
      const project = projects.find((p) => p.id === task.project_id);
      const days = task.deadline ? differenceInCalendarDays(parseISO(task.deadline), today) : null;
      const late = days != null && days < 0;
      return /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => navigate("/dashboard/kanban"),
          className: "w-full text-left flex items-center gap-2.5 p-2 rounded-lg hover:bg-gray-800 transition-colors",
          children: [
            /* @__PURE__ */ jsx("span", { className: `w-1.5 h-1.5 rounded-full flex-shrink-0 ${PRIORITY_DOT[task.priority]}` }),
            /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs font-medium text-white truncate", children: task.title }),
              project && /* @__PURE__ */ jsx("p", { className: "text-[10px] text-gray-500 truncate", children: project.name })
            ] }),
            task.deadline && /* @__PURE__ */ jsx("span", { className: `text-[10px] font-medium flex-shrink-0 ${late ? "text-red-400" : days === 0 ? "text-orange-400" : "text-gray-500"}`, children: late ? "En retard" : days === 0 ? "Auj." : format(parseISO(task.deadline), "d MMM", { locale: fr }) })
          ]
        },
        task.id
      );
    }) })
  ] });
}
const ACTION_COLOR = {
  created: "bg-blue-500",
  status_changed: "bg-amber-500",
  assigned: "bg-purple-500",
  commented: "bg-emerald-500"
};
function ActivityFeed({ projectId, limit = 20, title = "Activité", compact = false }) {
  const { memberById } = useTeam();
  const instanceId = useId();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetchActivity = useCallback(async () => {
    let query = supabase.from("activity").select("*").order("created_at", { ascending: false }).limit(limit);
    if (projectId) query = query.eq("project_id", projectId);
    const { data, error } = await query;
    if (error) console.error("Fetch activity error:", error);
    setEntries(data || []);
    setLoading(false);
  }, [projectId, limit]);
  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);
  useEffect(() => {
    const channel = supabase.channel(`activity-${projectId || "all"}-${instanceId}`).on("postgres_changes", { event: "INSERT", schema: "public", table: "activity" }, () => {
      fetchActivity();
    }).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, fetchActivity, instanceId]);
  const body = /* @__PURE__ */ jsx(Fragment, { children: loading ? /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: "Chargement…" }) : entries.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: "Rien pour l'instant. Chaque création, changement de statut et assignation apparaîtra ici." }) : /* @__PURE__ */ jsx("div", { className: "space-y-3", children: entries.map((entry) => {
    const actor = memberById(entry.actor_id);
    return /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2.5", children: [
      /* @__PURE__ */ jsxs("div", { className: "relative flex-shrink-0 mt-0.5", children: [
        /* @__PURE__ */ jsx(Avatar, { profile: actor, size: "sm" }),
        /* @__PURE__ */ jsx(
          "span",
          {
            className: `absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full ring-2 ring-gray-900 ${ACTION_COLOR[entry.action] || "bg-gray-500"}`
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-300 leading-snug break-words", children: [
          /* @__PURE__ */ jsx("span", { className: "font-medium text-white", children: (actor == null ? void 0 : actor.full_name) || "Système" }),
          " ",
          entry.summary
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-[10px] text-gray-500", children: formatDistanceToNow(new Date(entry.created_at), { addSuffix: true, locale: fr }) })
      ] })
    ] }, entry.id);
  }) }) });
  if (compact) return body;
  return /* @__PURE__ */ jsxs("div", { className: "bg-gray-900 border border-gray-800 rounded-xl p-5", children: [
    /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-white mb-4", children: title }),
    body
  ] });
}
function RevenueChart({ revenues, projects }) {
  const monthMap = /* @__PURE__ */ new Map();
  revenues.forEach((r) => {
    var _a;
    const monthKey = r.month.slice(0, 7);
    if (!monthMap.has(monthKey)) monthMap.set(monthKey, {});
    const entry = monthMap.get(monthKey);
    const projectName = ((_a = projects.find((p) => p.id === r.project_id)) == null ? void 0 : _a.name) || "Autre";
    entry[projectName] = (entry[projectName] || 0) + Number(r.amount);
  });
  const data = Array.from(monthMap.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([month, values]) => ({
    month: format(parseISO(month + "-01"), "MMM yy", { locale: fr }),
    ...values
  }));
  const projectNames = [...new Set(revenues.map(
    (r) => {
      var _a;
      return ((_a = projects.find((p) => p.id === r.project_id)) == null ? void 0 : _a.name) || "Autre";
    }
  ))];
  const projectColors = Object.fromEntries(
    projects.map((p) => [p.name, p.color])
  );
  if (data.length === 0) {
    return /* @__PURE__ */ jsxs("div", { className: "bg-gray-900 border border-gray-800 rounded-xl p-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-white mb-4", children: "Revenus mensuels" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 text-center py-8", children: "Aucun revenu enregistré" })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "bg-gray-900 border border-gray-800 rounded-xl p-6", children: [
    /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-white mb-4", children: "Revenus mensuels" }),
    /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: 280, children: /* @__PURE__ */ jsxs(BarChart, { data, children: [
      /* @__PURE__ */ jsx(XAxis, { dataKey: "month", tick: { fill: "#6B7280", fontSize: 12 }, axisLine: false, tickLine: false }),
      /* @__PURE__ */ jsx(YAxis, { tick: { fill: "#6B7280", fontSize: 12 }, axisLine: false, tickLine: false, tickFormatter: (v) => `${v}€` }),
      /* @__PURE__ */ jsx(
        Tooltip,
        {
          contentStyle: { backgroundColor: "#1F2937", border: "1px solid #374151", borderRadius: "8px", color: "#fff" },
          formatter: (value) => [`${Number(value).toFixed(2)} €`]
        }
      ),
      /* @__PURE__ */ jsx(Legend, { wrapperStyle: { fontSize: 12, color: "#9CA3AF" } }),
      projectNames.map((name) => /* @__PURE__ */ jsx(
        Bar,
        {
          dataKey: name,
          stackId: "revenue",
          fill: projectColors[name] || "#6B7280",
          radius: [4, 4, 0, 0]
        },
        name
      ))
    ] }) })
  ] });
}
function TaskStats({ tasks, projects }) {
  const projectStats = projects.map((p) => {
    const projectTasks = tasks.filter((t) => t.project_id === p.id);
    const done = projectTasks.filter((t) => t.status === "done").length;
    const total = projectTasks.length;
    const pct = total > 0 ? Math.round(done / total * 100) : 0;
    return { project: p, done, total, pct };
  }).filter((s) => s.total > 0);
  const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const overdueTasks = tasks.filter(
    (t) => t.deadline && t.deadline < today && t.status !== "done"
  );
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-gray-900 border border-gray-800 rounded-xl p-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-white mb-4", children: "Complétion par projet" }),
      projectStats.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 text-center py-4", children: "Aucune tâche" }) : /* @__PURE__ */ jsx("div", { className: "space-y-3", children: projectStats.map(({ project, done, total, pct }) => /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-1", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("div", { className: "w-2 h-2 rounded-full", style: { backgroundColor: project.color } }),
            /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-300", children: project.name })
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "text-xs text-gray-500", children: [
            done,
            "/",
            total,
            " (",
            pct,
            "%)"
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "w-full h-2 bg-gray-800 rounded-full overflow-hidden", children: /* @__PURE__ */ jsx(
          "div",
          {
            className: "h-full rounded-full transition-all duration-500",
            style: { width: `${pct}%`, backgroundColor: project.color }
          }
        ) })
      ] }, project.id)) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-gray-900 border border-gray-800 rounded-xl p-6", children: [
      /* @__PURE__ */ jsxs("h3", { className: "text-sm font-semibold text-white mb-4", children: [
        "Tâches en retard",
        overdueTasks.length > 0 && /* @__PURE__ */ jsx("span", { className: "ml-2 px-2 py-0.5 text-xs bg-red-500/20 text-red-400 rounded-full", children: overdueTasks.length })
      ] }),
      overdueTasks.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-green-400 text-center py-4", children: "Aucune tâche en retard" }) : /* @__PURE__ */ jsx("div", { className: "space-y-2", children: overdueTasks.slice(0, 5).map((task) => {
        const project = projects.find((p) => p.id === task.project_id);
        return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 p-2 bg-red-500/5 border border-red-500/10 rounded-lg", children: [
          /* @__PURE__ */ jsx("div", { className: "w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs font-medium text-white truncate", children: task.title }),
            /* @__PURE__ */ jsxs("p", { className: "text-[10px] text-gray-500", children: [
              project == null ? void 0 : project.name,
              " · Deadline : ",
              task.deadline
            ] })
          ] })
        ] }, task.id);
      }) })
    ] })
  ] });
}
function DashboardHome() {
  const { isOwner } = useTeam();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [revenues, setRevenues] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [callsToday, setCallsToday] = useState(0);
  const [pendingFollowUps, setPendingFollowUps] = useState(0);
  const [pendingQuotes, setPendingQuotes] = useState(0);
  const [unpaidInvoices, setUnpaidInvoices] = useState(0);
  const fetchAll = useCallback(async () => {
    const todayStart = /* @__PURE__ */ new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = /* @__PURE__ */ new Date();
    todayEnd.setHours(23, 59, 59, 999);
    const [{ data: p }, { data: t }, { data: r }, { data: c }, { count: callCount }, { count: qCount }, { count: iCount }] = await Promise.all([
      supabase.from("projects").select("*").eq("is_archived", false),
      supabase.from("tasks").select("*"),
      supabase.from("revenues").select("*"),
      supabase.from("clients").select("*"),
      supabase.from("calls").select("id", { count: "exact", head: true }).gte("called_at", todayStart.toISOString()).lte("called_at", todayEnd.toISOString()),
      supabase.from("quotes").select("id", { count: "exact", head: true }).eq("status", "sent"),
      supabase.from("invoices").select("id", { count: "exact", head: true }).in("status", ["sent", "partial", "overdue"])
    ]);
    if (p) setProjects(p);
    if (t) setTasks(t);
    if (r) setRevenues(r);
    if (c) {
      setClients(c);
      const now2 = (/* @__PURE__ */ new Date()).toISOString();
      const followUps = c.filter(
        (cl) => cl.next_follow_up_at && cl.next_follow_up_at <= now2
      ).length;
      setPendingFollowUps(followUps);
    }
    setCallsToday(callCount || 0);
    setPendingQuotes(qCount || 0);
    setUnpaidInvoices(iCount || 0);
    setLoading(false);
  }, []);
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "p-8 flex items-center justify-center", children: /* @__PURE__ */ jsx("div", { className: "w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" }) });
  }
  const now = /* @__PURE__ */ new Date();
  const today = format(now, "yyyy-MM-dd");
  const currentMonth = format(now, "yyyy-MM");
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const monthRevenue = revenues.filter((r) => r.month.startsWith(currentMonth)).reduce((sum, r) => sum + Number(r.amount), 0);
  const activeClients = clients.filter((c) => c.status === "active").length;
  const newLeads = clients.filter((c) => c.status === "new_lead").length;
  const doneThisWeek = tasks.filter((t) => {
    if (t.status !== "done" || !t.completed_at) return false;
    const d = new Date(t.completed_at);
    return d >= weekStart && d <= weekEnd;
  }).length;
  const overdueTasks = tasks.filter(
    (t) => t.deadline && t.deadline < today && t.status !== "done"
  ).length;
  const upcomingTasks = tasks.filter((t) => t.deadline && t.deadline >= today && t.status !== "done").sort((a, b) => a.deadline.localeCompare(b.deadline));
  const nextDeadline = upcomingTasks[0];
  const nextDeadlineStr = nextDeadline ? format(parseISO(nextDeadline.deadline), "d MMM", { locale: fr }) : "Aucune";
  const allWidgets = [
    {
      label: "Revenu du mois",
      value: `${monthRevenue.toLocaleString("fr-FR")} €`,
      sub: format(now, "MMMM yyyy", { locale: fr }),
      color: "bg-green-500/20",
      icon: /* @__PURE__ */ jsx("svg", { className: "w-4 h-4 text-green-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) })
    },
    {
      label: "Clients actifs",
      value: activeClients,
      sub: `${newLeads} leads, ${clients.length} total`,
      color: "bg-blue-500/20",
      icon: /* @__PURE__ */ jsx("svg", { className: "w-4 h-4 text-blue-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" }) })
    },
    {
      label: "Terminées (semaine)",
      value: doneThisWeek,
      color: "bg-purple-500/20",
      icon: /* @__PURE__ */ jsx("svg", { className: "w-4 h-4 text-purple-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) })
    },
    {
      label: "En retard",
      value: overdueTasks,
      color: overdueTasks > 0 ? "bg-red-500/20" : "bg-gray-800",
      icon: /* @__PURE__ */ jsx("svg", { className: `w-4 h-4 ${overdueTasks > 0 ? "text-red-400" : "text-gray-500"}`, fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" }) })
    },
    {
      label: "Prochaine deadline",
      value: nextDeadlineStr,
      sub: nextDeadline == null ? void 0 : nextDeadline.title,
      color: "bg-orange-500/20",
      icon: /* @__PURE__ */ jsx("svg", { className: "w-4 h-4 text-orange-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" }) })
    },
    {
      label: "Appels aujourd'hui",
      value: callsToday,
      color: "bg-cyan-500/20",
      icon: /* @__PURE__ */ jsx("svg", { className: "w-4 h-4 text-cyan-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" }) })
    },
    {
      label: "Relances en attente",
      value: pendingFollowUps,
      color: pendingFollowUps > 0 ? "bg-amber-500/20" : "bg-gray-800",
      icon: /* @__PURE__ */ jsx("svg", { className: `w-4 h-4 ${pendingFollowUps > 0 ? "text-amber-400" : "text-gray-500"}`, fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" }) })
    },
    {
      label: "Devis en attente",
      value: pendingQuotes,
      color: pendingQuotes > 0 ? "bg-indigo-500/20" : "bg-gray-800",
      icon: /* @__PURE__ */ jsx("svg", { className: `w-4 h-4 ${pendingQuotes > 0 ? "text-indigo-400" : "text-gray-500"}`, fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" }) })
    },
    {
      label: "Factures impayées",
      value: unpaidInvoices,
      color: unpaidInvoices > 0 ? "bg-rose-500/20" : "bg-gray-800",
      icon: /* @__PURE__ */ jsx("svg", { className: `w-4 h-4 ${unpaidInvoices > 0 ? "text-rose-400" : "text-gray-500"}`, fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" }) })
    }
  ];
  const widgets = isOwner ? allWidgets : allWidgets.filter((w) => w.label !== "Revenu du mois");
  return /* @__PURE__ */ jsxs("div", { className: "p-4 sm:p-6 space-y-6", children: [
    /* @__PURE__ */ jsx(KPIWidgets, { widgets }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [
      /* @__PURE__ */ jsx("div", { className: "lg:col-span-2", children: isOwner ? /* @__PURE__ */ jsx(RevenueChart, { revenues, projects }) : /* @__PURE__ */ jsx(MyWeek, { tasks, projects }) }),
      /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(TaskStats, { tasks, projects }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [
      isOwner && /* @__PURE__ */ jsx("div", { className: "lg:col-span-2", children: /* @__PURE__ */ jsx(MyWeek, { tasks, projects }) }),
      /* @__PURE__ */ jsx("div", { className: isOwner ? "" : "lg:col-span-3", children: /* @__PURE__ */ jsx(ActivityFeed, { title: "Activité de l'équipe", limit: 15 }) })
    ] })
  ] });
}
const PRIORITY_CONFIG = {
  urgent: { label: "Urgent", bg: "bg-red-500/20", text: "text-red-400", dot: "bg-red-500" },
  high: { label: "Haute", bg: "bg-orange-500/20", text: "text-orange-400", dot: "bg-orange-500" },
  medium: { label: "Moyenne", bg: "bg-yellow-500/20", text: "text-yellow-400", dot: "bg-yellow-500" },
  low: { label: "Basse", bg: "bg-green-500/20", text: "text-green-400", dot: "bg-green-500" }
};
const SEVERITY_LABEL = {
  critical: "Bloquant",
  major: "Majeur",
  minor: "Mineur"
};
const SEVERITY_STYLE = {
  critical: "bg-red-500/20 text-red-400",
  major: "bg-orange-500/20 text-orange-400",
  minor: "bg-gray-700 text-gray-300"
};
function TaskCard({ task, project, assignee, onClick }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: "task", task }
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };
  const priority = PRIORITY_CONFIG[task.priority];
  const deadlineInfo = getDeadlineInfo(task.deadline, task.status);
  return /* @__PURE__ */ jsxs(
    "div",
    {
      ref: setNodeRef,
      style,
      ...attributes,
      ...listeners,
      onClick,
      className: `bg-gray-800 border border-gray-700 rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-gray-600 transition-colors ${isDragging ? "opacity-50 shadow-xl" : ""}`,
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2 mb-2", children: [
          project ? /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 min-w-0", children: [
            /* @__PURE__ */ jsx("div", { className: "w-2 h-2 rounded-full flex-shrink-0", style: { backgroundColor: project.color } }),
            /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 truncate", children: project.name })
          ] }) : /* @__PURE__ */ jsx("span", {}),
          /* @__PURE__ */ jsx(Avatar, { profile: assignee, size: "xs" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-1.5 mb-2", children: [
          task.kind === "bug" && /* @__PURE__ */ jsx("span", { className: "px-1.5 py-0.5 text-[10px] font-medium rounded bg-red-500/20 text-red-400 flex-shrink-0 mt-0.5", children: "Bug" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-white", children: task.title })
        ] }),
        task.kind === "bug" && task.severity && /* @__PURE__ */ jsx("span", { className: `inline-block px-1.5 py-0.5 text-[10px] font-medium rounded mb-2 ${SEVERITY_STYLE[task.severity]}`, children: SEVERITY_LABEL[task.severity] }),
        task.tags && task.tags.length > 0 && /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1 mb-2", children: task.tags.map((tag) => /* @__PURE__ */ jsx("span", { className: "px-1.5 py-0.5 text-[10px] bg-gray-700 text-gray-300 rounded", children: tag }, tag)) }),
        task.estimated_hours != null && task.estimated_hours > 0 && /* @__PURE__ */ jsxs("div", { className: "mt-2 mb-1", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-[10px] text-gray-400 mb-0.5", children: [
            /* @__PURE__ */ jsxs("span", { children: [
              "⏱ ",
              task.actual_hours || 0,
              "h / ",
              task.estimated_hours,
              "h"
            ] }),
            /* @__PURE__ */ jsxs("span", { children: [
              Math.min(100, Math.round((task.actual_hours || 0) / task.estimated_hours * 100)),
              "%"
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "w-full h-1 bg-gray-700 rounded-full overflow-hidden", children: /* @__PURE__ */ jsx(
            "div",
            {
              className: `h-full rounded-full transition-all ${(task.actual_hours || 0) > task.estimated_hours ? "bg-red-500" : "bg-blue-500"}`,
              style: { width: `${Math.min(100, (task.actual_hours || 0) / task.estimated_hours * 100)}%` }
            }
          ) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mt-1", children: [
          /* @__PURE__ */ jsxs("span", { className: `inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${priority.bg} ${priority.text}`, children: [
            /* @__PURE__ */ jsx("span", { className: `w-1.5 h-1.5 rounded-full ${priority.dot}` }),
            priority.label
          ] }),
          deadlineInfo && /* @__PURE__ */ jsx("span", { className: `text-[10px] font-medium ${deadlineInfo.color}`, children: deadlineInfo.label })
        ] })
      ]
    }
  );
}
function getDeadlineInfo(deadline, status) {
  if (!deadline || status === "done") return null;
  const today = /* @__PURE__ */ new Date();
  today.setHours(0, 0, 0, 0);
  const deadlineDate = parseISO(deadline);
  const diff = differenceInDays(deadlineDate, today);
  if (diff < 0) {
    return { label: `En retard (${format(deadlineDate, "d MMM", { locale: fr })})`, color: "text-red-400" };
  }
  if (diff === 0) {
    return { label: "Aujourd'hui", color: "text-orange-400" };
  }
  if (diff <= 3) {
    return { label: `${diff}j restants`, color: "text-orange-400" };
  }
  return { label: format(deadlineDate, "d MMM", { locale: fr }), color: "text-gray-500" };
}
const COLUMNS = [
  { id: "todo", label: "À faire" },
  { id: "in_progress", label: "En cours" },
  { id: "review", label: "En review" },
  { id: "done", label: "Terminé" }
];
function KanbanBoard({ tasks, projects, members = [], onMoveTask, onClickTask }) {
  const [activeTask, setActiveTask] = useState(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );
  const projectMap = Object.fromEntries(projects.map((p) => [p.id, p]));
  const memberMap = Object.fromEntries(members.map((m) => [m.id, m]));
  const handleDragStart = (event) => {
    var _a;
    const task = (_a = event.active.data.current) == null ? void 0 : _a.task;
    if (task) setActiveTask(task);
  };
  const handleDragEnd = (event) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;
    const taskId = active.id;
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    const overData = over.data.current;
    let newStatus;
    let newIndex;
    if ((overData == null ? void 0 : overData.type) === "column") {
      newStatus = overData.status;
      newIndex = tasks.filter((t) => t.status === newStatus && t.id !== taskId).length;
    }
    if ((overData == null ? void 0 : overData.type) === "task") {
      const overTask = overData.task;
      newStatus = overTask.status;
      const column = tasks.filter((t) => t.status === newStatus && t.id !== taskId);
      newIndex = Math.max(0, column.findIndex((t) => t.id === overTask.id));
    }
    if (newStatus === void 0 || newIndex === void 0) return;
    const currentIndex = tasks.filter((t) => t.status === task.status).findIndex((t) => t.id === taskId);
    if (task.status === newStatus && currentIndex === newIndex) return;
    onMoveTask(taskId, newStatus, newIndex);
  };
  return /* @__PURE__ */ jsxs(DndContext, { sensors, onDragStart: handleDragStart, onDragEnd: handleDragEnd, children: [
    /* @__PURE__ */ jsx("div", { className: "flex lg:grid lg:grid-cols-4 gap-3 sm:gap-4 h-[calc(100vh-12rem)] overflow-x-auto snap-x snap-mandatory lg:overflow-visible", children: COLUMNS.map((col) => {
      const columnTasks = tasks.filter((t) => t.status === col.id);
      return /* @__PURE__ */ jsx(
        Column,
        {
          id: col.id,
          label: col.label,
          count: columnTasks.length,
          tasks: columnTasks,
          projects: projectMap,
          members: memberMap,
          onClickTask
        },
        col.id
      );
    }) }),
    /* @__PURE__ */ jsx(DragOverlay, { children: activeTask && /* @__PURE__ */ jsx("div", { className: "w-64 opacity-90", children: /* @__PURE__ */ jsx(
      TaskCard,
      {
        task: activeTask,
        project: projectMap[activeTask.project_id || ""],
        assignee: memberMap[activeTask.assignee_id || ""],
        onClick: () => {
        }
      }
    ) }) })
  ] });
}
function Column({
  id,
  label,
  count,
  tasks,
  projects,
  members,
  onClickTask
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${id}`,
    data: { type: "column", status: id }
  });
  return /* @__PURE__ */ jsxs(
    "div",
    {
      ref: setNodeRef,
      className: `flex flex-col rounded-xl transition-colors w-[80vw] sm:w-64 lg:w-auto flex-shrink-0 lg:flex-shrink snap-start ${isOver ? "bg-gray-800/60" : "bg-gray-900/50"}`,
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-3 py-3", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-gray-300", children: label }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full", children: count })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-y-auto px-2 pb-2 space-y-2", children: /* @__PURE__ */ jsx(SortableContext, { items: tasks.map((t) => t.id), strategy: verticalListSortingStrategy, children: tasks.map((task) => /* @__PURE__ */ jsx(
          TaskCard,
          {
            task,
            project: projects[task.project_id || ""],
            assignee: members[task.assignee_id || ""],
            onClick: () => onClickTask(task)
          },
          task.id
        )) }) })
      ]
    }
  );
}
function Modal({ open, onClose, title, children, maxWidth = "max-w-lg" }) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);
  if (!open) return null;
  return /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4", children: [
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black/60", onClick: onClose }),
    /* @__PURE__ */ jsxs("div", { className: `relative w-full ${maxWidth} max-h-[90vh] flex flex-col bg-gray-900 border border-gray-800 rounded-xl shadow-2xl`, children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-6 py-4 border-b border-gray-800 flex-shrink-0", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-white", children: title }),
        /* @__PURE__ */ jsx("button", { onClick: onClose, className: "text-gray-500 hover:text-white transition-colors", children: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M6 18L18 6M6 6l12 12" }) }) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "px-6 py-4 overflow-y-auto", children })
    ] })
  ] });
}
function AssigneeSelect({ value, onChange, label = "Responsable" }) {
  const { members, memberById } = useTeam();
  const selected = memberById(value);
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: label }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsx(Avatar, { profile: selected, size: "md" }),
      /* @__PURE__ */ jsxs(
        "select",
        {
          value: value || "",
          onChange: (e) => onChange(e.target.value || null),
          className: "flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500",
          children: [
            /* @__PURE__ */ jsx("option", { value: "", children: "Non assignée" }),
            members.map((m) => /* @__PURE__ */ jsxs("option", { value: m.id, children: [
              m.full_name,
              m.job_title ? ` · ${m.job_title}` : ""
            ] }, m.id))
          ]
        }
      )
    ] })
  ] });
}
function handle(profile) {
  return profile.full_name.trim().split(/\s+/)[0];
}
function resolveMentions(body, members) {
  const lower = body.toLowerCase();
  return members.filter((m) => lower.includes(`@${handle(m).toLowerCase()}`) || lower.includes(`@${m.full_name.toLowerCase()}`)).map((m) => m.id);
}
function renderBody(body, members) {
  const names = members.map(handle).filter(Boolean);
  if (names.length === 0) return body;
  const pattern = new RegExp(`(@(?:${names.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")}))`, "gi");
  return body.split(pattern).map(
    (part, i) => part.startsWith("@") ? /* @__PURE__ */ jsx("span", { className: "text-blue-400 font-medium", children: part }, i) : /* @__PURE__ */ jsx("span", { children: part }, i)
  );
}
function CommentThread({ entityType, entityId, title = "Discussion", compact = false }) {
  const { profile, members, memberById } = useTeam();
  const instanceId = useId();
  const [comments, setComments] = useState([]);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const textareaRef = useRef(null);
  const fetchComments = useCallback(async () => {
    const { data, error: e } = await supabase.from("comments").select("*").eq("entity_type", entityType).eq("entity_id", entityId).order("created_at");
    if (e) {
      console.error("Fetch comments error:", e);
      return;
    }
    setComments(data || []);
  }, [entityType, entityId]);
  useEffect(() => {
    fetchComments();
  }, [fetchComments]);
  useEffect(() => {
    const channel = supabase.channel(`comments-${entityType}-${entityId}-${instanceId}`).on(
      "postgres_changes",
      { event: "*", schema: "public", table: "comments", filter: `entity_id=eq.${entityId}` },
      () => {
        fetchComments();
      }
    ).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [entityType, entityId, fetchComments, instanceId]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = body.trim();
    if (!text || !profile) return;
    setSending(true);
    setError(null);
    const { error: insertError } = await supabase.from("comments").insert({
      entity_type: entityType,
      entity_id: entityId,
      author_id: profile.id,
      body: text,
      mentions: resolveMentions(text, members)
    });
    setSending(false);
    if (insertError) {
      setError("Le message n'a pas pu être envoyé. Réessaie.");
      console.error("Insert comment error:", insertError);
      return;
    }
    setBody("");
    fetchComments();
  };
  const handleDelete = async (id) => {
    const { error: e } = await supabase.from("comments").delete().eq("id", id);
    if (e) {
      setError("Suppression impossible.");
      return;
    }
    fetchComments();
  };
  const insertMention = (member) => {
    var _a;
    setBody((prev) => `${prev}${prev && !prev.endsWith(" ") ? " " : ""}@${handle(member)} `);
    (_a = textareaRef.current) == null ? void 0 : _a.focus();
  };
  const others = members.filter((m) => m.id !== (profile == null ? void 0 : profile.id));
  return /* @__PURE__ */ jsxs("div", { className: compact ? "" : "bg-gray-900 border border-gray-800 rounded-xl p-5", children: [
    !compact && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-white", children: title }),
      /* @__PURE__ */ jsxs("span", { className: "text-xs text-gray-500", children: [
        comments.length,
        " message",
        comments.length > 1 ? "s" : ""
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-3 mb-4 max-h-80 overflow-y-auto", children: [
      comments.length === 0 && /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: "Aucun message. Lance la discussion ici plutôt que sur WhatsApp." }),
      comments.map((c) => {
        const author = memberById(c.author_id);
        const isMine = c.author_id === (profile == null ? void 0 : profile.id);
        return /* @__PURE__ */ jsxs("div", { className: "flex gap-2.5 group", children: [
          /* @__PURE__ */ jsx(Avatar, { profile: author, size: "md" }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-2", children: [
              /* @__PURE__ */ jsx("span", { className: "text-xs font-medium text-white", children: (author == null ? void 0 : author.full_name) || "Membre supprimé" }),
              /* @__PURE__ */ jsx("span", { className: "text-[10px] text-gray-500", children: formatDistanceToNow(new Date(c.created_at), { addSuffix: true, locale: fr }) }),
              isMine && /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => handleDelete(c.id),
                  className: "ml-auto text-[10px] text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity",
                  children: "Supprimer"
                }
              )
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-300 whitespace-pre-wrap break-words", children: renderBody(c.body, members) })
          ] })
        ] }, c.id);
      })
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-2", children: [
      /* @__PURE__ */ jsx(
        "textarea",
        {
          ref: textareaRef,
          value: body,
          onChange: (e) => setBody(e.target.value),
          onKeyDown: (e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit(e);
          },
          rows: compact ? 2 : 3,
          placeholder: "Écrire un message… (Cmd+Entrée pour envoyer)",
          className: "w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500 resize-none"
        }
      ),
      error && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-400", children: error }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "submit",
            disabled: sending || !body.trim(),
            className: "px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-medium rounded-lg transition-colors",
            children: sending ? "Envoi…" : "Envoyer"
          }
        ),
        others.map((m) => /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            onClick: () => insertMention(m),
            className: "px-2 py-1 text-xs text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors",
            title: `Mentionner ${m.full_name}`,
            children: [
              "@",
              handle(m)
            ]
          },
          m.id
        ))
      ] })
    ] })
  ] });
}
function SubtaskList({ taskId }) {
  const { profile } = useTeam();
  const [subtasks, setSubtasks] = useState([]);
  const [title, setTitle] = useState("");
  const [error, setError] = useState(null);
  const fetchSubtasks = useCallback(async () => {
    const { data, error: e } = await supabase.from("subtasks").select("*").eq("task_id", taskId).order("position");
    if (e) {
      console.error("Fetch subtasks error:", e);
      return;
    }
    setSubtasks(data || []);
  }, [taskId]);
  useEffect(() => {
    fetchSubtasks();
  }, [fetchSubtasks]);
  const handleAdd = async (e) => {
    e.preventDefault();
    const text = title.trim();
    if (!text) return;
    const position = subtasks.reduce((max, s) => Math.max(max, s.position), -1) + 1;
    const { error: err } = await supabase.from("subtasks").insert({ task_id: taskId, title: text, position });
    if (err) {
      setError("Impossible d'ajouter ce point.");
      return;
    }
    setTitle("");
    setError(null);
    fetchSubtasks();
  };
  const toggle = async (subtask) => {
    const next = !subtask.is_done;
    setSubtasks((prev) => prev.map((s) => s.id === subtask.id ? { ...s, is_done: next } : s));
    const { error: err } = await supabase.from("subtasks").update({
      is_done: next,
      done_at: next ? (/* @__PURE__ */ new Date()).toISOString() : null,
      done_by: next ? (profile == null ? void 0 : profile.id) ?? null : null
    }).eq("id", subtask.id);
    if (err) {
      setError("La mise à jour a échoué.");
      fetchSubtasks();
    }
  };
  const remove = async (id) => {
    setSubtasks((prev) => prev.filter((s) => s.id !== id));
    await supabase.from("subtasks").delete().eq("id", id);
  };
  const done = subtasks.filter((s) => s.is_done).length;
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
      /* @__PURE__ */ jsx("h4", { className: "text-sm font-semibold text-white", children: "Sous-tâches" }),
      subtasks.length > 0 && /* @__PURE__ */ jsxs("span", { className: "text-xs text-gray-500 tabular-nums", children: [
        done,
        "/",
        subtasks.length
      ] })
    ] }),
    subtasks.length > 0 && /* @__PURE__ */ jsx("div", { className: "w-full h-1 bg-gray-800 rounded-full overflow-hidden mb-3", children: /* @__PURE__ */ jsx(
      "div",
      {
        className: "h-full bg-blue-500 rounded-full transition-all",
        style: { width: `${done / subtasks.length * 100}%` }
      }
    ) }),
    /* @__PURE__ */ jsx("div", { className: "space-y-1 mb-2", children: subtasks.map((subtask) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 group", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => toggle(subtask),
          className: `w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${subtask.is_done ? "bg-blue-600 border-blue-600" : "border-gray-600 hover:border-gray-400"}`,
          "aria-label": subtask.is_done ? "Décocher" : "Cocher",
          children: subtask.is_done && /* @__PURE__ */ jsx("svg", { className: "w-3 h-3 text-white", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 3, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M4.5 12.75l6 6 9-13.5" }) })
        }
      ),
      /* @__PURE__ */ jsx("span", { className: `text-sm flex-1 ${subtask.is_done ? "text-gray-500 line-through" : "text-gray-300"}`, children: subtask.title }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => remove(subtask.id),
          className: "text-xs text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity",
          children: "Retirer"
        }
      )
    ] }, subtask.id)) }),
    error && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-400 mb-2", children: error }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleAdd, className: "flex gap-2", children: [
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          value: title,
          onChange: (e) => setTitle(e.target.value),
          placeholder: "Ajouter un point…",
          className: "flex-1 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "submit",
          disabled: !title.trim(),
          className: "px-3 py-1.5 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-gray-300 text-sm rounded-lg transition-colors",
          children: "Ajouter"
        }
      )
    ] })
  ] });
}
const PRIORITIES = [
  { value: "urgent", label: "Urgent", color: "bg-red-500" },
  { value: "high", label: "Haute", color: "bg-orange-500" },
  { value: "medium", label: "Moyenne", color: "bg-yellow-500" },
  { value: "low", label: "Basse", color: "bg-green-500" }
];
function TaskModal({ open, onClose, task, projects, defaultProjectId, defaultAssigneeId, onSave, onDelete }) {
  const { start, stop, running, timer } = useTimer();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [deadline, setDeadline] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [projectId, setProjectId] = useState("");
  const [assigneeId, setAssigneeId] = useState(null);
  const [estimatedHours, setEstimatedHours] = useState("");
  const [kind, setKind] = useState("task");
  const [severity, setSeverity] = useState("major");
  const [steps, setSteps] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => {
    setError(null);
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setPriority(task.priority);
      setDeadline(task.deadline || "");
      setTagsInput((task.tags || []).join(", "));
      setProjectId(task.project_id || "");
      setAssigneeId(task.assignee_id || null);
      setEstimatedHours(task.estimated_hours != null ? String(task.estimated_hours) : "");
      setKind(task.kind || "task");
      setSeverity(task.severity || "major");
      setSteps(task.steps_to_reproduce || "");
    } else {
      setTitle("");
      setDescription("");
      setPriority("medium");
      setDeadline("");
      setTagsInput("");
      setProjectId(defaultProjectId || "");
      setAssigneeId(defaultAssigneeId || null);
      setEstimatedHours("");
      setKind("task");
      setSeverity("major");
      setSteps("");
    }
  }, [task, open, defaultProjectId, defaultAssigneeId]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    setError(null);
    const tags = tagsInput.split(",").map((t) => t.trim()).filter(Boolean);
    try {
      await onSave({
        title: title.trim(),
        description,
        priority,
        deadline,
        tags,
        project_id: projectId || null,
        assignee_id: assigneeId,
        estimated_hours: estimatedHours ? parseFloat(estimatedHours) : null,
        kind,
        severity: kind === "bug" ? severity : null,
        steps_to_reproduce: kind === "bug" ? steps || null : null
      });
      setLoading(false);
      onClose();
    } catch {
      setLoading(false);
      setError("L'enregistrement a échoué. Vérifie ta connexion et réessaie.");
    }
  };
  const inputClass2 = "w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500";
  return /* @__PURE__ */ jsxs(Modal, { open, onClose, title: task ? "Modifier la tâche" : "Nouvelle tâche", maxWidth: "max-w-2xl", children: [
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        ["task", "bug"].map((k) => /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => setKind(k),
            className: `px-3 py-1.5 text-sm rounded-lg transition-colors ${kind === k ? k === "bug" ? "bg-red-600 text-white" : "bg-blue-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white"}`,
            children: k === "bug" ? "Bug" : "Tâche"
          },
          k
        )),
        kind === "bug" && /* @__PURE__ */ jsxs(
          "select",
          {
            value: severity,
            onChange: (e) => setSeverity(e.target.value),
            className: "ml-auto px-3 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded-lg text-gray-300 focus:outline-none focus:border-blue-500",
            children: [
              /* @__PURE__ */ jsx("option", { value: "critical", children: "Bloquant" }),
              /* @__PURE__ */ jsx("option", { value: "major", children: "Majeur" }),
              /* @__PURE__ */ jsx("option", { value: "minor", children: "Mineur" })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Titre" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: title,
            onChange: (e) => setTitle(e.target.value),
            required: true,
            className: inputClass2,
            placeholder: "Ma tâche"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Description" }),
        /* @__PURE__ */ jsx(
          "textarea",
          {
            value: description,
            onChange: (e) => setDescription(e.target.value),
            rows: 3,
            className: `${inputClass2} resize-none`,
            placeholder: "Description optionnelle..."
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsx(AssigneeSelect, { value: assigneeId, onChange: setAssigneeId }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Projet" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: projectId,
              onChange: (e) => setProjectId(e.target.value),
              className: inputClass2,
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "Aucun projet" }),
                projects.map((p) => /* @__PURE__ */ jsx("option", { value: p.id, children: p.name }, p.id))
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Priorité" }),
          /* @__PURE__ */ jsx(
            "select",
            {
              value: priority,
              onChange: (e) => setPriority(e.target.value),
              className: inputClass2,
              children: PRIORITIES.map((p) => /* @__PURE__ */ jsx("option", { value: p.value, children: p.label }, p.value))
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Deadline" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "date",
              value: deadline,
              onChange: (e) => setDeadline(e.target.value),
              className: inputClass2
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Estimation (h)" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              step: "0.25",
              min: "0",
              value: estimatedHours,
              onChange: (e) => setEstimatedHours(e.target.value),
              className: inputClass2,
              placeholder: "4"
            }
          )
        ] })
      ] }),
      kind === "bug" && /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Étapes pour reproduire" }),
        /* @__PURE__ */ jsx(
          "textarea",
          {
            value: steps,
            onChange: (e) => setSteps(e.target.value),
            rows: 3,
            className: `${inputClass2} resize-none`,
            placeholder: "1. Aller sur…\n2. Cliquer sur…\n3. Le bug apparaît"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Tags (séparés par des virgules)" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: tagsInput,
            onChange: (e) => setTagsInput(e.target.value),
            className: inputClass2,
            placeholder: "design, frontend"
          }
        )
      ] }),
      error && /* @__PURE__ */ jsx("p", { className: "text-sm text-red-400", children: error }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 pt-2", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "submit",
            disabled: loading,
            className: "px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors",
            children: loading ? "Enregistrement..." : task ? "Modifier" : "Créer"
          }
        ),
        task && onDelete && /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => {
              onDelete(task.id);
              onClose();
            },
            className: "px-4 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-400 text-sm font-medium rounded-lg transition-colors",
            children: "Supprimer"
          }
        )
      ] })
    ] }),
    task && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("div", { className: "mt-5 pt-5 border-t border-gray-800 flex items-center justify-between gap-3", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-white", children: "Temps passé" }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-500", children: [
            (task.actual_hours || 0).toFixed(2),
            "h enregistrées",
            task.estimated_hours ? ` sur ${task.estimated_hours}h estimées` : ""
          ] })
        ] }),
        running && (timer == null ? void 0 : timer.task_id) === task.id ? /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => stop(),
            className: "px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors",
            children: "Arrêter le chrono"
          }
        ) : /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => start(task),
            className: "px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 text-sm font-medium rounded-lg transition-colors",
            children: "Démarrer le chrono"
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mt-5 pt-5 border-t border-gray-800", children: /* @__PURE__ */ jsx(SubtaskList, { taskId: task.id }) }),
      /* @__PURE__ */ jsxs("div", { className: "mt-5 pt-5 border-t border-gray-800", children: [
        /* @__PURE__ */ jsx("h4", { className: "text-sm font-semibold text-white mb-3", children: "Discussion" }),
        /* @__PURE__ */ jsx(CommentThread, { entityType: "task", entityId: task.id, compact: true })
      ] })
    ] })
  ] });
}
const COLORS = [
  "#3B82F6",
  "#8B5CF6",
  "#EC4899",
  "#EF4444",
  "#F97316",
  "#EAB308",
  "#22C55E",
  "#14B8A6",
  "#06B6D4",
  "#6366F1",
  "#A855F7",
  "#F43F5E"
];
const PROJECT_TYPE_LABELS = {
  landing: "Landing page",
  vitrine: "Site vitrine",
  ecommerce: "E-commerce Shopify",
  custom: "Site sur mesure",
  mobile: "Application mobile",
  maintenance: "Maintenance",
  audit: "Audit SEO / technique",
  other: "Autre"
};
const PROJECT_STATUS_LABELS = {
  briefing: "Briefing",
  design: "Design",
  development: "Développement",
  review: "Recette",
  delivered: "Livré",
  active: "Actif",
  archived: "Archivé"
};
function ProjectModal({ open, onClose, project, clients = [], onSave, onDelete, onArchive }) {
  var _a;
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [clientId, setClientId] = useState(null);
  const { members, memberById } = useTeam();
  const [leadId, setLeadId] = useState(null);
  const [visibility, setVisibility] = useState("private");
  const [projectType, setProjectType] = useState("");
  const [status, setStatus] = useState("active");
  const [budget, setBudget] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  useEffect(() => {
    if (project) {
      setName(project.name);
      setColor(project.color);
      setClientId(project.client_id);
      setLeadId(project.lead_id);
      setVisibility(project.visibility === "team" ? "team" : "private");
      setProjectType(project.project_type || "");
      setStatus(project.status || "active");
      setBudget(project.budget ? String(project.budget) : "");
      setStartDate(project.start_date || "");
      setEndDate(project.end_date || "");
      setDescription(project.description || "");
    } else {
      setName("");
      setColor(COLORS[0]);
      setClientId(null);
      setLeadId(null);
      setVisibility("private");
      setProjectType("");
      setStatus("active");
      setBudget("");
      setStartDate("");
      setEndDate("");
      setDescription("");
    }
    setConfirmDelete(false);
  }, [project, open]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    await onSave({
      name: name.trim(),
      color,
      client_id: clientId,
      lead_id: visibility === "team" ? null : leadId,
      visibility,
      project_type: projectType || null,
      status,
      budget: budget ? parseFloat(budget) : null,
      start_date: startDate || null,
      end_date: endDate || null,
      description: description || null
    });
    setLoading(false);
    onClose();
  };
  const inputClass2 = "w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500";
  return /* @__PURE__ */ jsx(Modal, { open, onClose, title: project ? "Modifier le projet" : "Nouveau projet", maxWidth: "max-w-2xl", children: /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Nom du projet" }),
        /* @__PURE__ */ jsx("input", { type: "text", value: name, onChange: (e) => setName(e.target.value), required: true, className: inputClass2, placeholder: "Mon projet" })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Client associé" }),
        /* @__PURE__ */ jsxs("select", { value: clientId || "", onChange: (e) => setClientId(e.target.value || null), className: inputClass2, children: [
          /* @__PURE__ */ jsx("option", { value: "", children: "-- Aucun client --" }),
          clients.map((c) => /* @__PURE__ */ jsx("option", { value: c.id, children: c.name }, c.id))
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Responsable du projet" }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            value: visibility === "team" ? "__team__" : leadId || "",
            onChange: (e) => {
              if (e.target.value === "__team__") {
                setVisibility("team");
                setLeadId(null);
              } else {
                setVisibility("private");
                setLeadId(e.target.value || null);
              }
            },
            className: inputClass2,
            children: [
              /* @__PURE__ */ jsx("option", { value: "__team__", children: "Équipe (projet partagé)" }),
              /* @__PURE__ */ jsx("option", { value: "", children: "Personne pour l'instant" }),
              members.map((m) => /* @__PURE__ */ jsx("option", { value: m.id, children: m.full_name }, m.id))
            ]
          }
        ),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-1.5", children: visibility === "team" ? "Toute l'équipe voit ce projet, ses tâches, ses devis et ses factures." : leadId ? `Visible de ${((_a = memberById(leadId)) == null ? void 0 : _a.full_name) ?? "son responsable"} seul, avec tout ce qui s'y rattache.` : "Visible de toi seul, avec tout ce qui s'y rattache." })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Type de projet" }),
        /* @__PURE__ */ jsxs("select", { value: projectType, onChange: (e) => setProjectType(e.target.value), className: inputClass2, children: [
          /* @__PURE__ */ jsx("option", { value: "", children: "-- Sélectionner --" }),
          Object.entries(PROJECT_TYPE_LABELS).map(([k, v]) => /* @__PURE__ */ jsx("option", { value: k, children: v }, k))
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-4 gap-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Statut" }),
        /* @__PURE__ */ jsx("select", { value: status, onChange: (e) => setStatus(e.target.value), className: inputClass2, children: Object.entries(PROJECT_STATUS_LABELS).filter(([k]) => k !== "archived").map(([k, v]) => /* @__PURE__ */ jsx("option", { value: k, children: v }, k)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Budget" }),
        /* @__PURE__ */ jsx("input", { type: "number", step: "0.01", value: budget, onChange: (e) => setBudget(e.target.value), className: inputClass2, placeholder: "0.00" })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Date de début" }),
        /* @__PURE__ */ jsx("input", { type: "date", value: startDate, onChange: (e) => setStartDate(e.target.value), className: inputClass2 })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Date de fin" }),
        /* @__PURE__ */ jsx("input", { type: "date", value: endDate, onChange: (e) => setEndDate(e.target.value), className: inputClass2 })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Description" }),
      /* @__PURE__ */ jsx("textarea", { value: description, onChange: (e) => setDescription(e.target.value), rows: 3, className: inputClass2, placeholder: "Description du projet..." })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-2", children: "Couleur" }),
      /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: COLORS.map((c) => /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => setColor(c),
          className: `w-8 h-8 rounded-full transition-all ${color === c ? "ring-2 ring-offset-2 ring-offset-gray-900 ring-white scale-110" : "hover:scale-110"}`,
          style: { backgroundColor: c }
        },
        c
      )) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 pt-2", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "submit",
          disabled: loading,
          className: "px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors",
          children: loading ? "Enregistrement..." : project ? "Modifier" : "Créer"
        }
      ),
      project && onArchive && /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => {
            onArchive(project.id, !project.is_archived);
            onClose();
          },
          className: "px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium rounded-lg transition-colors",
          children: project.is_archived ? "Désarchiver" : "Archiver"
        }
      ),
      project && onDelete && !confirmDelete && /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => setConfirmDelete(true),
          className: "px-4 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-400 text-sm font-medium rounded-lg transition-colors",
          children: "Supprimer"
        }
      )
    ] }),
    project && onDelete && confirmDelete && /* @__PURE__ */ jsxs("div", { className: "p-4 bg-red-500/10 border border-red-500/30 rounded-lg space-y-3", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("p", { className: "text-sm font-medium text-red-300", children: [
          "Supprimer définitivement « ",
          project.name,
          " » ?"
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-400 mt-1", children: "Ses tâches, le temps passé, les fichiers déposés, les deadlines et la recette seront effacés avec lui. Les devis et factures seront conservés, mais détachés du projet. Cette action est irréversible." }),
        onArchive && !project.is_archived && /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-400 mt-2", children: [
          "Si le projet est simplement terminé, préfère ",
          /* @__PURE__ */ jsx("strong", { className: "text-gray-300", children: "Archiver" }),
          " : il disparaît des écrans de travail et son historique reste consultable."
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 flex-wrap", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => {
              onDelete(project.id);
              onClose();
            },
            className: "px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors",
            children: "Oui, supprimer définitivement"
          }
        ),
        onArchive && !project.is_archived && /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => {
              onArchive(project.id, true);
              onClose();
            },
            className: "px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 text-sm font-medium rounded-lg transition-colors",
            children: "Archiver plutôt"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => setConfirmDelete(false),
            className: "px-4 py-2 text-gray-400 hover:text-white text-sm transition-colors",
            children: "Annuler"
          }
        )
      ] })
    ] })
  ] }) });
}
function KanbanPage() {
  const { profile, members } = useTeam();
  const instanceId = useId();
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [filterPriority, setFilterPriority] = useState("");
  const [filterAssignee, setFilterAssignee] = useState("all");
  const [filterKind, setFilterKind] = useState("");
  const [error, setError] = useState(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const fetchProjects = useCallback(async () => {
    const [{ data, error: e }, { data: c }] = await Promise.all([
      supabase.from("projects").select("*").eq("is_archived", false).order("created_at"),
      supabase.from("clients").select("*").order("name")
    ]);
    if (e) setError("Impossible de charger les projets.");
    if (data) setProjects(data);
    if (c) setClients(c);
  }, []);
  const fetchTasks = useCallback(async () => {
    let query = supabase.from("tasks").select("*").order("position");
    if (selectedProjectId) {
      query = query.eq("project_id", selectedProjectId);
    }
    const { data, error: e } = await query;
    if (e) setError("Impossible de charger les tâches.");
    if (data) setTasks(data);
  }, [selectedProjectId]);
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);
  useEffect(() => {
    const channel = supabase.channel(`kanban-tasks-${instanceId}`).on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, () => {
      fetchTasks();
    }).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTasks, instanceId]);
  const filteredTasks = tasks.filter((t) => !filterKind || (t.kind || "task") === filterKind).filter((t) => !filterPriority || t.priority === filterPriority).filter((t) => {
    if (filterAssignee === "all") return true;
    if (filterAssignee === "mine") return t.assignee_id === (profile == null ? void 0 : profile.id);
    if (filterAssignee === "unassigned") return !t.assignee_id;
    return t.assignee_id === filterAssignee;
  });
  const myOpenCount = tasks.filter((t) => t.assignee_id === (profile == null ? void 0 : profile.id) && t.status !== "done").length;
  const handleMoveTask = async (taskId, newStatus, newIndex) => {
    const previous = tasks;
    setTasks(
      (prev) => prev.map(
        (t) => t.id === taskId ? { ...t, status: newStatus, position: newIndex, completed_at: newStatus === "done" ? (/* @__PURE__ */ new Date()).toISOString() : null } : t
      )
    );
    const { error: e } = await supabase.rpc("move_task", {
      p_task_id: taskId,
      p_status: newStatus,
      p_position: newIndex
    });
    if (e) {
      setError("Le déplacement n'a pas été enregistré.");
      setTasks(previous);
      return;
    }
    fetchTasks();
  };
  const handleSaveTask = async (data) => {
    const payload = {
      title: data.title,
      description: data.description || null,
      priority: data.priority,
      deadline: data.deadline || null,
      tags: data.tags,
      project_id: data.project_id,
      assignee_id: data.assignee_id,
      estimated_hours: data.estimated_hours,
      kind: data.kind,
      severity: data.severity,
      steps_to_reproduce: data.steps_to_reproduce
    };
    if (editingTask) {
      const { error: e } = await supabase.from("tasks").update(payload).eq("id", editingTask.id);
      if (e) {
        setError("La tâche n'a pas pu être modifiée.");
        throw e;
      }
    } else {
      const maxPos = tasks.filter((t) => t.status === "todo").reduce((max, t) => Math.max(max, t.position ?? 0), -1);
      const { error: e } = await supabase.from("tasks").insert({
        ...payload,
        status: "todo",
        position: maxPos + 1
      });
      if (e) {
        setError("La tâche n'a pas pu être créée.");
        throw e;
      }
    }
    setError(null);
    setEditingTask(null);
    fetchTasks();
  };
  const handleDeleteTask = async (id) => {
    const { error: e } = await supabase.from("tasks").delete().eq("id", id);
    if (e) setError("La tâche n'a pas pu être supprimée.");
    setEditingTask(null);
    fetchTasks();
  };
  const handleSaveProject = async (data) => {
    if (editingProject) {
      const { error: e } = await supabase.from("projects").update(data).eq("id", editingProject.id);
      if (e) setError("Le projet n'a pas pu être modifié.");
    } else {
      const { data: created, error: e } = await supabase.from("projects").insert(data).select("id").single();
      if (e) setError("Le projet n'a pas pu être créé.");
      else if (created) await supabase.rpc("seed_content_requests", { p_project: created.id });
    }
    setEditingProject(null);
    fetchProjects();
  };
  const handleDeleteProject = async (id) => {
    const { error: e } = await supabase.from("projects").delete().eq("id", id);
    if (e) setError("Le projet n'a pas pu être supprimé.");
    if (selectedProjectId === id) setSelectedProjectId(null);
    setEditingProject(null);
    fetchProjects();
    fetchTasks();
  };
  const handleArchiveProject = async (id, archived) => {
    const { error: e } = await supabase.from("projects").update({ is_archived: archived }).eq("id", id);
    if (e) setError("Le projet n'a pas pu être archivé.");
    if (archived && selectedProjectId === id) setSelectedProjectId(null);
    fetchProjects();
  };
  const selectClass = "px-3 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded-lg text-gray-300 focus:outline-none focus:border-blue-500";
  return /* @__PURE__ */ jsxs("div", { className: "p-4 sm:p-6 h-[calc(100vh-4rem)]", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4 gap-3 flex-wrap", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setSelectedProjectId(null),
            className: `px-3 py-1.5 text-sm rounded-lg transition-colors ${!selectedProjectId ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white"}`,
            children: "Tous"
          }
        ),
        projects.map((p) => /* @__PURE__ */ jsxs(
          "div",
          {
            className: `flex items-center rounded-lg transition-colors ${selectedProjectId === p.id ? "" : "bg-gray-800"}`,
            style: selectedProjectId === p.id ? { backgroundColor: p.color + "20" } : {},
            children: [
              /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: () => setSelectedProjectId(p.id),
                  className: `pl-3 pr-2 py-1.5 text-sm flex items-center gap-1.5 ${selectedProjectId === p.id ? "" : "text-gray-400 hover:text-white"}`,
                  style: selectedProjectId === p.id ? { color: p.color } : {},
                  children: [
                    /* @__PURE__ */ jsx("span", { className: "w-2 h-2 rounded-full", style: { backgroundColor: p.color } }),
                    p.name,
                    p.visibility === "team" && /* @__PURE__ */ jsx("span", { className: "text-[9px] text-blue-400", title: "Projet partagé", children: "·" })
                  ]
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => {
                    setEditingProject(p);
                    setProjectModalOpen(true);
                  },
                  title: `Modifier, archiver ou supprimer ${p.name}`,
                  "aria-label": `Modifier ${p.name}`,
                  className: "pr-2.5 pl-1 py-1.5 text-gray-500 hover:text-white transition-colors",
                  children: /* @__PURE__ */ jsx("svg", { className: "w-3.5 h-3.5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" }) })
                }
              )
            ]
          },
          p.id
        )),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => {
              setEditingProject(null);
              setProjectModalOpen(true);
            },
            className: "px-2.5 py-1.5 text-sm rounded-lg bg-gray-800 text-gray-400 hover:text-white transition-colors",
            title: "Nouveau projet",
            children: "+"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 flex-wrap", children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setFilterAssignee(filterAssignee === "mine" ? "all" : "mine"),
            className: `flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors ${filterAssignee === "mine" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white"}`,
            children: [
              /* @__PURE__ */ jsx(Avatar, { profile, size: "xs" }),
              "Mes tâches",
              /* @__PURE__ */ jsx("span", { className: `text-xs px-1.5 rounded-full ${filterAssignee === "mine" ? "bg-blue-700" : "bg-gray-700"}`, children: myOpenCount })
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "select",
          {
            value: filterAssignee === "mine" ? "all" : filterAssignee,
            onChange: (e) => setFilterAssignee(e.target.value),
            className: selectClass,
            children: [
              /* @__PURE__ */ jsx("option", { value: "all", children: "Toute l'équipe" }),
              /* @__PURE__ */ jsx("option", { value: "unassigned", children: "Non assignées" }),
              members.map((m) => /* @__PURE__ */ jsx("option", { value: m.id, children: m.full_name }, m.id))
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "select",
          {
            value: filterKind,
            onChange: (e) => setFilterKind(e.target.value),
            className: selectClass,
            children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "Tâches et bugs" }),
              /* @__PURE__ */ jsx("option", { value: "task", children: "Tâches seules" }),
              /* @__PURE__ */ jsx("option", { value: "bug", children: "Bugs seuls" })
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "select",
          {
            value: filterPriority,
            onChange: (e) => setFilterPriority(e.target.value),
            className: selectClass,
            children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "Toutes priorités" }),
              /* @__PURE__ */ jsx("option", { value: "urgent", children: "Urgent" }),
              /* @__PURE__ */ jsx("option", { value: "high", children: "Haute" }),
              /* @__PURE__ */ jsx("option", { value: "medium", children: "Moyenne" }),
              /* @__PURE__ */ jsx("option", { value: "low", children: "Basse" })
            ]
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => {
              setEditingTask(null);
              setTaskModalOpen(true);
            },
            className: "px-4 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors",
            children: "+ Nouvelle tâche"
          }
        )
      ] })
    ] }),
    error && /* @__PURE__ */ jsxs("div", { className: "mb-3 flex items-center justify-between gap-3 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg", children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm text-red-400", children: error }),
      /* @__PURE__ */ jsx("button", { onClick: () => setError(null), className: "text-xs text-red-400 hover:text-red-300", children: "Fermer" })
    ] }),
    /* @__PURE__ */ jsx(
      KanbanBoard,
      {
        tasks: filteredTasks,
        projects,
        members,
        onMoveTask: handleMoveTask,
        onClickTask: (task) => {
          setEditingTask(task);
          setTaskModalOpen(true);
        }
      }
    ),
    /* @__PURE__ */ jsx(
      TaskModal,
      {
        open: taskModalOpen,
        onClose: () => {
          setTaskModalOpen(false);
          setEditingTask(null);
        },
        task: editingTask,
        projects,
        defaultProjectId: selectedProjectId,
        defaultAssigneeId: filterAssignee === "mine" ? (profile == null ? void 0 : profile.id) ?? null : null,
        onSave: handleSaveTask,
        onDelete: handleDeleteTask
      }
    ),
    /* @__PURE__ */ jsx(
      ProjectModal,
      {
        open: projectModalOpen,
        onClose: () => {
          setProjectModalOpen(false);
          setEditingProject(null);
        },
        project: editingProject,
        clients,
        onSave: handleSaveProject,
        onDelete: handleDeleteProject,
        onArchive: handleArchiveProject
      }
    )
  ] });
}
function CalendarView({
  currentDate,
  viewMode,
  tasks,
  events,
  milestones = [],
  projects,
  onChangeDate,
  onChangeViewMode,
  onClickDay,
  onClickEvent
}) {
  const projectMap = Object.fromEntries(projects.map((p) => [p.id, p]));
  const items = [
    ...tasks.filter((t) => t.deadline).map((t) => {
      var _a;
      return {
        id: t.id,
        title: t.title,
        date: parseISO(t.deadline),
        type: "task",
        color: ((_a = projectMap[t.project_id || ""]) == null ? void 0 : _a.color) || "#6B7280",
        allDay: true
      };
    }),
    ...milestones.map((m) => ({
      id: m.id,
      title: "◆ " + m.title,
      date: parseISO(m.due_date),
      type: "milestone",
      color: m.status === "reached" ? "#22C55E" : m.status === "missed" ? "#EF4444" : "#F59E0B",
      allDay: true
    })),
    ...events.map((e) => {
      var _a;
      return {
        id: e.id,
        title: e.title,
        date: new Date(e.start_time),
        type: "event",
        color: ((_a = projectMap[e.project_id || ""]) == null ? void 0 : _a.color) || "#6B7280",
        allDay: e.all_day,
        time: e.all_day ? void 0 : format(new Date(e.start_time), "HH:mm")
      };
    })
  ];
  let days;
  if (viewMode === "month") {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const start = startOfWeek(monthStart, { weekStartsOn: 1 });
    const end = endOfWeek(monthEnd, { weekStartsOn: 1 });
    days = eachDayOfInterval({ start, end });
  } else {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
    days = eachDayOfInterval({ start: weekStart, end: weekEnd });
  }
  const navigate = (dir) => {
    if (viewMode === "month") {
      onChangeDate(dir > 0 ? addMonths(currentDate, 1) : subMonths(currentDate, 1));
    } else {
      onChangeDate(dir > 0 ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1));
    }
  };
  const goToday = () => onChangeDate(/* @__PURE__ */ new Date());
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col h-full", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
      /* @__PURE__ */ jsx("div", { className: "flex items-center gap-3", children: /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-white capitalize", children: viewMode === "month" ? format(currentDate, "MMMM yyyy", { locale: fr }) : `Semaine du ${format(days[0], "d MMM", { locale: fr })} au ${format(days[6], "d MMM yyyy", { locale: fr })}` }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("button", { onClick: goToday, className: "px-3 py-1.5 text-sm bg-gray-800 text-gray-300 hover:text-white rounded-lg transition-colors", children: "Aujourd'hui" }),
        /* @__PURE__ */ jsx("button", { onClick: () => navigate(-1), className: "p-1.5 bg-gray-800 text-gray-400 hover:text-white rounded-lg transition-colors", children: /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M15 19l-7-7 7-7" }) }) }),
        /* @__PURE__ */ jsx("button", { onClick: () => navigate(1), className: "p-1.5 bg-gray-800 text-gray-400 hover:text-white rounded-lg transition-colors", children: /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M9 5l7 7-7 7" }) }) }),
        /* @__PURE__ */ jsxs("div", { className: "ml-2 flex bg-gray-800 rounded-lg overflow-hidden", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => onChangeViewMode("week"),
              className: `px-3 py-1.5 text-sm transition-colors ${viewMode === "week" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"}`,
              children: "Semaine"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => onChangeViewMode("month"),
              className: `px-3 py-1.5 text-sm transition-colors ${viewMode === "month" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"}`,
              children: "Mois"
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-7 mb-1", children: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((d) => /* @__PURE__ */ jsx("div", { className: "text-center text-xs font-medium text-gray-500 py-2", children: d }, d)) }),
    /* @__PURE__ */ jsx("div", { className: `grid grid-cols-7 flex-1 ${viewMode === "week" ? "grid-rows-1" : ""} gap-px bg-gray-800 rounded-lg overflow-hidden`, children: days.map((day) => {
      const dayItems = items.filter((item) => isSameDay(startOfDay(item.date), startOfDay(day)));
      const inMonth = viewMode === "month" ? isSameMonth(day, currentDate) : true;
      const today = isToday(day);
      return /* @__PURE__ */ jsxs(
        "div",
        {
          onClick: () => onClickDay(day),
          className: `bg-gray-900 p-1.5 cursor-pointer hover:bg-gray-800/80 transition-colors ${viewMode === "week" ? "min-h-[calc(100vh-16rem)]" : "min-h-[100px]"} ${!inMonth ? "opacity-40" : ""}`,
          children: [
            /* @__PURE__ */ jsx("span", { className: `inline-flex items-center justify-center w-6 h-6 text-xs rounded-full mb-1 ${today ? "bg-blue-600 text-white font-bold" : "text-gray-400"}`, children: format(day, "d") }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-0.5", children: [
              dayItems.slice(0, viewMode === "week" ? 20 : 3).map((item) => /* @__PURE__ */ jsxs(
                "div",
                {
                  onClick: (e) => {
                    e.stopPropagation();
                    if (item.type === "event") {
                      const ev = events.find((ev2) => ev2.id === item.id);
                      if (ev) onClickEvent(ev);
                    }
                  },
                  className: "flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] truncate cursor-pointer hover:opacity-80",
                  style: { backgroundColor: item.color + "20", color: item.color },
                  children: [
                    item.time && /* @__PURE__ */ jsx("span", { className: "font-medium", children: item.time }),
                    /* @__PURE__ */ jsx("span", { className: item.type === "task" ? "italic" : "", children: item.title })
                  ]
                },
                item.id
              )),
              dayItems.length > (viewMode === "week" ? 20 : 3) && /* @__PURE__ */ jsxs("span", { className: "text-[10px] text-gray-500 pl-1", children: [
                "+",
                dayItems.length - (viewMode === "week" ? 20 : 3),
                " autres"
              ] })
            ] })
          ]
        },
        day.toISOString()
      );
    }) })
  ] });
}
function EventModal({ open, onClose, event, projects, defaultDate, onSave, onDelete }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("10:00");
  const [allDay, setAllDay] = useState(false);
  const [projectId, setProjectId] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (event) {
      const start = new Date(event.start_time);
      setTitle(event.title);
      setDescription(event.description || "");
      setStartDate(start.toISOString().split("T")[0]);
      setStartTime(start.toTimeString().slice(0, 5));
      if (event.end_time) {
        const end = new Date(event.end_time);
        setEndDate(end.toISOString().split("T")[0]);
        setEndTime(end.toTimeString().slice(0, 5));
      }
      setAllDay(event.all_day);
      setProjectId(event.project_id || "");
    } else {
      const d = defaultDate || (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      setTitle("");
      setDescription("");
      setStartDate(d);
      setStartTime("09:00");
      setEndDate(d);
      setEndTime("10:00");
      setAllDay(false);
      setProjectId("");
    }
  }, [event, open, defaultDate]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    const start_time = allDay ? `${startDate}T00:00:00` : `${startDate}T${startTime}:00`;
    const end_time = allDay ? `${endDate || startDate}T23:59:59` : `${endDate || startDate}T${endTime}:00`;
    await onSave({
      title: title.trim(),
      description,
      start_time,
      end_time,
      all_day: allDay,
      project_id: projectId || null
    });
    setLoading(false);
    onClose();
  };
  return /* @__PURE__ */ jsx(Modal, { open, onClose, title: event ? "Modifier l'événement" : "Nouvel événement", children: /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Titre" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          value: title,
          onChange: (e) => setTitle(e.target.value),
          required: true,
          className: "w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500",
          placeholder: "Rendez-vous, call..."
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Projet (optionnel)" }),
      /* @__PURE__ */ jsxs(
        "select",
        {
          value: projectId,
          onChange: (e) => setProjectId(e.target.value),
          className: "w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500",
          children: [
            /* @__PURE__ */ jsx("option", { value: "", children: "Aucun projet" }),
            projects.map((p) => /* @__PURE__ */ jsx("option", { value: p.id, children: p.name }, p.id))
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "checkbox",
          id: "allDay",
          checked: allDay,
          onChange: (e) => setAllDay(e.target.checked),
          className: "rounded bg-gray-800 border-gray-700"
        }
      ),
      /* @__PURE__ */ jsx("label", { htmlFor: "allDay", className: "text-sm text-gray-400", children: "Toute la journée" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Date de début" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "date",
            value: startDate,
            onChange: (e) => setStartDate(e.target.value),
            required: true,
            className: "w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
          }
        )
      ] }),
      !allDay && /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Heure de début" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "time",
            value: startTime,
            onChange: (e) => setStartTime(e.target.value),
            className: "w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Date de fin" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "date",
            value: endDate,
            onChange: (e) => setEndDate(e.target.value),
            className: "w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
          }
        )
      ] }),
      !allDay && /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Heure de fin" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "time",
            value: endTime,
            onChange: (e) => setEndTime(e.target.value),
            className: "w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Description" }),
      /* @__PURE__ */ jsx(
        "textarea",
        {
          value: description,
          onChange: (e) => setDescription(e.target.value),
          rows: 2,
          className: "w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none",
          placeholder: "Notes..."
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 pt-2", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "submit",
          disabled: loading,
          className: "px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors",
          children: loading ? "Enregistrement..." : event ? "Modifier" : "Créer"
        }
      ),
      event && onDelete && /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => {
            onDelete(event.id);
            onClose();
          },
          className: "px-4 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-400 text-sm font-medium rounded-lg transition-colors",
          children: "Supprimer"
        }
      )
    ] })
  ] }) });
}
function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(/* @__PURE__ */ new Date());
  const [viewMode, setViewMode] = useState("month");
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [projects, setProjects] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const fetchAll = useCallback(async () => {
    const [{ data: p }, { data: t }, { data: e }, { data: m }] = await Promise.all([
      supabase.from("projects").select("*").eq("is_archived", false).order("created_at"),
      supabase.from("tasks").select("*").not("deadline", "is", null),
      supabase.from("events").select("*").order("start_time"),
      supabase.from("milestones").select("*").order("due_date")
    ]);
    if (p) setProjects(p);
    if (t) setTasks(t);
    if (e) setEvents(e);
    if (m) setMilestones(m);
  }, []);
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);
  const handleSaveEvent = async (data) => {
    if (editingEvent) {
      await supabase.from("events").update({
        title: data.title,
        description: data.description || null,
        start_time: data.start_time,
        end_time: data.end_time,
        all_day: data.all_day,
        project_id: data.project_id
      }).eq("id", editingEvent.id);
    } else {
      await supabase.from("events").insert({
        title: data.title,
        description: data.description || null,
        start_time: data.start_time,
        end_time: data.end_time,
        all_day: data.all_day,
        project_id: data.project_id
      });
    }
    setEditingEvent(null);
    fetchAll();
  };
  const handleDeleteEvent = async (id) => {
    await supabase.from("events").delete().eq("id", id);
    setEditingEvent(null);
    fetchAll();
  };
  const handleClickDay = (date) => {
    setSelectedDate(format(date, "yyyy-MM-dd"));
    setEditingEvent(null);
    setEventModalOpen(true);
  };
  const handleClickEvent = (event) => {
    setEditingEvent(event);
    setEventModalOpen(true);
  };
  const today = format(/* @__PURE__ */ new Date(), "yyyy-MM-dd");
  const todayTasks = tasks.filter((t) => t.deadline === today && t.status !== "done");
  return /* @__PURE__ */ jsxs("div", { className: "p-4 sm:p-6 min-h-[calc(100vh-4rem)] flex flex-col lg:flex-row gap-4 lg:gap-6", children: [
    /* @__PURE__ */ jsx("div", { className: "flex-1 flex flex-col", children: /* @__PURE__ */ jsx(
      CalendarView,
      {
        currentDate,
        viewMode,
        tasks,
        events,
        milestones,
        projects,
        onChangeDate: setCurrentDate,
        onChangeViewMode: setViewMode,
        onClickDay: handleClickDay,
        onClickEvent: handleClickEvent
      }
    ) }),
    /* @__PURE__ */ jsxs("div", { className: "w-full lg:w-72 flex-shrink-0", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-gray-900 rounded-xl border border-gray-800 p-4", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-white mb-3", children: "Aujourd'hui" }),
        todayTasks.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: "Aucune tâche pour aujourd'hui" }) : /* @__PURE__ */ jsx("div", { className: "space-y-2", children: todayTasks.map((task) => {
          const project = projects.find((p) => p.id === task.project_id);
          return /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2 p-2 bg-gray-800 rounded-lg", children: [
            /* @__PURE__ */ jsx("div", { className: "w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0", style: { backgroundColor: (project == null ? void 0 : project.color) || "#6B7280" } }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs font-medium text-white", children: task.title }),
              project && /* @__PURE__ */ jsx("p", { className: "text-[10px] text-gray-500", children: project.name })
            ] })
          ] }, task.id);
        }) })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => {
            setEditingEvent(null);
            setSelectedDate(today);
            setEventModalOpen(true);
          },
          className: "mt-3 w-full px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors",
          children: "+ Nouvel événement"
        }
      )
    ] }),
    /* @__PURE__ */ jsx(
      EventModal,
      {
        open: eventModalOpen,
        onClose: () => {
          setEventModalOpen(false);
          setEditingEvent(null);
        },
        event: editingEvent,
        projects,
        defaultDate: selectedDate,
        onSave: handleSaveEvent,
        onDelete: handleDeleteEvent
      }
    )
  ] });
}
const STATUSES = [
  { value: "new_lead", label: "Nouveau lead" },
  { value: "contacted", label: "Contacté" },
  { value: "qualified", label: "Qualifié" },
  { value: "active", label: "Client actif" },
  { value: "completed", label: "Terminé" }
];
const SOURCES = [
  { value: "facebook", label: "Facebook Ads" },
  { value: "website", label: "Site web" },
  { value: "referral", label: "Recommandation" },
  { value: "manual", label: "Ajout manuel" },
  { value: "other", label: "Autre" }
];
function ClientModal({ open, onClose, client, projects, onSave, onDelete }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneSecondary, setPhoneSecondary] = useState("");
  const [source, setSource] = useState("manual");
  const [status, setStatus] = useState("new_lead");
  const [notes, setNotes] = useState("");
  const [projectId, setProjectId] = useState("");
  const [nextFollowUp, setNextFollowUp] = useState("");
  const [loading, setLoading] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [address, setAddress] = useState("");
  const [siren, setSiren] = useState("");
  const [legalForm, setLegalForm] = useState("");
  const [shareCapital, setShareCapital] = useState("");
  const [representative, setRepresentative] = useState("");
  const [tradeName, setTradeName] = useState("");
  const [rcs, setRcs] = useState("");
  const [vatNumber, setVatNumber] = useState("");
  const [contactName, setContactName] = useState("");
  useEffect(() => {
    if (client) {
      setName(client.name);
      setEmail(client.email || "");
      setPhone(client.phone || "");
      setPhoneSecondary(client.phone_secondary || "");
      setSource(client.source);
      setStatus(client.status);
      setNotes(client.notes || "");
      setProjectId(client.project_id || "");
      setNextFollowUp(client.next_follow_up_at ? client.next_follow_up_at.slice(0, 16) : "");
      setAddress(client.address || "");
      setSiren(client.siren || "");
      setLegalForm(client.legal_form || "");
      setShareCapital(client.share_capital || "");
      setRepresentative(client.representative || "");
      setTradeName(client.trade_name || "");
      setRcs(client.rcs || "");
      setVatNumber(client.vat_number || "");
      setContactName(client.contact_name || "");
    } else {
      setName("");
      setEmail("");
      setPhone("");
      setPhoneSecondary("");
      setSource("manual");
      setStatus("new_lead");
      setNotes("");
      setProjectId("");
      setNextFollowUp("");
      setAddress("");
      setSiren("");
      setLegalForm("");
      setShareCapital("");
      setRepresentative("");
      setTradeName("");
      setRcs("");
      setVatNumber("");
      setContactName("");
    }
    setPhoneError("");
  }, [client, open]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    const trimmedPhone = phone.trim();
    if (trimmedPhone && !isValidPhone(trimmedPhone)) {
      setPhoneError("Numéro de téléphone invalide");
      return;
    }
    const trimmedPhone2 = phoneSecondary.trim();
    if (trimmedPhone2 && !isValidPhone(trimmedPhone2)) {
      setPhoneError("Numéro secondaire invalide");
      return;
    }
    setPhoneError("");
    setLoading(true);
    await onSave({
      name: name.trim(),
      address: address.trim() || null,
      siren: siren.trim() || null,
      legal_form: legalForm.trim() || null,
      share_capital: shareCapital.trim() || null,
      representative: representative.trim() || null,
      trade_name: tradeName.trim() || null,
      rcs: rcs.trim() || null,
      vat_number: vatNumber.trim() || null,
      contact_name: contactName.trim() || null,
      email: email.trim() || null,
      phone: trimmedPhone ? toE164(trimmedPhone) : null,
      phone_secondary: trimmedPhone2 ? toE164(trimmedPhone2) : null,
      source,
      status,
      notes: notes.trim() || null,
      project_id: projectId || null,
      next_follow_up_at: nextFollowUp || null
    });
    setLoading(false);
    onClose();
  };
  return /* @__PURE__ */ jsx(Modal, { open, onClose, title: client ? "Modifier" : "Nouveau lead / client", children: /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Nom" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          value: name,
          onChange: (e) => setName(e.target.value),
          required: true,
          className: "w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500",
          placeholder: "Nom complet"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Email" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "email",
            value: email,
            onChange: (e) => setEmail(e.target.value),
            className: "w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500",
            placeholder: "client@example.com"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Téléphone" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "tel",
            value: phone,
            onChange: (e) => setPhone(e.target.value),
            className: "w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500",
            placeholder: "06 12 34 56 78"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Téléphone secondaire" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "tel",
            value: phoneSecondary,
            onChange: (e) => setPhoneSecondary(e.target.value),
            className: "w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500",
            placeholder: "07 98 76 54 32"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Prochaine relance" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "datetime-local",
            value: nextFollowUp,
            onChange: (e) => setNextFollowUp(e.target.value),
            className: "w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
          }
        )
      ] })
    ] }),
    phoneError && /* @__PURE__ */ jsx("p", { className: "text-sm text-red-400", children: phoneError }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Source" }),
        /* @__PURE__ */ jsx(
          "select",
          {
            value: source,
            onChange: (e) => setSource(e.target.value),
            className: "w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500",
            children: SOURCES.map((s) => /* @__PURE__ */ jsx("option", { value: s.value, children: s.label }, s.value))
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Statut" }),
        /* @__PURE__ */ jsx(
          "select",
          {
            value: status,
            onChange: (e) => setStatus(e.target.value),
            className: "w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500",
            children: STATUSES.map((s) => /* @__PURE__ */ jsx("option", { value: s.value, children: s.label }, s.value))
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Projet associé" }),
      /* @__PURE__ */ jsxs(
        "select",
        {
          value: projectId,
          onChange: (e) => setProjectId(e.target.value),
          className: "w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500",
          children: [
            /* @__PURE__ */ jsx("option", { value: "", children: "Aucun" }),
            projects.map((p) => /* @__PURE__ */ jsx("option", { value: p.id, children: p.name }, p.id))
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("details", { className: "border border-gray-800 rounded-lg", children: [
      /* @__PURE__ */ jsx("summary", { className: "px-3 py-2 text-sm text-gray-300 cursor-pointer hover:text-white select-none", children: "Mentions pour les devis et factures" }),
      /* @__PURE__ */ jsxs("div", { className: "p-3 pt-1 space-y-3", children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: "Ces informations figurent sur les documents adressés à ce client. Laisse vide ce qui ne s'applique pas." }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Adresse" }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              value: address,
              onChange: (e) => setAddress(e.target.value),
              rows: 2,
              className: "w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none",
              placeholder: "50 rue Marcelin Berthelot\n93700 Drancy, France"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Enseigne" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: tradeName,
                onChange: (e) => setTradeName(e.target.value),
                className: "w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500",
                placeholder: "Nom commercial, affiché entre parenthèses"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "SIREN ou SIRET" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: siren,
                onChange: (e) => setSiren(e.target.value),
                className: "w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500",
                placeholder: "999 147 937"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Forme juridique" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: legalForm,
                onChange: (e) => setLegalForm(e.target.value),
                className: "w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500",
                placeholder: "SARL, SAS, association…"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Capital social" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: shareCapital,
                onChange: (e) => setShareCapital(e.target.value),
                className: "w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500",
                placeholder: "1 000 €"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "RCS" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: rcs,
                onChange: (e) => setRcs(e.target.value),
                className: "w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500",
                placeholder: "RCS Paris 884 345 828"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "TVA intracommunautaire" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: vatNumber,
                onChange: (e) => setVatNumber(e.target.value),
                className: "w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500",
                placeholder: "FR12345678901"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Interlocuteur" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: contactName,
                onChange: (e) => setContactName(e.target.value),
                className: "w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500",
                placeholder: "S'il diffère du représentant"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Représenté par" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: representative,
                onChange: (e) => setRepresentative(e.target.value),
                className: "w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500",
                placeholder: "Prénom Nom"
              }
            )
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Notes" }),
      /* @__PURE__ */ jsx(
        "textarea",
        {
          value: notes,
          onChange: (e) => setNotes(e.target.value),
          rows: 2,
          className: "w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none",
          placeholder: "Notes..."
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 pt-2", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "submit",
          disabled: loading,
          className: "px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors",
          children: loading ? "Enregistrement..." : client ? "Modifier" : "Créer"
        }
      ),
      client && onDelete && /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => {
            onDelete(client.id);
            onClose();
          },
          className: "px-4 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-400 text-sm font-medium rounded-lg transition-colors",
          children: "Supprimer"
        }
      )
    ] })
  ] }) });
}
function ErrorBanner({ message, onDismiss }) {
  if (!message) return null;
  return /* @__PURE__ */ jsxs("div", { className: "mb-4 flex items-start justify-between gap-3 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg", children: [
    /* @__PURE__ */ jsx("p", { className: "text-sm text-red-400", children: message }),
    onDismiss && /* @__PURE__ */ jsx("button", { onClick: onDismiss, className: "text-xs text-red-400 hover:text-red-300 flex-shrink-0", children: "Fermer" })
  ] });
}
function SmsComposer({ open, onClose, client, onSent }) {
  var _a;
  const [mode, setMode] = useState("template");
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [freeText, setFreeText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (open) {
      supabase.from("sms_templates").select("*").eq("is_active", true).then(({ data }) => {
        if (data) setTemplates(data);
      });
      setError("");
      setFreeText("");
      setSelectedTemplateId("");
    }
  }, [open]);
  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);
  const prenom = ((_a = client.name) == null ? void 0 : _a.split(" ")[0]) || "";
  const variables = { prenom, entreprise: "" };
  const preview = selectedTemplate ? parseTemplate(selectedTemplate.body, variables) : "";
  const charCount = mode === "libre" ? freeText.length : preview.length;
  const smsSegments = Math.ceil(charCount / 160) || 1;
  const handleSend = async () => {
    setError("");
    setLoading(true);
    try {
      if (mode === "template" && selectedTemplateId) {
        await sendSms({ clientId: client.id, templateId: selectedTemplateId });
      } else if (mode === "libre" && freeText.trim()) {
        await sendSms({ clientId: client.id, body: freeText.trim() });
      } else {
        setError("Veuillez écrire un message ou sélectionner un template.");
        setLoading(false);
        return;
      }
      setLoading(false);
      onSent();
      onClose();
    } catch (e) {
      setLoading(false);
      setError(e instanceof Error ? e.message : "Erreur lors de l'envoi");
    }
  };
  return /* @__PURE__ */ jsx(Modal, { open, onClose, title: `SMS · ${client.name}`, children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex gap-1 bg-gray-800 rounded-lg p-1", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setMode("template"),
          className: `flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${mode === "template" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"}`,
          children: "Template"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setMode("libre"),
          className: `flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${mode === "libre" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"}`,
          children: "Message libre"
        }
      )
    ] }),
    mode === "template" ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Choisir un template" }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            value: selectedTemplateId,
            onChange: (e) => setSelectedTemplateId(e.target.value),
            className: "w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500",
            children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "Sélectionner..." }),
              templates.map((t) => /* @__PURE__ */ jsxs("option", { value: t.id, children: [
                t.name,
                " (",
                t.category,
                ")"
              ] }, t.id))
            ]
          }
        )
      ] }),
      selectedTemplate && /* @__PURE__ */ jsxs("div", { className: "p-3 bg-gray-800 border border-gray-700 rounded-lg", children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mb-1", children: "Prévisualisation" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-200", children: preview })
      ] })
    ] }) : /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(
      "textarea",
      {
        value: freeText,
        onChange: (e) => setFreeText(e.target.value),
        rows: 4,
        className: "w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none",
        placeholder: "Votre message..."
      }
    ) }),
    /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-500", children: [
      charCount,
      " caractères · ",
      smsSegments,
      " segment",
      smsSegments > 1 ? "s" : "",
      " SMS"
    ] }),
    /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-500", children: [
      "Destinataire : ",
      /* @__PURE__ */ jsx("span", { className: "text-gray-300", children: client.phone || "Pas de numéro" })
    ] }),
    error && /* @__PURE__ */ jsx("p", { className: "text-sm text-red-400 bg-red-500/10 px-3 py-2 rounded-lg", children: error }),
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: handleSend,
        disabled: loading || !client.phone,
        className: "w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors",
        children: loading ? "Envoi en cours..." : "Envoyer le SMS"
      }
    )
  ] }) });
}
const STATUS_BADGE$8 = {
  new_lead: { label: "Nouveau lead", bg: "bg-blue-500/20", text: "text-blue-400" },
  contacted: { label: "Contacté", bg: "bg-purple-500/20", text: "text-purple-400" },
  qualified: { label: "Qualifié", bg: "bg-yellow-500/20", text: "text-yellow-400" },
  active: { label: "Client actif", bg: "bg-green-500/20", text: "text-green-400" },
  completed: { label: "Terminé", bg: "bg-gray-500/20", text: "text-gray-400" }
};
const SOURCE_LABEL = {
  facebook: "Facebook Ads",
  website: "Site web",
  referral: "Recommandation",
  manual: "Manuel",
  other: "Autre"
};
function ClientsPage() {
  const navigate = useNavigate();
  const { makeCall } = useTwilio();
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterSource, setFilterSource] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [smsClient, setSmsClient] = useState(null);
  const [error, setError] = useState(null);
  const fetchAll = useCallback(async () => {
    const [{ data: c, error: ce }, { data: p }] = await Promise.all([
      supabase.from("clients").select("*").order("created_at", { ascending: false }),
      supabase.from("projects").select("*").eq("is_archived", false).order("name")
    ]);
    if (ce) setError("Impossible de charger les clients.");
    if (c) setClients(c);
    if (p) setProjects(p);
  }, []);
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const filtered = clients.filter((c) => {
    if (!filterStatus) return true;
    if (filterStatus === "follow_up") {
      return c.next_follow_up_at && c.next_follow_up_at.slice(0, 10) <= today;
    }
    return c.status === filterStatus;
  }).filter((c) => !filterSource || c.source === filterSource);
  const handleSave = async (data) => {
    if (editingClient) {
      const { error: error2 } = await supabase.from("clients").update(data).eq("id", editingClient.id);
      if (error2) setError("Le client n'a pas pu être modifié.");
    } else {
      const { error: error2 } = await supabase.from("clients").insert(data);
      if (error2) setError("Le client n'a pas pu être créé.");
    }
    setEditingClient(null);
    fetchAll();
  };
  const handleDelete = async (id) => {
    const { error: error2 } = await supabase.from("clients").delete().eq("id", id);
    if (error2) setError("Le client n'a pas pu être supprimé.");
    setEditingClient(null);
    fetchAll();
  };
  const newLeads = clients.filter((c) => c.status === "new_lead").length;
  const activeClients = clients.filter((c) => c.status === "active").length;
  const fromFacebook = clients.filter((c) => c.source === "facebook").length;
  const conversionRate = clients.length > 0 ? Math.round(clients.filter((c) => c.status === "active" || c.status === "completed").length / clients.length * 100) : 0;
  return /* @__PURE__ */ jsxs("div", { className: "p-4 sm:p-6", children: [
    /* @__PURE__ */ jsx(ErrorBanner, { message: error, onDismiss: () => setError(null) }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-gray-900 border border-gray-800 rounded-xl p-4", children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 uppercase tracking-wider mb-1", children: "Nouveaux leads" }),
        /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-blue-400", children: newLeads })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-gray-900 border border-gray-800 rounded-xl p-4", children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 uppercase tracking-wider mb-1", children: "Clients actifs" }),
        /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-green-400", children: activeClients })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-gray-900 border border-gray-800 rounded-xl p-4", children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 uppercase tracking-wider mb-1", children: "Via Facebook" }),
        /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-indigo-400", children: fromFacebook })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-gray-900 border border-gray-800 rounded-xl p-4", children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 uppercase tracking-wider mb-1", children: "Taux de conversion" }),
        /* @__PURE__ */ jsxs("p", { className: "text-2xl font-bold text-white", children: [
          conversionRate,
          "%"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex gap-1 mb-6 bg-gray-900 border border-gray-800 rounded-xl p-3 overflow-x-auto", children: Object.entries(STATUS_BADGE$8).map(([key, val]) => {
      const count = clients.filter((c) => c.status === key).length;
      return /* @__PURE__ */ jsxs("div", { className: "flex-1 text-center", children: [
        /* @__PURE__ */ jsx("div", { className: `text-xs font-medium ${val.text} mb-1`, children: val.label }),
        /* @__PURE__ */ jsx("div", { className: `text-lg font-bold text-white`, children: count }),
        /* @__PURE__ */ jsx("div", { className: `h-1 rounded-full mt-1 ${val.bg}`, children: /* @__PURE__ */ jsx(
          "div",
          {
            className: `h-full rounded-full transition-all ${val.bg.replace("/20", "")}`,
            style: { width: clients.length > 0 ? `${count / clients.length * 100}%` : "0%" }
          }
        ) })
      ] }, key);
    }) }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 w-full sm:w-auto", children: [
        /* @__PURE__ */ jsxs(
          "select",
          {
            value: filterStatus,
            onChange: (e) => setFilterStatus(e.target.value),
            className: "px-3 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded-lg text-gray-300 focus:outline-none focus:border-blue-500",
            children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "Tous les statuts" }),
              /* @__PURE__ */ jsx("option", { value: "follow_up", children: "A relancer" }),
              /* @__PURE__ */ jsx("option", { value: "new_lead", children: "Nouveau lead" }),
              /* @__PURE__ */ jsx("option", { value: "contacted", children: "Contacté" }),
              /* @__PURE__ */ jsx("option", { value: "qualified", children: "Qualifié" }),
              /* @__PURE__ */ jsx("option", { value: "active", children: "Client actif" }),
              /* @__PURE__ */ jsx("option", { value: "completed", children: "Terminé" })
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "select",
          {
            value: filterSource,
            onChange: (e) => setFilterSource(e.target.value),
            className: "px-3 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded-lg text-gray-300 focus:outline-none focus:border-blue-500",
            children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "Toutes sources" }),
              /* @__PURE__ */ jsx("option", { value: "facebook", children: "Facebook Ads" }),
              /* @__PURE__ */ jsx("option", { value: "website", children: "Site web" }),
              /* @__PURE__ */ jsx("option", { value: "referral", children: "Recommandation" }),
              /* @__PURE__ */ jsx("option", { value: "manual", children: "Manuel" }),
              /* @__PURE__ */ jsx("option", { value: "other", children: "Autre" })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => {
            setEditingClient(null);
            setModalOpen(true);
          },
          className: "px-4 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors",
          children: "+ Nouveau lead / client"
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "bg-gray-900 border border-gray-800 rounded-xl overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[700px]", children: [
      /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-800", children: [
        /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Nom" }),
        /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Contact" }),
        /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell", children: "Dernier contact" }),
        /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell", children: "Source" }),
        /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell", children: "Projet" }),
        /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Statut" }),
        /* @__PURE__ */ jsx("th", { className: "text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-gray-800", children: filtered.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 7, className: "px-4 py-8 text-center text-sm text-gray-500", children: "Aucun lead / client" }) }) : filtered.map((client) => {
        const project = projects.find((p) => p.id === client.project_id);
        const badge = STATUS_BADGE$8[client.status];
        const followUpToday = client.next_follow_up_at && client.next_follow_up_at.slice(0, 10) === today;
        const followUpOverdue = client.next_follow_up_at && client.next_follow_up_at.slice(0, 10) < today;
        return /* @__PURE__ */ jsxs("tr", { className: "hover:bg-gray-800/50 transition-colors", children: [
          /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            (followUpToday || followUpOverdue) && /* @__PURE__ */ jsx("div", { className: `w-2 h-2 rounded-full shrink-0 ${followUpOverdue ? "bg-red-500" : "bg-amber-500"}`, title: followUpOverdue ? "Relance en retard" : "Relance aujourd'hui" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => navigate(`/dashboard/clients/${client.id}`),
                  className: "text-sm font-medium text-white hover:text-blue-400 transition-colors text-left",
                  children: client.name
                }
              ),
              client.notes && /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-0.5 truncate max-w-xs", children: client.notes })
            ] })
          ] }) }),
          /* @__PURE__ */ jsxs("td", { className: "px-4 py-3", children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-400", children: client.email || "-" }),
            client.phone && /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: client.phone })
          ] }),
          /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-sm text-gray-400 hidden md:table-cell", children: client.last_contacted_at ? formatDistanceToNow(new Date(client.last_contacted_at), { addSuffix: true, locale: fr }) : "-" }),
          /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-sm text-gray-400 hidden lg:table-cell", children: SOURCE_LABEL[client.source] || client.source }),
          /* @__PURE__ */ jsx("td", { className: "px-4 py-3 hidden lg:table-cell", children: project ? /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsx("div", { className: "w-2 h-2 rounded-full", style: { backgroundColor: project.color } }),
            /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-300", children: project.name })
          ] }) : /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-500", children: "Aucun" }) }),
          /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsx("span", { className: `inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${badge.bg} ${badge.text}`, children: badge.label }) }),
          /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-1", children: [
            client.phone && /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => makeCall(toE164(client.phone)),
                  className: "p-1.5 text-gray-400 hover:text-green-400 transition-colors rounded-lg hover:bg-green-500/10",
                  title: "Appeler",
                  children: /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" }) })
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => setSmsClient(client),
                  className: "p-1.5 text-gray-400 hover:text-blue-400 transition-colors rounded-lg hover:bg-blue-500/10",
                  title: "Envoyer un SMS",
                  children: /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" }) })
                }
              )
            ] }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => {
                  setEditingClient(client);
                  setModalOpen(true);
                },
                className: "p-1.5 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-700",
                title: "Modifier",
                children: /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" }) })
              }
            )
          ] }) })
        ] }, client.id);
      }) })
    ] }) }),
    /* @__PURE__ */ jsx(
      ClientModal,
      {
        open: modalOpen,
        onClose: () => {
          setModalOpen(false);
          setEditingClient(null);
        },
        client: editingClient,
        projects,
        onSave: handleSave,
        onDelete: handleDelete
      }
    ),
    smsClient && /* @__PURE__ */ jsx(
      SmsComposer,
      {
        open: !!smsClient,
        onClose: () => setSmsClient(null),
        client: smsClient,
        onSent: fetchAll
      }
    )
  ] });
}
function LeadTimeline({ clientId }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function fetchTimeline() {
      const [{ data: calls }, { data: smsMessages }] = await Promise.all([
        supabase.from("calls").select("*").eq("client_id", clientId),
        supabase.from("sms").select("*").eq("client_id", clientId)
      ]);
      const timeline = [];
      if (calls) {
        for (const call of calls) {
          const isMissed = call.status === "no_answer" || call.status === "failed";
          const duration = call.duration ? `${Math.floor(call.duration / 60)}min ${call.duration % 60}s` : "";
          timeline.push({
            type: "call",
            id: call.id,
            timestamp: call.called_at,
            summary: call.direction === "outbound" ? isMissed ? "Appel sortant · Pas de réponse" : `Appel sortant · ${duration}` : `Appel entrant · ${duration || "Manqué"}`,
            data: call
          });
        }
      }
      if (smsMessages) {
        for (const sms of smsMessages) {
          const preview = sms.body.length > 60 ? sms.body.slice(0, 60) + "..." : sms.body;
          timeline.push({
            type: "sms",
            id: sms.id,
            timestamp: sms.sent_at,
            summary: sms.direction === "outbound" ? `SMS envoyé · ${preview}` : `SMS reçu · ${preview}`,
            data: sms
          });
        }
      }
      timeline.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setEvents(timeline);
      setLoading(false);
    }
    fetchTimeline();
  }, [clientId]);
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center py-8", children: /* @__PURE__ */ jsx("div", { className: "w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" }) });
  }
  if (events.length === 0) {
    return /* @__PURE__ */ jsx("div", { className: "text-center py-8", children: /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: "Aucune interaction enregistrée" }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "relative pl-6", children: [
    /* @__PURE__ */ jsx("div", { className: "absolute left-[7px] top-2 bottom-2 w-px border-l-2 border-dashed border-gray-700" }),
    /* @__PURE__ */ jsx("div", { className: "space-y-4", children: events.map((event) => /* @__PURE__ */ jsxs("div", { className: "relative flex items-start gap-3", children: [
      /* @__PURE__ */ jsx(
        "div",
        {
          className: `absolute left-[-17px] top-1.5 w-3 h-3 rounded-full border-2 ${event.type === "call" ? "bg-green-500 border-green-400" : "bg-blue-500 border-blue-400"}`
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          event.type === "call" ? /* @__PURE__ */ jsx("svg", { className: "w-4 h-4 text-green-400 shrink-0", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" }) }) : /* @__PURE__ */ jsx("svg", { className: "w-4 h-4 text-blue-400 shrink-0", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" }) }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-200", children: event.summary })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-0.5", children: formatDistanceToNow(new Date(event.timestamp), { addSuffix: true, locale: fr }) })
      ] })
    ] }, event.id)) })
  ] });
}
const STATUS_BADGE$7 = {
  initiated: { label: "Initié", color: "bg-gray-500/20 text-gray-400" },
  ringing: { label: "Sonnerie", color: "bg-blue-500/20 text-blue-400" },
  in_progress: { label: "En cours", color: "bg-green-500/20 text-green-400" },
  completed: { label: "Terminé", color: "bg-green-500/20 text-green-400" },
  no_answer: { label: "Pas de réponse", color: "bg-amber-500/20 text-amber-400" },
  busy: { label: "Occupé", color: "bg-amber-500/20 text-amber-400" },
  failed: { label: "Échoué", color: "bg-red-500/20 text-red-400" },
  canceled: { label: "Annulé", color: "bg-gray-500/20 text-gray-400" }
};
function formatDuration(seconds) {
  if (!seconds) return "Non décroché";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m > 0) return `${m}min ${s}s`;
  return `${s}s`;
}
function CallHistory({ clientId, clientPhone }) {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const { makeCall } = useTwilio();
  useEffect(() => {
    supabase.from("calls").select("*").eq("client_id", clientId).order("called_at", { ascending: false }).then(({ data, error }) => {
      if (error) console.error("Fetch calls error:", error);
      if (data) setCalls(data);
      setLoading(false);
    });
  }, [clientId]);
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center py-8", children: /* @__PURE__ */ jsx("div", { className: "w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" }) });
  }
  if (calls.length === 0) {
    return /* @__PURE__ */ jsx("div", { className: "text-center py-8", children: /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: "Aucun appel enregistré" }) });
  }
  return /* @__PURE__ */ jsx("div", { className: "space-y-2", children: calls.map((call) => {
    const badge = STATUS_BADGE$7[call.status];
    const isExpanded = expandedId === call.id;
    const isMissed = call.status === "no_answer" || call.status === "failed";
    return /* @__PURE__ */ jsxs("div", { className: "bg-gray-800/50 border border-gray-700/50 rounded-lg", children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setExpandedId(isExpanded ? null : call.id),
          className: "w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-gray-800 transition-colors rounded-lg",
          children: [
            /* @__PURE__ */ jsx("span", { className: "text-lg", children: call.direction === "outbound" ? isMissed ? /* @__PURE__ */ jsx("span", { className: "text-red-400", title: "Sortant manqué", children: "↗" }) : /* @__PURE__ */ jsx("span", { className: "text-green-400", title: "Sortant", children: "↗" }) : /* @__PURE__ */ jsx("span", { className: "text-blue-400", title: "Entrant", children: "↙" }) }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm text-white", children: formatDuration(call.duration) }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: formatDistanceToNow(new Date(call.called_at), { addSuffix: true, locale: fr }) })
            ] }),
            /* @__PURE__ */ jsx("span", { className: `inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${badge.color}`, children: badge.label }),
            /* @__PURE__ */ jsx(
              "svg",
              {
                className: `w-4 h-4 text-gray-500 transition-transform ${isExpanded ? "rotate-180" : ""}`,
                fill: "none",
                viewBox: "0 0 24 24",
                stroke: "currentColor",
                strokeWidth: 2,
                children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M19.5 8.25l-7.5 7.5-7.5-7.5" })
              }
            )
          ]
        }
      ),
      isExpanded && /* @__PURE__ */ jsxs("div", { className: "px-4 pb-3 pt-1 border-t border-gray-700/50 space-y-2", children: [
        call.call_note && /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mb-0.5", children: "Notes" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-300", children: call.call_note })
        ] }),
        call.recording_url && /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mb-1", children: "Enregistrement" }),
          /* @__PURE__ */ jsx("audio", { controls: true, className: "w-full h-8", src: call.recording_url, children: /* @__PURE__ */ jsx("track", { kind: "captions" }) })
        ] }),
        clientPhone && /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => makeCall(clientPhone),
            className: "inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600/10 hover:bg-green-600/20 text-green-400 text-xs font-medium rounded-lg transition-colors",
            children: [
              /* @__PURE__ */ jsx("svg", { className: "w-3.5 h-3.5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" }) }),
              "Rappeler (",
              formatPhone(clientPhone),
              ")"
            ]
          }
        )
      ] })
    ] }, call.id);
  }) });
}
function StatusIcon({ status }) {
  if (status === "delivered") return /* @__PURE__ */ jsx("span", { className: "text-green-400 text-xs", title: "Délivré", children: "✓✓" });
  if (status === "sent") return /* @__PURE__ */ jsx("span", { className: "text-gray-400 text-xs", title: "Envoyé", children: "✓" });
  if (status === "failed") return /* @__PURE__ */ jsx("span", { className: "text-red-400 text-xs", title: "Échoué", children: "✗" });
  if (status === "queued") return /* @__PURE__ */ jsx("span", { className: "text-gray-500 text-xs", title: "En attente", children: "⌛" });
  return null;
}
function SmsThread({ clientId }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);
  const fetchMessages = async () => {
    const { data, error } = await supabase.from("sms").select("*").eq("client_id", clientId).order("sent_at", { ascending: true });
    if (error) console.error("Fetch SMS error:", error);
    if (data) setMessages(data);
    setLoading(false);
  };
  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3e4);
    return () => clearInterval(interval);
  }, [clientId]);
  useEffect(() => {
    var _a;
    (_a = bottomRef.current) == null ? void 0 : _a.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center py-8", children: /* @__PURE__ */ jsx("div", { className: "w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" }) });
  }
  if (messages.length === 0) {
    return /* @__PURE__ */ jsx("div", { className: "text-center py-8", children: /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: "Aucun SMS échangé" }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-3 max-h-96 overflow-y-auto pr-1", children: [
    messages.map((msg) => {
      const isOutbound = msg.direction === "outbound";
      return /* @__PURE__ */ jsx(
        "div",
        {
          className: `flex ${isOutbound ? "justify-end" : "justify-start"}`,
          children: /* @__PURE__ */ jsxs(
            "div",
            {
              className: `max-w-[80%] px-3 py-2 rounded-xl ${isOutbound ? "bg-blue-600 text-white rounded-br-sm" : "bg-gray-700 text-gray-200 rounded-bl-sm"}`,
              children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm whitespace-pre-wrap", children: msg.body }),
                /* @__PURE__ */ jsxs("div", { className: `flex items-center gap-1.5 mt-1 ${isOutbound ? "justify-end" : "justify-start"}`, children: [
                  /* @__PURE__ */ jsx("span", { className: "text-[10px] opacity-60", children: formatDistanceToNow(new Date(msg.sent_at), { addSuffix: true, locale: fr }) }),
                  isOutbound && /* @__PURE__ */ jsx(StatusIcon, { status: msg.status })
                ] })
              ]
            }
          )
        },
        msg.id
      );
    }),
    /* @__PURE__ */ jsx("div", { ref: bottomRef })
  ] });
}
const STATUS_BADGE$6 = {
  new_lead: { label: "Nouveau lead", bg: "bg-blue-500/20", text: "text-blue-400" },
  contacted: { label: "Contacté", bg: "bg-purple-500/20", text: "text-purple-400" },
  qualified: { label: "Qualifié", bg: "bg-yellow-500/20", text: "text-yellow-400" },
  active: { label: "Client actif", bg: "bg-green-500/20", text: "text-green-400" },
  completed: { label: "Terminé", bg: "bg-gray-500/20", text: "text-gray-400" }
};
const QUOTE_STATUS_BADGE = {
  draft: { label: "Brouillon", bg: "bg-gray-500/20", text: "text-gray-400" },
  sent: { label: "Envoyé", bg: "bg-blue-500/20", text: "text-blue-400" },
  accepted: { label: "Accepté", bg: "bg-green-500/20", text: "text-green-400" },
  rejected: { label: "Refusé", bg: "bg-red-500/20", text: "text-red-400" },
  expired: { label: "Expiré", bg: "bg-amber-500/20", text: "text-amber-400" }
};
const INVOICE_STATUS_BADGE = {
  draft: { label: "Brouillon", bg: "bg-gray-500/20", text: "text-gray-400" },
  sent: { label: "Envoyée", bg: "bg-blue-500/20", text: "text-blue-400" },
  paid: { label: "Payée", bg: "bg-green-500/20", text: "text-green-400" },
  partial: { label: "Partielle", bg: "bg-amber-500/20", text: "text-amber-400" },
  overdue: { label: "En retard", bg: "bg-red-500/20", text: "text-red-400" },
  cancelled: { label: "Annulée", bg: "bg-gray-500/20", text: "text-gray-400" }
};
const PROPOSAL_STATUS_BADGE = {
  draft: { label: "Brouillon", bg: "bg-gray-500/20", text: "text-gray-400" },
  sent: { label: "Envoyé", bg: "bg-blue-500/20", text: "text-blue-400" },
  accepted: { label: "Accepté", bg: "bg-green-500/20", text: "text-green-400" },
  rejected: { label: "Refusé", bg: "bg-red-500/20", text: "text-red-400" }
};
function ClientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { makeCall } = useTwilio();
  const [client, setClient] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("infos");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [smsModalOpen, setSmsModalOpen] = useState(false);
  const [followUpDate, setFollowUpDate] = useState("");
  const [quotes, setQuotes] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [proposals, setProposals] = useState([]);
  const fetchClient = useCallback(async () => {
    if (!id) return;
    const [{ data: c, error }, { data: p }, { data: q }, { data: inv }, { data: prop }] = await Promise.all([
      supabase.from("clients").select("*").eq("id", id).single(),
      supabase.from("projects").select("*").eq("is_archived", false).order("name"),
      supabase.from("quotes").select("*").eq("client_id", id).order("created_at", { ascending: false }),
      supabase.from("invoices").select("*").eq("client_id", id).order("created_at", { ascending: false }),
      supabase.from("proposals").select("*").eq("client_id", id).order("created_at", { ascending: false })
    ]);
    if (error) console.error("Fetch client error:", error);
    if (c) {
      setClient(c);
      setFollowUpDate(c.next_follow_up_at ? c.next_follow_up_at.slice(0, 16) : "");
    }
    if (p) setProjects(p);
    if (q) setQuotes(q);
    if (inv) setInvoices(inv);
    if (prop) setProposals(prop);
    setLoading(false);
  }, [id]);
  useEffect(() => {
    fetchClient();
  }, [fetchClient]);
  const handleSaveClient = async (data) => {
    if (!client) return;
    const { error } = await supabase.from("clients").update(data).eq("id", client.id);
    if (error) console.error("Update client error:", error);
    fetchClient();
  };
  const handleDeleteClient = async (clientId) => {
    const { error } = await supabase.from("clients").delete().eq("id", clientId);
    if (error) console.error("Delete client error:", error);
    navigate("/dashboard/clients");
  };
  const handleCall = () => {
    if (client == null ? void 0 : client.phone) {
      makeCall(toE164(client.phone));
    }
  };
  const handleFollowUpChange = async (value) => {
    setFollowUpDate(value);
    if (client) {
      await supabase.from("clients").update({ next_follow_up_at: value || null }).eq("id", client.id);
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "p-8 flex items-center justify-center", children: /* @__PURE__ */ jsx("div", { className: "w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" }) });
  }
  if (!client) {
    return /* @__PURE__ */ jsxs("div", { className: "p-8 text-center", children: [
      /* @__PURE__ */ jsx("p", { className: "text-gray-500", children: "Client introuvable" }),
      /* @__PURE__ */ jsx("button", { onClick: () => navigate("/dashboard/clients"), className: "text-blue-400 text-sm mt-2 hover:underline", children: "Retour aux leads" })
    ] });
  }
  const badge = STATUS_BADGE$6[client.status];
  const project = projects.find((p) => p.id === client.project_id);
  const tabs = [
    { key: "infos", label: "Infos" },
    { key: "proposals", label: `Propositions (${proposals.length})` },
    { key: "quotes", label: `Devis (${quotes.length})` },
    { key: "invoices", label: `Factures (${invoices.length})` },
    { key: "discussion", label: "Discussion" },
    { key: "timeline", label: "Timeline" },
    { key: "calls", label: `Appels (${client.call_count || 0})` },
    { key: "sms", label: `SMS (${client.sms_count || 0})` }
  ];
  return /* @__PURE__ */ jsxs("div", { className: "p-4 sm:p-6", children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => navigate("/dashboard/clients"),
        className: "flex items-center gap-1 text-sm text-gray-400 hover:text-white mb-4 transition-colors",
        children: [
          /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M15.75 19.5L8.25 12l7.5-7.5" }) }),
          "Retour aux leads"
        ]
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row items-start justify-between gap-4 mb-6", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-white", children: client.name }),
          /* @__PURE__ */ jsx("span", { className: `inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full ${badge.bg} ${badge.text}`, children: badge.label })
        ] }),
        project && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 mt-1", children: [
          /* @__PURE__ */ jsx("div", { className: "w-2 h-2 rounded-full", style: { backgroundColor: project.color } }),
          /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-400", children: project.name })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: handleCall,
            disabled: !client.phone,
            className: "flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors",
            children: [
              /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" }) }),
              "Appeler"
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setSmsModalOpen(true),
            disabled: !client.phone,
            className: "flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors",
            children: [
              /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" }) }),
              "SMS"
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsx("label", { className: "block text-xs text-gray-500 mb-1", children: "Prochaine relance" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "datetime-local",
            value: followUpDate,
            onChange: (e) => handleFollowUpChange(e.target.value),
            className: "px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
          }
        )
      ] }),
      client.last_contacted_at && /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: "Dernier contact" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-300", children: format(new Date(client.last_contacted_at), "d MMM yyyy HH:mm", { locale: fr }) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 mb-6 overflow-x-auto", children: tabs.map((t) => /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => setTab(t.key),
        className: `flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${tab === t.key ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white hover:bg-gray-800"}`,
        children: t.label
      },
      t.key
    )) }),
    /* @__PURE__ */ jsxs("div", { className: "bg-gray-900 border border-gray-800 rounded-xl p-6", children: [
      tab === "infos" && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mb-0.5", children: "Email" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-white", children: client.email || "-" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mb-0.5", children: "Téléphone" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-white", children: formatPhone(client.phone) })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mb-0.5", children: "Téléphone secondaire" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-white", children: formatPhone(client.phone_secondary) })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mb-0.5", children: "Source" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-white capitalize", children: client.source })
          ] })
        ] }),
        client.notes && /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mb-0.5", children: "Notes" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-300 whitespace-pre-wrap", children: client.notes })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "pt-2", children: /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setEditModalOpen(true),
            className: "px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors",
            children: "Modifier les infos"
          }
        ) })
      ] }),
      tab === "proposals" && /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsx("button", { onClick: () => navigate("/dashboard/proposals/new"), className: "px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors", children: "+ Créer une proposition" }) }),
        proposals.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 text-center py-4", children: "Aucune proposition" }) : /* @__PURE__ */ jsx("div", { className: "space-y-2", children: proposals.map((prop) => {
          const badge2 = PROPOSAL_STATUS_BADGE[prop.status];
          return /* @__PURE__ */ jsxs("button", { onClick: () => navigate(`/dashboard/proposals/${prop.id}`), className: "w-full flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors text-left", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-white", children: prop.title }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: format(new Date(prop.created_at), "dd/MM/yyyy", { locale: fr }) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              prop.estimated_amount && /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-300", children: formatCurrency(prop.estimated_amount) }),
              /* @__PURE__ */ jsx("span", { className: `px-2 py-0.5 text-xs font-medium rounded-full ${badge2.bg} ${badge2.text}`, children: badge2.label })
            ] })
          ] }, prop.id);
        }) })
      ] }),
      tab === "quotes" && /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsx("button", { onClick: () => navigate("/dashboard/quotes/new"), className: "px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors", children: "+ Créer un devis" }) }),
        quotes.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 text-center py-4", children: "Aucun devis" }) : /* @__PURE__ */ jsx("div", { className: "space-y-2", children: quotes.map((q) => {
          const badge2 = QUOTE_STATUS_BADGE[q.status];
          return /* @__PURE__ */ jsxs("button", { onClick: () => navigate(`/dashboard/quotes/${q.id}`), className: "w-full flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors text-left", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("p", { className: "text-sm font-medium text-white", children: [
                q.quote_number,
                " · ",
                q.title
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: format(new Date(q.created_at), "dd/MM/yyyy", { locale: fr }) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-300", children: formatCurrency(q.total_amount) }),
              /* @__PURE__ */ jsx("span", { className: `px-2 py-0.5 text-xs font-medium rounded-full ${badge2.bg} ${badge2.text}`, children: badge2.label })
            ] })
          ] }, q.id);
        }) })
      ] }),
      tab === "invoices" && /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsx("button", { onClick: () => navigate("/dashboard/invoices/new"), className: "px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors", children: "+ Créer une facture" }) }),
        invoices.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 text-center py-4", children: "Aucune facture" }) : /* @__PURE__ */ jsx("div", { className: "space-y-2", children: invoices.map((inv) => {
          const badge2 = INVOICE_STATUS_BADGE[inv.status];
          return /* @__PURE__ */ jsxs("button", { onClick: () => navigate(`/dashboard/invoices/${inv.id}`), className: "w-full flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors text-left", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("p", { className: "text-sm font-medium text-white", children: [
                inv.invoice_number,
                " · ",
                inv.title
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: format(new Date(inv.created_at), "dd/MM/yyyy", { locale: fr }) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-300", children: formatCurrency(inv.total_amount) }),
              inv.paid_amount > 0 && inv.paid_amount < inv.total_amount && /* @__PURE__ */ jsxs("span", { className: "text-xs text-amber-400", children: [
                "Payé: ",
                formatCurrency(inv.paid_amount)
              ] }),
              /* @__PURE__ */ jsx("span", { className: `px-2 py-0.5 text-xs font-medium rounded-full ${badge2.bg} ${badge2.text}`, children: badge2.label })
            ] })
          ] }, inv.id);
        }) })
      ] }),
      tab === "discussion" && /* @__PURE__ */ jsx(CommentThread, { entityType: "client", entityId: client.id, compact: true }),
      tab === "timeline" && /* @__PURE__ */ jsx(LeadTimeline, { clientId: client.id }),
      tab === "calls" && /* @__PURE__ */ jsx(CallHistory, { clientId: client.id, clientPhone: client.phone }),
      tab === "sms" && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsx(SmsThread, { clientId: client.id }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setSmsModalOpen(true),
            disabled: !client.phone,
            className: "w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors",
            children: "Envoyer un SMS"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx(
      ClientModal,
      {
        open: editModalOpen,
        onClose: () => setEditModalOpen(false),
        client,
        projects,
        onSave: handleSaveClient,
        onDelete: handleDeleteClient
      }
    ),
    client && /* @__PURE__ */ jsx(
      SmsComposer,
      {
        open: smsModalOpen,
        onClose: () => setSmsModalOpen(false),
        client,
        onSent: fetchClient
      }
    )
  ] });
}
const CATEGORIES$2 = [
  { value: "relance", label: "Relance" },
  { value: "confirmation", label: "Confirmation" },
  { value: "custom", label: "Personnalisé" }
];
function SmsTemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("relance");
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const fetchTemplates = useCallback(async () => {
    const { data, error } = await supabase.from("sms_templates").select("*").order("category").order("name");
    if (error) console.error("Fetch templates error:", error);
    if (data) setTemplates(data);
  }, []);
  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);
  const openNew = () => {
    setEditing(null);
    setName("");
    setBody("");
    setCategory("relance");
    setIsActive(true);
    setModalOpen(true);
  };
  const openEdit = (t) => {
    setEditing(t);
    setName(t.name);
    setBody(t.body);
    setCategory(t.category);
    setIsActive(t.is_active);
    setModalOpen(true);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !body.trim()) return;
    setSaving(true);
    const data = {
      name: name.trim(),
      body: body.trim(),
      category,
      is_active: isActive
    };
    if (editing) {
      const { error } = await supabase.from("sms_templates").update(data).eq("id", editing.id);
      if (error) console.error("Update template error:", error);
    } else {
      const { error } = await supabase.from("sms_templates").insert(data);
      if (error) console.error("Insert template error:", error);
    }
    setSaving(false);
    setModalOpen(false);
    fetchTemplates();
  };
  const handleDelete = async (id) => {
    const { error } = await supabase.from("sms_templates").delete().eq("id", id);
    if (error) console.error("Delete template error:", error);
    fetchTemplates();
  };
  const toggleActive = async (t) => {
    const { error } = await supabase.from("sms_templates").update({ is_active: !t.is_active }).eq("id", t.id);
    if (error) console.error("Toggle template error:", error);
    fetchTemplates();
  };
  return /* @__PURE__ */ jsxs("div", { className: "p-4 sm:p-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-6", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-white", children: "Templates SMS" }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: openNew,
          className: "px-4 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors",
          children: "+ Nouveau template"
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mb-4 p-3 bg-gray-800/50 border border-gray-700/50 rounded-lg", children: /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-400", children: [
      "Variables disponibles : ",
      /* @__PURE__ */ jsx("code", { className: "text-blue-400", children: "{{prenom}}" }),
      ", ",
      /* @__PURE__ */ jsx("code", { className: "text-blue-400", children: "{{entreprise}}" }),
      ", ",
      /* @__PURE__ */ jsx("code", { className: "text-blue-400", children: "{{date}}" }),
      ", ",
      /* @__PURE__ */ jsx("code", { className: "text-blue-400", children: "{{heure}}" })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "bg-gray-900 border border-gray-800 rounded-xl overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full", children: [
      /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-800", children: [
        /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Nom" }),
        /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Catégorie" }),
        /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Aperçu" }),
        /* @__PURE__ */ jsx("th", { className: "text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Actif" }),
        /* @__PURE__ */ jsx("th", { className: "text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-gray-800", children: templates.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 5, className: "px-4 py-8 text-center text-sm text-gray-500", children: "Aucun template" }) }) : templates.map((t) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-gray-800/50 transition-colors", children: [
        /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-sm font-medium text-white", children: t.name }),
        /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsx("span", { className: "inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-gray-700 text-gray-300 capitalize", children: t.category }) }),
        /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-sm text-gray-400 max-w-xs truncate", children: t.body }),
        /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-center", children: /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => toggleActive(t),
            className: `w-8 h-4 rounded-full transition-colors relative ${t.is_active ? "bg-green-500" : "bg-gray-600"}`,
            children: /* @__PURE__ */ jsx(
              "div",
              {
                className: `absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${t.is_active ? "translate-x-4" : "translate-x-0.5"}`
              }
            )
          }
        ) }),
        /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-right", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-2", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => openEdit(t),
              className: "text-sm text-gray-400 hover:text-white transition-colors",
              children: "Modifier"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => handleDelete(t.id),
              className: "text-sm text-red-400 hover:text-red-300 transition-colors",
              children: "Supprimer"
            }
          )
        ] }) })
      ] }, t.id)) })
    ] }) }) }),
    /* @__PURE__ */ jsx(
      Modal,
      {
        open: modalOpen,
        onClose: () => setModalOpen(false),
        title: editing ? "Modifier le template" : "Nouveau template",
        children: /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Nom" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: name,
                onChange: (e) => setName(e.target.value),
                required: true,
                className: "w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500",
                placeholder: "relance_j0"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Catégorie" }),
            /* @__PURE__ */ jsx(
              "select",
              {
                value: category,
                onChange: (e) => setCategory(e.target.value),
                className: "w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500",
                children: CATEGORIES$2.map((c) => /* @__PURE__ */ jsx("option", { value: c.value, children: c.label }, c.value))
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Contenu du SMS" }),
            /* @__PURE__ */ jsx(
              "textarea",
              {
                value: body,
                onChange: (e) => setBody(e.target.value),
                required: true,
                rows: 4,
                className: "w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none",
                placeholder: "Bonjour {{prenom}}, ..."
              }
            ),
            /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-500 mt-1", children: [
              body.length,
              " caractères"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "checkbox",
                checked: isActive,
                onChange: (e) => setIsActive(e.target.checked),
                id: "templateActive",
                className: "rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500"
              }
            ),
            /* @__PURE__ */ jsx("label", { htmlFor: "templateActive", className: "text-sm text-gray-400", children: "Actif" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex items-center gap-3 pt-2", children: /* @__PURE__ */ jsx(
            "button",
            {
              type: "submit",
              disabled: saving,
              className: "px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors",
              children: saving ? "Enregistrement..." : editing ? "Modifier" : "Créer"
            }
          ) })
        ] })
      }
    )
  ] });
}
function parseAmount(raw) {
  const cleaned = raw.replace(/[€$\s ]/g, "").trim();
  if (!cleaned || !/\d/.test(cleaned)) return null;
  const lastComma = cleaned.lastIndexOf(",");
  const lastDot = cleaned.lastIndexOf(".");
  let normalised = cleaned;
  if (lastComma > -1 && lastDot > -1) {
    normalised = lastComma > lastDot ? cleaned.replace(/\./g, "").replace(",", ".") : cleaned.replace(/,/g, "");
  } else if (lastComma > -1) {
    const decimals = cleaned.length - lastComma - 1;
    normalised = decimals <= 2 ? cleaned.replace(",", ".") : cleaned.replace(/,/g, "");
  } else if (lastDot > -1) {
    if (/^\d{1,3}(\.\d{3})+$/.test(cleaned)) normalised = cleaned.replace(/\./g, "");
  }
  const value = Number(normalised);
  return Number.isFinite(value) ? value : null;
}
const AMOUNT = /(\d[\d\s .,]*\d|\d)\s*(?:€|EUR)?/g;
function amountsIn(line) {
  const found = [];
  for (const match of line.matchAll(AMOUNT)) {
    const value = parseAmount(match[1]);
    if (value !== null) found.push(value);
  }
  return found;
}
const IGNORED = /^(devis|facture|date|siret|siren|tva|n°|numero|numéro|page|conditions|mentions|iban|bic|adresse|tél|tel|email|e-mail|client|destinataire|émetteur|emetteur|total|sous-total|net|acompte|signature|bon pour accord|valable|validit[ée]|valide|échéance|echeance|objet|intitul[ée])\b/i;
const DATE_LIKE = /\b\d{1,2}[/\-.]\d{1,2}[/\-.]\d{2,4}\b/g;
function splitColumns(line) {
  const cells = line.split(/\t+|\s{2,}/).map((c) => c.trim()).filter(Boolean);
  return cells.length >= 2 ? cells : null;
}
const TOTAL_LINE = /\b(total|montant\s+total|net\s+à\s+payer|total\s+ttc|total\s+ht)\b/i;
function parseQuoteText(raw) {
  const lines = raw.split(/\r?\n/).map((l) => l.replace(/ /g, " ").trim()).filter(Boolean);
  const result = {
    number: null,
    title: null,
    clientName: null,
    clientEmail: null,
    validUntil: null,
    items: [],
    total: null,
    leftovers: []
  };
  const numberMatch = raw.match(/\b((?:DEVIS|DEV|QUO)[-\s]?\d{2,4}[-\s]?\d{1,5})\b/i) || raw.match(/devis\s*(?:n[°o]?\.?)\s*[:\s]\s*([A-Z0-9][A-Z0-9\-/]{2,20})/i);
  if (numberMatch) result.number = numberMatch[1].trim();
  const emailMatch = raw.match(/[\w.+-]+@[\w-]+\.[\w.]{2,}/);
  if (emailMatch) result.clientEmail = emailMatch[0];
  const clientMatch = raw.match(/(?:client|destinataire|à l['’]attention de|adressé à)\s*[:\-]?\s*([^\n]{2,60})/i);
  if (clientMatch) {
    const candidate = clientMatch[1].trim().replace(/[.,;]$/, "");
    if (candidate && !/^[\d\s]+$/.test(candidate)) result.clientName = candidate;
  }
  const validMatch = raw.match(/(?:valable|validit[ée]|valide)\s*(?:jusqu['’]au|jusqu['’]à|:)?\s*(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})/i);
  if (validMatch) {
    const [, d, m, y] = validMatch;
    const year = y.length === 2 ? `20${y}` : y;
    result.validUntil = `${year}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  const titleMatch = raw.match(/(?:objet|intitul[ée]|prestation|projet)\s*[:\-]\s*([^\n]{3,90})/i);
  if (titleMatch) result.title = titleMatch[1].trim();
  for (const line of lines) {
    if (TOTAL_LINE.test(line)) {
      const values2 = amountsIn(line);
      if (values2.length > 0) {
        const candidate = Math.max(...values2);
        if (result.total === null || candidate > result.total) result.total = candidate;
      }
      continue;
    }
    if (IGNORED.test(line)) continue;
    const withoutDates = line.replace(DATE_LIKE, " ");
    let description;
    let values;
    const columns = splitColumns(withoutDates);
    if (columns) {
      description = columns[0];
      values = columns.slice(1).map(parseAmount).filter((n) => n !== null);
    } else {
      values = amountsIn(withoutDates);
      description = withoutDates.slice(0, withoutDates.search(/\d/)).trim().replace(/[·|;:\-\s]+$/, "");
    }
    if (values.length === 0) continue;
    description = description.replace(/[·|;:\-\s]+$/, "").trim();
    if (description.length < 3) {
      result.leftovers.push(line);
      continue;
    }
    let quantity = 1;
    let unitPrice = values[values.length - 1];
    if (values.length >= 3) {
      quantity = values[0];
      unitPrice = values[1];
    } else if (values.length === 2) {
      const [first, second] = values;
      if (Number.isInteger(first) && first > 0 && first <= 999 && second >= first) {
        quantity = first;
        unitPrice = second;
      } else {
        unitPrice = second;
      }
    }
    if (unitPrice <= 0) {
      result.leftovers.push(line);
      continue;
    }
    result.items.push({ description, quantity: quantity || 1, unit_price: unitPrice });
  }
  if (result.items.length === 0 && result.total !== null) {
    result.items.push({ description: result.title || "Prestation", quantity: 1, unit_price: result.total });
  }
  if (!result.title && result.items.length > 0) result.title = result.items[0].description;
  return result;
}
function parseQuoteTable(raw) {
  var _a, _b, _c;
  const rows = raw.split(/\r?\n/).map((r) => r.trim()).filter(Boolean);
  const separator = ((_a = rows[0]) == null ? void 0 : _a.includes("	")) ? "	" : ((_b = rows[0]) == null ? void 0 : _b.includes(";")) ? ";" : ",";
  const items = [];
  const leftovers = [];
  for (const row of rows) {
    const cells = row.split(separator).map((c) => c.trim().replace(/^"|"$/g, ""));
    if (cells.length < 2) {
      leftovers.push(row);
      continue;
    }
    if (/^(description|d[ée]signation|prestation|libell[ée])/i.test(cells[0])) continue;
    const description = cells[0];
    const numbers = cells.slice(1).map(parseAmount).filter((n) => n !== null);
    if (!description || numbers.length === 0) {
      leftovers.push(row);
      continue;
    }
    const quantity = numbers.length >= 2 ? numbers[0] : 1;
    const unitPrice = numbers.length >= 2 ? numbers[1] : numbers[0];
    if (unitPrice > 0) items.push({ description, quantity: quantity || 1, unit_price: unitPrice });
  }
  return {
    number: null,
    title: ((_c = items[0]) == null ? void 0 : _c.description) ?? null,
    clientName: null,
    clientEmail: null,
    validUntil: null,
    items,
    total: items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0) || null,
    leftovers
  };
}
async function extractPdfText(file) {
  const pdfjs = await import("pdfjs-dist");
  const workerSrc = (await import("./pdf.worker.min-CKU2Gsnt.js")).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
  const buffer = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: buffer }).promise;
  const pages = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const byLine = /* @__PURE__ */ new Map();
    for (const item of content.items) {
      if (!item.str.trim()) continue;
      const y = Math.round(item.transform[5]);
      const bucket = [...byLine.keys()].find((k) => Math.abs(k - y) <= 3) ?? y;
      if (!byLine.has(bucket)) byLine.set(bucket, []);
      byLine.get(bucket).push({ x: item.transform[4], text: item.str });
    }
    const lines = [...byLine.entries()].sort((a, b) => b[0] - a[0]).map(([, parts]) => parts.sort((a, b) => a.x - b.x).map((p) => p.text).join(" ").replace(/\s+/g, " ").trim());
    pages.push(lines.join("\n"));
  }
  return pages.join("\n");
}
async function parseQuoteFile(file) {
  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf")) return parseQuoteText(await extractPdfText(file));
  const text = await file.text();
  if (name.endsWith(".csv") || name.endsWith(".tsv")) return parseQuoteTable(text);
  return parseQuoteText(text);
}
function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = () => reject(new Error("lecture impossible"));
    reader.readAsDataURL(file);
  });
}
async function analyseWithClaude(input, accessToken) {
  const url = `${"https://uipxlesrpdocqpblmrrr.supabase.co"}/functions/v1/analyze-quote`;
  const payload = {};
  if (input.file && input.file.type === "application/pdf") {
    payload.fileBase64 = await toBase64(input.file);
    payload.mediaType = "application/pdf";
    payload.fileName = input.file.name;
  } else if (input.file) {
    payload.text = await input.file.text();
    payload.fileName = input.file.name;
  } else {
    payload.text = input.text ?? "";
  }
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok || !data.ok) throw new Error(data.error || "L'analyse a échoué.");
  const r = data.result;
  return {
    number: r.number ?? null,
    title: r.title ?? null,
    clientName: r.clientName ?? null,
    clientEmail: r.clientEmail ?? null,
    validUntil: r.validUntil ?? null,
    items: (r.items ?? []).map((i) => ({
      description: String(i.description ?? ""),
      quantity: Number(i.quantity) || 1,
      unit_price: Number(i.unit_price) || 0
    })),
    total: r.total ?? null,
    leftovers: [],
    client: r.client ?? null,
    confidence: r.confidence ?? "moyenne",
    warnings: r.warnings ?? [],
    smart: true
  };
}
function QuoteImportModal({ open, onClose, clients, projects, onImported }) {
  var _a;
  const navigate = useNavigate();
  const [step, setStep] = useState("source");
  const [pasted, setPasted] = useState("");
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [parsed, setParsed] = useState(null);
  const [smart, setSmart] = useState(null);
  const [fallbackNote, setFallbackNote] = useState(null);
  const [clientId, setClientId] = useState("");
  const [applyClientDetails, setApplyClientDetails] = useState(true);
  const [projectId, setProjectId] = useState("");
  const [title, setTitle] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [items, setItems] = useState([]);
  const fileRef = useRef(null);
  const reset = () => {
    setStep("source");
    setPasted("");
    setParsed(null);
    setSmart(null);
    setFallbackNote(null);
    setItems([]);
    setTitle("");
    setValidUntil("");
    setClientId("");
    setProjectId("");
    setError(null);
    if (fileRef.current) fileRef.current.value = "";
  };
  const applyParsed = (result) => {
    setParsed(result);
    setItems(result.items);
    setTitle(result.title || "");
    setValidUntil(result.validUntil || "");
    const byEmail = result.clientEmail ? clients.find((c) => {
      var _a2;
      return ((_a2 = c.email) == null ? void 0 : _a2.toLowerCase()) === result.clientEmail.toLowerCase();
    }) : void 0;
    const byName = !byEmail && result.clientName ? clients.find((c) => c.name.toLowerCase().includes(result.clientName.toLowerCase()) || result.clientName.toLowerCase().includes(c.name.toLowerCase())) : void 0;
    if (byEmail || byName) setClientId((byEmail || byName).id);
    setStep("review");
  };
  const analyse = async (input) => {
    var _a2;
    setParsing(true);
    setError(null);
    setFallbackNote(null);
    setSmart(null);
    const { data: session } = await supabase.auth.getSession();
    const token = (_a2 = session.session) == null ? void 0 : _a2.access_token;
    if (token) {
      try {
        const result = await analyseWithClaude(input, token);
        setSmart(result);
        applyParsed(result);
        setParsing(false);
        return;
      } catch (e) {
        setFallbackNote(
          e.message.includes("configur") ? "L'analyse assistée n'est pas configurée : lecture mécanique du document." : "Le service d'analyse n'a pas répondu : lecture mécanique du document."
        );
      }
    }
    try {
      applyParsed(input.file ? await parseQuoteFile(input.file) : parseQuoteText(input.text ?? ""));
    } catch {
      setError("Ce document n'a pas pu être lu. Copie son contenu et colle-le ci-dessous.");
    }
    setParsing(false);
  };
  const handleFile = (file) => analyse({ file });
  const handlePaste = () => {
    if (pasted.trim()) analyse({ text: pasted });
  };
  const total = items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0);
  const updateItem = (index, patch) => setItems((prev) => prev.map((item, i) => i === index ? { ...item, ...patch } : item));
  const save = async () => {
    if (!title.trim() || items.length === 0) {
      setError("Il faut au moins un intitulé et une ligne de prestation.");
      return;
    }
    setSaving(true);
    setError(null);
    const { data: number, error: seqError } = await supabase.rpc("next_sequence_number", { seq_id: "quote" });
    if (seqError || !number) {
      setError("Le numéro de devis n'a pas pu être généré.");
      setSaving(false);
      return;
    }
    let finalClientId = clientId || null;
    const details = smart == null ? void 0 : smart.client;
    if (applyClientDetails && (details || (parsed == null ? void 0 : parsed.clientName))) {
      const mentions = {
        trade_name: (details == null ? void 0 : details.tradeName) ?? null,
        legal_form: (details == null ? void 0 : details.legalForm) ?? null,
        share_capital: (details == null ? void 0 : details.shareCapital) ?? null,
        siren: (details == null ? void 0 : details.registrationNumber) ?? null,
        rcs: (details == null ? void 0 : details.rcs) ?? null,
        vat_number: (details == null ? void 0 : details.vatNumber) ?? null,
        address: (details == null ? void 0 : details.address) ?? null,
        representative: (details == null ? void 0 : details.representative) ?? null,
        contact_name: (details == null ? void 0 : details.contactName) ?? null
      };
      const filled = Object.fromEntries(Object.entries(mentions).filter(([, v]) => v));
      if (finalClientId) {
        const { data: existing } = await supabase.from("clients").select("*").eq("id", finalClientId).maybeSingle();
        const patch = Object.fromEntries(
          Object.entries(filled).filter(([k]) => !(existing == null ? void 0 : existing[k]))
        );
        if (Object.keys(patch).length > 0) {
          await supabase.from("clients").update(patch).eq("id", finalClientId);
        }
      } else if (parsed == null ? void 0 : parsed.clientName) {
        const { data: created } = await supabase.from("clients").insert({
          name: parsed.clientName,
          email: parsed.clientEmail ?? null,
          phone: (details == null ? void 0 : details.phone) ?? null,
          source: "manual",
          status: "qualified",
          ...filled
        }).select("id").single();
        if (created) finalClientId = created.id;
      }
    }
    const { data: quote, error: quoteError } = await supabase.from("quotes").insert({
      quote_number: number,
      title: title.trim(),
      client_id: finalClientId,
      project_id: projectId || null,
      valid_until: validUntil || null,
      total_amount: total,
      status: "draft",
      description: (parsed == null ? void 0 : parsed.number) ? `Repris du devis ${parsed.number}` : null
    }).select("id").single();
    if (quoteError || !quote) {
      setError("Le devis n'a pas pu être créé.");
      setSaving(false);
      return;
    }
    const { error: itemsError } = await supabase.from("quote_items").insert(
      items.map((item, index) => ({
        quote_id: quote.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        position: index
      }))
    );
    setSaving(false);
    if (itemsError) {
      setError("Les lignes n'ont pas pu être enregistrées.");
      return;
    }
    onImported();
    reset();
    onClose();
    navigate(`/dashboard/quotes/${quote.id}`);
  };
  const inputClass2 = "px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500";
  return /* @__PURE__ */ jsx(
    Modal,
    {
      open,
      onClose: () => {
        reset();
        onClose();
      },
      title: step === "source" ? "Importer un devis" : "Vérifier avant d'enregistrer",
      maxWidth: "max-w-3xl",
      children: step === "source" ? /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-300 mb-1", children: "Depuis un fichier" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mb-3", children: "PDF, tableur exporté en CSV, ou fichier texte. Le document est lu et compris automatiquement : lignes, quantités, prix unitaires et destinataire." }),
          /* @__PURE__ */ jsx(
            "input",
            {
              ref: fileRef,
              type: "file",
              accept: ".pdf,.csv,.tsv,.txt,text/plain,application/pdf",
              disabled: parsing,
              onChange: (e) => {
                var _a2;
                const f = (_a2 = e.target.files) == null ? void 0 : _a2[0];
                if (f) handleFile(f);
              },
              className: "text-sm text-gray-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "border-t border-gray-800 pt-5", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-300 mb-1", children: "Ou colle le contenu" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mb-3", children: "Copie les lignes du devis depuis un mail, un PDF ou un tableur, puis colle ici." }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              value: pasted,
              onChange: (e) => setPasted(e.target.value),
              rows: 7,
              placeholder: "Création du site vitrine   1   1 200,00\nIntégration des contenus   1   300,00\nTotal   1 500,00",
              className: `${inputClass2} w-full resize-none font-mono text-xs`
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: handlePaste,
              disabled: parsing || !pasted.trim(),
              className: "mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-medium rounded-lg transition-colors",
              children: parsing ? "Analyse…" : "Analyser"
            }
          )
        ] }),
        parsing && /* @__PURE__ */ jsx("p", { className: "text-sm text-blue-400", children: "Lecture du document en cours…" }),
        fallbackNote && /* @__PURE__ */ jsx("p", { className: "text-xs text-amber-400", children: fallbackNote }),
        error && /* @__PURE__ */ jsx("p", { className: "text-sm text-red-400", children: error })
      ] }) : /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: `px-3 py-2 rounded-lg border ${smart ? "bg-blue-500/10 border-blue-500/30" : "bg-gray-800 border-gray-700"}`, children: [
          /* @__PURE__ */ jsxs("p", { className: `text-xs ${smart ? "text-blue-300" : "text-gray-400"}`, children: [
            smart ? "Lecture assistée" : "Lecture mécanique",
            " ·",
            " ",
            items.length,
            " ligne",
            items.length > 1 ? "s" : "",
            " reconnue",
            items.length > 1 ? "s" : "",
            (parsed == null ? void 0 : parsed.number) ? ` · devis d'origine ${parsed.number}` : "",
            smart ? ` · fiabilité ${smart.confidence}` : "",
            (parsed == null ? void 0 : parsed.total) && Math.abs(parsed.total - total) > 0.5 ? ` · total lu ${formatCurrency(parsed.total)}` : ""
          ] }),
          smart && smart.warnings.length > 0 && /* @__PURE__ */ jsx("ul", { className: "mt-2 space-y-1", children: smart.warnings.map((w, i) => /* @__PURE__ */ jsx("li", { className: "text-[11px] text-amber-300", children: w }, i)) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs text-gray-400 mb-1", children: "Intitulé" }),
            /* @__PURE__ */ jsx("input", { type: "text", value: title, onChange: (e) => setTitle(e.target.value), className: `${inputClass2} w-full` })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs text-gray-400 mb-1", children: "Valable jusqu'au" }),
            /* @__PURE__ */ jsx("input", { type: "date", value: validUntil, onChange: (e) => setValidUntil(e.target.value), className: `${inputClass2} w-full` })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("label", { className: "block text-xs text-gray-400 mb-1", children: [
              "Client",
              (parsed == null ? void 0 : parsed.clientName) ? ` (lu : ${parsed.clientName})` : ""
            ] }),
            /* @__PURE__ */ jsxs("select", { value: clientId, onChange: (e) => setClientId(e.target.value), className: `${inputClass2} w-full`, children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "Aucun client" }),
              clients.map((c) => /* @__PURE__ */ jsx("option", { value: c.id, children: c.name }, c.id))
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs text-gray-400 mb-1", children: "Projet" }),
            /* @__PURE__ */ jsxs("select", { value: projectId, onChange: (e) => setProjectId(e.target.value), className: `${inputClass2} w-full`, children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "Aucun projet" }),
              projects.map((p) => /* @__PURE__ */ jsx("option", { value: p.id, children: p.name }, p.id))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
            /* @__PURE__ */ jsx("label", { className: "text-xs text-gray-400", children: "Lignes" }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setItems((prev) => [...prev, { description: "", quantity: 1, unit_price: 0 }]),
                className: "text-xs text-blue-400 hover:text-blue-300",
                children: "+ Ajouter une ligne"
              }
            )
          ] }),
          /* @__PURE__ */ jsx("div", { className: "space-y-2 max-h-64 overflow-y-auto", children: items.map((item, index) => /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap sm:flex-nowrap items-center gap-2", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: item.description,
                onChange: (e) => updateItem(index, { description: e.target.value }),
                placeholder: "Prestation",
                className: `${inputClass2} flex-1 min-w-[10rem]`
              }
            ),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                step: "0.01",
                value: item.quantity,
                onChange: (e) => updateItem(index, { quantity: parseFloat(e.target.value) || 0 }),
                className: `${inputClass2} w-20`,
                title: "Quantité"
              }
            ),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                step: "0.01",
                value: item.unit_price,
                onChange: (e) => updateItem(index, { unit_price: parseFloat(e.target.value) || 0 }),
                className: `${inputClass2} w-28`,
                title: "Prix unitaire"
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-400 w-24 text-right tabular-nums", children: formatCurrency(item.quantity * item.unit_price) }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setItems((prev) => prev.filter((_, i) => i !== index)),
                className: "text-gray-600 hover:text-red-400 px-1",
                "aria-label": "Retirer la ligne",
                children: "×"
              }
            )
          ] }, index)) })
        ] }),
        (smart == null ? void 0 : smart.client) && Object.values(smart.client).some(Boolean) && /* @__PURE__ */ jsx("div", { className: "p-3 bg-gray-800/60 rounded-lg", children: /* @__PURE__ */ jsxs("label", { className: "flex items-start gap-2 cursor-pointer", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "checkbox",
              checked: applyClientDetails,
              onChange: (e) => setApplyClientDetails(e.target.checked),
              className: "mt-0.5 accent-blue-600"
            }
          ),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-300", children: "Reprendre les informations du client dans sa fiche" }),
            /* @__PURE__ */ jsx("span", { className: "block text-[11px] text-gray-500 mt-1", children: [
              smart.client.tradeName && `enseigne ${smart.client.tradeName}`,
              smart.client.legalForm,
              smart.client.shareCapital && `capital ${smart.client.shareCapital}`,
              smart.client.registrationNumber,
              smart.client.rcs,
              smart.client.vatNumber && `TVA ${smart.client.vatNumber}`,
              (_a = smart.client.address) == null ? void 0 : _a.replace(/\n/g, ", "),
              smart.client.representative && `représentée par ${smart.client.representative}`,
              smart.client.contactName && `contact ${smart.client.contactName}`
            ].filter(Boolean).join(" · ") }),
            /* @__PURE__ */ jsx("span", { className: "block text-[11px] text-gray-600 mt-1", children: clientId ? "Seuls les champs encore vides de la fiche seront complétés." : "Une fiche client sera créée avec ces mentions." })
          ] })
        ] }) }),
        parsed && parsed.leftovers.length > 0 && /* @__PURE__ */ jsxs("details", { className: "text-xs", children: [
          /* @__PURE__ */ jsxs("summary", { className: "text-gray-500 cursor-pointer hover:text-gray-300", children: [
            parsed.leftovers.length,
            " ligne",
            parsed.leftovers.length > 1 ? "s" : "",
            " non interprétée",
            parsed.leftovers.length > 1 ? "s" : ""
          ] }),
          /* @__PURE__ */ jsx("div", { className: "mt-2 p-2 bg-gray-800 rounded-lg max-h-32 overflow-y-auto", children: parsed.leftovers.map((line, i) => /* @__PURE__ */ jsx("p", { className: "text-gray-500 font-mono text-[11px] break-words", children: line }, i)) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3 pt-3 border-t border-gray-800 flex-wrap", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-sm text-gray-400", children: [
            "Total du devis : ",
            /* @__PURE__ */ jsx("span", { className: "text-lg font-bold text-white tabular-nums", children: formatCurrency(total) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("button", { onClick: () => setStep("source"), className: "px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors", children: "Reprendre" }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: save,
                disabled: saving || items.length === 0 || !title.trim(),
                className: "px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-medium rounded-lg transition-colors",
                children: saving ? "Enregistrement…" : "Créer le devis"
              }
            )
          ] })
        ] }),
        error && /* @__PURE__ */ jsx("p", { className: "text-sm text-red-400", children: error })
      ] })
    }
  );
}
const STATUS_BADGE$5 = {
  draft: { label: "Brouillon", bg: "bg-gray-500/20", text: "text-gray-400" },
  sent: { label: "Envoyé", bg: "bg-blue-500/20", text: "text-blue-400" },
  accepted: { label: "Accepté", bg: "bg-green-500/20", text: "text-green-400" },
  rejected: { label: "Refusé", bg: "bg-red-500/20", text: "text-red-400" },
  expired: { label: "Expiré", bg: "bg-amber-500/20", text: "text-amber-400" }
};
function QuotesPage() {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState([]);
  const [filterStatus, setFilterStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [importOpen, setImportOpen] = useState(false);
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const fetchAll = useCallback(async () => {
    const [{ data: c }, { data: p }] = await Promise.all([
      supabase.from("clients").select("*").order("name"),
      supabase.from("projects").select("*").eq("is_archived", false).order("name")
    ]);
    if (c) setClients(c);
    if (p) setProjects(p);
    const { data, error } = await supabase.from("quotes").select("*, client:clients(id, name)").order("created_at", { ascending: false });
    if (error) console.error("Fetch quotes error:", error);
    if (data) setQuotes(data);
  }, []);
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);
  const filtered = quotes.filter((q) => !filterStatus || q.status === filterStatus).filter((q) => {
    var _a, _b;
    if (!searchQuery) return true;
    const clientName = ((_b = (_a = q.client) == null ? void 0 : _a.name) == null ? void 0 : _b.toLowerCase()) ?? "";
    return clientName.includes(searchQuery.toLowerCase());
  });
  const pendingCount = quotes.filter((q) => q.status === "sent").length;
  const pendingAmount = quotes.filter((q) => q.status === "sent").reduce((sum, q) => sum + q.total_amount, 0);
  const decided = quotes.filter((q) => ["accepted", "rejected", "sent"].includes(q.status));
  const acceptedCount = quotes.filter((q) => q.status === "accepted").length;
  const acceptanceRate = decided.length > 0 ? Math.round(acceptedCount / decided.length * 100) : 0;
  const now = /* @__PURE__ */ new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();
  const acceptedThisMonth = quotes.filter((q) => q.status === "accepted" && q.created_at >= currentMonthStart && q.created_at <= currentMonthEnd).reduce((sum, q) => sum + q.total_amount, 0);
  const handleDuplicate = async (quote) => {
    const { data: items } = await supabase.from("quote_items").select("*").eq("quote_id", quote.id);
    const { data: number } = await supabase.rpc("next_sequence_number", { seq_id: "quote" });
    if (!number) {
      alert("Le numéro n'a pas pu être généré. Réessaie dans un instant.");
      return;
    }
    const { data: newQuote, error } = await supabase.from("quotes").insert({
      quote_number: number,
      client_id: quote.client_id,
      project_id: quote.project_id,
      title: quote.title + " (copie)",
      description: quote.description,
      terms: quote.terms,
      total_amount: quote.total_amount,
      valid_until: null,
      status: "draft"
    }).select().single();
    if (error) console.error("Duplicate quote error:", error);
    if (newQuote && items) {
      await supabase.from("quote_items").insert(items.map((i) => ({
        quote_id: newQuote.id,
        description: i.description,
        quantity: i.quantity,
        unit_price: i.unit_price,
        position: i.position
      })));
    }
    fetchAll();
  };
  const handleConvertToInvoice = async (quote) => {
    const { data: items } = await supabase.from("quote_items").select("*").eq("quote_id", quote.id);
    const { data: invoiceNumber } = await supabase.rpc("next_sequence_number", { seq_id: "invoice" });
    if (!invoiceNumber) {
      alert("Le numéro n'a pas pu être généré. Réessaie dans un instant.");
      return;
    }
    const dueDate = /* @__PURE__ */ new Date();
    dueDate.setDate(dueDate.getDate() + 30);
    const { data: invoice } = await supabase.from("invoices").insert({
      invoice_number: invoiceNumber,
      quote_id: quote.id,
      client_id: quote.client_id,
      project_id: quote.project_id,
      title: quote.title,
      description: quote.description,
      terms: quote.terms,
      total_amount: quote.total_amount,
      due_date: dueDate.toISOString().slice(0, 10),
      status: "draft"
    }).select().single();
    if (invoice && items) {
      await supabase.from("invoice_items").insert(items.map((i) => ({
        invoice_id: invoice.id,
        description: i.description,
        quantity: i.quantity,
        unit_price: i.unit_price,
        position: i.position
      })));
    }
    if (invoice) navigate(`/dashboard/invoices/${invoice.id}`);
  };
  const handleDelete = async (id) => {
    if (!confirm("Supprimer ce devis ?")) return;
    await supabase.from("quotes").delete().eq("id", id);
    fetchAll();
  };
  return /* @__PURE__ */ jsxs("div", { className: "p-4 sm:p-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-gray-900 border border-gray-800 rounded-xl p-4", children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 uppercase tracking-wider mb-1", children: "Devis en attente" }),
        /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-blue-400", children: pendingCount })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-gray-900 border border-gray-800 rounded-xl p-4", children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 uppercase tracking-wider mb-1", children: "Montant en attente" }),
        /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-purple-400", children: formatCurrency(pendingAmount) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-gray-900 border border-gray-800 rounded-xl p-4", children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 uppercase tracking-wider mb-1", children: "Taux d'acceptation" }),
        /* @__PURE__ */ jsxs("p", { className: "text-2xl font-bold text-green-400", children: [
          acceptanceRate,
          "%"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-gray-900 border border-gray-800 rounded-xl p-4", children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 uppercase tracking-wider mb-1", children: "CA devis acceptés du mois" }),
        /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-emerald-400", children: formatCurrency(acceptedThisMonth) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxs(
          "select",
          {
            value: filterStatus,
            onChange: (e) => setFilterStatus(e.target.value),
            className: "px-3 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded-lg text-gray-300 focus:outline-none focus:border-blue-500",
            children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "Tous les statuts" }),
              /* @__PURE__ */ jsx("option", { value: "draft", children: "Brouillon" }),
              /* @__PURE__ */ jsx("option", { value: "sent", children: "Envoyé" }),
              /* @__PURE__ */ jsx("option", { value: "accepted", children: "Accepté" }),
              /* @__PURE__ */ jsx("option", { value: "rejected", children: "Refusé" }),
              /* @__PURE__ */ jsx("option", { value: "expired", children: "Expiré" })
            ]
          }
        ),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            placeholder: "Rechercher un client...",
            value: searchQuery,
            onChange: (e) => setSearchQuery(e.target.value),
            className: "px-3 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:border-blue-500"
          }
        )
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => navigate("/dashboard/quotes/new"),
          className: "px-4 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors",
          children: "+ Nouveau devis"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setImportOpen(true),
          className: "px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 text-sm font-medium rounded-lg transition-colors",
          children: "Importer un devis"
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "bg-gray-900 border border-gray-800 rounded-xl overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full", children: [
      /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-800", children: [
        /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Numéro" }),
        /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Client" }),
        /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Titre" }),
        /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Montant" }),
        /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Statut" }),
        /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Date" }),
        /* @__PURE__ */ jsx("th", { className: "text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-gray-800", children: filtered.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 7, className: "px-4 py-8 text-center text-sm text-gray-500", children: "Aucun devis" }) }) : filtered.map((quote) => {
        var _a;
        const badge = STATUS_BADGE$5[quote.status];
        return /* @__PURE__ */ jsxs(
          "tr",
          {
            className: "hover:bg-gray-800/50 transition-colors cursor-pointer",
            onClick: () => navigate(`/dashboard/quotes/${quote.id}`),
            children: [
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-sm font-mono text-gray-300", children: quote.quote_number }),
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-sm text-white", children: ((_a = quote.client) == null ? void 0 : _a.name) ?? "-" }),
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-sm text-gray-300 truncate max-w-xs", children: quote.title }),
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-sm font-medium text-white", children: formatCurrency(quote.total_amount) }),
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsx("span", { className: `inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${badge.bg} ${badge.text}`, children: badge.label }) }),
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-sm text-gray-400", children: format(new Date(quote.created_at), "dd/MM/yyyy", { locale: fr }) }),
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-1", onClick: (e) => e.stopPropagation(), children: [
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => navigate(`/dashboard/quotes/${quote.id}`),
                    className: "p-1.5 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-700",
                    title: "Modifier",
                    children: /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" }) })
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => handleDuplicate(quote),
                    className: "p-1.5 text-gray-400 hover:text-blue-400 transition-colors rounded-lg hover:bg-blue-500/10",
                    title: "Dupliquer",
                    children: /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" }) })
                  }
                ),
                quote.status === "accepted" && /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => handleConvertToInvoice(quote),
                    className: "p-1.5 text-gray-400 hover:text-emerald-400 transition-colors rounded-lg hover:bg-emerald-500/10",
                    title: "Convertir en facture",
                    children: /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" }) })
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => handleDelete(quote.id),
                    className: "p-1.5 text-gray-400 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10",
                    title: "Supprimer",
                    children: /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" }) })
                  }
                )
              ] }) })
            ]
          },
          quote.id
        );
      }) })
    ] }) }) }),
    /* @__PURE__ */ jsx(
      QuoteImportModal,
      {
        open: importOpen,
        onClose: () => setImportOpen(false),
        clients,
        projects,
        onImported: fetchAll
      }
    )
  ] });
}
function ShareLinkPanel({ entityType, entityId, defaultAllowAccept = true, defaultEmail }) {
  const { profile } = useTeam();
  const [links, setLinks] = useState([]);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(null);
  const [creating, setCreating] = useState(false);
  const [email, setEmail] = useState(defaultEmail || "");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const fetchLinks = useCallback(async () => {
    const { data, error: e } = await supabase.from("share_links").select("*").eq("entity_type", entityType).eq("entity_id", entityId).order("created_at", { ascending: false });
    if (e) {
      setError("Impossible de charger les liens de partage.");
      return;
    }
    setLinks(data || []);
  }, [entityType, entityId]);
  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);
  useEffect(() => {
    if (defaultEmail) setEmail(defaultEmail);
  }, [defaultEmail]);
  const sendByEmail = async () => {
    var _a;
    if (!email.includes("@")) {
      setError("Adresse e-mail invalide.");
      return;
    }
    setSending(true);
    setError(null);
    const { data: session } = await supabase.auth.getSession();
    try {
      const res = await fetch(`${"https://uipxlesrpdocqpblmrrr.supabase.co"}/functions/v1/send-document`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${((_a = session.session) == null ? void 0 : _a.access_token) ?? ""}`
        },
        body: JSON.stringify({ entityType, entityId, to: email.trim(), message })
      });
      const payload = await res.json();
      if (!res.ok) {
        setError(payload.error || "L'envoi a échoué.");
      } else {
        setSent(true);
        setMessage("");
        fetchLinks();
      }
    } catch {
      setError("L'envoi a échoué. Vérifie ta connexion.");
    }
    setSending(false);
  };
  const publicUrl = (token) => `${window.location.origin}/espace/${token}`;
  const create = async () => {
    setCreating(true);
    const { error: e } = await supabase.from("share_links").insert({
      entity_type: entityType,
      entity_id: entityId,
      allow_accept: defaultAllowAccept,
      created_by: (profile == null ? void 0 : profile.id) ?? null
    });
    setCreating(false);
    if (e) {
      setError("Le lien n'a pas pu être créé.");
      return;
    }
    setError(null);
    fetchLinks();
  };
  const revoke = async (id) => {
    const { error: e } = await supabase.from("share_links").update({ revoked_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", id);
    if (e) {
      setError("Le lien n'a pas pu être désactivé.");
      return;
    }
    fetchLinks();
  };
  const copy = async (token) => {
    try {
      await navigator.clipboard.writeText(publicUrl(token));
      setCopied(token);
      setTimeout(() => setCopied(null), 2e3);
    } catch {
      setError("La copie a échoué. Sélectionne le lien à la main.");
    }
  };
  const active = links.filter((l) => !l.revoked_at);
  return /* @__PURE__ */ jsxs("div", { className: "bg-gray-900 border border-gray-800 rounded-xl p-5 print:hidden", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4 gap-3 flex-wrap", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-white", children: "Espace client" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: defaultAllowAccept ? "Un lien à envoyer au client pour consulter et valider sans créer de compte." : "Un lien de suivi : le client voit l'avancement, sans rien pouvoir modifier." })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: create,
          disabled: creating,
          className: "px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors",
          children: creating ? "Création…" : "Créer un lien"
        }
      )
    ] }),
    error && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-400 mb-3", children: error }),
    entityType !== "project" && /* @__PURE__ */ jsxs("div", { className: "mb-4 pb-4 border-b border-gray-800", children: [
      /* @__PURE__ */ jsx("p", { className: "text-xs font-medium text-gray-300 mb-2", children: "Envoyer par e-mail" }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row gap-2 mb-2", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "email",
            value: email,
            onChange: (e) => {
              setEmail(e.target.value);
              setSent(false);
            },
            placeholder: "client@exemple.com",
            className: "flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: sendByEmail,
            disabled: sending || !email.includes("@"),
            className: "px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-medium rounded-lg transition-colors",
            children: sending ? "Envoi…" : "Envoyer"
          }
        )
      ] }),
      /* @__PURE__ */ jsx(
        "textarea",
        {
          value: message,
          onChange: (e) => setMessage(e.target.value),
          rows: 2,
          placeholder: "Mot d'accompagnement (optionnel)",
          className: "w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500 resize-none"
        }
      ),
      sent && /* @__PURE__ */ jsx("p", { className: "text-xs text-green-400 mt-2", children: "Envoyé. Le document est marqué comme envoyé." })
    ] }),
    active.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: "Aucun lien actif." }) : /* @__PURE__ */ jsx("div", { className: "space-y-3", children: active.map((link) => /* @__PURE__ */ jsxs("div", { className: "p-3 bg-gray-800/60 rounded-lg", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            readOnly: true,
            value: publicUrl(link.token),
            onFocus: (e) => e.currentTarget.select(),
            className: "flex-1 min-w-0 px-2 py-1.5 bg-gray-900 border border-gray-700 rounded text-xs text-gray-300 font-mono"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => copy(link.token),
            className: "px-2.5 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-200 text-xs rounded transition-colors flex-shrink-0",
            children: copied === link.token ? "Copié" : "Copier"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => revoke(link.id),
            className: "px-2.5 py-1.5 text-xs text-gray-500 hover:text-red-400 transition-colors flex-shrink-0",
            children: "Désactiver"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 text-[11px] flex-wrap", children: [
        link.responded_at ? /* @__PURE__ */ jsxs("span", { className: link.response === "accepted" ? "text-green-400" : "text-red-400", children: [
          link.response === "accepted" ? "Accepté" : "Refusé",
          " par ",
          link.response_name || "le client",
          " · ",
          formatDistanceToNow(parseISO(link.responded_at), { addSuffix: true, locale: fr })
        ] }) : link.view_count > 0 ? /* @__PURE__ */ jsxs("span", { className: "text-amber-400", children: [
          "Consulté ",
          link.view_count,
          " fois · dernière vue",
          " ",
          link.last_viewed_at && formatDistanceToNow(parseISO(link.last_viewed_at), { addSuffix: true, locale: fr })
        ] }) : /* @__PURE__ */ jsx("span", { className: "text-gray-500", children: "Jamais ouvert" }),
        link.expires_at && /* @__PURE__ */ jsxs("span", { className: "text-gray-600", children: [
          "Expire le ",
          format(parseISO(link.expires_at), "d MMM yyyy", { locale: fr })
        ] })
      ] })
    ] }, link.id)) })
  ] });
}
function companyIdLabel(value) {
  const digits = (value ?? "").replace(/\D/g, "");
  return digits.length >= 14 ? "SIRET" : "SIREN";
}
function money$1(amount) {
  return new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount) + " €";
}
function splitDetail(raw) {
  const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return { heading: "", details: [] };
  const [heading, ...rest] = lines;
  const details = rest.map((line) => {
    const cleaned = line.replace(/^[-•*·]\s*/, "");
    const match = cleaned.match(/^([\d.]+\s+[^:]{2,60}:)\s*(.*)$/);
    return match ? { label: match[1], text: match[2] } : { label: "", text: cleaned };
  });
  return { heading, details };
}
function DocumentAgency({ doc }) {
  var _a, _b;
  const {
    issuer,
    client,
    items,
    total,
    isQuote,
    number,
    date,
    validUntil,
    dueDate,
    title,
    description,
    durationNote,
    vatApplicable,
    vatRate,
    paidAmount,
    terms
  } = doc;
  const vat = vatApplicable ? total * vatRate : 0;
  const label = isQuote ? "Devis" : "Facture";
  const accent = issuer.accent || "#5a5a5a";
  const footer = /* @__PURE__ */ jsxs("div", { className: "ag-footer", children: [
    /* @__PURE__ */ jsxs("div", { className: "ag-footer-col", children: [
      /* @__PURE__ */ jsx("p", { className: "ag-footer-strong", children: issuer.name }),
      issuer.legalForm && /* @__PURE__ */ jsx("p", { className: "ag-footer-strong", children: issuer.legalForm }),
      issuer.siret && /* @__PURE__ */ jsxs("p", { children: [
        "SIRET : ",
        issuer.siret
      ] }),
      issuer.rm && /* @__PURE__ */ jsxs("p", { children: [
        "RM : ",
        issuer.rm
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "ag-footer-col", children: [
      /* @__PURE__ */ jsx("p", { className: "ag-footer-title", children: "Mode de paiement" }),
      issuer.iban && /* @__PURE__ */ jsxs("p", { children: [
        "IBAN : ",
        issuer.iban
      ] }),
      issuer.bic && /* @__PURE__ */ jsxs("p", { children: [
        "BIC : ",
        issuer.bic
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "ag-footer-ref", children: [
      label,
      " ",
      number
    ] })
  ] });
  return /* @__PURE__ */ jsxs("div", { className: "ag-doc", style: { ["--ag-accent"]: accent }, children: [
    /* @__PURE__ */ jsx("header", { className: "ag-brand", children: issuer.logoUrl ? /* @__PURE__ */ jsx("img", { src: issuer.logoUrl, alt: "", className: "ag-brand-logo" }) : /* @__PURE__ */ jsx("span", { className: "ag-brand-name", children: issuer.brand || issuer.name }) }),
    /* @__PURE__ */ jsxs("div", { className: "ag-body", children: [
      /* @__PURE__ */ jsxs("section", { className: "ag-parties", children: [
        /* @__PURE__ */ jsxs("div", { className: "ag-party", children: [
          /* @__PURE__ */ jsx("p", { className: "ag-party-name", children: issuer.name }),
          (_a = issuer.address) == null ? void 0 : _a.split("\n").map((l, i) => /* @__PURE__ */ jsx("p", { className: "ag-party-line", children: l }, i)),
          issuer.email && /* @__PURE__ */ jsx("p", { className: "ag-party-line ag-party-mail", children: issuer.email })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "ag-party ag-party-right", children: client && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs("p", { className: "ag-party-name", children: [
            client.name,
            client.trade_name ? ` (${client.trade_name})` : ""
          ] }),
          (client.legal_form || client.share_capital) && /* @__PURE__ */ jsx("p", { className: "ag-party-line", children: [client.legal_form, client.share_capital ? `au capital de ${client.share_capital}` : null].filter(Boolean).join(" ") }),
          (_b = client.address) == null ? void 0 : _b.split("\n").map((l, i) => /* @__PURE__ */ jsx("p", { className: "ag-party-line", children: l }, i)),
          client.rcs && /* @__PURE__ */ jsx("p", { className: "ag-party-line", children: client.rcs }),
          client.siren && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("p", { className: "ag-party-label", children: companyIdLabel(client.siren) }),
            /* @__PURE__ */ jsx("p", { className: "ag-party-line", children: client.siren })
          ] }),
          client.vat_number && /* @__PURE__ */ jsxs("p", { className: "ag-party-line", children: [
            "TVA : ",
            client.vat_number
          ] }),
          (client.representative || client.contact_name) && /* @__PURE__ */ jsx("p", { className: "ag-party-line", children: client.representative ? `Représentée par ${client.representative}` : `Contact : ${client.contact_name}` }),
          client.email && /* @__PURE__ */ jsx("p", { className: "ag-party-line", children: client.email })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs("h1", { className: "ag-title", children: [
        label,
        " ",
        number
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "ag-subhead", children: [
        /* @__PURE__ */ jsx("span", { className: "ag-project", children: doc.projectName ? `Projet ${doc.projectName}` : "" }),
        /* @__PURE__ */ jsxs("span", { className: "ag-dates", children: [
          /* @__PURE__ */ jsxs("span", { children: [
            "Émis le ",
            format(parseISO(date), "dd/MM/yyyy")
          ] }),
          isQuote && validUntil && /* @__PURE__ */ jsxs("span", { children: [
            "Valide jusqu'au ",
            format(parseISO(validUntil), "dd/MM/yyyy")
          ] }),
          !isQuote && dueDate && /* @__PURE__ */ jsxs("span", { children: [
            "Échéance le ",
            format(parseISO(dueDate), "dd/MM/yyyy")
          ] })
        ] })
      ] }),
      title && /* @__PURE__ */ jsxs("p", { className: "ag-object", children: [
        "Objet du projet : ",
        title
      ] }),
      description && /* @__PURE__ */ jsx("p", { className: "ag-object", children: description }),
      durationNote && /* @__PURE__ */ jsx("p", { className: "ag-object", children: durationNote }),
      /* @__PURE__ */ jsxs("table", { className: "ag-table", children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("th", { className: "ag-th", children: "Libellé" }),
          /* @__PURE__ */ jsx("th", { className: "ag-th ag-th-c", children: "Unité" }),
          /* @__PURE__ */ jsx("th", { className: "ag-th ag-th-r", children: "Quantité" }),
          /* @__PURE__ */ jsx("th", { className: "ag-th ag-th-r", children: "Prix u. HT" }),
          /* @__PURE__ */ jsx("th", { className: "ag-th ag-th-r", children: "TVA" }),
          /* @__PURE__ */ jsx("th", { className: "ag-th ag-th-r", children: "Total HT" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { children: items.map((item, index) => {
          const { heading, details } = splitDetail(item.description);
          return /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsxs("td", { className: "ag-td", children: [
              /* @__PURE__ */ jsx("p", { className: "ag-item-heading", children: heading }),
              details.length > 0 && /* @__PURE__ */ jsx("div", { className: "ag-item-details", children: details.map((d, i) => /* @__PURE__ */ jsxs("p", { className: "ag-item-detail", children: [
                d.label && /* @__PURE__ */ jsxs("span", { className: "ag-item-detail-label", children: [
                  d.label,
                  " "
                ] }),
                d.text
              ] }, i)) })
            ] }),
            /* @__PURE__ */ jsx("td", { className: "ag-td ag-td-c", children: item.unit || "" }),
            /* @__PURE__ */ jsx("td", { className: "ag-td ag-td-r", children: item.quantity }),
            /* @__PURE__ */ jsx("td", { className: "ag-td ag-td-r", children: money$1(item.unit_price) }),
            /* @__PURE__ */ jsx("td", { className: "ag-td ag-td-r", children: vatApplicable ? `${(vatRate * 100).toFixed(2)} %` : "0,00 %" }),
            /* @__PURE__ */ jsx("td", { className: "ag-td ag-td-r", children: money$1(item.quantity * item.unit_price) })
          ] }, index);
        }) })
      ] }),
      /* @__PURE__ */ jsxs("section", { className: "ag-closing", children: [
        /* @__PURE__ */ jsxs("div", { className: "ag-payment", children: [
          /* @__PURE__ */ jsx("div", { className: "ag-payment-head", children: "Échéance de paiement" }),
          /* @__PURE__ */ jsx("p", { className: "ag-payment-text", children: isQuote ? "30 jours à compter de la date d'émission de la facture." : dueDate ? `Règlement attendu au ${format(parseISO(dueDate), "dd/MM/yyyy")}.` : "30 jours à compter de la date d'émission." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "ag-totals", children: [
          /* @__PURE__ */ jsxs("div", { className: "ag-total-row", children: [
            /* @__PURE__ */ jsx("span", { children: "Total HT" }),
            /* @__PURE__ */ jsx("span", { children: money$1(total) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "ag-total-row", children: [
            /* @__PURE__ */ jsx("span", { children: "TVA" }),
            /* @__PURE__ */ jsx("span", { children: money$1(vat) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "ag-total-row ag-total-row-strong", children: [
            /* @__PURE__ */ jsx("span", { children: "Total TTC" }),
            /* @__PURE__ */ jsx("span", { children: money$1(total + vat) })
          ] }),
          !isQuote && paidAmount !== void 0 && paidAmount > 0 && /* @__PURE__ */ jsxs("div", { className: "ag-total-row", children: [
            /* @__PURE__ */ jsx("span", { children: "Reste à régler" }),
            /* @__PURE__ */ jsx("span", { children: money$1(total + vat - paidAmount) })
          ] })
        ] })
      ] }),
      isQuote && /* @__PURE__ */ jsxs("section", { className: "ag-accord", children: [
        /* @__PURE__ */ jsx("p", { className: "ag-accord-title", children: "Bon pour accord" }),
        /* @__PURE__ */ jsx("p", { className: "ag-accord-line", children: "Signé le :" })
      ] }),
      /* @__PURE__ */ jsxs("section", { className: "ag-terms", children: [
        /* @__PURE__ */ jsx("p", { className: "ag-terms-title", children: "Termes et conditions" }),
        !vatApplicable && /* @__PURE__ */ jsx("p", { className: "ag-terms-line", children: "TVA non applicable, article 293 B du CGI" }),
        terms == null ? void 0 : terms.split("\n").filter(Boolean).map((line, i) => /* @__PURE__ */ jsx("p", { className: "ag-terms-line", children: line }, i)),
        doc.penaltyTerms && /* @__PURE__ */ jsx("p", { className: "ag-terms-line ag-terms-spaced", children: doc.penaltyTerms }),
        doc.ipTerms && /* @__PURE__ */ jsx("p", { className: "ag-terms-line ag-terms-spaced", children: doc.ipTerms })
      ] })
    ] }),
    footer
  ] });
}
function money(amount) {
  const rounded = Math.round(amount * 100) / 100;
  const hasCents = rounded % 1 !== 0;
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2
  }).format(rounded) + " €";
}
function splitDescription(raw) {
  const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return { title: "", lead: null, bullets: [] };
  const [title, ...rest] = lines;
  const bullets = rest.filter((l) => /^[-•*·]/.test(l)).map((l) => l.replace(/^[-•*·]\s*/, ""));
  const lead = rest.filter((l) => !/^[-•*·]/.test(l)).join(" ") || null;
  return { title, lead, bullets };
}
function DocumentPDF({
  type,
  number,
  date,
  validUntil,
  dueDate,
  title,
  description,
  durationNote,
  client,
  items,
  total,
  terms,
  notes,
  paidAmount,
  projectName,
  createdBy,
  onClose
}) {
  var _a;
  const { profile, memberById } = useTeam();
  const [company, setCompany] = useState(null);
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  useEffect(() => {
    document.body.classList.add("doc-printing");
    return () => {
      document.body.classList.remove("doc-printing");
    };
  }, []);
  useEffect(() => {
    supabase.from("company_settings").select("*").maybeSingle().then(({ data }) => setCompany(data || null));
  }, []);
  const isQuote = type === "quote";
  const docTitle = isQuote ? "DEVIS" : "FACTURE";
  const author = memberById(createdBy) ?? profile ?? null;
  const issuer = {
    name: (author == null ? void 0 : author.issuer_name) || (company == null ? void 0 : company.legal_name) || BUSINESS.name,
    brand: (author == null ? void 0 : author.issuer_brand) || (company == null ? void 0 : company.trade_name) || BUSINESS.tradeName,
    legalForm: (author == null ? void 0 : author.issuer_legal_form) || (company == null ? void 0 : company.legal_form) || null,
    siret: (author == null ? void 0 : author.issuer_siret) || (company == null ? void 0 : company.siret) || BUSINESS.siret,
    rm: (author == null ? void 0 : author.issuer_rm) || null,
    address: (author == null ? void 0 : author.issuer_address) || (company == null ? void 0 : company.address) || null,
    email: (author == null ? void 0 : author.issuer_email) || (company == null ? void 0 : company.email) || BUSINESS.email,
    phone: (author == null ? void 0 : author.issuer_phone) || (company == null ? void 0 : company.phone) || null,
    logoUrl: (author == null ? void 0 : author.issuer_logo_url) || (company == null ? void 0 : company.logo_url) || null,
    iban: (author == null ? void 0 : author.iban) || (company == null ? void 0 : company.iban) || null,
    bic: (author == null ? void 0 : author.bic) || (company == null ? void 0 : company.bic) || null,
    bankName: (author == null ? void 0 : author.bank_name) || (company == null ? void 0 : company.bank_name) || null,
    accountHolder: (company == null ? void 0 : company.account_holder) || null,
    accent: (author == null ? void 0 : author.document_accent) || null,
    template: (author == null ? void 0 : author.document_template) || "classic"
  };
  const emitterName = (company == null ? void 0 : company.legal_name) || BUSINESS.name;
  (company == null ? void 0 : company.trade_name) || BUSINESS.tradeName;
  (company == null ? void 0 : company.siret) || BUSINESS.siret;
  (company == null ? void 0 : company.email) || BUSINESS.email;
  const vatApplicable = (company == null ? void 0 : company.vat_applicable) ?? false;
  const vatRate = Number((company == null ? void 0 : company.vat_rate) ?? 0.2);
  const validityDays = (company == null ? void 0 : company.validity_days) ?? 30;
  const vat = vatApplicable ? total * vatRate : 0;
  const totalTtc = total + vat;
  const remaining = !isQuote && paidAmount !== void 0 ? total - paidAmount : 0;
  const conditions = [
    { label: "Règlement", text: (company == null ? void 0 : company.payment_terms) || terms },
    { label: "Pénalités", text: company == null ? void 0 : company.late_penalty_terms },
    { label: "Propriété intellectuelle", text: company == null ? void 0 : company.ip_terms }
  ].filter((c) => c.text);
  return createPortal(
    /* @__PURE__ */ jsxs("div", { className: "doc-root", id: "print-area", tabIndex: -1, children: [
      /* @__PURE__ */ jsxs("div", { className: "no-print doc-toolbar", children: [
        /* @__PURE__ */ jsx("button", { onClick: () => window.print(), className: "doc-btn doc-btn-primary", children: "Imprimer" }),
        /* @__PURE__ */ jsx("button", { onClick: onClose, className: "doc-btn", children: "Fermer" }),
        /* @__PURE__ */ jsx("span", { className: "doc-hint", children: "Dans la fenêtre d'impression, décoche « En-têtes et pieds de page » et coche « Graphiques d'arrière-plan »." })
      ] }),
      issuer.template === "agency" ? /* @__PURE__ */ jsx("div", { className: "doc-page doc-page-agency", children: /* @__PURE__ */ jsx(DocumentAgency, { doc: {
        isQuote,
        number,
        date,
        validUntil,
        dueDate,
        title,
        description,
        durationNote,
        projectName,
        client,
        issuer,
        items,
        total,
        vatApplicable,
        vatRate,
        paidAmount,
        terms: (company == null ? void 0 : company.payment_terms) || terms,
        penaltyTerms: (company == null ? void 0 : company.late_penalty_terms) ?? null,
        ipTerms: (company == null ? void 0 : company.ip_terms) ?? null,
        notes
      } }) }) : /* @__PURE__ */ jsxs("div", { className: "doc-page", children: [
        /* @__PURE__ */ jsxs("header", { className: "doc-head", children: [
          /* @__PURE__ */ jsx("div", { className: "doc-head-left", children: /* @__PURE__ */ jsx("img", { src: issuer.logoUrl || "/logo.png", alt: "", className: "doc-logo" }) }),
          /* @__PURE__ */ jsxs("div", { className: "doc-head-right", children: [
            /* @__PURE__ */ jsx("h1", { className: "doc-title", children: docTitle }),
            /* @__PURE__ */ jsxs("p", { className: "doc-meta", children: [
              "N° ",
              number
            ] }),
            /* @__PURE__ */ jsxs("p", { className: "doc-meta", children: [
              "Date : ",
              format(parseISO(date), "d MMMM yyyy", { locale: fr })
            ] }),
            isQuote && /* @__PURE__ */ jsx("p", { className: "doc-meta", children: validUntil ? `Valable jusqu'au ${format(parseISO(validUntil), "d MMMM yyyy", { locale: fr })}` : `Validité : ${validityDays} jours` }),
            !isQuote && dueDate && /* @__PURE__ */ jsxs("p", { className: "doc-meta", children: [
              "Échéance : ",
              format(parseISO(dueDate), "d MMMM yyyy", { locale: fr })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("section", { className: "doc-parties", children: [
          /* @__PURE__ */ jsx("p", { className: "doc-label", children: "Émetteur" }),
          /* @__PURE__ */ jsxs("p", { className: "doc-line doc-line-strong", children: [
            issuer.name,
            issuer.brand ? ` / ${issuer.brand}` : ""
          ] }),
          issuer.legalForm && /* @__PURE__ */ jsx("p", { className: "doc-line", children: issuer.legalForm }),
          issuer.address && /* @__PURE__ */ jsx("p", { className: "doc-line", children: issuer.address }),
          issuer.siret && /* @__PURE__ */ jsxs("p", { className: "doc-line", children: [
            "SIRET : ",
            issuer.siret
          ] }),
          (company == null ? void 0 : company.vat_number) && /* @__PURE__ */ jsxs("p", { className: "doc-line", children: [
            "TVA : ",
            company.vat_number
          ] }),
          issuer.email && /* @__PURE__ */ jsx("p", { className: "doc-line", children: issuer.email }),
          client && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("p", { className: "doc-label doc-label-spaced", children: "Client" }),
            /* @__PURE__ */ jsxs("p", { className: "doc-line doc-line-strong", children: [
              client.name,
              client.trade_name ? ` (${client.trade_name})` : ""
            ] }),
            (client.legal_form || client.share_capital) && /* @__PURE__ */ jsx("p", { className: "doc-line", children: [client.legal_form, client.share_capital ? `au capital de ${client.share_capital}` : null].filter(Boolean).join(" ") }),
            (_a = client.address) == null ? void 0 : _a.split("\n").map((l, i) => /* @__PURE__ */ jsx("p", { className: "doc-line", children: l }, i)),
            client.rcs && /* @__PURE__ */ jsx("p", { className: "doc-line", children: client.rcs }),
            client.siren && /* @__PURE__ */ jsxs("p", { className: "doc-line", children: [
              companyIdLabel(client.siren),
              " : ",
              client.siren
            ] }),
            client.vat_number && /* @__PURE__ */ jsxs("p", { className: "doc-line", children: [
              "TVA : ",
              client.vat_number
            ] }),
            client.representative && /* @__PURE__ */ jsxs("p", { className: "doc-line", children: [
              "Représentée par ",
              client.representative
            ] }),
            client.contact_name && !client.representative && /* @__PURE__ */ jsxs("p", { className: "doc-line", children: [
              "Contact : ",
              client.contact_name
            ] }),
            client.email && /* @__PURE__ */ jsx("p", { className: "doc-line", children: client.email })
          ] })
        ] }),
        /* @__PURE__ */ jsx("hr", { className: "doc-rule" }),
        (title || description) && /* @__PURE__ */ jsxs("section", { className: "doc-object", children: [
          /* @__PURE__ */ jsx("p", { className: "doc-label", children: "Objet" }),
          title && /* @__PURE__ */ jsx("h2", { className: "doc-object-title", children: title }),
          description && /* @__PURE__ */ jsx("p", { className: "doc-object-text", children: description }),
          durationNote && /* @__PURE__ */ jsx("p", { className: "doc-object-duration", children: durationNote })
        ] }),
        /* @__PURE__ */ jsxs("table", { className: "doc-table", children: [
          /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("th", { className: "doc-th", children: "Désignation" }),
            /* @__PURE__ */ jsx("th", { className: "doc-th doc-th-right", children: "Montant HT" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { children: items.map((item, index) => {
            const { title: lineTitle, lead, bullets } = splitDescription(item.description);
            return /* @__PURE__ */ jsxs("tr", { className: index % 2 === 1 ? "doc-row doc-row-alt" : "doc-row", children: [
              /* @__PURE__ */ jsxs("td", { className: "doc-td", children: [
                /* @__PURE__ */ jsxs("p", { className: "doc-item-title", children: [
                  items.length > 1 ? `${index + 1}. ` : "",
                  lineTitle,
                  item.quantity !== 1 && /* @__PURE__ */ jsxs("span", { className: "doc-item-qty", children: [
                    " · ",
                    item.quantity,
                    " × ",
                    money(item.unit_price)
                  ] })
                ] }),
                lead && /* @__PURE__ */ jsx("p", { className: "doc-item-lead", children: lead }),
                bullets.length > 0 && /* @__PURE__ */ jsx("ul", { className: "doc-bullets", children: bullets.map((b, i) => /* @__PURE__ */ jsx("li", { children: b }, i)) })
              ] }),
              /* @__PURE__ */ jsx("td", { className: "doc-td doc-td-amount", children: money(item.quantity * item.unit_price) })
            ] }, index);
          }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "doc-total", children: [
          /* @__PURE__ */ jsx("span", { className: "doc-total-label", children: "Total HT" }),
          /* @__PURE__ */ jsxs("span", { className: "doc-total-value", children: [
            money(total),
            " HT"
          ] })
        ] }),
        vatApplicable ? /* @__PURE__ */ jsxs("p", { className: "doc-total-note", children: [
          "TVA (",
          Math.round(vatRate * 100),
          " %) : ",
          money(vat),
          " · Total TTC : ",
          money(totalTtc)
        ] }) : /* @__PURE__ */ jsx("p", { className: "doc-total-note", children: BUSINESS.tvaMessage }),
        !isQuote && paidAmount !== void 0 && paidAmount > 0 && /* @__PURE__ */ jsxs("p", { className: "doc-total-note", children: [
          "Déjà réglé : ",
          money(paidAmount),
          " · Reste à régler : ",
          money(remaining)
        ] }),
        !isQuote && (issuer.iban || issuer.bic) && /* @__PURE__ */ jsxs("section", { className: "doc-bank", children: [
          /* @__PURE__ */ jsx("p", { className: "doc-label", children: "Coordonnées bancaires" }),
          /* @__PURE__ */ jsxs("div", { className: "doc-bank-grid", children: [
            ((company == null ? void 0 : company.account_holder) || emitterName) && /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("span", { className: "doc-bank-key", children: "Titulaire" }),
              /* @__PURE__ */ jsx("span", { className: "doc-bank-value", children: issuer.accountHolder || issuer.name })
            ] }),
            issuer.bankName && /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("span", { className: "doc-bank-key", children: "Banque" }),
              /* @__PURE__ */ jsx("span", { className: "doc-bank-value", children: issuer.bankName })
            ] }),
            issuer.iban && /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("span", { className: "doc-bank-key", children: "IBAN" }),
              /* @__PURE__ */ jsx("span", { className: "doc-bank-value doc-bank-iban", children: issuer.iban })
            ] }),
            issuer.bic && /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("span", { className: "doc-bank-key", children: "BIC" }),
              /* @__PURE__ */ jsx("span", { className: "doc-bank-value doc-bank-iban", children: issuer.bic })
            ] })
          ] }),
          (company == null ? void 0 : company.payment_reference_note) && /* @__PURE__ */ jsx("p", { className: "doc-bank-note", children: company.payment_reference_note })
        ] }),
        notes && /* @__PURE__ */ jsxs("section", { className: "doc-block", children: [
          /* @__PURE__ */ jsx("h3", { className: "doc-block-title", children: "Notes" }),
          /* @__PURE__ */ jsx("p", { className: "doc-block-text", children: notes })
        ] }),
        conditions.length > 0 && /* @__PURE__ */ jsxs("section", { className: "doc-terms", children: [
          /* @__PURE__ */ jsx("h3", { className: "doc-block-title", children: "Termes et conditions" }),
          conditions.map((c) => /* @__PURE__ */ jsxs("div", { className: "doc-term", children: [
            /* @__PURE__ */ jsx("p", { className: "doc-term-label", children: c.label }),
            /* @__PURE__ */ jsx("p", { className: "doc-term-text", children: c.text })
          ] }, c.label))
        ] }),
        isQuote && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("hr", { className: "doc-rule doc-rule-signature" }),
          /* @__PURE__ */ jsxs("section", { className: "doc-signatures", children: [
            /* @__PURE__ */ jsxs("div", { className: "doc-sign", children: [
              /* @__PURE__ */ jsx("p", { className: "doc-sign-title", children: "Le prestataire" }),
              /* @__PURE__ */ jsxs("p", { className: "doc-line doc-line-strong", children: [
                issuer.name,
                issuer.brand ? ` / ${issuer.brand}` : ""
              ] }),
              /* @__PURE__ */ jsx("p", { className: "doc-sign-hint", children: "Date et signature :" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "doc-sign", children: [
              /* @__PURE__ */ jsx("p", { className: "doc-sign-title", children: "Le client" }),
              /* @__PURE__ */ jsx("p", { className: "doc-sign-hint", children: "Précédé de la mention « Bon pour accord »" }),
              /* @__PURE__ */ jsx("p", { className: "doc-sign-hint doc-sign-hint-spaced", children: "Date et signature :" })
            ] })
          ] })
        ] })
      ] })
    ] }),
    document.body
  );
}
function useTaxRegimes() {
  const [regimes, setRegimes] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchAll = useCallback(async () => {
    const [{ data: r, error: re }, { data: s }] = await Promise.all([
      supabase.from("tax_regimes").select("*").eq("is_active", true).order("position"),
      supabase.from("company_settings").select("*").maybeSingle()
    ]);
    if (re) setError("Impossible de charger les barèmes fiscaux.");
    setRegimes(r || []);
    setSettings(s || null);
    setLoading(false);
  }, []);
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);
  const activeRegime = regimes.find((r) => r.id === (settings == null ? void 0 : settings.active_regime_id)) || regimes[0] || null;
  return { regimes, settings, activeRegime, loading, error, refresh: fetchAll };
}
function isMicro(params) {
  return params.kind === "micro";
}
const round = (n) => Math.round(n * 100) / 100;
function simulate(regime, input) {
  const revenue = Math.max(0, input.revenue || 0);
  const expenses = Math.max(0, input.expenses || 0);
  const lines = [];
  const warnings = [];
  const p = regime.params;
  if (isMicro(p)) {
    const base = p.min_social_base ? Math.max(revenue, p.min_social_base) : revenue;
    const social = base * p.social_rate;
    const training = revenue * p.training_rate;
    lines.push({
      kind: "charge",
      label: p.min_social_base ? "Cotisation sociale" : "Cotisations sociales",
      amount: round(social),
      hint: p.min_social_base && revenue < p.min_social_base ? `Assise sur la base minimale de ${p.min_social_base.toLocaleString("fr-FR")}` : `${(p.social_rate * 100).toFixed(1)} % du chiffre d'affaires`
    });
    if (training > 0) {
      lines.push({
        kind: "charge",
        label: "Formation professionnelle",
        amount: round(training),
        hint: `${(p.training_rate * 100).toFixed(2)} % du chiffre d'affaires`
      });
    }
    let tax = 0;
    if (input.liberatoryTax) {
      tax = revenue * p.liberatory_tax_rate;
      lines.push({
        kind: "tax",
        label: "Impôt (versement libératoire)",
        amount: round(tax),
        hint: `${(p.liberatory_tax_rate * 100).toFixed(1)} % du chiffre d'affaires`
      });
    } else if (input.marginalRate) {
      const taxable = revenue * (1 - p.income_allowance);
      tax = taxable * input.marginalRate;
      lines.push({
        kind: "tax",
        label: "Impôt sur le revenu (estimation)",
        amount: round(tax),
        hint: p.income_allowance > 0 ? `${(input.marginalRate * 100).toFixed(0)} % sur une base abattue de ${(p.income_allowance * 100).toFixed(0)} %` : `${(input.marginalRate * 100).toFixed(0)} % du revenu déclaré`
      });
    }
    if (expenses > 0) {
      lines.push({
        kind: "charge",
        label: "Charges réelles",
        amount: round(expenses),
        hint: "Non déductibles sous ce régime : elles pèsent sur le net"
      });
    }
    const totalCharges2 = social + training + tax + expenses;
    const net2 = revenue - totalCharges2;
    const yearTotal = (input.revenueToDate || 0) + revenue;
    if (yearTotal > p.revenue_ceiling) {
      warnings.push(
        `Le plafond du régime (${p.revenue_ceiling.toLocaleString("fr-FR")} ${regime.currency}) serait dépassé : ${Math.round(yearTotal).toLocaleString("fr-FR")} sur l'année.`
      );
    } else if (yearTotal > p.revenue_ceiling * 0.85) {
      warnings.push(
        `Vous approchez du plafond : ${Math.round(yearTotal).toLocaleString("fr-FR")} sur ${p.revenue_ceiling.toLocaleString("fr-FR")} ${regime.currency}.`
      );
    }
    if (p.vat_franchise_ceiling && yearTotal > p.vat_franchise_ceiling) {
      warnings.push(
        `Le seuil de franchise de TVA (${p.vat_franchise_ceiling.toLocaleString("fr-FR")} ${regime.currency}) serait franchi : il faudrait facturer la TVA à ${(p.vat_rate * 100).toFixed(0)} %.`
      );
    }
    return {
      regime,
      currency: regime.currency,
      revenue,
      lines,
      totalCharges: round(totalCharges2),
      net: round(net2),
      netRate: revenue > 0 ? net2 / revenue : 0,
      warnings
    };
  }
  const accounting = input.annual ? p.accounting_cost || 0 : 0;
  const share = input.salaryShare ?? p.default_salary_share;
  const available = Math.max(0, revenue - expenses - accounting);
  const envelope = available * share;
  const gross = envelope / (1 + p.employer_rate);
  const employer = gross * p.employer_rate;
  const employee = gross * p.employee_rate;
  const netSalary = gross - employee;
  const profitBeforeTax = available - envelope;
  const reducedPart = Math.min(Math.max(profitBeforeTax, 0), p.corporate_tax_threshold);
  const standardPart = Math.max(profitBeforeTax - p.corporate_tax_threshold, 0);
  const corporateTax = reducedPart * p.corporate_tax_reduced + standardPart * p.corporate_tax_standard;
  const distributable = Math.max(profitBeforeTax - corporateTax, 0);
  const dividendTax = distributable * p.dividend_flat_tax;
  const netDividends = distributable - dividendTax;
  if (expenses > 0) {
    lines.push({ kind: "info", label: "Charges réelles déduites", amount: round(expenses), hint: "Déductibles du résultat" });
  }
  if (accounting > 0) {
    lines.push({ kind: "charge", label: "Comptabilité et frais de structure", amount: round(accounting), hint: "Estimation annuelle, à répartir" });
  }
  lines.push({ kind: "charge", label: "Cotisations patronales", amount: round(employer), hint: `${(p.employer_rate * 100).toFixed(0)} % du brut` });
  lines.push({ kind: "charge", label: "Cotisations salariales", amount: round(employee), hint: `${(p.employee_rate * 100).toFixed(0)} % du brut` });
  lines.push({ kind: "tax", label: "Impôt sur les sociétés", amount: round(corporateTax), hint: `${(p.corporate_tax_reduced * 100).toFixed(0)} % jusqu'à ${p.corporate_tax_threshold.toLocaleString("fr-FR")} €, puis ${(p.corporate_tax_standard * 100).toFixed(0)} %` });
  lines.push({ kind: "tax", label: "Imposition des dividendes", amount: round(dividendTax), hint: `Prélèvement forfaitaire de ${(p.dividend_flat_tax * 100).toFixed(0)} %` });
  lines.push({ kind: "net", label: "Rémunération nette", amount: round(netSalary), hint: "Avant impôt sur le revenu" });
  lines.push({ kind: "net", label: "Dividendes nets", amount: round(netDividends), hint: "Après impôt sur les sociétés et prélèvement forfaitaire" });
  const net = netSalary + netDividends;
  warnings.push("La rémunération nette reste soumise à l'impôt sur le revenu du foyer, non compté ici.");
  if (!input.annual) {
    warnings.push(
      `Sur une facture isolée, les frais annuels de la société (comptabilité, dépôt des comptes : environ ${(p.accounting_cost || 0).toLocaleString("fr-FR")} €) ne sont pas déduits. Passez en vue annuelle pour les intégrer.`
    );
  } else if (revenue - expenses < (p.accounting_cost || 0) * 3) {
    warnings.push("À ce niveau d'activité, les frais de structure d'une société pèsent lourd face à une micro-entreprise.");
  }
  return {
    regime,
    currency: regime.currency,
    revenue,
    lines,
    totalCharges: round(revenue - expenses - net),
    net: round(net),
    netRate: revenue > 0 ? net / revenue : 0,
    warnings
  };
}
function formatAmount(amount, currency) {
  if (currency === "DZD") {
    return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(amount) + " DA";
  }
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
}
function convertFromEur(amount, currency, eurToDzd) {
  return currency === "DZD" ? amount * eurToDzd : amount;
}
const MARGINAL_RATES = [
  { value: 0, label: "Non imposable" },
  { value: 0.11, label: "11 %" },
  { value: 0.3, label: "30 %" },
  { value: 0.41, label: "41 %" },
  { value: 0.45, label: "45 %" }
];
function TaxSimulator({ defaultAmount = 1500, compact = false, title = "Ce qu'il vous reste" }) {
  const { regimes, settings, activeRegime, loading, error } = useTaxRegimes();
  const [amount, setAmount] = useState(String(defaultAmount));
  const [expenses, setExpenses] = useState("");
  const [liberatory, setLiberatory] = useState(true);
  const [marginalRate, setMarginalRate] = useState(0.11);
  const [salaryShare, setSalaryShare] = useState(0.5);
  const [revenueToDate, setRevenueToDate] = useState("");
  const [quotes, setQuotes] = useState([]);
  const [quoteId, setQuoteId] = useState("");
  const [selectedIds, setSelectedIds] = useState(null);
  const [annual, setAnnual] = useState(false);
  const eurToDzd = Number(settings == null ? void 0 : settings.eur_to_dzd) || 145;
  useEffect(() => {
    supabase.from("quotes").select("id, quote_number, title, total_amount").order("created_at", { ascending: false }).limit(50).then(({ data }) => setQuotes(data || []));
  }, []);
  const pickQuote = (id) => {
    setQuoteId(id);
    const quote = quotes.find((q) => q.id === id);
    if (quote) setAmount(String(quote.total_amount));
  };
  const visibleRegimes = compact && activeRegime ? [activeRegime] : regimes.filter((r) => !selectedIds || selectedIds.includes(r.id));
  const toggleRegime = (id) => {
    setSelectedIds((prev) => {
      const current = prev ?? regimes.map((r) => r.id);
      const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
      return next.length === 0 ? current : next;
    });
  };
  const results = useMemo(() => {
    const eurAmount = parseFloat(amount) || 0;
    const eurExpenses = parseFloat(expenses) || 0;
    const eurToDate = parseFloat(revenueToDate) || 0;
    const list = visibleRegimes;
    return list.map((regime) => {
      const input = {
        revenue: convertFromEur(eurAmount, regime.currency, eurToDzd),
        expenses: convertFromEur(eurExpenses, regime.currency, eurToDzd),
        revenueToDate: convertFromEur(eurToDate, regime.currency, eurToDzd),
        liberatoryTax: liberatory,
        marginalRate,
        salaryShare,
        annual
      };
      return simulate(regime, input);
    });
  }, [amount, expenses, revenueToDate, liberatory, marginalRate, salaryShare, annual, visibleRegimes, eurToDzd]);
  const inEur = (amount2, currency) => currency === "EUR" || !eurToDzd ? null : formatAmount(amount2 / eurToDzd, "EUR");
  const hasCorporate = results.some((r) => !isMicro(r.regime.params));
  const inputClass2 = "w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500";
  if (loading) return /* @__PURE__ */ jsx("div", { className: "bg-gray-900 border border-gray-800 rounded-xl p-5 text-sm text-gray-500", children: "Chargement des barèmes…" });
  return /* @__PURE__ */ jsxs("div", { className: "bg-gray-900 border border-gray-800 rounded-xl p-5 print:hidden", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-baseline justify-between gap-3 mb-4 flex-wrap", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-white", children: title }),
      activeRegime && /* @__PURE__ */ jsxs("span", { className: "text-xs text-gray-500", children: [
        "Statut actuel : ",
        activeRegime.label,
        " · barème ",
        activeRegime.fiscal_year
      ] })
    ] }),
    error && /* @__PURE__ */ jsx("p", { className: "text-sm text-red-400 mb-3", children: error }),
    !compact && regimes.length > 1 && /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
      /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-400 mb-2", children: "Statuts à comparer" }),
      /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: regimes.map((regime) => {
        const on = !selectedIds || selectedIds.includes(regime.id);
        return /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => toggleRegime(regime.id),
            className: `px-3 py-1.5 text-xs rounded-lg transition-colors ${on ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white"}`,
            children: regime.label
          },
          regime.id
        );
      }) })
    ] }),
    !compact && quotes.length > 0 && /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
      /* @__PURE__ */ jsx("label", { className: "block text-xs text-gray-400 mb-1", children: "Partir d'un devis enregistré" }),
      /* @__PURE__ */ jsxs(
        "select",
        {
          value: quoteId,
          onChange: (e) => pickQuote(e.target.value),
          className: "w-full sm:w-96 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500",
          children: [
            /* @__PURE__ */ jsx("option", { value: "", children: "Saisir un montant librement" }),
            quotes.map((q) => /* @__PURE__ */ jsxs("option", { value: q.id, children: [
              q.quote_number,
              " · ",
              q.title,
              " · ",
              q.total_amount.toLocaleString("fr-FR"),
              " €"
            ] }, q.id))
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2 mb-4", children: [
      { value: false, label: "Une facture" },
      { value: true, label: "Mon année entière" }
    ].map((opt) => /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        onClick: () => setAnnual(opt.value),
        className: `px-3 py-1.5 text-xs rounded-lg transition-colors ${annual === opt.value ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white"}`,
        children: opt.label
      },
      String(opt.value)
    )) }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-xs text-gray-400 mb-1", children: annual ? "Chiffre d'affaires annuel (€ HT)" : "Montant facturé (€ HT)" }),
        /* @__PURE__ */ jsx("input", { type: "number", min: "0", step: "50", value: amount, onChange: (e) => setAmount(e.target.value), className: inputClass2 })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-xs text-gray-400 mb-1", children: "Charges réelles (€)" }),
        /* @__PURE__ */ jsx("input", { type: "number", min: "0", step: "50", value: expenses, onChange: (e) => setExpenses(e.target.value), placeholder: "0", className: inputClass2 })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-xs text-gray-400 mb-1", children: "Déjà facturé cette année (€)" }),
        /* @__PURE__ */ jsx("input", { type: "number", min: "0", step: "500", value: revenueToDate, onChange: (e) => setRevenueToDate(e.target.value), placeholder: "0", className: inputClass2 })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-xs text-gray-400 mb-1", children: "Impôt sur le revenu" }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            value: liberatory ? "lib" : String(marginalRate),
            onChange: (e) => {
              if (e.target.value === "lib") setLiberatory(true);
              else {
                setLiberatory(false);
                setMarginalRate(parseFloat(e.target.value));
              }
            },
            className: inputClass2,
            children: [
              /* @__PURE__ */ jsx("option", { value: "lib", children: "Versement libératoire" }),
              MARGINAL_RATES.map((r) => /* @__PURE__ */ jsxs("option", { value: r.value, children: [
                "Barème : tranche ",
                r.label
              ] }, r.value))
            ]
          }
        )
      ] })
    ] }),
    hasCorporate && /* @__PURE__ */ jsxs("div", { className: "mb-5", children: [
      /* @__PURE__ */ jsxs("label", { className: "block text-xs text-gray-400 mb-1", children: [
        "En société : ",
        Math.round(salaryShare * 100),
        " % versés en rémunération, le reste en dividendes"
      ] }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "range",
          min: "0",
          max: "1",
          step: "0.05",
          value: salaryShare,
          onChange: (e) => setSalaryShare(parseFloat(e.target.value)),
          className: "w-full accent-blue-600"
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: `grid gap-3 ${compact ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2"}`, children: results.map((result) => {
      const isActive = result.regime.id === (activeRegime == null ? void 0 : activeRegime.id);
      const best = results.reduce((a, b) => b.netRate > a.netRate ? b : a, results[0]);
      const isBest = !compact && results.length > 1 && result.regime.id === best.regime.id;
      return /* @__PURE__ */ jsxs(
        "div",
        {
          className: `rounded-lg p-4 border ${isActive ? "border-blue-600/60 bg-blue-600/5" : "border-gray-800 bg-gray-800/40"}`,
          children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-2 mb-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-white", children: result.regime.label }),
                /* @__PURE__ */ jsx("p", { className: "text-[11px] text-gray-500", children: result.regime.country === "DZ" ? `Converti à ${eurToDzd} DA pour 1 €` : `Barème ${result.regime.fiscal_year}` })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-end gap-1 flex-shrink-0", children: [
                isActive && /* @__PURE__ */ jsx("span", { className: "px-1.5 py-0.5 text-[10px] rounded bg-blue-500/20 text-blue-400", children: "Statut actuel" }),
                isBest && !isActive && /* @__PURE__ */ jsx("span", { className: "px-1.5 py-0.5 text-[10px] rounded bg-green-500/20 text-green-400", children: "Plus favorable" })
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "space-y-1.5 mb-3", children: result.lines.map((line, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-baseline justify-between gap-3 text-xs", children: [
              /* @__PURE__ */ jsxs("span", { className: line.kind === "net" ? "text-gray-300" : "text-gray-500", children: [
                line.label,
                line.hint && /* @__PURE__ */ jsx("span", { className: "block text-[10px] text-gray-600", children: line.hint })
              ] }),
              /* @__PURE__ */ jsxs("span", { className: "flex-shrink-0 text-right", children: [
                /* @__PURE__ */ jsxs("span", { className: `tabular-nums block ${line.kind === "net" ? "text-green-400 font-medium" : line.kind === "info" ? "text-gray-500" : "text-amber-400"}`, children: [
                  line.kind === "charge" || line.kind === "tax" ? "− " : "",
                  formatAmount(line.amount, result.currency)
                ] }),
                inEur(line.amount, result.currency) && /* @__PURE__ */ jsxs("span", { className: "block text-[10px] text-gray-600 tabular-nums", children: [
                  "soit ",
                  inEur(line.amount, result.currency)
                ] })
              ] })
            ] }, i)) }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-baseline justify-between gap-3 pt-3 border-t border-gray-700", children: [
              /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-300", children: "Il vous reste" }),
              /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
                /* @__PURE__ */ jsx("p", { className: "text-lg font-bold text-green-400 tabular-nums", children: formatAmount(result.net, result.currency) }),
                inEur(result.net, result.currency) && /* @__PURE__ */ jsxs("p", { className: "text-xs text-green-400/70 tabular-nums", children: [
                  "soit ",
                  inEur(result.net, result.currency)
                ] }),
                /* @__PURE__ */ jsxs("p", { className: "text-[11px] text-gray-500 tabular-nums", children: [
                  Math.round(result.netRate * 100),
                  " % du montant facturé"
                ] })
              ] })
            ] }),
            result.warnings.length > 0 && /* @__PURE__ */ jsx("div", { className: "mt-3 space-y-1", children: result.warnings.map((w, i) => /* @__PURE__ */ jsx("p", { className: "text-[11px] text-amber-400/90", children: w }, i)) })
          ]
        },
        result.regime.id
      );
    }) }),
    /* @__PURE__ */ jsx("p", { className: "text-[11px] text-gray-600 mt-4", children: "Estimation destinée à fixer un tarif. Les barèmes sont saisis dans les réglages et doivent être vérifiés chaque année ; ce calcul ne remplace pas l'avis d'un comptable." })
  ] });
}
const STATUS_BADGE$4 = {
  draft: { label: "Brouillon", bg: "bg-gray-500/20", text: "text-gray-400" },
  sent: { label: "Envoyé", bg: "bg-blue-500/20", text: "text-blue-400" },
  accepted: { label: "Accepté", bg: "bg-green-500/20", text: "text-green-400" },
  rejected: { label: "Refusé", bg: "bg-red-500/20", text: "text-red-400" },
  expired: { label: "Expiré", bg: "bg-amber-500/20", text: "text-amber-400" }
};
const inputClass$3 = "w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500";
function QuoteDetailPage() {
  var _a, _b;
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id || id === "new";
  const [quoteNumber, setQuoteNumber] = useState("");
  const [clientId, setClientId] = useState(null);
  const [projectId, setProjectId] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("draft");
  const [validUntil, setValidUntil] = useState(format(addDays(/* @__PURE__ */ new Date(), 30), "yyyy-MM-dd"));
  const [terms, setTerms] = useState(BUSINESS.defaultPaymentTerms);
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState([]);
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [saving, setSaving] = useState(false);
  const { profile } = useTeam();
  const [pdfOpen, setPdfOpen] = useState(false);
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [createdBy, setCreatedBy] = useState(null);
  const [durationNote, setDurationNote] = useState(null);
  const fetchQuote = useCallback(async () => {
    if (isNew || !id) return;
    const { data, error } = await supabase.from("quotes").select("*").eq("id", id).single();
    if (error) {
      console.error("Fetch quote error:", error);
      return;
    }
    if (data) {
      const q = data;
      setQuoteNumber(q.quote_number);
      setClientId(q.client_id);
      setProjectId(q.project_id);
      setTitle(q.title);
      setDescription(q.description || "");
      setStatus(q.status);
      setCreatedBy(q.owner_id ?? q.created_by ?? null);
      setDurationNote(q.duration_note ?? null);
      setValidUntil(q.valid_until || "");
      setTerms(q.terms || "");
      setNotes(q.notes || "");
    }
    const { data: itemsData, error: itemsError } = await supabase.from("quote_items").select("*").eq("quote_id", id).order("position", { ascending: true });
    if (itemsError) console.error("Fetch items error:", itemsError);
    if (itemsData) {
      setItems(
        itemsData.map((i) => ({
          id: i.id,
          description: i.description,
          unit: i.unit ?? null,
          quantity: i.quantity,
          unit_price: i.unit_price,
          position: i.position
        }))
      );
    }
  }, [id, isNew]);
  const fetchReferenceData = useCallback(async () => {
    const [clientsRes, projectsRes] = await Promise.all([
      supabase.from("clients").select("*").order("name"),
      supabase.from("projects").select("*").order("name")
    ]);
    if (clientsRes.data) setClients(clientsRes.data);
    if (projectsRes.data) setProjects(projectsRes.data);
  }, []);
  const generateQuoteNumber = useCallback(async () => {
    const { data, error } = await supabase.rpc("next_sequence_number", { seq_id: "quote" });
    if (error) console.error("Generate quote number error:", error);
    if (data) setQuoteNumber(data);
  }, []);
  useEffect(() => {
    fetchReferenceData();
    if (isNew) {
      generateQuoteNumber();
    } else {
      fetchQuote();
    }
  }, [isNew, fetchQuote, fetchReferenceData, generateQuoteNumber]);
  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, unit_price: 0, position: items.length }]);
  };
  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };
  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };
  const addFromGrid = (gridItem) => {
    setItems([
      ...items,
      {
        description: gridItem.label + " · " + gridItem.description,
        quantity: 1,
        unit_price: Math.round((gridItem.min + gridItem.max) / 2),
        position: items.length
      }
    ]);
  };
  const totalHT = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
  const handleSave = async (newStatus) => {
    setSaving(true);
    const total = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
    const quoteData = {
      quote_number: quoteNumber,
      client_id: clientId,
      project_id: projectId,
      title,
      description: description || null,
      status: newStatus || status,
      valid_until: validUntil || null,
      terms: terms || null,
      notes: notes || null,
      total_amount: total
    };
    if (newStatus === "sent") {
      quoteData.sent_at = (/* @__PURE__ */ new Date()).toISOString();
    }
    if (newStatus === "accepted") {
      quoteData.accepted_at = (/* @__PURE__ */ new Date()).toISOString();
    }
    let quoteId = id;
    if (isNew) {
      quoteData.created_by = (profile == null ? void 0 : profile.id) ?? null;
      const { data, error } = await supabase.from("quotes").insert(quoteData).select().single();
      if (error) {
        console.error("Insert quote error:", error);
        setSaving(false);
        return;
      }
      quoteId = data.id;
    } else {
      const { error } = await supabase.from("quotes").update(quoteData).eq("id", id);
      if (error) {
        console.error("Update quote error:", error);
        setSaving(false);
        return;
      }
      await supabase.from("quote_items").delete().eq("quote_id", id);
    }
    if (items.length > 0) {
      const { error: itemsError } = await supabase.from("quote_items").insert(
        items.map((item, index) => ({
          quote_id: quoteId,
          description: item.description,
          unit: item.unit || null,
          quantity: item.quantity,
          unit_price: item.unit_price,
          position: index
        }))
      );
      if (itemsError) console.error("Insert items error:", itemsError);
    }
    if (newStatus) setStatus(newStatus);
    setSaving(false);
    if (isNew) {
      navigate(`/dashboard/quotes/${quoteId}`, { replace: true });
    } else {
      fetchQuote();
    }
  };
  const handleConvertToInvoice = async () => {
    const { data: quoteItems } = await supabase.from("quote_items").select("*").eq("quote_id", id);
    const { data: invoiceNumber } = await supabase.rpc("next_sequence_number", { seq_id: "invoice" });
    if (!invoiceNumber) {
      setSaving(false);
      alert("Le numéro de facture n'a pas pu être généré.");
      return;
    }
    const dueDate = /* @__PURE__ */ new Date();
    dueDate.setDate(dueDate.getDate() + 30);
    const { data: invoice, error } = await supabase.from("invoices").insert({
      invoice_number: invoiceNumber,
      quote_id: id,
      client_id: clientId,
      project_id: projectId,
      title,
      description: description || null,
      terms: terms || null,
      total_amount: totalHT,
      due_date: dueDate.toISOString().slice(0, 10),
      status: "draft"
    }).select().single();
    if (error) {
      console.error("Create invoice error:", error);
      return;
    }
    if (invoice && quoteItems) {
      await supabase.from("invoice_items").insert(
        quoteItems.map((i) => ({
          invoice_id: invoice.id,
          description: i.description,
          unit: i.unit ?? null,
          quantity: i.quantity,
          unit_price: i.unit_price,
          position: i.position
        }))
      );
    }
    if (invoice) navigate(`/dashboard/invoices/${invoice.id}`);
  };
  const badge = STATUS_BADGE$4[status];
  const clientEmail = ((_a = clients.find((c) => c.id === clientId)) == null ? void 0 : _a.email) ?? null;
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-gray-950 p-4 sm:p-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => navigate("/dashboard/quotes"),
            className: "p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800",
            children: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" }) })
          }
        ),
        /* @__PURE__ */ jsx("h1", { className: "text-lg font-bold text-white", children: isNew ? "Nouveau devis" : quoteNumber }),
        !isNew && /* @__PURE__ */ jsx("span", { className: `inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full ${badge.bg} ${badge.text}`, children: badge.label })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        status === "draft" && /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => handleSave("sent"),
            disabled: saving,
            className: "px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50",
            children: "Marquer comme envoyé"
          }
        ),
        status === "sent" && /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => handleSave("accepted"),
            disabled: saving,
            className: "px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50",
            children: "Marquer comme accepté"
          }
        ),
        status === "accepted" && /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleConvertToInvoice,
            disabled: saving,
            className: "px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50",
            children: "Convertir en facture"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setPdfOpen(true),
            className: "px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors",
            children: "Imprimer / PDF"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "lg:col-span-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4", children: "Client & Projet" }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Client" }),
              /* @__PURE__ */ jsxs(
                "select",
                {
                  value: clientId || "",
                  onChange: (e) => setClientId(e.target.value || null),
                  className: inputClass$3,
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "", children: "-- Sélectionner un client --" }),
                    clients.map((client) => /* @__PURE__ */ jsx("option", { value: client.id, children: client.name }, client.id))
                  ]
                }
              ),
              clientId && (() => {
                const picked = clients.find((c) => c.id === clientId);
                const missing = picked && !picked.address && !picked.siren && !picked.rcs;
                return /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => setClientModalOpen(true),
                    className: `mt-1.5 text-xs transition-colors ${missing ? "text-amber-400 hover:text-amber-300" : "text-blue-400 hover:text-blue-300"}`,
                    children: missing ? "Aucune mention légale sur cette fiche : la compléter" : "Modifier les mentions de ce client"
                  }
                );
              })()
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Projet" }),
              /* @__PURE__ */ jsxs(
                "select",
                {
                  value: projectId || "",
                  onChange: (e) => setProjectId(e.target.value || null),
                  className: inputClass$3,
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "", children: "-- Aucun projet --" }),
                    projects.map((project) => /* @__PURE__ */ jsx("option", { value: project.id, children: project.name }, project.id))
                  ]
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4", children: "Titre & Description" }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Titre *" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "text",
                  value: title,
                  onChange: (e) => setTitle(e.target.value),
                  placeholder: "Titre du devis",
                  required: true,
                  className: inputClass$3
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Description" }),
              /* @__PURE__ */ jsx(
                "textarea",
                {
                  value: description,
                  onChange: (e) => setDescription(e.target.value),
                  placeholder: "Description optionnelle...",
                  rows: 3,
                  className: inputClass$3
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
            /* @__PURE__ */ jsx("h2", { className: "text-sm font-semibold text-gray-300 uppercase tracking-wider", children: "Lignes du devis" }),
            /* @__PURE__ */ jsxs(
              "select",
              {
                value: "",
                onChange: (e) => {
                  const idx = parseInt(e.target.value);
                  if (!isNaN(idx)) addFromGrid(PRICING_GRID[idx]);
                },
                className: "px-3 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded-lg text-gray-300 focus:outline-none focus:border-blue-500",
                children: [
                  /* @__PURE__ */ jsx("option", { value: "", children: "Ajouter depuis la grille tarifaire" }),
                  PRICING_GRID.map((item, index) => /* @__PURE__ */ jsxs("option", { value: index, children: [
                    item.label,
                    " (",
                    formatCurrency(item.min),
                    " - ",
                    formatCurrency(item.max),
                    ")"
                  ] }, item.type))
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full", children: [
            /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-700", children: [
              /* @__PURE__ */ jsx("th", { className: "text-left pb-2 text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Description" }),
              /* @__PURE__ */ jsx("th", { className: "text-left pb-2 text-xs font-medium text-gray-500 uppercase tracking-wider w-20", children: "Unité" }),
              /* @__PURE__ */ jsx("th", { className: "text-left pb-2 text-xs font-medium text-gray-500 uppercase tracking-wider w-20", children: "Quantité" }),
              /* @__PURE__ */ jsx("th", { className: "text-left pb-2 text-xs font-medium text-gray-500 uppercase tracking-wider w-28", children: "Prix unitaire" }),
              /* @__PURE__ */ jsx("th", { className: "text-right pb-2 text-xs font-medium text-gray-500 uppercase tracking-wider w-28", children: "Total" }),
              /* @__PURE__ */ jsx("th", { className: "pb-2 w-10" })
            ] }) }),
            /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-gray-800", children: items.map((item, index) => /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { className: "py-2 pr-2", children: /* @__PURE__ */ jsx(
                "textarea",
                {
                  rows: 2,
                  value: item.description,
                  onChange: (e) => updateItem(index, "description", e.target.value),
                  placeholder: "Intitulé de la prestation\n1.1 Sous-point : ce qu'il comprend",
                  className: inputClass$3
                }
              ) }),
              /* @__PURE__ */ jsx("td", { className: "py-2 pr-2", children: /* @__PURE__ */ jsx(
                "input",
                {
                  type: "number",
                  value: item.quantity,
                  onChange: (e) => updateItem(index, "quantity", parseInt(e.target.value) || 1),
                  min: 1,
                  step: 1,
                  className: `${inputClass$3} w-20`
                }
              ) }),
              /* @__PURE__ */ jsx("td", { className: "py-2 pr-2", children: /* @__PURE__ */ jsx(
                "input",
                {
                  type: "number",
                  value: item.unit_price,
                  onChange: (e) => updateItem(index, "unit_price", parseFloat(e.target.value) || 0),
                  min: 0,
                  step: 0.01,
                  className: `${inputClass$3} w-28`
                }
              ) }),
              /* @__PURE__ */ jsx("td", { className: "py-2 pr-2 text-right text-sm font-medium text-white whitespace-nowrap", children: formatCurrency(item.quantity * item.unit_price) }),
              /* @__PURE__ */ jsx("td", { className: "py-2", children: /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => removeItem(index),
                  className: "p-1.5 text-gray-400 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10",
                  title: "Supprimer la ligne",
                  children: /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M6 18L18 6M6 6l12 12" }) })
                }
              ) })
            ] }, index)) })
          ] }) }),
          items.length === 0 && /* @__PURE__ */ jsx("div", { className: "text-center py-8 text-sm text-gray-500", children: "Aucune ligne. Ajoutez des lignes au devis." }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: addItem,
              className: "mt-4 px-4 py-2 text-sm text-blue-400 hover:text-blue-300 border border-dashed border-gray-700 hover:border-blue-500 rounded-lg transition-colors w-full",
              children: "+ Ajouter une ligne"
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "mt-6 pt-4 border-t border-gray-700", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-gray-300", children: "Total HT" }),
              /* @__PURE__ */ jsx("span", { className: "text-lg font-bold text-white", children: formatCurrency(totalHT) })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs italic text-gray-500", children: "TVA non applicable, article 293 B du CGI" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "lg:col-span-1", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4", children: "Validité" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Valable jusqu'au" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "date",
                value: validUntil,
                onChange: (e) => setValidUntil(e.target.value),
                className: inputClass$3
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4", children: "Conditions" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Conditions de paiement" }),
            /* @__PURE__ */ jsx(
              "textarea",
              {
                value: terms,
                onChange: (e) => setTerms(e.target.value),
                rows: 4,
                className: inputClass$3
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4", children: "Notes" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Notes internes" }),
            /* @__PURE__ */ jsx(
              "textarea",
              {
                value: notes,
                onChange: (e) => setNotes(e.target.value),
                placeholder: "Notes visibles sur le devis...",
                rows: 3,
                className: inputClass$3
              }
            )
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-3 mt-6", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => handleSave(),
          disabled: saving,
          className: "px-5 py-2.5 text-sm bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50",
          children: saving ? "Sauvegarde..." : "Sauvegarder"
        }
      ),
      (status === "draft" || isNew) && /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => handleSave("sent"),
          disabled: saving,
          className: "px-5 py-2.5 text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50",
          children: "Marquer comme envoyé"
        }
      ),
      status === "sent" && /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => handleSave("accepted"),
          disabled: saving,
          className: "px-5 py-2.5 text-sm bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50",
          children: "Marquer comme accepté"
        }
      ),
      status === "accepted" && /* @__PURE__ */ jsx(
        "button",
        {
          onClick: handleConvertToInvoice,
          disabled: saving,
          className: "px-5 py-2.5 text-sm bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50",
          children: "Convertir en facture"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setPdfOpen(true),
          className: "px-5 py-2.5 text-sm bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors",
          children: "Imprimer / PDF"
        }
      )
    ] }),
    !isNew && /* @__PURE__ */ jsx("div", { className: "print:hidden mt-6", children: /* @__PURE__ */ jsx(TaxSimulator, { defaultAmount: items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0), compact: true }) }),
    !isNew && id && /* @__PURE__ */ jsx("div", { className: "print:hidden mt-6", children: /* @__PURE__ */ jsx(ShareLinkPanel, { entityType: "quote", entityId: id, defaultAllowAccept: true, defaultEmail: clientEmail }) }),
    !isNew && id && /* @__PURE__ */ jsx("div", { className: "print:hidden mt-6", children: /* @__PURE__ */ jsx(CommentThread, { entityType: "quote", entityId: id, title: "Discussion interne" }) }),
    pdfOpen && /* @__PURE__ */ jsx(
      DocumentPDF,
      {
        type: "quote",
        number: quoteNumber,
        date: (/* @__PURE__ */ new Date()).toISOString(),
        validUntil: validUntil || null,
        title,
        description: description || null,
        durationNote,
        client: clients.find((c) => c.id === clientId) ?? null,
        items: items.map((i) => ({ description: i.description, unit: i.unit ?? null, quantity: i.quantity, unit_price: i.unit_price })),
        total: items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0),
        terms: terms || null,
        notes: notes || null,
        projectName: ((_b = projects.find((p) => p.id === projectId)) == null ? void 0 : _b.name) ?? null,
        createdBy,
        onClose: () => setPdfOpen(false)
      }
    ),
    clientModalOpen && /* @__PURE__ */ jsx(
      ClientModal,
      {
        open: clientModalOpen,
        onClose: () => setClientModalOpen(false),
        client: clients.find((c) => c.id === clientId) ?? null,
        projects,
        onSave: async (data) => {
          if (!clientId) return;
          const { error } = await supabase.from("clients").update(data).eq("id", clientId);
          if (error) {
            alert("La fiche client n'a pas pu être enregistrée.");
            return;
          }
          fetchReferenceData();
        }
      }
    )
  ] });
}
const STATUS_BADGE$3 = {
  draft: { label: "Brouillon", bg: "bg-gray-500/20", text: "text-gray-400" },
  sent: { label: "Envoyée", bg: "bg-blue-500/20", text: "text-blue-400" },
  paid: { label: "Payée", bg: "bg-green-500/20", text: "text-green-400" },
  partial: { label: "Partielle", bg: "bg-amber-500/20", text: "text-amber-400" },
  overdue: { label: "En retard", bg: "bg-red-500/20", text: "text-red-400" },
  cancelled: { label: "Annulée", bg: "bg-gray-500/20", text: "text-gray-400" }
};
function InvoicesPage() {
  const { activeRegime } = useTaxRegimes();
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [filterStatus, setFilterStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const fetchAll = useCallback(async () => {
    const { data, error } = await supabase.from("invoices").select("*, client:clients(id, name)").order("created_at", { ascending: false });
    if (error) console.error("Fetch invoices error:", error);
    if (data) setInvoices(data);
  }, []);
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);
  const filtered = invoices.filter((inv) => !filterStatus || inv.status === filterStatus).filter((inv) => {
    var _a, _b;
    if (!searchQuery) return true;
    const clientName = ((_b = (_a = inv.client) == null ? void 0 : _a.name) == null ? void 0 : _b.toLowerCase()) ?? "";
    return clientName.includes(searchQuery.toLowerCase());
  });
  const unpaidStatuses = ["sent", "partial", "overdue"];
  const unpaidInvoices = invoices.filter((inv) => unpaidStatuses.includes(inv.status));
  const unpaidCount = unpaidInvoices.length;
  const unpaidAmount = unpaidInvoices.reduce((sum, inv) => sum + (inv.total_amount - inv.paid_amount), 0);
  const now = /* @__PURE__ */ new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();
  const caEncaisse = invoices.filter((inv) => inv.paid_at && inv.paid_at >= currentMonthStart && inv.paid_at <= currentMonthEnd).reduce((sum, inv) => sum + inv.paid_amount, 0);
  const taxParams = activeRegime && isMicro(activeRegime.params) ? activeRegime.params : null;
  const chargeRate = ((taxParams == null ? void 0 : taxParams.social_rate) ?? 0.212) + ((taxParams == null ? void 0 : taxParams.training_rate) ?? 1e-3);
  const charges = { totalCharges: caEncaisse * chargeRate };
  const isOverdue = (inv) => inv.due_date && isPast(parseISO(inv.due_date)) && inv.status !== "paid" && inv.status !== "cancelled";
  const handleMarkPaid = async (invoice) => {
    await supabase.from("invoices").update({
      status: "paid",
      paid_amount: invoice.total_amount,
      paid_at: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("id", invoice.id);
    fetchAll();
  };
  const handleDelete = async (id) => {
    if (!confirm("Supprimer cette facture ?")) return;
    await supabase.from("invoices").delete().eq("id", id);
    fetchAll();
  };
  return /* @__PURE__ */ jsxs("div", { className: "p-4 sm:p-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-gray-900 border border-gray-800 rounded-xl p-4", children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 uppercase tracking-wider mb-1", children: "Factures impayées" }),
        /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-red-400", children: unpaidCount })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-gray-900 border border-gray-800 rounded-xl p-4", children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 uppercase tracking-wider mb-1", children: "Montant impayé" }),
        /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-amber-400", children: formatCurrency(unpaidAmount) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-gray-900 border border-gray-800 rounded-xl p-4", children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 uppercase tracking-wider mb-1", children: "CA encaissé du mois" }),
        /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-green-400", children: formatCurrency(caEncaisse) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-gray-900 border border-gray-800 rounded-xl p-4", children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 uppercase tracking-wider mb-1", children: "Charges URSSAF estimées" }),
        /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-purple-400", children: formatCurrency(charges.totalCharges) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxs(
          "select",
          {
            value: filterStatus,
            onChange: (e) => setFilterStatus(e.target.value),
            className: "px-3 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded-lg text-gray-300 focus:outline-none focus:border-blue-500",
            children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "Toutes" }),
              /* @__PURE__ */ jsx("option", { value: "draft", children: "Brouillon" }),
              /* @__PURE__ */ jsx("option", { value: "sent", children: "Envoyée" }),
              /* @__PURE__ */ jsx("option", { value: "paid", children: "Payée" }),
              /* @__PURE__ */ jsx("option", { value: "partial", children: "Partielle" }),
              /* @__PURE__ */ jsx("option", { value: "overdue", children: "En retard" }),
              /* @__PURE__ */ jsx("option", { value: "cancelled", children: "Annulée" })
            ]
          }
        ),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            placeholder: "Rechercher un client...",
            value: searchQuery,
            onChange: (e) => setSearchQuery(e.target.value),
            className: "px-3 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:border-blue-500"
          }
        )
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => navigate("/dashboard/invoices/new"),
          className: "px-4 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors",
          children: "+ Nouvelle facture"
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "bg-gray-900 border border-gray-800 rounded-xl overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full", children: [
      /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-800", children: [
        /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Numéro" }),
        /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Client" }),
        /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Titre" }),
        /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Montant" }),
        /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Payé" }),
        /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Reste dû" }),
        /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Statut" }),
        /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Échéance" }),
        /* @__PURE__ */ jsx("th", { className: "text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-gray-800", children: filtered.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 9, className: "px-4 py-8 text-center text-sm text-gray-500", children: "Aucune facture" }) }) : filtered.map((invoice) => {
        var _a;
        const badge = STATUS_BADGE$3[invoice.status];
        const resteDu = invoice.total_amount - invoice.paid_amount;
        const overdue = isOverdue(invoice);
        return /* @__PURE__ */ jsxs(
          "tr",
          {
            className: `hover:bg-gray-800/50 transition-colors cursor-pointer ${overdue ? "bg-red-500/5" : ""}`,
            onClick: () => navigate(`/dashboard/invoices/${invoice.id}`),
            children: [
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-sm font-mono text-gray-300", children: invoice.invoice_number }),
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-sm text-white", children: ((_a = invoice.client) == null ? void 0 : _a.name) ?? "-" }),
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-sm text-gray-300 truncate max-w-xs", children: invoice.title }),
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-sm font-medium text-white", children: formatCurrency(invoice.total_amount) }),
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-sm text-green-400", children: formatCurrency(invoice.paid_amount) }),
              /* @__PURE__ */ jsx("td", { className: `px-4 py-3 text-sm font-medium ${resteDu > 0 ? "text-red-400" : "text-gray-400"}`, children: formatCurrency(resteDu) }),
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsx("span", { className: `inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${badge.bg} ${badge.text}`, children: badge.label }) }),
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-sm text-gray-400", children: invoice.due_date ? format(new Date(invoice.due_date), "dd/MM/yyyy", { locale: fr }) : "-" }),
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-1", onClick: (e) => e.stopPropagation(), children: [
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => navigate(`/dashboard/invoices/${invoice.id}`),
                    className: "p-1.5 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-700",
                    title: "Modifier",
                    children: /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" }) })
                  }
                ),
                invoice.status !== "paid" && invoice.status !== "cancelled" && /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => handleMarkPaid(invoice),
                    className: "p-1.5 text-gray-400 hover:text-green-400 transition-colors rounded-lg hover:bg-green-500/10",
                    title: "Marquer payée",
                    children: /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) })
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => handleDelete(invoice.id),
                    className: "p-1.5 text-gray-400 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10",
                    title: "Supprimer",
                    children: /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" }) })
                  }
                )
              ] }) })
            ]
          },
          invoice.id
        );
      }) })
    ] }) }) })
  ] });
}
const STATUS_BADGE$2 = {
  draft: { label: "Brouillon", bg: "bg-gray-500/20", text: "text-gray-400" },
  sent: { label: "Envoyée", bg: "bg-blue-500/20", text: "text-blue-400" },
  paid: { label: "Payée", bg: "bg-green-500/20", text: "text-green-400" },
  partial: { label: "Partiel", bg: "bg-amber-500/20", text: "text-amber-400" },
  overdue: { label: "En retard", bg: "bg-red-500/20", text: "text-red-400" },
  cancelled: { label: "Annulée", bg: "bg-red-500/20", text: "text-red-400" }
};
const METHOD_LABELS = {
  virement: "Virement",
  carte: "Carte bancaire",
  paypal: "PayPal",
  especes: "Espèces",
  cheque: "Chèque",
  autre: "Autre"
};
const inputClass$2 = "w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500";
function InvoiceDetailPage() {
  var _a, _b;
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id || id === "new";
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [clientId, setClientId] = useState(null);
  const [projectId, setProjectId] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("draft");
  const [issueDate, setIssueDate] = useState(format(/* @__PURE__ */ new Date(), "yyyy-MM-dd"));
  const [dueDate, setDueDate] = useState(format(addDays(/* @__PURE__ */ new Date(), 30), "yyyy-MM-dd"));
  const [terms, setTerms] = useState(BUSINESS.defaultPaymentTerms);
  const [notes, setNotes] = useState("");
  const [paidAmount, setPaidAmount] = useState(0);
  const [items, setItems] = useState([]);
  const [payments, setPayments] = useState([]);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("virement");
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentDate, setPaymentDate] = useState(format(/* @__PURE__ */ new Date(), "yyyy-MM-dd"));
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [saving, setSaving] = useState(false);
  const { profile } = useTeam();
  const [pdfOpen, setPdfOpen] = useState(false);
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [createdBy, setCreatedBy] = useState(null);
  const { activeRegime } = useTaxRegimes();
  const fetchInvoice = useCallback(async () => {
    if (isNew || !id) return;
    const { data, error } = await supabase.from("invoices").select("*").eq("id", id).single();
    if (error) {
      console.error("Fetch invoice error:", error);
      return;
    }
    if (data) {
      const inv = data;
      setInvoiceNumber(inv.invoice_number);
      setClientId(inv.client_id);
      setProjectId(inv.project_id);
      setTitle(inv.title);
      setDescription(inv.description || "");
      setStatus(inv.status);
      setCreatedBy(inv.owner_id ?? inv.created_by ?? null);
      setIssueDate(inv.issue_date || format(/* @__PURE__ */ new Date(), "yyyy-MM-dd"));
      setDueDate(inv.due_date || "");
      setTerms(inv.terms || "");
      setNotes(inv.notes || "");
      setPaidAmount(inv.paid_amount || 0);
    }
    const { data: itemsData, error: itemsError } = await supabase.from("invoice_items").select("*").eq("invoice_id", id).order("position", { ascending: true });
    if (itemsError) console.error("Fetch items error:", itemsError);
    if (itemsData) {
      setItems(
        itemsData.map((i) => ({
          id: i.id,
          description: i.description,
          unit: i.unit ?? null,
          quantity: i.quantity,
          unit_price: i.unit_price,
          position: i.position
        }))
      );
    }
    const { data: paymentsData, error: paymentsError } = await supabase.from("payments").select("*").eq("invoice_id", id).order("paid_at", { ascending: false });
    if (paymentsError) console.error("Fetch payments error:", paymentsError);
    if (paymentsData) {
      setPayments(paymentsData);
    }
  }, [id, isNew]);
  const fetchReferenceData = useCallback(async () => {
    const [clientsRes, projectsRes] = await Promise.all([
      supabase.from("clients").select("*").order("name"),
      supabase.from("projects").select("*").order("name")
    ]);
    if (clientsRes.data) setClients(clientsRes.data);
    if (projectsRes.data) setProjects(projectsRes.data);
  }, []);
  const generateInvoiceNumber = useCallback(async () => {
    const { data, error } = await supabase.rpc("next_sequence_number", { seq_id: "invoice" });
    if (error) console.error("Generate invoice number error:", error);
    if (data) setInvoiceNumber(data);
  }, []);
  useEffect(() => {
    fetchReferenceData();
    if (isNew) {
      generateInvoiceNumber();
    } else {
      fetchInvoice();
    }
  }, [isNew, fetchInvoice, fetchReferenceData, generateInvoiceNumber]);
  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, unit_price: 0, position: items.length }]);
  };
  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };
  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };
  const addFromGrid = (gridItem) => {
    setItems([
      ...items,
      {
        description: gridItem.label + " · " + gridItem.description,
        quantity: 1,
        unit_price: Math.round((gridItem.min + gridItem.max) / 2),
        position: items.length
      }
    ]);
  };
  const totalHT = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
  const resteDu = totalHT - paidAmount;
  const taxParams = activeRegime && isMicro(activeRegime.params) ? activeRegime.params : null;
  const socialRate = (taxParams == null ? void 0 : taxParams.social_rate) ?? 0.212;
  const trainingRate = (taxParams == null ? void 0 : taxParams.training_rate) ?? 1e-3;
  const ratePct = (rate) => (rate * 100).toLocaleString("fr-FR", { maximumFractionDigits: 2 });
  const charges = {
    urssaf: totalHT * socialRate,
    cfp: totalHT * trainingRate,
    net: totalHT * (1 - socialRate - trainingRate)
  };
  const handleSave = async (newStatus) => {
    setSaving(true);
    const total = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
    const invoiceData = {
      invoice_number: invoiceNumber,
      client_id: clientId,
      project_id: projectId,
      title,
      description: description || null,
      status: newStatus || status,
      issue_date: issueDate,
      due_date: dueDate || null,
      terms: terms || null,
      notes: notes || null,
      total_amount: total,
      paid_amount: paidAmount
    };
    if (newStatus === "sent") {
      invoiceData.sent_at = (/* @__PURE__ */ new Date()).toISOString();
    }
    if (newStatus === "paid") {
      invoiceData.paid_at = (/* @__PURE__ */ new Date()).toISOString();
      invoiceData.paid_amount = total;
    }
    let invoiceId = id;
    if (isNew) {
      invoiceData.created_by = (profile == null ? void 0 : profile.id) ?? null;
      const { data, error } = await supabase.from("invoices").insert(invoiceData).select().single();
      if (error) {
        console.error("Insert invoice error:", error);
        setSaving(false);
        return;
      }
      invoiceId = data.id;
    } else {
      const { error } = await supabase.from("invoices").update(invoiceData).eq("id", id);
      if (error) {
        console.error("Update invoice error:", error);
        setSaving(false);
        return;
      }
      await supabase.from("invoice_items").delete().eq("invoice_id", id);
    }
    if (items.length > 0) {
      const { error: itemsError } = await supabase.from("invoice_items").insert(
        items.map((item, index) => ({
          invoice_id: invoiceId,
          description: item.description,
          unit: item.unit || null,
          quantity: item.quantity,
          unit_price: item.unit_price,
          position: index
        }))
      );
      if (itemsError) console.error("Insert items error:", itemsError);
    }
    if (newStatus) setStatus(newStatus);
    setSaving(false);
    if (isNew) {
      navigate(`/dashboard/invoices/${invoiceId}`, { replace: true });
    } else {
      fetchInvoice();
    }
  };
  const handleSavePayment = async () => {
    const amount = parseFloat(paymentAmount);
    if (!amount || !id) return;
    await supabase.from("payments").insert({
      invoice_id: id,
      amount,
      method: paymentMethod,
      reference: paymentReference || null,
      paid_at: new Date(paymentDate).toISOString()
    });
    const newPaidAmount = paidAmount + amount;
    const total = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
    const newStatus = newPaidAmount >= total ? "paid" : "partial";
    await supabase.from("invoices").update({
      paid_amount: newPaidAmount,
      status: newStatus,
      ...newStatus === "paid" ? { paid_at: (/* @__PURE__ */ new Date()).toISOString() } : {}
    }).eq("id", id);
    setPaymentModalOpen(false);
    setPaymentAmount("");
    setPaymentReference("");
    fetchInvoice();
  };
  const badge = STATUS_BADGE$2[status];
  const clientEmail = ((_a = clients.find((c) => c.id === clientId)) == null ? void 0 : _a.email) ?? null;
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-gray-950 p-4 sm:p-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => navigate("/dashboard/invoices"),
            className: "p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800",
            children: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" }) })
          }
        ),
        /* @__PURE__ */ jsx("h1", { className: "text-lg font-bold text-white", children: isNew ? "Nouvelle facture" : invoiceNumber }),
        !isNew && /* @__PURE__ */ jsx("span", { className: `inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full ${badge.bg} ${badge.text}`, children: badge.label })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        status === "draft" && /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => handleSave("sent"),
            disabled: saving,
            className: "px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50",
            children: "Marquer comme envoyée"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setPdfOpen(true),
            className: "px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors",
            children: "Imprimer / PDF"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "lg:col-span-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4", children: "Client & Projet" }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Client" }),
              /* @__PURE__ */ jsxs(
                "select",
                {
                  value: clientId || "",
                  onChange: (e) => setClientId(e.target.value || null),
                  className: inputClass$2,
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "", children: "-- Sélectionner un client --" }),
                    clients.map((client) => /* @__PURE__ */ jsx("option", { value: client.id, children: client.name }, client.id))
                  ]
                }
              ),
              clientId && (() => {
                const picked = clients.find((c) => c.id === clientId);
                const missing = picked && !picked.address && !picked.siren && !picked.rcs;
                return /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => setClientModalOpen(true),
                    className: `mt-1.5 text-xs transition-colors ${missing ? "text-amber-400 hover:text-amber-300" : "text-blue-400 hover:text-blue-300"}`,
                    children: missing ? "Aucune mention légale sur cette fiche : la compléter" : "Modifier les mentions de ce client"
                  }
                );
              })()
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Projet" }),
              /* @__PURE__ */ jsxs(
                "select",
                {
                  value: projectId || "",
                  onChange: (e) => setProjectId(e.target.value || null),
                  className: inputClass$2,
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "", children: "-- Aucun projet --" }),
                    projects.map((project) => /* @__PURE__ */ jsx("option", { value: project.id, children: project.name }, project.id))
                  ]
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4", children: "Titre & Description" }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Titre *" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "text",
                  value: title,
                  onChange: (e) => setTitle(e.target.value),
                  placeholder: "Titre de la facture",
                  required: true,
                  className: inputClass$2
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Description" }),
              /* @__PURE__ */ jsx(
                "textarea",
                {
                  value: description,
                  onChange: (e) => setDescription(e.target.value),
                  placeholder: "Description optionnelle...",
                  rows: 3,
                  className: inputClass$2
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
            /* @__PURE__ */ jsx("h2", { className: "text-sm font-semibold text-gray-300 uppercase tracking-wider", children: "Lignes de la facture" }),
            /* @__PURE__ */ jsxs(
              "select",
              {
                value: "",
                onChange: (e) => {
                  const idx = parseInt(e.target.value);
                  if (!isNaN(idx)) addFromGrid(PRICING_GRID[idx]);
                },
                className: "px-3 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded-lg text-gray-300 focus:outline-none focus:border-blue-500",
                children: [
                  /* @__PURE__ */ jsx("option", { value: "", children: "Ajouter depuis la grille tarifaire" }),
                  PRICING_GRID.map((item, index) => /* @__PURE__ */ jsxs("option", { value: index, children: [
                    item.label,
                    " (",
                    formatCurrency(item.min),
                    " - ",
                    formatCurrency(item.max),
                    ")"
                  ] }, item.type))
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full", children: [
            /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-700", children: [
              /* @__PURE__ */ jsx("th", { className: "text-left pb-2 text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Description" }),
              /* @__PURE__ */ jsx("th", { className: "text-left pb-2 text-xs font-medium text-gray-500 uppercase tracking-wider w-20", children: "Unité" }),
              /* @__PURE__ */ jsx("th", { className: "text-left pb-2 text-xs font-medium text-gray-500 uppercase tracking-wider w-20", children: "Quantité" }),
              /* @__PURE__ */ jsx("th", { className: "text-left pb-2 text-xs font-medium text-gray-500 uppercase tracking-wider w-28", children: "Prix unitaire" }),
              /* @__PURE__ */ jsx("th", { className: "text-right pb-2 text-xs font-medium text-gray-500 uppercase tracking-wider w-28", children: "Total" }),
              /* @__PURE__ */ jsx("th", { className: "pb-2 w-10" })
            ] }) }),
            /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-gray-800", children: items.map((item, index) => /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { className: "py-2 pr-2", children: /* @__PURE__ */ jsx(
                "textarea",
                {
                  rows: 2,
                  value: item.description,
                  onChange: (e) => updateItem(index, "description", e.target.value),
                  placeholder: "Intitulé de la prestation\n1.1 Sous-point : ce qu'il comprend",
                  className: inputClass$2
                }
              ) }),
              /* @__PURE__ */ jsx("td", { className: "py-2 pr-2", children: /* @__PURE__ */ jsx(
                "input",
                {
                  type: "number",
                  value: item.quantity,
                  onChange: (e) => updateItem(index, "quantity", parseInt(e.target.value) || 1),
                  min: 1,
                  step: 1,
                  className: `${inputClass$2} w-20`
                }
              ) }),
              /* @__PURE__ */ jsx("td", { className: "py-2 pr-2", children: /* @__PURE__ */ jsx(
                "input",
                {
                  type: "number",
                  value: item.unit_price,
                  onChange: (e) => updateItem(index, "unit_price", parseFloat(e.target.value) || 0),
                  min: 0,
                  step: 0.01,
                  className: `${inputClass$2} w-28`
                }
              ) }),
              /* @__PURE__ */ jsx("td", { className: "py-2 pr-2 text-right text-sm font-medium text-white whitespace-nowrap", children: formatCurrency(item.quantity * item.unit_price) }),
              /* @__PURE__ */ jsx("td", { className: "py-2", children: /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => removeItem(index),
                  className: "p-1.5 text-gray-400 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10",
                  title: "Supprimer la ligne",
                  children: /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M6 18L18 6M6 6l12 12" }) })
                }
              ) })
            ] }, index)) })
          ] }) }),
          items.length === 0 && /* @__PURE__ */ jsx("div", { className: "text-center py-8 text-sm text-gray-500", children: "Aucune ligne. Ajoutez des lignes à la facture." }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: addItem,
              className: "mt-4 px-4 py-2 text-sm text-blue-400 hover:text-blue-300 border border-dashed border-gray-700 hover:border-blue-500 rounded-lg transition-colors w-full",
              children: "+ Ajouter une ligne"
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "mt-6 pt-4 border-t border-gray-700", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-gray-300", children: "Total HT" }),
              /* @__PURE__ */ jsx("span", { className: "text-lg font-bold text-white", children: formatCurrency(totalHT) })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs italic text-gray-500", children: "TVA non applicable, article 293 B du CGI" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "lg:col-span-1", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4", children: "Dates" }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Date d'émission" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "date",
                  value: issueDate,
                  onChange: (e) => setIssueDate(e.target.value),
                  className: inputClass$2
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Date d'échéance" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "date",
                  value: dueDate,
                  onChange: (e) => setDueDate(e.target.value),
                  className: inputClass$2
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4", children: "Conditions" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Conditions de paiement" }),
            /* @__PURE__ */ jsx(
              "textarea",
              {
                value: terms,
                onChange: (e) => setTerms(e.target.value),
                rows: 4,
                className: inputClass$2
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4", children: "Notes" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Notes internes" }),
            /* @__PURE__ */ jsx(
              "textarea",
              {
                value: notes,
                onChange: (e) => setNotes(e.target.value),
                placeholder: "Notes visibles sur la facture...",
                rows: 3,
                className: inputClass$2
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4", children: "Paiements reçus" }),
          payments.length > 0 ? /* @__PURE__ */ jsx("div", { className: "space-y-3 mb-4", children: payments.map((payment) => /* @__PURE__ */ jsx("div", { className: "flex items-start justify-between bg-gray-800 rounded-lg p-3", children: /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-white", children: formatCurrency(payment.amount) }),
            /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-400", children: [
              METHOD_LABELS[payment.method],
              " · ",
              format(new Date(payment.paid_at), "dd MMM yyyy", { locale: fr })
            ] }),
            payment.reference && /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-500 mt-0.5", children: [
              "Réf: ",
              payment.reference
            ] })
          ] }) }, payment.id)) }) : /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 mb-4", children: "Aucun paiement enregistré." }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2 pt-3 border-t border-gray-700", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-400", children: "Total facturé" }),
              /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-white", children: formatCurrency(totalHT) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-400", children: "Total payé" }),
              /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-white", children: formatCurrency(paidAmount) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between pt-2 border-t border-gray-700", children: [
              /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-gray-300", children: "Reste dû" }),
              /* @__PURE__ */ jsx("span", { className: `text-sm font-bold ${resteDu > 0 ? "text-red-400" : "text-green-400"}`, children: formatCurrency(resteDu) })
            ] })
          ] }),
          !isNew && /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setPaymentModalOpen(true),
              className: "mt-4 w-full px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors",
              children: "+ Enregistrer un paiement"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4", children: "Rentabilité" }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-400", children: "Montant facturé" }),
              /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-white", children: formatCurrency(totalHT) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-400", children: `Charges URSSAF (${ratePct(socialRate)} %)` }),
              /* @__PURE__ */ jsxs("span", { className: "text-sm font-medium text-red-400", children: [
                "-",
                formatCurrency(charges.urssaf)
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-400", children: `CFP (${ratePct(trainingRate)} %)` }),
              /* @__PURE__ */ jsxs("span", { className: "text-sm font-medium text-red-400", children: [
                "-",
                formatCurrency(charges.cfp)
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between pt-3 border-t border-gray-700", children: [
              /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-gray-300", children: "Net après charges" }),
              /* @__PURE__ */ jsx("span", { className: "text-sm font-bold text-green-400", children: formatCurrency(charges.net) })
            ] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-3 mt-6", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => handleSave(),
          disabled: saving,
          className: "px-5 py-2.5 text-sm bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50",
          children: saving ? "Sauvegarde..." : "Sauvegarder"
        }
      ),
      (status === "draft" || isNew) && /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => handleSave("sent"),
          disabled: saving,
          className: "px-5 py-2.5 text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50",
          children: "Marquer comme envoyée"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setPdfOpen(true),
          className: "px-5 py-2.5 text-sm bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors",
          children: "Imprimer / PDF"
        }
      )
    ] }),
    /* @__PURE__ */ jsx(Modal, { open: paymentModalOpen, onClose: () => setPaymentModalOpen(false), title: "Enregistrer un paiement", children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Montant *" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "number",
            value: paymentAmount,
            onChange: (e) => setPaymentAmount(e.target.value),
            placeholder: "0.00",
            min: 0,
            step: 0.01,
            className: inputClass$2
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Méthode de paiement" }),
        /* @__PURE__ */ jsx(
          "select",
          {
            value: paymentMethod,
            onChange: (e) => setPaymentMethod(e.target.value),
            className: inputClass$2,
            children: Object.keys(METHOD_LABELS).map((method) => /* @__PURE__ */ jsx("option", { value: method, children: METHOD_LABELS[method] }, method))
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Référence" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: paymentReference,
            onChange: (e) => setPaymentReference(e.target.value),
            placeholder: "Numéro de transaction, chèque...",
            className: inputClass$2
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Date du paiement" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "date",
            value: paymentDate,
            onChange: (e) => setPaymentDate(e.target.value),
            className: inputClass$2
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-3 pt-2", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setPaymentModalOpen(false),
            className: "px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors",
            children: "Annuler"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleSavePayment,
            className: "px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors",
            children: "Enregistrer"
          }
        )
      ] })
    ] }) }),
    !isNew && id && /* @__PURE__ */ jsx("div", { className: "print:hidden mt-6", children: /* @__PURE__ */ jsx(ShareLinkPanel, { entityType: "invoice", entityId: id, defaultAllowAccept: false, defaultEmail: clientEmail }) }),
    !isNew && id && /* @__PURE__ */ jsx("div", { className: "print:hidden mt-6", children: /* @__PURE__ */ jsx(CommentThread, { entityType: "invoice", entityId: id, title: "Discussion interne" }) }),
    pdfOpen && /* @__PURE__ */ jsx(
      DocumentPDF,
      {
        type: "invoice",
        number: invoiceNumber,
        date: issueDate || (/* @__PURE__ */ new Date()).toISOString(),
        dueDate: dueDate || null,
        title,
        description: description || null,
        client: clients.find((c) => c.id === clientId) ?? null,
        items: items.map((i) => ({ description: i.description, unit: i.unit ?? null, quantity: i.quantity, unit_price: i.unit_price })),
        total: items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0),
        terms: terms || null,
        notes: notes || null,
        paidAmount: payments.reduce((sum, p) => sum + Number(p.amount), 0),
        projectName: ((_b = projects.find((p) => p.id === projectId)) == null ? void 0 : _b.name) ?? null,
        createdBy,
        onClose: () => setPdfOpen(false)
      }
    ),
    clientModalOpen && /* @__PURE__ */ jsx(
      ClientModal,
      {
        open: clientModalOpen,
        onClose: () => setClientModalOpen(false),
        client: clients.find((c) => c.id === clientId) ?? null,
        projects,
        onSave: async (data) => {
          if (!clientId) return;
          const { error } = await supabase.from("clients").update(data).eq("id", clientId);
          if (error) {
            alert("La fiche client n'a pas pu être enregistrée.");
            return;
          }
          fetchReferenceData();
        }
      }
    )
  ] });
}
function ManualRevenuePanel() {
  const [entries, setEntries] = useState([]);
  const [projects, setProjects] = useState([]);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [month, setMonth] = useState(format(/* @__PURE__ */ new Date(), "yyyy-MM"));
  const [projectId, setProjectId] = useState("");
  const [error, setError] = useState(null);
  const fetchAll = useCallback(async () => {
    const [{ data: r, error: e }, { data: p }] = await Promise.all([
      supabase.from("revenues").select("*").order("month", { ascending: false }),
      supabase.from("projects").select("*").order("name")
    ]);
    if (e) {
      setError("Impossible de charger les encaissements.");
      return;
    }
    setEntries(r || []);
    setProjects(p || []);
  }, []);
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);
  const add = async (e) => {
    e.preventDefault();
    const value = parseFloat(amount);
    if (!value || !month) return;
    const { error: err } = await supabase.from("revenues").insert({
      amount: value,
      description: description.trim() || null,
      month: `${month}-01`,
      project_id: projectId || null
    });
    if (err) {
      setError("L'encaissement n'a pas pu être enregistré.");
      return;
    }
    setAmount("");
    setDescription("");
    setProjectId("");
    setError(null);
    fetchAll();
  };
  const remove = async (id) => {
    setEntries((prev) => prev.filter((x) => x.id !== id));
    await supabase.from("revenues").delete().eq("id", id);
  };
  const inputClass2 = "px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500";
  return /* @__PURE__ */ jsxs("div", { className: "bg-gray-900 border border-gray-800 rounded-xl p-5", children: [
    /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-white mb-1", children: "Encaissements hors facture" }),
    /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mb-4", children: "Pour ce qui n'a pas donné lieu à une facture dans le CRM. Ces montants sont comptés dans le chiffre d'affaires ci-dessus." }),
    entries.length > 0 && /* @__PURE__ */ jsx("div", { className: "space-y-1.5 mb-4", children: entries.map((entry) => {
      var _a;
      return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 px-3 py-2 bg-gray-800/60 rounded-lg group", children: [
        /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm text-white truncate", children: entry.description || "Encaissement" }),
          /* @__PURE__ */ jsxs("p", { className: "text-[11px] text-gray-500", children: [
            format(parseISO(entry.month), "MMMM yyyy", { locale: fr }),
            entry.project_id && ` · ${((_a = projects.find((p) => p.id === entry.project_id)) == null ? void 0 : _a.name) || "projet supprimé"}`
          ] })
        ] }),
        /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-green-400 tabular-nums flex-shrink-0", children: formatCurrency(Number(entry.amount)) }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => remove(entry.id),
            className: "text-xs text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0",
            children: "Retirer"
          }
        )
      ] }, entry.id);
    }) }),
    error && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-400 mb-2", children: error }),
    /* @__PURE__ */ jsxs("form", { onSubmit: add, className: "flex flex-col sm:flex-row gap-2", children: [
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "number",
          step: "0.01",
          min: "0",
          value: amount,
          onChange: (e) => setAmount(e.target.value),
          placeholder: "Montant",
          className: `${inputClass2} sm:w-32`
        }
      ),
      /* @__PURE__ */ jsx("input", { type: "month", value: month, onChange: (e) => setMonth(e.target.value), className: inputClass2 }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          value: description,
          onChange: (e) => setDescription(e.target.value),
          placeholder: "Nature de l'encaissement",
          className: `${inputClass2} flex-1`
        }
      ),
      /* @__PURE__ */ jsxs("select", { value: projectId, onChange: (e) => setProjectId(e.target.value), className: inputClass2, children: [
        /* @__PURE__ */ jsx("option", { value: "", children: "Sans projet" }),
        projects.map((p) => /* @__PURE__ */ jsx("option", { value: p.id, children: p.name }, p.id))
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "submit",
          disabled: !amount,
          className: "px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-gray-300 text-sm rounded-lg transition-colors",
          children: "Ajouter"
        }
      )
    ] })
  ] });
}
function FinancesPage() {
  const { activeRegime } = useTaxRegimes();
  const [invoices, setInvoices] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [error, setError] = useState(null);
  const [currentYear, setCurrentYear] = useState((/* @__PURE__ */ new Date()).getFullYear());
  const [loading, setLoading] = useState(true);
  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    const [{ data, error: invoiceError }, { data: led, error: ledgerError }] = await Promise.all([
      supabase.from("invoices").select("*").in("status", ["paid", "partial", "sent", "overdue"]).order("paid_at", { ascending: false }),
      supabase.from("revenue_ledger").select("*").order("occurred_at", { ascending: false })
    ]);
    if (invoiceError || ledgerError) {
      setError("Une partie des données financières n'a pas pu être chargée.");
    } else {
      setError(null);
    }
    setInvoices(data || []);
    setLedger(led || []);
    setLoading(false);
  }, []);
  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);
  const now = /* @__PURE__ */ new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  startOfYear(now);
  endOfYear(now);
  const monthCA = ledger.filter((entry) => {
    const d = new Date(entry.occurred_at);
    return d >= monthStart && d <= monthEnd;
  }).reduce((sum, entry) => sum + Number(entry.amount), 0);
  const yearCA = ledger.filter((entry) => new Date(entry.occurred_at).getFullYear() === currentYear).reduce((sum, entry) => sum + Number(entry.amount), 0);
  const params = activeRegime && isMicro(activeRegime.params) ? activeRegime.params : null;
  const socialRate = (params == null ? void 0 : params.social_rate) ?? 0.212;
  const trainingRate = (params == null ? void 0 : params.training_rate) ?? 1e-3;
  const ceiling = (params == null ? void 0 : params.revenue_ceiling) ?? 77700;
  const charges = (amount) => {
    const urssaf = amount * socialRate;
    const cfp = amount * trainingRate;
    return { urssaf, cfp, totalCharges: urssaf + cfp, net: amount - urssaf - cfp };
  };
  const pct = (rate) => (rate * 100).toLocaleString("fr-FR", { maximumFractionDigits: 2 });
  const yearCharges = charges(yearCA);
  const plafondPercent = Math.min(yearCA / ceiling * 100, 100);
  const pendingCount = invoices.filter(
    (inv) => inv.status === "sent" || inv.status === "partial" || inv.status === "overdue"
  ).length;
  const months = Array.from({ length: 12 }, (_, i) => {
    const monthEntries = ledger.filter((entry) => {
      const d = new Date(entry.occurred_at);
      return d.getFullYear() === currentYear && d.getMonth() === i;
    });
    const ca = monthEntries.reduce((sum, entry) => sum + Number(entry.amount), 0);
    const monthCharges = charges(ca);
    return {
      month: format(new Date(currentYear, i, 1), "MMM", { locale: fr }),
      monthFull: format(new Date(currentYear, i, 1), "MMMM yyyy", { locale: fr }),
      monthIndex: i,
      ca,
      urssaf: monthCharges.urssaf,
      cfp: monthCharges.cfp,
      totalCharges: monthCharges.totalCharges,
      net: monthCharges.net
    };
  });
  const totalCA = months.reduce((s, m) => s + m.ca, 0);
  const totalChargesAll = months.reduce((s, m) => s + m.totalCharges, 0);
  const totalNet = months.reduce((s, m) => s + m.net, 0);
  const totalUrssaf = months.reduce((s, m) => s + m.urssaf, 0);
  const totalCfp = months.reduce((s, m) => s + m.cfp, 0);
  const kpis = [
    {
      label: "CA encaisse du mois",
      value: formatCurrency(monthCA),
      color: "text-green-400",
      bg: "bg-green-500/10",
      border: "border-green-500/20"
    },
    {
      label: `CA encaisse ${currentYear}`,
      value: formatCurrency(yearCA),
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20"
    },
    {
      label: "Charges URSSAF estimees",
      value: formatCurrency(yearCharges.totalCharges),
      color: "text-red-400",
      bg: "bg-red-500/10",
      border: "border-red-500/20"
    },
    {
      label: "Revenu net estime",
      value: formatCurrency(yearCharges.net),
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20"
    },
    {
      label: "Progression plafond",
      value: `${plafondPercent.toFixed(1)}%`,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      showBar: true,
      barPercent: plafondPercent
    },
    {
      label: "Factures en attente",
      value: String(pendingCount),
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20"
    }
  ];
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !(payload == null ? void 0 : payload.length)) return null;
    return /* @__PURE__ */ jsxs("div", { className: "bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-xl", children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-white mb-1 capitalize", children: label }),
      payload.map((entry, i) => /* @__PURE__ */ jsxs("p", { className: "text-xs", style: { color: entry.color }, children: [
        entry.name,
        " : ",
        formatCurrency(entry.value)
      ] }, i))
    ] });
  };
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "p-6 flex items-center justify-center min-h-[400px]", children: /* @__PURE__ */ jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "p-4 sm:p-6 space-y-6 bg-gray-950 min-h-screen", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-xl font-bold text-white", children: "Finances" }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setCurrentYear((y) => y - 1),
            className: "p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors",
            children: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 19l-7-7 7-7" }) })
          }
        ),
        /* @__PURE__ */ jsx("span", { className: "text-lg font-semibold text-white min-w-[60px] text-center", children: currentYear }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setCurrentYear((y) => y + 1),
            className: "p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors",
            children: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }) })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4", children: kpis.map((kpi) => /* @__PURE__ */ jsxs(
      "div",
      {
        className: `${kpi.bg} border ${kpi.border} rounded-xl p-4`,
        children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-400 uppercase tracking-wider mb-1", children: kpi.label }),
          /* @__PURE__ */ jsx("p", { className: `text-xl font-bold ${kpi.color}`, children: kpi.value }),
          kpi.showBar && /* @__PURE__ */ jsx("div", { className: "mt-2 w-full bg-gray-800 rounded-full h-2", children: /* @__PURE__ */ jsx(
            "div",
            {
              className: "bg-amber-500 h-2 rounded-full transition-all duration-500",
              style: { width: `${Math.min(kpi.barPercent || 0, 100)}%` }
            }
          ) })
        ]
      },
      kpi.label
    )) }),
    /* @__PURE__ */ jsxs("div", { className: "bg-gray-900 border border-gray-800 rounded-xl p-6", children: [
      /* @__PURE__ */ jsxs("h2", { className: "text-sm font-semibold text-white mb-4", children: [
        "Revenus mensuels ",
        currentYear
      ] }),
      /* @__PURE__ */ jsx("div", { className: "h-80", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(BarChart, { data: months, margin: { top: 5, right: 20, left: 10, bottom: 5 }, children: [
        /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#374151" }),
        /* @__PURE__ */ jsx(
          XAxis,
          {
            dataKey: "month",
            tick: { fill: "#9CA3AF", fontSize: 12 },
            axisLine: { stroke: "#4B5563" },
            tickLine: { stroke: "#4B5563" }
          }
        ),
        /* @__PURE__ */ jsx(
          YAxis,
          {
            tick: { fill: "#9CA3AF", fontSize: 12 },
            axisLine: { stroke: "#4B5563" },
            tickLine: { stroke: "#4B5563" },
            tickFormatter: (v) => `${(v / 1e3).toFixed(v >= 1e3 ? 1 : 0)}k`
          }
        ),
        /* @__PURE__ */ jsx(Tooltip, { content: /* @__PURE__ */ jsx(CustomTooltip, {}) }),
        /* @__PURE__ */ jsx(
          Legend,
          {
            wrapperStyle: { color: "#9CA3AF", fontSize: 12 }
          }
        ),
        /* @__PURE__ */ jsx(Bar, { dataKey: "ca", name: "CA brut", fill: "#3B82F6", radius: [4, 4, 0, 0] }),
        /* @__PURE__ */ jsx(Bar, { dataKey: "totalCharges", name: "Charges", fill: "#EF4444", radius: [4, 4, 0, 0] }),
        /* @__PURE__ */ jsx(Bar, { dataKey: "net", name: "Net", fill: "#10B981", radius: [4, 4, 0, 0] })
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-gray-900 border border-gray-800 rounded-xl overflow-hidden", children: [
      /* @__PURE__ */ jsx("div", { className: "px-6 py-4 border-b border-gray-800", children: /* @__PURE__ */ jsxs("h2", { className: "text-sm font-semibold text-white", children: [
        "Recap mensuel ",
        currentYear
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full", children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-800", children: [
          /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Mois" }),
          /* @__PURE__ */ jsx("th", { className: "text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider", children: "CA brut" }),
          /* @__PURE__ */ jsx("th", { className: "text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider", children: `URSSAF (${pct(socialRate)} %)` }),
          /* @__PURE__ */ jsx("th", { className: "text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider", children: `CFP (${pct(trainingRate)} %)` }),
          /* @__PURE__ */ jsx("th", { className: "text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Total charges" }),
          /* @__PURE__ */ jsx("th", { className: "text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Net" })
        ] }) }),
        /* @__PURE__ */ jsxs("tbody", { className: "divide-y divide-gray-800", children: [
          months.map((m) => {
            const isCurrentMonth = m.monthIndex === now.getMonth() && currentYear === now.getFullYear();
            return /* @__PURE__ */ jsxs(
              "tr",
              {
                className: `${isCurrentMonth ? "bg-blue-500/10 border-l-2 border-l-blue-500" : "hover:bg-gray-800/50"} transition-colors`,
                children: [
                  /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-sm text-gray-300 capitalize", children: m.monthFull }),
                  /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-sm text-right font-medium text-white", children: m.ca > 0 ? formatCurrency(m.ca) : /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "-" }) }),
                  /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-sm text-right text-red-400", children: m.urssaf > 0 ? formatCurrency(m.urssaf) : /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "-" }) }),
                  /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-sm text-right text-red-400", children: m.cfp > 0 ? formatCurrency(m.cfp) : /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "-" }) }),
                  /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-sm text-right text-red-400", children: m.totalCharges > 0 ? formatCurrency(m.totalCharges) : /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "-" }) }),
                  /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-sm text-right font-medium text-emerald-400", children: m.net > 0 ? formatCurrency(m.net) : /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "-" }) })
                ]
              },
              m.monthIndex
            );
          }),
          /* @__PURE__ */ jsxs("tr", { className: "bg-gray-800/80 border-t-2 border-gray-700", children: [
            /* @__PURE__ */ jsxs("td", { className: "px-4 py-3 text-sm font-bold text-white", children: [
              "Total ",
              currentYear
            ] }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-sm text-right font-bold text-white", children: formatCurrency(totalCA) }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-sm text-right font-bold text-red-400", children: formatCurrency(totalUrssaf) }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-sm text-right font-bold text-red-400", children: formatCurrency(totalCfp) }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-sm text-right font-bold text-red-400", children: formatCurrency(totalChargesAll) }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-sm text-right font-bold text-emerald-400", children: formatCurrency(totalNet) })
          ] })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsx(ManualRevenuePanel, {}) })
  ] });
}
const PARAM_LABELS = {
  social_rate: { label: "Cotisations sociales", unit: "rate", help: "Appliqué au chiffre d'affaires" },
  training_rate: { label: "Formation professionnelle", unit: "rate" },
  liberatory_tax_rate: { label: "Versement libératoire", unit: "rate", help: "Impôt sur le revenu payé au fil de l'eau" },
  income_allowance: { label: "Abattement pour l'impôt", unit: "rate" },
  revenue_ceiling: { label: "Plafond de chiffre d'affaires", unit: "amount" },
  min_social_base: { label: "Base minimale de cotisation", unit: "amount" },
  vat_franchise_ceiling: { label: "Seuil de franchise de TVA", unit: "amount" },
  vat_rate: { label: "Taux de TVA", unit: "rate" },
  employer_rate: { label: "Cotisations patronales", unit: "rate", help: "En pourcentage du brut" },
  employee_rate: { label: "Cotisations salariales", unit: "rate" },
  corporate_tax_reduced: { label: "Impôt sur les sociétés (taux réduit)", unit: "rate" },
  corporate_tax_threshold: { label: "Seuil du taux réduit", unit: "amount" },
  corporate_tax_standard: { label: "Impôt sur les sociétés (taux normal)", unit: "rate" },
  dividend_flat_tax: { label: "Imposition des dividendes", unit: "rate" },
  default_salary_share: { label: "Part par défaut en rémunération", unit: "rate" },
  accounting_cost: { label: "Comptabilité et frais annuels", unit: "amount" }
};
function AccountingPage() {
  const { isOwner } = useTeam();
  const { regimes, settings, activeRegime, loading, error, refresh } = useTaxRegimes();
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState({});
  const [saveError, setSaveError] = useState(null);
  const [saved, setSaved] = useState(false);
  const [rate, setRate] = useState("");
  const [bank, setBank] = useState({ account_holder: "", bank_name: "", iban: "", bic: "", payment_reference_note: "" });
  const [bankSaved, setBankSaved] = useState(false);
  useEffect(() => {
    if (settings == null ? void 0 : settings.eur_to_dzd) setRate(String(settings.eur_to_dzd));
    if (settings) {
      setBank({
        account_holder: settings.account_holder || "",
        bank_name: settings.bank_name || "",
        iban: settings.iban || "",
        bic: settings.bic || "",
        payment_reference_note: settings.payment_reference_note || ""
      });
    }
  }, [settings]);
  const saveBank = async () => {
    const { error: e } = await supabase.from("company_settings").update({
      account_holder: bank.account_holder.trim() || null,
      bank_name: bank.bank_name.trim() || null,
      // L'IBAN se saisit avec ou sans espaces : on le range par groupes de quatre
      iban: bank.iban.replace(/\s+/g, "").toUpperCase().replace(/(.{4})/g, "$1 ").trim() || null,
      bic: bank.bic.replace(/\s+/g, "").toUpperCase() || null,
      payment_reference_note: bank.payment_reference_note.trim() || null
    }).eq("id", true);
    if (e) {
      setSaveError("Les coordonnées bancaires n'ont pas pu être enregistrées.");
      return;
    }
    setBankSaved(true);
    setTimeout(() => setBankSaved(false), 2500);
    refresh();
  };
  const openEditor = (regime) => {
    setEditing(regime);
    setSaved(false);
    const params = regime.params;
    setDraft(Object.fromEntries(
      Object.entries(params).filter(([k]) => k !== "kind").map(([k, v]) => [k, v === null ? "" : String(v)])
    ));
  };
  const saveRegime = async () => {
    if (!editing) return;
    const params = { kind: editing.params.kind };
    for (const [k, v] of Object.entries(draft)) {
      params[k] = v === "" ? null : Number(v);
    }
    const { error: e } = await supabase.from("tax_regimes").update({ params }).eq("id", editing.id);
    if (e) {
      setSaveError("Le barème n'a pas pu être enregistré.");
      return;
    }
    setSaveError(null);
    setSaved(true);
    setEditing(null);
    refresh();
  };
  const setActive = async (id) => {
    const { error: e } = await supabase.from("company_settings").update({ active_regime_id: id }).eq("id", true);
    if (e) {
      setSaveError("Le statut n'a pas pu être changé.");
      return;
    }
    refresh();
  };
  const saveRate = async () => {
    const { error: e } = await supabase.from("company_settings").update({ eur_to_dzd: parseFloat(rate) || 145 }).eq("id", true);
    if (e) {
      setSaveError("Le cours n'a pas pu être enregistré.");
      return;
    }
    setSaved(true);
    refresh();
  };
  const inputClass2 = "w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500";
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "p-8 flex justify-center", children: /* @__PURE__ */ jsx("div", { className: "w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "p-4 sm:p-6 space-y-6", children: [
    /* @__PURE__ */ jsx(ErrorBanner, { message: error || saveError, onDismiss: () => setSaveError(null) }),
    /* @__PURE__ */ jsx(TaxSimulator, { title: "Comparer les statuts sur un montant" }),
    /* @__PURE__ */ jsxs("div", { className: "bg-gray-900 border border-gray-800 rounded-xl p-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-baseline justify-between gap-3 mb-4 flex-wrap", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-white", children: "Statuts et barèmes" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: "Les taux évoluent chaque année. Ils se modifient ici, sans toucher au code." })
        ] }),
        saved && /* @__PURE__ */ jsx("span", { className: "text-xs text-green-400", children: "Enregistré" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "space-y-2", children: regimes.map((regime) => {
        const isActive = regime.id === (activeRegime == null ? void 0 : activeRegime.id);
        return /* @__PURE__ */ jsxs("div", { className: `p-4 rounded-lg border ${isActive ? "border-blue-600/60 bg-blue-600/5" : "border-gray-800 bg-gray-800/40"}`, children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3 flex-wrap", children: [
            /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-white", children: regime.label }),
                /* @__PURE__ */ jsxs("span", { className: "px-1.5 py-0.5 text-[10px] rounded bg-gray-700 text-gray-300", children: [
                  regime.country === "FR" ? "France" : "Algérie",
                  " · ",
                  regime.currency
                ] }),
                /* @__PURE__ */ jsxs("span", { className: "px-1.5 py-0.5 text-[10px] rounded bg-gray-800 text-gray-500", children: [
                  "barème ",
                  regime.fiscal_year
                ] }),
                isActive && /* @__PURE__ */ jsx("span", { className: "px-1.5 py-0.5 text-[10px] rounded bg-blue-500/20 text-blue-400", children: "Mon statut" })
              ] }),
              regime.notes && /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-1.5", children: regime.notes }),
              regime.source_note && /* @__PURE__ */ jsx("p", { className: "text-[11px] text-amber-400/80 mt-1", children: regime.source_note })
            ] }),
            isOwner && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-shrink-0", children: [
              !isActive && /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => setActive(regime.id),
                  className: "px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors",
                  children: "C'est mon statut"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => openEditor(regime),
                  className: "px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors",
                  children: "Modifier les taux"
                }
              )
            ] })
          ] }),
          (editing == null ? void 0 : editing.id) === regime.id && /* @__PURE__ */ jsxs("div", { className: "mt-4 pt-4 border-t border-gray-700", children: [
            /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4", children: Object.entries(draft).map(([key, value]) => {
              const meta = PARAM_LABELS[key];
              return /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsxs("label", { className: "block text-xs text-gray-400 mb-1", children: [
                  (meta == null ? void 0 : meta.label) || key,
                  (meta == null ? void 0 : meta.unit) === "rate" && /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: " (0,212 = 21,2 %)" })
                ] }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "number",
                    step: "any",
                    value,
                    onChange: (e) => setDraft((d) => ({ ...d, [key]: e.target.value })),
                    className: inputClass2
                  }
                ),
                (meta == null ? void 0 : meta.help) && /* @__PURE__ */ jsx("p", { className: "text-[10px] text-gray-600 mt-0.5", children: meta.help })
              ] }, key);
            }) }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: saveRegime,
                  className: "px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors",
                  children: "Enregistrer le barème"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => setEditing(null),
                  className: "px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg transition-colors",
                  children: "Annuler"
                }
              )
            ] })
          ] })
        ] }, regime.id);
      }) })
    ] }),
    isOwner && /* @__PURE__ */ jsxs("div", { className: "bg-gray-900 border border-gray-800 rounded-xl p-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-baseline justify-between gap-3 mb-1 flex-wrap", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-white", children: "Coordonnées bancaires" }),
        bankSaved && /* @__PURE__ */ jsx("span", { className: "text-xs text-green-400", children: "Enregistré" })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mb-4", children: "Elles figurent sur les factures imprimées, pour que le client puisse régler sans te les demander. Elles n'apparaissent pas sur les devis." }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs text-gray-400 mb-1", children: "Titulaire du compte" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: bank.account_holder,
              onChange: (e) => setBank((b) => ({ ...b, account_holder: e.target.value })),
              placeholder: "Zakariya Nebbache",
              className: `${inputClass2} w-full`
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs text-gray-400 mb-1", children: "Banque" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: bank.bank_name,
              onChange: (e) => setBank((b) => ({ ...b, bank_name: e.target.value })),
              placeholder: "Qonto, BNP, Revolut…",
              className: `${inputClass2} w-full`
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "sm:col-span-2", children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs text-gray-400 mb-1", children: "IBAN" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: bank.iban,
              onChange: (e) => setBank((b) => ({ ...b, iban: e.target.value })),
              placeholder: "FR76 3000 4000 0100 0000 0000 123",
              className: `${inputClass2} w-full font-mono`
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs text-gray-400 mb-1", children: "BIC" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: bank.bic,
              onChange: (e) => setBank((b) => ({ ...b, bic: e.target.value })),
              placeholder: "BNPAFRPP",
              className: `${inputClass2} w-full font-mono`
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs text-gray-400 mb-1", children: "Mention sous le RIB" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: bank.payment_reference_note,
              onChange: (e) => setBank((b) => ({ ...b, payment_reference_note: e.target.value })),
              placeholder: "Merci d'indiquer le numéro de facture en référence.",
              className: `${inputClass2} w-full`
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: saveBank,
          className: "mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors",
          children: "Enregistrer"
        }
      )
    ] }),
    isOwner && /* @__PURE__ */ jsxs("div", { className: "bg-gray-900 border border-gray-800 rounded-xl p-5", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-white mb-1", children: "Cours de conversion" }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mb-3", children: "Sert à comparer un devis en euros avec le statut algérien." }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-end gap-3 flex-wrap", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs text-gray-400 mb-1", children: "Dinars pour 1 euro" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              step: "0.01",
              value: rate,
              onChange: (e) => setRate(e.target.value),
              className: "px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 w-32"
            }
          )
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: saveRate,
            className: "px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg transition-colors",
            children: "Enregistrer"
          }
        )
      ] })
    ] })
  ] });
}
function dayLabel(iso) {
  const d = parseISO(iso);
  if (isToday(d)) return "Aujourd'hui";
  if (isYesterday(d)) return "Hier";
  return format(d, "EEEE d MMMM", { locale: fr });
}
function MessagesPage() {
  var _a;
  const { id: activeId } = useParams();
  const navigate = useNavigate();
  const { profile, members, memberById } = useTeam();
  const instanceId = useId();
  const { conversations, loading, error, openDirect, markRead, refresh } = useMessaging();
  const [messages, setMessages] = useState([]);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(null);
  const bottomRef = useRef(null);
  const listRef = useRef(null);
  const active = conversations.find((c) => c.id === activeId) || null;
  const title = (c) => {
    var _a2;
    return c.kind === "channel" ? c.name || "Canal" : ((_a2 = memberById(c.otherIds[0])) == null ? void 0 : _a2.full_name) || "Conversation";
  };
  const fetchMessages = useCallback(async () => {
    if (!activeId) {
      setMessages([]);
      return;
    }
    const { data, error: e } = await supabase.from("messages").select("*").eq("conversation_id", activeId).order("created_at");
    if (e) {
      setSendError("Impossible de charger les messages.");
      return;
    }
    setMessages(data || []);
  }, [activeId]);
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);
  useEffect(() => {
    if (activeId) markRead(activeId);
  }, [activeId, messages.length, markRead]);
  useEffect(() => {
    if (!activeId) return;
    const channel = supabase.channel(`messages-${activeId}-${instanceId}`).on(
      "postgres_changes",
      { event: "*", schema: "public", table: "messages", filter: `conversation_id=eq.${activeId}` },
      () => {
        fetchMessages();
      }
    ).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeId, fetchMessages, instanceId]);
  useEffect(() => {
    var _a2;
    (_a2 = bottomRef.current) == null ? void 0 : _a2.scrollIntoView({ behavior: messages.length > 0 ? "smooth" : "auto" });
  }, [messages]);
  const send = async (e) => {
    e.preventDefault();
    const text = body.trim();
    if (!text || !activeId || !profile) return;
    setSending(true);
    setSendError(null);
    const { error: err } = await supabase.from("messages").insert({
      conversation_id: activeId,
      author_id: profile.id,
      body: text
    });
    setSending(false);
    if (err) {
      setSendError("Le message n'est pas parti. Réessaie.");
      return;
    }
    setBody("");
    fetchMessages();
    refresh();
  };
  const startDirect = async (otherId) => {
    const conv = await openDirect(otherId);
    if (conv) navigate(`/dashboard/messages/${conv}`);
  };
  const others = members.filter((m) => m.id !== (profile == null ? void 0 : profile.id));
  const withoutConversation = others.filter(
    (m) => !conversations.some((c) => c.kind === "direct" && c.otherIds.includes(m.id))
  );
  return /* @__PURE__ */ jsxs("div", { className: "p-4 sm:p-6 h-[calc(100vh-4rem)]", children: [
    /* @__PURE__ */ jsx(ErrorBanner, { message: error || sendError, onDismiss: () => setSendError(null) }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-4 h-full", children: [
      /* @__PURE__ */ jsxs("aside", { className: `w-full sm:w-72 flex-shrink-0 bg-gray-900 border border-gray-800 rounded-xl overflow-y-auto ${activeId ? "hidden sm:block" : ""}`, children: [
        /* @__PURE__ */ jsx("div", { className: "px-4 py-3 border-b border-gray-800", children: /* @__PURE__ */ jsx("h2", { className: "text-sm font-semibold text-white", children: "Messages" }) }),
        loading ? /* @__PURE__ */ jsx("p", { className: "px-4 py-4 text-xs text-gray-500", children: "Chargement…" }) : /* @__PURE__ */ jsxs("div", { className: "p-2 space-y-1", children: [
          conversations.map((c) => {
            const other = c.kind === "direct" ? memberById(c.otherIds[0]) : void 0;
            return /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => navigate(`/dashboard/messages/${c.id}`),
                className: `w-full text-left flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-colors ${c.id === activeId ? "bg-blue-600/10" : "hover:bg-gray-800"}`,
                children: [
                  c.kind === "channel" ? /* @__PURE__ */ jsx("span", { className: "w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0 text-gray-400 text-xs font-semibold", children: "#" }) : /* @__PURE__ */ jsx(Avatar, { profile: other, size: "md" }),
                  /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
                    /* @__PURE__ */ jsx("p", { className: `text-sm truncate ${c.unread > 0 ? "text-white font-medium" : "text-gray-300"}`, children: title(c) }),
                    c.preview && /* @__PURE__ */ jsx("p", { className: "text-[11px] text-gray-500 truncate", children: c.preview })
                  ] }),
                  c.unread > 0 && /* @__PURE__ */ jsx("span", { className: "px-1.5 min-w-5 h-5 flex items-center justify-center bg-blue-600 text-white text-[10px] font-bold rounded-full flex-shrink-0", children: c.unread })
                ]
              },
              c.id
            );
          }),
          withoutConversation.length > 0 && /* @__PURE__ */ jsxs("div", { className: "pt-3", children: [
            /* @__PURE__ */ jsx("p", { className: "px-2.5 pb-1 text-[10px] uppercase tracking-wider text-gray-600", children: "Démarrer" }),
            withoutConversation.map((m) => /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => startDirect(m.id),
                className: "w-full text-left flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-gray-800 transition-colors",
                children: [
                  /* @__PURE__ */ jsx(Avatar, { profile: m, size: "md" }),
                  /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-400 truncate", children: m.full_name })
                ]
              },
              m.id
            ))
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("section", { className: `flex-1 min-w-0 bg-gray-900 border border-gray-800 rounded-xl flex flex-col ${activeId ? "" : "hidden sm:flex"}`, children: !active ? /* @__PURE__ */ jsx("div", { className: "flex-1 flex items-center justify-center px-6", children: /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 text-center", children: "Choisis une conversation à gauche, ou écris directement à quelqu'un de l'équipe." }) }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("header", { className: "px-4 py-3 border-b border-gray-800 flex items-center gap-2.5", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => navigate("/dashboard/messages"),
              className: "sm:hidden text-gray-400 hover:text-white",
              "aria-label": "Retour aux conversations",
              children: "←"
            }
          ),
          active.kind === "channel" ? /* @__PURE__ */ jsx("span", { className: "w-7 h-7 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 text-xs", children: "#" }) : /* @__PURE__ */ jsx(Avatar, { profile: memberById(active.otherIds[0]), size: "md" }),
          /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-white truncate", children: title(active) }),
            /* @__PURE__ */ jsx("p", { className: "text-[11px] text-gray-500", children: active.kind === "channel" ? `${active.otherIds.length + 1} membres` : ((_a = memberById(active.otherIds[0])) == null ? void 0 : _a.job_title) || "Conversation directe" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { ref: listRef, className: "flex-1 overflow-y-auto px-4 py-4 space-y-3", children: [
          messages.length === 0 && /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 text-center py-8", children: "Aucun message. Lance la conversation." }),
          messages.map((m, i) => {
            const author = memberById(m.author_id);
            const mine = m.author_id === (profile == null ? void 0 : profile.id);
            const prev = messages[i - 1];
            const newDay = !prev || dayLabel(prev.created_at) !== dayLabel(m.created_at);
            const grouped = prev && !newDay && prev.author_id === m.author_id;
            return /* @__PURE__ */ jsxs("div", { children: [
              newDay && /* @__PURE__ */ jsx("p", { className: "text-center text-[10px] uppercase tracking-wider text-gray-600 my-4", children: dayLabel(m.created_at) }),
              /* @__PURE__ */ jsxs("div", { className: `flex gap-2.5 ${mine ? "flex-row-reverse" : ""}`, children: [
                /* @__PURE__ */ jsx("div", { className: "w-8 flex-shrink-0", children: !grouped && /* @__PURE__ */ jsx(Avatar, { profile: author, size: "md" }) }),
                /* @__PURE__ */ jsxs("div", { className: `max-w-[75%] ${mine ? "items-end" : ""} flex flex-col`, children: [
                  !grouped && /* @__PURE__ */ jsxs("p", { className: `text-[11px] text-gray-500 mb-0.5 ${mine ? "text-right" : ""}`, children: [
                    (author == null ? void 0 : author.full_name) || "Membre supprimé",
                    " · ",
                    format(parseISO(m.created_at), "HH:mm")
                  ] }),
                  /* @__PURE__ */ jsx("div", { className: `px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap break-words ${mine ? "bg-blue-600 text-white rounded-br-sm" : "bg-gray-800 text-gray-200 rounded-bl-sm"}`, children: m.body })
                ] })
              ] })
            ] }, m.id);
          }),
          /* @__PURE__ */ jsx("div", { ref: bottomRef })
        ] }),
        /* @__PURE__ */ jsxs("form", { onSubmit: send, className: "p-3 border-t border-gray-800 flex items-end gap-2", children: [
          /* @__PURE__ */ jsx(
            "textarea",
            {
              value: body,
              onChange: (e) => setBody(e.target.value),
              onKeyDown: (e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(e);
                }
              },
              rows: 1,
              placeholder: "Écrire un message… (Entrée pour envoyer)",
              className: "flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500 resize-none max-h-32"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "submit",
              disabled: sending || !body.trim(),
              className: "px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-medium rounded-lg transition-colors flex-shrink-0",
              children: sending ? "…" : "Envoyer"
            }
          )
        ] })
      ] }) })
    ] })
  ] });
}
function TimeClockPage() {
  const { profile, members, memberById } = useTeam();
  const { sessions, workDays, openSession, loading, error, punch, addManual, removeSession } = useTimeClock(60);
  const [weekOffset, setWeekOffset] = useState(0);
  const [busy, setBusy] = useState(false);
  const [manualDate, setManualDate] = useState(format(/* @__PURE__ */ new Date(), "yyyy-MM-dd"));
  const [manualStart, setManualStart] = useState("09:00");
  const [manualEnd, setManualEnd] = useState("17:00");
  const [manualNote, setManualNote] = useState("");
  const [formError, setFormError] = useState(null);
  const weekStart = useMemo(() => {
    const base = addDays(/* @__PURE__ */ new Date(), weekOffset * 7);
    return startOfWeek(base, { weekStartsOn: 1 });
  }, [weekOffset]);
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );
  const hoursFor = (profileId, day) => workDays.filter((d) => d.profile_id === profileId && isSameDay(parseISO(d.day), day)).reduce((sum, d) => sum + Number(d.hours), 0);
  const activeMembers = members.filter((m) => m.is_active);
  const maxHours = Math.max(
    8,
    ...activeMembers.flatMap((m) => weekDays.map((d) => hoursFor(m.id, d)))
  );
  const mySessions = sessions.filter((s) => s.profile_id === (profile == null ? void 0 : profile.id)).slice(0, 40);
  const submitManual = async () => {
    setFormError(null);
    const start = /* @__PURE__ */ new Date(`${manualDate}T${manualStart}`);
    const end = /* @__PURE__ */ new Date(`${manualDate}T${manualEnd}`);
    if (end <= start) {
      setFormError("L'heure de fin doit suivre l'heure de début.");
      return;
    }
    setBusy(true);
    const ok = await addManual(start.toISOString(), end.toISOString(), manualNote || void 0);
    setBusy(false);
    if (ok) {
      setManualNote("");
    }
  };
  const inputClass2 = "px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500";
  return /* @__PURE__ */ jsxs("div", { className: "p-4 sm:p-6 space-y-6", children: [
    /* @__PURE__ */ jsx(ErrorBanner, { message: error || formError, onDismiss: () => setFormError(null) }),
    /* @__PURE__ */ jsxs("div", { className: "bg-gray-900 border border-gray-800 rounded-xl p-5 flex items-center justify-between gap-4 flex-wrap", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 min-w-0", children: [
        /* @__PURE__ */ jsx(Avatar, { profile, size: "lg" }),
        /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-white", children: openSession ? "Journée en cours" : "Pas de pointage en cours" }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-500", children: [
            openSession ? `Arrivée à ${format(parseISO(openSession.started_at), "HH:mm")}` : "Badge ton arrivée pour compter ta journée",
            " · ",
            formatHours(hoursFor((profile == null ? void 0 : profile.id) || "", /* @__PURE__ */ new Date())),
            " aujourd'hui"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: async () => {
            setBusy(true);
            await punch();
            setBusy(false);
          },
          disabled: busy,
          className: `px-5 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${openSession ? "bg-green-600 hover:bg-green-700 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}`,
          children: openSession ? "Badger le départ" : "Badger l'arrivée"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-gray-900 border border-gray-800 rounded-xl p-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3 mb-4 flex-wrap", children: [
        /* @__PURE__ */ jsxs("h3", { className: "text-sm font-semibold text-white", children: [
          "Semaine du ",
          format(weekStart, "d MMMM", { locale: fr })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setWeekOffset((w) => w - 1),
              className: "px-2.5 py-1 text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors",
              children: "←"
            }
          ),
          weekOffset !== 0 && /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setWeekOffset(0),
              className: "px-2.5 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors",
              children: "Cette semaine"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setWeekOffset((w) => w + 1),
              disabled: weekOffset >= 0,
              className: "px-2.5 py-1 text-sm bg-gray-800 hover:bg-gray-700 disabled:opacity-30 text-gray-300 rounded-lg transition-colors",
              children: "→"
            }
          )
        ] })
      ] }),
      loading ? /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: "Chargement…" }) : /* @__PURE__ */ jsx("div", { className: "space-y-5", children: activeMembers.map((member) => {
        const total = weekDays.reduce((sum, d) => sum + hoursFor(member.id, d), 0);
        return /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3 mb-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(Avatar, { profile: member, size: "sm" }),
              /* @__PURE__ */ jsx("span", { className: "text-sm text-white", children: member.full_name })
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "text-sm text-gray-400 tabular-nums", children: [
              formatHours(total),
              " cette semaine"
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-7 gap-1.5", children: weekDays.map((day) => {
            const h = hoursFor(member.id, day);
            const isToday2 = isSameDay(day, /* @__PURE__ */ new Date());
            const height = Math.max(4, Math.round(h / maxHours * 56));
            return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-1", children: [
              /* @__PURE__ */ jsx("div", { className: "h-14 w-full flex items-end", children: /* @__PURE__ */ jsx(
                "div",
                {
                  className: `w-full rounded transition-all ${h > 0 ? "" : "bg-gray-800"}`,
                  style: { height: `${height}px`, backgroundColor: h > 0 ? member.color : void 0 },
                  title: `${format(day, "EEEE d", { locale: fr })} · ${formatHours(h)}`
                }
              ) }),
              /* @__PURE__ */ jsx("span", { className: `text-[10px] ${isToday2 ? "text-white font-medium" : "text-gray-600"}`, children: format(day, "EEEEE", { locale: fr }) }),
              /* @__PURE__ */ jsx("span", { className: "text-[10px] text-gray-500 tabular-nums", children: h > 0 ? h.toFixed(1) : "-" })
            ] }, day.toISOString());
          }) })
        ] }, member.id);
      }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-gray-900 border border-gray-800 rounded-xl p-5", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-white mb-1", children: "Ajouter une journée oubliée" }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mb-3", children: "Quand on oublie de badger. La saisie est marquée comme manuelle." }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-end gap-2", children: [
        /* @__PURE__ */ jsx("input", { type: "date", value: manualDate, onChange: (e) => setManualDate(e.target.value), className: inputClass2 }),
        /* @__PURE__ */ jsx("input", { type: "time", value: manualStart, onChange: (e) => setManualStart(e.target.value), className: inputClass2 }),
        /* @__PURE__ */ jsx("input", { type: "time", value: manualEnd, onChange: (e) => setManualEnd(e.target.value), className: inputClass2 }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: manualNote,
            onChange: (e) => setManualNote(e.target.value),
            placeholder: "Note (optionnel)",
            className: `${inputClass2} flex-1 min-w-[10rem]`
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: submitManual,
            disabled: busy,
            className: "px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-gray-200 text-sm rounded-lg transition-colors",
            children: "Ajouter"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-gray-900 border border-gray-800 rounded-xl p-5", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-white mb-3", children: "Mes pointages" }),
      mySessions.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: "Aucun pointage pour l'instant." }) : /* @__PURE__ */ jsx("div", { className: "space-y-1.5", children: mySessions.map((session) => {
        const start = parseISO(session.started_at);
        const end = session.ended_at ? parseISO(session.ended_at) : null;
        const hours = ((end ?? /* @__PURE__ */ new Date()).getTime() - start.getTime()) / 36e5;
        return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 px-3 py-2 bg-gray-800/60 rounded-lg group", children: [
          /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsxs("p", { className: "text-sm text-white", children: [
              format(start, "EEEE d MMMM", { locale: fr }),
              /* @__PURE__ */ jsxs("span", { className: "text-gray-500 font-normal", children: [
                " · ",
                format(start, "HH:mm"),
                " → ",
                end ? format(end, "HH:mm") : "en cours"
              ] })
            ] }),
            (session.note || session.is_manual) && /* @__PURE__ */ jsxs("p", { className: "text-[11px] text-gray-500", children: [
              session.is_manual && "Saisie manuelle",
              session.is_manual && session.note && " · ",
              session.note
            ] })
          ] }),
          /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-300 tabular-nums flex-shrink-0", children: formatHours(hours) }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => removeSession(session.id),
              className: "text-xs text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0",
              children: "Retirer"
            }
          )
        ] }, session.id);
      }) })
    ] })
  ] });
}
const TEMPLATES = [
  {
    value: "classic",
    label: "Sobre",
    hint: "Fond crème, bandeaux noirs, blocs émetteur et client. Convient à un document signé à la main."
  },
  {
    value: "agency",
    label: "Agence",
    hint: "Bandeau de marque en tête, tableau détaillé avec unité et TVA, pied de page répété."
  }
];
const ACCENTS = ["#5a5a5a", "#1c1c1a", "#1f5fd0", "#16724d", "#8a3a3a", "#5b3a8a"];
function IssuerPage() {
  const { profile, refresh } = useTeam();
  const [form, setForm] = useState({
    issuer_name: "",
    issuer_brand: "",
    issuer_legal_form: "",
    issuer_siret: "",
    issuer_rm: "",
    issuer_address: "",
    issuer_email: "",
    issuer_phone: "",
    issuer_logo_url: "",
    iban: "",
    bic: "",
    bank_name: "",
    document_template: "classic",
    document_accent: "#5a5a5a"
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => {
    if (!profile) return;
    setForm({
      issuer_name: profile.issuer_name || profile.full_name || "",
      issuer_brand: profile.issuer_brand || "",
      issuer_legal_form: profile.issuer_legal_form || "",
      issuer_siret: profile.issuer_siret || "",
      issuer_rm: profile.issuer_rm || "",
      issuer_address: profile.issuer_address || "",
      issuer_email: profile.issuer_email || profile.email || "",
      issuer_phone: profile.issuer_phone || "",
      issuer_logo_url: profile.issuer_logo_url || "",
      iban: profile.iban || "",
      bic: profile.bic || "",
      bank_name: profile.bank_name || "",
      document_template: profile.document_template || "classic",
      document_accent: profile.document_accent || "#5a5a5a"
    });
  }, [profile]);
  const save = async () => {
    if (!profile) return;
    setSaving(true);
    setError(null);
    const { error: e } = await supabase.from("profiles").update({
      ...form,
      // L'IBAN se saisit comme on veut, il se range par groupes de quatre
      iban: form.iban.replace(/\s+/g, "").toUpperCase().replace(/(.{4})/g, "$1 ").trim() || null,
      bic: form.bic.replace(/\s+/g, "").toUpperCase() || null,
      issuer_brand: form.issuer_brand || null,
      issuer_legal_form: form.issuer_legal_form || null,
      issuer_siret: form.issuer_siret || null,
      issuer_rm: form.issuer_rm || null,
      issuer_address: form.issuer_address || null,
      issuer_phone: form.issuer_phone || null,
      issuer_logo_url: form.issuer_logo_url || null,
      bank_name: form.bank_name || null
    }).eq("id", profile.id);
    setSaving(false);
    if (e) {
      setError("Ton identité d'émission n'a pas pu être enregistrée.");
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    refresh();
  };
  const uploadLogo = async (file) => {
    if (!profile) return;
    setError(null);
    const path = `logos/${profile.id}-${Date.now()}-${file.name.replace(/[^\w.\-]+/g, "_")}`;
    const { error: e } = await supabase.storage.from("project-files").upload(path, file, { upsert: true });
    if (e) {
      setError("Le logo n'a pas pu être envoyé.");
      return;
    }
    const { data } = await supabase.storage.from("project-files").createSignedUrl(path, 60 * 60 * 24 * 365 * 5);
    if (data == null ? void 0 : data.signedUrl) setForm((f) => ({ ...f, issuer_logo_url: data.signedUrl }));
  };
  const input = "w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500";
  if (!profile) return /* @__PURE__ */ jsx("div", { className: "p-6 text-sm text-gray-500", children: "Chargement…" });
  return /* @__PURE__ */ jsxs("div", { className: "p-4 sm:p-6 space-y-6", children: [
    /* @__PURE__ */ jsx(ErrorBanner, { message: error, onDismiss: () => setError(null) }),
    /* @__PURE__ */ jsx("div", { className: "bg-gray-900 border border-gray-800 rounded-xl p-5", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-1", children: [
      /* @__PURE__ */ jsx(Avatar, { profile, size: "md" }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { className: "text-sm font-semibold text-white", children: "Mes devis et factures" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: "Les documents que tu crées portent cette identité et cette présentation. Chacun a la sienne." })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "bg-gray-900 border border-gray-800 rounded-xl p-5", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-white mb-3", children: "Présentation du document" }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4", children: TEMPLATES.map((t) => /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setForm((f) => ({ ...f, document_template: t.value })),
          className: `text-left p-4 rounded-lg border transition-colors ${form.document_template === t.value ? "border-blue-600 bg-blue-600/10" : "border-gray-800 bg-gray-800/40 hover:border-gray-700"}`,
          children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-white", children: t.label }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-1", children: t.hint })
          ]
        },
        t.value
      )) }),
      /* @__PURE__ */ jsx("label", { className: "block text-xs text-gray-400 mb-2", children: "Couleur des bandeaux" }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
        ACCENTS.map((c) => /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setForm((f) => ({ ...f, document_accent: c })),
            className: `w-8 h-8 rounded-full transition-transform ${form.document_accent === c ? "ring-2 ring-offset-2 ring-offset-gray-900 ring-white scale-110" : "hover:scale-110"}`,
            style: { backgroundColor: c },
            "aria-label": `Couleur ${c}`
          },
          c
        )),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "color",
            value: form.document_accent,
            onChange: (e) => setForm((f) => ({ ...f, document_accent: e.target.value })),
            className: "w-8 h-8 rounded bg-transparent border border-gray-700 cursor-pointer",
            "aria-label": "Couleur personnalisée"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-gray-900 border border-gray-800 rounded-xl p-5", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-white mb-3", children: "Identité qui figure sur le document" }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs text-gray-400 mb-1", children: "Nom" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: form.issuer_name,
              onChange: (e) => setForm((f) => ({ ...f, issuer_name: e.target.value })),
              placeholder: "Prénom Nom",
              className: input
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs text-gray-400 mb-1", children: "Marque" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: form.issuer_brand,
              onChange: (e) => setForm((f) => ({ ...f, issuer_brand: e.target.value })),
              placeholder: "Nom commercial affiché en tête",
              className: input
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs text-gray-400 mb-1", children: "Forme juridique" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: form.issuer_legal_form,
              onChange: (e) => setForm((f) => ({ ...f, issuer_legal_form: e.target.value })),
              placeholder: "Entrepreneur individuel",
              className: input
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs text-gray-400 mb-1", children: "SIRET" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: form.issuer_siret,
              onChange: (e) => setForm((f) => ({ ...f, issuer_siret: e.target.value })),
              className: input
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs text-gray-400 mb-1", children: "Répertoire des métiers" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: form.issuer_rm,
              onChange: (e) => setForm((f) => ({ ...f, issuer_rm: e.target.value })),
              placeholder: "Si applicable",
              className: input
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs text-gray-400 mb-1", children: "Adresse électronique" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "email",
              value: form.issuer_email,
              onChange: (e) => setForm((f) => ({ ...f, issuer_email: e.target.value })),
              className: input
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "sm:col-span-2", children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs text-gray-400 mb-1", children: "Adresse postale" }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              value: form.issuer_address,
              rows: 2,
              onChange: (e) => setForm((f) => ({ ...f, issuer_address: e.target.value })),
              placeholder: "1 rue Exemple\n75000 Paris, France",
              className: `${input} resize-none`
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-4", children: [
        /* @__PURE__ */ jsx("label", { className: "block text-xs text-gray-400 mb-1", children: "Logo" }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 flex-wrap", children: [
          form.issuer_logo_url && /* @__PURE__ */ jsx("img", { src: form.issuer_logo_url, alt: "", className: "h-12 max-w-[10rem] object-contain bg-gray-800 rounded p-1" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "file",
              accept: "image/*",
              onChange: (e) => {
                var _a;
                const f = (_a = e.target.files) == null ? void 0 : _a[0];
                if (f) uploadLogo(f);
              },
              className: "text-sm text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-gray-800 file:text-gray-200 hover:file:bg-gray-700 file:cursor-pointer"
            }
          ),
          form.issuer_logo_url && /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setForm((f) => ({ ...f, issuer_logo_url: "" })),
              className: "text-xs text-gray-500 hover:text-red-400",
              children: "Retirer"
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-gray-900 border border-gray-800 rounded-xl p-5", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-white mb-1", children: "Coordonnées bancaires" }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mb-3", children: "Elles figurent sur tes factures, jamais sur tes devis." }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "sm:col-span-2", children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs text-gray-400 mb-1", children: "IBAN" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: form.iban,
              onChange: (e) => setForm((f) => ({ ...f, iban: e.target.value })),
              className: `${input} font-mono`
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs text-gray-400 mb-1", children: "BIC" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: form.bic,
              onChange: (e) => setForm((f) => ({ ...f, bic: e.target.value })),
              className: `${input} font-mono`
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs text-gray-400 mb-1", children: "Banque" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: form.bank_name,
              onChange: (e) => setForm((f) => ({ ...f, bank_name: e.target.value })),
              className: input
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: save,
          disabled: saving,
          className: "px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors",
          children: saving ? "Enregistrement…" : "Enregistrer"
        }
      ),
      saved && /* @__PURE__ */ jsx("span", { className: "text-sm text-green-400", children: "Enregistré" })
    ] })
  ] });
}
const STATUS_BADGE$1 = {
  draft: { label: "Brouillon", bg: "bg-gray-500/20", text: "text-gray-400" },
  sent: { label: "Envoyé", bg: "bg-blue-500/20", text: "text-blue-400" },
  accepted: { label: "Accepté", bg: "bg-green-500/20", text: "text-green-400" },
  rejected: { label: "Refusé", bg: "bg-red-500/20", text: "text-red-400" }
};
const TYPE_LABELS$3 = {
  landing: "Landing page",
  vitrine: "Site vitrine",
  ecommerce: "E-commerce",
  custom: "Sur mesure",
  mobile: "Mobile",
  maintenance: "Maintenance",
  audit: "Audit",
  other: "Autre"
};
function ProposalsPage() {
  const navigate = useNavigate();
  const [proposals, setProposals] = useState([]);
  const [filterStatus, setFilterStatus] = useState("");
  const fetchAll = useCallback(async () => {
    const { data, error } = await supabase.from("proposals").select("*, client:clients(id, name)").order("created_at", { ascending: false });
    if (error) console.error("Fetch proposals error:", error);
    if (data) setProposals(data);
  }, []);
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);
  const filtered = proposals.filter((p) => !filterStatus || p.status === filterStatus);
  const handleDuplicate = async (proposal) => {
    const { error } = await supabase.from("proposals").insert({
      client_id: proposal.client_id,
      title: proposal.title + " (copie)",
      project_type: proposal.project_type,
      status: "draft",
      client_company: proposal.client_company,
      client_contact: proposal.client_contact,
      client_email: proposal.client_email,
      client_phone: proposal.client_phone,
      project_description: proposal.project_description,
      objectives: proposal.objectives,
      target_audience: proposal.target_audience,
      features: proposal.features,
      design_preferences: proposal.design_preferences,
      inspirations: proposal.inspirations,
      seo_requirements: proposal.seo_requirements,
      hosting_needs: proposal.hosting_needs,
      content_provided: proposal.content_provided,
      timeline: proposal.timeline,
      budget_range: proposal.budget_range,
      additional_notes: proposal.additional_notes,
      estimated_amount: proposal.estimated_amount
    });
    if (error) console.error("Duplicate proposal error:", error);
    fetchAll();
  };
  const handleConvertToQuote = async (proposal) => {
    const { data: quoteNumber } = await supabase.rpc("next_sequence_number", { seq_id: "quote" });
    if (!quoteNumber) {
      alert("Le numéro n'a pas pu être généré. Réessaie dans un instant.");
      return;
    }
    const { data: quote } = await supabase.from("quotes").insert({
      quote_number: quoteNumber,
      client_id: proposal.client_id,
      title: proposal.title,
      description: proposal.project_description,
      total_amount: proposal.estimated_amount || 0,
      status: "draft"
    }).select().single();
    if (quote) {
      await supabase.from("proposals").update({ quote_id: quote.id }).eq("id", proposal.id);
      if (proposal.estimated_amount) {
        await supabase.from("quote_items").insert({
          quote_id: quote.id,
          description: proposal.title + (proposal.project_type ? " · " + TYPE_LABELS$3[proposal.project_type] : ""),
          quantity: 1,
          unit_price: proposal.estimated_amount,
          position: 0
        });
      }
      navigate(`/dashboard/quotes/${quote.id}`);
    }
  };
  const handleDelete = async (id) => {
    if (!confirm("Supprimer cette proposition ?")) return;
    await supabase.from("proposals").delete().eq("id", id);
    fetchAll();
  };
  return /* @__PURE__ */ jsxs("div", { className: "p-4 sm:p-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
      /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsxs(
        "select",
        {
          value: filterStatus,
          onChange: (e) => setFilterStatus(e.target.value),
          className: "px-3 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded-lg text-gray-300 focus:outline-none focus:border-blue-500",
          children: [
            /* @__PURE__ */ jsx("option", { value: "", children: "Tous les statuts" }),
            /* @__PURE__ */ jsx("option", { value: "draft", children: "Brouillon" }),
            /* @__PURE__ */ jsx("option", { value: "sent", children: "Envoyé" }),
            /* @__PURE__ */ jsx("option", { value: "accepted", children: "Accepté" }),
            /* @__PURE__ */ jsx("option", { value: "rejected", children: "Refusé" })
          ]
        }
      ) }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => navigate("/dashboard/proposals/new"),
          className: "px-4 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors",
          children: "+ Nouvelle proposition"
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "bg-gray-900 border border-gray-800 rounded-xl overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full", children: [
      /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-800", children: [
        /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Titre" }),
        /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Client" }),
        /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Type" }),
        /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Montant estimé" }),
        /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Statut" }),
        /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Date" }),
        /* @__PURE__ */ jsx("th", { className: "text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-gray-800", children: filtered.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 7, className: "px-4 py-8 text-center text-sm text-gray-500", children: "Aucune proposition" }) }) : filtered.map((proposal) => {
        var _a;
        const badge = STATUS_BADGE$1[proposal.status];
        return /* @__PURE__ */ jsxs(
          "tr",
          {
            className: "hover:bg-gray-800/50 transition-colors cursor-pointer",
            onClick: () => navigate(`/dashboard/proposals/${proposal.id}`),
            children: [
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-sm text-white truncate max-w-xs", children: proposal.title }),
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-sm text-gray-300", children: ((_a = proposal.client) == null ? void 0 : _a.name) ?? "-" }),
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-sm text-gray-400", children: proposal.project_type ? TYPE_LABELS$3[proposal.project_type] ?? proposal.project_type : "-" }),
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-sm font-medium text-white", children: proposal.estimated_amount != null ? formatCurrency(proposal.estimated_amount) : "-" }),
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsx("span", { className: `inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${badge.bg} ${badge.text}`, children: badge.label }) }),
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-sm text-gray-400", children: format(new Date(proposal.created_at), "dd/MM/yyyy", { locale: fr }) }),
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-1", onClick: (e) => e.stopPropagation(), children: [
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => navigate(`/dashboard/proposals/${proposal.id}`),
                    className: "p-1.5 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-700",
                    title: "Modifier",
                    children: /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" }) })
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => handleDuplicate(proposal),
                    className: "p-1.5 text-gray-400 hover:text-blue-400 transition-colors rounded-lg hover:bg-blue-500/10",
                    title: "Dupliquer",
                    children: /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" }) })
                  }
                ),
                proposal.status === "accepted" && /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => handleConvertToQuote(proposal),
                    className: "p-1.5 text-gray-400 hover:text-emerald-400 transition-colors rounded-lg hover:bg-emerald-500/10",
                    title: "Convertir en devis",
                    children: /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" }) })
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => handleDelete(proposal.id),
                    className: "p-1.5 text-gray-400 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10",
                    title: "Supprimer",
                    children: /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" }) })
                  }
                )
              ] }) })
            ]
          },
          proposal.id
        );
      }) })
    ] }) }) })
  ] });
}
const TYPE_LABELS$2 = {
  landing: "Landing page",
  vitrine: "Site vitrine",
  ecommerce: "E-commerce Shopify",
  custom: "Site sur mesure React/Next.js",
  mobile: "Application mobile",
  maintenance: "Maintenance mensuelle",
  audit: "Audit SEO / technique",
  other: "Autre"
};
const FEATURE_CATEGORIES = [
  {
    name: "Pages",
    items: ["Page d'accueil", "A propos", "Services", "Contact", "Blog", "Portfolio", "FAQ", "Mentions legales"]
  },
  {
    name: "E-commerce",
    items: ["Catalogue produits", "Panier", "Paiement en ligne", "Gestion des commandes", "Comptes clients"]
  },
  {
    name: "Fonctionnalites",
    items: ["Formulaire de contact", "Newsletter", "Espace membre", "Chat en ligne", "Booking/RDV", "Multi-langue"]
  },
  {
    name: "Technique",
    items: ["SEO optimise", "Responsive mobile", "Hebergement inclus", "Nom de domaine", "SSL/HTTPS", "Analytics"]
  }
];
const BUDGET_RANGES = ["< 500€", "500-1000€", "1000-2000€", "2000-3000€", "3000-5000€", "5000€+", "A definir"];
const STATUS_BADGE = {
  draft: { label: "Brouillon", bg: "bg-gray-500/20", text: "text-gray-400" },
  sent: { label: "Envoye", bg: "bg-blue-500/20", text: "text-blue-400" },
  accepted: { label: "Accepte", bg: "bg-green-500/20", text: "text-green-400" },
  rejected: { label: "Refuse", bg: "bg-red-500/20", text: "text-red-400" }
};
const inputClass$1 = "w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500";
function ChevronIcon({ open }) {
  return /* @__PURE__ */ jsx(
    "svg",
    {
      className: `w-5 h-5 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`,
      fill: "none",
      viewBox: "0 0 24 24",
      stroke: "currentColor",
      strokeWidth: 2,
      children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M19.5 8.25l-7.5 7.5-7.5-7.5" })
    }
  );
}
function ProposalDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id || id === "new";
  const [clientId, setClientId] = useState(null);
  const [title, setTitle] = useState("");
  const [projectType, setProjectType] = useState("");
  const [status, setStatus] = useState("draft");
  const [clientCompany, setClientCompany] = useState("");
  const [clientContact, setClientContact] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [objectives, setObjectives] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [features, setFeatures] = useState([]);
  const [customFeatures, setCustomFeatures] = useState("");
  const [designPreferences, setDesignPreferences] = useState("");
  const [inspirations, setInspirations] = useState("");
  const [contentProvided, setContentProvided] = useState(false);
  const [seoRequirements, setSeoRequirements] = useState("");
  const [hostingNeeds, setHostingNeeds] = useState("");
  const [timeline, setTimeline] = useState("");
  const [budgetRange, setBudgetRange] = useState("");
  const [estimatedAmount, setEstimatedAmount] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [clients, setClients] = useState([]);
  const [saving, setSaving] = useState(false);
  const [openSections, setOpenSections] = useState({
    client: true,
    project: true,
    features: true,
    design: true,
    constraints: true,
    estimation: true
  });
  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };
  const toggleFeature = (feature) => {
    setFeatures(
      (prev) => prev.includes(feature) ? prev.filter((f) => f !== feature) : [...prev, feature]
    );
  };
  const fetchClients = useCallback(async () => {
    const { data } = await supabase.from("clients").select("*").order("name", { ascending: true });
    if (data) setClients(data);
  }, []);
  const fetchProposal = useCallback(async () => {
    if (isNew) return;
    const { data, error } = await supabase.from("proposals").select("*").eq("id", id).single();
    if (error) {
      console.error("Fetch proposal error:", error);
      return;
    }
    if (data) {
      const p = data;
      setClientId(p.client_id);
      setTitle(p.title);
      setProjectType(p.project_type || "");
      setStatus(p.status);
      setClientCompany(p.client_company || "");
      setClientContact(p.client_contact || "");
      setClientEmail(p.client_email || "");
      setClientPhone(p.client_phone || "");
      setProjectDescription(p.project_description || "");
      setObjectives(p.objectives || "");
      setTargetAudience(p.target_audience || "");
      setFeatures(p.features || []);
      setDesignPreferences(p.design_preferences || "");
      setInspirations(p.inspirations || "");
      setContentProvided(p.content_provided);
      setSeoRequirements(p.seo_requirements || "");
      setHostingNeeds(p.hosting_needs || "");
      setTimeline(p.timeline || "");
      setBudgetRange(p.budget_range || "");
      setEstimatedAmount(p.estimated_amount != null ? String(p.estimated_amount) : "");
      setAdditionalNotes(p.additional_notes || "");
    }
  }, [id, isNew]);
  useEffect(() => {
    fetchClients();
    fetchProposal();
  }, [fetchClients, fetchProposal]);
  const handleClientChange = (selectedClientId) => {
    if (!selectedClientId) {
      setClientId(null);
      return;
    }
    setClientId(selectedClientId);
    const client = clients.find((c) => c.id === selectedClientId);
    if (client) {
      setClientContact(client.name || "");
      setClientEmail(client.email || "");
      setClientPhone(client.phone || "");
    }
  };
  useEffect(() => {
    if (!projectType) return;
    const pricing = PRICING_GRID.find((p) => p.type === projectType);
    if (pricing) {
      const mid = Math.round((pricing.min + pricing.max) / 2);
      setEstimatedAmount(String(mid));
    }
  }, [projectType]);
  const handleSave = async (newStatus) => {
    setSaving(true);
    const allFeatures = [...features];
    if (customFeatures.trim()) {
      allFeatures.push(...customFeatures.split("\n").filter((f) => f.trim()));
    }
    const data = {
      client_id: clientId,
      title: title || "Proposition sans titre",
      project_type: projectType || null,
      status: newStatus || status,
      client_company: clientCompany || null,
      client_contact: clientContact || null,
      client_email: clientEmail || null,
      client_phone: clientPhone || null,
      project_description: projectDescription || null,
      objectives: objectives || null,
      target_audience: targetAudience || null,
      features: allFeatures,
      design_preferences: designPreferences || null,
      inspirations: inspirations || null,
      seo_requirements: seoRequirements || null,
      hosting_needs: hostingNeeds || null,
      content_provided: contentProvided,
      timeline: timeline || null,
      budget_range: budgetRange || null,
      estimated_amount: estimatedAmount ? parseFloat(estimatedAmount) : null,
      additional_notes: additionalNotes || null,
      ...newStatus === "sent" ? { sent_at: (/* @__PURE__ */ new Date()).toISOString() } : {},
      ...newStatus === "accepted" ? { accepted_at: (/* @__PURE__ */ new Date()).toISOString() } : {}
    };
    if (isNew) {
      const { data: created, error } = await supabase.from("proposals").insert(data).select().single();
      if (created) navigate(`/dashboard/proposals/${created.id}`, { replace: true });
      if (error) console.error(error);
    } else {
      await supabase.from("proposals").update(data).eq("id", id);
    }
    setSaving(false);
  };
  const handleConvertToQuote = async () => {
    const { data: quoteNumber } = await supabase.rpc("next_sequence_number", {
      seq_id: "quote"
    });
    const featuresDesc = features.length > 0 ? "\n\nFonctionnalites :\n- " + features.join("\n- ") : "";
    if (!quoteNumber) {
      alert("Le numéro n'a pas pu être généré. Réessaie dans un instant.");
      return;
    }
    const { data: quote } = await supabase.from("quotes").insert({
      quote_number: quoteNumber,
      client_id: clientId,
      title,
      description: (projectDescription || "") + featuresDesc,
      total_amount: estimatedAmount ? parseFloat(estimatedAmount) : 0,
      status: "draft"
    }).select().single();
    if (quote) {
      await supabase.from("proposals").update({ quote_id: quote.id }).eq("id", id);
      if (estimatedAmount) {
        await supabase.from("quote_items").insert({
          quote_id: quote.id,
          description: title + (projectType ? " · " + TYPE_LABELS$2[projectType] : ""),
          quantity: 1,
          unit_price: parseFloat(estimatedAmount),
          position: 0
        });
      }
      navigate(`/dashboard/quotes/${quote.id}`);
    }
  };
  const badge = STATUS_BADGE[status] || STATUS_BADGE.draft;
  return /* @__PURE__ */ jsxs("div", { className: "p-4 sm:p-6 max-w-4xl mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => navigate("/dashboard/proposals"),
            className: "p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800",
            children: /* @__PURE__ */ jsx(
              "svg",
              {
                className: "w-5 h-5",
                fill: "none",
                viewBox: "0 0 24 24",
                stroke: "currentColor",
                strokeWidth: 2,
                children: /* @__PURE__ */ jsx(
                  "path",
                  {
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                    d: "M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                  }
                )
              }
            )
          }
        ),
        /* @__PURE__ */ jsx("h1", { className: "text-xl font-bold text-white", children: isNew ? "Nouvelle proposition" : title || "Proposition sans titre" })
      ] }),
      /* @__PURE__ */ jsx(
        "span",
        {
          className: `inline-flex px-3 py-1 text-xs font-medium rounded-full ${badge.bg} ${badge.text}`,
          children: badge.label
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-gray-900 rounded-xl mb-4 border border-gray-800", children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          onClick: () => toggleSection("client"),
          className: "w-full flex items-center justify-between px-5 py-4",
          children: [
            /* @__PURE__ */ jsx("span", { className: "text-lg font-semibold text-white", children: "Informations client" }),
            /* @__PURE__ */ jsx(ChevronIcon, { open: openSections.client })
          ]
        }
      ),
      openSections.client && /* @__PURE__ */ jsxs("div", { className: "px-5 pb-5 space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Selectionner un client existant" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: clientId || "",
              onChange: (e) => handleClientChange(e.target.value),
              className: inputClass$1,
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "-- Saisie manuelle --" }),
                clients.map((c) => /* @__PURE__ */ jsx("option", { value: c.id, children: c.name }, c.id))
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Entreprise" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: clientCompany,
                onChange: (e) => setClientCompany(e.target.value),
                className: inputClass$1,
                placeholder: "Nom de l'entreprise"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Contact" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: clientContact,
                onChange: (e) => setClientContact(e.target.value),
                className: inputClass$1,
                placeholder: "Nom du contact"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Email" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "email",
                value: clientEmail,
                onChange: (e) => setClientEmail(e.target.value),
                className: inputClass$1,
                placeholder: "email@exemple.com"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Telephone" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "tel",
                value: clientPhone,
                onChange: (e) => setClientPhone(e.target.value),
                className: inputClass$1,
                placeholder: "+33 6 00 00 00 00"
              }
            )
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-gray-900 rounded-xl mb-4 border border-gray-800", children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          onClick: () => toggleSection("project"),
          className: "w-full flex items-center justify-between px-5 py-4",
          children: [
            /* @__PURE__ */ jsx("span", { className: "text-lg font-semibold text-white", children: "Le projet" }),
            /* @__PURE__ */ jsx(ChevronIcon, { open: openSections.project })
          ]
        }
      ),
      openSections.project && /* @__PURE__ */ jsxs("div", { className: "px-5 pb-5 space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Titre" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: title,
              onChange: (e) => setTitle(e.target.value),
              className: inputClass$1,
              placeholder: "Titre de la proposition"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Type de projet" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: projectType,
              onChange: (e) => setProjectType(e.target.value),
              className: inputClass$1,
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "-- Choisir un type --" }),
                Object.entries(TYPE_LABELS$2).map(([key, label]) => /* @__PURE__ */ jsx("option", { value: key, children: label }, key))
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Description du projet" }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              value: projectDescription,
              onChange: (e) => setProjectDescription(e.target.value),
              className: inputClass$1,
              rows: 4,
              placeholder: "Decrivez le projet en detail..."
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Objectifs" }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              value: objectives,
              onChange: (e) => setObjectives(e.target.value),
              className: inputClass$1,
              rows: 3,
              placeholder: "Quels sont les objectifs du projet ?"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Public cible" }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              value: targetAudience,
              onChange: (e) => setTargetAudience(e.target.value),
              className: inputClass$1,
              rows: 3,
              placeholder: "Qui est le public cible ?"
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-gray-900 rounded-xl mb-4 border border-gray-800", children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          onClick: () => toggleSection("features"),
          className: "w-full flex items-center justify-between px-5 py-4",
          children: [
            /* @__PURE__ */ jsx("span", { className: "text-lg font-semibold text-white", children: "Fonctionnalites" }),
            /* @__PURE__ */ jsx(ChevronIcon, { open: openSections.features })
          ]
        }
      ),
      openSections.features && /* @__PURE__ */ jsxs("div", { className: "px-5 pb-5 space-y-5", children: [
        FEATURE_CATEGORIES.map((category) => /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-300 mb-2", children: category.name }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-2", children: category.items.map((item) => /* @__PURE__ */ jsxs(
            "label",
            {
              className: "flex items-center gap-2 text-sm text-gray-300 cursor-pointer select-none",
              children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "checkbox",
                    checked: features.includes(item),
                    onChange: () => toggleFeature(item),
                    className: "w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                  }
                ),
                item
              ]
            },
            item
          )) })
        ] }, category.name)),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Autres fonctionnalites" }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              value: customFeatures,
              onChange: (e) => setCustomFeatures(e.target.value),
              className: inputClass$1,
              rows: 3,
              placeholder: "Une fonctionnalite par ligne..."
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-gray-900 rounded-xl mb-4 border border-gray-800", children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          onClick: () => toggleSection("design"),
          className: "w-full flex items-center justify-between px-5 py-4",
          children: [
            /* @__PURE__ */ jsx("span", { className: "text-lg font-semibold text-white", children: "Design & contenu" }),
            /* @__PURE__ */ jsx(ChevronIcon, { open: openSections.design })
          ]
        }
      ),
      openSections.design && /* @__PURE__ */ jsxs("div", { className: "px-5 pb-5 space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Preferences de design" }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              value: designPreferences,
              onChange: (e) => setDesignPreferences(e.target.value),
              className: inputClass$1,
              rows: 3,
              placeholder: "Couleurs, style, ambiance souhaitee..."
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Sites d'inspiration" }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              value: inspirations,
              onChange: (e) => setInspirations(e.target.value),
              className: inputClass$1,
              rows: 3,
              placeholder: "URLs de sites qui vous inspirent..."
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => setContentProvided(!contentProvided),
              className: `relative w-11 h-6 rounded-full transition-colors ${contentProvided ? "bg-blue-600" : "bg-gray-700"}`,
              children: /* @__PURE__ */ jsx(
                "span",
                {
                  className: `absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${contentProvided ? "translate-x-5" : ""}`
                }
              )
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-300", children: "Le client fournit le contenu (textes, images)" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-gray-900 rounded-xl mb-4 border border-gray-800", children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          onClick: () => toggleSection("constraints"),
          className: "w-full flex items-center justify-between px-5 py-4",
          children: [
            /* @__PURE__ */ jsx("span", { className: "text-lg font-semibold text-white", children: "Contraintes" }),
            /* @__PURE__ */ jsx(ChevronIcon, { open: openSections.constraints })
          ]
        }
      ),
      openSections.constraints && /* @__PURE__ */ jsxs("div", { className: "px-5 pb-5 space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Exigences SEO" }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              value: seoRequirements,
              onChange: (e) => setSeoRequirements(e.target.value),
              className: inputClass$1,
              rows: 3,
              placeholder: "Mots-cles cibles, positionnement souhaite..."
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Besoins d'hebergement" }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              value: hostingNeeds,
              onChange: (e) => setHostingNeeds(e.target.value),
              className: inputClass$1,
              rows: 3,
              placeholder: "Hebergement actuel, domaine existant..."
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Delai souhaite" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: timeline,
              onChange: (e) => setTimeline(e.target.value),
              className: inputClass$1,
              placeholder: "Ex: 2 semaines, 1 mois..."
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Fourchette de budget" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: budgetRange,
              onChange: (e) => setBudgetRange(e.target.value),
              className: inputClass$1,
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "-- Selectionner --" }),
                BUDGET_RANGES.map((range) => /* @__PURE__ */ jsx("option", { value: range, children: range }, range))
              ]
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-gray-900 rounded-xl mb-4 border border-gray-800", children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          onClick: () => toggleSection("estimation"),
          className: "w-full flex items-center justify-between px-5 py-4",
          children: [
            /* @__PURE__ */ jsx("span", { className: "text-lg font-semibold text-white", children: "Estimation" }),
            /* @__PURE__ */ jsx(ChevronIcon, { open: openSections.estimation })
          ]
        }
      ),
      openSections.estimation && /* @__PURE__ */ jsxs("div", { className: "px-5 pb-5 space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Montant estime (€)" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: estimatedAmount,
              onChange: (e) => setEstimatedAmount(e.target.value),
              className: inputClass$1,
              placeholder: "0",
              min: "0",
              step: "50"
            }
          ),
          estimatedAmount && /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-1", children: formatCurrency(parseFloat(estimatedAmount)) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Notes additionnelles" }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              value: additionalNotes,
              onChange: (e) => setAdditionalNotes(e.target.value),
              className: inputClass$1,
              rows: 4,
              placeholder: "Remarques, conditions particulieres..."
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-3 justify-end mt-6", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => handleSave(),
          disabled: saving,
          className: "px-4 py-2 text-sm font-medium bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50",
          children: saving ? "Sauvegarde..." : "Sauvegarder"
        }
      ),
      status === "draft" && /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => handleSave("sent"),
          disabled: saving,
          className: "px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50",
          children: "Marquer comme envoye"
        }
      ),
      status === "accepted" && !isNew && /* @__PURE__ */ jsx(
        "button",
        {
          onClick: handleConvertToQuote,
          disabled: saving,
          className: "px-4 py-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors disabled:opacity-50",
          children: "Convertir en devis"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => window.print(),
          className: "px-4 py-2 text-sm font-medium bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors",
          children: "Imprimer / PDF"
        }
      )
    ] })
  ] });
}
const STATUS_LABELS$1 = {
  briefing: "Briefing",
  design: "Design",
  development: "Développement",
  review: "Recette",
  delivered: "Livré",
  active: "Actif",
  archived: "Archivé"
};
const STATUS_COLORS$1 = {
  briefing: "bg-purple-500/20 text-purple-400",
  design: "bg-pink-500/20 text-pink-400",
  development: "bg-blue-500/20 text-blue-400",
  review: "bg-amber-500/20 text-amber-400",
  delivered: "bg-green-500/20 text-green-400",
  active: "bg-emerald-500/20 text-emerald-400",
  archived: "bg-gray-500/20 text-gray-400"
};
const TYPE_LABELS$1 = {
  landing: "Landing page",
  vitrine: "Site vitrine",
  ecommerce: "E-commerce",
  custom: "Sur mesure",
  mobile: "Mobile",
  maintenance: "Maintenance",
  audit: "Audit",
  other: "Autre"
};
function ProjectsPage() {
  const navigate = useNavigate();
  const { profile, memberById } = useTeam();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [clients, setClients] = useState([]);
  const [filterStatus, setFilterStatus] = useState("");
  const [onlyMine, setOnlyMine] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [error, setError] = useState(null);
  const fetchAll = useCallback(async () => {
    const [{ data: p, error: pe }, { data: t }, { data: c }] = await Promise.all([
      supabase.from("projects").select("*").order("created_at", { ascending: false }),
      supabase.from("tasks").select("id, project_id, status, assignee_id, estimated_hours, actual_hours"),
      supabase.from("clients").select("*").order("name")
    ]);
    if (pe) setError("Impossible de charger les projets.");
    if (p) setProjects(p);
    if (t) setTasks(t);
    if (c) setClients(c);
  }, []);
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);
  const visible = projects.filter((p) => showArchived ? true : !p.is_archived).filter((p) => !filterStatus || p.status === filterStatus).filter((p) => {
    if (!onlyMine || !profile) return true;
    if (p.lead_id === profile.id) return true;
    return tasks.some((t) => t.project_id === p.id && t.assignee_id === profile.id);
  });
  const statsFor = (projectId) => {
    const list = tasks.filter((t) => t.project_id === projectId);
    const done = list.filter((t) => t.status === "done").length;
    const hours = list.reduce((sum, t) => sum + (Number(t.actual_hours) || 0), 0);
    return {
      total: list.length,
      done,
      progress: list.length ? Math.round(done / list.length * 100) : 0,
      hours
    };
  };
  const handleSave = async (data) => {
    if (editingProject) {
      const { error: e } = await supabase.from("projects").update(data).eq("id", editingProject.id);
      if (e) setError("Le projet n'a pas pu être modifié.");
    } else {
      const { data: created, error: e } = await supabase.from("projects").insert(data).select("id").single();
      if (e) setError("Le projet n'a pas pu être créé.");
      else if (created) await supabase.rpc("seed_content_requests", { p_project: created.id });
    }
    setEditingProject(null);
    fetchAll();
  };
  const handleDelete = async (id) => {
    const { error: e } = await supabase.from("projects").delete().eq("id", id);
    if (e) setError("Le projet n'a pas pu être supprimé.");
    setEditingProject(null);
    fetchAll();
  };
  const handleArchive = async (id, archived) => {
    const { error: e } = await supabase.from("projects").update({ is_archived: archived }).eq("id", id);
    if (e) setError("Le projet n'a pas pu être archivé.");
    fetchAll();
  };
  const activeCount = projects.filter((p) => !p.is_archived).length;
  const totalBudget = projects.filter((p) => !p.is_archived).reduce((s, p) => s + (Number(p.budget) || 0), 0);
  const openTasks = tasks.filter((t) => t.status !== "done").length;
  const myTasks = tasks.filter((t) => t.assignee_id === (profile == null ? void 0 : profile.id) && t.status !== "done").length;
  return /* @__PURE__ */ jsxs("div", { className: "p-4 sm:p-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-gray-900 border border-gray-800 rounded-xl p-4", children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 uppercase tracking-wider mb-1", children: "Projets en cours" }),
        /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-white", children: activeCount })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-gray-900 border border-gray-800 rounded-xl p-4", children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 uppercase tracking-wider mb-1", children: "Budget engagé" }),
        /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-green-400", children: formatCurrency(totalBudget) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-gray-900 border border-gray-800 rounded-xl p-4", children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 uppercase tracking-wider mb-1", children: "Tâches ouvertes" }),
        /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-blue-400", children: openTasks })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-gray-900 border border-gray-800 rounded-xl p-4", children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 uppercase tracking-wider mb-1", children: "Dont pour moi" }),
        /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-amber-400", children: myTasks })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
        /* @__PURE__ */ jsxs(
          "select",
          {
            value: filterStatus,
            onChange: (e) => setFilterStatus(e.target.value),
            className: "px-3 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded-lg text-gray-300 focus:outline-none focus:border-blue-500",
            children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "Tous les statuts" }),
              Object.entries(STATUS_LABELS$1).filter(([k]) => k !== "archived").map(([k, v]) => /* @__PURE__ */ jsx("option", { value: k, children: v }, k))
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setOnlyMine(!onlyMine),
            className: `flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors ${onlyMine ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white"}`,
            children: [
              /* @__PURE__ */ jsx(Avatar, { profile, size: "xs" }),
              "Mes projets"
            ]
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setShowArchived(!showArchived),
            className: `px-3 py-1.5 text-sm rounded-lg transition-colors ${showArchived ? "bg-gray-700 text-white" : "bg-gray-800 text-gray-400 hover:text-white"}`,
            children: showArchived ? "Masquer les archivés" : "Voir les archivés"
          }
        )
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => {
            setEditingProject(null);
            setModalOpen(true);
          },
          className: "px-4 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors",
          children: "+ Nouveau projet"
        }
      )
    ] }),
    error && /* @__PURE__ */ jsxs("div", { className: "mb-3 flex items-center justify-between gap-3 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg", children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm text-red-400", children: error }),
      /* @__PURE__ */ jsx("button", { onClick: () => setError(null), className: "text-xs text-red-400 hover:text-red-300", children: "Fermer" })
    ] }),
    visible.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "bg-gray-900 border border-gray-800 rounded-xl p-10 text-center", children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-400 mb-1", children: "Aucun projet à afficher" }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-600", children: "Crée un projet pour lui rattacher tâches, devis et heures." })
    ] }) : /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4", children: visible.map((p) => {
      const stats = statsFor(p.id);
      const client = clients.find((c) => c.id === p.client_id);
      const lead = memberById(p.lead_id);
      return /* @__PURE__ */ jsxs(
        "div",
        {
          className: "relative bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl p-5 transition-colors group",
          children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: (e) => {
                  e.stopPropagation();
                  setEditingProject(p);
                  setModalOpen(true);
                },
                title: "Modifier, archiver ou supprimer",
                "aria-label": `Actions sur ${p.name}`,
                className: "absolute top-3 right-3 p-1.5 rounded-lg text-gray-600 hover:text-white hover:bg-gray-800 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity z-10",
                children: /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" }) })
              }
            ),
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => navigate(`/dashboard/projects/${p.id}`),
                className: "text-left w-full",
                children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3 mb-3", children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [
                      /* @__PURE__ */ jsx("span", { className: "w-2.5 h-2.5 rounded-full flex-shrink-0", style: { backgroundColor: p.color } }),
                      /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-white truncate group-hover:text-blue-400 transition-colors", children: p.name })
                    ] }),
                    p.visibility === "team" && /* @__PURE__ */ jsx(
                      "span",
                      {
                        className: "px-2 py-0.5 rounded text-[10px] font-medium flex-shrink-0 bg-blue-500/20 text-blue-400",
                        title: "Projet partagé avec l'équipe",
                        children: "Équipe"
                      }
                    ),
                    /* @__PURE__ */ jsx("span", { className: `px-2 py-0.5 rounded text-[10px] font-medium flex-shrink-0 mr-6 ${p.is_archived ? STATUS_COLORS$1.archived : STATUS_COLORS$1[p.status] || STATUS_COLORS$1.active}`, children: p.is_archived ? "Archivé" : STATUS_LABELS$1[p.status] || p.status })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs text-gray-500 mb-4 flex-wrap", children: [
                    client && /* @__PURE__ */ jsx("span", { className: "truncate", children: client.name }),
                    client && p.project_type && /* @__PURE__ */ jsx("span", { children: "·" }),
                    p.project_type && /* @__PURE__ */ jsx("span", { children: TYPE_LABELS$1[p.project_type] })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "mb-3", children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-[11px] text-gray-400 mb-1", children: [
                      /* @__PURE__ */ jsxs("span", { children: [
                        stats.done,
                        "/",
                        stats.total,
                        " tâches"
                      ] }),
                      /* @__PURE__ */ jsxs("span", { children: [
                        stats.progress,
                        "%"
                      ] })
                    ] }),
                    /* @__PURE__ */ jsx("div", { className: "w-full h-1.5 bg-gray-800 rounded-full overflow-hidden", children: /* @__PURE__ */ jsx(
                      "div",
                      {
                        className: "h-full rounded-full transition-all",
                        style: { width: `${stats.progress}%`, backgroundColor: p.color }
                      }
                    ) })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3", children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 text-xs text-gray-500", children: [
                      p.budget != null && /* @__PURE__ */ jsx("span", { className: "text-green-400 font-medium", children: formatCurrency(Number(p.budget)) }),
                      stats.hours > 0 && /* @__PURE__ */ jsxs("span", { children: [
                        stats.hours,
                        "h passées"
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                      p.end_date && /* @__PURE__ */ jsx("span", { className: "text-[11px] text-gray-500", children: format(parseISO(p.end_date), "d MMM", { locale: fr }) }),
                      p.visibility === "team" ? /* @__PURE__ */ jsx("span", { className: "text-[11px] text-blue-400", children: "Équipe" }) : /* @__PURE__ */ jsx(Avatar, { profile: lead, size: "sm" })
                    ] })
                  ] })
                ]
              }
            )
          ]
        },
        p.id
      );
    }) }),
    /* @__PURE__ */ jsx(
      ProjectModal,
      {
        open: modalOpen,
        onClose: () => {
          setModalOpen(false);
          setEditingProject(null);
        },
        project: editingProject,
        clients,
        onSave: handleSave,
        onDelete: handleDelete,
        onArchive: handleArchive
      }
    )
  ] });
}
const STATUS_META$2 = {
  planned: { label: "Prévu", badge: "bg-blue-500/20 text-blue-400", dot: "bg-blue-500" },
  at_risk: { label: "À risque", badge: "bg-amber-500/20 text-amber-400", dot: "bg-amber-500" },
  reached: { label: "Atteint", badge: "bg-green-500/20 text-green-400", dot: "bg-green-500" },
  missed: { label: "Manqué", badge: "bg-red-500/20 text-red-400", dot: "bg-red-500" }
};
function MilestonesPanel({ projectId }) {
  const [milestones, setMilestones] = useState([]);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [isCommitment, setIsCommitment] = useState(true);
  const [error, setError] = useState(null);
  const fetchMilestones = useCallback(async () => {
    const { data, error: e } = await supabase.from("milestones").select("*").eq("project_id", projectId).order("due_date");
    if (e) {
      setError("Impossible de charger les deadlines.");
      return;
    }
    setMilestones(data || []);
  }, [projectId]);
  useEffect(() => {
    fetchMilestones();
  }, [fetchMilestones]);
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) return;
    const position = milestones.length;
    const { error: err } = await supabase.from("milestones").insert({
      project_id: projectId,
      title: title.trim(),
      due_date: dueDate,
      is_client_commitment: isCommitment,
      position
    });
    if (err) {
      setError("La deadline n'a pas pu être créée.");
      return;
    }
    setTitle("");
    setDueDate("");
    setError(null);
    fetchMilestones();
  };
  const setStatus = async (milestone, status) => {
    setMilestones((prev) => prev.map((m) => m.id === milestone.id ? { ...m, status } : m));
    const { error: err } = await supabase.from("milestones").update({
      status,
      reached_at: status === "reached" ? (/* @__PURE__ */ new Date()).toISOString() : null
    }).eq("id", milestone.id);
    if (err) {
      setError("La mise à jour a échoué.");
      fetchMilestones();
    }
  };
  const remove = async (id) => {
    setMilestones((prev) => prev.filter((m) => m.id !== id));
    await supabase.from("milestones").delete().eq("id", id);
  };
  const inputClass2 = "px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500";
  return /* @__PURE__ */ jsxs("div", { className: "bg-gray-900 border border-gray-800 rounded-xl p-5", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-white", children: "Deadlines" }),
      /* @__PURE__ */ jsxs("span", { className: "text-xs text-gray-500", children: [
        milestones.filter((m) => m.status === "reached").length,
        "/",
        milestones.length,
        " atteints"
      ] })
    ] }),
    milestones.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mb-4", children: "Aucune deadline. Pose ici les dates que tu engages auprès du client : elles remontent dans le calendrier et déclenchent une alerte à l'approche." }) : /* @__PURE__ */ jsx("div", { className: "space-y-2 mb-4", children: milestones.map((milestone) => {
      const days = differenceInCalendarDays(parseISO(milestone.due_date), /* @__PURE__ */ new Date());
      const open = milestone.status === "planned" || milestone.status === "at_risk";
      const meta = STATUS_META$2[milestone.status];
      return /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-800/60 rounded-lg group", children: [
        /* @__PURE__ */ jsx("span", { className: `w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${meta.dot}` }),
        /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-white", children: milestone.title }),
            /* @__PURE__ */ jsx("span", { className: `px-1.5 py-0.5 text-[10px] rounded ${meta.badge}`, children: meta.label }),
            milestone.is_client_commitment && /* @__PURE__ */ jsx("span", { className: "px-1.5 py-0.5 text-[10px] rounded bg-gray-700 text-gray-300", children: "Engagement client" })
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-500 mt-0.5", children: [
            format(parseISO(milestone.due_date), "d MMMM yyyy", { locale: fr }),
            open && /* @__PURE__ */ jsx("span", { className: days < 0 ? " text-red-400" : days <= 3 ? " text-amber-400" : "", children: days < 0 ? ` · dépassé de ${Math.abs(days)} j` : days === 0 ? " · c'est aujourd'hui" : ` · dans ${days} j` })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 flex-shrink-0", children: [
          open && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setStatus(milestone, "reached"),
                className: "text-[11px] px-2 py-1 rounded bg-green-600/10 text-green-400 hover:bg-green-600/20 transition-colors",
                children: "Atteint"
              }
            ),
            milestone.status !== "at_risk" && /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setStatus(milestone, "at_risk"),
                className: "text-[11px] px-2 py-1 rounded bg-amber-600/10 text-amber-400 hover:bg-amber-600/20 transition-colors",
                children: "À risque"
              }
            )
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => remove(milestone.id),
              className: "text-[11px] px-2 py-1 rounded text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity",
              children: "Retirer"
            }
          )
        ] })
      ] }, milestone.id);
    }) }),
    error && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-400 mb-2", children: error }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleAdd, className: "flex flex-col sm:flex-row gap-2", children: [
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          value: title,
          onChange: (e) => setTitle(e.target.value),
          placeholder: "Livraison des maquettes",
          className: `${inputClass2} flex-1`
        }
      ),
      /* @__PURE__ */ jsx("input", { type: "date", value: dueDate, onChange: (e) => setDueDate(e.target.value), className: inputClass2 }),
      /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 text-xs text-gray-400 px-1", children: [
        /* @__PURE__ */ jsx("input", { type: "checkbox", checked: isCommitment, onChange: (e) => setIsCommitment(e.target.checked), className: "accent-blue-600" }),
        "Engagement client"
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "submit",
          disabled: !title.trim() || !dueDate,
          className: "px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-medium rounded-lg transition-colors",
          children: "Ajouter"
        }
      )
    ] })
  ] });
}
const CATEGORIES$1 = [
  { value: "fonctionnel", label: "Fonctionnel" },
  { value: "design", label: "Design" },
  { value: "contenu", label: "Contenu" },
  { value: "technique", label: "Technique" },
  { value: "seo", label: "SEO" },
  { value: "legal", label: "Légal" }
];
const DEFAULT_CHECKS = [
  { title: "Toutes les pages sont accessibles et sans erreur", category: "fonctionnel" },
  { title: "Les formulaires envoient bien leurs données", category: "fonctionnel" },
  { title: "Affichage correct sur mobile et tablette", category: "design" },
  { title: "Textes et images définitifs en place", category: "contenu" },
  { title: "Titres, descriptions et favicon renseignés", category: "seo" },
  { title: "Redirections et nom de domaine configurés", category: "technique" },
  { title: "Certificat HTTPS actif", category: "technique" },
  { title: "Mentions légales et politique de confidentialité publiées", category: "legal" }
];
const STATUS_META$1 = {
  todo: { label: "À vérifier", className: "bg-gray-700 text-gray-300" },
  ok: { label: "Validé", className: "bg-green-500/20 text-green-400" },
  ko: { label: "À corriger", className: "bg-red-500/20 text-red-400" }
};
function AcceptanceChecklist({ projectId }) {
  const { profile, memberById } = useTeam();
  const [checks, setChecks] = useState([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("fonctionnel");
  const [error, setError] = useState(null);
  const fetchChecks = useCallback(async () => {
    const { data, error: e } = await supabase.from("acceptance_checks").select("*").eq("project_id", projectId).order("position");
    if (e) {
      setError("Impossible de charger la recette.");
      return;
    }
    setChecks(data || []);
  }, [projectId]);
  useEffect(() => {
    fetchChecks();
  }, [fetchChecks]);
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    const { error: err } = await supabase.from("acceptance_checks").insert({
      project_id: projectId,
      title: title.trim(),
      category,
      position: checks.length
    });
    if (err) {
      setError("Le point n'a pas pu être ajouté.");
      return;
    }
    setTitle("");
    setError(null);
    fetchChecks();
  };
  const loadDefaults = async () => {
    const rows = DEFAULT_CHECKS.map((c, i) => ({
      project_id: projectId,
      title: c.title,
      category: c.category,
      position: checks.length + i
    }));
    const { error: err } = await supabase.from("acceptance_checks").insert(rows);
    if (err) {
      setError("La checklist type n'a pas pu être chargée.");
      return;
    }
    fetchChecks();
  };
  const setStatus = async (check, status) => {
    setChecks((prev) => prev.map((c) => c.id === check.id ? { ...c, status } : c));
    const { error: err } = await supabase.from("acceptance_checks").update({
      status,
      checked_by: status === "todo" ? null : (profile == null ? void 0 : profile.id) ?? null,
      checked_at: status === "todo" ? null : (/* @__PURE__ */ new Date()).toISOString()
    }).eq("id", check.id);
    if (err) {
      setError("La mise à jour a échoué.");
      fetchChecks();
    }
  };
  const remove = async (id) => {
    setChecks((prev) => prev.filter((c) => c.id !== id));
    await supabase.from("acceptance_checks").delete().eq("id", id);
  };
  const ok = checks.filter((c) => c.status === "ok").length;
  const ko = checks.filter((c) => c.status === "ko").length;
  const ready = checks.length > 0 && ok === checks.length;
  const inputClass2 = "px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500";
  return /* @__PURE__ */ jsxs("div", { className: "bg-gray-900 border border-gray-800 rounded-xl p-5", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4 gap-3 flex-wrap", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-white", children: "Recette" }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 text-xs", children: [
        ko > 0 && /* @__PURE__ */ jsxs("span", { className: "text-red-400", children: [
          ko,
          " à corriger"
        ] }),
        /* @__PURE__ */ jsxs("span", { className: "text-gray-500 tabular-nums", children: [
          ok,
          "/",
          checks.length,
          " validés"
        ] }),
        ready && /* @__PURE__ */ jsx("span", { className: "px-2 py-0.5 rounded bg-green-500/20 text-green-400 font-medium", children: "Prêt à livrer" })
      ] })
    ] }),
    checks.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
      /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mb-3", children: "Aucun point de recette. Charge la checklist type d'une livraison web, puis adapte-la au projet." }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: loadDefaults,
          className: "px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors",
          children: [
            "Charger la checklist type (",
            DEFAULT_CHECKS.length,
            " points)"
          ]
        }
      )
    ] }) : /* @__PURE__ */ jsx("div", { className: "space-y-1.5 mb-4", children: checks.map((check) => {
      var _a;
      const checker = memberById(check.checked_by);
      return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 p-2.5 bg-gray-800/60 rounded-lg group flex-wrap sm:flex-nowrap", children: [
        /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsx("p", { className: `text-sm ${check.status === "ok" ? "text-gray-400" : "text-gray-200"}`, children: check.title }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mt-0.5", children: [
            /* @__PURE__ */ jsx("span", { className: "text-[10px] text-gray-600 uppercase tracking-wide", children: (_a = CATEGORIES$1.find((c) => c.value === check.category)) == null ? void 0 : _a.label }),
            checker && /* @__PURE__ */ jsx(Avatar, { profile: checker, size: "xs" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 flex-shrink-0 flex-wrap", children: [
          ["ok", "ko", "todo"].map((s) => /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setStatus(check, s),
              className: `text-[11px] px-2 py-1 rounded transition-colors ${check.status === s ? STATUS_META$1[s].className : "text-gray-500 hover:text-white hover:bg-gray-700"}`,
              children: STATUS_META$1[s].label
            },
            s
          )),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => remove(check.id),
              className: "text-[11px] px-1.5 py-1 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity",
              children: "×"
            }
          )
        ] })
      ] }, check.id);
    }) }),
    error && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-400 mb-2", children: error }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleAdd, className: "flex flex-col sm:flex-row gap-2", children: [
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          value: title,
          onChange: (e) => setTitle(e.target.value),
          placeholder: "Point à vérifier avant livraison",
          className: `${inputClass2} flex-1`
        }
      ),
      /* @__PURE__ */ jsx("select", { value: category, onChange: (e) => setCategory(e.target.value), className: inputClass2, children: CATEGORIES$1.map((c) => /* @__PURE__ */ jsx("option", { value: c.value, children: c.label }, c.value)) }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "submit",
          disabled: !title.trim(),
          className: "px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-gray-300 text-sm rounded-lg transition-colors",
          children: "Ajouter"
        }
      )
    ] })
  ] });
}
const DEFAULT_HOURLY_RATE = 50;
function ProfitabilityCard({ project, hoursSpent, collected }) {
  const rate = Number(project.hourly_rate) || DEFAULT_HOURLY_RATE;
  const budget = Number(project.budget) || 0;
  const cost = hoursSpent * rate;
  const margin = budget - cost;
  const marginRate = budget > 0 ? Math.round(margin / budget * 100) : null;
  const effectiveRate = hoursSpent > 0 ? budget / hoursSpent : null;
  const budgetUsed = budget > 0 ? Math.min(100, Math.round(cost / budget * 100)) : 0;
  const over = budget > 0 && cost > budget;
  return /* @__PURE__ */ jsxs("div", { className: "bg-gray-900 border border-gray-800 rounded-xl p-5", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3 mb-4 flex-wrap", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-white", children: "Rentabilité" }),
      /* @__PURE__ */ jsxs("span", { className: "text-xs text-gray-500 flex-shrink-0", children: [
        rate,
        " €/h · ",
        hoursSpent.toFixed(1),
        "h passées"
      ] })
    ] }),
    budget === 0 ? /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: "Renseigne un budget sur le projet pour suivre la marge et le taux horaire réel." }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-[11px] text-gray-500 uppercase tracking-wide mb-1", children: "Budget" }),
          /* @__PURE__ */ jsx("p", { className: "text-base sm:text-lg font-bold text-white tabular-nums break-words", children: formatCurrency(budget) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-[11px] text-gray-500 uppercase tracking-wide mb-1", children: "Coût du temps" }),
          /* @__PURE__ */ jsx("p", { className: "text-base sm:text-lg font-bold text-amber-400 tabular-nums break-words", children: formatCurrency(cost) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-[11px] text-gray-500 uppercase tracking-wide mb-1", children: "Marge" }),
          /* @__PURE__ */ jsx("p", { className: `text-base sm:text-lg font-bold tabular-nums break-words ${margin >= 0 ? "text-green-400" : "text-red-400"}`, children: formatCurrency(margin) }),
          marginRate !== null && /* @__PURE__ */ jsxs("p", { className: `text-[11px] ${margin >= 0 ? "text-green-400/70" : "text-red-400/70"}`, children: [
            marginRate,
            " %"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-[11px] text-gray-500 uppercase tracking-wide mb-1", children: "Encaissé" }),
          /* @__PURE__ */ jsx("p", { className: "text-base sm:text-lg font-bold text-emerald-400 tabular-nums break-words", children: formatCurrency(collected) }),
          budget > 0 && /* @__PURE__ */ jsxs("p", { className: "text-[11px] text-gray-500", children: [
            Math.round(collected / budget * 100),
            " % du budget"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-[11px] mb-1", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-400", children: "Budget consommé par le temps passé" }),
          /* @__PURE__ */ jsxs("span", { className: over ? "text-red-400 font-medium" : "text-gray-400", children: [
            budgetUsed,
            " %"
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "w-full h-2 bg-gray-800 rounded-full overflow-hidden", children: /* @__PURE__ */ jsx(
          "div",
          {
            className: `h-full rounded-full transition-all ${over ? "bg-red-500" : budgetUsed > 80 ? "bg-amber-500" : "bg-green-500"}`,
            style: { width: `${budgetUsed}%` }
          }
        ) })
      ] }),
      effectiveRate !== null && /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-500", children: [
        "Taux horaire réellement dégagé :",
        " ",
        /* @__PURE__ */ jsxs("span", { className: effectiveRate >= rate ? "text-green-400" : "text-amber-400", children: [
          effectiveRate.toFixed(0),
          " €/h"
        ] }),
        " ",
        "pour un objectif de ",
        rate,
        " €/h."
      ] })
    ] })
  ] });
}
const CATEGORIES = [
  { value: "identite", label: "Identité" },
  { value: "contenu", label: "Contenu" },
  { value: "media", label: "Photos et médias" },
  { value: "juridique", label: "Juridique" },
  { value: "technique", label: "Technique" },
  { value: "autre", label: "Autre" }
];
const KINDS$1 = [
  { value: "file", label: "Un document" },
  { value: "text", label: "Une information écrite" },
  { value: "both", label: "Les deux" }
];
const STATUS_META = {
  pending: { label: "Attendu", className: "bg-gray-700 text-gray-300" },
  received: { label: "Reçu", className: "bg-amber-500/20 text-amber-400" },
  validated: { label: "Validé", className: "bg-green-500/20 text-green-400" },
  rejected: { label: "À refaire", className: "bg-red-500/20 text-red-400" }
};
function ContentRequestsPanel({ projectId }) {
  const { profile } = useTeam();
  const instanceId = useId();
  const [requests, setRequests] = useState([]);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);
  const [seeding, setSeeding] = useState(false);
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [kind, setKind] = useState("file");
  const [category, setCategory] = useState("contenu");
  const fetchAll = useCallback(async () => {
    const [{ data: r, error: e }, { data: f }] = await Promise.all([
      supabase.from("content_requests").select("*").eq("project_id", projectId).order("position"),
      supabase.from("project_files").select("*").eq("project_id", projectId).not("content_request_id", "is", null)
    ]);
    if (e) {
      setError("Impossible de charger les contenus.");
      return;
    }
    setRequests(r || []);
    setFiles(f || []);
  }, [projectId]);
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);
  useEffect(() => {
    const channel = supabase.channel(`contents-${projectId}-${instanceId}`).on(
      "postgres_changes",
      { event: "*", schema: "public", table: "content_requests", filter: `project_id=eq.${projectId}` },
      () => {
        fetchAll();
      }
    ).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, fetchAll, instanceId]);
  const loadTemplate = async () => {
    setSeeding(true);
    const { data, error: e } = await supabase.rpc("seed_content_requests", { p_project: projectId });
    setSeeding(false);
    if (e) {
      setError("La trame n'a pas pu être chargée.");
      return;
    }
    if (data === 0) setError("Tous les éléments de la trame sont déjà dans la liste.");
    fetchAll();
  };
  const add = async (e) => {
    e.preventDefault();
    if (!label.trim()) return;
    const { error: err } = await supabase.from("content_requests").insert({
      project_id: projectId,
      label: label.trim(),
      description: description.trim() || null,
      kind,
      category,
      position: requests.length
    });
    if (err) {
      setError("L'élément n'a pas pu être ajouté.");
      return;
    }
    setLabel("");
    setDescription("");
    setError(null);
    fetchAll();
  };
  const setStatus = async (request, status, note) => {
    setRequests((prev) => prev.map((r) => r.id === request.id ? { ...r, status } : r));
    const { error: e } = await supabase.from("content_requests").update({
      status,
      review_note: note ?? null,
      validated_at: status === "validated" ? (/* @__PURE__ */ new Date()).toISOString() : null,
      validated_by: status === "validated" ? (profile == null ? void 0 : profile.id) ?? null : null
    }).eq("id", request.id);
    if (e) {
      setError("La mise à jour a échoué.");
      fetchAll();
    }
  };
  const remove = async (id) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
    await supabase.from("content_requests").delete().eq("id", id);
  };
  const openFile = async (file) => {
    if (!file.storage_path) return;
    const { data, error: e } = await supabase.storage.from("project-files").createSignedUrl(file.storage_path, 120);
    if (e || !data) {
      setError("Le document n'a pas pu être ouvert.");
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener");
  };
  const missing = requests.filter((r) => r.is_required && r.status !== "validated" && r.status !== "received").length;
  const toReview = requests.filter((r) => r.status === "received").length;
  const done = requests.filter((r) => r.status === "validated").length;
  const inputClass2 = "px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500";
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-gray-900 border border-gray-800 rounded-xl p-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3 mb-4 flex-wrap", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-white", children: "Contenus attendus du client" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: "Le client dépose ses documents et ses informations depuis son espace, sans compte. Les fichiers reçus rejoignent les documents du projet." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 text-xs flex-shrink-0", children: [
          toReview > 0 && /* @__PURE__ */ jsxs("span", { className: "text-amber-400", children: [
            toReview,
            " à vérifier"
          ] }),
          missing > 0 && /* @__PURE__ */ jsxs("span", { className: "text-gray-400", children: [
            missing,
            " manquant",
            missing > 1 ? "s" : ""
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "text-gray-500 tabular-nums", children: [
            done,
            "/",
            requests.length,
            " validés"
          ] })
        ] })
      ] }),
      requests.length === 0 ? /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mb-3", children: "Rien de demandé pour l'instant. Charge la trame correspondant au type du projet, puis retire ce qui ne s'applique pas." }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: loadTemplate,
            disabled: seeding,
            className: "px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors",
            children: seeding ? "Chargement…" : "Charger la trame type"
          }
        )
      ] }) : /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        requests.map((request) => {
          var _a;
          const attached = files.filter((f) => f.content_request_id === request.id);
          const meta = STATUS_META[request.status];
          return /* @__PURE__ */ jsx("div", { className: "p-3 bg-gray-800/60 rounded-lg group", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3 flex-wrap", children: [
            /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-white", children: request.label }),
                /* @__PURE__ */ jsx("span", { className: `px-1.5 py-0.5 text-[10px] rounded ${meta.className}`, children: meta.label }),
                request.is_required && request.status === "pending" && /* @__PURE__ */ jsx("span", { className: "px-1.5 py-0.5 text-[10px] rounded bg-gray-700 text-gray-400", children: "Obligatoire" }),
                /* @__PURE__ */ jsx("span", { className: "text-[10px] text-gray-600 uppercase tracking-wide", children: (_a = CATEGORIES.find((c) => c.value === request.category)) == null ? void 0 : _a.label })
              ] }),
              request.description && /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-1", children: request.description }),
              request.response_text && /* @__PURE__ */ jsxs("div", { className: "mt-2 p-2 bg-gray-900 rounded border border-gray-700", children: [
                /* @__PURE__ */ jsx("p", { className: "text-[10px] text-gray-500 mb-1", children: "Réponse du client" }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-300 whitespace-pre-wrap", children: request.response_text })
              ] }),
              attached.length > 0 && /* @__PURE__ */ jsx("div", { className: "mt-2 flex flex-wrap gap-2", children: attached.map((file) => /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: () => openFile(file),
                  className: "px-2 py-1 text-[11px] bg-gray-900 border border-gray-700 rounded text-blue-400 hover:text-blue-300 transition-colors",
                  children: [
                    file.name,
                    file.created_at && /* @__PURE__ */ jsxs("span", { className: "text-gray-600", children: [
                      " · ",
                      format(parseISO(file.created_at), "d MMM", { locale: fr })
                    ] })
                  ]
                },
                file.id
              )) }),
              request.review_note && /* @__PURE__ */ jsxs("p", { className: "text-[11px] text-red-400 mt-1.5", children: [
                "Retour envoyé : ",
                request.review_note
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 flex-shrink-0", children: [
              request.status !== "validated" && /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => setStatus(request, "validated"),
                  className: "text-[11px] px-2 py-1 rounded bg-green-600/10 text-green-400 hover:bg-green-600/20 transition-colors",
                  children: "Valider"
                }
              ),
              request.status === "received" && /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => {
                    const note = window.prompt("Que faut-il corriger ? Le client verra ce message.");
                    if (note !== null) setStatus(request, "rejected", note || void 0);
                  },
                  className: "text-[11px] px-2 py-1 rounded bg-red-600/10 text-red-400 hover:bg-red-600/20 transition-colors",
                  children: "Redemander"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => remove(request.id),
                  className: "text-[11px] px-1.5 py-1 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity",
                  children: "×"
                }
              )
            ] })
          ] }) }, request.id);
        }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: loadTemplate,
            disabled: seeding,
            className: "text-xs text-gray-500 hover:text-gray-300 transition-colors",
            children: "+ Compléter avec la trame type"
          }
        )
      ] }),
      error && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-400 mt-3", children: error })
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit: add, className: "bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-white", children: "Demander un élément" }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: label,
            onChange: (e) => setLabel(e.target.value),
            placeholder: "Logo, textes, photos…",
            className: inputClass2
          }
        ),
        /* @__PURE__ */ jsx("select", { value: kind, onChange: (e) => setKind(e.target.value), className: inputClass2, children: KINDS$1.map((k) => /* @__PURE__ */ jsx("option", { value: k.value, children: k.label }, k.value)) }),
        /* @__PURE__ */ jsx("select", { value: category, onChange: (e) => setCategory(e.target.value), className: inputClass2, children: CATEGORIES.map((c) => /* @__PURE__ */ jsx("option", { value: c.value, children: c.label }, c.value)) })
      ] }),
      /* @__PURE__ */ jsx(
        "textarea",
        {
          value: description,
          onChange: (e) => setDescription(e.target.value),
          rows: 2,
          placeholder: "Précisions pour le client : format attendu, exemples…",
          className: `${inputClass2} w-full resize-none`
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "submit",
          disabled: !label.trim(),
          className: "px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-medium rounded-lg transition-colors",
          children: "Ajouter à la liste"
        }
      )
    ] })
  ] });
}
const BUCKET = "project-files";
const MAX_BYTES = 25 * 1024 * 1024;
const LINK_TYPES = [
  { value: "link", label: "Lien" },
  { value: "figma", label: "Figma" },
  { value: "drive", label: "Google Drive" },
  { value: "github", label: "GitHub" },
  { value: "other", label: "Autre" }
];
function humanSize(bytes) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}
function ProjectFilesPanel({ projectId }) {
  const { memberById } = useTeam();
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [fileType, setFileType] = useState("link");
  const inputRef = useRef(null);
  const fetchFiles = useCallback(async () => {
    const { data, error: e } = await supabase.from("project_files").select("*").eq("project_id", projectId).order("created_at", { ascending: false });
    if (e) {
      setError("Impossible de charger les documents.");
      return;
    }
    setFiles(data || []);
  }, [projectId]);
  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);
  const handleUpload = async (fileList) => {
    var _a;
    const file = fileList == null ? void 0 : fileList[0];
    if (!file) return;
    if (file.size > MAX_BYTES) {
      setError(`« ${file.name} » dépasse 25 Mo. Passe par un lien Drive pour les fichiers lourds.`);
      return;
    }
    setUploading(true);
    setError(null);
    const safeName = file.name.replace(/[^\w.\-]+/g, "_");
    const path = `${projectId}/${Date.now()}-${safeName}`;
    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
      contentType: file.type || "application/octet-stream",
      upsert: false
    });
    if (uploadError) {
      setError("Le fichier n'a pas pu être envoyé.");
      setUploading(false);
      return;
    }
    const { data: profile } = await supabase.auth.getUser();
    const { error: rowError } = await supabase.from("project_files").insert({
      project_id: projectId,
      name: file.name,
      url: path,
      storage_path: path,
      file_type: "upload",
      size_bytes: file.size,
      mime_type: file.type || null,
      uploaded_by: ((_a = profile.user) == null ? void 0 : _a.id) ?? null
    });
    if (rowError) {
      await supabase.storage.from(BUCKET).remove([path]);
      setError("Le fichier a été envoyé mais n'a pas pu être référencé.");
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
    fetchFiles();
  };
  const openFile = async (file) => {
    if (file.file_type !== "upload" || !file.storage_path) {
      window.open(file.url, "_blank", "noopener");
      return;
    }
    const { data, error: e } = await supabase.storage.from(BUCKET).createSignedUrl(file.storage_path, 120);
    if (e || !data) {
      setError("Le fichier n'a pas pu être ouvert.");
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener");
  };
  const addLink = async () => {
    if (!name.trim() || !url.trim()) return;
    const { error: e } = await supabase.from("project_files").insert({
      project_id: projectId,
      name: name.trim(),
      url: url.trim(),
      file_type: fileType
    });
    if (e) {
      setError("Le lien n'a pas pu être ajouté.");
      return;
    }
    setName("");
    setUrl("");
    setError(null);
    fetchFiles();
  };
  const remove = async (file) => {
    if (file.storage_path) await supabase.storage.from(BUCKET).remove([file.storage_path]);
    await supabase.from("project_files").delete().eq("id", file.id);
    fetchFiles();
  };
  const inputClass2 = "px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500";
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-gray-900 border border-gray-800 rounded-xl p-5", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-white mb-3", children: "Déposer un fichier" }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 flex-wrap", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            ref: inputRef,
            type: "file",
            onChange: (e) => handleUpload(e.target.files),
            disabled: uploading,
            className: "text-sm text-gray-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer"
          }
        ),
        uploading && /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-400", children: "Envoi en cours…" })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-600 mt-2", children: "Maquettes, contrats signés, contenus client. 25 Mo par fichier." })
    ] }),
    error && /* @__PURE__ */ jsx("div", { className: "px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg", children: /* @__PURE__ */ jsx("p", { className: "text-sm text-red-400", children: error }) }),
    /* @__PURE__ */ jsxs("div", { className: "bg-gray-900 border border-gray-800 rounded-xl p-5", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-white mb-3", children: "Ajouter un lien" }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row gap-2", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: name,
            onChange: (e) => setName(e.target.value),
            placeholder: "Maquettes Figma",
            className: `${inputClass2} flex-1`
          }
        ),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "url",
            value: url,
            onChange: (e) => setUrl(e.target.value),
            placeholder: "https://…",
            className: `${inputClass2} flex-1`
          }
        ),
        /* @__PURE__ */ jsx("select", { value: fileType, onChange: (e) => setFileType(e.target.value), className: inputClass2, children: LINK_TYPES.map((t) => /* @__PURE__ */ jsx("option", { value: t.value, children: t.label }, t.value)) }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: addLink,
            disabled: !name.trim() || !url.trim(),
            className: "px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-gray-300 text-sm rounded-lg transition-colors",
            children: "Ajouter"
          }
        )
      ] })
    ] }),
    files.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 text-center py-8", children: "Aucun document pour ce projet." }) : /* @__PURE__ */ jsx("div", { className: "bg-gray-900 border border-gray-800 rounded-xl divide-y divide-gray-800", children: files.map((file) => {
      var _a;
      return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 px-4 py-3 group", children: [
        /* @__PURE__ */ jsx("span", { className: `px-2 py-0.5 text-[10px] font-medium rounded flex-shrink-0 ${file.file_type === "upload" ? "bg-blue-500/20 text-blue-400" : "bg-gray-800 text-gray-400"}`, children: file.file_type === "upload" ? "Fichier" : ((_a = LINK_TYPES.find((t) => t.value === file.file_type)) == null ? void 0 : _a.label) || "Lien" }),
        /* @__PURE__ */ jsxs("button", { onClick: () => openFile(file), className: "flex-1 min-w-0 text-left", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm text-white truncate hover:text-blue-400 transition-colors", children: file.name }),
          /* @__PURE__ */ jsxs("p", { className: "text-[11px] text-gray-500", children: [
            humanSize(file.size_bytes),
            file.size_bytes ? " · " : "",
            format(parseISO(file.created_at), "d MMM yyyy", { locale: fr })
          ] })
        ] }),
        file.uploaded_by && /* @__PURE__ */ jsx(Avatar, { profile: memberById(file.uploaded_by), size: "sm" }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => remove(file),
            className: "text-xs text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0",
            children: "Supprimer"
          }
        )
      ] }, file.id);
    }) })
  ] });
}
const KINDS = [
  { value: "production", label: "Production", badge: "bg-green-500/20 text-green-400" },
  { value: "staging", label: "Préproduction", badge: "bg-amber-500/20 text-amber-400" },
  { value: "repository", label: "Dépôt de code", badge: "bg-gray-700 text-gray-300" },
  { value: "hosting", label: "Hébergement", badge: "bg-blue-500/20 text-blue-400" },
  { value: "registrar", label: "Registrar", badge: "bg-purple-500/20 text-purple-400" },
  { value: "dns", label: "DNS", badge: "bg-indigo-500/20 text-indigo-400" },
  { value: "analytics", label: "Analytics", badge: "bg-pink-500/20 text-pink-400" },
  { value: "other", label: "Autre", badge: "bg-gray-700 text-gray-300" }
];
function EnvironmentsPanel({ projectId }) {
  const [items, setItems] = useState([]);
  const [kind, setKind] = useState("production");
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [username, setUsername] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState(null);
  const fetchItems = useCallback(async () => {
    const { data, error: e } = await supabase.from("project_environments").select("*").eq("project_id", projectId).order("kind");
    if (e) {
      setError("Impossible de charger les accès.");
      return;
    }
    setItems(data || []);
  }, [projectId]);
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);
  const add = async (e) => {
    e.preventDefault();
    if (!label.trim()) return;
    const { error: err } = await supabase.from("project_environments").insert({
      project_id: projectId,
      kind,
      label: label.trim(),
      url: url.trim() || null,
      username: username.trim() || null,
      notes: notes.trim() || null
    });
    if (err) {
      setError("L'entrée n'a pas pu être ajoutée.");
      return;
    }
    setLabel("");
    setUrl("");
    setUsername("");
    setNotes("");
    setError(null);
    fetchItems();
  };
  const remove = async (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    await supabase.from("project_environments").delete().eq("id", id);
  };
  const inputClass2 = "px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500";
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-gray-900 border border-gray-800 rounded-xl p-5", children: [
      /* @__PURE__ */ jsx("div", { className: "flex items-start justify-between gap-3 mb-4 flex-wrap", children: /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-white", children: "Accès et environnements" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: "Adresses, hébergeur, registrar, dépôt. Les identifiants se notent ici, jamais les mots de passe." })
      ] }) }),
      items.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: "Rien de renseigné pour ce projet." }) : /* @__PURE__ */ jsx("div", { className: "space-y-2", children: items.map((item) => {
        const meta = KINDS.find((k) => k.value === item.kind);
        return /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-800/60 rounded-lg group", children: [
          /* @__PURE__ */ jsx("span", { className: `px-2 py-0.5 text-[10px] font-medium rounded flex-shrink-0 ${meta == null ? void 0 : meta.badge}`, children: meta == null ? void 0 : meta.label }),
          /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm text-white", children: item.label }),
            item.url && /* @__PURE__ */ jsx(
              "a",
              {
                href: item.url,
                target: "_blank",
                rel: "noopener noreferrer",
                className: "text-xs text-blue-400 hover:text-blue-300 break-all",
                children: item.url
              }
            ),
            item.username && /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-500", children: [
              "Identifiant : ",
              item.username
            ] }),
            item.notes && /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 whitespace-pre-wrap", children: item.notes })
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => remove(item.id),
              className: "text-xs text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0",
              children: "Retirer"
            }
          )
        ] }, item.id);
      }) }),
      error && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-400 mt-3", children: error })
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit: add, className: "bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-white", children: "Ajouter un accès" }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsx("select", { value: kind, onChange: (e) => setKind(e.target.value), className: inputClass2, children: KINDS.map((k) => /* @__PURE__ */ jsx("option", { value: k.value, children: k.label }, k.value)) }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: label,
            onChange: (e) => setLabel(e.target.value),
            placeholder: "Site en ligne",
            className: inputClass2
          }
        ),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "url",
            value: url,
            onChange: (e) => setUrl(e.target.value),
            placeholder: "https://…",
            className: inputClass2
          }
        ),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: username,
            onChange: (e) => setUsername(e.target.value),
            placeholder: "Identifiant (sans mot de passe)",
            className: inputClass2
          }
        )
      ] }),
      /* @__PURE__ */ jsx(
        "textarea",
        {
          value: notes,
          onChange: (e) => setNotes(e.target.value),
          rows: 2,
          placeholder: "Où trouver les accès, particularités…",
          className: `${inputClass2} w-full resize-none`
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "submit",
          disabled: !label.trim(),
          className: "px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-medium rounded-lg transition-colors",
          children: "Ajouter"
        }
      )
    ] })
  ] });
}
const TYPE_LABELS = {
  landing: "Landing page",
  vitrine: "Site vitrine",
  ecommerce: "E-commerce",
  custom: "Sur mesure",
  mobile: "Mobile",
  maintenance: "Maintenance",
  audit: "Audit",
  other: "Autre"
};
const STATUS_LABELS = {
  briefing: "Briefing",
  design: "Design",
  development: "Développement",
  review: "Recette",
  delivered: "Livré",
  active: "Actif",
  archived: "Archivé"
};
const STATUS_COLORS = {
  briefing: "bg-purple-500/20 text-purple-400",
  design: "bg-pink-500/20 text-pink-400",
  development: "bg-blue-500/20 text-blue-400",
  review: "bg-amber-500/20 text-amber-400",
  delivered: "bg-green-500/20 text-green-400",
  active: "bg-emerald-500/20 text-emerald-400",
  archived: "bg-gray-500/20 text-gray-400"
};
const TASK_STATUS_LABELS = {
  todo: "A faire",
  in_progress: "En cours",
  review: "Recette",
  done: "Terminé"
};
const TASK_STATUS_COLORS = {
  todo: "bg-gray-500/20 text-gray-400",
  in_progress: "bg-blue-500/20 text-blue-400",
  review: "bg-amber-500/20 text-amber-400",
  done: "bg-green-500/20 text-green-400"
};
const PRIORITY_LABELS = {
  urgent: "Urgent",
  high: "Haute",
  medium: "Moyenne",
  low: "Basse"
};
const PRIORITY_COLORS = {
  urgent: "bg-red-500/20 text-red-400",
  high: "bg-orange-500/20 text-orange-400",
  medium: "bg-yellow-500/20 text-yellow-400",
  low: "bg-gray-500/20 text-gray-400"
};
const QUOTE_STATUS_LABELS = {
  draft: "Brouillon",
  sent: "Envoyé",
  accepted: "Accepté",
  rejected: "Refusé",
  expired: "Expiré"
};
const QUOTE_STATUS_COLORS = {
  draft: "bg-gray-500/20 text-gray-400",
  sent: "bg-blue-500/20 text-blue-400",
  accepted: "bg-green-500/20 text-green-400",
  rejected: "bg-red-500/20 text-red-400",
  expired: "bg-amber-500/20 text-amber-400"
};
const INVOICE_STATUS_LABELS = {
  draft: "Brouillon",
  sent: "Envoyée",
  paid: "Payée",
  partial: "Partiel",
  overdue: "En retard",
  cancelled: "Annulée"
};
const INVOICE_STATUS_COLORS = {
  draft: "bg-gray-500/20 text-gray-400",
  sent: "bg-blue-500/20 text-blue-400",
  paid: "bg-green-500/20 text-green-400",
  partial: "bg-amber-500/20 text-amber-400",
  overdue: "bg-red-500/20 text-red-400",
  cancelled: "bg-gray-500/20 text-gray-400"
};
const inputClass = "w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500";
function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { memberById } = useTeam();
  const [project, setProject] = useState(null);
  const [client, setClient] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [timeEntries, setTimeEntries] = useState([]);
  const [files, setFiles] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [editOpen, setEditOpen] = useState(false);
  const [clients, setClients] = useState([]);
  const [timeModalOpen, setTimeModalOpen] = useState(false);
  const [timeTaskId, setTimeTaskId] = useState("");
  const [timeHours, setTimeHours] = useState("");
  const [timeDescription, setTimeDescription] = useState("");
  const [timeDate, setTimeDate] = useState(format(/* @__PURE__ */ new Date(), "yyyy-MM-dd"));
  const fetchAll = useCallback(async () => {
    if (!id) return;
    const [
      { data: proj },
      { data: t },
      { data: te },
      { data: f },
      { data: q },
      { data: inv }
    ] = await Promise.all([
      supabase.from("projects").select("*").eq("id", id).single(),
      supabase.from("tasks").select("*").eq("project_id", id).order("position"),
      supabase.from("time_entries").select("*").eq("project_id", id).order("date", { ascending: false }),
      supabase.from("project_files").select("*").eq("project_id", id).order("created_at", { ascending: false }),
      supabase.from("quotes").select("*, client:clients(id, name)").eq("project_id", id).order("created_at", { ascending: false }),
      supabase.from("invoices").select("*, client:clients(id, name)").eq("project_id", id).order("created_at", { ascending: false })
    ]);
    if (proj) {
      setProject(proj);
      if (proj.client_id) {
        const { data: cl } = await supabase.from("clients").select("*").eq("id", proj.client_id).single();
        if (cl) setClient(cl);
      }
    }
    if (t) setTasks(t);
    if (te) setTimeEntries(te);
    if (f) setFiles(f);
    if (q) setQuotes(q);
    if (inv) setInvoices(inv);
    const { data: allClients } = await supabase.from("clients").select("*").order("name");
    if (allClients) setClients(allClients);
  }, [id]);
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);
  const handleSaveTimeEntry = async () => {
    const hours = parseFloat(timeHours);
    if (!hours || !timeTaskId) return;
    await supabase.from("time_entries").insert({
      task_id: timeTaskId,
      project_id: id,
      hours,
      description: timeDescription || null,
      date: timeDate
    });
    const task = tasks.find((t) => t.id === timeTaskId);
    if (task) {
      await supabase.from("tasks").update({ actual_hours: (task.actual_hours || 0) + hours }).eq("id", timeTaskId);
    }
    setTimeModalOpen(false);
    setTimeHours("");
    setTimeDescription("");
    fetchAll();
  };
  if (!project) {
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-64", children: /* @__PURE__ */ jsx("div", { className: "text-gray-400", children: "Chargement..." }) });
  }
  const doneTasks = tasks.filter((t) => t.status === "done").length;
  const totalTasks = tasks.length;
  const donePercent = totalTasks > 0 ? Math.round(doneTasks / totalTasks * 100) : 0;
  const totalHours = timeEntries.reduce((sum, te) => sum + te.hours, 0);
  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.total_amount, 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + inv.paid_amount, 0);
  const tabs = [
    { key: "overview", label: "Vue d'ensemble" },
    { key: "tasks", label: "Tâches" },
    { key: "contents", label: "Contenus client" },
    { key: "milestones", label: "Deadlines" },
    { key: "acceptance", label: "Recette" },
    { key: "discussion", label: "Discussion" },
    { key: "activity", label: "Activité" },
    { key: "files", label: "Fichiers" },
    { key: "access", label: "Accès" },
    { key: "financial", label: "Financier" }
  ];
  const lead = memberById(project.lead_id);
  return /* @__PURE__ */ jsxs("div", { className: "p-4 sm:p-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3 mb-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => navigate("/dashboard/projects"),
            className: "flex items-center gap-1 text-gray-400 hover:text-white text-sm mb-2 transition-colors",
            children: [
              /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M15 19l-7-7 7-7" }) }),
              "Retour"
            ]
          }
        ),
        /* @__PURE__ */ jsx("h1", { className: "text-xl sm:text-2xl font-bold text-white break-words", children: project.name }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mt-2 flex-wrap", children: [
          project.project_type && /* @__PURE__ */ jsx("span", { className: "px-2 py-0.5 text-xs rounded-full bg-gray-700 text-gray-300", children: TYPE_LABELS[project.project_type] || project.project_type }),
          /* @__PURE__ */ jsx("span", { className: `px-2 py-0.5 text-xs rounded-full ${STATUS_COLORS[project.status] || "bg-gray-500/20 text-gray-400"}`, children: STATUS_LABELS[project.status] || project.status }),
          client && /* @__PURE__ */ jsx(
            Link,
            {
              to: `/dashboard/clients/${client.id}`,
              className: "px-2 py-0.5 text-xs rounded-full bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors",
              children: client.name
            }
          ),
          project.visibility === "team" ? /* @__PURE__ */ jsx(
            "span",
            {
              className: "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/20 text-xs text-blue-400",
              title: "Ce projet et tout ce qui s'y rattache sont visibles de l'équipe",
              children: "Projet d'équipe"
            }
          ) : /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gray-800 text-xs text-gray-300", children: [
            /* @__PURE__ */ jsx(Avatar, { profile: lead, size: "xs" }),
            (lead == null ? void 0 : lead.full_name) || "Non assigné"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setEditOpen(true),
          className: "px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg transition-colors flex-shrink-0",
          children: "Modifier le projet"
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex gap-1 border-b border-gray-800 mb-6 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0", children: tabs.map((tab) => /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => setActiveTab(tab.key),
        className: `px-3 sm:px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${activeTab === tab.key ? "border-b-2 border-blue-500 text-white" : "text-gray-400 hover:text-white"}`,
        children: tab.label
      },
      tab.key
    )) }),
    activeTab === "overview" && /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-gray-900 border border-gray-800 rounded-xl p-4", children: [
          /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-400 mb-1", children: "Tâches terminées" }),
          /* @__PURE__ */ jsxs("div", { className: "text-xl sm:text-2xl font-bold text-white break-words", children: [
            doneTasks,
            " / ",
            totalTasks
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "text-sm text-gray-500", children: [
            donePercent,
            "%"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-gray-900 border border-gray-800 rounded-xl p-4", children: [
          /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-400 mb-1", children: "Temps total" }),
          /* @__PURE__ */ jsxs("div", { className: "text-xl sm:text-2xl font-bold text-white break-words", children: [
            totalHours.toFixed(1),
            "h"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-gray-900 border border-gray-800 rounded-xl p-4", children: [
          /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-400 mb-1", children: "Budget" }),
          /* @__PURE__ */ jsx("div", { className: "text-xl sm:text-2xl font-bold text-white break-words", children: project.budget !== null && project.budget !== void 0 ? formatCurrency(project.budget) : "Non défini" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-gray-900 border border-gray-800 rounded-xl p-4", children: [
          /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-400 mb-1", children: "Période" }),
          /* @__PURE__ */ jsx("div", { className: "text-base sm:text-lg font-bold text-white break-words", children: project.start_date && project.end_date ? `${format(new Date(project.start_date), "d MMM yyyy", { locale: fr })} → ${format(new Date(project.end_date), "d MMM yyyy", { locale: fr })}` : project.start_date ? `Depuis le ${format(new Date(project.start_date), "d MMM yyyy", { locale: fr })}` : project.end_date ? `Jusqu'au ${format(new Date(project.end_date), "d MMM yyyy", { locale: fr })}` : "Non définie" })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mb-6", children: /* @__PURE__ */ jsx(ShareLinkPanel, { entityType: "project", entityId: id, defaultAllowAccept: false }) }),
      /* @__PURE__ */ jsx("div", { className: "mb-6", children: /* @__PURE__ */ jsx(
        ProfitabilityCard,
        {
          project,
          hoursSpent: totalHours,
          collected: invoices.reduce((sum, inv) => sum + (Number(inv.paid_amount) || 0), 0)
        }
      ) }),
      project.description && /* @__PURE__ */ jsxs("div", { className: "bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-gray-400 mb-2", children: "Description" }),
        /* @__PURE__ */ jsx("p", { className: "text-white whitespace-pre-wrap break-words", children: project.description })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-gray-900 border border-gray-800 rounded-xl p-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-gray-400", children: "Progression" }),
          /* @__PURE__ */ jsxs("span", { className: "text-sm text-white font-medium", children: [
            donePercent,
            "%"
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "w-full h-3 bg-gray-800 rounded-full overflow-hidden", children: /* @__PURE__ */ jsx(
          "div",
          {
            className: "h-full bg-blue-600 rounded-full transition-all duration-300",
            style: { width: `${donePercent}%` }
          }
        ) }),
        /* @__PURE__ */ jsxs("div", { className: "text-xs text-gray-500 mt-1", children: [
          doneTasks,
          " tâche",
          doneTasks > 1 ? "s" : "",
          " terminée",
          doneTasks > 1 ? "s" : "",
          " sur ",
          totalTasks
        ] })
      ] })
    ] }),
    activeTab === "tasks" && /* @__PURE__ */ jsxs("div", { children: [
      tasks.length === 0 ? /* @__PURE__ */ jsx("div", { className: "text-center py-12 text-gray-500", children: "Aucune tâche pour ce projet." }) : /* @__PURE__ */ jsx("div", { className: "bg-gray-900 border border-gray-800 rounded-xl overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full", children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-800", children: [
          /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3 text-sm font-medium text-gray-400", children: "Titre" }),
          /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3 text-sm font-medium text-gray-400", children: "Responsable" }),
          /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3 text-sm font-medium text-gray-400", children: "Statut" }),
          /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3 text-sm font-medium text-gray-400", children: "Priorité" }),
          /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3 text-sm font-medium text-gray-400", children: "Temps" }),
          /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3 text-sm font-medium text-gray-400", children: "Deadline" }),
          /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3 text-sm font-medium text-gray-400", children: "Action" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { children: tasks.map((task) => {
          const timePercent = task.estimated_hours && task.estimated_hours > 0 ? Math.min(100, Math.round(task.actual_hours / task.estimated_hours * 100)) : 0;
          return /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-800 last:border-0 hover:bg-gray-800/50", children: [
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-sm text-white font-medium", children: task.title }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsx(Avatar, { profile: memberById(task.assignee_id), size: "sm", showName: true }) }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsx("span", { className: `px-2 py-0.5 text-xs rounded-full ${TASK_STATUS_COLORS[task.status] || ""}`, children: TASK_STATUS_LABELS[task.status] || task.status }) }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsx("span", { className: `px-2 py-0.5 text-xs rounded-full ${PRIORITY_COLORS[task.priority] || ""}`, children: PRIORITY_LABELS[task.priority] || task.priority }) }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxs("span", { className: "text-sm text-gray-300", children: [
                task.actual_hours.toFixed(1),
                "h",
                task.estimated_hours ? ` / ${task.estimated_hours}h` : ""
              ] }),
              task.estimated_hours && task.estimated_hours > 0 && /* @__PURE__ */ jsx("div", { className: "w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden", children: /* @__PURE__ */ jsx(
                "div",
                {
                  className: `h-full rounded-full ${timePercent >= 100 ? "bg-red-500" : "bg-blue-500"}`,
                  style: { width: `${timePercent}%` }
                }
              ) })
            ] }) }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-sm text-gray-400", children: task.deadline ? format(new Date(task.deadline), "dd/MM/yyyy") : "-" }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => {
                  setTimeTaskId(task.id);
                  setTimeModalOpen(true);
                },
                className: "text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors",
                children: "Logger du temps"
              }
            ) })
          ] }, task.id);
        }) })
      ] }) }) }),
      /* @__PURE__ */ jsx(Modal, { open: timeModalOpen, onClose: () => setTimeModalOpen(false), title: "Logger du temps", children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Tâche" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: timeTaskId,
              onChange: (e) => setTimeTaskId(e.target.value),
              className: inputClass,
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "Sélectionner une tâche" }),
                tasks.map((t) => /* @__PURE__ */ jsx("option", { value: t.id, children: t.title }, t.id))
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Heures" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              step: "0.25",
              min: "0",
              value: timeHours,
              onChange: (e) => setTimeHours(e.target.value),
              placeholder: "Ex: 1.5",
              className: inputClass
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Description" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: timeDescription,
              onChange: (e) => setTimeDescription(e.target.value),
              placeholder: "Description optionnelle",
              className: inputClass
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Date" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "date",
              value: timeDate,
              onChange: (e) => setTimeDate(e.target.value),
              className: inputClass
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2 pt-2", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setTimeModalOpen(false),
              className: "px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors",
              children: "Annuler"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: handleSaveTimeEntry,
              className: "px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors",
              children: "Enregistrer"
            }
          )
        ] })
      ] }) })
    ] }),
    activeTab === "discussion" && id && /* @__PURE__ */ jsx(CommentThread, { entityType: "project", entityId: id, title: "Discussion du projet" }),
    activeTab === "contents" && id && /* @__PURE__ */ jsx(ContentRequestsPanel, { projectId: id }),
    activeTab === "milestones" && id && /* @__PURE__ */ jsx(MilestonesPanel, { projectId: id }),
    activeTab === "acceptance" && id && /* @__PURE__ */ jsx(AcceptanceChecklist, { projectId: id }),
    activeTab === "activity" && id && /* @__PURE__ */ jsx(ActivityFeed, { projectId: id, title: "Journal du projet", limit: 50 }),
    activeTab === "files" && id && /* @__PURE__ */ jsx(ProjectFilesPanel, { projectId: id }),
    activeTab === "access" && id && /* @__PURE__ */ jsx(EnvironmentsPanel, { projectId: id }),
    activeTab === "financial" && /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-gray-900 border border-gray-800 rounded-xl p-4", children: [
          /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-400 mb-1", children: "Budget projet" }),
          /* @__PURE__ */ jsx("div", { className: "text-xl sm:text-2xl font-bold text-white break-words", children: project.budget !== null && project.budget !== void 0 ? formatCurrency(project.budget) : "Non défini" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-gray-900 border border-gray-800 rounded-xl p-4", children: [
          /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-400 mb-1", children: "Montant facturé" }),
          /* @__PURE__ */ jsx("div", { className: "text-xl sm:text-2xl font-bold text-white break-words", children: formatCurrency(totalInvoiced) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-gray-900 border border-gray-800 rounded-xl p-4", children: [
          /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-400 mb-1", children: "Montant encaissé" }),
          /* @__PURE__ */ jsx("div", { className: "text-xl sm:text-2xl font-bold text-green-400 break-words", children: formatCurrency(totalPaid) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-white mb-3", children: "Devis liés" }),
        quotes.length === 0 ? /* @__PURE__ */ jsx("div", { className: "text-center py-8 text-gray-500 bg-gray-900 border border-gray-800 rounded-xl", children: "Aucun devis lié à ce projet." }) : /* @__PURE__ */ jsx("div", { className: "bg-gray-900 border border-gray-800 rounded-xl overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full", children: [
          /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-800", children: [
            /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3 text-sm font-medium text-gray-400", children: "Numéro" }),
            /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3 text-sm font-medium text-gray-400", children: "Titre" }),
            /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3 text-sm font-medium text-gray-400", children: "Montant" }),
            /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3 text-sm font-medium text-gray-400", children: "Statut" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { children: quotes.map((quote) => /* @__PURE__ */ jsxs(
            "tr",
            {
              onClick: () => navigate(`/dashboard/quotes/${quote.id}`),
              className: "border-b border-gray-800 last:border-0 hover:bg-gray-800/50 cursor-pointer",
              children: [
                /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-sm text-blue-400 font-mono", children: quote.quote_number }),
                /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-sm text-white", children: quote.title }),
                /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-sm text-white font-medium", children: formatCurrency(quote.total_amount) }),
                /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsx("span", { className: `px-2 py-0.5 text-xs rounded-full ${QUOTE_STATUS_COLORS[quote.status] || ""}`, children: QUOTE_STATUS_LABELS[quote.status] || quote.status }) })
              ]
            },
            quote.id
          )) })
        ] }) }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-white mb-3", children: "Factures liées" }),
        invoices.length === 0 ? /* @__PURE__ */ jsx("div", { className: "text-center py-8 text-gray-500 bg-gray-900 border border-gray-800 rounded-xl", children: "Aucune facture liée à ce projet." }) : /* @__PURE__ */ jsx("div", { className: "bg-gray-900 border border-gray-800 rounded-xl overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full", children: [
          /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-800", children: [
            /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3 text-sm font-medium text-gray-400", children: "Numéro" }),
            /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3 text-sm font-medium text-gray-400", children: "Titre" }),
            /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3 text-sm font-medium text-gray-400", children: "Montant" }),
            /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3 text-sm font-medium text-gray-400", children: "Payé" }),
            /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3 text-sm font-medium text-gray-400", children: "Statut" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { children: invoices.map((invoice) => /* @__PURE__ */ jsxs(
            "tr",
            {
              onClick: () => navigate(`/dashboard/invoices/${invoice.id}`),
              className: "border-b border-gray-800 last:border-0 hover:bg-gray-800/50 cursor-pointer",
              children: [
                /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-sm text-blue-400 font-mono", children: invoice.invoice_number }),
                /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-sm text-white", children: invoice.title }),
                /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-sm text-white font-medium", children: formatCurrency(invoice.total_amount) }),
                /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-sm text-green-400 font-medium", children: formatCurrency(invoice.paid_amount) }),
                /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsx("span", { className: `px-2 py-0.5 text-xs rounded-full ${INVOICE_STATUS_COLORS[invoice.status] || ""}`, children: INVOICE_STATUS_LABELS[invoice.status] || invoice.status }) })
              ]
            },
            invoice.id
          )) })
        ] }) }) })
      ] })
    ] }),
    /* @__PURE__ */ jsx(
      ProjectModal,
      {
        open: editOpen,
        onClose: () => setEditOpen(false),
        project,
        clients,
        onSave: async (data) => {
          const { error } = await supabase.from("projects").update(data).eq("id", id);
          if (error) {
            alert("Le projet n'a pas pu être modifié.");
            return;
          }
          fetchAll();
        },
        onDelete: async (projectId) => {
          const { error } = await supabase.from("projects").delete().eq("id", projectId);
          if (error) {
            alert("Le projet n'a pas pu être supprimé.");
            return;
          }
          navigate("/dashboard/projects");
        },
        onArchive: async (projectId, archived) => {
          const { error } = await supabase.from("projects").update({ is_archived: archived }).eq("id", projectId);
          if (error) {
            alert("Le projet n'a pas pu être archivé.");
            return;
          }
          fetchAll();
        }
      }
    )
  ] });
}
const TRIGGER_LABELS = {
  lead_no_activity: "Lead sans activité",
  quote_no_response: "Devis sans réponse",
  invoice_overdue: "Facture impayée",
  follow_up_due: "Rappel follow-up",
  project_milestone: "Deadline de projet"
};
const ACTION_LABELS = {
  sms: "SMS",
  email: "Email",
  notification: "Notification",
  status_change: "Changement de statut"
};
function AutomationPage() {
  const [rules, setRules] = useState([]);
  const [logs, setLogs] = useState([]);
  const [editingRule, setEditingRule] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [ruleName, setRuleName] = useState("");
  const [triggerType, setTriggerType] = useState("lead_no_activity");
  const [triggerDelay, setTriggerDelay] = useState("2");
  const [actionType, setActionType] = useState("notification");
  const [actionTemplate, setActionTemplate] = useState("");
  const fetchAll = useCallback(async () => {
    const [{ data: r }, { data: l }] = await Promise.all([
      supabase.from("automation_rules").select("*").order("created_at"),
      supabase.from("automation_logs").select("*").order("executed_at", { ascending: false }).limit(50)
    ]);
    if (r) setRules(r);
    if (l) setLogs(l);
  }, []);
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);
  const handleToggle = async (rule) => {
    await supabase.from("automation_rules").update({ is_active: !rule.is_active }).eq("id", rule.id);
    fetchAll();
  };
  const handleSaveRule = async () => {
    const data = {
      name: ruleName,
      trigger_type: triggerType,
      trigger_delay_days: parseInt(triggerDelay),
      action_type: actionType,
      action_template: actionTemplate || null
    };
    if (editingRule) {
      await supabase.from("automation_rules").update(data).eq("id", editingRule.id);
    } else {
      await supabase.from("automation_rules").insert(data);
    }
    setModalOpen(false);
    setEditingRule(null);
    fetchAll();
  };
  const handleDeleteRule = async (id) => {
    if (!confirm("Supprimer cette règle ?")) return;
    await supabase.from("automation_rules").delete().eq("id", id);
    fetchAll();
  };
  const openEdit = (rule) => {
    setEditingRule(rule);
    setRuleName(rule.name);
    setTriggerType(rule.trigger_type);
    setTriggerDelay(String(rule.trigger_delay_days));
    setActionType(rule.action_type);
    setActionTemplate(rule.action_template || "");
    setModalOpen(true);
  };
  const openNew = () => {
    setEditingRule(null);
    setRuleName("");
    setTriggerType("lead_no_activity");
    setTriggerDelay("2");
    setActionType("notification");
    setActionTemplate("");
    setModalOpen(true);
  };
  const inputClass2 = "w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500";
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-gray-950 p-4 sm:p-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-6", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-lg font-semibold text-white", children: "Règles d'automatisation" }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: openNew,
          className: "px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors",
          children: "+ Nouvelle règle"
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "bg-gray-900 border border-gray-800 rounded-xl overflow-hidden mb-8", children: /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-800", children: [
        /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3 text-gray-400 font-medium", children: "Nom" }),
        /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3 text-gray-400 font-medium", children: "Déclencheur" }),
        /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3 text-gray-400 font-medium", children: "Délai" }),
        /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3 text-gray-400 font-medium", children: "Action" }),
        /* @__PURE__ */ jsx("th", { className: "text-center px-4 py-3 text-gray-400 font-medium", children: "Actif" }),
        /* @__PURE__ */ jsx("th", { className: "text-right px-4 py-3 text-gray-400 font-medium", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsxs("tbody", { children: [
        rules.length === 0 && /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 6, className: "px-4 py-8 text-center text-gray-400", children: "Aucune règle configurée" }) }),
        rules.map((rule) => /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-800 last:border-b-0 hover:bg-gray-800/50 transition-colors", children: [
          /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-white font-medium", children: rule.name }),
          /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-gray-300", children: TRIGGER_LABELS[rule.trigger_type] }),
          /* @__PURE__ */ jsxs("td", { className: "px-4 py-3 text-gray-300", children: [
            rule.trigger_delay_days,
            " jour",
            rule.trigger_delay_days > 1 ? "s" : ""
          ] }),
          /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-gray-300", children: ACTION_LABELS[rule.action_type] }),
          /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-center", children: /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => handleToggle(rule),
              className: `relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${rule.is_active ? "bg-blue-600" : "bg-gray-700"}`,
              children: /* @__PURE__ */ jsx(
                "span",
                {
                  className: `inline-block h-4 w-4 rounded-full bg-white transition-transform ${rule.is_active ? "translate-x-6" : "translate-x-1"}`
                }
              )
            }
          ) }),
          /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-right", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-2", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => openEdit(rule),
                className: "px-2 py-1 text-xs text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors",
                children: "Modifier"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => handleDeleteRule(rule.id),
                className: "px-2 py-1 text-xs text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded transition-colors",
                children: "Supprimer"
              }
            )
          ] }) })
        ] }, rule.id))
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxs("div", { className: "bg-gray-900 border border-gray-800 rounded-xl overflow-hidden", children: [
      /* @__PURE__ */ jsx("div", { className: "px-4 py-3 border-b border-gray-800", children: /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-white", children: "Historique récent" }) }),
      /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-800", children: [
          /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3 text-gray-400 font-medium", children: "Date" }),
          /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3 text-gray-400 font-medium", children: "Action" }),
          /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3 text-gray-400 font-medium", children: "Entité" }),
          /* @__PURE__ */ jsx("th", { className: "text-center px-4 py-3 text-gray-400 font-medium", children: "Statut" })
        ] }) }),
        /* @__PURE__ */ jsxs("tbody", { children: [
          logs.length === 0 && /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 4, className: "px-4 py-8 text-center text-gray-400", children: "Aucun log récent" }) }),
          logs.map((log) => /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-800 last:border-b-0 hover:bg-gray-800/50 transition-colors", children: [
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-gray-300 whitespace-nowrap", children: format(new Date(log.executed_at), "dd MMM yyyy HH:mm", { locale: fr }) }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-gray-300 max-w-xs truncate", title: log.action_taken, children: log.action_taken }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsx("span", { className: "inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-gray-800 text-gray-300 border border-gray-700", children: log.entity_type }) }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-center", children: log.success ? /* @__PURE__ */ jsx("svg", { className: "w-5 h-5 text-green-400 inline-block", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M5 13l4 4L19 7" }) }) : /* @__PURE__ */ jsx("svg", { className: "w-5 h-5 text-red-400 inline-block", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M6 18L18 6M6 6l12 12" }) }) })
          ] }, log.id))
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsx(
      Modal,
      {
        open: modalOpen,
        onClose: () => {
          setModalOpen(false);
          setEditingRule(null);
        },
        title: editingRule ? "Modifier la règle" : "Nouvelle règle",
        children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Nom de la règle" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: ruleName,
                onChange: (e) => setRuleName(e.target.value),
                placeholder: "Ex: Relance lead inactif",
                className: inputClass2
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Déclencheur" }),
            /* @__PURE__ */ jsx(
              "select",
              {
                value: triggerType,
                onChange: (e) => setTriggerType(e.target.value),
                className: inputClass2,
                children: Object.entries(TRIGGER_LABELS).map(([value, label]) => /* @__PURE__ */ jsx("option", { value, children: label }, value))
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Délai (jours)" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                min: "0",
                value: triggerDelay,
                onChange: (e) => setTriggerDelay(e.target.value),
                className: inputClass2
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Type d'action" }),
            /* @__PURE__ */ jsx(
              "select",
              {
                value: actionType,
                onChange: (e) => setActionType(e.target.value),
                className: inputClass2,
                children: Object.entries(ACTION_LABELS).map(([value, label]) => /* @__PURE__ */ jsx("option", { value, children: label }, value))
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-400 mb-1", children: "Template du message" }),
            /* @__PURE__ */ jsx(
              "textarea",
              {
                value: actionTemplate,
                onChange: (e) => setActionTemplate(e.target.value),
                rows: 4,
                placeholder: "Bonjour {{name}}, votre devis {{quote_number}} est en attente...",
                className: inputClass2
              }
            ),
            /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-500 mt-1", children: [
              "Variables disponibles : ",
              "{{name}}",
              ", ",
              "{{quote_number}}",
              ", ",
              "{{client_name}}",
              ", ",
              "{{invoice_number}}"
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex justify-end pt-2", children: /* @__PURE__ */ jsx(
            "button",
            {
              onClick: handleSaveRule,
              disabled: !ruleName.trim(),
              className: "px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors",
              children: editingRule ? "Enregistrer" : "Créer la règle"
            }
          ) })
        ] })
      }
    )
  ] });
}
function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);
  return /* @__PURE__ */ jsx(TeamProvider, { children: /* @__PURE__ */ jsx(TimerProvider, { children: /* @__PURE__ */ jsx(TwilioProvider, { children: /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-gray-950 text-white", children: [
    /* @__PURE__ */ jsx(Sidebar, { open: sidebarOpen, onClose: () => setSidebarOpen(false) }),
    /* @__PURE__ */ jsxs("div", { className: "lg:ml-64 min-w-0", children: [
      /* @__PURE__ */ jsx(Header, { onMenuClick: () => setSidebarOpen(true) }),
      /* @__PURE__ */ jsx("main", { className: "min-w-0 overflow-x-hidden", children: /* @__PURE__ */ jsxs(Routes, { children: [
        /* @__PURE__ */ jsx(Route, { index: true, element: /* @__PURE__ */ jsx(DashboardHome, {}) }),
        /* @__PURE__ */ jsx(Route, { path: "kanban", element: /* @__PURE__ */ jsx(KanbanPage, {}) }),
        /* @__PURE__ */ jsx(Route, { path: "calendar", element: /* @__PURE__ */ jsx(CalendarPage, {}) }),
        /* @__PURE__ */ jsx(Route, { path: "clients", element: /* @__PURE__ */ jsx(ClientsPage, {}) }),
        /* @__PURE__ */ jsx(Route, { path: "clients/:id", element: /* @__PURE__ */ jsx(ClientDetailPage, {}) }),
        /* @__PURE__ */ jsx(Route, { path: "sms-templates", element: /* @__PURE__ */ jsx(SmsTemplatesPage, {}) }),
        /* @__PURE__ */ jsx(Route, { path: "quotes", element: /* @__PURE__ */ jsx(QuotesPage, {}) }),
        /* @__PURE__ */ jsx(Route, { path: "quotes/new", element: /* @__PURE__ */ jsx(QuoteDetailPage, {}) }),
        /* @__PURE__ */ jsx(Route, { path: "quotes/:id", element: /* @__PURE__ */ jsx(QuoteDetailPage, {}) }),
        /* @__PURE__ */ jsx(Route, { path: "invoices", element: /* @__PURE__ */ jsx(InvoicesPage, {}) }),
        /* @__PURE__ */ jsx(Route, { path: "invoices/new", element: /* @__PURE__ */ jsx(InvoiceDetailPage, {}) }),
        /* @__PURE__ */ jsx(Route, { path: "invoices/:id", element: /* @__PURE__ */ jsx(InvoiceDetailPage, {}) }),
        /* @__PURE__ */ jsx(Route, { path: "finances", element: /* @__PURE__ */ jsx(RequireOwner, { children: /* @__PURE__ */ jsx(FinancesPage, {}) }) }),
        /* @__PURE__ */ jsx(Route, { path: "comptabilite", element: /* @__PURE__ */ jsx(AccountingPage, {}) }),
        /* @__PURE__ */ jsx(Route, { path: "pointage", element: /* @__PURE__ */ jsx(TimeClockPage, {}) }),
        /* @__PURE__ */ jsx(Route, { path: "mes-documents", element: /* @__PURE__ */ jsx(IssuerPage, {}) }),
        /* @__PURE__ */ jsx(Route, { path: "messages", element: /* @__PURE__ */ jsx(MessagesPage, {}) }),
        /* @__PURE__ */ jsx(Route, { path: "messages/:id", element: /* @__PURE__ */ jsx(MessagesPage, {}) }),
        /* @__PURE__ */ jsx(Route, { path: "proposals", element: /* @__PURE__ */ jsx(ProposalsPage, {}) }),
        /* @__PURE__ */ jsx(Route, { path: "proposals/new", element: /* @__PURE__ */ jsx(ProposalDetailPage, {}) }),
        /* @__PURE__ */ jsx(Route, { path: "proposals/:id", element: /* @__PURE__ */ jsx(ProposalDetailPage, {}) }),
        /* @__PURE__ */ jsx(Route, { path: "projects", element: /* @__PURE__ */ jsx(ProjectsPage, {}) }),
        /* @__PURE__ */ jsx(Route, { path: "projects/:id", element: /* @__PURE__ */ jsx(ProjectDetailPage, {}) }),
        /* @__PURE__ */ jsx(Route, { path: "automation", element: /* @__PURE__ */ jsx(AutomationPage, {}) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsx(Softphone, {}),
    /* @__PURE__ */ jsx(TimerBar, {})
  ] }) }) }) });
}
export {
  DashboardLayout as default
};
