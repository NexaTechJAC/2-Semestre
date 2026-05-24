import React, { useState } from "react"
import { Send, X, Paperclip, FileText } from "lucide-react"

interface FormularioEmailProps {
  onSucesso: () => void;
  onCancelar: () => void;
}

export default function FormularioEmail({ onSucesso, onCancelar }: FormularioEmailProps) {
  const [enviando, setEnviando] = useState(false)
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [erroArquivo, setErroArquivo] = useState("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setErroArquivo("")
    
    if (file) {
      // Validação de segurança no Front-end: Máximo de 5MB
      if (file.size > 5 * 1024 * 1024) {
        setErroArquivo("O arquivo é muito grande. O limite máximo é de 5MB.")
        setArquivo(null)
      } else {
        setArquivo(file)
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setEnviando(true)
    
    // Aqui no futuro você colocará a chamada para a sua API enviar o e-mail e o anexo
    setTimeout(() => {
      setEnviando(false)
      onSucesso()
    }, 1500)
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
              placeholder="Digite seu nome" 
              className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2.5 text-[14px] text-gray-800 focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 transition"
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-[13px] font-semibold text-gray-700">RA (Opcional)</label>
            <input 
              type="text" 
              placeholder="Seu Registro Acadêmico" 
              className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2.5 text-[14px] text-gray-800 focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 transition"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[13px] font-semibold text-gray-700">E-mail Institucional ou Pessoal</label>
          <input 
            required 
            type="email" 
            placeholder="exemplo@fatec.sp.gov.br" 
            className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2.5 text-[14px] text-gray-800 focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 transition"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[13px] font-semibold text-gray-700">Como podemos ajudar?</label>
          <textarea 
            required 
            rows={3}
            placeholder="Descreva sua dúvida com detalhes..." 
            className="w-full resize-none rounded-xl border border-gray-300 bg-gray-50 px-4 py-2.5 text-[14px] text-gray-800 focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 transition"
          ></textarea>
        </div>

        {/* Câmbio de Envio de Arquivo Seguro */}
        <div className="space-y-1.5">
          <label className="text-[13px] font-semibold text-gray-700">Anexar Documento (Opcional)</label>
          <div className="flex items-center gap-3">
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-[13px] font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus-within:ring-2 focus-within:ring-red-500/20">
              <Paperclip className="h-4 w-4 text-gray-500" />
              <span>Escolher Arquivo</span>
              <input 
                type="file" 
                className="hidden" 
                accept=".pdf, .png, .jpg, .jpeg"
                onChange={handleFileChange}
              />
            </label>
            
            {arquivo && (
              <span className="flex items-center gap-1.5 text-[13px] font-medium text-emerald-600 truncate max-w-[200px]">
                <FileText className="h-4 w-4 shrink-0" />
                <span className="truncate">{arquivo.name}</span>
              </span>
            )}
            
            {erroArquivo && (
              <span className="text-[12px] font-medium text-red-600">{erroArquivo}</span>
            )}
          </div>
          <p className="text-[11px] text-gray-400">Permitido: PDF, JPG ou PNG (Máx 5MB)</p>
        </div>

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