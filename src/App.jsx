import { useState, useEffect, useRef } from 'react'
import dadosIniciais from './data/protocolos.json'

// ─── CONSTANTES ──────────────────────────────────────────────────
const STORAGE_KEY = 'enfermeiro_protocolos'

const ICONES = ["🤰","📋","👶","📏","💓","🩸","🧠","🚨","💉","🔬","👩‍⚕️","🩹","🫁","🦷","👁️","🦴","💊","🩺","📊","🧪","🫀","🧬","🩻","🏥","📌","🗂️"]

const CORES = {
  "Pré-natal": "#4CAF50", "Puericultura": "#2196F3",
  "Doenças Crônicas": "#FF9800", "Saúde Mental": "#9C27B0",
  "Urgência": "#F44336", "Imunização": "#00BCD4",
  "Saúde da Mulher": "#E91E63", "Procedimentos": "#8BC34A",
  "Saúde do Adulto": "#FF5722", "Saúde do Idoso": "#795548",
}
const getCor = c => CORES[c] || '#607D8B'
const getBg = c => getCor(c) + '18'
const gerarId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6)

// ─── PARSE MARKDOWN ──────────────────────────────────────────────
const md = text => {
  if (!text) return ''
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^### (.+)$/gm, '<h3 style="font-size:13px;font-weight:700;color:#1a365d;margin:16px 0 6px;padding-bottom:4px;border-bottom:1px solid #e2e8f0">$1</h3>')
    .replace(/^## (.+)$/gm,  '<h2 style="font-size:16px;font-weight:800;color:#0a2540;margin:0 0 14px">$1</h2>')
    .replace(/^# (.+)$/gm,   '<h1 style="font-size:18px;font-weight:800;color:#0a2540;margin:0 0 16px">$1</h1>')
    .replace(/^[-•] (.+)$/gm,'<div style="display:flex;gap:8px;margin:5px 0;font-size:13px"><span style="color:#1a56db;font-size:18px;line-height:1.1;flex-shrink:0">›</span><span>$1</span></div>')
    .replace(/^> \*\*(.+?)\*\*(.*)$/gm, '<div style="border-left:3px solid #f59e0b;padding:8px 12px;background:#fffbeb;border-radius:0 8px 8px 0;margin:10px 0;font-size:12px;color:#92400e"><strong>⚠️ $1</strong>$2</div>')
    .replace(/^> (.+)$/gm,   '<div style="border-left:3px solid #f59e0b;padding:8px 12px;background:#fffbeb;border-radius:0 8px 8px 0;margin:10px 0;font-size:12px;color:#92400e">⚠️ $1</div>')
    .replace(/\n\n/g, '<br/><br/>').replace(/\n/g, '<br/>')
}

// ─── COMPONENTES PEQUENOS ─────────────────────────────────────────
const Label = ({ children }) => (
  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1.5 }}>{children}</div>
)

const Chip = ({ ativo, onClick, children }) => (
  <button onClick={onClick} style={{ background: ativo ? '#fff' : 'rgba(255,255,255,0.12)', color: ativo ? '#1a56db' : '#fff', border: 'none', borderRadius: 20, padding: '6px 14px', fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
    {children}
  </button>
)

const BtnVoltar = ({ onClick }) => (
  <button onClick={onClick} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 10, padding: '8px 12px', cursor: 'pointer', color: '#fff', fontSize: 18, fontWeight: 600, lineHeight: 1 }}>‹</button>
)

