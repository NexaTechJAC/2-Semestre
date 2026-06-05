import { useState } from "react";
import SidebarADM from "../components/SidebarADM";
import NavbarADMIN from "../components/NavbarADM";
import PergResp from "../components/PergResp";
import LogsNavegacao from "../components/LogsNavegacao";
import MembrosSecretaria from "../components/MembrosSecretaria";

export default function Admin() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState("cursos");
  const isMembrosPage = activeMenu === "membros";
  const mostrarPesquisaNavbar = activeMenu !== "cursos" && activeMenu !== "logs";

  return (
    <main className="flex min-h-screen bg-gray-50">
      <SidebarADM
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
      />

      <div
        className={`flex min-h-screen w-full flex-col transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "md:ml-64" : "ml-0"
        }`}
      >
        {!isMembrosPage && (
          <NavbarADMIN tituloAtual={activeMenu} mostrarPesquisa={mostrarPesquisaNavbar} />
        )}

        <div className={`${isMembrosPage ? "p-0" : "p-6"} flex-1`}>
          <div className={isMembrosPage ? "" : "rounded-lg bg-white p-6 shadow"}>
            {activeMenu === "cursos" && <PergResp />}
            {activeMenu === "membros" && <MembrosSecretaria />}
            {activeMenu === "dashboard" && <p>Aqui vao os graficos...</p>}
            {activeMenu === "configuracoes" && <p>Aqui vai a tela de opcoes...</p>}
            {activeMenu === "logs" && <LogsNavegacao />}
          </div>
        </div>
      </div>
    </main>
  );
}
