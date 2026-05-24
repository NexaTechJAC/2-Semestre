import Cabecalho from "./Cabecalho"
import { useEffect, useRef, useState } from "react"
import { RotateCcw, GraduationCap } from "lucide-react"

import { fetchCursos, fetchTopicos, fetchResposta, formatarChave } from "../data/api"
import type { Mensagem, Curso, Topico, SubOpcao, Etapa } from "../types"

import FormularioEmail from "./FormularioEmail"

import avatarAssistente from "../assets/img/Avatar_Fatec.png"

const API = import.meta.env.VITE_API_URL ?? "http://localhost:3000"

const initialMessages: Mensagem[] = [
  { tipo: "bot", texto: "Olá! Sou o assistente virtual da Secretaria Acadêmica.\nComo posso ajudá-lo hoje?" },
]

export default function Chatbot() {
  const [history, setHistory] = useState<Mensagem[]>(initialMessages)
  const [etapa, setEtapa] = useState<Etapa>({ tipo: "cursos" })
  const [cursos, setCursos] = useState<Curso[]>([])
  const [topicos, setTopicos] = useState<Topico[]>([])
  const [loading, setLoading] = useState(false)
  const [siglaAtual, setSiglaAtual] = useState("")
  const [aguardandoSatisfacao, setAguardandoSatisfacao] = useState(false)
  const [mostrarFormContato, setMostrarFormContato] = useState(false)
  const endOfChatRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    endOfChatRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })
  }, [history, etapa, mostrarFormContato])

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

      if (data.sub_opcoes && data.sub_opcoes.length > 0) {
        const aviso = data.resposta?.conteudo || "Escolha uma opção:"
        next.push({ tipo: "bot", texto: aviso })
        setEtapa({ tipo: "sub_opcoes", opcoes: data.sub_opcoes })

      } else if (data.tipo === "simples" && data.resposta) {
        const textoResposta = data.resposta.conteudo || "Sem conteúdo cadastrado."
        next.push({ tipo: "bot", texto: textoResposta })
        next.push({ tipo: "bot", texto: "Essa resposta resolveu sua dúvida?" })
        setEtapa({ tipo: "satisfacao" })
        setAguardandoSatisfacao(true)

      } else if (data.tipo === "pdf" && data.documentos.length > 0) {
        next.push({ tipo: "bot", texto: "Documentos disponíveis para download:" })
        data.documentos.forEach(doc => {
          const urlPdf = `${API}${doc.caminho_arquivo.split('/').map(encodeURIComponent).join('/')}`
          next.push({
            tipo: "bot",
            texto: `📄 ${doc.nome_exibicao}\n${urlPdf}`
          })
        })
        next.push({ tipo: "bot", texto: "Essa resposta resolveu sua dúvida?" })
        setEtapa({ tipo: "satisfacao" })
        setAguardandoSatisfacao(true)

      } else if (data.tipo === "menu" && data.sub_opcoes.length > 0) {
        const aviso = data.resposta?.conteudo || "Escolha uma opção:"
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
        { tipo: "bot", texto: "Lamento que a resposta não tenha sido suficiente. Preencha o formulário abaixo para enviar a sua dúvida (e documentos, se precisar) para a equipe da Secretaria:" },
      ])
      setMostrarFormContato(true)
    }
  }

  function handleRestart() {
    setHistory(initialMessages)
    setEtapa({ tipo: "cursos" })
    setSiglaAtual("")
    setTopicos([])
    setAguardandoSatisfacao(false)
    setMostrarFormContato(false)
  }

  function renderOpcoes() {
    if (loading) {
      return (
        <div className="flex flex-wrap gap-3 pt-2">
          <span className="text-gray-500 text-[15px] animate-pulse">Carregando...</span>
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
            className="rounded-xl border-2 border-emerald-600 bg-emerald-600 px-6 py-2.5 text-[15px] font-bold text-white transition hover:bg-emerald-700 hover:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            onClick={() => handleSatisfacao(true)}
            type="button"
          >
            👍 Sim, resolveu
          </button>
          <button
            className="rounded-xl border-2 border-[#a31212] bg-[#a31212] px-6 py-2.5 text-[15px] font-bold text-white transition hover:bg-[#850e0e] hover:border-[#850e0e] focus:outline-none focus:ring-2 focus:ring-red-500/40"
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
    <main className="fixed inset-0 z-50 flex flex-col bg-[#f4f6f9] text-gray-900">

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

      <div className="flex-1 overflow-y-auto px-4 py-10 sm:px-8">
        <div className="mx-auto flex w-full max-w-7xl items-start justify-between gap-12 lg:gap-20 pb-12">

          <div className="flex-1 flex flex-col space-y-10 w-full max-w-4xl">

            {history.map((message, index) => (
              <ChatMessage
                key={`${message.tipo}-${index}-${message.texto}`}
                message={message}
              />
            ))}

            <div className="mt-2 flex flex-col gap-4">
              {renderOpcoes()}

              {mostrarFormContato && (
                <div className="flex justify-start pt-2">
                  <FormularioEmail
                    onSucesso={() => {
                      setMostrarFormContato(false)
                      setHistory(prev => [
                        ...prev,
                        { tipo: "bot", texto: "✅ A sua mensagem e anexos foram enviados com sucesso! A secretaria entrará em contato pelo e-mail informado." }
                      ])
                    }}
                    onCancelar={() => {
                      setMostrarFormContato(false)
                      setHistory(prev => [
                        ...prev,
                        { tipo: "bot", texto: "Envio cancelado." }
                      ])
                    }}
                  />
                </div>
              )}

              {etapa.tipo === "fim" && !mostrarFormContato && (
                <div className="mt-8 flex justify-center pt-8">
                  <button
                    className="flex items-center gap-2 rounded-xl bg-gray-200 px-6 py-3 text-[15px] font-bold text-gray-700 transition hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500/20"
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

          <aside className="hidden lg:flex w-[320px] shrink-0 flex-col space-y-5 sticky top-8">
            <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm">
              <h3 className="text-[15px] font-bold text-gray-800 border-b border-gray-100 pb-2 mb-3 flex items-center gap-2">
                🕒 Atendimento Secretaria
              </h3>
              <p className="text-[14px] text-gray-600 leading-relaxed">
                Segunda a Sexta-feira<br />
                <span className="font-semibold text-gray-900">Das 08h às 21h</span>
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm">
              <h3 className="text-[15px] font-bold text-gray-800 border-b border-gray-100 pb-2 mb-3 flex items-center gap-2">
                🌐 Links Úteis
              </h3>
              <ul className="text-[14px] space-y-2.5 font-medium text-[#a31212]">
                <li>
                  <a href="https://siga.cps.sp.gov.br/sigaaluno/applogin.aspx" target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1">
                    • Sistema SIGA (Aluno)
                  </a>
                </li>
                <li>
                  <a href="https://www.vestibularfatec.com.br" target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1">
                    • Vestibular FATEC
                  </a>
                </li>
                <li>
                  <a href="https://www.cps.sp.gov.br/" target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1">
                    • Conheça o Site da FATEC
                  </a>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl bg-red-50/60 border border-red-100 p-5">
              <h4 className="text-[13.5px] font-bold text-[#a31212] mb-1">
                💡 Dica de Navegação
              </h4>
              <p className="text-[13px] text-gray-600 leading-relaxed">
                Utilize os botões sugeridos na conversa para obter respostas imediatas sobre prazos, matrículas e documentos.
              </p>
            </div>
          </aside>

        </div>
      </div>
    </main>
  )
}

function BotaoOpcao({ texto, onClick }: { texto: string; onClick: () => void }) {
  return (
    <button
      className="rounded-xl bg-[#a31212] px-5 py-3 text-[15px] font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#850e0e] focus:outline-none focus:ring-2 focus:ring-red-500/40"
      onClick={onClick}
      type="button"
    >
      {texto}
    </button>
  )
}

function renderTextoComLinks(texto: string) {
  const urlRegex = /(https?:\/\/[^\s\n]+)/g
  const partes = texto.split(urlRegex)

  return partes.map((parte, i) =>
    urlRegex.test(parte) ? (
      <a
        key={i}
        href={parte}
        target="_blank"
        rel="noopener noreferrer"
        className="underline text-blue-600 hover:text-blue-800 break-all"
      >
        {parte}
      </a>
    ) : (
      <span key={i}>{parte}</span>
    )
  )
}

function ChatMessage({ message }: { message: Mensagem }) {
  if (message.tipo === "bot") {
    return (
      <div className="flex justify-start">
        <div className="max-w-[90%] whitespace-pre-line break-words rounded-2xl rounded-tl-sm bg-white border border-gray-200/80 px-6 py-4 text-left text-[16px] font-medium leading-relaxed text-gray-800 shadow-sm sm:max-w-[80%]">
          {renderTextoComLinks(message.texto)}
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-end pt-2">
      <div className="max-w-[90%] whitespace-pre-line break-words rounded-2xl rounded-tr-sm bg-[#a31212] px-6 py-4 text-left text-[16px] font-medium leading-relaxed text-white shadow-sm sm:max-w-[80%]">
        {message.texto}
      </div>
    </div>
  )
}