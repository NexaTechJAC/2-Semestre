import { useMemo } from "react";

type LogLocal = {
  id: number;
  aluno: string;
  trilha: string;
  satisfacao: "👍" | "👎";
  dataHora: string;
};

function formatarDataHora(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("pt-BR");
}

export default function LogsNavegacao() {
  const logs = useMemo<LogLocal[]>(() => {
    try {
      const raw = localStorage.getItem("logsTrilhaUsuario");
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-black text-zinc-900 uppercase">Logs de Navegação</h2>

      <div className="overflow-x-auto rounded-xl border border-zinc-200">
        <table className="min-w-full text-sm">
          <thead className="bg-zinc-100">
            <tr>
              <th className="px-4 py-3 text-left font-bold text-zinc-700">Aluno</th>
              <th className="px-4 py-3 text-left font-bold text-zinc-700">Trilha</th>
              <th className="px-4 py-3 text-left font-bold text-zinc-700">Satisfação</th>
              <th className="px-4 py-3 text-left font-bold text-zinc-700">Data/Hora</th>
            </tr>
          </thead>

          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-zinc-500">
                  Nenhum log de trilha encontrado.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="border-t border-zinc-200">
                  <td className="px-4 py-3 font-medium text-zinc-700">{log.aluno}</td>
                  <td className="px-4 py-3 font-semibold text-zinc-900">{log.trilha}</td>
                  <td className="px-4 py-3 text-xl">{log.satisfacao}</td>
                  <td className="px-4 py-3 text-zinc-600">{formatarDataHora(log.dataHora)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}