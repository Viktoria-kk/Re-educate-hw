"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api, { errorMessage } from "@/lib/api";
import { useUser } from "@/context/UserContext";

export default function UserForm() {
  const { user, setSession } = useUser();
  const router = useRouter();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const changeMode = (nextMode) => { setMode(nextMode); setError(""); };
  const update = (field) => (event) => setForm({ ...form, [field]: event.target.value });

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const endpoint = mode === "login" ? "/auth/sign-in" : "/auth/sign-up";
      const payload = mode === "login"
        ? { email: form.email, password: form.password }
        : form;
      const { data } = await api.post(endpoint, payload);
      setSession(data);
      router.push("/quizzes");
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setBusy(false);
    }
  };

  return <div className="user-panel">
    {user && <div className="saved-user"><div><small>Signed in as</small><strong>{user.username}</strong></div><button className="button secondary" onClick={() => router.push("/quizzes")}>Continue</button></div>}
    {user && <div className="divider"><span>use another account</span></div>}
    <div className="auth-switch" role="tablist" aria-label="Account access">
      <button type="button" className={mode === "login" ? "active" : ""} onClick={() => changeMode("login")}>Log in</button>
      <button type="button" className={mode === "create" ? "active" : ""} onClick={() => changeMode("create")}>Sign up</button>
    </div>
    <form onSubmit={submit}>
      {mode === "create" && <label>Username<input value={form.username} onChange={update("username")} placeholder="Enter your username" minLength="2" maxLength="40" required /></label>}
      <label>Email<input type="email" value={form.email} onChange={update("email")} placeholder="you@example.com" autoComplete="email" required /></label>
      <label>Password<input type="password" value={form.password} onChange={update("password")} placeholder="At least 6 characters" minLength="6" maxLength="72" autoComplete={mode === "login" ? "current-password" : "new-password"} required /></label>
      {error && <p className="error" role="alert">{error}</p>}
      <button className="button primary full" disabled={busy}>{busy ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}</button>
      <p className="privacy">Passwords are securely hashed. Your session is stored in this browser for seven days.</p>
    </form>
  </div>;
}
