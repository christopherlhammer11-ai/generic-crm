'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Search,
  Bot,
  Edit,
  Trash2,
  DollarSign,
  Users,
  TrendingUp,
  Target,
  X,
  Send,
  ChevronDown,
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

export default function GenericCRM() {
  const [contacts, setContacts] = useState<Contact[]>(mockContacts);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [formData, setFormData] = useState<Partial<Contact>>(emptyContact);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');

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
    sendMessage({ text: chatInput });
    setChatInput('');
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
    <div style={{ background: 'var(--charcoal)', color: 'var(--off-white)', minHeight: '100vh' }}>
      {/* ═══ NAV ═══ */}
      <nav className="glass-nav" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '0 40px',
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 32,
                height: 32,
                background: 'var(--lake)',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <DollarSign size={16} color="var(--off-white)" />
            </div>
            <span
              className="font-mono"
              style={{ fontSize: 15, fontWeight: 700, letterSpacing: '0.08em' }}
            >
              GENERIC CRM
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="btn-ghost" onClick={() => setAiOpen(true)} style={{ padding: '10px 24px', display: 'flex', alignItems: 'center', gap: 8, borderRadius: 6 }}>
              <Bot size={14} />
              AI ASSISTANT
            </button>
            <button className="btn-lake" onClick={openAdd} style={{ padding: '10px 24px', display: 'flex', alignItems: 'center', gap: 8, borderRadius: 6 }}>
              <Plus size={14} />
              NEW CONTACT
            </button>
          </div>
        </div>
      </nav>

      {/* ═══ MAIN ═══ */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 40px' }}>
        {/* ── Hero area ── */}
        <div className="animate-fadeUp" style={{ marginBottom: 48 }}>
          <div className="section-label" style={{ marginBottom: 12 }}>
            LOCAL-FIRST SALES PIPELINE
          </div>
          <h1
            className="font-serif"
            style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 600, lineHeight: 1.2, marginBottom: 8 }}
          >
            Sales Pipeline
          </h1>
          <p style={{ color: 'var(--concrete)', fontSize: 14, maxWidth: 500 }}>
            AI-powered contact management with Ollama. Track leads, manage deals, and get intelligent follow-up suggestions.
          </p>
        </div>

        {/* ── Metrics ── */}
        <div
          className="animate-fadeUp animate-delay-1"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 2,
            marginBottom: 48,
          }}
        >
          <MetricCard label="Pipeline Value" value={formatCurrency(totalValue)} />
          <MetricCard label="Contacts" value={String(contacts.length)} />
          <MetricCard label="Avg Deal" value={formatCurrency(avgDeal)} />
          <MetricCard
            label="Active Leads"
            value={String(leadCount + prospectCount)}
            sub={`${leadCount} leads · ${prospectCount} prospects · ${customerCount} customers`}
          />
        </div>

        {/* ── Demo intelligence ── */}
        <div
          className="glass-card animate-fadeUp animate-delay-2"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 2,
            marginBottom: 32,
            overflow: 'hidden',
            borderRadius: 8,
          }}
        >
          <div style={{ padding: 24 }}>
            <div className="section-label" style={{ marginBottom: 12 }}>
              PIPELINE INTELLIGENCE
            </div>
            <h2 className="font-serif" style={{ fontSize: 24, fontWeight: 600, marginBottom: 10 }}>
              {insights.nextBestAction}
            </h2>
            <p style={{ color: 'var(--concrete)', fontSize: 14, lineHeight: 1.6, maxWidth: 620 }}>
              Demo mode now gives reviewers useful sales guidance even before Ollama is running.
              The AI assistant remains available for local model workflows, but the product no
              longer depends on a hidden service just to show value.
            </p>
          </div>
          <div
            style={{
              display: 'grid',
              gap: 1,
              background: 'rgba(244,243,239,0.06)',
            }}
          >
            <InsightStat label="Open Pipeline" value={formatCurrency(insights.totalOpenValue)} />
            <InsightStat label="Open Deals" value={String(insights.openDealCount)} />
            <InsightStat label="Needs Follow-Up" value={String(insights.staleContacts.length)} />
          </div>
        </div>

        {/* ── Toolbar ── */}
        <div
          className="animate-fadeUp animate-delay-2"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 24,
            gap: 20,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ position: 'relative', flex: '0 1 360px' }}>
            <Search
              size={14}
              style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--concrete)' }}
            />
            <input
              className="form-input"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: 38 }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {(['all', 'lead', 'prospect', 'customer', 'closed'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className="font-mono"
                style={{
                  fontSize: 9,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  padding: '8px 14px',
                  borderRadius: 4,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  background: statusFilter === s ? 'rgba(244,243,239,0.08)' : 'transparent',
                  color: statusFilter === s ? 'var(--off-white)' : 'var(--concrete)',
                }}
              >
                {s === 'all' ? 'All' : s}
              </button>
            ))}
            <span className="font-mono" style={{ fontSize: 9, color: 'var(--concrete)', marginLeft: 12, letterSpacing: '0.1em' }}>
              {filteredContacts.length} RESULT{filteredContacts.length !== 1 ? 'S' : ''}
            </span>
          </div>
        </div>

        {/* ── Table ── */}
        <div
          className="glass-card animate-fadeUp animate-delay-3"
          style={{ borderRadius: 8, overflow: 'hidden' }}
        >
          <table className="crm-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', width: 280 }}>Contact</th>
                <th style={{ textAlign: 'left' }}>Company</th>
                <th style={{ textAlign: 'left' }}>Status</th>
                <th style={{ textAlign: 'left' }}>Value</th>
                <th style={{ textAlign: 'left' }}>Last Contact</th>
                <th style={{ textAlign: 'left' }}>Tags</th>
                <th style={{ width: 90 }}></th>
              </tr>
            </thead>
            <tbody>
              {filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--concrete)' }}>
                    No contacts found.
                  </td>
                </tr>
              ) : (
                filteredContacts.map((contact) => (
                  <tr key={contact.id} className="group">
                    {/* Contact */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div
                          className="font-mono"
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            background: 'var(--lake)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 11,
                            fontWeight: 600,
                            flexShrink: 0,
                          }}
                        >
                          {getInitials(contact.name)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500, fontSize: 14 }}>{contact.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--concrete)' }}>{contact.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Company */}
                    <td style={{ fontSize: 14, color: 'var(--off-white)' }}>{contact.company}</td>

                    {/* Status */}
                    <td>
                      <button
                        onClick={() => cycleStatus(contact.id)}
                        className={`font-mono ${getStatusColor(contact.status)}`}
                        style={{
                          fontSize: 9,
                          letterSpacing: '0.15em',
                          textTransform: 'uppercase',
                          padding: '6px 12px',
                          borderRadius: 4,
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
                        {contact.status}
                        <ChevronDown size={10} style={{ opacity: 0.5 }} />
                      </button>
                    </td>

                    {/* Value */}
                    <td>
                      <span className="font-mono" style={{ fontSize: 14, fontWeight: 600, color: 'var(--lake)', letterSpacing: '-0.01em' }}>
                        {formatCurrency(contact.value)}
                      </span>
                    </td>

                    {/* Last Contact */}
                    <td style={{ fontSize: 13, color: 'var(--concrete)' }}>{daysAgo(contact.lastContact)}</td>

                    {/* Tags */}
                    <td>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {contact.tags.map((tag, i) => (
                          <span
                            key={i}
                            className="font-mono"
                            style={{
                              fontSize: 9,
                              letterSpacing: '0.1em',
                              textTransform: 'uppercase',
                              padding: '4px 8px',
                              borderRadius: 3,
                              border: '1px solid rgba(244,243,239,0.08)',
                              color: 'var(--concrete)',
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Actions */}
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                        <button
                          onClick={() => openEdit(contact)}
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 4,
                            border: 'none',
                            background: 'transparent',
                            color: 'var(--concrete)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--off-white)')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--concrete)')}
                        >
                          <Edit size={14} />
                        </button>
                        {deleteConfirm === contact.id ? (
                          <>
                            <button
                              onClick={() => deleteContact(contact.id)}
                              style={{
                                width: 32, height: 32, borderRadius: 4, border: 'none',
                                background: 'rgba(220,38,38,0.1)', color: '#ef4444', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}
                            >
                              <Trash2 size={14} />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              style={{
                                width: 32, height: 32, borderRadius: 4, border: 'none',
                                background: 'transparent', color: 'var(--concrete)', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}
                            >
                              <X size={14} />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(contact.id)}
                            style={{
                              width: 32, height: 32, borderRadius: 4, border: 'none',
                              background: 'transparent', color: 'var(--concrete)', cursor: 'pointer',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--concrete)')}
                          >
                            <Trash2 size={14} />
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
          className="font-mono"
          style={{
            marginTop: 48,
            paddingTop: 24,
            borderTop: '1px solid var(--rule-light)',
            textAlign: 'center',
            fontSize: 9,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'rgba(244,243,239,0.2)',
          }}
        >
          GENERIC CRM &middot; NEXT.JS + SHADCN/UI + OLLAMA &middot; BUILT BY CHRISTOPHER L. HAMMER
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
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
          }}
          onClick={() => setIsAddOpen(false)}
        >
          <div
            className="glass-card"
            style={{ width: '100%', maxWidth: 480, borderRadius: 8, padding: 32 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 className="font-serif" style={{ fontSize: 22, fontWeight: 600 }}>
                {editingContact ? 'Edit Contact' : 'New Contact'}
              </h2>
              <button
                onClick={() => setIsAddOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--concrete)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'grid', gap: 16 }}>
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
                  <label className="form-label">Deal Value ($)</label>
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

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
              <button className="btn-ghost" onClick={() => setIsAddOpen(false)} style={{ padding: '10px 24px', borderRadius: 6 }}>
                CANCEL
              </button>
              <button className="btn-lake" onClick={saveContact} style={{ padding: '10px 24px', borderRadius: 6 }}>
                {editingContact ? 'SAVE CHANGES' : 'ADD TO PIPELINE'}
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
          {/* Backdrop */}
          <div
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }}
            onClick={() => setAiOpen(false)}
          />

          {/* Panel */}
          <div
            className="glass-nav"
            style={{
              position: 'relative',
              width: 440,
              maxWidth: '100%',
              height: '100vh',
              display: 'flex',
              flexDirection: 'column',
              borderLeft: '1px solid var(--rule-light)',
            }}
          >
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--rule-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Bot size={16} style={{ color: 'var(--lake)' }} />
                  <span className="font-serif" style={{ fontSize: 18, fontWeight: 600 }}>AI Sales Assistant</span>
                </div>
                <span className="font-mono" style={{ fontSize: 9, letterSpacing: '0.15em', color: 'var(--concrete)', textTransform: 'uppercase' }}>
                  POWERED BY OLLAMA
                </span>
              </div>
              <button
                onClick={() => setAiOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--concrete)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
              {messages.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(58,90,74,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                    <Bot size={24} style={{ color: 'var(--lake)' }} />
                  </div>
                  <p style={{ fontSize: 15, fontWeight: 500, marginBottom: 8 }}>Ask me anything</p>
                  <p style={{ fontSize: 13, color: 'var(--concrete)', lineHeight: 1.6 }}>
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
                      marginBottom: 16,
                      display: 'flex',
                      justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <div
                      style={{
                        maxWidth: '85%',
                        padding: '12px 16px',
                        borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        fontSize: 13,
                        lineHeight: 1.7,
                        background: m.role === 'user' ? 'var(--lake)' : 'rgba(244,243,239,0.04)',
                        border: m.role === 'user' ? 'none' : '1px solid var(--rule-light)',
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
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--lake)', animation: 'fadeUp 0.6s ease infinite alternate' }} />
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--lake)', animation: 'fadeUp 0.6s ease 0.15s infinite alternate' }} />
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--lake)', animation: 'fadeUp 0.6s ease 0.3s infinite alternate' }} />
                </div>
              )}
            </div>

            {/* Input */}
            <form
              onSubmit={handleChatSubmit}
              style={{ padding: '16px 24px', borderTop: '1px solid var(--rule-light)', display: 'flex', gap: 8 }}
            >
              <input
                className="form-input"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask about your pipeline..."
                style={{ flex: 1 }}
              />
              <button
                type="submit"
                disabled={isChatLoading || !chatInput.trim()}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 6,
                  border: 'none',
                  background: 'var(--lake)',
                  color: 'var(--off-white)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: isChatLoading || !chatInput.trim() ? 0.4 : 1,
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
function MetricCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div
      className="glass-card"
      style={{ padding: '24px 28px', borderRadius: 0 }}
    >
      <div
        className="font-mono"
        style={{ fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--concrete)', marginBottom: 8 }}
      >
        {label}
      </div>
      <div
        className="font-mono"
        style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--off-white)' }}
      >
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 11, color: 'var(--concrete)', marginTop: 4 }}>{sub}</div>
      )}
    </div>
  );
}

function InsightStat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ padding: '18px 20px', background: 'rgba(10, 12, 11, 0.58)' }}>
      <div className="font-mono" style={{ fontSize: 9, letterSpacing: '0.14em', color: 'var(--concrete)', textTransform: 'uppercase', marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--lake)' }}>{value}</div>
    </div>
  );
}
