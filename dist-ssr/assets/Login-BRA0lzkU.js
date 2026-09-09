import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { u as useAuth } from "../entry-server.js";
import "react-dom/server";
import "react-router-dom/server.mjs";
import "@supabase/supabase-js";
import "framer-motion";
import "lenis";
import "three";
import "@emailjs/browser";
function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: error2 } = await signIn(email, password);
    if (error2) {
      setError("Email ou mot de passe incorrect");
      setLoading(false);
    } else {
      navigate("/dashboard");
    }
  };
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-gray-950 flex items-center justify-center px-4", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-sm", children: [
    /* @__PURE__ */ jsxs("div", { className: "text-center mb-8", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-white", children: "Digitalz Dev" }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-400 mt-1", children: "Back-office" })
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
      error && /* @__PURE__ */ jsx("div", { className: "bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg", children: error }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "email", className: "block text-sm text-gray-400 mb-1", children: "Email" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            id: "email",
            type: "email",
            value: email,
            onChange: (e) => setEmail(e.target.value),
            required: true,
            className: "w-full px-4 py-2.5 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors",
            placeholder: "admin@digitalzdev.com"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "password", className: "block text-sm text-gray-400 mb-1", children: "Mot de passe" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            id: "password",
            type: "password",
            value: password,
            onChange: (e) => setPassword(e.target.value),
            required: true,
            className: "w-full px-4 py-2.5 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors",
            placeholder: "••••••••"
          }
        )
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "submit",
          disabled: loading,
          className: "w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors",
          children: loading ? "Connexion..." : "Se connecter"
        }
      )
    ] })
  ] }) });
}
export {
  Login as default
};
