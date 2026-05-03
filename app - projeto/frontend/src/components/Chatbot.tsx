import { useEffect, useRef, useState } from "react"
import { RotateCcw, X } from "lucide-react"

import chatbotUser from "../assets/img/chatbot_user.png"
import { menus } from "../data/menus"
import type { Menu, Mensagem } from "../types"

type ChatbotProps = {
  inline?: boolean
}

type FloatingChatbotProps = {
  open: boolean
  onClose: () => void
}

type ChatSurface = "inline" | "floating"

const initialMessages: Mensagem[] = [
  { tipo: "bot", texto: "Bem-vindo ao autoatendimento da Secretaria Acadêmica da Fatec Jacareí!" },
  { tipo: "bot", texto: "Para qual curso você deseja atendimento?" },
]

export function Chatbot({ inline = false }: ChatbotProps) {
  return <ChatWindow surface={inline ? "inline" : "floating"} />
}

export function FloatingChatbot({ open, onClose }: FloatingChatbotProps) {
  if (!open) {
    return null
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 w-[min(352px,calc(100vw-28px))]">
      <ChatWindow onClose={onClose} surface="floating" />
    </div>
  )
}

function ChatWindow({ onClose, surface }: { onClose?: () => void; surface: ChatSurface }) {
  const [history, setHistory] = useState<Mensagem[]>(initialMessages)
  const [currentOptions, setCurrentOptions] = useState<Menu[]>(menus)
  const [aguardandoSatisfacao, setAguardandoSatisfacao] = useState(false)
  const [aguardandoPergunta, setAguardandoPergunta] = useState(false)
  const endOfChatRef = useRef<HTMLDivElement | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const isFloating = surface === "floating"

  useEffect(() => {
    endOfChatRef.current?.scrollIntoView({ behavior: "instant", block: "nearest" })
  }, [history, currentOptions])

  useEffect(() => {
  if (scrollContainerRef.current) {
    scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight
  }
  }, [])

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

  function handSatisfacao(satisfeito: boolean) {
    setAguardandoSatisfacao(false)

    if (satisfeito) {
      // Usuário ficou satisfeito, encerra a conversa
      setHistory(prev => [...prev, 
      { tipo: "usuario", texto: "👍 Sim, obrigado!" },
      { tipo: "bot", texto: "Fico feliz em ter ajudado! Até a próxima 😊" }
      ])
      setCurrentOptions([])
    } else {
      // Usuário não ficou satisfeito, pede para enviar pergunta
      setHistory(prev => [...prev,
      { tipo: "usuario", texto: "👎 Não"},
      { tipo: "bot", texto: "Tudo bem! Você pode enviar sua dúvida pelo formulário de contato na página inicial. A secretaria responderá em breve." }
      ])
      setCurrentOptions([])
    }
  }

  return (
    <section
      aria-label="Atendimento Fatec"
      className={
        isFloating
          ? "overflow-hidden rounded-b-lg rounded-t-md bg-[#f8f9fa] text-black shadow-2xl ring-1 ring-black/15"
          : "flex h-full min-h-[390px] flex-col justify-end overflow-hidden rounded-lg bg-[#f8f9fa] text-black shadow-2xl ring-1 ring-black/10"
      }
    >
      <ChatHeader onClose={onClose} surface={surface} />

      <div
        ref={scrollContainerRef}
        className={
          isFloating
            ? "chat-scroll h-[min(430px,calc(100vh-180px))] overflow-y-auto px-4 py-5 flex flex-col justify-end"
            : "chat-scroll flex-1 overflow-y-auto px-5 py-5 flex flex-col justify-end"
        }
      >
        <div className="space-y-2">
          {history.map((message, index) => (
            <ChatMessage
              key={`${message.tipo}-${index}-${message.texto}`}
              isLastBotMessage={message.tipo === "bot" && history[index + 1]?.tipo !== "bot"}
              message={message}
            />
          ))}
        </div>

        <div className="mt-5 flex flex-col gap-2">

          {/* Botões de satisfação */}
          {aguardandoSatisfacao && (
          <div className="flex gap-2">
            <button
              className="flex-1 rounded-full border border-[green] bg-white px-4 py-2 text-[12px] text-[green] transition hover:bg-[green] hover:text-white"
              onClick={() => handSatisfacao(true)}
              type="button"
            >
              👍 Sim, obrigado!
            </button>
            <button
              className="flex-1 rounded-full border border-[#dc3545] bg-white px-4 py-2 text-[12px] text-[#dc3545] transition hover:bg-[#dc3545] hover:text-white"
              onClick={() => handSatisfacao(false)}
              type="button"
            >
                      👎 Não!
                    </button>
                  </div>
                )}

          {currentOptions.map((option) => (
            <button
              className="min-h-8 rounded-full border border-[black] bg-white px-4 py-2 text-center text-[13px] leading-tight text-[black] transition hover:bg-[black] hover:text-white focus:outline-none focus:ring-2 focus:ring-[black]/40"
              key={option.id}
              onClick={() => handleChoice(option)}
              type="button"
            >
              {option.texto}
            </button>
          ))}

          <button
            className="mt-1 flex min-h-9 items-center justify-center gap-2 rounded-full bg-[#dc3545] px-4 py-2 text-[12px] font-bold text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500/40"
            onClick={handleRestart}
            type="button"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reiniciar conversa
          </button>
        </div>

        <div ref={endOfChatRef} />
      </div>
    </section>
  )
}

function ChatHeader({ onClose, surface }: { onClose?: () => void; surface: ChatSurface }) {
  const isFloating = surface === "floating"

  return (
    <header className="relative flex min-h-[42px] items-center justify-between bg-[#ff0000] px-4 py-2 text-white">
      <h2 className="truncate text-[18px] font-black leading-none">Atendimento Fatec</h2>

      {isFloating && (
        <button
          aria-label="Fechar atendimento"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full transition hover:bg-white/15"
          onClick={onClose}
          type="button"
        >
          <X className="h-6 w-6" />
        </button>
      )}
    </header>
  )
}

function ChatMessage({ isLastBotMessage, message }: { isLastBotMessage: boolean; message: Mensagem }) {
  const isBot = message.tipo === "bot"

  if (isBot) {
    return (
      <div className="flex items-start gap-2">
        <div className="grid h-8 w-8 shrink-0 place-items-center">
          {isLastBotMessage && (
            <span className="grid h-7 w-7 place-items-center overflow-hidden rounded-full bg-[#26343a]">
              <img alt="Avatar do bot" className="h-full w-full object-cover" src={chatbotUser} />
            </span>
          )}
        </div>
        <div className="relative max-w-[82%] whitespace-pre-line break-words rounded-2xl rounded-tl-sm bg-[#e2cece] px-3 py-2 text-left text-[13px] leading-snug text-black before:absolute before:left-[-8px] before:top-0 before:h-0 before:w-0 before:border-y-[6px] before:border-r-[9px] before:border-y-transparent before:border-r-[#e2cece]">
          {message.texto}
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-end">
      <div className="relative max-w-[82%] whitespace-pre-line break-words rounded-2xl rounded-tr-sm bg-[#ff0000] px-3 py-2 text-left text-[13px] leading-snug text-white before:absolute before:right-[-8px] before:top-0 before:h-0 before:w-0 before:border-y-[6px] before:border-l-[9px] before:border-y-transparent before:border-l-[#ff0000]">
        {message.texto}
      </div>
    </div>
  )
}

export default Chatbot
