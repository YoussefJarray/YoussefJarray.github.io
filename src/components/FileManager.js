"use client";
import { useState, useMemo, useCallback } from "react";
import { fileSystem } from "../data/fileSystem";
import { useWindowStore } from "../store/windowStore";
import { FiFolder, FiChevronRight, FiChevronDown, FiHome, FiGrid, FiList } from "react-icons/fi";

function itemIcon(item) {
  if (item.type === "folder") return "\uD83D\uDCC1";
  if (item.icon === "pdf") return "\uD83D\uDCD5";
  if (item.icon === "readme") return "\uD83D\uDCDD";
  if (item.icon === "post") return "\uD83D\uDCDD";
  if (item.icon === "url") return "\uD83D\uDD17";
  return "\uD83D\uDCC4";
}

function findNode(tree, path) {
  if (!path || path.length === 0) return tree;
  let current = tree;
  for (const segment of path) {
    if (!current.children) return null;
    const next = current.children.find((c) => c.name === segment && c.type === "folder");
    if (!next) return null;
    current = next;
  }
  return current;
}

function Breadcrumb({ path, onNavigate, onRoot }) {
  return (
    <div className="flex items-center gap-1 px-4 py-2 border-b border-subtle shrink-0 text-xs overflow-x-auto hide-scrollbar">
      <button
        onClick={onRoot}
        className={`flex items-center gap-1 px-2 py-1 rounded-md transition-all duration-150 btn-hover ${
          path.length === 0 ? "text-accent font-medium" : "text-muted hover:text-secondary"
        }`}
      >
        <FiHome size={12} />
        <span>Home</span>
      </button>
      {path.map((seg, i) => (
        <span key={i} className="flex items-center gap-1">
          <span className="text-muted-2 select-none">/</span>
          <button
            onClick={() => onNavigate(path.slice(0, i + 1))}
            className={`px-2 py-1 rounded-md transition-all duration-150 btn-hover ${
              i === path.length - 1 ? "text-accent font-medium" : "text-muted hover:text-secondary"
            }`}
          >
            {seg}
          </button>
        </span>
      ))}
    </div>
  );
}