const Toast = ({ toast }) => {
  if (!toast) return null
  return (
    <div style={{ position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)', background: toast.tipo === 'erro' ? '#ef4444' : '#1a56db', color: '#fff', borderRadius: 20, padding: '11px 22px', fontSize: 13, fontWeight: 600, zIndex: 9999, boxShadow: '0 8px 24px rgba(0,0,0,0.2)', whiteSpace: 'nowrap', pointerEvents: 'none' }}>
      {toast.tipo === 'erro' ? '⚠️' : '✅'} {toast.msg}
    </div>
  )
}

const inputStyle = {
  width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 12, padding: '11px 13px',
  fontSize: 13, outline: 'none', boxSizing: 'border-box', background: '#fff',
  fontFamily: "'DM Sans', sans-serif", color: '#1e293b', marginTop: 6, resize: 'vertical'
}

const GRAD = 'linear-gradient(150deg, #0a2540 0%, #1a56db 100%)'

// ════════════════════════════════════════════════════════════════
// APP PRINCIPAL
// ════════════════════════════════════════════════════════════════
export default function App() {
  const [situacoes, setSituacoes] = useState([])
  const [tela, setTela] = useState('home')
  const [selecionada, setSelecionada] = useState(null)
  const [busca, setBusca] = useState('')
  const [catFiltro, setCatFiltro] = useState(null)
  const [form, setForm] = useState({ titulo: '', categoria: '', icone: '🩺', protocolo: '', _nova: false })
  const [novaCategoria, setNovaCategoria] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [toast, setToast] = useState(null)
  const [previewOn, setPreviewOn] = useState(false)
  const textareaRef = useRef(null)
  const importRef = useRef(null)

  // ── STORAGE ──
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        setSituacoes(JSON.parse(raw))
      } else {
        // Primeira vez: usa o JSON do repositório como semente
        setSituacoes(dadosIniciais)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dadosIniciais))
      }
    } catch {
      setSituacoes(dadosIniciais)
    }
  }, [])

  const persistir = dados => {
    setSituacoes(dados)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dados))
  }

  const toast_ = (msg, tipo = 'ok') => {
    setToast({ msg, tipo })
    setTimeout(() => setToast(null), 2800)
  }

  // ── CRUD ──
  const salvar = () => {
    if (!form.titulo.trim() || !form.categoria.trim()) {
      toast_('Preencha título e categoria', 'erro'); return
    }
    setSalvando(true)
    let novas
    if (form._nova) {
      const nova = { titulo: form.titulo, categoria: form.categoria, icone: form.icone, protocolo: form.protocolo, id: gerarId() }
      novas = [...situacoes, nova]
      persistir(novas)
      setSelecionada(nova)
    } else {
      novas = situacoes.map(s => s.id === selecionada.id ? { ...s, ...form } : s)
      persistir(novas)
      setSelecionada({ ...selecionada, ...form })
    }
    setSalvando(false)
    toast_(form._nova ? 'Situação criada!' : 'Protocolo salvo!')
    setTela('protocolo')
  }

  const excluir = () => {
    const novas = situacoes.filter(s => s.id !== selecionada.id)
    persistir(novas)
    setConfirmDelete(false)
    setSelecionada(null)
    setTela('lista')
    toast_('Situação removida')
  }

  const abrirNova = () => {
    setSelecionada(null)
    setForm({ titulo: '', categoria: '', icone: '🩺', protocolo: '', _nova: true })
    setNovaCategoria('')
    setPreviewOn(false)
    setTela('editor')
  }

  const abrirEditar = s => {
    setSelecionada(s)
    setForm({ titulo: s.titulo, categoria: s.categoria, icone: s.icone, protocolo: s.protocolo, _nova: false })
    setNovaCategoria('')
    setPreviewOn(false)
    setTela('editor')
  }

  const abrirProtocolo = s => { setSelecionada(s); setTela('protocolo') }

  // ── MARKDOWN TOOLBAR ──
  const inserir = tag => {
    const ta = textareaRef.current
    if (!ta) return
    const ini = ta.selectionStart, fim = ta.selectionEnd
    const sel = form.protocolo.substring(ini, fim)
    const mapa = { '## ': `\n## ${sel || 'Seção'}\n`, '### ': `\n### ${sel || 'Subseção'}\n`, '- ': `\n- ${sel || 'item'}`, '> ': `\n> ${sel || 'Atenção'}`, '**': `**${sel || 'texto'}**`, '\n': '\n\n' }
    const novo = mapa[tag] || tag
    const atualizado = form.protocolo.substring(0, ini) + novo + form.protocolo.substring(fim)
    setForm(f => ({ ...f, protocolo: atualizado }))
    setTimeout(() => { ta.focus(); ta.selectionStart = ta.selectionEnd = ini + novo.length }, 10)
  }

  // ── EXPORTAR ──
  const exportarJSON = () => {
    const blob = new Blob([JSON.stringify(situacoes, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'protocolos.json'
    a.click()
    URL.revokeObjectURL(url)
    toast_('protocolos.json baixado!')
  }

  // ── IMPORTAR ──
  const importarJSON = e => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = evt => {
      try {
        const dados = JSON.parse(evt.target.result)
        if (!Array.isArray(dados)) throw new Error()
        persistir(dados)
        toast_(`${dados.length} protocolos importados!`)
        setTela('lista')
      } catch {
        toast_('Arquivo inválido', 'erro')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  // ── DERIVED ──
  const categorias = [...new Set(situacoes.map(s => s.categoria))]
  const filtradas = situacoes.filter(s => {
    const mb = s.titulo.toLowerCase().includes(busca.toLowerCase()) || s.categoria.toLowerCase().includes(busca.toLowerCase())
    const mc = !catFiltro || s.categoria === catFiltro
    return mb && mc
  })

  const base = { fontFamily: "'DM Sans','Segoe UI',sans-serif", maxWidth: 430, margin: '0 auto', minHeight: '100vh', background: '#f0f4f8', position: 'relative', overflowX: 'hidden' }

  // ════════════════════════════════════════
  // TELA: HOME
  // ════════════════════════════════════════
  if (tela === 'home') return (
    <div style={{ ...base, background: GRAD }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      <Toast toast={toast} />
      <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

      <div style={{ padding: '56px 24px 50px' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <div style={{ background: 'rgba(255,255,255,0.13)', borderRadius: 14, padding: '10px 12px', fontSize: 24 }}>🩺</div>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase' }}>Assistente Clínico</div>
            <div style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>Para Enfermeiros</div>
          </div>
        </div>

        <h1 style={{ color: '#fff', fontSize: 32, fontWeight: 800, lineHeight: 1.1, margin: '0 0 10px' }}>
          Protocolos<br /><span style={{ color: '#93c5fd' }}>Clínicos</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 0, marginBottom: 28, lineHeight: 1.6 }}>
          Seus protocolos, sempre atualizados. Consulte, adicione e sincronize com o GitHub.
        </p>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 28 }}>
          {[{ n: situacoes.length, l: 'Situações' }, { n: categorias.length, l: 'Categorias' }, { n: '↑', l: 'Sync' }].map((s, i) => (
            <div key={i} style={{ flex: 1, background: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: '14px 8px', textAlign: 'center' }}>
              <div style={{ color: '#fff', fontSize: 22, fontWeight: 800 }}>{s.n}</div>
              <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 10, fontWeight: 500 }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Ações principais */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button onClick={() => setTela('lista')} style={{ background: '#fff', color: '#1a56db', border: 'none', borderRadius: 16, padding: '16px 20px', fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.18)' }}>
            <span style={{ fontSize: 20 }}>📂</span> Ver Todos os Protocolos
          </button>
          <button onClick={abrirNova} style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.2)', borderRadius: 16, padding: '14px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 18 }}>＋</span> Nova Situação / Protocolo
          </button>
          <button onClick={() => setTela('sincronizar')} style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 16, padding: '14px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 18 }}>🔄</span> Exportar / Importar (GitHub Sync)
          </button>
        </div>

        {/* Acesso rápido */}
        {situacoes.length > 0 && (
          <div style={{ marginTop: 30 }}>
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12 }}>Acesso Rápido</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {situacoes.slice(0, 4).map(s => (
                <button key={s.id} onClick={() => abrirProtocolo(s)} style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '13px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 20 }}>{s.icone}</span>
                  <div style={{ textAlign: 'left', flex: 1 }}>
                    <div style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{s.titulo}</div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>{s.categoria}</div>
                  </div>
                  <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 20 }}>›</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )

  // ════════════════════════════════════════
  // TELA: LISTA
  // ════════════════════════════════════════
  if (tela === 'lista') return (
    <div style={base}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      <Toast toast={toast} />

      <div style={{ background: GRAD, padding: '48px 16px 16px', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <BtnVoltar onClick={() => setTela('home')} />
          <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 700, margin: 0, flex: 1 }}>Protocolos Clínicos</h2>
          <button onClick={abrirNova} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 10, padding: '8px 12px', cursor: 'pointer', color: '#fff', fontSize: 18 }}>＋</button>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: '10px 14px', display: 'flex', gap: 8, marginBottom: 12 }}>
          <span>🔍</span>
          <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar situação ou categoria..." style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: 13 }} />
          {busca && <button onClick={() => setBusca('')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 18 }}>×</button>}
        </div>
        <div style={{ display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 4 }}>
          <Chip ativo={!catFiltro} onClick={() => setCatFiltro(null)}>Todos</Chip>
          {categorias.map(c => <Chip key={c} ativo={catFiltro === c} onClick={() => setCatFiltro(catFiltro === c ? null : c)}>{c}</Chip>)}
        </div>
      </div>

      <div style={{ padding: '14px 14px 90px' }}>
        {categorias.filter(cat => !catFiltro || cat === catFiltro).map(cat => {
          const itens = filtradas.filter(s => s.categoria === cat)
          if (!itens.length) return null
          const cor = getCor(cat)
          return (
            <div key={cat} style={{ marginBottom: 22 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: cor }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: '#64748b', letterSpacing: 2, textTransform: 'uppercase' }}>{cat}</span>
                <span style={{ background: cor + '20', color: cor, fontSize: 10, fontWeight: 700, borderRadius: 20, padding: '1px 7px' }}>{itens.length}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {itens.map(s => (
                  <button key={s.id} onClick={() => abrirProtocolo(s)} style={{ background: '#fff', border: `1.5px solid ${cor}20`, borderLeft: `4px solid ${cor}`, borderRadius: 16, padding: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}>
                    <div style={{ background: getBg(s.categoria), borderRadius: 12, width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{s.icone}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', lineHeight: 1.3 }}>{s.titulo}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                        {s.protocolo ? s.protocolo.replace(/[#\-*>\n]/g, ' ').trim().substring(0, 55) + '…' : 'Sem protocolo ainda'}
                      </div>
                    </div>
                    <span style={{ color: '#cbd5e1', fontSize: 20, flexShrink: 0 }}>›</span>
                  </button>
                ))}
              </div>
            </div>
          )
        })}
        {filtradas.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>🔍</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Nenhuma situação encontrada</div>
            <button onClick={abrirNova} style={{ marginTop: 16, background: '#1a56db', color: '#fff', border: 'none', borderRadius: 12, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>+ Criar nova situação</button>
          </div>
        )}
      </div>
    </div>
  )

  // ════════════════════════════════════════
  // TELA: PROTOCOLO
  // ════════════════════════════════════════
  if (tela === 'protocolo' && selecionada) {
    const cor = getCor(selecionada.categoria)
    return (
      <div style={base}>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <Toast toast={toast} />

        <div style={{ background: GRAD, padding: '48px 16px 18px', position: 'sticky', top: 0, zIndex: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <BtnVoltar onClick={() => setTela('lista')} />
            <div style={{ flex: 1 }}>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2 }}>{selecionada.categoria}</div>
              <div style={{ color: '#fff', fontSize: 14, fontWeight: 700, lineHeight: 1.2 }}>{selecionada.titulo}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.13)', borderRadius: 12, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{selecionada.icone}</div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <button onClick={() => abrirEditar(selecionada)} style={{ flex: 1, background: '#fff', border: 'none', borderRadius: 12, padding: '9px', fontSize: 12, fontWeight: 700, color: '#1a56db', cursor: 'pointer' }}>✏️ Editar Protocolo</button>
            <button onClick={() => setConfirmDelete(true)} style={{ background: 'rgba(239,68,68,0.2)', border: 'none', borderRadius: 12, padding: '9px 14px', fontSize: 14, cursor: 'pointer' }}>🗑️</button>
          </div>
        </div>

        <div style={{ padding: '18px 14px 90px' }}>
          {selecionada.protocolo ? (
            <div style={{ background: '#fff', borderRadius: 20, padding: '20px 18px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', fontSize: 13, lineHeight: 1.75, color: '#334155' }}
              dangerouslySetInnerHTML={{ __html: md(selecionada.protocolo) }} />
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📝</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#64748b' }}>Nenhum protocolo cadastrado</div>
              <div style={{ fontSize: 12, marginTop: 6 }}>Toque em "Editar Protocolo" para adicionar o conteúdo.</div>
            </div>
          )}
          {selecionada.protocolo && (
            <div style={{ marginTop: 14, background: '#eff6ff', borderRadius: 12, padding: '11px 14px', display: 'flex', gap: 8 }}>
              <span>📌</span>
              <div style={{ fontSize: 11, color: '#1e40af', lineHeight: 1.5 }}>Confirme sempre com os protocolos locais vigentes.</div>
            </div>
          )}
        </div>

        {confirmDelete && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 100 }}>
            <div style={{ background: '#fff', borderRadius: '24px 24px 0 0', padding: '28px 24px 40px', width: '100%', maxWidth: 430 }}>
              <div style={{ fontSize: 36, textAlign: 'center', marginBottom: 12 }}>🗑️</div>
              <div style={{ textAlign: 'center', fontWeight: 700, fontSize: 16, color: '#1e293b', marginBottom: 6 }}>Excluir situação?</div>
              <div style={{ textAlign: 'center', fontSize: 13, color: '#64748b', marginBottom: 24 }}>"{selecionada.titulo}" será removida permanentemente.</div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setConfirmDelete(false)} style={{ flex: 1, background: '#f1f5f9', border: 'none', borderRadius: 14, padding: '14px', fontSize: 14, fontWeight: 600, color: '#64748b', cursor: 'pointer' }}>Cancelar</button>
                <button onClick={excluir} style={{ flex: 1, background: '#ef4444', border: 'none', borderRadius: 14, padding: '14px', fontSize: 14, fontWeight: 700, color: '#fff', cursor: 'pointer' }}>Excluir</button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ════════════════════════════════════════
  // TELA: EDITOR
  // ════════════════════════════════════════
  if (tela === 'editor') {
    const isNova = form._nova
    return (
      <div style={base}>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <Toast toast={toast} />

        <div style={{ background: GRAD, padding: '48px 16px 18px', position: 'sticky', top: 0, zIndex: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <BtnVoltar onClick={() => setTela(isNova ? 'lista' : 'protocolo')} />
            <div style={{ flex: 1 }}>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2 }}>{isNova ? 'Nova Situação' : 'Editar'}</div>
              <div style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>{isNova ? 'Adicionar protocolo' : selecionada?.titulo}</div>
            </div>
            <button onClick={salvar} disabled={salvando} style={{ background: '#fff', border: 'none', borderRadius: 12, padding: '9px 16px', fontSize: 13, fontWeight: 700, color: '#1a56db', cursor: 'pointer', opacity: salvando ? 0.7 : 1 }}>
              {salvando ? '⏳' : '💾 Salvar'}
            </button>
          </div>
        </div>

        <div style={{ padding: '16px 14px 100px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Ícone */}
          <div style={{ background: '#fff', borderRadius: 18, padding: '16px' }}>
            <Label>Ícone</Label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
              {ICONES.map(ic => (
                <button key={ic} onClick={() => setForm(f => ({ ...f, icone: ic }))} style={{ width: 40, height: 40, fontSize: 20, borderRadius: 10, border: form.icone === ic ? '2.5px solid #1a56db' : '1.5px solid #e2e8f0', background: form.icone === ic ? '#eff6ff' : '#f8fafc', cursor: 'pointer' }}>{ic}</button>
              ))}
            </div>
          </div>

          {/* Título e Categoria */}
          <div style={{ background: '#fff', borderRadius: 18, padding: '16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <Label>Título da Situação *</Label>
              <input value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} placeholder="Ex: Abertura de Pré-natal" style={inputStyle} />
            </div>
            <div>
              <Label>Categoria *</Label>
              <input value={novaCategoria || form.categoria}
                onChange={e => { const v = e.target.value; setNovaCategoria(v); setForm(f => ({ ...f, categoria: v })) }}
                placeholder="Ex: Pré-natal, Urgência..." style={inputStyle} list="cats" />
              <datalist id="cats">{categorias.map(c => <option key={c} value={c} />)}</datalist>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                {categorias.map(c => (
                  <button key={c} onClick={() => { setForm(f => ({ ...f, categoria: c })); setNovaCategoria('') }} style={{ background: form.categoria === c ? '#1a56db' : '#f1f5f9', color: form.categoria === c ? '#fff' : '#475569', border: 'none', borderRadius: 20, padding: '5px 12px', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>{c}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Editor */}
          <div style={{ background: '#fff', borderRadius: 18, padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <Label>Conteúdo do Protocolo</Label>
              <button onClick={() => setPreviewOn(p => !p)} style={{ background: previewOn ? '#1a56db' : '#f1f5f9', color: previewOn ? '#fff' : '#475569', border: 'none', borderRadius: 10, padding: '5px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                {previewOn ? '✏️ Editar' : '👁 Preview'}
              </button>
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 10 }}>Use: ## Seção, ### Sub, - item, &gt; alerta, **negrito**</div>

            {!previewOn && (
              <>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                  {[{ l: '## Seção', t: '## ' }, { l: '### Sub', t: '### ' }, { l: '- Item', t: '- ' }, { l: '> Alerta', t: '> ' }, { l: '**Bold**', t: '**' }, { l: '¶', t: '\n' }].map(b => (
                    <button key={b.l} onClick={() => inserir(b.t)} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, padding: '5px 10px', fontSize: 11, fontWeight: 600, color: '#475569', cursor: 'pointer', fontFamily: 'monospace' }}>{b.l}</button>
                  ))}
                </div>
                <textarea ref={textareaRef} value={form.protocolo} onChange={e => setForm(f => ({ ...f, protocolo: e.target.value }))}
                  placeholder={'## Título do Protocolo\n\n### 1. Anamnese\n- Item\n\n> Atenção: alerta'}
                  rows={16} style={{ ...inputStyle, fontFamily: 'monospace', fontSize: 12, lineHeight: 1.6, minHeight: 260, background: '#f8fafc' }} />
              </>
            )}

            {previewOn && (
              <div style={{ fontSize: 13, lineHeight: 1.75, color: '#334155', background: '#f8fafc', borderRadius: 12, padding: '16px', minHeight: 200 }}
                dangerouslySetInnerHTML={{ __html: md(form.protocolo) || '<span style="color:#94a3b8">Nenhum conteúdo ainda.</span>' }} />
            )}
          </div>

          <button onClick={salvar} disabled={salvando} style={{ background: '#1a56db', color: '#fff', border: 'none', borderRadius: 18, padding: '17px', fontSize: 15, fontWeight: 700, cursor: 'pointer', opacity: salvando ? 0.7 : 1 }}>
            {salvando ? 'Salvando...' : isNova ? '✅ Criar Situação' : '💾 Salvar Alterações'}
          </button>
        </div>
      </div>
    )
  }

  // ════════════════════════════════════════
  // TELA: SINCRONIZAR (GitHub Sync)
  // ════════════════════════════════════════
  if (tela === 'sincronizar') return (
    <div style={base}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      <Toast toast={toast} />
      <input type="file" accept=".json" ref={importRef} onChange={importarJSON} style={{ display: 'none' }} />

      <div style={{ background: GRAD, padding: '48px 16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <BtnVoltar onClick={() => setTela('home')} />
          <div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2 }}>Sincronização</div>
            <div style={{ color: '#fff', fontSize: 16, fontWeight: 700 }}>GitHub Sync</div>
          </div>
          <div style={{ marginLeft: 'auto', fontSize: 28 }}>🔄</div>
        </div>
      </div>

      <div style={{ padding: '20px 14px 80px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Explicação */}
        <div style={{ background: '#eff6ff', borderRadius: 16, padding: '16px', border: '1px solid #bfdbfe' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1e40af', marginBottom: 8 }}>📖 Como funciona o sync?</div>
          <div style={{ fontSize: 12, color: '#1e40af', lineHeight: 1.7 }}>
            1. Você edita protocolos aqui no app (dados ficam no celular)<br />
            2. <strong>Exporta</strong> o arquivo <code>protocolos.json</code><br />
            3. Substitui o arquivo em <code>src/data/protocolos.json</code> no GitHub<br />
            4. O GitHub Actions faz o deploy automático em ~1 min<br />
            5. Qualquer dispositivo novo já carrega os dados atualizados ✅
          </div>
        </div>

        {/* Stats */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 }}>Dados locais</div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1, background: '#f8fafc', borderRadius: 12, padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#1a56db' }}>{situacoes.length}</div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>situações</div>
            </div>
            <div style={{ flex: 1, background: '#f8fafc', borderRadius: 12, padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#1a56db' }}>{categorias.length}</div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>categorias</div>
            </div>
            <div style={{ flex: 1, background: '#f8fafc', borderRadius: 12, padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#1a56db' }}>{Math.round(JSON.stringify(situacoes).length / 1024)}kb</div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>tamanho</div>
            </div>
          </div>
        </div>

        {/* Exportar */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '18px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ background: '#ecfdf5', borderRadius: 10, padding: '8px', fontSize: 22 }}>⬇️</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>Exportar para GitHub</div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>Baixa protocolos.json com todos os dados</div>
            </div>
          </div>
          <button onClick={exportarJSON} style={{ width: '100%', background: '#1a56db', color: '#fff', border: 'none', borderRadius: 14, padding: '14px', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            ⬇️ Baixar protocolos.json
          </button>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 10, lineHeight: 1.5 }}>
            Após baixar, substitua o arquivo <strong>src/data/protocolos.json</strong> no seu repositório GitHub. O deploy acontece automaticamente.
          </div>
        </div>

        {/* Importar */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '18px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ background: '#fff7ed', borderRadius: 10, padding: '8px', fontSize: 22 }}>⬆️</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>Importar do GitHub</div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>Carrega um protocolos.json salvo</div>
            </div>
          </div>
          <button onClick={() => importRef.current?.click()} style={{ width: '100%', background: '#fff7ed', color: '#c2410c', border: '1.5px solid #fed7aa', borderRadius: 14, padding: '14px', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            ⬆️ Carregar protocolos.json
          </button>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 10, lineHeight: 1.5 }}>
            ⚠️ <strong>Substitui todos os dados locais.</strong> Use somente para restaurar ou migrar de dispositivo.
          </div>
        </div>

        {/* Reset */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '18px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #fee2e2' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#991b1b', marginBottom: 8 }}>🔁 Restaurar dados originais</div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 12, lineHeight: 1.5 }}>Apaga todos os dados locais e restaura os protocolos do repositório (seed inicial).</div>
          <button onClick={() => {
            if (window.confirm('Tem certeza? Todos os dados locais serão apagados.')) {
              persistir(dadosIniciais)
              toast_('Dados restaurados!')
            }
          }} style={{ background: '#fff', color: '#ef4444', border: '1.5px solid #fca5a5', borderRadius: 14, padding: '12px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            🗑️ Restaurar dados originais
          </button>
        </div>
      </div>
    </div>
  )

  return null
}
