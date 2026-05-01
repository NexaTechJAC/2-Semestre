import { useState } from 'react'
import type { Menu, Mensagem } from '../types'
// importa os dados mockados dos menus
import { menus } from '../data/menus'

function Chatbot() { // histórico de mensagens e opções atuais começam com o estado inicial
  const [historico, setHistorico] = useState<Mensagem[]>([
    { tipo: 'bot', texto: 'Bem-vindo ao autoatendimento da Secretaria Acadêmica da Fatec Jacareí! Para qual curso você deseja atendimento?' }
  ])
  const [opcoesAtuais, setOpcoesAtuais] = useState<Menu[]>(menus)

  function handleEscolha(opcao: Menu) {
    const novasMensagens: Mensagem[] = [
      ...historico,
      { tipo: 'usuario', texto: opcao.texto }
    ]

    if (opcao.aviso) {
      novasMensagens.push({ tipo: 'bot', texto: opcao.aviso })
    }

    if (opcao.resposta) {  // opção final: reposta e volta para menu principal
      novasMensagens.push({ tipo: 'bot', texto: opcao.resposta })
      novasMensagens.push({ tipo: 'bot', texto: 'Posso te ajudar com mais alguma coisa?' })
      setOpcoesAtuais(menus)
    } else if (opcao.filhos) {  // opcão submenus: exibe as opções filhas
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
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>Autoatendimento Fatec Jacareí</h2>
       
       {/* histórico de mensagens */}
      <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '16px', marginBottom: '16px', minHeight: '300px', maxHeight: '400px', overflowY: 'auto' }}>
        {historico.map((msg, index) => (
          <div key={index} style={{ textAlign: msg.tipo === 'usuario' ? 'right' : 'left', marginBottom: '8px' }}>
            <span style={{
              background: msg.tipo === 'usuario' ? '#007bff' : '#f0f0f0',
              color: msg.tipo === 'usuario' ? 'white' : 'black',
              padding: '8px 12px',
              borderRadius: '16px',
              display: 'inline-block',
              maxWidth: '80%',
              whiteSpace: 'pre-line',
              textAlign: 'left'
            }}>
              {msg.texto}
            </span>
          </div>
        ))}
      </div>

       {/* opcões disponíveis */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {opcoesAtuais.map((opcao) => (
          <button
            key={opcao.id}
            onClick={() => handleEscolha(opcao)}
            style={{ padding: '10px', cursor: 'pointer', borderRadius: '8px', border: '1px solid #007bff', background: 'white', color: '#007bff' }}
          >
            {opcao.texto}
          </button>
        ))}
      </div>
       {/* botão reiniciar */}
      <button
        onClick={handleReiniciar}
        style={{ marginTop: '16px', padding: '8px 16px', cursor: 'pointer', borderRadius: '8px', border: 'none', background: '#dc3545', color: 'white' }}
      >
        Reiniciar conversa
      </button>
    </div>
  )
}

export default Chatbot