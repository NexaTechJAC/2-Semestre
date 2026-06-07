import { useState, useEffect } from "react";
import SidebarADM from "../components/SidebarADM";
import SidebarSecretaria from "../components/SidebarSecretaria";
import NavbarADMIN from "../components/NavbarADM";
import PergResp from "../components/PergResp";
import LogsNavegacao from "../components/LogsNavegacao";
import MembrosSecretaria from "../components/MembrosSecretaria";
import Perguntas from "../components/Perguntas";
import Dashboard from "../components/Dashboard";

type Perfil = "administrador" | "secretaria";

export default function Admin() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState("");
  const [perfil, setPerfil] = useState<Perfil>("secretaria");

  useEffect(() => {
    const perfilSalvo = localStorage.getItem("userRole") as Perfil | null;
    const perfilFinal: Perfil =
      perfilSalvo === "administrador" || perfilSalvo === "secretaria"
        ? perfilSalvo
        : "secretaria";

    setPerfil(perfilFinal);
    setActiveMenu(perfilFinal === "administrador" ? "cursos" : "perguntas");
  }, []);

  const isMembrosPage = activeMenu === "membros";
  const mostrarPesquisaNavbar = activeMenu !== "cursos" && activeMenu !== "logs";

  function renderConteudo() {
    if (activeMenu === "perguntas") return <Perguntas />;
    if (activeMenu === "dashboard") return <Dashboard />;

    if (perfil === "administrador") {
      if (activeMenu === "cursos") return <PergResp />;
      if (activeMenu === "membros") return <MembrosSecretaria />;
      if (activeMenu === "logs") return <LogsNavegacao />;
      if (activeMenu === "configuracoes") return <Configuracoes />;
    }

    return (
      <div className="flex items-center justify-center h-48 text-zinc-400">
        Selecione uma opção no menu.
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 flex">

      {perfil === "administrador" ? (
        <SidebarADM
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
        />
      ) : (
        <SidebarSecretaria
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
        />
      )}

      <div className={`transition-all duration-300 ease-in-out flex flex-col min-h-screen w-full ${isSidebarOpen ? "md:ml-64" : "ml-0"}`}>
        {!isMembrosPage && (
          <NavbarADMIN tituloAtual={activeMenu} mostrarPesquisa={mostrarPesquisaNavbar} />
        )}

        <div className={`${isMembrosPage ? "p-0" : "p-6"} flex-1`}>
          <div className={isMembrosPage ? "" : "rounded-lg bg-white p-6 shadow"}>
            {renderConteudo()}
          </div>
        </div>
      </div>
    </main>
  );
}

function Configuracoes() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-black text-zinc-900 uppercase">
        Configurações
      </h2>
      <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-6 py-10 text-center text-zinc-400">
        <p className="text-[15px] font-medium">Disponível na próxima sprint.</p>
      </div>
    </div>
  );
}