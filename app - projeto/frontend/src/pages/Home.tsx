import { useState, type ComponentType, type ReactNode } from "react"
import { BookOpen, CalendarDays, ChevronRight, ClipboardList, Clock3, FileClock, FileText, GraduationCap, Mail, MapPin, MessageCircle, Phone, Send, Users } from "lucide-react"

import { Chatbot, FloatingChatbot } from "../components/Chatbot"

type Icon = ComponentType<{ className?: string }>

type Service = {
  icon: Icon
  title: string
  description: string
  time: string
  popular?: boolean
}

const navigation = ["Início", "Serviços", "Documentos", "Calendário", "Contato"]

const services: Service[] = [
  { icon: FileText, title: "Histórico Escolar", description: "Solicite seu histórico acadêmico completo", time: "2 dias úteis", popular: true },
  { icon: ClipboardList, title: "Ficha de Matrícula", description: "Realize sua matrícula ou rematrícula", time: "Imediato", popular: true },
  { icon: FileClock, title: "Declarações e Atestados", description: "Emita declarações de vínculo e frequência", time: "2 dias úteis", popular: true },
  { icon: CalendarDays, title: "Calendário Acadêmico", description: "Confira datas importantes do semestre", time: "Consulta imediata", popular: true },
  { icon: BookOpen, title: "Exames e Provas", description: "Acesse resultados e solicite revisões", time: "Variável" },
  { icon: Users, title: "Atendimento Presencial", description: "Agende um horário na secretaria", time: "Agendamento", popular: true },
]

const footerLinks = [
  { title: "Serviços", links: ["Histórico Escolar", "Matrícula", "Declarações", "Exames"] },
  { title: "Institucional", links: ["Sobre Nós", "Calendário", "Contato", "FAQ"] },
]

export function Home() {
  const [isHelpChatOpen, setIsHelpChatOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#1f1f1f] py-2 text-black">
      <div className="mx-auto w-full max-w-[1230px] overflow-hidden bg-white shadow-2xl">
        <InstitutionalHeader />
        <ContactStrip />
        <Header />
        <HeroSection />
        <ServicesSection onHelpClick={() => setIsHelpChatOpen(true)} />
        <SectionDivider />
        <ContactSection />
        <Footer />
      </div>
      <FloatingChatbot open={isHelpChatOpen} onClose={() => setIsHelpChatOpen(false)} />
    </div>
  )
}
function InstitutionalHeader() {
  return (
    <section className="relative flex h-[64px] items-center justify-between bg-white px-8">
      <div className="absolute left-0 top-0 h-full w-[290px] rounded-br-[52px] bg-black" />
      <div className="relative z-10 flex items-center gap-3 text-white">
        <div className="h-10 w-10 rounded bg-white" />
        <div className="leading-none">
          <p className="text-[22px] font-black uppercase tracking-tight">São Paulo</p>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em]">Governo do Estado</p>
          <p className="text-[8px] uppercase text-red-500">São Paulo são todos</p>
        </div>
      </div>
      <div className="flex items-center gap-9 text-right">
        <div>
          <p className="text-[34px] font-bold leading-none text-slate-600">Fatec</p>
          <p className="text-[8px] font-semibold text-slate-500">Faculdade de Tecnologia</p>
          <p className="text-[8px] text-slate-500">Prof. Francisco de Moura</p>
        </div>
        <div>
          <p className="text-[42px] font-black leading-none text-red-700">CPS</p>
          <p className="text-[9px] font-semibold leading-none text-red-700">Centro Paula Souza</p>
        </div>
      </div>
    </section>
  )
}

function ContactStrip() {
  return (
    <section className="border-t-[5px] border-red-600 bg-black px-14 py-2 text-white">
      <div className="flex flex-wrap items-center justify-between gap-4 text-[13px]">
        <span className="flex items-center gap-2"><Phone className="h-5 w-5" /> (12) 3900-0505</span>
        <span className="flex items-center gap-2"><Mail className="h-5 w-5" /> secretaria@edu.br</span>
        <span className="flex items-center gap-2"><Clock3 className="h-5 w-5" /> Seg - Sex: 8h às 21h</span>
        <span className="flex items-center gap-2"><MapPin className="h-5 w-5" /> Hall do Prédio</span>
      </div>
    </section>
  )
}

