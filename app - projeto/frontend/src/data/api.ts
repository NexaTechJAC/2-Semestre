import type { Curso, Topico, RespostaTopico } from '../types'

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export async function fetchCursos(): Promise<Curso[]> {
  const res = await fetch(`${API}/api/chatbot/cursos`)
  if (!res.ok) throw new Error('Erro ao buscar cursos')
  return res.json()
}

export async function fetchTopicos(sigla: string): Promise<Topico[]> {
  const res = await fetch(`${API}/api/chatbot/cursos/${sigla}/topicos`)
  if (!res.ok) throw new Error('Erro ao buscar tópicos')
  return res.json()
}

export async function fetchResposta(sigla: string, chave: string): Promise<RespostaTopico> {
  const res = await fetch(`${API}/api/chatbot/cursos/${sigla}/topicos/${chave}`)
  if (!res.ok) throw new Error('Erro ao buscar resposta')
  return res.json()
}

export async function postAvaliacao(
  topico_id: number,
  curso_id: number,
  satisfacao: 'gostei' | 'nao_gostei'
) {
  await fetch(`${API}/api/chatbot/avaliar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topico_id, curso_id, satisfacao }),
  })
}

const chavesLegiveis: Record<string, string> = {
  AACC:       'Atividades Complementares (AACC)',
  DATAS:      'Datas importantes do semestre',
  DISPENSA:   'Dispensa de disciplinas',
  ESTAGIO:    'Estágio',
  EXTENSAO:   'Disciplinas com atividades de extensão',
  HORARIO:    'Horário das aulas',
  PORTIFOLIO: 'Portfólio / TG',
  REMOTO:     'Disciplinas remotas',
  TG:         'Trabalho de Graduação (TG)',
  GERAL:      'Informações gerais',
}

export function formatarChave(chave: string): string {
  return chavesLegiveis[chave] ?? chave
}
