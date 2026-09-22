import { FieldRecord } from './types';

export const SAMPLE_RECORDS: FieldRecord[] = [
  {
    id: 'm1x7k2p3q4',
    kind: 'inspection',
    capturedAt: new Date(Date.now() - 3600000).toISOString(),
    capture: {
      narration: 'corroded flange on pump P-114 near the north wall, severity high, reinspect in 30 days, immediate action replace gasket',
      site: 'Depot 4 / Chainage 12+300',
      operator: 'J. Martinez',
      geo: null,
    },
    evidence: {
      photoCount: 1,
      audioMs: 8200,
    },
    extraction: {
      fields: {
        assetId: 'P-114',
        defectClass: 'corrosion',
        severity: 'high',
        location: 'north wall',
        immediateAction: 'replace gasket',
        nextInspectionDays: 30,
      },
      confidence: 0.91,
      engine: 'fieldlens-rules:v1',
      needsReview: false,
      fieldSources: {
        assetId: 'audio',
        defectClass: 'audio',
        severity: 'audio',
        location: 'audio',
        immediateAction: 'audio',
        nextInspectionDays: 'audio',
      },
      missingRequired: [],
    },
    narrative: 'Offline inspection capture. Operator said: "corroded flange on pump P-114 near the north wall, severity high, reinspect in 30 days, immediate action replace gasket". Extracted assetId="P-114", defectClass="corrosion", severity="high", location="north wall", immediateAction="replace gasket", nextInspectionDays=30.',
    sync: {
      status: 'verified',
      attempts: 0,
      idempotencyKey: 'idem-m1x7k2p3q4',
      lastError: null,
      ackedAt: null,
      batchId: null,
    },
    provenance: {
      deviceId: 'device-7f3a2b',
      appVersion: '0.1.0',
      createdOffline: true,
    },
    metrics: { extractionMs: 142 },
  },
  {
    id: 'n2y8l3r4s5',
    kind: 'invoice',
    capturedAt: new Date(Date.now() - 7200000).toISOString(),
    capture: {
      narration: 'invoice from Acme Supply, invoice number INV-2291, dated 15/09/2026, total $4,850.00, PO number PO-7721',
      site: 'Warehouse B',
      operator: 'J. Martinez',
      geo: null,
    },
    evidence: {
      photoCount: 1,
      audioMs: 6500,
    },
    extraction: {
      fields: {
        vendor: 'Acme Supply',
        invoiceNumber: 'INV-2291',
        invoiceDate: '2026-09-15',
        total: 4850.00,
        currency: 'USD',
        poNumber: 'PO-7721',
      },
      confidence: 0.89,
      engine: 'fieldlens-rules:v1',
      needsReview: false,
      fieldSources: {
        vendor: 'audio',
        invoiceNumber: 'audio',
        invoiceDate: 'audio',
        total: 'audio',
        currency: 'audio',
        poNumber: 'audio',
      },
      missingRequired: [],
    },
    narrative: 'Offline invoice capture. Operator said: "invoice from Acme Supply, invoice number INV-2291, dated 15/09/2026, total $4,850.00, PO number PO-7721". Extracted vendor="Acme Supply", invoiceNumber="INV-2291", invoiceDate="2026-09-15", total=4850, currency="USD", poNumber="PO-7721".',
    sync: {
      status: 'verified',
      attempts: 0,
      idempotencyKey: 'idem-n2y8l3r4s5',
      lastError: null,
      ackedAt: null,
      batchId: null,
    },
    provenance: {
      deviceId: 'device-7f3a2b',
      appVersion: '0.1.0',
      createdOffline: true,
    },
    metrics: { extractionMs: 98 },
  },
  {
    id: 'p3z9m4t5u6',
    kind: 'inventory',
    capturedAt: new Date(Date.now() - 1800000).toISOString(),
    capture: {
      narration: 'SKU BRG-4420, quantity 240 boxes, bin A-17, condition sealed, description ball bearing assembly',
      site: 'Warehouse A - Aisle 3',
      operator: 'K. Chen',
      geo: null,
    },
    evidence: {
      photoCount: 1,
      audioMs: 5100,
    },
    extraction: {
      fields: {
        sku: 'BRG-4420',
        quantity: 240,
        unit: 'box',
        bin: 'A-17',
        condition: 'sealed',
        description: 'ball bearing assembly',
      },
      confidence: 0.93,
      engine: 'fieldlens-rules:v1',
      needsReview: false,
      fieldSources: {
        sku: 'audio',
        quantity: 'audio',
        unit: 'audio',
        bin: 'audio',
        condition: 'audio',
        description: 'audio',
      },
      missingRequired: [],
    },
    narrative: 'Offline inventory capture. Operator said: "SKU BRG-4420, quantity 240 boxes, bin A-17, condition sealed, description ball bearing assembly". Extracted sku="BRG-4420", quantity=240, unit="box", bin="A-17", condition="sealed", description="ball bearing assembly".',
    sync: {
      status: 'needs_review',
      attempts: 0,
      idempotencyKey: 'idem-p3z9m4t5u6',
      lastError: null,
      ackedAt: null,
      batchId: null,
    },
    provenance: {
      deviceId: 'device-9c4e1d',
      appVersion: '0.1.0',
      createdOffline: true,
    },
    metrics: { extractionMs: 115 },
  },
  {
    id: 'q4a0n5v6w7',
    kind: 'inspection',
    capturedAt: new Date(Date.now() - 900000).toISOString(),
    capture: {
      narration: 'crack on valve V-207, severity critical, near the east manifold, needs immediate shutdown',
      site: 'Processing Unit 3',
      operator: 'J. Martinez',
      geo: null,
    },
    evidence: {
      photoCount: 1,
      audioMs: 4800,
    },
    extraction: {
      fields: {
        assetId: 'V-207',
        defectClass: 'crack',
        severity: 'critical',
        location: 'east manifold',
        immediateAction: 'immediate shutdown',
      },
      confidence: 0.87,
      engine: 'fieldlens-rules:v1',
      needsReview: false,
      fieldSources: {
        assetId: 'audio',
        defectClass: 'audio',
        severity: 'audio',
        location: 'audio',
        immediateAction: 'audio',
      },
      missingRequired: [],
    },
    narrative: 'Offline inspection capture. Operator said: "crack on valve V-207, severity critical, near the east manifold, needs immediate shutdown". Extracted assetId="V-207", defectClass="crack", severity="critical", location="east manifold", immediateAction="immediate shutdown".',
    sync: {
      status: 'verified',
      attempts: 0,
      idempotencyKey: 'idem-q4a0n5v6w7',
      lastError: null,
      ackedAt: null,
      batchId: null,
    },
    provenance: {
      deviceId: 'device-7f3a2b',
      appVersion: '0.1.0',
      createdOffline: true,
    },
    metrics: { extractionMs: 167 },
  },
  {
    id: 'r5b1o6x7y8',
    kind: 'invoice',
    capturedAt: new Date(Date.now() - 600000).toISOString(),
    capture: {
      narration: 'vendor Global Parts Ltd, invoice GP-8834, total 12500 dollars, dated 2026-09-20',
      site: 'Receiving Dock 2',
      operator: 'K. Chen',
      geo: null,
    },
    evidence: {
      photoCount: 1,
      audioMs: 5500,
    },
    extraction: {
      fields: {
        vendor: 'Global Parts Ltd',
        invoiceNumber: 'GP-8834',
        total: 12500,
        currency: 'USD',
        invoiceDate: '2026-09-20',
      },
      confidence: 0.85,
      engine: 'fieldlens-rules:v1',
      needsReview: false,
      fieldSources: {
        vendor: 'audio',
        invoiceNumber: 'audio',
        total: 'audio',
        currency: 'audio',
        invoiceDate: 'audio',
      },
      missingRequired: [],
    },
    narrative: 'Offline invoice capture. Operator said: "vendor Global Parts Ltd, invoice GP-8834, total 12500 dollars, dated 2026-09-20". Extracted vendor="Global Parts Ltd", invoiceNumber="GP-8834", total=12500, currency="USD", invoiceDate="2026-09-20".',
    sync: {
      status: 'needs_review',
      attempts: 0,
      idempotencyKey: 'idem-r5b1o6x7y8',
      lastError: null,
      ackedAt: null,
      batchId: null,
    },
    provenance: {
      deviceId: 'device-9c4e1d',
      appVersion: '0.1.0',
      createdOffline: true,
    },
    metrics: { extractionMs: 134 },
  },
];

export function seedSampleData() {
  const existing = localStorage.getItem('fieldlens-records');
  if (existing) {
    const records = JSON.parse(existing);
    if (records.length > 0) return; // Already has data
  }
  localStorage.setItem('fieldlens-records', JSON.stringify(SAMPLE_RECORDS));
}
