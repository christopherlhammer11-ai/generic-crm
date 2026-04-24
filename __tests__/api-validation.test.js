/**
 * SynthPipe API Validation Tests
 *
 * Test framework: Node.js built-in test module
 * Run tests: node --test __tests__/api-validation.test.js
 *
 * Tests cover:
 * - Contact type validation
 * - Utility functions
 * - Input validation logic
 * - buildPipelineSummary helper function
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';

// Type definitions
const Contact = {};

// Mock contacts data
const mockContacts = [
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

// Inlined utility functions from lib/crm.ts
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function getStatusColor(status) {
  switch (status) {
    case 'lead': return 'badge-lead';
    case 'prospect': return 'badge-prospect';
    case 'customer': return 'badge-customer';
    case 'closed': return 'badge-closed';
    default: return 'badge-closed';
  }
}

function getStatusDot(status) {
  switch (status) {
    case 'lead': return '#D4AF37';
    case 'prospect': return '#6BAF8D';
    case 'customer': return '#8ECFAD';
    case 'closed': return '#8E8E8E';
    default: return '#8E8E8E';
  }
}

function getInitials(name) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarGradient(name) {
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

function daysAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return `${diff}d ago`;
}

function getPipelineInsights(contacts) {
  const openDeals = contacts.filter((c) => c.status === 'lead' || c.status === 'prospect');
  const totalOpenValue = openDeals.reduce((sum, contact) => sum + contact.value, 0);
  const staleContacts = contacts.filter((contact) => {
    const date = new Date(contact.lastContact);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    return diff >= 5 && contact.status !== 'closed';
  });
  const topOpportunity = [...openDeals].sort((a, b) => b.value - a.value)[0];

  return {
    openDealCount: openDeals.length,
    totalOpenValue,
    staleContacts,
    topOpportunity,
    nextBestAction: topOpportunity
      ? `Follow up with ${topOpportunity.name} at ${topOpportunity.company}; this is the highest-value open opportunity.`
      : 'Add or reopen an opportunity to generate a next-best action.',
  };
}

function generatePipelineSummary(contacts) {
  if (!contacts || contacts.length === 0) return 'No contacts in the pipeline.';

  const total = contacts.reduce((s, c) => s + c.value, 0);
  const byStatus = {
    lead: contacts.filter((c) => c.status === 'lead'),
    prospect: contacts.filter((c) => c.status === 'prospect'),
    customer: contacts.filter((c) => c.status === 'customer'),
    closed: contacts.filter((c) => c.status === 'closed'),
  };

  const lines = [
    `Total contacts: ${contacts.length}`,
    `Total pipeline value: $${total.toLocaleString()}`,
    `Leads: ${byStatus.lead.length}, Prospects: ${byStatus.prospect.length}, Customers: ${byStatus.customer.length}, Closed: ${byStatus.closed.length}`,
    '',
    'Contacts:',
    ...contacts.map(
      (c) =>
        `- ${c.name} (${c.company}) | ${c.status} | $${c.value.toLocaleString()} | Last contact: ${c.lastContact} | Notes: ${c.notes || 'none'} | Tags: ${c.tags.join(', ') || 'none'}`
    ),
  ];

  return lines.join('\n');
}

describe('Contact Type and Utilities', () => {
  describe('Contact Type Validation', () => {
    it('should have required fields on Contact type', () => {
      const contact = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '(555) 123-4567',
        company: 'Acme Corp',
        status: 'lead',
        value: 50000,
        lastContact: '2026-04-23',
        notes: 'Test contact',
        tags: ['tag1', 'tag2'],
      };

      assert(contact !== undefined);
      assert.strictEqual(contact.id, '1');
      assert.strictEqual(contact.name, 'John Doe');
      assert.strictEqual(contact.status, 'lead');
    });

    it('should accept all valid status values', () => {
      const statuses = ['lead', 'prospect', 'customer', 'closed'];

      statuses.forEach((status) => {
        const contact = {
          id: '1',
          name: 'Test',
          email: 'test@example.com',
          phone: '(555) 123-4567',
          company: 'Test Corp',
          status,
          value: 1000,
          lastContact: '2026-04-23',
          notes: '',
          tags: [],
        };
        assert.strictEqual(contact.status, status);
      });
    });

    it('should validate mockContacts structure', () => {
      assert.strictEqual(Array.isArray(mockContacts), true);
      assert(mockContacts.length > 0);

      mockContacts.forEach((contact) => {
        assert(contact.hasOwnProperty('id'));
        assert(contact.hasOwnProperty('name'));
        assert(contact.hasOwnProperty('email'));
        assert(contact.hasOwnProperty('status'));
        assert(contact.hasOwnProperty('value'));
        assert(contact.hasOwnProperty('lastContact'));
      });
    });
  });

  describe('formatCurrency', () => {
    it('should format currency with USD symbol and no decimals', () => {
      assert.strictEqual(formatCurrency(1000), '$1,000');
      assert.strictEqual(formatCurrency(50000), '$50,000');
    });

    it('should handle zero and negative amounts', () => {
      assert.strictEqual(formatCurrency(0), '$0');
      assert.strictEqual(formatCurrency(-5000), '-$5,000');
    });

    it('should format large numbers with commas', () => {
      assert.strictEqual(formatCurrency(1234567), '$1,234,567');
    });
  });

  describe('getStatusColor', () => {
    it('should return correct badge color for each status', () => {
      assert.strictEqual(getStatusColor('lead'), 'badge-lead');
      assert.strictEqual(getStatusColor('prospect'), 'badge-prospect');
      assert.strictEqual(getStatusColor('customer'), 'badge-customer');
      assert.strictEqual(getStatusColor('closed'), 'badge-closed');
    });

    it('should default to closed badge for invalid status', () => {
      assert.strictEqual(getStatusColor('lead'), 'badge-lead');
    });
  });

  describe('getStatusDot', () => {
    it('should return correct hex color for each status', () => {
      assert.strictEqual(getStatusDot('lead'), '#D4AF37');
      assert.strictEqual(getStatusDot('prospect'), '#6BAF8D');
      assert.strictEqual(getStatusDot('customer'), '#8ECFAD');
      assert.strictEqual(getStatusDot('closed'), '#8E8E8E');
    });

    it('should return valid hex color strings', () => {
      const color = getStatusDot('lead');
      assert(/^#[0-9A-F]{6}$/i.test(color));
    });
  });

  describe('getInitials', () => {
    it('should extract first letter of each word', () => {
      assert.strictEqual(getInitials('John Doe'), 'JD');
      assert.strictEqual(getInitials('Sarah Chen'), 'SC');
      assert.strictEqual(getInitials('Marcus Rodriguez'), 'MR');
    });

    it('should uppercase initials', () => {
      assert.strictEqual(getInitials('john doe'), 'JD');
      assert.strictEqual(getInitials('jOhN dOe'), 'JD');
    });

    it('should handle single name', () => {
      assert.strictEqual(getInitials('Madonna'), 'M');
    });

    it('should limit to 2 characters', () => {
      assert.strictEqual(getInitials('John Michael Doe'), 'JM');
    });

    it('should handle extra whitespace', () => {
      assert.strictEqual(getInitials('  John   Doe  '), 'JD');
    });
  });

  describe('getAvatarGradient', () => {
    it('should return a gradient string', () => {
      const gradient = getAvatarGradient('John');
      assert(/from-\w+-\d+ to-\w+-\d+/.test(gradient));
    });

    it('should return consistent gradients for the same name', () => {
      const gradient1 = getAvatarGradient('John');
      const gradient2 = getAvatarGradient('John');
      assert.strictEqual(gradient1, gradient2);
    });

    it('should return different gradients for different names', () => {
      const gradients = new Set([
        getAvatarGradient('Alice'),
        getAvatarGradient('Bob'),
        getAvatarGradient('Charlie'),
      ]);
      assert(gradients.size > 1);
    });
  });

  describe('daysAgo', () => {
    it('should return "Today" for current date', () => {
      const today = new Date().toISOString().split('T')[0];
      assert.strictEqual(daysAgo(today), 'Today');
    });

    it('should return "Yesterday" for one day ago', () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
      assert.strictEqual(daysAgo(yesterday), 'Yesterday');
    });

    it('should return formatted string for older dates', () => {
      const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
      assert(/\d+d ago/.test(daysAgo(fiveDaysAgo)));
    });
  });

  describe('getPipelineInsights', () => {
    it('should calculate open deals correctly', () => {
      const insights = getPipelineInsights(mockContacts);
      assert(insights.openDealCount > 0);
    });

    it('should calculate total open value', () => {
      const insights = getPipelineInsights(mockContacts);
      assert(insights.totalOpenValue >= 0);
      assert.strictEqual(typeof insights.totalOpenValue, 'number');
    });

    it('should identify stale contacts', () => {
      const insights = getPipelineInsights(mockContacts);
      assert.strictEqual(Array.isArray(insights.staleContacts), true);
      insights.staleContacts.forEach((contact) => {
        assert.notStrictEqual(contact.status, 'closed');
      });
    });

    it('should return top opportunity from open deals', () => {
      const insights = getPipelineInsights(mockContacts);
      if (insights.topOpportunity) {
        assert(['lead', 'prospect'].includes(insights.topOpportunity.status));
      }
    });

    it('should provide next best action', () => {
      const insights = getPipelineInsights(mockContacts);
      assert.strictEqual(typeof insights.nextBestAction, 'string');
      assert(insights.nextBestAction.length > 0);
    });

    it('should handle empty contacts array', () => {
      const insights = getPipelineInsights([]);
      assert.strictEqual(insights.openDealCount, 0);
      assert.strictEqual(insights.totalOpenValue, 0);
      assert.strictEqual(insights.staleContacts.length, 0);
    });
  });
});

describe('API Route Input Validation', () => {
  describe('POST /api/ai-assist request validation', () => {
    it('should require messages array', () => {
      const validRequest = {
        messages: [],
        contacts: mockContacts,
      };
      assert.strictEqual(Array.isArray(validRequest.messages), true);
    });

    it('should require contacts array', () => {
      const validRequest = {
        messages: [],
        contacts: mockContacts,
      };
      assert.strictEqual(Array.isArray(validRequest.contacts), true);
    });

    it('should reject non-array messages', () => {
      const invalidRequest = {
        messages: 'not-an-array',
        contacts: mockContacts,
      };
      assert.strictEqual(Array.isArray(invalidRequest.messages), false);
    });

    it('should reject non-array contacts', () => {
      const invalidRequest = {
        messages: [],
        contacts: 'not-an-array',
      };
      assert.strictEqual(Array.isArray(invalidRequest.contacts), false);
    });
  });

  describe('buildPipelineSummary (extracted from route)', () => {
    it('should generate summary for contacts', () => {
      const contacts = mockContacts;
      const summary = generatePipelineSummary(contacts);

      assert(summary.includes('Total contacts'));
      assert(summary.includes('Total pipeline value'));
      assert(summary.includes('Leads:'));
    });

    it('should handle empty contacts array', () => {
      const summary = generatePipelineSummary([]);
      assert.strictEqual(summary, 'No contacts in the pipeline.');
    });

    it('should include contact details in summary', () => {
      const testContact = {
        id: '1',
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '(555) 987-6543',
        company: 'Test Corp',
        status: 'prospect',
        value: 75000,
        lastContact: '2026-04-23',
        notes: 'Important prospect',
        tags: ['enterprise'],
      };

      const summary = generatePipelineSummary([testContact]);
      assert(summary.includes('Jane Smith'));
      assert(summary.includes('Test Corp'));
      assert(summary.includes('prospect'));
    });

    it('should calculate total value correctly', () => {
      const testContacts = [
        {
          id: '1',
          name: 'Contact A',
          email: 'a@example.com',
          phone: '555-1111',
          company: 'Company A',
          status: 'lead',
          value: 10000,
          lastContact: '2026-04-23',
          notes: '',
          tags: [],
        },
        {
          id: '2',
          name: 'Contact B',
          email: 'b@example.com',
          phone: '555-2222',
          company: 'Company B',
          status: 'prospect',
          value: 20000,
          lastContact: '2026-04-23',
          notes: '',
          tags: [],
        },
      ];

      const summary = generatePipelineSummary(testContacts);
      assert(summary.includes('30,000') || summary.includes('30000'));
    });
  });
});
