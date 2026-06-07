import { useState, useRef, useEffect } from "react";
import { Menu, X, BookOpen, BarChart2, MessageSquare } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  activeMenu: string;
  setActiveMenu: (v: string) => void;
}

export default function SidebarSecretaria({
  isOpen,
  setIsOpen,
  activeMenu,
  setActiveMenu,
}: SidebarProps) {
  const [indicatorStyle, setIndicatorStyle] = useState({ top: 0, height: 0, opacity: 0 });
  const navRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const activeEl = itemRefs.current[activeMenu];
    const containerEl = navRef.current;

    if (activeEl && containerEl) {
      const containerRect = containerEl.getBoundingClientRect();
      const activeRect = activeEl.getBoundingClientRect();
      setIndicatorStyle({
        top: activeRect.top - containerRect.top,
        height: activeRect.height,
        opacity: 1,
      });
    }
  }, [activeMenu]);

  const renderMenuItem = (id: string, label: string, Icon: LucideIcon) => {
    const isActive = activeMenu === id;
    return (
      <div
        ref={(el) => { itemRefs.current[id] = el; }}
        onClick={() => setActiveMenu(id)}
        className={`
          relative z-10 group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold
          transition-colors duration-300
          ${isActive
            ? "text-white"
            : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
          }
        `}
      >
        <Icon
          size={18}
          className={`transition-colors duration-300 ${isActive ? "text-white" : "text-zinc-500 group-hover:text-white"}`}
        />
        {label}
      </div>
    );
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed top-5 z-50 rounded-lg p-2 transition-all duration-300 shadow-md ${
          isOpen ? "left-[230px] bg-black text-white" : "left-4 bg-red-600 text-white hover:bg-red-700"
        }`}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 flex-col bg-black text-white transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-3 px-6 py-10">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-600 shadow-lg shadow-red-900/20">
            <BookOpen size={24} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="text-[15px] font-bold leading-tight tracking-tight">Portal Acadêmico</span>
            <span className="text-[11px] font-black tracking-[0.2em] text-red-600">SECRETARIA</span>
          </div>
        </div>

        <div className="relative flex-1 flex flex-col" ref={navRef}>
          <div
            className="absolute left-4 right-4 rounded-xl bg-red-600 transition-all duration-500 z-0"
            style={{
              top: `${indicatorStyle.top}px`,
              height: `${indicatorStyle.height}px`,
              opacity: indicatorStyle.opacity,
            }}
          />

          <div className="px-6 relative z-10"><hr className="border-zinc-800" /></div>

          <nav className="space-y-2 px-4 py-6 relative z-10">
            {renderMenuItem("perguntas", "Perguntas", MessageSquare)}
            {renderMenuItem("dashboard", "Dashboard", BarChart2)}
          </nav>
        </div>
      </aside>

      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-[2px] md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}