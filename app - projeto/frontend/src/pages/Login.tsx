import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    setMensagem("");
    setCarregando(true);

    try {
      const resposta = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password: senha,
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        setMensagem(dados?.error ?? "Falha ao fazer login.");
        return;
      }

      setMensagem(`Login realizado com sucesso. Bem-vindo, ${dados.user.name}!`);
    } catch {
      setMensagem("Não foi possível conectar ao servidor.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-100 flex items-center justify-center p-4">
      <section className="relative w-full max-w-md bg-white rounded-xl shadow p-6">
        <button
          onClick={() => navigate("/")}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700 transition"
        >
          ✕
        </button>

        <h1 className="text-2xl font-bold mb-1">Login</h1>
        <p className="text-sm text-zinc-600 mb-6">
          Acesse com seu e-mail e senha.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium">E-mail</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-red-500"
              placeholder="seu.email@fatec.sp.gov.br"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Senha</span>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Digite sua senha"
              required
            />
          </label>

          <button
            type="submit"
            disabled={carregando}
            className="w-full rounded-md bg-red-600 py-2 text-white font-semibold hover:bg-red-700 transition disabled:opacity-60"
          >
            {carregando ? "Entrando..." : "Entrar"}
          </button>
        </form>

        {mensagem && (
          <p className="mt-4 text-sm text-zinc-700">{mensagem}</p>
        )}
      </section>
    </main>
  );
} 