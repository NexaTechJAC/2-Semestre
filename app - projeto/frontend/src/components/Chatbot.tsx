import Cabecalho from "./Cabecalho"
import { useEffect, useRef, useState } from "react"
import { RotateCcw, GraduationCap } from "lucide-react"

import { menus } from "../data/menus"
import type { Menu, Mensagem } from "../types"

import avatarAssistente from "../assets/img/Avatar_Fatec.png"

const initialMessages: Mensagem[] = [
  { tipo: "bot", texto: "Olá! Sou o assistente virtual da Secretaria Acadêmica.\nComo posso ajudá-lo?" },
]

export default function FullScreenChatbot() {
  const [history, setHistory] = useState<Mensagem[]>(initialMessages)
  const [currentOptions, setCurrentOptions] = useState<Menu[]>(menus)
  const [aguardandoSatisfacao, setAguardandoSatisfacao] = useState(false)
  const endOfChatRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    endOfChatRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })
  }, [history, currentOptions])

  function handleChoice(option: Menu) {
    const nextHistory: Mensagem[] = [...history, { tipo: "usuario", texto: option.texto }]

    if (option.aviso) {
      nextHistory.push({ tipo: "bot", texto: option.aviso })
    }

    if (option.resposta) {
      nextHistory.push({ tipo: "bot", texto: option.resposta })
      nextHistory.push({ tipo: "bot", texto: "Essa resposta resolveu sua dúvida?" })
      setCurrentOptions([])
      setAguardandoSatisfacao(true)
    } else if (option.filhos) {
      nextHistory.push({ tipo: "bot", texto: "Escolha uma opção:" })
      setCurrentOptions(option.filhos)
    }

    setHistory(nextHistory)
  }

  function handleRestart() {
    setHistory(initialMessages)
    setCurrentOptions(menus)
    setAguardandoSatisfacao(false)
  }

  function handleSatisfacao(satisfeito: boolean) {
    setAguardandoSatisfacao(false)

    if (satisfeito) {
      setHistory(prev => [
        ...prev,
        { tipo: "usuario", texto: "👍 Sim, resolveu!" },
        { tipo: "bot", texto: "Fico feliz em ter ajudado! Se precisar de mais alguma coisa, é só reiniciar a conversa. Até a próxima 😊" }
      ])
      setCurrentOptions([])
    } else {
      setHistory(prev => [
        ...prev,
        { tipo: "usuario", texto: "👎 Não resolveu" },
        {
          tipo: "bot",
          texto: "Tudo bem! Você pode enviar sua dúvida pelo formulário de contato na página inicial. A secretaria responderá em breve."
        }
      ])
      setCurrentOptions([])
    }
  }

  return (
    // fixed inset-0 garante que ocupe a tela inteira por cima de tudo, sem gerar barras de rolagem duplas
    <main className="fixed inset-0 z-50 flex flex-col bg-[#5a4b4c] text-black">
      
      {/* Cabeçalho */}
      <Cabecalho />
{/* Cabeçalho do Chatbot */}
      <header className="relative z-10 flex min-h-[88px] shrink-0 items-center justify-between bg-gradient-to-r from-[#ff0000] to-[#6b0000] px-4 py-3 text-white shadow-md sm:px-8">
        
        {/* Lado Esquerdo: Avatar e Informações */}
        <div className="flex items-center gap-4">
          
          {/* Container do Avatar com a bolinha verde de status */}
          <div className="relative">
            <img 
              src={avatarAssistente} 
              alt="Avatar Assistente Acadêmica" 
              className="h-16 w-16 rounded-full object-cover border-2 border-white/20 shadow-sm"
            />
            {/* Bolinha Verde "Online" */}
            <span className="absolute bottom-0.5 right-0 block h-4 w-4 rounded-full bg-[#00ff00] border-2 border-[#cc0000]"></span>
          </div>

          {/* Textos da Assistente */}
          <div className="flex flex-col">
            <h1 className="text-[20px] font-bold leading-tight">Assistente Acadêmica</h1>
            <span className="text-[14px] text-white/90">Online agora</span>
          </div>
        </div>

        {/* Lado Direito: Logo Portal e Ícone */}
        <div className="flex items-center gap-4">
          
{       /* Lado Direito: Logo Portal e Ícone */}
        <div className="flex items-center gap-4">
          
          {/* Textos: Somem no celular (hidden), aparecem no sm (flex) */}
          <div className="hidden flex-col items-end sm:flex">
            <span className="text-[13px] font-bold leading-tight">Portal Acadêmico</span>
            <span className="text-[9px] uppercase tracking-wider text-white/80">Secretaria Digital</span>
          </div>

          {/* Ícone: Agora também some no celular (hidden) e aparece no sm (flex) */}
          <div className="hidden sm:flex h-12 w-14 items-center justify-center rounded-xl bg-[#ff0000] shadow-sm border border-red-500/50">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>

        </div>

        </div>
      </header>

      {/* Área de rolagem das mensagens */}
      <div className="flex-1 overflow-y-auto px-4 py-8 sm:px-8">
        
        {/* Container central para manter a leitura agradável no desktop */}
        <div className="mx-auto flex w-full max-w-5xl flex-col space-y-6 pb-12">
          
          {history.map((message, index) => (
            <ChatMessage
              key={`${message.tipo}-${index}-${message.texto}`}
              message={message}
            />
          ))}

          {/* Área de Botões/Opções com estilo de "Sugestões da IA" */}
          <div className="mt-2 flex flex-col gap-4">
            {aguardandoSatisfacao ? (
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  className="rounded-xl border-2 border-[#28a745] bg-[#28a745] px-6 py-2.5 text-[15px] font-bold text-white transition hover:bg-green-700 hover:border-green-700 focus:outline-none focus:ring-2 focus:ring-green-500/40"
                  onClick={() => handleSatisfacao(true)}
                  type="button"
                >
                  👍 Sim, resolveu
                </button>
                <button
                  className="rounded-xl border-2 border-[#ff0000] bg-[#ff0000] px-6 py-2.5 text-[15px] font-bold text-white transition hover:bg-red-700 hover:border-red-700 focus:outline-none focus:ring-2 focus:ring-red-500/40"
                  onClick={() => handleSatisfacao(false)}
                  type="button"
                >
                  👎 Não resolveu
                </button>
              </div>
            ) : (
              currentOptions.length > 0 && (
                <div className="flex flex-wrap gap-3 pt-2">
                  {currentOptions.map((option) => (
                    <button
                      className="rounded-xl bg-[#ff0000] px-5 py-3 text-[15px] font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500/40"
                      key={option.id}
                      onClick={() => handleChoice(option)}
                      type="button"
                    >
                      {option.texto}
                    </button>
                  ))}
                </div>
              )
            )}

            {history.length > 2 && currentOptions.length === 0 && !aguardandoSatisfacao && (
              <div className="mt-8 flex justify-center pt-8">
                <button
                  className="flex items-center gap-2 rounded-xl bg-black/20 px-6 py-3 text-[15px] font-bold text-white transition hover:bg-black/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                  onClick={handleRestart}
                  type="button"
                >
                  <RotateCcw className="h-4 w-4" />
                  Iniciar novo atendimento
                </button>
              </div>
            )}
          </div>
          
          {/* Âncora invisível para o scroll automático */}
          <div ref={endOfChatRef} className="h-4" />
        </div>
      </div>
    </main>
  )
}

function ChatMessage({ message }: { message: Mensagem }) {
  const isBot = message.tipo === "bot"

  if (isBot) {
    return (
      <div className="flex justify-start">
        {/* Balão do Bot */}
        <div className="max-w-[90%] whitespace-pre-line break-words rounded-2xl rounded-tl-sm bg-[#e6e6e6] px-6 py-4 text-left text-[16px] font-medium leading-relaxed text-black shadow-sm sm:max-w-[80%]">
          {message.texto}
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-end pt-4">
      {/* Balão do Usuário */}
      <div className="max-w-[90%] whitespace-pre-line break-words rounded-2xl rounded-tr-sm bg-transparent px-6 py-4 text-left text-[16px] font-semibold leading-relaxed text-white ring-1 ring-white/30 sm:max-w-[80%]">
        {message.texto}
      </div>
    </div>
  )
}