import { useState } from "react"
import { Phone, Mail, Clock, MapPin, Menu, X } from "lucide-react"

import logoSP from "../assets/img/Governo-de-São-Paulo.jpg"
import logoFatec from "../assets/img/FatecJac.png"

export default function Cabecalho() {
  // Estado para controlar se o menu mobile está aberto ou fechado
  const [menuAberto, setMenuAberto] = useState(false)

  return (
    <header className="w-full flex flex-col font-sans shadow-md">
      
      {/* --- PARTE SUPERIOR: Logos e Botão Menu --- */}
      <div className="flex items-center justify-between bg-white w-full h-16 md:h-24">
        
        {/* Logo SP com fundo preto e borda direita arredondada */}
        <div className="h-full bg-black flex items-center pl-4 pr-6 md:pr-16 rounded-r-[3rem] md:rounded-r-[4rem] min-w-[120px]">
          <img
            src={logoSP}
            alt="Governo do Estado de São Paulo"
            className="h-20 md:h-32 object-contain mix-blend-screen"
          />
        </div>

        {/* Logo Fatec e Botão Hambúrguer */}
        <div className="flex items-center pr-4 md:pr-8 h-full gap-3 md:gap-6">
          <img
            src={logoFatec}
            alt="Fatec Jacareí - Centro Paula Souza"
            className="h-8 md:h-16 object-contain"
          />
          
          {/* Botão Mobile (Visível apenas em telas menores que 'lg') */}
          <button 
            onClick={() => setMenuAberto(!menuAberto)}
            className="lg:hidden p-1.5 text-black bg-gray-100 rounded-md hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/50"
            aria-label="Abrir menu de contatos"
          >
            {menuAberto ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* --- LINHA VERMELHA SEPARADORA --- */}
      <div className="w-full h-1.5 bg-[#ff0000]"></div>

      {/* --- PARTE INFERIOR: Informações de Contato e Botão --- */}
      {/* A classe verifica o estado: se menuAberto for true ou a tela for grande (lg:flex), ele mostra. Senão, esconde. */}
      <div className={`bg-black w-full flex-col lg:flex-row items-center justify-center lg:justify-between px-4 py-4 gap-4 text-[14px] md:text-[15px] text-white ${menuAberto ? 'flex' : 'hidden lg:flex'}`}>
        
        {/* Container dos contatos */}
        <div className="flex flex-col lg:flex-row flex-wrap items-center justify-center gap-x-6 gap-y-3 flex-1 lg:justify-start lg:pl-4">
          <div className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-white" />
            <span>(12) 3900-0505</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-white" />
            <span>secretaria@edu.br</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-white" />
            <span>Seg - Sex: 8h ás 21h</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-white" />
            <span>Hall do Prédio</span>
          </div>
        </div>

        {/* Botão Acesso Secretaria */}
        <div className="flex-shrink-0 mt-4 lg:mt-0 w-full lg:w-auto">
          <button 
            type="button"
            className="w-full lg:w-auto bg-[#ff0000] hover:bg-red-700 text-white font-bold py-2.5 px-8 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/50"
          >
            Acesso Secretaria
          </button>
        </div>
      </div>
    </header>
  )
}