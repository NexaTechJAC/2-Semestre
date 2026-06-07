import { useState, useEffect, useCallback } from "react";
import { UserPlus, Trash2, ShieldCheck, ShieldOff } from "lucide-react";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

type Usuario = {
  id: number;
  nome: string;
  email: string;
  perfil: "administrador" | "secretaria";
  ativo: boolean;
  criado_em: string;
};

type FormData = {
  nome: string;
  email: string;
  senha: string;
  perfil: "administrador" | "secretaria";
};

const formInicial: FormData = {
  nome: "",
  email: "",
  senha: "",
  perfil: "secretaria",
};

export default function Membros() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState<FormData>(formInicial);
  const [salvando, setSalvando] = useState(false);
  const [removendo, setRemovendo] = useState<number | null>(null);
  const [erroForm, setErroForm] = useState("");

  const token = localStorage.getItem("authToken");

  const carregarUsuarios = useCallback(async () => {
    try {
      setErro(null);
      const res = await fetch(`${API}/api/admin/usuarios`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erro ao carregar membros.");
      const data = await res.json();
      setUsuarios(data);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro desconhecido.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    carregarUsuarios();
  }, [carregarUsuarios]);

  async function handleCadastrar(e: React.FormEvent) {
    e.preventDefault();
    setErroForm("");
    setSalvando(true);

    try {
      const res = await fetch(`${API}/api/admin/usuarios`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setErroForm(data.error ?? "Erro ao cadastrar membro.");
        return;
      }

      setForm(formInicial);
      setMostrarForm(false);
      await carregarUsuarios();
    } catch {
      setErroForm("Não foi possível conectar ao servidor.");
    } finally {
      setSalvando(false);
    }
  }

  async function handleRemover(id: number) {
    if (!confirm("Deseja desativar este membro?")) return;
    setRemovendo(id);

    try {
      const res = await fetch(`${API}/api/admin/usuarios/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Erro ao desativar membro.");
      await carregarUsuarios();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao desativar.");
    } finally {
      setRemovendo(null);
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">Carregando membros...</div>
    );
  }

  if (erro) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 font-semibold">{erro}</p>
          <button
            onClick={carregarUsuarios}
            className="mt-3 px-4 py-1.5 bg-red-600 text-white rounded text-sm hover:bg-red-700"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  const ativos = usuarios.filter(u => u.ativo);
  const inativos = usuarios.filter(u => !u.ativo);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-zinc-900 uppercase">Membros</h2>
        <button
          onClick={() => { setMostrarForm(v => !v); setErroForm(""); }}
          className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-[13px] font-bold text-white hover:bg-red-700 transition"
        >
          <UserPlus className="h-4 w-4" />
          Novo Membro
        </button>
      </div>

      {/* Formulário de cadastro */}
      {mostrarForm && (
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h3 className="text-[15px] font-bold text-zinc-800 mb-4">
            Cadastrar Novo Membro
          </h3>

          <form onSubmit={handleCadastrar} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-zinc-700">
                  Nome Completo
                </label>
                <input
                  required
                  type="text"
                  value={form.nome}
                  onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                  placeholder="Nome do membro"
                  className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-2.5 text-[14px] text-zinc-800 focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-zinc-700">
                  E-mail Institucional
                </label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="email@fatec.sp.gov.br"
                  className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-2.5 text-[14px] text-zinc-800 focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-zinc-700">
                  Senha
                </label>
                <input
                  required
                  type="password"
                  value={form.senha}
                  onChange={e => setForm(f => ({ ...f, senha: e.target.value }))}
                  placeholder="Senha de acesso"
                  minLength={6}
                  className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-2.5 text-[14px] text-zinc-800 focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-zinc-700">
                  Perfil de Acesso
                </label>
                <select
                  value={form.perfil}
                  onChange={e => setForm(f => ({ ...f, perfil: e.target.value as FormData["perfil"] }))}
                  className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-2.5 text-[14px] text-zinc-800 focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 transition"
                >
                  <option value="secretaria">Secretaria</option>
                  <option value="administrador">Administrador</option>
                </select>
              </div>
            </div>

            {erroForm && (
              <p className="text-[13px] font-medium text-red-600 bg-red-50 rounded-xl px-4 py-2.5">
                {erroForm}
              </p>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setMostrarForm(false); setForm(formInicial); setErroForm(""); }}
                className="rounded-xl px-5 py-2.5 text-[14px] font-medium text-zinc-600 hover:bg-zinc-100 transition"
                disabled={salvando}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={salvando}
                className="rounded-xl bg-red-600 px-6 py-2.5 text-[14px] font-bold text-white hover:bg-red-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {salvando ? "Cadastrando..." : "Cadastrar"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de membros ativos */}
      <div className="space-y-3">
        <h3 className="text-[13px] font-bold uppercase tracking-wider text-zinc-500">
          Membros Ativos ({ativos.length})
        </h3>

        {ativos.length === 0 ? (
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-6 py-8 text-center text-zinc-500">
            Nenhum membro ativo.
          </div>
        ) : (
          ativos.map(u => (
            <div
              key={u.id}
              className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4"
            >
              <div className="flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[15px] font-bold text-zinc-900">{u.nome}</span>
                  <span className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                    u.perfil === "administrador"
                      ? "bg-red-100 text-red-700"
                      : "bg-blue-100 text-blue-700"
                  }`}>
                    {u.perfil === "administrador"
                      ? <><ShieldCheck className="h-3 w-3" /> Administrador</>
                      : <><ShieldOff className="h-3 w-3" /> Secretaria</>
                    }
                  </span>
                </div>
                <p className="text-[13px] text-zinc-500">{u.email}</p>
                <p className="text-[12px] text-zinc-400">
                  Cadastrado em: {new Date(u.criado_em).toLocaleDateString("pt-BR")}
                </p>
              </div>

              <button
                onClick={() => handleRemover(u.id)}
                disabled={removendo === u.id}
                className="flex items-center gap-2 rounded-xl border border-zinc-200 px-4 py-2 text-[13px] font-medium text-zinc-500 hover:border-red-300 hover:text-red-600 hover:bg-red-50 transition disabled:opacity-60 shrink-0"
              >
                <Trash2 className="h-4 w-4" />
                {removendo === u.id ? "Removendo..." : "Desativar"}
              </button>
            </div>
          ))
        )}
      </div>

      {/* Lista de membros inativos */}
      {inativos.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-[13px] font-bold uppercase tracking-wider text-zinc-400">
            Membros Inativos ({inativos.length})
          </h3>
          {inativos.map(u => (
            <div
              key={u.id}
              className="rounded-xl border border-zinc-100 bg-zinc-50 p-5 flex flex-col sm:flex-row sm:items-center gap-4 opacity-50"
            >
              <div className="flex-1 space-y-1">
                <span className="text-[14px] font-bold text-zinc-500 line-through">{u.nome}</span>
                <p className="text-[13px] text-zinc-400">{u.email}</p>
              </div>
              <span className="text-[12px] text-zinc-400 shrink-0">Desativado</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}