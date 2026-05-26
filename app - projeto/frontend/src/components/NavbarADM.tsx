import { useState } from "react"
import { Plus, Search, Menu, X, LogOut } from "lucide-react"
import { useNavigate } from "react-router-dom"

interface NavbarADMINProps {
  tituloAtual?: string
}

export default function NavbarADMIN({ tituloAtual = "Dashboard" }: NavbarADMINProps) {
  // Estado para controlar se o menu mobile está aberto ou fechado
  const [menuAberto, setMenuAberto] = useState(false)
  const navigate = useNavigate();
  
    const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("usuario");
    navigate("/");
  };
    return (
        <header className="w-full flex flex-col font-sans shadow-md">
        {/* --- PARTE SUPERIOR: Logos e Botão Menu --- */}
          <button 
            onClick={() => setMenuAberto(!menuAberto)}
            className="lg:hidden p-1.5 text-black bg-gray-100 rounded-md hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/50"
            aria-label="Abrir menu"
          >
            {menuAberto ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>


      {/* --- PARTE INFERIOR: Informações de Contato e Botão --- */}
      {/* A classe verifica o estado: se menuAberto for true ou a tela for grande (lg:flex), ele mostra. Senão, esconde. */}
      <div className={`bg-white w-full flex-col lg:flex-row items-center justify-center lg:justify-between px-4 py-4 gap-4 text-[14px] md:text-[15px] text-black ${menuAberto ? 'flex' : 'hidden lg:flex'}`}>
        <h1 className="ml-10 text-xl md:text-2xl font-black uppercase tracking-tight text-zinc-900">
            {tituloAtual}
          </h1>
        {/* Container da Busca */}
        <div className="flex flex-1 items-center justify-center lg:justify-end w-full lg:pr-4">
          <div className="relative w-full max-w-md">
            {/* Ícone de lupa posicionado de forma absoluta dentro do input */}
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-zinc-400" />
            </div>
            
            {/* O Input de pesquisa */}
            <input 
              type="text" 
              placeholder="Pesquisar..." 
              className="w-full bg-zinc-100 text-black rounded-full py-2.5 pl-10 pr-4 outline-none border border-transparent focus:border-red-600 focus:bg-white focus:ring-1 focus:ring-red-600 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Botão Acesso Secretaria / Adicionar Novo */}
        <div className="flex-shrink-0 w-full lg:w-auto">
          <button 
            type="button"
            onClick={handleLogout}
            className="w-full lg:w-auto bg-[#ff0000] hover:bg-red-700 text-white font-bold py-2.5 px-8 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/50 flex items-center justify-center"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Sair
          </button>
        </div>
      </div>
      <div className="w-full h-1.5 bg-[#000000]"></div>
    </header>
  )
}