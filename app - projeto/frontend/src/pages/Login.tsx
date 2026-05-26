import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, GraduationCap, Shield, Mail, Lock, Eye, EyeOff} from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit( event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    setMensagem("");
    setCarregando(true);

    try {
      const resposta = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password: senha,
          }),
        }
      );

      const dados = await resposta.json();

      if (!resposta.ok) {
        setMensagem(dados?.error ?? "Falha ao fazer login.");
        return;
      }

      // Salvar token e informações do usuário
      localStorage.setItem("authToken", dados.token);
      localStorage.setItem("userRole", dados.perfil || dados.usuario?.perfil);
      localStorage.setItem("usuario", JSON.stringify(dados.usuario));

      setMensagem(`Login realizado com sucesso. Bem-vindo, ${dados.usuario?.nome || dados.name}!`);

      // Redirecionar baseado no perfil
      if (dados.perfil === "administrador" || dados.usuario?.perfil === "administrador") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch {
      setMensagem("Não foi possível conectar ao servidor.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Gradiente de fundo */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.12),_transparent_70%)]" />

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 px-6 py-4">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-sm text-zinc-300 hover:text-white transition"
        >
          <ArrowLeft size={18} />
          Voltar ao Portal
        </button>
      </header>

      {/* Conteúdo */}
      <section className="relative z-10 flex flex-col items-center justify-center px-4 py-12">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-600 shadow-lg shadow-red-600/30">
            <GraduationCap size={32} />
          </div>

          <h1 className="text-3xl font-bold">
            Portal Acadêmico
          </h1>

          <p className="text-sm text-zinc-400">
            Acesso Administrativo
          </p>
        </div>

        {/* Card */}
        <div className="w-full max-w-md rounded-2xl bg-zinc-100 p-8 text-black shadow-2xl">
          {/* Cabeçalho */}
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-red-700 text-white">
              <Shield size={24} />
            </div>

            <div>
              <h2 className="font-bold">
                Área do Administrador
              </h2>

              <p className="text-sm text-zinc-600">
                Acesso restrito
              </p>
            </div>
          </div>

          <div className="my-6 border-t border-zinc-300" />

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Email institucional
              </label>

              <div className="flex items-center rounded-lg border border-zinc-300 bg-white px-3">
                <Mail size={18} className="text-zinc-400" />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@edu.br"
                  className="w-full bg-transparent px-3 py-3 outline-none"
                  required
                />
              </div>
            </div>

            {/* Senha */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Senha
              </label>

              <div className="flex items-center rounded-lg border border-zinc-300 bg-white px-3">
                <Lock size={18} className="text-zinc-400" />

                <input
                  type={mostrarSenha ? "text" : "password"}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Digite sua senha"
                  className="w-full bg-transparent px-3 py-3 outline-none"
                  required
                />

                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="text-zinc-400hover:text-zinc-700 transition"
                >
                  {mostrarSenha ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Extras */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" />
                Lembrar de mim
              </label>

              <button
                type="button"
                className="font-medium hover:text-red-700"
              >
                Esqueci a senha
              </button>
            </div>

            {/* Botão */}
            <button
              type="submit"
              disabled={carregando}
              className="w-full rounded-lg bg-red-600 py-3 font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
            >
              {carregando ? "Entrando..." : "Entrar"}
            </button>
          </form>

          {/* Mensagem */}
          {mensagem && (
            <p className="mt-4 text-sm text-center text-zinc-700">
              {mensagem}
            </p>
          )}
        </div>

        {/* Footer */}
        <p className="mt-6 text-sm text-zinc-400">
          Acesso exclusivo para funcionários autorizados.
        </p>
      </section>
    </main>
  );
}