import { useState } from "react";
import type { FormEvent } from "react";
import { Eye, EyeOff, KeyRound, LogOut, ShieldCheck } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { ApiRequestError, trocarSenhaPrimeiroAcesso } from "../data/api";

export default function TrocarSenhaPrimeiroAcesso() {
  const navigate = useNavigate();
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [mostrarSenhas, setMostrarSenhas] = useState(false);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  const token = localStorage.getItem("authToken");
  const trocaObrigatoria = localStorage.getItem("mustChangePassword") === "true";

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!trocaObrigatoria) {
    const destino = localStorage.getItem("userRole") === "administrador" ? "/admin" : "/";
    return <Navigate to={destino} replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");

    if (novaSenha !== confirmacao) {
      setErro("A confirmação deve ser igual à nova senha.");
      return;
    }

    if (senhaAtual === novaSenha) {
      setErro("A nova senha deve ser diferente da senha temporária.");
      return;
    }

    try {
      setSalvando(true);
      await trocarSenhaPrimeiroAcesso({ senhaAtual, novaSenha });
      localStorage.setItem("mustChangePassword", "false");

      const destino = localStorage.getItem("userRole") === "administrador" ? "/admin" : "/";
      navigate(destino, { replace: true });
    } catch (error) {
      if (error instanceof ApiRequestError) {
        setErro(
          error.code === "INVALID_CURRENT_PASSWORD"
            ? "A senha temporária está incorreta."
            : error.details?.[0]?.message ?? error.message
        );
      } else {
        setErro("Não foi possível alterar a senha.");
      }
    } finally {
      setSalvando(false);
    }
  }

  function sair() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("usuario");
    localStorage.removeItem("mustChangePassword");
    navigate("/login", { replace: true });
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950 px-4 py-10 text-zinc-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(220,38,38,0.28),_transparent_42%),radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.12),_transparent_38%)]" />

      <section className="relative w-full max-w-md rounded-2xl bg-white p-7 shadow-2xl">
        <div className="mb-6 flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-600 text-white">
            <ShieldCheck size={24} />
          </span>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-red-600">
              Primeiro acesso
            </p>
            <h1 className="mt-1 text-2xl font-black">Crie sua nova senha</h1>
            <p className="mt-1 text-sm text-zinc-600">
              Por segurança, a senha temporária precisa ser substituída antes de acessar o portal.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <CampoSenha
            label="Senha temporária"
            value={senhaAtual}
            onChange={setSenhaAtual}
            mostrar={mostrarSenhas}
          />
          <CampoSenha
            label="Nova senha"
            value={novaSenha}
            onChange={setNovaSenha}
            mostrar={mostrarSenhas}
          />
          <CampoSenha
            label="Confirmar nova senha"
            value={confirmacao}
            onChange={setConfirmacao}
            mostrar={mostrarSenhas}
          />

          <button
            type="button"
            onClick={() => setMostrarSenhas((atual) => !atual)}
            className="flex items-center gap-2 text-sm font-semibold text-zinc-600 transition hover:text-zinc-950"
          >
            {mostrarSenhas ? <EyeOff size={16} /> : <Eye size={16} />}
            {mostrarSenhas ? "Ocultar senhas" : "Mostrar senhas"}
          </button>

          {erro && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
              {erro}
            </p>
          )}

          <button
            type="submit"
            disabled={salvando}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 py-3 font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <KeyRound size={18} />
            {salvando ? "Alterando..." : "Alterar senha e continuar"}
          </button>
        </form>

        <button
          type="button"
          onClick={sair}
          className="mt-4 flex w-full items-center justify-center gap-2 text-sm font-semibold text-zinc-500 transition hover:text-zinc-900"
        >
          <LogOut size={16} />
          Sair e voltar ao login
        </button>
      </section>
    </main>
  );
}

function CampoSenha({
  label,
  value,
  onChange,
  mostrar,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  mostrar: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-bold text-zinc-700">{label}</label>
      <input
        type={mostrar ? "text" : "password"}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        minLength={6}
        maxLength={100}
        required
        className="h-11 w-full rounded-lg border border-zinc-300 px-3 outline-none transition focus:border-red-600 focus:ring-2 focus:ring-red-100"
      />
    </div>
  );
}
