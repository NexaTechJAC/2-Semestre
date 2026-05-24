import React, { useState, useEffect } from 'react';
import { 
  Notebook, Globe, MapPin, MonitorPlay, 
  ChevronRight, ArrowDown, Edit2, Trash2, X, Plus
} from 'lucide-react';

// --- TIPAGENS ---
type SubItem = { id: string; title: string; conteudo?: string };
type Category = { id: string; title: string; subItems: SubItem[]; conteudo?: string; tipo?: string };
type Course = { id: string; title: string; icon: React.ElementType; categories: Category[]; curso_id?: number };

type EditingItem = {
  type: 'category' | 'subitem';
  id: string;
  title: string;
  conteudo?: string;
  courseId: string;
} | null;

type CreatingItem =
  | { type: 'topico'; curso_id: number; cursoTitle: string }
  | { type: 'subitem'; topico_id: number; topicoTitle: string }
  | null;

const iconMap: { [key: string]: React.ElementType } = {
  Notebook, Globe, MapPin, MonitorPlay,
};

const API = 'http://localhost:3000';

async function apiFetch(url: string, options?: RequestInit) {
  const token = localStorage.getItem('authToken');
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers ?? {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Erro ${res.status}`);
  return data;
}

export default function GerenciamentoCursos() {
  const [cursos, setCursos] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [cursoAberto, setCursoAberto] = useState<string | null>(null);
  const [categoriaAberta, setCategoriaAberta] = useState<string | null>(null);

  const [editingItem, setEditingItem] = useState<EditingItem>(null);
  const [editValue, setEditValue] = useState('');
  const [editResposta, setEditResposta] = useState('');
  const [deletingItem, setDeletingItem] = useState<EditingItem>(null);
  const [creatingItem, setCreatingItem] = useState<CreatingItem>(null);
  const [createTitle, setCreateTitle] = useState('');
  const [createConteudo, setCreateConteudo] = useState('');
  const [saving, setSaving] = useState(false);

  const carregarCursos = async () => {
    try {
      setLoading(true);
      const data = await apiFetch(`${API}/api/chatbot/cursos/estruturado/completo`);
      const cursosFormatados = data.map((curso: any) => ({
        ...curso,
        icon: iconMap[curso.icon] || Notebook,
      }));
      setCursos(cursosFormatados);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregarCursos(); }, []);

  const toggleCurso = (id: string) => {
    if (cursoAberto === id) { setCursoAberto(null); setCategoriaAberta(null); }
    else { setCursoAberto(id); setCategoriaAberta(null); }
  };

  // --- EDITAR ---
  const handleEditClick = (type: 'category' | 'subitem', id: string, title: string, courseId: string, conteudo?: string) => {
    setEditingItem({ type, id, title, conteudo, courseId });
    setEditValue(title);
    setEditResposta(conteudo || '');
  };

  const handleSaveEdit = async () => {
    if (!editingItem || !editValue.trim()) return;
    try {
      setSaving(true);
      if (editingItem.type === 'category') {
        await apiFetch(`${API}/api/admin/topicos/${editingItem.id}`, {
          method: 'PUT',
          body: JSON.stringify({ chave: editValue, resposta: editResposta }),
        });
      } else {
        await apiFetch(`${API}/api/admin/sub-opcoes/${editingItem.id}`, {
          method: 'PUT',
          body: JSON.stringify({ titulo: editValue, conteudo: editResposta }),
        });
      }
      setEditingItem(null);
      await carregarCursos();
    } catch (err) {
      alert(`Erro ao salvar: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
    } finally {
      setSaving(false);
    }
  };

  // --- DELETAR ---
  const handleDeleteItem = async () => {
    if (!deletingItem) return;
    try {
      setSaving(true);
      const endpoint = deletingItem.type === 'category'
        ? `${API}/api/admin/topicos/${deletingItem.id}`
        : `${API}/api/admin/sub-opcoes/${deletingItem.id}`;
      await apiFetch(endpoint, { method: 'DELETE' });
      setDeletingItem(null);
      if (deletingItem.type === 'category') setCategoriaAberta(null);
      await carregarCursos();
    } catch (err) {
      alert(`Erro ao deletar: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
    } finally {
      setSaving(false);
    }
  };

  // --- CRIAR ---
  const abrirCriarTopico = (curso: Course) => {
    setCreatingItem({ type: 'topico', curso_id: curso.curso_id ?? 0, cursoTitle: curso.title });
    setCreateTitle('');
    setCreateConteudo('');
  };

  const abrirCriarSubitem = (cat: Category) => {
    setCreatingItem({ type: 'subitem', topico_id: Number(cat.id), topicoTitle: cat.title });
    setCreateTitle('');
    setCreateConteudo('');
  };

  const handleSaveCreate = async () => {
    if (!creatingItem || !createTitle.trim()) return;
    try {
      setSaving(true);
      if (creatingItem.type === 'topico') {
        // Se tem conteúdo → simples; se não → simples também (vira menu quando adicionar sub-opcoes)
        await apiFetch(`${API}/api/admin/topicos`, {
          method: 'POST',
          body: JSON.stringify({
            curso_id: creatingItem.curso_id,
            chave: createTitle.trim().toUpperCase().replace(/\s+/g, '_'),
            tipo: 'simples',
            resposta: createConteudo.trim() || undefined,
          }),
        });
      } else {
        // Criar sub-opção — o backend automaticamente promove o tópico para 'menu'
        await apiFetch(`${API}/api/admin/sub-opcoes`, {
          method: 'POST',
          body: JSON.stringify({
            topico_id: creatingItem.topico_id,
            titulo: createTitle.trim(),
            conteudo: createConteudo.trim(),
          }),
        });
      }
      setCreatingItem(null);
      await carregarCursos();
    } catch (err) {
      alert(`Erro ao criar: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 w-full flex items-center justify-center">
        <p className="text-gray-500">Carregando cursos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 w-full">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 font-semibold">Erro ao carregar cursos</p>
          <p className="text-red-500 text-sm mt-1">{error}</p>
          <button onClick={carregarCursos} className="mt-3 px-4 py-1.5 bg-red-600 text-white rounded text-sm hover:bg-red-700">
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 w-full">
      <div className="flex flex-col gap-12 mt-8">

        {cursos.map((curso) => {
          const isCursoAberto = cursoAberto === curso.id;
          const categoriaAtual = curso.categories.find(c => c.id === categoriaAberta);

          return (
            <div key={curso.id} className="flex items-start gap-6">

              {/* Coluna esquerda */}
              <div className="flex flex-col min-w-[140px]">
                <div className="relative inline-flex items-center mb-4">
                  <h2 className="text-2xl font-black text-red-600 border-b-2 border-red-600 pr-8 pb-1 uppercase tracking-wider">
                    {curso.title.replace(/_/g, " ")}
                  </h2>
                  <div className="absolute right-0 bottom-[-5px] w-3 h-3 bg-black rounded-full z-10" />
                </div>

                <div
                  className="flex items-center gap-2 cursor-pointer hover:opacity-70 transition-opacity"
                  onClick={() => toggleCurso(curso.id)}
                >
                  <curso.icon size={48} className="text-zinc-800" strokeWidth={1.5} />
                  <ChevronRight
                    size={24}
                    className={`text-zinc-800 transition-transform duration-300 ${isCursoAberto ? 'rotate-90' : ''}`}
                  />
                </div>
              </div>

              {/* Coluna direita: timeline */}
              {isCursoAberto && (
                <div className="flex-1 pl-4 pt-10 relative">

                  {categoriaAtual && (
                    <div className="absolute -top-2 left-4 text-xs font-bold text-red-600 tracking-widest flex items-center gap-1">
                      {curso.title.replace(/_/g, " ")} <ChevronRight size={12} /> {categoriaAtual.title}
                    </div>
                  )}

                  <div className="absolute top-[52px] left-0 w-full h-[2px] bg-black" />
                  <div className="absolute top-[49px] -left-2 w-2 h-2 bg-black rounded-full" />

                  <div className="flex gap-8 relative z-10 w-full overflow-x-auto pb-4">

                    {/* Vista de tópicos */}
                    {!categoriaAberta && (
                      <>
                        {curso.categories.map((cat) => (
                          <div key={cat.id} className="flex flex-col items-center relative min-w-[80px]">
                            <ArrowDown size={16} className="text-black mb-2" />
                            <span
                              onClick={() => setCategoriaAberta(cat.id)}
                              className="text-xs font-bold uppercase cursor-pointer hover:text-red-600 transition-colors text-center"
                              title={cat.tipo === 'menu' ? 'Tem sub-opções' : cat.tipo === 'pdf' ? 'PDF' : 'Resposta simples'}
                            >
                              {cat.title}
                            </span>
                            {/* Badge de tipo */}
                            <span className={`text-[9px] mt-0.5 px-1 rounded font-bold uppercase ${
                              cat.tipo === 'menu' ? 'text-blue-500' :
                              cat.tipo === 'pdf' ? 'text-orange-500' :
                              'text-zinc-400'
                            }`}>
                              {cat.tipo}
                            </span>
                            <div className="flex gap-3 mt-1 text-zinc-400">
                              <Edit2
                                size={14}
                                className="cursor-pointer hover:text-black transition-colors"
                                onClick={(e) => { e.stopPropagation(); handleEditClick('category', cat.id, cat.title, curso.id, cat.conteudo); }}
                              />
                              <Trash2
                                size={14}
                                className="cursor-pointer hover:text-red-600 transition-colors"
                                onClick={(e) => { e.stopPropagation(); setDeletingItem({ type: 'category', id: cat.id, title: cat.title, courseId: curso.id }); }}
                              />
                            </div>
                          </div>
                        ))}

                        {/* Botão novo tópico */}
                        <div className="flex flex-col items-center relative min-w-[64px] justify-start pt-[18px]">
                          <button
                            onClick={() => abrirCriarTopico(curso)}
                            className="flex flex-col items-center gap-1 text-zinc-400 hover:text-red-600 transition-colors group"
                            title="Novo tópico"
                          >
                            <Plus size={20} className="border border-dashed border-zinc-300 group-hover:border-red-400 rounded p-0.5" />
                            <span className="text-[10px] uppercase font-bold">Novo</span>
                          </button>
                        </div>
                      </>
                    )}

                    {/* Vista de sub-opções — abre para QUALQUER tipo ao clicar */}
                    {categoriaAberta && (
                      <>
                        {/* Voltar */}
                        <div className="flex flex-col items-center relative min-w-[48px] justify-start pt-[18px]">
                          <button
                            onClick={() => setCategoriaAberta(null)}
                            className="flex flex-col items-center gap-1 text-zinc-400 hover:text-zinc-700 transition-colors"
                            title="Voltar"
                          >
                            <ChevronRight size={20} className="rotate-180" />
                            <span className="text-[10px] uppercase font-bold">Voltar</span>
                          </button>
                        </div>

                        {categoriaAtual?.subItems.length === 0 && (
                          <div className="flex items-center pt-[18px]">
                            <span className="text-xs text-zinc-400 italic">Nenhuma sub-opção ainda</span>
                          </div>
                        )}

                        {categoriaAtual?.subItems.map((sub) => (
                          <div key={sub.id} className="flex flex-col items-center relative min-w-[100px]">
                            <ArrowDown size={16} className="text-black mb-2" />
                            <span className="text-[11px] font-bold uppercase text-center leading-tight">
                              {sub.title}
                            </span>
                            <div className="flex gap-3 mt-2 text-zinc-400">
                              <Edit2
                                size={14}
                                className="cursor-pointer hover:text-black transition-colors"
                                onClick={() => handleEditClick('subitem', sub.id, sub.title, curso.id, sub.conteudo)}
                              />
                              <Trash2
                                size={14}
                                className="cursor-pointer hover:text-red-600 transition-colors"
                                onClick={() => setDeletingItem({ type: 'subitem', id: sub.id, title: sub.title, courseId: curso.id })}
                              />
                            </div>
                          </div>
                        ))}

                        {/* Botão nova sub-opção */}
                        {categoriaAtual && (
                          <div className="flex flex-col items-center relative min-w-[64px] justify-start pt-[18px]">
                            <button
                              onClick={() => abrirCriarSubitem(categoriaAtual)}
                              className="flex flex-col items-center gap-1 text-zinc-400 hover:text-red-600 transition-colors group"
                              title="Nova sub-opção"
                            >
                              <Plus size={20} className="border border-dashed border-zinc-300 group-hover:border-red-400 rounded p-0.5" />
                              <span className="text-[10px] uppercase font-bold">Novo</span>
                            </button>
                          </div>
                        )}
                      </>
                    )}

                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ─── MODAL EDITAR ─── */}
      {editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-zinc-900">
                Editar {editingItem.type === 'category' ? 'Tópico' : 'Sub-opção'}
              </h3>
              <button onClick={() => setEditingItem(null)} className="text-zinc-400 hover:text-zinc-600"><X size={24} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-2">
                  {editingItem.type === 'category' ? 'Chave (nome interno)' : 'Título'}
                </label>
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-2">Resposta / Conteúdo</label>
                <textarea
                  value={editResposta}
                  onChange={(e) => setEditResposta(e.target.value)}
                  className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 min-h-[150px] resize-none"
                  placeholder="Texto que aparece ao aluno"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button onClick={() => setEditingItem(null)} disabled={saving} className="px-4 py-2 border border-zinc-300 rounded-lg text-zinc-700 hover:bg-zinc-50 disabled:opacity-50">Cancelar</button>
              <button onClick={handleSaveEdit} disabled={saving} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold disabled:opacity-50">
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL DELETAR ─── */}
      {deletingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            <h3 className="text-lg font-bold text-zinc-900 mb-4">Deseja deletar "{deletingItem.title}"?</h3>
            <p className="text-zinc-600 mb-6">
              Esta ação é irreversível{deletingItem.type === 'category' ? ' e todos os subitens serão removidos' : ''}.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeletingItem(null)} className="px-4 py-2 border border-zinc-300 rounded-lg text-zinc-700 hover:bg-zinc-50">Cancelar</button>
              <button onClick={handleDeleteItem} disabled={saving} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold flex items-center gap-2 disabled:opacity-50">
                <Trash2 size={18} />
                {saving ? 'Deletando...' : 'Deletar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL CRIAR ─── */}
      {creatingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-lg font-bold text-zinc-900">
                {creatingItem.type === 'topico'
                  ? `Novo tópico em ${creatingItem.cursoTitle}`
                  : `Nova sub-opção em "${creatingItem.topicoTitle}"`}
              </h3>
              <button onClick={() => setCreatingItem(null)} className="text-zinc-400 hover:text-zinc-600"><X size={24} /></button>
            </div>

            {creatingItem.type === 'topico' && (
              <p className="text-xs text-zinc-400 mb-4">
                💡 Se quiser adicionar sub-opções depois, clique no tópico criado e use o botão "Novo" — o tipo será atualizado automaticamente para menu.
              </p>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-2">
                  {creatingItem.type === 'topico' ? 'Chave (ex: HORARIO, ESTAGIO...)' : 'Título'}
                </label>
                <input
                  type="text"
                  value={createTitle}
                  onChange={(e) => setCreateTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                  placeholder={creatingItem.type === 'topico' ? 'Ex: HORARIO' : 'Ex: 1º Semestre'}
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-2">
                  {creatingItem.type === 'topico' ? 'Resposta (opcional — pode preencher depois)' : 'Conteúdo'}
                </label>
                <textarea
                  value={createConteudo}
                  onChange={(e) => setCreateConteudo(e.target.value)}
                  className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 min-h-[120px] resize-none"
                  placeholder="Texto que aparece ao aluno ao selecionar esta opção"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button onClick={() => setCreatingItem(null)} disabled={saving} className="px-4 py-2 border border-zinc-300 rounded-lg text-zinc-700 hover:bg-zinc-50 disabled:opacity-50">Cancelar</button>
              <button onClick={handleSaveCreate} disabled={saving || !createTitle.trim()} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold disabled:opacity-50 flex items-center gap-2">
                <Plus size={18} />
                {saving ? 'Criando...' : 'Criar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}