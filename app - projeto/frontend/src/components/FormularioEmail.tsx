import React, { useState } from "react"
import { Send, X, FileText } from "lucide-react"

interface FormularioEmailProps {
  onSucesso: () => void;
  onCancelar: () => void;
  cursoSigla?: string;
}

const API = import.meta.env.VITE_API_URL ?? "http://localhost:3000"

export default function FormularioEmail({ onSucesso, onCancelar, cursoSigla }: FormularioEmailProps) {
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState("")
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [texto, setTexto] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro("")
    setEnviando(true)

    try {
      const res = await fetch(`${API}/api/perguntas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome_aluno: nome,
          email_aluno: email,
          curso_sigla: cursoSigla ?? null,
          texto,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setErro(data.error ?? "Erro ao enviar. Tente novamente.")
        return
      }

      onSucesso()
    } catch {
      setErro("Não foi possível conectar ao servidor. Tente novamente.")
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="w-full max-w-[90%] sm:max-w-[80%] bg-white rounded-2xl border border-gray-200 shadow-md p-5 sm:p-6 relative animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button
        onClick={onCancelar}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition focus:outline-none"
        title="Cancelar"
      >
        <X className="h-5 w-5" />
      </button>

      <h3 className="text-[17px] font-bold text-gray-800 mb-4 pr-6">
        Fale com a Secretaria
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[13px] font-semibold text-gray-700">Nome Completo</label>
            <input
              required
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Digite seu nome"
              className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2.5 text-[14px] text-gray-800 focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[13px] font-semibold text-gray-700">
              Curso
            </label>
            <input
              type="text"
              value={cursoSigla ?? "Não informado"}
              readOnly
              className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-2.5 text-[14px] text-gray-500 cursor-not-allowed"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[13px] font-semibold text-gray-700">E-mail Institucional ou Pessoal</label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="exemplo@fatec.sp.gov.br"
            className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2.5 text-[14px] text-gray-800 focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 transition"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[13px] font-semibold text-gray-700">Como podemos ajudar?</label>
          <textarea
            required
            rows={3}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Descreva sua dúvida com detalhes..."
            className="w-full resize-none rounded-xl border border-gray-300 bg-gray-50 px-4 py-2.5 text-[14px] text-gray-800 focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 transition"
          />
        </div>

        <div className="flex items-center gap-2 text-[12px] text-gray-400 bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-200">
          <FileText className="h-4 w-4 shrink-0 text-gray-400" />
          <span>Sua dúvida será respondida pela secretaria no prazo de 24 horas.</span>
        </div>

        {erro && (
          <p className="text-[13px] font-medium text-red-600 bg-red-50 rounded-xl px-4 py-2.5">
            {erro}
          </p>
        )}

        <div className="pt-2 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancelar}
            className="rounded-xl px-5 py-2.5 text-[14px] font-medium text-gray-600 hover:bg-gray-100 transition focus:outline-none"
            disabled={enviando}
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={enviando}
            className="flex items-center gap-2 rounded-xl bg-[#a31212] px-6 py-2.5 text-[14px] font-bold text-white shadow-sm transition hover:bg-[#850e0e] focus:outline-none focus:ring-2 focus:ring-red-500/40 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {enviando ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                Enviando...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Enviar Mensagem
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}