function FolderGrid({ items, selected, onSelect, onOpen, isMobile }) {
  return (
    <div className="p-4">
      <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
        {items.map((item, i) => {
          const isFolder = item.type === "folder";
          const isSelected = selected === i;
          return (
            <button
              key={i}
              onClick={() => {
                if (isMobile) {
                  onOpen(item);
                } else if (isSelected) {
                  onOpen(item);
                } else {
                  onSelect(i);
                }
              }}
              onDoubleClick={() => onOpen(item)}
              className={`flex flex-col items-center p-3 rounded-xl transition-all duration-150 group min-h-[84px] ${
                isSelected ? "bg-white/10 border border-white/15" : "border border-transparent hover:bg-white/5"
              }`}
            >
              {!isFolder && item.meta?.thumbnail ? (
                <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0" style={{ border: "1px solid var(--border)" }}>
                  <img src={item.meta.thumbnail} alt="" className="w-full h-full object-cover" loading="lazy" />
                </div>
              ) : (
                <span className={`text-3xl transition-transform duration-150 ${isSelected ? "scale-110" : "group-hover:scale-110"}`}>
                  {itemIcon(item)}
                </span>
              )}
              <div className="flex-1" />
              <span className={`text-[10px] text-center leading-tight truncate w-full ${isSelected ? "text-white font-medium" : "text-zinc-400"}`}>
                {item.name}
              </span>
              {isFolder && (
                <span className="text-[8px] text-muted">{item.children?.length || 0} items</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FolderList({ items, selected, onSelect, onOpen, isMobile }) {
  return (
    <div className="p-2">
      <div className="flex items-center gap-2 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-wider border-b" style={{ color: "var(--text-muted)", borderColor: "var(--border)" }}>
        <span className="w-6 shrink-0" />
        <span className="flex-1">Name</span>
        <span className="w-16 text-right">Type</span>
        <span className="w-12 text-right">Items</span>
      </div>
      {items.map((item, i) => {
        const isFolder = item.type === "folder";
        const isSelected = selected === i;
        return (
          <button
            key={i}
            onClick={() => {
              if (isMobile) {
                onOpen(item);
              } else if (isSelected) {
                onOpen(item);
              } else {
                onSelect(i);
              }
            }}
            onDoubleClick={() => onOpen(item)}
            className={`flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg transition-all duration-150 ${
              isSelected ? "bg-white/10" : "hover:bg-white/5"
            }`}
          >
            <span className="text-lg w-6 text-center shrink-0">{itemIcon(item)}</span>
            <span className={`flex-1 text-[11px] truncate ${isSelected ? "text-white font-medium" : "text-zinc-400"}`}>
              {item.name}
            </span>
            <span className="w-16 text-right text-[10px]" style={{ color: "var(--text-muted)" }}>
              {isFolder ? "Folder" : "File"}
            </span>
            <span className="w-12 text-right text-[10px]" style={{ color: "var(--text-muted)" }}>
              {isFolder ? item.children?.length || 0 : "—"}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default function FileManager({ isMobile }) {
  const { openWindow } = useWindowStore();
  const [path, setPath] = useState(["Projects"]);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [viewMode, setViewMode] = useState(isMobile ? "list" : "grid");

  const currentFolder = useMemo(() => findNode(fileSystem, path), [path]);
  const items = currentFolder?.children || [];
  const selectedItem = selectedIdx !== null ? items[selectedIdx] : null;

  const navigateTo = useCallback((newPath) => {
    setPath(newPath);
    setSelectedIdx(null);
  }, []);

  const openFolder = useCallback((item) => {
    if (item.type === "folder") {
      setPath((prev) => [...prev, item.name]);
      setSelectedIdx(null);
    }
  }, []);

  const openFile = useCallback((item) => {
    if (item.type === "file") {
      if (item.icon === "url" && item.meta?.url) {
        window.open(item.meta.url, "_blank", "noopener,noreferrer");
        return;
      }
      if (item.icon === "pdf") {
        openWindow("resume", item);
        return;
      }
      openWindow("markdown", item);
    }
  }, [openWindow]);

  const goRoot = useCallback(() => {
    setPath([]);
    setSelectedIdx(null);
  }, []);

  const sidebarSelect = useCallback((item) => {
    if (item.type === "file") {
      const idx = items.findIndex((c) => c.name === item.name);
      if (idx !== -1) {
        setSelectedIdx(idx);
      } else if (item.parent) {
        navigateTo([item.parent]);
        setSelectedIdx(null);
      }
    } else if (item.type === "folder") {
      if (item.parent === "root") {
        navigateTo([item.name]);
      } else if (path.length > 0) {
        const parentPath = [...path.slice(0, -1), item.name];
        navigateTo(parentPath);
      } else {
        navigateTo([item.name]);
      }
    }
  }, [items, path, navigateTo]);

  return (
    <div className="flex h-full bg-surface">
      <div className="w-52 border-r border-subtle overflow-auto shrink-0 hidden md:block" style={{ background: "var(--bg-surface)" }}>
        <div className="px-3 py-2.5 text-[10px] text-muted uppercase tracking-wider font-medium border-b border-subtle shrink-0">
          Files
        </div>
        <div className="p-1.5">
          <button
            onClick={goRoot}
            className={`flex items-center gap-1 w-full text-left px-3 py-1.5 rounded-md transition-all duration-150 text-xs btn-hover ${
              path.length === 0
                ? "bg-surface-hover text-primary"
                : "text-secondary hover:bg-surface-hover"
            }`}
          >
            <FiHome size={12} className="shrink-0" />
            <span className="font-medium truncate">Home</span>
          </button>
          <div className="mt-1">
            <SidebarTree
              items={fileSystem.children?.filter((c) => c.type === "folder").map((c) => ({ ...c, parent: "root" }))}
              currentPath={path}
              onSelect={sidebarSelect}
              selectedFile={selectedItem?.name || null}
              depth={0}
            />
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center shrink-0 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="flex-1 min-w-0">
            <Breadcrumb path={path} onNavigate={navigateTo} onRoot={goRoot} />
          </div>
          <div className="flex items-center gap-1 pr-3">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-all ${viewMode === "grid" ? "bg-white/15 text-white" : "text-muted hover:text-secondary hover:bg-white/5"}`}
              title="Grid view"
            >
              <FiGrid size={13} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-md transition-all ${viewMode === "list" ? "bg-white/15 text-white" : "text-muted hover:text-secondary hover:bg-white/5"}`}
              title="List view"
            >
              <FiList size={13} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted gap-2 text-xs">
              <FiFolder size={32} />
              <p>Empty folder</p>
            </div>
          ) : viewMode === "list" ? (
            <FolderList
              items={items}
              selected={selectedIdx}
              onSelect={setSelectedIdx}
              onOpen={(item) => item.type === "folder" ? openFolder(item) : openFile(item)}
              isMobile={isMobile}
            />
          ) : (
            <FolderGrid
              items={items}
              selected={selectedIdx}
              onSelect={setSelectedIdx}
              onOpen={(item) => item.type === "folder" ? openFolder(item) : openFile(item)}
              isMobile={isMobile}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function SidebarTree({ items, currentPath, onSelect, selectedFile, depth }) {
  return items?.map((item, i) => (
    <SidebarTreeItem key={i} item={item} currentPath={currentPath} onSelect={onSelect} selectedFile={selectedFile} depth={depth} />
  ));
}

function SidebarTreeItem({ item, currentPath, onSelect, selectedFile, depth }) {
  const isInPath = currentPath.includes(item.name);
  const [open, setOpen] = useState(depth === 0 || isInPath);

  const handleClick = () => {
    setOpen(true);
    onSelect(item);
  };

  return (
    <div>
      <button
        onClick={handleClick}
        className={`flex items-center gap-1 w-full text-left px-3 py-1.5 rounded-md transition-all duration-150 text-xs btn-hover ${
          currentPath.length > 0 && currentPath[currentPath.length - 1] === item.name
            ? "bg-surface-hover text-primary"
            : "text-secondary hover:bg-surface-hover"
        }`}
        style={{ paddingLeft: 12 + depth * 14 }}
      >
        {open ? <FiChevronDown size={10} className="text-muted shrink-0" /> : <FiChevronRight size={10} className="text-muted shrink-0" />}
        <FiFolder size={12} className="shrink-0 text-orange-400" />
        <span className="font-medium truncate">{item.name}</span>
      </button>
      {open && item.children && (
        <SidebarTree items={item.children.filter((c) => c.type === "folder").map((c) => ({ ...c, parent: item.name }))} currentPath={currentPath} onSelect={onSelect} selectedFile={selectedFile} depth={depth + 1} />
      )}
    </div>
  );
}