function Header() {
  return (
    <header className="bg-white px-8 py-4">
      <div className="flex items-center justify-between gap-6">
        <Brand />
        <nav className="hidden items-center gap-7 text-[13px] font-bold md:flex" aria-label="Navegação principal">
          {navigation.map((item) => <a key={item} href="#" className="transition-colors hover:text-red-600">{item}</a>)}
        </nav>
        <a href="/admin" className="rounded-full bg-red-600 px-8 py-2 text-[12px] font-bold text-white transition hover:bg-red-700">Acesso Secretaria</a>
      </div>
    </header>
  )
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <a href="/" className="flex items-center gap-3" aria-label="Portal Acadêmico">
      <span className={`${compact ? "h-9 w-9" : "h-12 w-12"} flex items-center justify-center rounded-full bg-red-600 text-white`}>
        <GraduationCap className={compact ? "h-5 w-5" : "h-7 w-7"} />
      </span>
      <span className="leading-tight">
        <span className={`${compact ? "text-sm text-white" : "text-[17px]"} block font-black`}>Portal Acadêmico</span>
        <span className="block text-[10px] font-bold uppercase text-red-600">Secretaria Digital</span>
      </span>
    </a>
  )
}

function HeroSection() {
  return (
    <section className="bg-black px-9 pb-5 pt-3 text-white">
      <div className="grid items-start gap-8 lg:grid-cols-[1fr_1.17fr]">
        <div className="pt-11">
          <h1 className="max-w-[520px] text-[52px] font-black leading-[0.98] tracking-tight md:text-[58px]">
            Olá! Como posso <span className="block text-red-600">te ajudar hoje?</span>
          </h1>
          <p className="mt-7 max-w-[455px] text-[18px] font-bold leading-tight">
            Nossa assistente virtual está pronta para responder suas dúvidas sobre documentos, matrículas, prazos e todos os serviços da secretaria, a qualquer hora.
          </p>
        </div>
        <div className="h-[490px]">
          <Chatbot inline />
        </div>
      </div>
    </section>
  )
}

function ServicesSection({ onHelpClick }: { onHelpClick: () => void }) {
  return (
    <section className="relative bg-white pb-20 pt-0">
      <SectionLabel>Serviços Disponíveis</SectionLabel>
      <FloatingHelp onClick={onHelpClick} />
      <div className="mx-auto grid max-w-[680px] gap-4 pt-12 sm:grid-cols-2">
        {services.map((service) => <ServiceCard key={service.title} service={service} />)}
      </div>
      <button className="absolute bottom-8 right-[130px] flex items-center gap-2 rounded-full bg-[#f6f1f1] px-5 py-2 text-[11px] text-zinc-500">
        Ver todos <ChevronRight className="h-4 w-4" />
      </button>
    </section>
  )
}

function SectionLabel({ children }: { children: ReactNode }) {
  return <h2 className="inline-flex rounded-br-full bg-red-600 py-1 pl-5 pr-9 text-[22px] font-black leading-none text-white">{children}</h2>
}

function FloatingHelp({ onClick }: { onClick: () => void }) {
  return (
    <button
      className="absolute right-6 top-10 flex items-center gap-2 rounded-full bg-red-600 px-4 py-3 text-[11px] font-bold text-white shadow-lg transition hover:bg-red-700"
      onClick={onClick}
      type="button"
    >
      <MessageCircle className="h-4 w-4" /> Precisa de ajuda?
    </button>
  )
}
function ServiceCard({ service }: { service: Service }) {
  return (
    <article className="relative flex min-h-[92px] items-start gap-3 rounded-lg border-2 border-black bg-white p-3 shadow-sm">
      {service.popular && <span className="absolute right-2 top-2 rounded bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-500">Popular</span>}
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded bg-zinc-200 text-red-600">
        <service.icon className="h-7 w-7" />
      </div>
      <div className="pr-12">
        <h3 className="text-[13px] font-black leading-tight">{service.title}</h3>
        <p className="mt-1 text-[11px] leading-tight text-zinc-700">{service.description}</p>
        <div className="mt-3 flex items-center gap-1 text-[10px] text-zinc-600">
          <Clock3 className="h-3 w-3 text-red-600" /> <span>{service.time}</span>
        </div>
      </div>
    </article>
  )
}

