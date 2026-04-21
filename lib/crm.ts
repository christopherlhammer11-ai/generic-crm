export type Contact = {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: 'lead' | 'prospect' | 'customer' | 'closed';
  value: number;
  lastContact: string;
  notes: string;
  tags: string[];
};

export const mockContacts: Contact[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    email: 'sarah@techflow.io',
    phone: '(415) 555-0123',
    company: 'TechFlow Inc.',
    status: 'prospect',
    value: 45000,
    lastContact: '2026-04-18',
    notes: 'Interested in enterprise plan. Follow up on pricing.',
    tags: ['SaaS', 'Enterprise'],
  },
  {
    id: '2',
    name: 'Marcus Rodriguez',
    email: 'marcus@buildly.co',
    phone: '(510) 555-0987',
    company: 'Buildly',
    status: 'lead',
    value: 12500,
    lastContact: '2026-04-20',
    notes: 'Demo scheduled for next week.',
    tags: ['Startup'],
  },
  {
    id: '3',
    name: 'Priya Patel',
    email: 'priya@greenenergy.dev',
    phone: '(650) 555-3344',
    company: 'GreenEnergy Solutions',
    status: 'customer',
    value: 78000,
    lastContact: '2026-04-15',
    notes: 'Renewal coming up in June.',
    tags: ['Renewable', 'Long-term'],
  },
  {
    id: '4',
    name: 'James Whitfield',
    email: 'james@nextstep.ai',
    phone: '(212) 555-7788',
    company: 'NextStep AI',
    status: 'lead',
    value: 32000,
    lastContact: '2026-04-19',
    notes: 'Reached out via LinkedIn. Interested in AI integration.',
    tags: ['AI', 'Startup'],
  },
  {
    id: '5',
    name: 'Elena Vasquez',
    email: 'elena@cloudvault.io',
    phone: '(305) 555-4412',
    company: 'CloudVault',
    status: 'customer',
    value: 95000,
    lastContact: '2026-04-10',
    notes: 'Upsell opportunity for premium tier.',
    tags: ['Cloud', 'Enterprise'],
  },
  {
    id: '6',
    name: 'David Kim',
    email: 'david@logistiq.com',
    phone: '(773) 555-6601',
    company: 'LogistiQ',
    status: 'closed',
    value: 18000,
    lastContact: '2026-03-28',
    notes: 'Lost to competitor. May revisit Q3.',
    tags: ['Logistics'],
  },
];

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getStatusColor(status: Contact['status']) {
  switch (status) {
    case 'lead': return 'badge-lead';
    case 'prospect': return 'badge-prospect';
    case 'customer': return 'badge-customer';
    case 'closed': return 'badge-closed';
    default: return 'badge-closed';
  }
}

export function getStatusDot(status: Contact['status']) {
  switch (status) {
    case 'lead': return '#D4AF37';
    case 'prospect': return '#6BAF8D';
    case 'customer': return '#8ECFAD';
    case 'closed': return '#8E8E8E';
    default: return '#8E8E8E';
  }
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getAvatarGradient(name: string): string {
  const gradients = [
    'from-violet-600 to-indigo-600',
    'from-rose-600 to-pink-600',
    'from-cyan-600 to-blue-600',
    'from-amber-600 to-orange-600',
    'from-emerald-600 to-teal-600',
    'from-fuchsia-600 to-purple-600',
  ];
  const index = name.charCodeAt(0) % gradients.length;
  return gradients[index];
}

export function daysAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return `${diff}d ago`;
}
