// Define o formato de cada nó da arvore de menus do chatbot
export type Menu = {
    id: number // identificador único do nó
    texto: string  // texto exibido no botão de opção
    resposta?: string  // resposta final do bot
    aviso?: string  // mensagem de aviso antes das opções (opcional)
    filhos?: Menu[]  // lista de subopção
}

// define o formato de cada mensagem exibida no histórico dp chat
export type Mensagem = {
    tipo: 'bot' | 'usuario'  // inficada quem enviou a mensagem
    texto: string  // conteúdo da mensagem
}