function SectionDivider() {
  return (
    <div className="relative h-9 bg-white">
      <div className="absolute left-0 right-0 top-1/2 h-2 -translate-y-1/2 bg-black" />
      <div className="absolute -left-4 top-1/2 h-14 w-14 -translate-y-1/2 rounded-full bg-black" />
      <div className="absolute -right-4 top-1/2 h-14 w-14 -translate-y-1/2 rounded-full bg-black" />
    </div>
  )
}

function ContactSection() {
  return (
    <section className="bg-white px-8 pb-5 pt-5">
      <div className="mx-auto max-w-[1060px] rounded-xl border border-zinc-400 bg-white p-5">
        <div className="grid gap-8 md:grid-cols-[1fr_0.86fr]">
          <div className="px-2 py-4">
            <h2 className="text-[35px] font-black leading-none">Envie sua Dúvida</h2>
            <p className="mt-6 max-w-[520px] text-[13px] leading-snug">
              Preencha o formulário ao lado e nossa equipe retornará o mais breve possível. Você também pode nos contatar pelos canais abaixo.
            </p>
            <div className="mt-9 space-y-6 text-[13px]">
              <p className="flex items-center gap-3"><Phone className="h-5 w-5 text-red-500" /> (11) 0000-0000</p>
              <p className="flex items-center gap-3"><Mail className="h-5 w-5 text-red-500" /> secretaria@instituicao.edu.br</p>
              <p className="flex items-center gap-3"><MapPin className="h-5 w-5 text-red-500" /> Hall do Prédio</p>
            </div>
          </div>
          <form className="rounded-xl bg-[#f7f5f5] p-6">
            <LabelInput label="Nome Completo" placeholder="Digite seu nome..." />
            <LabelInput label="E-mail" placeholder="seu.email@exemplo.com" type="email" />
            <label className="mt-5 block text-[13px] font-black">
              Sua Dúvida
              <textarea className="mt-2 h-[112px] w-full resize-none rounded-lg border border-zinc-500 bg-white px-3 py-3 text-[12px] font-normal outline-none focus:border-red-600" placeholder="Descreva sua dúvida ou solicitação detalhadamente..." />
            </label>
            <button className="mt-4 flex h-12 w-full items-center justify-center gap-3 rounded-full bg-red-600 text-[18px] font-black text-white transition hover:bg-red-700" type="button">
              <Send className="h-5 w-5" /> Enviar Mensagem
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}

function LabelInput({ label, placeholder, type = "text" }: { label: string; placeholder: string; type?: string }) {
  return (
    <label className="mb-5 block text-[13px] font-black">
      {label}
      <input className="mt-2 h-10 w-full rounded-md border border-zinc-500 bg-white px-3 text-[12px] font-normal outline-none focus:border-red-600" placeholder={placeholder} type={type} />
    </label>
  )
}

function Footer() {
  return (
    <footer className="bg-black px-8 py-6 text-white">
      <div className="mx-auto grid max-w-[1140px] gap-8 border-b border-white/20 pb-8 md:grid-cols-4">
        <div>
          <Brand compact />
          <p className="mt-4 max-w-[190px] text-[11px] leading-snug text-white/55">Facilitando a vida acadêmica de milhares de estudantes.</p>
        </div>
        {footerLinks.map((group) => (
          <div key={group.title}>
            <h3 className="text-[13px] font-black">{group.title}</h3>
            <ul className="mt-5 space-y-2 text-[10px] text-white/55">{group.links.map((link) => <li key={link}>{link}</li>)}</ul>
          </div>
        ))}
        <div>
          <h3 className="text-[13px] font-black">Contato</h3>
          <ul className="mt-5 space-y-2 text-[10px] text-white/55">
            <li>(12) 3900-0505</li>
            <li>secretaria@edu.br</li>
            <li>Seg - Sex: 8h às 21h</li>
          </ul>
        </div>
      </div>
      <p className="pt-6 text-center text-[10px] text-white/45">© 2026 Portal Acadêmico - Secretaria Digital. Todos os direitos reservados.</p>
    </footer>
  )
}

export default Home
