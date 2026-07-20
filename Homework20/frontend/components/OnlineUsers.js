"use client";

import { useEffect, useState } from "react";
import socket from "@/lib/socket";
import { useUser } from "@/context/UserContext";

export default function OnlineUsers() {
  const { user } = useUser();
  const [online, setOnline] = useState({ count: 0, users: [] });

  useEffect(() => {
    const handleOnlineUsers = (data) => setOnline(data);
    const requestOnlineUsers = () => socket.emit("online-users:request");

    socket.on("online-users:update", handleOnlineUsers);
    socket.on("connect", requestOnlineUsers);
    window.addEventListener("focus", requestOnlineUsers);

    if (socket.connected) {
      requestOnlineUsers();
    } else {
      socket.connect();
    }

    return () => {
      socket.off("online-users:update", handleOnlineUsers);
      socket.off("connect", requestOnlineUsers);
      window.removeEventListener("focus", requestOnlineUsers);
    };
  }, []);

  const otherUsers = online.users.filter((person) => person.userId !== user?._id);

  return <aside className="online-card"><div className="online-title"><span className="status-dot"/><div><strong>{otherUsers.length} online</strong><small>Other participants</small></div></div><div className="online-list">{otherUsers.length ? otherUsers.map((person) => <div key={person.userId}><span>{person.username.slice(0, 1).toUpperCase()}</span>{person.username}</div>) : <p>No other participants are online.</p>}</div></aside>;
}
