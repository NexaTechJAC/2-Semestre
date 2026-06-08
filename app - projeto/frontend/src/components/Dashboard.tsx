import { useState, useEffect, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

type LogNavegacao = {
  id: number;
  acao: string;
  satisfacao: string | null;
  acessado_em: string;
  curso: { sigla: string } | null;
  topico: { chave: string } | null;
};

type DadoGrafico = {
  nome: string;
  total: number;
};

const CORES = ["#dc2626", "#991b1b", "#f87171", "#fca5a5", "#7f1d1d"];

function processarTopicosMaisAcessados(logs: LogNavegacao[]): DadoGrafico[] {
  const contagem: Record<string, number> = {};
  logs.forEach(log => {
    if (!log.topico) return;
    const chave = `${log.curso?.sigla ?? "?"} > ${log.topico.chave}`;
    contagem[chave] = (contagem[chave] ?? 0) + 1;
  });
  return Object.entries(contagem)
    .map(([nome, total]) => ({ nome, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);
}

function processarSatisfacao(logs: LogNavegacao[]): DadoGrafico[] {
  const comSatisfacao = logs.filter(l => l.satisfacao);
  const gostei = comSatisfacao.filter(l => l.satisfacao === "gostei").length;
  const naoGostei = comSatisfacao.filter(l => l.satisfacao === "nao_gostei").length;

  if (comSatisfacao.length === 0) return [];

  return [
    { nome: "👍 Resolveu", total: gostei },
    { nome: "👎 Não resolveu", total: naoGostei },
  ];
}

function processarAcessosPorCurso(logs: LogNavegacao[]): DadoGrafico[] {
  const contagem: Record<string, number> = {};
  logs.forEach(log => {
    const sigla = log.curso?.sigla ?? "Desconhecido";
    contagem[sigla] = (contagem[sigla] ?? 0) + 1;
  });
  return Object.entries(contagem)
    .map(([nome, total]) => ({ nome, total }))
    .sort((a, b) => b.total - a.total);
}

function processarAcessosPorDia(logs: LogNavegacao[]): DadoGrafico[] {
  const contagem: Record<string, number> = {};
  logs.forEach(log => {
    const dia = new Date(log.acessado_em).toLocaleDateString("pt-BR");
    contagem[dia] = (contagem[dia] ?? 0) + 1;
  });
  return Object.entries(contagem)
    .map(([nome, total]) => ({ nome, total }))
    .slice(-7);
}

function CardEstatistica({ titulo, valor, descricao }: {
  titulo: string;
  valor: number | string;
  descricao: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <p className="text-[12px] font-bold uppercase tracking-wider text-zinc-400">
        {titulo}
      </p>
      <p className="mt-1 text-3xl font-black text-zinc-900">{valor}</p>
      <p className="mt-1 text-[13px] text-zinc-500">{descricao}</p>
    </div>
  );
}

export default function Dashboard() {
  const [logs, setLogs] = useState<LogNavegacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const token = localStorage.getItem("authToken");

  const carregarLogs = useCallback(async () => {
    setLoading(true);
    setErro(null);
    try {
      const userRole = localStorage.getItem("userRole");
      const rotaLogs = userRole === "administrador"
        ? `${API}/api/admin/logs`
        : `${API}/api/secretaria/logs`;

      const res = await fetch(rotaLogs, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erro ao carregar dados.");
      const data = await res.json();
      setLogs(data);
      setLoading(false);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro desconhecido.");
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    carregarLogs();
  }, [carregarLogs]);

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">
        Carregando estatísticas...
      </div>
    );
  }

  if (erro) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 font-semibold">{erro}</p>
          <button
            onClick={carregarLogs}
            className="mt-3 px-4 py-1.5 bg-red-600 text-white rounded text-sm hover:bg-red-700"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  const topicosMaisAcessados = processarTopicosMaisAcessados(logs);
  const satisfacao = processarSatisfacao(logs);
  const acessosPorCurso = processarAcessosPorCurso(logs);
  const acessosPorDia = processarAcessosPorDia(logs);

  const totalAcessos = logs.length;
  const totalGostei = logs.filter(l => l.satisfacao === "gostei").length;
  const totalNaoGostei = logs.filter(l => l.satisfacao === "nao_gostei").length;
  const taxaSatisfacao = totalGostei + totalNaoGostei > 0
    ? Math.round((totalGostei / (totalGostei + totalNaoGostei)) * 100)
    : 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-zinc-900 uppercase">
          Dashboard
        </h2>
        <button
          onClick={carregarLogs}
          className="text-sm text-zinc-500 hover:text-zinc-800 border border-zinc-300 rounded-lg px-3 py-1.5 hover:bg-zinc-50 transition"
        >
          Atualizar
        </button>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <CardEstatistica
          titulo="Total de Acessos"
          valor={totalAcessos}
          descricao="Interações registradas"
        />
        <CardEstatistica
          titulo="Taxa de Satisfação"
          valor={`${taxaSatisfacao}%`}
          descricao="Respostas avaliadas"
        />
        <CardEstatistica
          titulo="Resolvidos"
          valor={totalGostei}
          descricao="👍 Dúvidas resolvidas"
        />
        <CardEstatistica
          titulo="Não Resolvidos"
          valor={totalNaoGostei}
          descricao="👎 Encaminhados à secretaria"
        />
      </div>

      {/* Gráfico: Acessos por dia */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h3 className="text-[15px] font-bold text-zinc-800 mb-6">
          Acessos por Dia (últimos 7 dias)
        </h3>
        {acessosPorDia.length === 0 ? (
          <p className="text-center text-zinc-400 py-8">Sem dados disponíveis.</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={acessosPorDia} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
              <XAxis dataKey="nome" tick={{ fontSize: 12, fill: "#71717a" }} />
              <YAxis tick={{ fontSize: 12, fill: "#71717a" }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: "1px solid #e4e4e7", fontSize: 13 }}
              />
              <Bar dataKey="total" fill="#dc2626" radius={[6, 6, 0, 0]} name="Acessos" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico: Tópicos mais acessados */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h3 className="text-[15px] font-bold text-zinc-800 mb-6">
            Tópicos Mais Acessados
          </h3>
          {topicosMaisAcessados.length === 0 ? (
            <p className="text-center text-zinc-400 py-8">Sem dados disponíveis.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={topicosMaisAcessados}
                layout="vertical"
                margin={{ top: 0, right: 10, left: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                <XAxis type="number" tick={{ fontSize: 12, fill: "#71717a" }} allowDecimals={false} />
                <YAxis
                  dataKey="nome"
                  type="category"
                  tick={{ fontSize: 11, fill: "#71717a" }}
                  width={110}
                />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "1px solid #e4e4e7", fontSize: 13 }}
                />
                <Bar dataKey="total" fill="#dc2626" radius={[0, 6, 6, 0]} name="Acessos" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Gráfico: Satisfação */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h3 className="text-[15px] font-bold text-zinc-800 mb-6">
            Satisfação dos Usuários
          </h3>
          {satisfacao.length === 0 ? (
            <p className="text-center text-zinc-400 py-8">
              Nenhuma avaliação registrada ainda.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={satisfacao}
                  dataKey="total"
                  nameKey="nome"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ nome, percent }) =>
                    `${nome} (${(percent * 100).toFixed(0)}%)`
                  }
                  labelLine={true}
                >
                  {satisfacao.map((_, index) => (
                    <Cell key={index} fill={CORES[index % CORES.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "1px solid #e4e4e7", fontSize: 13 }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Gráfico: Acessos por curso */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h3 className="text-[15px] font-bold text-zinc-800 mb-6">
          Acessos por Curso
        </h3>
        {acessosPorCurso.length === 0 ? (
          <p className="text-center text-zinc-400 py-8">Sem dados disponíveis.</p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={acessosPorCurso} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
              <XAxis dataKey="nome" tick={{ fontSize: 13, fill: "#71717a" }} />
              <YAxis tick={{ fontSize: 12, fill: "#71717a" }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: "1px solid #e4e4e7", fontSize: 13 }}
              />
              <Bar dataKey="total" radius={[6, 6, 0, 0]} name="Acessos">
                {acessosPorCurso.map((_, index) => (
                  <Cell key={index} fill={CORES[index % CORES.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}