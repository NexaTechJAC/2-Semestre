import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  ChevronLeft,
  ChevronRight,
  KeyRound,
  Pencil,
  Power,
  Search,
  UserRound,
  X,
} from "lucide-react";
import {
  ApiRequestError,
  atualizarStatusMembroSecretaria,
  criarMembroSecretaria,
  editarMembroSecretaria,
  fetchMembrosSecretaria,
  resetarSenhaMembroSecretaria,
  type MembroSecretaria,
} from "../data/api";

type Perfil = "secretaria" | "administrador";
type ModalModo = "criar" | "editar" | "senha" | null;

type FormMembro = {
  nome: string;
  email: string;
  senha: string;
  perfil: Perfil;
};

const estadoInicialForm: FormMembro = {
  nome: "",
  email: "",
  senha: "",
  perfil: "secretaria",
};

function mensagemErro(error: unknown, fallback: string) {
  if (!(error instanceof ApiRequestError)) {
    return error instanceof Error ? error.message : fallback;
  }

  const mensagensPorCodigo: Record<string, string> = {
    EMAIL_ALREADY_EXISTS: "Este email já está cadastrado.",
    LAST_ADMIN_PROTECTED: "Não é possível desativar ou rebaixar o último administrador ativo.",
    SELF_DEACTIVATION_FORBIDDEN: "Você não pode desativar o próprio usuário.",
    SELF_ROLE_DOWNGRADE_FORBIDDEN: "Você não pode remover o próprio perfil de administrador.",
    MEMBER_NOT_FOUND: "Membro não encontrado.",
    NETWORK_ERROR: "Não foi possível conectar ao servidor.",
  };

  if (error.code === "PASSWORD_CHANGE_REQUIRED") {
    window.location.assign("/trocar-senha");
  }

  return (
    (error.code ? mensagensPorCodigo[error.code] : undefined) ??
    error.details?.[0]?.message ??
    error.message ??
    fallback
  );
}

