import { useState, useRef, useEffect } from 'react'
import type { Menu, Mensagem } from '../types'
// importa os dados mockados dos menus
import { menus } from '../data/menus'

function Chatbot() {
  // --- ESTADOS ---
  // Estado novo para controlar se a janela do chat está aberta ou fechada
  const [isOpen, setIsOpen] = useState<boolean>(false) 

  const [historico, setHistorico] = useState<Mensagem[]>([
    { tipo: 'bot', texto: 'Bem-vindo ao autoatendimento da Secretaria Acadêmica da Fatec Jacareí!' },
    { tipo: 'bot', texto: 'Para qual curso você deseja atendimento?' }
  ])
  const [opcoesAtuais, setOpcoesAtuais] = useState<Menu[]>(menus)

  const fimDoChatRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Só tenta rolar a tela se o chat estiver aberto!
    if (isOpen && fimDoChatRef.current) {
      fimDoChatRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [historico, isOpen])

  function handleEscolha(opcao: Menu) {
    const novasMensagens: Mensagem[] = [
      ...historico,
      { tipo: 'usuario', texto: opcao.texto }
    ]

    if (opcao.aviso) {
      novasMensagens.push({ tipo: 'bot', texto: opcao.aviso })
    }

    if (opcao.resposta) {
      novasMensagens.push({ tipo: 'bot', texto: opcao.resposta })
      novasMensagens.push({ tipo: 'bot', texto: 'Posso te ajudar com mais alguma coisa?' })
      setOpcoesAtuais(menus)
    } else if (opcao.filhos) {
      novasMensagens.push({ tipo: 'bot', texto: 'Escolha uma opção:' })
      setOpcoesAtuais(opcao.filhos)
    }

    setHistorico(novasMensagens)
  }

  function handleReiniciar() {
    setHistorico([{ tipo: 'bot', texto: 'Bem-vindo ao autoatendimento da Secretaria Acadêmica da Fatec Jacareí! Para qual curso você deseja atendimento?' }])
    setOpcoesAtuais(menus)
  }

  return (
    // Container PRINCIPAL (Fixo no canto inferior direito da tela)
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontFamily: 'sans-serif' }}>
      
      {/* Estilos do Chat */}
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
        .avatar-container {
          width: 32px;
          margin-right: 8px;
          flex-shrink: 0;
          display: flex;
          align-items: flex-start;
          justify-content: center;
        }
        .avatar-icone {
          font-size: 24px;
          line-height: 1;
        }
      `}</style>

      {/* JANELA DO CHAT - Só aparece se isOpen for true */}
      {isOpen && (
        <div style={{ 
          width: '320px', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '8px', 
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)', 
          marginBottom: '16px', // Espaçamento entre o chat e o botão flutuante
          overflow: 'hidden'
        }}>
          
          {/* Cabeçalho do Chat (Para arrastar/fechar) */}
          <div style={{ backgroundColor: '#ff0000', padding: '2px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' }}>
            <span style={{ fontWeight: 'bold' }}>Atendimento Fatec</span>
            <button 
              onClick={() => setIsOpen(false)} 
              style={{ background: 'none', border: 'none', color: 'white', fontSize: '16px', cursor: 'pointer', padding: 0 }}
            >
              ✖
            </button>
          </div>

          {/* Área interna do Chat (Mensagens e Botões) */}
          <div className="chat-scroll" style={{ padding: '16px', minHeight: '300px', maxHeight: '400px', overflowY: 'auto' }}>
            {historico.map((msg, index) => {
              const nextMsg = historico[index + 1];
              const isBot = msg.tipo === 'bot';
              const isUser = msg.tipo === 'usuario';
              const isLastBotMsg = isBot && (!nextMsg || nextMsg.tipo !== 'bot');

              if (isBot) {
                return (
                  <div key={index} style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div className="avatar-container">
                      {isLastBotMsg && <span className="avatar-icone"><img src="../assets/img/chatbot_user.png" style={{ width: '100%', height: '100%' }} alt="Avatar do bot" /></span>}
                    </div>
                    <span className="balao balao-bot">{msg.texto}</span>
                  </div>
                )
              }

              if (isUser) {
                return (
                  <div key={index} style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
                    <span className="balao balao-usuario">{msg.texto}</span>
                  </div>
                )
              }
            
              return null;
            })}
            
            <div ref={fimDoChatRef} />
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
              {opcoesAtuais.map((opcao) => (
                <button
                  key={opcao.id}
                  onClick={() => handleEscolha(opcao)}
                  style={{ fontSize: '2vh', padding: '1.2vh', cursor: 'pointer', borderRadius: '2vh', border: '1px solid #007bff', background: 'white', color: '#007bff' }}
                >
                  {opcao.texto}
                </button>
              ))}
              <button
                onClick={handleReiniciar}
                // Repare aqui: tirei o nowrap e arrumei o padding pra caber na caixinha!
                style={{ width: '100%', fontSize: '2vh', marginTop: '0.2vh', padding: '1.2vh', cursor: 'pointer', borderRadius: '2vh', border: 'none', background: '#dc3545', color: 'white' }}>
                Reiniciar conversa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BOTÃO FLUTUANTE (FAB) - Fica sempre visível */}
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
      >
        {/* Muda o ícone dependendo se está aberto ou fechado */}
        {isOpen ? '✖' : '💬'} 
      </button>

    </div>
  )
}

export default Chatbot