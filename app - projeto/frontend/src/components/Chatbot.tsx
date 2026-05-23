import Cabecalho from "./Cabecalho"
import { useEffect, useRef, useState } from "react"
import { RotateCcw, GraduationCap } from "lucide-react"

import { fetchCursos, fetchTopicos, fetchResposta, formatarChave } from "../data/api"
import type { Mensagem, Curso, Topico, SubOpcao, Etapa } from "../types"

import avatarAssistente from "../assets/img/Avatar_Fatec.png"

const API = import.meta.env.VITE_API_URL ?? "http://localhost:3000"

const initialMessages: Mensagem[] = [
  { tipo: "bot", texto: "Olá! Sou o assistente virtual da Secretaria Acadêmica.\nComo posso ajudá-lo?" },
]

export default function Chatbot() {
  const [history, setHistory] = useState<Mensagem[]>(initialMessages)
  const [etapa, setEtapa] = useState<Etapa>({ tipo: "cursos" })
  const [cursos, setCursos] = useState<Curso[]>([])
  const [topicos, setTopicos] = useState<Topico[]>([])
  const [loading, setLoading] = useState(false)
  const [siglaAtual, setSiglaAtual] = useState("")
  const [aguardandoSatisfacao, setAguardandoSatisfacao] = useState(false)
  const endOfChatRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    endOfChatRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })
  }, [history, etapa])

  useEffect(() => {
    fetchCursos()
      .then(setCursos)
      .catch(() => {
        setHistory(prev => [...prev, { tipo: "bot", texto: "Erro ao conectar com o servidor. Tente novamente mais tarde." }])
      })
  }, [])

  async function handleCurso(curso: Curso) {
    setSiglaAtual(curso.sigla)
    setLoading(true)
    const next: Mensagem[] = [...history, { tipo: "usuario", texto: curso.nome }]

    try {
      const data = await fetchTopicos(curso.sigla)
      setTopicos(data)
      next.push({ tipo: "bot", texto: "Sobre o que você precisa de informação?" })
      setEtapa({ tipo: "topicos", sigla: curso.sigla })
    } catch {
      next.push({ tipo: "bot", texto: "Erro ao buscar tópicos. Tente novamente." })
      setEtapa({ tipo: "cursos" })
    }

    setHistory(next)
    setLoading(false)
  }

  async function handleTopico(topico: Topico) {
    setLoading(true)
    const next: Mensagem[] = [...history, { tipo: "usuario", texto: formatarChave(topico.chave) }]

    try {
      const data = await fetchResposta(siglaAtual, topico.chave)

      if (data.tipo === "simples" && data.resposta) {
        next.push({ tipo: "bot", texto: data.resposta.conteudo })
        next.push({ tipo: "bot", texto: "Essa resposta resolveu sua dúvida?" })
        setEtapa({ tipo: "satisfacao" })
        setAguardandoSatisfacao(true)

      } else if (data.tipo === "pdf" && data.documentos.length > 0) {
        next.push({ tipo: "bot", texto: "Documentos disponíveis para download:" })
        data.documentos.forEach(doc => {
          next.push({
            tipo: "bot",
            texto: `📄 ${doc.nome_exibicao}\n${API}/uploads${doc.caminho_arquivo}`
          })
        })
        next.push({ tipo: "bot", texto: "Essa resposta resolveu sua dúvida?" })
        setEtapa({ tipo: "satisfacao" })
        setAguardandoSatisfacao(true)

      } else if (data.tipo === "menu" && data.sub_opcoes.length > 0) {
        const aviso = data.sub_opcoes[0]?.texto_informativo ?? "Escolha uma opção:"
        next.push({ tipo: "bot", texto: aviso })
        setEtapa({ tipo: "sub_opcoes", opcoes: data.sub_opcoes })

      } else {
        next.push({ tipo: "bot", texto: "Informação não encontrada para esse tópico." })
        setEtapa({ tipo: "satisfacao" })
        setAguardandoSatisfacao(true)
      }
    } catch {
      next.push({ tipo: "bot", texto: "Erro ao buscar resposta. Tente novamente." })
      setEtapa({ tipo: "topicos", sigla: siglaAtual })
    }

    setHistory(next)
    setLoading(false)
  }

  function handleSubOpcao(opcao: SubOpcao) {
    setHistory(prev => [
      ...prev,
      { tipo: "usuario", texto: opcao.titulo },
      { tipo: "bot", texto: opcao.conteudo },
      { tipo: "bot", texto: "Essa resposta resolveu sua dúvida?" },
    ])
    setEtapa({ tipo: "satisfacao" })
    setAguardandoSatisfacao(true)
  }

  function handleSatisfacao(satisfeito: boolean) {
    setAguardandoSatisfacao(false)
    setEtapa({ tipo: "fim" })

    if (satisfeito) {
      setHistory(prev => [
        ...prev,
        { tipo: "usuario", texto: "👍 Sim, resolveu!" },
        { tipo: "bot", texto: "Fico feliz em ter ajudado! Se precisar de mais alguma coisa, é só reiniciar a conversa. Até a próxima 😊" },
      ])
    } else {
      setHistory(prev => [
        ...prev,
        { tipo: "usuario", texto: "👎 Não resolveu" },
        { tipo: "bot", texto: "Tudo bem! Você pode enviar sua dúvida pelo formulário de contato na página inicial. A secretaria responderá em breve." },
      ])
    }
  }

  function handleRestart() {
    setHistory(initialMessages)
    setEtapa({ tipo: "cursos" })
    setSiglaAtual("")
    setTopicos([])
    setAguardandoSatisfacao(false)
  }

  function renderOpcoes() {
    if (loading) {
      return (
        <div className="flex flex-wrap gap-3 pt-2">
          <span className="text-white/70 text-[15px]">Carregando...</span>
        </div>
      )
    }

    if (etapa.tipo === "cursos") {
      return (
        <div className="flex flex-wrap gap-3 pt-2">
          {cursos.map(curso => (
            <BotaoOpcao key={curso.id} texto={curso.nome} onClick={() => handleCurso(curso)} />
          ))}
        </div>
      )
    }

    if (etapa.tipo === "topicos") {
      return (
        <div className="flex flex-wrap gap-3 pt-2">
          {topicos.map(topico => (
            <BotaoOpcao key={topico.id} texto={formatarChave(topico.chave)} onClick={() => handleTopico(topico)} />
          ))}
        </div>
      )
    }

    if (etapa.tipo === "sub_opcoes") {
      return (
        <div className="flex flex-wrap gap-3 pt-2">
          {etapa.opcoes.map(opcao => (
            <BotaoOpcao key={opcao.id} texto={opcao.titulo} onClick={() => handleSubOpcao(opcao)} />
          ))}
        </div>
      )
    }

    if (aguardandoSatisfacao) {
      return (
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
      )
    }

    return null
  }

  return (
    <main className="fixed inset-0 z-50 flex flex-col bg-[#5a4b4c] text-black">

      <Cabecalho />

      <header className="relative z-10 flex max-h-[108px] min-h-[88px] shrink-0 items-center justify-between bg-gradient-to-r from-[#ff0000] to-[#6b0000] px-4 py-3 text-white shadow-md sm:px-8">
        <div className="flex h-full items-center gap-4">
          <div className="relative h-16 w-16 shrink-0 rounded-full bg-white p-1 shadow-sm">
            <img
              src={avatarAssistente}
              alt="Avatar Assistente Acadêmica"
              className="h-[165%] w-[165%] object-cover absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            />
            <span className="absolute bottom-0.5 right-0 block h-4 w-4 rounded-full bg-[#00ff00] border-2 border-[#cc0000]"></span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-[20px] font-bold leading-tight">Assistente Acadêmica</h1>
            <span className="text-[14px] text-white/90">Online agora</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden flex-col items-end sm:flex">
            <span className="text-[13px] font-bold leading-tight">Portal Acadêmico</span>
            <span className="text-[9px] uppercase tracking-wider text-white/80">Secretaria Digital</span>
          </div>
          <div className="hidden sm:flex h-12 w-14 items-center justify-center rounded-xl bg-[#ff0000] shadow-sm border border-red-500/50">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-8 sm:px-8">
        <div className="mx-auto flex w-full max-w-5xl flex-col space-y-6 pb-12">

          {history.map((message, index) => (
            <ChatMessage
              key={`${message.tipo}-${index}-${message.texto}`}
              message={message}
            />
          ))}

          <div className="mt-2 flex flex-col gap-4">
            {renderOpcoes()}

            {etapa.tipo === "fim" && (
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

          <div ref={endOfChatRef} className="h-4" />
        </div>
      </div>
    </main>
  )
}

function BotaoOpcao({ texto, onClick }: { texto: string; onClick: () => void }) {
  return (
    <button
      className="rounded-xl bg-[#ff0000] px-5 py-3 text-[15px] font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500/40"
      onClick={onClick}
      type="button"
    >
      {texto}
    </button>
  )
}

function ChatMessage({ message }: { message: Mensagem }) {
  if (message.tipo === "bot") {
    return (
      <div className="flex justify-start">
        <div className="max-w-[90%] whitespace-pre-line break-words rounded-2xl rounded-tl-sm bg-[#e6e6e6] px-6 py-4 text-left text-[16px] font-medium leading-relaxed text-black shadow-sm sm:max-w-[80%]">
          {message.texto}
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-end pt-4">
      <div className="max-w-[90%] whitespace-pre-line break-words rounded-2xl rounded-tr-sm bg-transparent px-6 py-4 text-left text-[16px] font-semibold leading-relaxed text-white ring-1 ring-white/30 sm:max-w-[80%]">
        {message.texto}
      </div>
    </div>
  )
}