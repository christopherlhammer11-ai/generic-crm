'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Bot,
  Edit,
  Trash2,
  Users,
  TrendingUp,
  Target,
  X,
  Send,
  ChevronDown,
  Zap,
  Activity,
  ArrowUpRight,
  BarChart3,
} from 'lucide-react';
import {
  Contact,
  mockContacts,
  formatCurrency,
  getStatusColor,
  getStatusDot,
  getInitials,
  getAvatarGradient,
  daysAgo,
  getPipelineInsights,
} from '@/lib/crm';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';

// ─── Empty state ─────────────────────────────────────────────────
const emptyContact: Partial<Contact> = {
  name: '',
  email: '',
  phone: '',
  company: '',
  status: 'lead',
  value: 0,
  notes: '',
  tags: [],
};

// ─── Logo component ─────────────────────────────────────────────
function SynthPipeLogo() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="28" height="28" rx="7" fill="url(#logo-grad)" />
      <path d="M8 18L12 10L16 15L20 8" stroke="#0B0F0D" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="20" cy="8" r="2" fill="#0B0F0D" />
      <defs>
        <linearGradient id="logo-grad" x1="0" y1="0" x2="28" y2="28">
          <stop stopColor="#34D399" />
          <stop offset="1" stopColor="#059669" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function SynthPipe() {
  const [contacts, setContacts] = useState<Contact[]>(mockContacts);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [formData, setFormData] = useState<Partial<Contact>>(emptyContact);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatError, setChatError] = useState<string | null>(null);
  const [ollamaConnected, setOllamaConnected] = useState<boolean | null>(null);

  // Load contacts from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('crm-contacts');
      if (stored) {
        try {
          setContacts(JSON.parse(stored));
        } catch (e) {
          // Fall back to mockContacts
        }
      }
    }
  }, []);

  // Save contacts to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined' && contacts.length > 0) {
      localStorage.setItem('crm-contacts', JSON.stringify(contacts));
    }
  }, [contacts]);

  // Check Ollama health on mount
  useEffect(() => {
    const checkOllama = async () => {
      try {
        const response = await fetch('http://localhost:11434/api/tags');
        setOllamaConnected(response.ok);
      } catch {
        setOllamaConnected(false);
      }
    };
    checkOllama();
  }, []);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/ai-assist',
      body: { contacts },
    }),
  });

  const isChatLoading = status === 'streaming' || status === 'submitted';

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;
    setChatError(null);
    try {
      sendMessage({ text: chatInput });
      setChatInput('');
    } catch (error) {
      setChatError(error instanceof Error ? error.message : 'Failed to send message');
    }
  };

  // ─── Derived ───────────────────────────────────────────────────
  const filteredContacts = contacts.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalValue = contacts.reduce((s, c) => s + c.value, 0);
  const leadCount = contacts.filter((c) => c.status === 'lead').length;
  const prospectCount = contacts.filter((c) => c.status === 'prospect').length;
  const customerCount = contacts.filter((c) => c.status === 'customer').length;
  const closedCount = contacts.filter((c) => c.status === 'closed').length;
  const avgDeal = contacts.length > 0 ? totalValue / contacts.length : 0;
  const insights = getPipelineInsights(contacts);

  // ─── CRUD ──────────────────────────────────────────────────────
  const openAdd = () => {
    setEditingContact(null);
    setFormData(emptyContact);
    setIsAddOpen(true);
  };

  const openEdit = (c: Contact) => {
    setEditingContact(c);
    setFormData({ ...c });
    setIsAddOpen(true);
  };

  const saveContact = () => {
    if (!formData.name || !formData.email) return;
    if (editingContact) {
      setContacts((p) =>
        p.map((c) =>
          c.id === editingContact.id
            ? { ...c, ...formData, lastContact: new Date().toISOString().split('T')[0] }
            : c
        )
      );
    } else {
      setContacts((p) => [
        ...p,
        {
          id: Date.now().toString(),
          name: formData.name!,
          email: formData.email!,
          phone: formData.phone || '',
          company: formData.company || '',
          status: (formData.status as Contact['status']) || 'lead',
          value: formData.value || 0,
          lastContact: new Date().toISOString().split('T')[0],
          notes: formData.notes || '',
          tags: formData.tags || [],
        },
      ]);
    }
    setFormData(emptyContact);
    setEditingContact(null);
    setIsAddOpen(false);
  };

  const deleteContact = (id: string) => {
    setContacts((p) => p.filter((c) => c.id !== id));
    setDeleteConfirm(null);
  };

  const cycleStatus = (id: string) => {
    const order: Contact['status'][] = ['lead', 'prospect', 'customer', 'closed'];
    setContacts((p) =>
      p.map((c) => {
        if (c.id !== id) return c;
        const idx = order.indexOf(c.status);
        return { ...c, status: order[(idx + 1) % order.length] };
      })
    );
  };

  // ─── Render ────────────────────────────────────────────────────
  return (
    <div style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '100vh' }}>
      {/* ═══ NAV ═══ */}
      <nav className="glass-nav" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            padding: '0 32px',
            height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <SynthPipeLogo />
            <span
              style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}
            >
              SynthPipe
            </span>
            <span
              className="font-mono"
              style={{
                fontSize: 10,
                padding: '2px 8px',
                background: 'var(--accent-glow)',
                color: 'var(--accent)',
                borderRadius: 4,
                border: '1px solid var(--accent-border)',
                fontWeight: 500,
              }}
            >
              AI
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              className="btn-ghost"
              onClick={() => setAiOpen(true)}
              style={{
                padding: '8px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 13,
              }}
            >
              <Zap size={14} style={{ color: 'var(--accent)' }} />
              Assistant
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: ollamaConnected === null ? 'var(--text-muted)' : ollamaConnected ? 'var(--accent)' : 'var(--red)',
                  boxShadow: ollamaConnected ? '0 0 8px var(--accent)' : 'none',
                  transition: 'all 0.3s',
                }}
              />
            </button>
            <button
              className="btn-primary"
              onClick={openAdd}
              style={{
                padding: '8px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Plus size={14} />
              New contact
            </button>
          </div>
        </div>
      </nav>

      {/* ═══ MAIN ═══ */}
      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 32px 64px' }}>

        {/* ── Metrics row ── */}
        <div
          className="animate-fadeUp"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 12,
            marginBottom: 24,
          }}
        >
          <MetricCard
            icon={<TrendingUp size={16} />}
            label="Pipeline value"
            value={formatCurrency(totalValue)}
            accent
          />
          <MetricCard
            icon={<Users size={16} />}
            label="Total contacts"
            value={String(contacts.length)}
            sub={`${customerCount} converted`}
          />
          <MetricCard
            icon={<BarChart3 size={16} />}
            label="Avg deal size"
            value={formatCurrency(avgDeal)}
          />
          <MetricCard
            icon={<Target size={16} />}
            label="Active pipeline"
            value={String(leadCount + prospectCount)}
            sub={`${leadCount} leads, ${prospectCount} prospects`}
          />
        </div>

        {/* ── Intelligence card ── */}
        <div
          className="animate-fadeUp animate-delay-1"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: 0,
            marginBottom: 24,
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: '24px 28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Activity size={14} style={{ color: 'var(--accent)' }} />
              <span className="section-label">Pipeline intelligence</span>
            </div>
            <p style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.5, color: 'var(--text-primary)', marginBottom: 4, maxWidth: 600 }}>
              {insights.nextBestAction}
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
              AI-synthesized recommendations based on your current pipeline data.
            </p>
          </div>
          <div
            style={{
              display: 'flex',
              borderLeft: '1px solid var(--border)',
            }}
          >
            <InsightStat label="Open value" value={formatCurrency(insights.totalOpenValue)} />
            <InsightStat label="Open deals" value={String(insights.openDealCount)} border />
            <InsightStat label="Follow-up" value={String(insights.staleContacts.length)} alert={insights.staleContacts.length > 0} />
          </div>
        </div>

        {/* ── Toolbar ── */}
        <div
          className="animate-fadeUp animate-delay-2"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ position: 'relative', flex: '0 1 340px' }}>
            <Search
              size={14}
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
            />
            <input
              className="form-input"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: 34, fontSize: 13 }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {(['all', 'lead', 'prospect', 'customer', 'closed'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  padding: '6px 14px',
                  borderRadius: 6,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: statusFilter === s ? 'var(--accent-glow)' : 'transparent',
                  color: statusFilter === s ? 'var(--accent)' : 'var(--text-muted)',
                  borderWidth: 1,
                  borderStyle: 'solid',
                  borderColor: statusFilter === s ? 'var(--accent-border)' : 'transparent',
                }}
              >
                {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
            <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 12, fontWeight: 500 }}>
              {filteredContacts.length} result{filteredContacts.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* ── Table ── */}
        <div
          className="animate-fadeUp animate-delay-3"
          style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--bg-card)' }}
        >
          <table className="crm-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', width: 260 }}>Contact</th>
                <th style={{ textAlign: 'left' }}>Company</th>
                <th style={{ textAlign: 'left' }}>Status</th>
                <th style={{ textAlign: 'left' }}>Value</th>
                <th style={{ textAlign: 'left' }}>Last contact</th>
                <th style={{ textAlign: 'left' }}>Tags</th>
                <th style={{ width: 80 }}></th>
              </tr>
            </thead>
            <tbody>
              {filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>
                    No contacts match your search.
                  </td>
                </tr>
              ) : (
                filteredContacts.map((contact) => (
                  <tr key={contact.id}>
                    {/* Contact */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div
                          className={`bg-gradient-to-br ${getAvatarGradient(contact.name)}`}
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 11,
                            fontWeight: 600,
                            color: '#fff',
                            flexShrink: 0,
                          }}
                        >
                          {getInitials(contact.name)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500, fontSize: 14 }}>{contact.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{contact.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Company */}
                    <td style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{contact.company}</td>

                    {/* Status */}
                    <td>
                      <button
                        onClick={() => cycleStatus(contact.id)}
                        className={getStatusColor(contact.status)}
                        style={{
                          fontSize: 12,
                          fontWeight: 500,
                          padding: '4px 12px',
                          borderRadius: 6,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                        title="Click to cycle status"
                      >
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: getStatusDot(contact.status),
                            display: 'inline-block',
                          }}
                        />
                        {contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
                      </button>
                    </td>

                    {/* Value */}
                    <td>
                      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent)' }}>
                        {formatCurrency(contact.value)}
                      </span>
                    </td>

                    {/* Last Contact */}
                    <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{daysAgo(contact.lastContact)}</td>

                    {/* Tags */}
                    <td>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {contact.tags.map((tag, i) => (
                          <span
                            key={i}
                            style={{
                              fontSize: 11,
                              fontWeight: 500,
                              padding: '3px 8px',
                              borderRadius: 4,
                              border: '1px solid var(--border)',
                              color: 'var(--text-secondary)',
                              background: 'var(--bg-secondary)',
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Actions */}
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <button
                          onClick={() => openEdit(contact)}
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: 6,
                            border: 'none',
                            background: 'transparent',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.15s',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-elevated)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
                        >
                          <Edit size={13} />
                        </button>
                        {deleteConfirm === contact.id ? (
                          <>
                            <button
                              onClick={() => deleteContact(contact.id)}
                              style={{
                                width: 30, height: 30, borderRadius: 6, border: 'none',
                                background: 'var(--red-dim)', color: 'var(--red)', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}
                            >
                              <Trash2 size={13} />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              style={{
                                width: 30, height: 30, borderRadius: 6, border: 'none',
                                background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}
                            >
                              <X size={13} />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(contact.id)}
                            style={{
                              width: 30, height: 30, borderRadius: 6, border: 'none',
                              background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              transition: 'all 0.15s',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.background = 'var(--red-dim)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Footer ── */}
        <div
          style={{
            marginTop: 48,
            paddingTop: 20,
            borderTop: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <SynthPipeLogo />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>SynthPipe</span>
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Built by Christopher L. Hammer
          </span>
        </div>
      </main>

      {/* ═══ ADD / EDIT MODAL ═══ */}
      {isAddOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
          }}
          onClick={() => setIsAddOpen(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 480,
              borderRadius: 12,
              padding: 28,
              background: 'var(--bg-card)',
              border: '1px solid var(--border-hover)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 600 }}>
                {editingContact ? 'Edit contact' : 'New contact'}
              </h2>
              <button
                onClick={() => setIsAddOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'grid', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="form-label">Name *</label>
                  <input
                    className="form-input"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">Company</label>
                  <input
                    className="form-input"
                    value={formData.company || ''}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Email *</label>
                <input
                  className="form-input"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="form-label">Phone</label>
                  <input
                    className="form-input"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">Deal value ($)</label>
                  <input
                    className="form-input"
                    type="number"
                    value={formData.value || 0}
                    onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Status</label>
                <select
                  className="form-input"
                  value={formData.status || 'lead'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as Contact['status'] })}
                >
                  <option value="lead">Lead</option>
                  <option value="prospect">Prospect</option>
                  <option value="customer">Customer</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="form-label">Notes</label>
                <textarea
                  className="form-input"
                  rows={3}
                  style={{ resize: 'none' }}
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes..."
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
              <button className="btn-ghost" onClick={() => setIsAddOpen(false)} style={{ padding: '8px 20px' }}>
                Cancel
              </button>
              <button className="btn-primary" onClick={saveContact} style={{ padding: '8px 20px' }}>
                {editingContact ? 'Save changes' : 'Add contact'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ AI ASSISTANT PANEL ═══ */}
      {aiOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <div
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
            onClick={() => setAiOpen(false)}
          />

          <div
            style={{
              position: 'relative',
              width: 420,
              maxWidth: '100%',
              height: '100vh',
              display: 'flex',
              flexDirection: 'column',
              background: 'var(--bg-secondary)',
              borderLeft: '1px solid var(--border)',
            }}
          >
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: 'var(--accent-glow)',
                    border: '1px solid var(--accent-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Zap size={14} style={{ color: 'var(--accent)' }} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>SynthPipe AI</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Powered by Ollama</div>
                </div>
              </div>
              <button
                onClick={() => setAiOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
              {chatError && (
                <div style={{ padding: 12, borderRadius: 8, background: 'var(--red-dim)', border: '1px solid var(--red-border)', color: 'var(--red)', fontSize: 13, marginBottom: 16 }}>
                  {chatError}
                </div>
              )}
              {messages.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center' }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: 'var(--accent-glow)',
                      border: '1px solid var(--accent-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 16,
                    }}
                  >
                    <Zap size={22} style={{ color: 'var(--accent)' }} />
                  </div>
                  <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Pipeline assistant</p>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7 }}>
                    &ldquo;Who should I follow up with?&rdquo;<br />
                    &ldquo;Analyze my high-value leads&rdquo;<br />
                    &ldquo;Suggest next actions for Sarah&rdquo;
                  </p>
                </div>
              ) : (
                messages.map((m, i) => (
                  <div
                    key={i}
                    style={{
                      marginBottom: 12,
                      display: 'flex',
                      justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <div
                      style={{
                        maxWidth: '85%',
                        padding: '10px 14px',
                        borderRadius: m.role === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                        fontSize: 13,
                        lineHeight: 1.6,
                        background: m.role === 'user' ? 'var(--accent)' : 'var(--bg-elevated)',
                        color: m.role === 'user' ? 'var(--bg-primary)' : 'var(--text-primary)',
                        border: m.role === 'user' ? 'none' : '1px solid var(--border)',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {m.parts
                        .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
                        .map((p) => p.text)
                        .join('')}
                    </div>
                  </div>
                ))
              )}
              {isChatLoading && (
                <div style={{ display: 'flex', gap: 4, padding: '8px 0' }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)', animation: 'pulse-glow 1s ease infinite', animationDelay: '0s' }} />
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)', animation: 'pulse-glow 1s ease infinite', animationDelay: '0.2s' }} />
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)', animation: 'pulse-glow 1s ease infinite', animationDelay: '0.4s' }} />
                </div>
              )}
            </div>

            {/* Input */}
            <form
              onSubmit={handleChatSubmit}
              style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}
            >
              <input
                className="form-input"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask about your pipeline..."
                style={{ flex: 1, fontSize: 13 }}
              />
              <button
                type="submit"
                disabled={isChatLoading || !chatInput.trim()}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 8,
                  border: 'none',
                  background: 'var(--accent)',
                  color: 'var(--bg-primary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: isChatLoading || !chatInput.trim() ? 0.3 : 1,
                  transition: 'opacity 0.2s',
                  flexShrink: 0,
                }}
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Metric Card ─────────────────────────────────────────────────
function MetricCard({ icon, label, value, sub, accent }: { icon: React.ReactNode; label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div
      style={{
        padding: '20px 24px',
        borderRadius: 12,
        background: accent ? 'var(--accent-glow)' : 'var(--bg-card)',
        border: `1px solid ${accent ? 'var(--accent-border)' : 'var(--border)'}`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ color: accent ? 'var(--accent)' : 'var(--text-muted)' }}>{icon}</span>
        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {label}
        </span>
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', color: accent ? 'var(--accent)' : 'var(--text-primary)' }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{sub}</div>
      )}
    </div>
  );
}

function InsightStat({ label, value, border, alert }: { label: string; value: string; border?: boolean; alert?: boolean }) {
  return (
    <div style={{
      padding: '20px 24px',
      borderLeft: border ? '1px solid var(--border)' : 'none',
      borderRight: border ? '1px solid var(--border)' : 'none',
      minWidth: 130,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
    }}>
      <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: 6, whiteSpace: 'nowrap' }}>
        {label}
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, color: alert ? 'var(--gold)' : 'var(--accent)' }}>{value}</div>
    </div>
  );
}
