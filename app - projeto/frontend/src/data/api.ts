import type { Curso, Topico, RespostaTopico } from "../types";

export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export async function fetchCursos(): Promise<Curso[]> {
  const res = await fetch(`${API_URL}/api/chatbot/cursos`);
  if (!res.ok) throw new Error("Erro ao buscar cursos");
  return res.json();
}

export async function fetchTopicos(sigla: string): Promise<Topico[]> {
  const res = await fetch(`${API_URL}/api/chatbot/cursos/${sigla}/topicos`);
  if (!res.ok) throw new Error("Erro ao buscar topicos");
  return res.json();
}

export async function fetchResposta(sigla: string, chave: string): Promise<RespostaTopico> {
  const res = await fetch(`${API_URL}/api/chatbot/cursos/${sigla}/topicos/${chave}`);
  if (!res.ok) throw new Error("Erro ao buscar resposta");
  return res.json();
}

export async function postAvaliacao(
  topico_id: number,
  curso_id: number,
  satisfacao: "gostei" | "nao_gostei"
) {
  await fetch(`${API_URL}/api/chatbot/avaliar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topico_id, curso_id, satisfacao }),
  });
}

const chavesLegiveis: Record<string, string> = {
  AACC: "Atividades Complementares (AACC)",
  DATAS: "Datas importantes do semestre",
  DISPENSA: "Dispensa de disciplinas",
  ESTAGIO: "Estagio",
  EXTENSAO: "Disciplinas com atividades de extensao",
  HORARIO: "Horario das aulas",
  PORTIFOLIO: "Portifolio / TG",
  REMOTO: "Disciplinas remotas",
  TG: "Trabalho de Graduacao (TG)",
  GERAL: "Informacoes gerais",
};

export function formatarChave(chave: string): string {
  return chavesLegiveis[chave] ?? chave;
}

export type LogNavegacao = {
  id: number;
  acao: string;
  satisfacao?: "gostei" | "nao_gostei" | null;
  acessado_em: string;
  curso?: { sigla: string } | null;
  topico?: { chave: string } | null;
};

export async function fetchLogsNavegacao(): Promise<LogNavegacao[]> {
  const token = localStorage.getItem("authToken");

  const res = await fetch(`${API_URL}/api/admin/logs`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) throw new Error("Erro ao buscar logs de navegacao.");
  return res.json();
}

export type MembroSecretaria = {
  id: number;
  nome: string;
  email: string;
  perfil: "secretaria" | "administrador";
  ativo: boolean;
  troca_senha_obrigatoria?: boolean;
  criado_em: string;
};

type MembrosSecretariaResponse = {
  data: MembroSecretaria[];
  total?: number;
  meta?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
};

export type FiltrosMembros = {
  search?: string;
  ativo?: boolean;
  perfil?: "secretaria" | "administrador";
  page?: number;
  limit?: number;
};

export type ApiErrorDetail = {
  field: string;
  message: string;
};

export type ApiErrorPayload = {
  code?: string;
  message?: string;
  error?: string;
  details?: ApiErrorDetail[];
};

export class ApiRequestError extends Error {
  status: number;
  code?: string;
  details?: ApiErrorDetail[];

  constructor(status: number, payload: ApiErrorPayload) {
    super(payload.message ?? payload.error ?? "Erro ao processar requisicao.");
    this.name = "ApiRequestError";
    this.status = status;
    this.code = payload.code;
    this.details = payload.details;
  }
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem("authToken");

  let res: Response;

  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options?.headers ?? {}),
      },
    });
  } catch {
    throw new ApiRequestError(0, {
      code: "NETWORK_ERROR",
      message: "Nao foi possivel conectar ao servidor.",
    });
  }

  const data = (await res.json().catch(() => ({}))) as ApiErrorPayload;

  if (!res.ok) {
    if (res.status === 403 && data.code === "PASSWORD_CHANGE_REQUIRED") {
      localStorage.setItem("mustChangePassword", "true");
    }
    throw new ApiRequestError(res.status, data);
  }

  return data as T;
}

export async function fetchMembrosSecretaria(
  filtros: FiltrosMembros = {}
): Promise<MembrosSecretariaResponse> {
  const params = new URLSearchParams();
  if (filtros.search?.trim()) params.set("search", filtros.search.trim());
  if (filtros.ativo !== undefined) params.set("ativo", String(filtros.ativo));
  if (filtros.perfil) params.set("perfil", filtros.perfil);
  params.set("page", String(filtros.page ?? 1));
  params.set("limit", String(filtros.limit ?? 10));

  const query = params.toString();
  const path = `/api/admin/secretaria/membros?${query}`;

  return apiFetch<MembrosSecretariaResponse>(path);
}

export async function criarMembroSecretaria(payload: {
  nome: string;
  email: string;
  senha: string;
  perfil: "secretaria" | "administrador";
}): Promise<MembroSecretaria> {
  return apiFetch<MembroSecretaria>("/api/admin/secretaria/membros", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function editarMembroSecretaria(
  id: number,
  payload: {
    nome: string;
    email: string;
    perfil: "secretaria" | "administrador";
  }
): Promise<MembroSecretaria> {
  return apiFetch<MembroSecretaria>(`/api/admin/secretaria/membros/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function removerMembroSecretaria(id: number): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/api/admin/secretaria/membros/${id}`, {
    method: "DELETE",
  });
}

export async function atualizarStatusMembroSecretaria(
  id: number,
  ativo: boolean
): Promise<MembroSecretaria> {
  return apiFetch<MembroSecretaria>(`/api/admin/secretaria/membros/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ ativo }),
  });
}

export async function resetarSenhaMembroSecretaria(
  id: number,
  novaSenha: string
): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/api/admin/secretaria/membros/${id}/senha`, {
    method: "PATCH",
    body: JSON.stringify({ nova_senha: novaSenha }),
  });
}

export async function trocarSenhaPrimeiroAcesso(payload: {
  senhaAtual: string;
  novaSenha: string;
}): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/api/auth/trocar-senha-primeiro-acesso", {
    method: "PATCH",
    body: JSON.stringify({
      senha_atual: payload.senhaAtual,
      nova_senha: payload.novaSenha,
    }),
  });
}
