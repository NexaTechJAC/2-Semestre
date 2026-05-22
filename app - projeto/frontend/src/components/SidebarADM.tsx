import { useState } from 'react';
import { Menu, X, BookOpen, Users, Layout, Settings } from "lucide-react";

export default function SidebarADM() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      {/* BOTÃO HAMBÚRGUER DINÂMICO */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          fixed top-5 z-50 rounded-lg p-2 transition-all duration-300 shadow-md
          ${isOpen 
            ? 'left-[230px] bg-black text-white' // Posição quando aberto (quase no limite da sidebar)
            : 'left-4 bg-red-600 text-white hover:bg-red-700' // Posição quando fechado
          }
        `}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* SIDEBAR */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-screen w-64 flex-col bg-black text-white transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* LOGO AREA */}
        <div className="flex items-center gap-3 px-6 py-10">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-600 shadow-lg shadow-red-900/20">
             {/* Ícone de formatura do Lucide */}
            <BookOpen size={24} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="text-[15px] font-bold leading-tight tracking-tight">Portal Acadêmico</span>
            <span className="text-[11px] font-black tracking-[0.2em] text-red-600">ADMIN</span>
          </div>
        </div>

        {/* LINHA DIVISÓRIA */}
        <div className="px-6">
          <hr className="border-zinc-800" />
        </div>

        {/* MENU PRINCIPAL */}
        <nav className="flex-1 space-y-1 px-4 py-6">
          <div className="group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-all hover:bg-red-600">
            <Layout size={18} className="text-zinc-500 group-hover:text-white" />
            Cursos
          </div>
          <div className="group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-all hover:bg-red-600">
            <Users size={18} className="text-zinc-500 group-hover:text-white" />
            Membros
          </div>
        </nav>

        {/* LINHA DIVISÓRIA INFERIOR */}
        <div className="px-6">
          <hr className="border-zinc-800" />
        </div>

        {/* MENU SECUNDÁRIO */}
        <nav className="flex-1 space-y-1 px-4 py-6">
          <div className="group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-all hover:bg-red-600">
            <Layout size={18} className="text-zinc-500 group-hover:text-white" />
            Ver Portais
          </div>
          <div className="group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-all hover:bg-red-600">
            <Settings size={18} className="text-zinc-500 group-hover:text-white" />
            Configurações
          </div>
        </nav>
      </aside>

      {/* OVERLAY: Opcional - escurece a tela se o menu estiver aberto (bom para mobile) */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-[2px] md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}