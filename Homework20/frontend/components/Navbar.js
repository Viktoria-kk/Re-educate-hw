"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import api, { errorMessage } from "@/lib/api";

export default function Navbar() {
  const path = usePathname();
  const router = useRouter();
  const { user, setUser, logout } = useUser();
  const menuRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const closeOutside = (event) => {
      if (!menuRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", closeOutside);
    return () => document.removeEventListener("mousedown", closeOutside);
  }, []);

  const openEditor = () => {
    setUsername(user.username);
    setError("");
    setEditing(true);
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const { data } = await api.patch(`/users/${user._id}`, { username });
      setUser(data);
      setEditing(false);
      setOpen(false);
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    setOpen(false);
    setEditing(false);
    logout();
    router.push("/");
  };

  return <>
    <header className="nav">
      <Link className="brand" href="/"><span className="brand-mark">Q</span>QuizBoard</Link>
      <nav>
        <Link className={path.startsWith("/quizzes") ? "active" : ""} href="/quizzes">Quizzes</Link>
        <Link className={path === "/leaderboard" ? "active" : ""} href="/leaderboard">Leaderboard</Link>
      </nav>
      <div className="profile-menu" ref={menuRef}>
        <button className="nav-user" type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-haspopup="menu">
          <span className="status-dot" />{user?.username || "Guest"}<span className="chevron" aria-hidden="true" />
        </button>
        {open && <div className="profile-dropdown" role="menu">
          {user ? <>
            <div className="profile-summary"><span>{user.username.slice(0, 1).toUpperCase()}</span><div><strong>{user.username}</strong><small>{user.email}</small></div></div>
            <button type="button" onClick={openEditor}>Edit profile</button>
            <button className="logout-button" type="button" onClick={handleLogout}>Log out</button>
          </> : <><p>Create a profile to save scores and appear on the leaderboard.</p><Link href="/" onClick={() => setOpen(false)}>Create profile</Link></>}
        </div>}
      </div>
    </header>
    {editing && <div className="modal-backdrop" role="presentation" onMouseDown={() => setEditing(false)}>
      <section className="profile-modal" role="dialog" aria-modal="true" aria-labelledby="profile-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-heading"><div><span className="eyebrow">ACCOUNT</span><h2 id="profile-title">Edit profile</h2></div><button type="button" aria-label="Close profile editor" onClick={() => setEditing(false)}>×</button></div>
        <form onSubmit={saveProfile}>
          <label>Username<input value={username} onChange={(event) => setUsername(event.target.value)} minLength="2" maxLength="40" required /></label>
          <div className="profile-email"><span>Email</span><strong>{user.email}</strong><small>Email cannot be changed.</small></div>
          {error && <p className="error" role="alert">{error}</p>}
          <div className="modal-actions"><button className="button secondary" type="button" onClick={() => setEditing(false)}>Cancel</button><button className="button primary" disabled={saving}>{saving ? "Saving…" : "Save changes"}</button></div>
        </form>
      </section>
    </div>}
  </>;
}
