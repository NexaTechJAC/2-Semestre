import { useState, useEffect, useCallback } from "react";
import { CheckCircle, Clock, Mail } from "lucide-react";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

type Pergunta = {
  id: number;
  nome_aluno: string;
  email_aluno: string;
  curso_sigla: string | null;
  texto: string;
  status: "pendente" | "enviada" | "respondida";
  criado_em: string;
  enviada_em: string | null;
  respondida_em: string | null;
};

function formatarData(iso: string) {
  return new Date(iso).toLocaleString("pt-BR");
}

function calcularTempoRestante(respondida_em: string): string {
  const limite = new Date(respondida_em).getTime() + 24 * 60 * 60 * 1000;
  const agora = Date.now();
  const diff = limite - agora;
  if (diff <= 0) return "removendo...";
  const horas = Math.floor(diff / (1000 * 60 * 60));
  const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${horas}h ${minutos}min`;
}

export default function Perguntas() {
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [marcando, setMarcando] = useState<number | null>(null);

  const token = localStorage.getItem("authToken");

  const carregarPerguntas = useCallback(async () => {
    try {
      setErro(null);
      const res = await fetch(`${API}/api/secretaria/perguntas`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erro ao carregar perguntas.");
      const data = await res.json();
      setPerguntas(data);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro desconhecido.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    carregarPerguntas();
    const interval = setInterval(carregarPerguntas, 60000);
    return () => clearInterval(interval);
  }, [carregarPerguntas]);

  async function marcarRespondida(id: number) {
    setMarcando(id);
    try {
      const res = await fetch(`${API}/api/secretaria/perguntas/${id}/respondida`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erro ao marcar como respondida.");
      await carregarPerguntas();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao marcar.");
    } finally {
      setMarcando(null);
    }
  }

  const pendentes = perguntas.filter(p => p.status === "pendente" || p.status === "enviada");
  const respondidas = perguntas.filter(p => p.status === "respondida");

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">Carregando perguntas...</div>
    );
  }

  if (erro) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 font-semibold">{erro}</p>
          <button
            onClick={carregarPerguntas}
            className="mt-3 px-4 py-1.5 bg-red-600 text-white rounded text-sm hover:bg-red-700"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-zinc-900 uppercase">
          Perguntas Recebidas
        </h2>
        <button
          onClick={carregarPerguntas}
          className="text-sm text-zinc-500 hover:text-zinc-800 border border-zinc-300 rounded-lg px-3 py-1.5 hover:bg-zinc-50 transition"
        >
          Atualizar
        </button>
      </div>

      {/* Perguntas pendentes/enviadas */}
      <div className="space-y-3">
        <h3 className="text-[13px] font-bold uppercase tracking-wider text-zinc-500">
          Aguardando resposta ({pendentes.length})
        </h3>

        {pendentes.length === 0 ? (
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-6 py-8 text-center text-zinc-500">
            Nenhuma pergunta pendente.
          </div>
        ) : (
          pendentes.map(p => (
            <div
              key={p.id}
              className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm flex flex-col sm:flex-row sm:items-start gap-4"
            >
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[15px] font-bold text-zinc-900">
                    {p.nome_aluno}
                  </span>
                  {p.curso_sigla && (
                    <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[11px] font-bold text-red-700">
                      {p.curso_sigla}
                    </span>
                  )}
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                    p.status === "enviada"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {p.status === "enviada" ? "E-mail enviado" : "Aguardando envio"}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-[13px] text-zinc-500">
                  <Mail className="h-3.5 w-3.5" />
                  <span>{p.email_aluno}</span>
                </div>

                <p className="text-[14px] text-zinc-700 leading-relaxed">
                  {p.texto}
                </p>

                <p className="text-[12px] text-zinc-400">
                  Recebida em: {formatarData(p.criado_em)}
                </p>
              </div>

              <button
                onClick={() => marcarRespondida(p.id)}
                disabled={marcando === p.id}
                className="flex items-center gap-2 rounded-xl border-2 border-emerald-600 bg-emerald-600 px-4 py-2.5 text-[13px] font-bold text-white transition hover:bg-emerald-700 hover:border-emerald-700 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
              >
                <CheckCircle className="h-4 w-4" />
                {marcando === p.id ? "Marcando..." : "Respondida"}
              </button>
            </div>
          ))
        )}
      </div>

      {/* Perguntas respondidas aguardando remoção */}
      {respondidas.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-[13px] font-bold uppercase tracking-wider text-zinc-400">
            Respondidas — serão removidas automaticamente ({respondidas.length})
          </h3>

          {respondidas.map(p => (
            <div
              key={p.id}
              className="rounded-xl border border-zinc-100 bg-zinc-50 p-5 flex flex-col sm:flex-row sm:items-start gap-4 opacity-60"
            >
              <div className="flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[14px] font-bold text-zinc-600">
                    {p.nome_aluno}
                  </span>
                  {p.curso_sigla && (
                    <span className="rounded-full bg-zinc-200 px-2.5 py-0.5 text-[11px] font-bold text-zinc-500">
                      {p.curso_sigla}
                    </span>
                  )}
                </div>
                <p className="text-[13px] text-zinc-500 line-through">{p.texto}</p>
              </div>

              <div className="flex items-center gap-1.5 text-[12px] text-zinc-400 shrink-0">
                <Clock className="h-3.5 w-3.5" />
                {p.respondida_em
                  ? `Remove em: ${calcularTempoRestante(p.respondida_em)}`
                  : "Processando..."}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}