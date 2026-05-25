"use client";
import { useState, useRef, useEffect } from "react";
import { FiSend, FiMail, FiUser, FiChevronDown, FiStar, FiTrash2 } from "react-icons/fi";

const contacts = [
  { name: "Youssef Jarray", email: "youssef@example.com", initials: "YJ", color: "from-orange-500 to-rose-600" },
];

const initialMessages = [
  { id: 1, from: "Youssef Jarray", email: "youssef@example.com", subject: "Welcome to my portfolio!", body: "Hey there! Thanks for checking out my portfolio. Feel free to send me a message using the compose form. I'd love to hear from you!", date: new Date().toISOString(), read: false, starred: false },
];

export default function ContactApp() {
  const [messages, setMessages] = useState(initialMessages);
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [showCompose, setShowCompose] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [filter, setFilter] = useState("inbox");
  const [searchQuery, setSearchQuery] = useState("");
  const composeRef = useRef(null);

  const filteredMessages = messages.filter((m) => {
    if (filter === "unread") return !m.read;
    if (filter === "starred") return m.starred;
    return true;
  }).filter((m) =>
    !searchQuery.trim() ||
    m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.from.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSend = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return;
    setSending(true);
    setTimeout(() => {
      const newMsg = {
        id: Date.now(),
        from: form.name,
        email: form.email,
        subject: form.subject || "(No subject)",
        body: form.message,
        date: new Date().toISOString(),
        read: true,
        starred: false,
      };
      setMessages((prev) => [newMsg, ...prev]);
      setForm({ name: "", email: "", subject: "", message: "" });
      setShowCompose(false);
      setSending(false);
      setSent(true);
      setTimeout(() => setSent(false), 3000);
    }, 600);
  };

  const toggleStar = (id) => {
    setMessages((prev) => prev.map((m) => m.id === id ? { ...m, starred: !m.starred } : m));
  };

  const markRead = (id) => {
    setMessages((prev) => prev.map((m) => m.id === id ? { ...m, read: true } : m));
    const msg = messages.find((m) => m.id === id);
    if (msg) setSelectedMsg(msg);
  };

  const handleComposeClick = () => {
    setShowCompose(true);
    setSelectedMsg(null);
  };

  useEffect(() => {
    if (!showCompose) return;
    const handler = (e) => {
      if (composeRef.current && !composeRef.current.contains(e.target)) setShowCompose(false);
    };
    setTimeout(() => document.addEventListener("mousedown", handler), 0);
    return () => document.removeEventListener("mousedown", handler);
  }, [showCompose]);

  return (
    <div className="h-full flex" style={{ background: "var(--bg-root)" }}>
      {/* Sidebar */}
      <div
        className="w-44 shrink-0 flex flex-col border-r"
        style={{ borderColor: "var(--border)", background: "var(--bg-elevated)" }}
      >
        <div className="p-3">
          <button
            onClick={handleComposeClick}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all hover:brightness-110"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            <FiSend size={12} />
            Compose
          </button>
        </div>

        <div className="px-2 space-y-0.5">
          {[
            { id: "inbox", label: "Inbox", count: messages.length },
            { id: "unread", label: "Unread", count: messages.filter((m) => !m.read).length },
            { id: "starred", label: "Starred", count: messages.filter((m) => m.starred).length },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`flex items-center justify-between w-full px-3 py-1.5 rounded-lg text-xs transition-all ${
                filter === f.id ? "bg-accent/15 text-accent font-medium" : "hover:bg-white/5"
              }`}
              style={{ color: filter === f.id ? undefined : "var(--text-muted)" }}
            >
              <span>{f.label}</span>
              {f.count > 0 && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/10">{f.count}</span>
              )}
            </button>
          ))}
        </div>

        <div className="mt-auto p-3 border-t" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-500 to-rose-600 flex items-center justify-center text-[8px] font-bold text-white">
              YJ
            </div>
            <div className="text-[10px] truncate" style={{ color: "var(--text-secondary)" }}>
              Youssef Jarray
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Search bar */}
        <div
          className="flex items-center px-3 py-1.5 border-b"
          style={{ borderColor: "var(--border)" }}
        >
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages..."
            className="flex-1 bg-transparent outline-none text-xs px-2 py-1 rounded"
            style={{ color: "var(--text-primary)" }}
          />
        </div>

        {sent && (
          <div className="mx-3 mt-2 px-3 py-1.5 rounded-lg text-[10px] flex items-center gap-2 bg-green-500/10 text-green-400">
            <FiSend size={10} />
            Message sent successfully!
          </div>
        )}

        {selectedMsg ? (
          /* Message detail view */
          <div className="flex-1 overflow-auto p-4">
            <button
              onClick={() => setSelectedMsg(null)}
              className="text-[10px] mb-3 hover:underline"
              style={{ color: "var(--text-muted)" }}
            >
              ← Back to inbox
            </button>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-rose-600 flex items-center justify-center text-xs font-bold text-white">
                {selectedMsg.from.charAt(0)}
              </div>
              <div>
                <div className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{selectedMsg.from}</div>
                <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>{selectedMsg.email}</div>
              </div>
            </div>
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{selectedMsg.subject}</div>
              <div className="text-[9px]" style={{ color: "var(--text-muted)" }}>
                {new Date(selectedMsg.date).toLocaleString()}
              </div>
            </div>
            <div className="text-xs leading-relaxed whitespace-pre-wrap" style={{ color: "var(--text-secondary)" }}>
              {selectedMsg.body}
            </div>
          </div>
        ) : showCompose ? (
          /* Compose form */
          <div ref={composeRef} className="flex-1 overflow-auto p-4">
            <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>New Message</h2>
            <form onSubmit={handleSend} className="space-y-3">
              <div>
                <label className="text-[10px] font-medium mb-1 block" style={{ color: "var(--text-muted)" }}>From</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Your name"
                  required
                  className="w-full px-3 py-2 rounded-lg text-xs outline-none border"
                  style={{ background: "var(--bg-elevated)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                />
              </div>
              <div>
                <label className="text-[10px] font-medium mb-1 block" style={{ color: "var(--text-muted)" }}>Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="your@email.com"
                  required
                  className="w-full px-3 py-2 rounded-lg text-xs outline-none border"
                  style={{ background: "var(--bg-elevated)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                />
              </div>
              <div>
                <label className="text-[10px] font-medium mb-1 block" style={{ color: "var(--text-muted)" }}>Subject</label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                  placeholder="What's this about?"
                  className="w-full px-3 py-2 rounded-lg text-xs outline-none border"
                  style={{ background: "var(--bg-elevated)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                />
              </div>
              <div>
                <label className="text-[10px] font-medium mb-1 block" style={{ color: "var(--text-muted)" }}>Message</label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  placeholder="Write your message..."
                  required
                  rows={8}
                  className="w-full px-3 py-2 rounded-lg text-xs outline-none border resize-none"
                  style={{ background: "var(--bg-elevated)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={sending}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all hover:brightness-110 disabled:opacity-50"
                  style={{ background: "var(--accent)", color: "#fff" }}
                >
                  <FiSend size={11} />
                  {sending ? "Sending..." : "Send Message"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCompose(false)}
                  className="px-3 py-2 rounded-lg text-xs hover:bg-white/10 transition-all"
                  style={{ color: "var(--text-muted)" }}
                >
                  Discard
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Message list */
          <div className="flex-1 overflow-auto">
            {filteredMessages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-xs" style={{ color: "var(--text-muted)" }}>
                No messages
              </div>
            ) : (
              filteredMessages.map((msg) => (
                <button
                  key={msg.id}
                  onClick={() => markRead(msg.id)}
                  className="w-full text-left px-3 py-2.5 border-b flex items-center gap-3 hover:bg-white/5 transition-all min-w-0"
                  style={{ borderColor: "var(--border)" }}
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-500 to-rose-600 flex items-center justify-center text-[8px] font-bold text-white shrink-0">
                    {msg.from.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="text-xs truncate"
                        style={{
                          color: "var(--text-primary)",
                          fontWeight: msg.read ? 400 : 600,
                        }}
                      >
                        {msg.from}
                      </span>
                      <span className="text-[9px] shrink-0" style={{ color: "var(--text-muted)" }}>
                        {new Date(msg.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[10px] truncate"
                        style={{
                          color: msg.read ? "var(--text-muted)" : "var(--text-secondary)",
                          fontWeight: msg.read ? 400 : 500,
                        }}
                      >
                        {msg.subject}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleStar(msg.id); }}
                    className="shrink-0 p-1 rounded hover:bg-white/10"
                  >
                    <FiStar
                      size={11}
                      className={msg.starred ? "text-amber-400 fill-amber-400" : ""}
                      style={{ color: msg.starred ? undefined : "var(--text-muted)" }}
                    />
                  </button>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
