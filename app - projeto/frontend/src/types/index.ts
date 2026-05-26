// Define o formato de cada nó da árvore de menus do chatbot (mantido para compatibilidade)
export type Menu = {
  id: number        // identificador único do nó
  texto: string     // texto exibido no botão de opção
  resposta?: string // resposta final do bot
  aviso?: string    // mensagem de aviso antes das opções (opcional)
  filhos?: Menu[]   // lista de subopções
}

// Define o formato de cada mensagem exibida no histórico do chat
export type Mensagem = {
  tipo: 'bot' | 'usuario'     // indica quem enviou a mensagem
  texto: string               // conteúdo da mensagem
  documentos?: Documento[]    // documentos para download (opcional, só em mensagens bot)
}

// ─── Tipos da API ─────────────────────────────────────────────────────────────

export type Curso = {
  id: number
  sigla: string
  nome: string
}

export type Topico = {
  id: number
  chave: string
  tipo: 'simples' | 'menu' | 'pdf'
}

export type Documento = {
  id: number
  nome_exibicao: string
  caminho_arquivo: string
}

export type SubOpcao = {
  id: number
  titulo: string
  texto_informativo: string
  conteudo: string
}

export type RespostaTopico = {
  id: number
  chave: string
  tipo: 'simples' | 'menu' | 'pdf'
  resposta: { conteudo: string } | null
  sub_opcoes: SubOpcao[]
  documentos: Documento[]
}

// ─── Tipo de navegação interna do Chatbot ─────────────────────────────────────

export type Etapa =
  | { tipo: 'cursos' }
  | { tipo: 'topicos'; sigla: string }
  | { tipo: 'sub_opcoes'; opcoes: SubOpcao[] }
  | { tipo: 'satisfacao' }
  | { tipo: 'fim' }