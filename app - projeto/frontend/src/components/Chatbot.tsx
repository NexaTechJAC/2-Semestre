import { useEffect, useRef, useState } from "react"
import { RotateCcw } from "lucide-react"

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

export function FloatingChatbot({ open }: FloatingChatbotProps) {
  if (!open) {
    return null
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 w-[min(352px,calc(100vw-28px))]">
      <ChatWindow surface="floating" />
    </div>
  )
}

function ChatWindow({ surface: _surface }: { surface: ChatSurface }) {
  const [isOpen, setIsOpen] = useState(false)
  const [history, setHistory] = useState<Mensagem[]>(initialMessages)
  const [currentOptions, setCurrentOptions] = useState<Menu[]>(menus)
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
      nextHistory.push({ tipo: "bot", texto: "Posso te ajudar com mais alguma coisa?" })
      setCurrentOptions(menus)
    } else if (option.filhos) {
      nextHistory.push({ tipo: "bot", texto: "Escolha uma opção:" })
      setCurrentOptions(option.filhos)
    }

    setHistory(nextHistory)
  }

  function handleRestart() {
    setHistory(initialMessages)
    setCurrentOptions(menus)
  }

  return (
    <div style={{position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontFamily: 'sans-serif' }}>
      
      <style>{`
        .chat-scroll {
          scrollbar-width: thin;
          scrollbar-color: #c1c1c1 #f8f9fa;
        }
        .chat-scroll::-webkit-scrollbar {
          width: 8px;
        }
        .chat-scroll::-webkit-scrollbar-track {
          background: transparent;
          border-radius: 8px;
        }
        .chat-scroll::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 8px;
        }
        .chat-scroll::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
        .balao {
          position: relative;
          padding: 8px 12px;
          border-radius: 16px;
          display: inline-block;
          max-width: 80%;
          white-space: pre-line;
          text-align: left;
          font-size: 2.2vh;
          word-break: break-word;
        }
        .balao::before {
          content: "";
          position: absolute;
          top: 0;
          width: 0;
          height: 0;
          border-style: solid;
        }
        .balao-usuario {
          background: #ff0000;
          color: white;
          border-top-right-radius: 0;
        }
        .balao-usuario::before {
          right: -8px;
          border-width: 0 0 12px 10px;
          border-color: transparent transparent transparent #ff0000;
        }
        .balao-bot {
          background: #e2cece;
          color: black;
          border-top-left-radius: 0;
        }
        .balao-bot::before {
          left: -8px;
          border-width: 0 10px 12px 0;
          border-color: transparent #e2cece transparent transparent;
        }
      `}</style>

      {isOpen && (
        <div style={{ 
          width: '320px', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '8px', 
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)', 
          marginBottom: '16px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          
          <div style={{ backgroundColor: '#ff0000', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' }}>
            <span style={{ fontWeight: 'bold' }}>Atendimento Fatec</span>
            <button 
              onClick={() => setIsOpen(false)} 
              style={{ background: 'none', border: 'none', color: 'white', fontSize: '16px', cursor: 'pointer', padding: 0 }}
            >
              ✖
            </button>
          </div>

          <div style={{ maxHeight: '45vh', overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }} className="chat-scroll">
            {history.map((msg, index) => {
              const isUser = msg.tipo === "usuario"
              return (
                <div key={index} style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', marginBottom: '8px' }}>
                  <span className={`balao ${isUser ? 'balao-usuario' : 'balao-bot'}`}>{msg.texto}</span>
                </div>
              )
            })}
            <div ref={endOfChatRef} />
          </div>

          <div style={{maxHeight: '25vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px', borderTop: '1px solid #ddd' }}>
            {currentOptions.map((opcao) => (
              <button
                key={opcao.id}
                onClick={() => handleChoice(opcao)}
                style={{ fontSize: '14px', padding: '8px 12px', cursor: 'pointer', borderRadius: '6px', border: '1px solid #ECDBDB', color: 'black', background: 'white', textAlign: 'left' }}
              >
                {opcao.texto}
              </button>
            ))}
            <button
              onClick={handleRestart}
              style={{ width: '100%', fontSize: '14px', marginTop: '8px', padding: '8px 12px', cursor: 'pointer', borderRadius: '6px', border: 'none', background: '#dc3545', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <RotateCcw size={16} />
              Reiniciar conversa
            </button>
          </div>
        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: '#ff0000',
          color: 'white',
          border: 'none',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          cursor: 'pointer',
          fontSize: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        {isOpen ? '✖' : '💬'}
      </button>

    </div>
  )
}

export default Chatbot