export default function MembrosSecretaria() {
  const [membros, setMembros] = useState<MembroSecretaria[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [pagina, setPagina] = useState(1);
  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState<"todos" | "ativos" | "inativos">("todos");
  const [perfil, setPerfil] = useState<"todos" | Perfil>("todos");
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [processandoId, setProcessandoId] = useState<number | null>(null);

  const [modalModo, setModalModo] = useState<ModalModo>(null);
  const [membroSelecionado, setMembroSelecionado] = useState<MembroSecretaria | null>(null);
  const [form, setForm] = useState<FormMembro>(estadoInicialForm);
  const [confirmacaoSenha, setConfirmacaoSenha] = useState("");
  const [saving, setSaving] = useState(false);

  const totalTexto = useMemo(
    () => (total === 1 ? "1 usuário cadastrado" : `${total} usuários cadastrados`),
    [total]
  );

  const carregarMembros = useCallback(async () => {
    try {
      setLoading(true);
      setErro("");

      const response = await fetchMembrosSecretaria({
        search: busca,
        ativo: status === "todos" ? undefined : status === "ativos",
        perfil: perfil === "todos" ? undefined : perfil,
        page: pagina,
        limit: 8,
      });

      setMembros(response.data);
      setTotal(response.meta?.total ?? response.total ?? response.data.length);
      setTotalPaginas(response.meta?.total_pages ?? 1);
    } catch (error) {
      setErro(mensagemErro(error, "Erro ao carregar membros."));
    } finally {
      setLoading(false);
    }
  }, [busca, pagina, perfil, status]);

  useEffect(() => {
    const timer = window.setTimeout(carregarMembros, 350);
    return () => window.clearTimeout(timer);
  }, [carregarMembros]);

  function limparAvisos() {
    setMensagem("");
    setErro("");
  }

  function abrirModalCriar() {
    limparAvisos();
    setMembroSelecionado(null);
    setForm(estadoInicialForm);
    setConfirmacaoSenha("");
    setModalModo("criar");
  }

  function abrirModalEditar(membro: MembroSecretaria) {
    limparAvisos();
    setMembroSelecionado(membro);
    setForm({
      nome: membro.nome,
      email: membro.email,
      senha: "",
      perfil: membro.perfil,
    });
    setModalModo("editar");
  }

  function abrirModalSenha(membro: MembroSecretaria) {
    limparAvisos();
    setMembroSelecionado(membro);
    setForm({ ...estadoInicialForm, senha: "" });
    setConfirmacaoSenha("");
    setModalModo("senha");
  }

  function fecharModal() {
    setModalModo(null);
    setMembroSelecionado(null);
    setForm(estadoInicialForm);
    setConfirmacaoSenha("");
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (modalModo === "senha" && form.senha !== confirmacaoSenha) {
      setErro("As senhas informadas não coincidem.");
      return;
    }

    try {
      setSaving(true);
      limparAvisos();

      if (modalModo === "criar") {
        await criarMembroSecretaria({
          nome: form.nome.trim(),
          email: form.email.trim(),
          senha: form.senha,
          perfil: form.perfil,
        });
        setMensagem("Membro adicionado com sucesso. A troca de senha será exigida no primeiro login.");
      }

      if (modalModo === "editar" && membroSelecionado) {
        await editarMembroSecretaria(membroSelecionado.id, {
          nome: form.nome.trim(),
          email: form.email.trim(),
          perfil: form.perfil,
        });
        setMensagem("Membro atualizado com sucesso.");
      }

      if (modalModo === "senha" && membroSelecionado) {
        await resetarSenhaMembroSecretaria(membroSelecionado.id, form.senha);
        setMensagem(`Senha de ${membroSelecionado.nome} redefinida com sucesso.`);
      }

      fecharModal();
      await carregarMembros();
    } catch (error) {
      setErro(mensagemErro(error, "Erro ao salvar membro."));
    } finally {
      setSaving(false);
    }
  }

  async function alternarStatus(membro: MembroSecretaria) {
    const acao = membro.ativo ? "inativar" : "ativar";
    if (!window.confirm(`Deseja ${acao} ${membro.nome}?`)) return;

    try {
      setProcessandoId(membro.id);
      limparAvisos();
      await atualizarStatusMembroSecretaria(membro.id, !membro.ativo);
      setMensagem(`Membro ${membro.ativo ? "inativado" : "ativado"} com sucesso.`);
      await carregarMembros();
    } catch (error) {
      setErro(mensagemErro(error, `Erro ao ${acao} membro.`));
    } finally {
      setProcessandoId(null);
    }
  }

  function alterarBusca(valor: string) {
    setBusca(valor);
    setPagina(1);
  }

  return (
    <section className="min-h-screen bg-white text-zinc-900">
      <header className="flex flex-col gap-3 border-b-[6px] border-zinc-900 bg-white px-14 py-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <div>
            <h2 className="text-[24px] font-black leading-none">MEMBROS</h2>
            <p className="pt-1 text-xs font-bold text-red-500">{totalTexto}</p>
          </div>
        </div>

        <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center">
          <div className="relative w-full md:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={busca}
              onChange={(event) => alterarBusca(event.target.value)}
              placeholder="Buscar por nome ou email..."
              className="h-10 w-full rounded-lg border border-zinc-300 bg-zinc-100 pl-9 pr-3 text-sm text-zinc-800 outline-none transition focus:border-red-600 focus:bg-white"
            />
          </div>

          <button
            type="button"
            onClick={abrirModalCriar}
            className="h-10 rounded-md bg-red-600 px-5 text-sm font-bold text-white transition hover:bg-red-700"
          >
            + Adicionar
          </button>
        </div>
      </header>

      <div className="flex flex-wrap gap-2 px-4 pt-4">
        <select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as typeof status);
            setPagina(1);
          }}
          className="h-9 rounded-lg border border-zinc-300 bg-white px-3 text-sm font-semibold outline-none focus:border-red-600"
        >
          <option value="todos">Todos os status</option>
          <option value="ativos">Ativos</option>
          <option value="inativos">Inativos</option>
        </select>

        <select
          value={perfil}
          onChange={(event) => {
            setPerfil(event.target.value as typeof perfil);
            setPagina(1);
          }}
          className="h-9 rounded-lg border border-zinc-300 bg-white px-3 text-sm font-semibold outline-none focus:border-red-600"
        >
          <option value="todos">Todos os perfis</option>
          <option value="secretaria">Secretaria</option>
          <option value="administrador">Administrador</option>
        </select>
      </div>

      {mensagem && (
        <p className="mx-4 mt-4 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
          {mensagem}
        </p>
      )}

      {erro && (
        <p className="mx-4 mt-4 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
          {erro}
        </p>
      )}

      <div className="p-4">
        <div className="overflow-x-auto rounded-2xl border border-zinc-600 bg-white">
          <table className="min-w-full text-sm">
            <thead className="border-b border-zinc-500 bg-zinc-50">
              <tr>
                <th className="px-5 py-3 text-left font-bold">Usuários</th>
                <th className="px-5 py-3 text-left font-bold">Status</th>
                <th className="px-5 py-3 text-right font-bold">Ações</th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan={3} className="px-5 py-8 text-center text-zinc-600">
                    Carregando membros...
                  </td>
                </tr>
              )}

              {!loading && membros.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-5 py-8 text-center text-zinc-600">
                    Nenhum membro encontrado.
                  </td>
                </tr>
              )}

              {!loading &&
                membros.map((membro) => (
                  <tr key={membro.id} className="border-b border-zinc-300 last:border-b-0">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-zinc-700">
                          <UserRound size={17} />
                        </span>
                        <div>
                          <p className="font-bold">{membro.nome}</p>
                          <p className="text-xs text-zinc-500">
                            {membro.email} · {membro.perfil === "administrador" ? "Administrador" : "Secretaria"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex rounded-full px-4 py-1 text-xs font-black ${
                          membro.ativo
                            ? "bg-[#36ef68] text-zinc-900"
                            : "bg-red-500 text-white"
                        }`}
                      >
                        {membro.ativo ? "Ativo" : "Inativo"}
                      </span>
                    </td>

                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-3 pr-1 text-zinc-700">
                        <button
                          type="button"
                          onClick={() => abrirModalEditar(membro)}
                          className="rounded-md p-1.5 transition hover:bg-zinc-100 hover:text-zinc-950"
                          title="Editar membro"
                        >
                          <Pencil size={15} />
                        </button>

                        <button
                          type="button"
                          onClick={() => abrirModalSenha(membro)}
                          className="rounded-md p-1.5 transition hover:bg-amber-50 hover:text-amber-700"
                          title="Redefinir senha"
                        >
                          <KeyRound size={15} />
                        </button>

                        <button
                          type="button"
                          disabled={processandoId === membro.id}
                          onClick={() => alternarStatus(membro)}
                          className={`rounded-md p-1.5 transition disabled:opacity-40 ${
                            membro.ativo
                              ? "hover:bg-red-50 hover:text-red-700"
                              : "hover:bg-emerald-50 hover:text-emerald-700"
                          }`}
                          title={membro.ativo ? "Inativar membro" : "Ativar membro"}
                        >
                          <Power size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {totalPaginas > 1 && (
          <div className="mt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              disabled={pagina === 1 || loading}
              onClick={() => setPagina((atual) => atual - 1)}
              className="rounded-lg border border-zinc-300 p-2 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Página anterior"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-semibold text-zinc-600">
              Página {pagina} de {totalPaginas}
            </span>
            <button
              type="button"
              disabled={pagina === totalPaginas || loading}
              onClick={() => setPagina((atual) => atual + 1)}
              className="rounded-lg border border-zinc-300 p-2 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Próxima página"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {modalModo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <form onSubmit={onSubmit} className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-black text-zinc-900">
                {modalModo === "criar" && "Adicionar membro"}
                {modalModo === "editar" && "Editar membro"}
                {modalModo === "senha" && "Redefinir senha"}
              </h3>
              <button
                type="button"
                onClick={fecharModal}
                className="text-zinc-500 transition hover:text-zinc-800"
                aria-label="Fechar"
              >
                <X size={20} />
              </button>
            </div>

            {modalModo === "senha" ? (
              <div className="space-y-3">
                <p className="text-sm text-zinc-600">
                  Defina uma senha temporária para <strong>{membroSelecionado?.nome}</strong>.
                  A troca será exigida no próximo login.
                </p>
                <CampoSenha
                  label="Nova senha temporária"
                  value={form.senha}
                  onChange={(senha) => setForm((atual) => ({ ...atual, senha }))}
                />
                <CampoSenha
                  label="Confirmar nova senha"
                  value={confirmacaoSenha}
                  onChange={setConfirmacaoSenha}
                />
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-sm font-bold text-zinc-700">Nome</label>
                  <input
                    type="text"
                    required
                    maxLength={120}
                    value={form.nome}
                    onChange={(event) =>
                      setForm((atual) => ({ ...atual, nome: event.target.value }))
                    }
                    className="h-10 w-full rounded-lg border border-zinc-300 px-3 outline-none transition focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-bold text-zinc-700">Email</label>
                  <input
                    type="email"
                    required
                    maxLength={160}
                    value={form.email}
                    onChange={(event) =>
                      setForm((atual) => ({ ...atual, email: event.target.value }))
                    }
                    className="h-10 w-full rounded-lg border border-zinc-300 px-3 outline-none transition focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-bold text-zinc-700">
                    Perfil de acesso
                  </label>
                  <select
                    value={form.perfil}
                    onChange={(event) =>
                      setForm((atual) => ({
                        ...atual,
                        perfil: event.target.value as Perfil,
                      }))
                    }
                    className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 outline-none transition focus:border-red-500"
                  >
                    <option value="secretaria">Secretaria</option>
                    <option value="administrador">Administrador</option>
                  </select>
                </div>

                {modalModo === "criar" && (
                  <CampoSenha
                    label="Senha temporária"
                    value={form.senha}
                    onChange={(senha) => setForm((atual) => ({ ...atual, senha }))}
                  />
                )}
              </div>
            )}

            {erro && (
              <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                {erro}
              </p>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={fecharModal}
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-bold text-zinc-700 transition hover:bg-zinc-100"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

function CampoSenha({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-bold text-zinc-700">{label}</label>
      <input
        type="password"
        required
        minLength={6}
        maxLength={100}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-lg border border-zinc-300 px-3 outline-none transition focus:border-red-500"
      />
      <p className="mt-1 text-xs text-zinc-500">Use pelo menos 6 caracteres.</p>
    </div>
  );
}
