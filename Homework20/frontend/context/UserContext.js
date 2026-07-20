"use client";

import { createContext, useContext, useEffect, useState } from "react";
import socket from "@/lib/socket";
import api from "@/lib/api";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUserState] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem("quizToken");
      if (!token) { localStorage.removeItem("quizUser"); setReady(true); return; }
      try {
        const { data } = await api.get("/auth/current-user");
        setUserState(data);
        localStorage.setItem("quizUser", JSON.stringify(data));
      } catch {
        localStorage.removeItem("quizToken");
        localStorage.removeItem("quizUser");
      } finally { setReady(true); }
    };
    restoreSession();
  }, []);

  useEffect(() => {
    if (!user) return;

    const identify = () => {
      socket.emit("user:online", {
        userId: user._id,
        username: user.username,
        token: localStorage.getItem("quizToken"),
      });
      socket.emit("online-users:request");
    };
    const handleVisibility = () => {
      if (document.visibilityState === "visible" && socket.connected) identify();
    };

    socket.on("connect", identify);
    window.addEventListener("focus", identify);
    document.addEventListener("visibilitychange", handleVisibility);

    if (socket.connected) identify();
    else socket.connect();

    return () => {
      socket.off("connect", identify);
      window.removeEventListener("focus", identify);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [user]);

  const setUser = (next) => {
    setUserState(next);
    if (next) localStorage.setItem("quizUser", JSON.stringify(next));
    else localStorage.removeItem("quizUser");
  };

  const setSession = ({ accessToken, user: sessionUser }) => {
    localStorage.setItem("quizToken", accessToken);
    setUser(sessionUser);
  };

  const logout = () => {
    if (socket.connected) socket.emit("user:offline");
    setUser(null);
    localStorage.removeItem("quizToken");
    socket.disconnect();
  };

  return <UserContext.Provider value={{ user, setUser, setSession, logout, ready }}>{children}</UserContext.Provider>;
}

export const useUser = () => useContext(UserContext);
