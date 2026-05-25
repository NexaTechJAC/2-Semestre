import { useState } from "react";
import SidebarADM from "../components/SidebarADM";
import NavbarADMIN from "../components/NavbarADM";
import PergResp from "../components/PergResp";
import LogsNavegacao from "../components/LogsNavegacao";

export default function Admin() {
  // Estado da Sidebar (aberta/fechada)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // ESTADO DO MENU ATIVO AGORA VIVE AQUI!
  const [activeMenu, setActiveMenu] = useState('cursos');

  return (
    <main className="min-h-screen bg-gray-50 flex">
      
      {/* 1. Passamos o estado e a função para a Sidebar */}
      <SidebarADM 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
      />

      <div className={`transition-all duration-300 ease-in-out flex flex-col min-h-screen w-full ${isSidebarOpen ? 'md:ml-64' : 'ml-0'}`}>
        
        {/* 2. Se quiser, você pode até passar o activeMenu para a Navbar 
            para ela exibir "Cursos", "Membros", etc., de forma dinâmica! */}
        <NavbarADMIN tituloAtual={activeMenu} />

        <div className="p-6 flex-1">
            
            {/* 3. A MÁGICA FINAL: Renderizar conteúdos diferentes baseado no clique! */}
            <div className="rounded-lg bg-white p-6 shadow">

              {/* Lógica simples para trocar o conteúdo */}
              {activeMenu === 'cursos' &&
              <PergResp />
              }
              {activeMenu === 'membros' && <p>Aqui vai a lista de Alunos/Professores...</p>}
              {activeMenu === 'dashboard' && <p>Aqui vão os gráficos...</p>}
              {activeMenu === 'configuracoes' && <p>Aqui vai a tela de opções...</p>}
              {activeMenu === 'logs' && <LogsNavegacao />}
            </div>

          </div>
        </div>
    </main>
  );
}