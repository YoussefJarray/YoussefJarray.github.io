"use client";
import { useState, useRef, useCallback } from "react";
import { FaGithub, FaLinkedin, FaTwitter, FaYoutube, FaEnvelope } from "react-icons/fa";
import { FiArrowLeft, FiArrowRight, FiRefreshCw, FiLock, FiPlus, FiX, FiExternalLink } from "react-icons/fi";
import { socials } from "../data/projects";

let tabIdCounter = 0;

const iconMap = {
  FaGithub: { icon: FaGithub, color: "text-white" },
  FaLinkedin: { icon: FaLinkedin, color: "text-blue-500" },
  FaTwitter: { icon: FaTwitter, color: "text-sky-400" },
  FaYoutube: { icon: FaYoutube, color: "text-red-500" },
  FaEnvelope: { icon: FaEnvelope, color: "text-amber-400" },
};

function NewTabPage({ onOpenExternal }) {
  return (
    <div className="flex items-center justify-center h-full p-8">
      <div className="max-w-sm w-full text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center text-2xl mx-auto mb-4 shadow-lg">
          🌐
        </div>
        <h2 className="text-lg font-semibold text-primary mb-1">New Tab</h2>
        <p className="text-xs text-muted mb-8">Quick links</p>
        <div className="space-y-2">
          {socials.map(({ icon, href, label }) => {
            const match = iconMap[icon];
            const Icon = match?.icon;
            return (
              <div key={label} className="flex items-center gap-1">
                <button
                  onClick={() => onOpenExternal(href)}
                  className="flex items-center justify-between flex-1 px-5 py-3 rounded-xl bg-surface hover:bg-surface-hover transition-all border border-subtle group text-left"
                >
                  <div className="flex items-center gap-3">
                    {Icon && <Icon className={`text-lg ${match?.color || "text-muted"}`} />}
                    <span className="text-sm text-secondary">{label}</span>
                  </div>
                  <span className="text-[10px] text-muted group-hover:text-secondary transition-colors truncate max-w-[120px]">{href.replace("https://", "")}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function createTab() {
  const tab = {
    id: ++tabIdCounter,
    title: "New Tab",
    url: "",
    currentUrl: null,
    history: [],
    historyIdx: -1,
  };
  return tab;
}

export default function BrowserApp() {
  const [tabs, setTabs] = useState([createTab()]);
  const [activeTabId, setActiveTabId] = useState(1);
  const iframeRefs = useRef({});

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];
  const iframeKey = useRef(0);

  const updateTab = useCallback((tabId, updates) => {
    setTabs((prev) => prev.map((t) => (t.id === tabId ? { ...t, ...updates } : t)));
  }, []);

  const navigate = useCallback((target) => {
    let finalUrl = target;
    if (!target.startsWith("http://") && !target.startsWith("https://")) {
      finalUrl = `https://${target}`;
    }
    iframeKey.current += 1;
    updateTab(activeTabId, {
      url: finalUrl,
      currentUrl: finalUrl,
      title: finalUrl,
      history: [...activeTab.history.slice(0, activeTab.historyIdx + 1), finalUrl],
      historyIdx: activeTab.historyIdx + 1,
    });
  }, [activeTabId, activeTab, updateTab]);

  const openExternal = useCallback((href) => {
    window.open(href, "_blank", "noopener,noreferrer");
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!activeTab.url.trim()) return;
    navigate(activeTab.url);
  };

  const goBack = () => {
    if (activeTab.historyIdx <= 0) return;
    const idx = activeTab.historyIdx - 1;
    const url = activeTab.history[idx];
    iframeKey.current += 1;
    updateTab(activeTabId, { historyIdx: idx, url, currentUrl: url });
  };

  const goForward = () => {
    if (activeTab.historyIdx >= activeTab.history.length - 1) return;
    const idx = activeTab.historyIdx + 1;
    const url = activeTab.history[idx];
    iframeKey.current += 1;
    updateTab(activeTabId, { historyIdx: idx, url, currentUrl: url });
  };

  const refresh = () => {
    iframeKey.current += 1;
    updateTab(activeTabId, { currentUrl: activeTab.currentUrl });
  };

  const newTab = () => {
    const tab = createTab();
    setTabs((prev) => [...prev, tab]);
    setActiveTabId(tab.id);
  };

  const closeTab = (tabId) => {
    setTabs((prev) => {
      const next = prev.filter((t) => t.id !== tabId);
      if (next.length === 0) {
        const tab = createTab();
        next.push(tab);
      }
      return next;
    });
    setActiveTabId((prev) => {
      if (prev === tabId) {
        const idx = tabs.findIndex((t) => t.id === tabId);
        const remaining = tabs.filter((t) => t.id !== tabId);
        return remaining[Math.min(idx, remaining.length - 1)]?.id || remaining[0]?.id;
      }
      return prev;
    });
  };

  return (
    <div className="h-full flex flex-col" style={{ background: "var(--bg-root)" }}>
      <div className="flex items-end shrink-0 bg-surface border-b border-subtle overflow-x-auto hide-scrollbar">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            onClick={() => setActiveTabId(tab.id)}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs cursor-pointer border-r border-subtle shrink-0 max-w-[160px] group transition-all duration-150 ${
              tab.id === activeTabId ? "bg-surface-hover" : "hover:bg-white/5"
            }`}
          >
            <span className="truncate text-secondary">{tab.title === tab.url ? tab.title.replace("https://", "") : tab.title}</span>
            <button
              onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }}
              className="p-0.5 rounded hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity text-muted hover:text-secondary"
            >
              <FiX size={10} />
            </button>
          </div>
        ))}
        <button
          onClick={newTab}
          className="p-2 hover:bg-white/10 text-muted hover:text-secondary transition-colors shrink-0"
        >
          <FiPlus size={14} />
        </button>
      </div>

      <div className="flex items-center gap-2 px-3 py-2 border-b border-subtle shrink-0 bg-surface">
        <button onClick={goBack} disabled={activeTab.historyIdx <= 0} className="p-1 rounded-md hover:bg-white/10 text-muted disabled:opacity-30 transition-all duration-150 btn-hover">
          <FiArrowLeft size={14} />
        </button>
        <button onClick={goForward} disabled={activeTab.historyIdx >= activeTab.history.length - 1} className="p-1 rounded-md hover:bg-white/10 text-muted disabled:opacity-30 transition-all duration-150 btn-hover">
          <FiArrowRight size={14} />
        </button>
        <button onClick={refresh} className="p-1 rounded-md hover:bg-white/10 text-muted transition-all duration-150 btn-hover">
          <FiRefreshCw size={14} />
        </button>
        <form onSubmit={handleSubmit} className="flex-1 mx-1">
          <div className="flex items-center gap-2 bg-black/30 rounded-full px-3.5 py-1.5 border border-subtle">
            <FiLock size={10} className="text-green-500/60 shrink-0" />
            <input
              type="text"
              value={activeTab.url}
              onChange={(e) => updateTab(activeTabId, { url: e.target.value })}
              placeholder="Search or enter URL..."
              className="flex-1 bg-transparent outline-none text-xs text-secondary placeholder-muted"
            />
          </div>
        </form>
      </div>

      <div className="flex-1 relative">
        {activeTab.currentUrl ? (
          <div className="absolute inset-0 flex flex-col">
            <iframe
              key={iframeKey.current}
              ref={(el) => { if (el) iframeRefs.current[activeTabId] = el; }}
              src={activeTab.currentUrl}
              className="flex-1 w-full border-0"
              title="Browser"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              onError={() => updateTab(activeTabId, { title: "Blocked" })}
            />
            <div className="px-3 py-2 text-[10px] text-muted border-t border-subtle bg-surface flex items-center gap-2">
              <FiExternalLink size={10} />
              <span className="truncate">{activeTab.currentUrl}</span>
              <button
                onClick={() => openExternal(activeTab.currentUrl)}
                className="ml-auto text-accent hover:underline"
              >
                Open in system browser
              </button>
            </div>
          </div>
        ) : (
          <NewTabPage onOpenExternal={openExternal} />
        )}
      </div>
    </div>
  );
}
