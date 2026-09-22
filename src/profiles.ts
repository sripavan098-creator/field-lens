import { Profile } from './types';

export const PROFILES: Record<string, Profile> = {
  invoice: {
    key: 'invoice',
    label: 'Invoice / delivery note',
    hint: 'Point at the document and say the vendor, number and total.',
    fields: [
      { key: 'vendor', type: 'text', required: true },
      { key: 'invoiceNumber', type: 'text', required: true },
      { key: 'invoiceDate', type: 'date', required: true },
      { key: 'dueDate', type: 'date', required: false },
      { key: 'currency', type: 'enum', required: false, values: ['USD', 'EUR', 'GBP', 'INR', 'AUD', 'CAD'] },
      { key: 'subtotal', type: 'number', required: false },
      { key: 'tax', type: 'number', required: false },
      { key: 'total', type: 'number', required: true },
      { key: 'poNumber', type: 'text', required: false },
      { key: 'lineItemCount', type: 'integer', required: false },
    ],
  },
  inspection: {
    key: 'inspection',
    label: 'Infrastructure inspection',
    hint: 'Point at the defect and say what it is, how bad, and where.',
    fields: [
      { key: 'assetId', type: 'text', required: true },
      { key: 'defectClass', type: 'enum', required: true, values: ['corrosion', 'crack', 'leak', 'deformation', 'blockage', 'electrical', 'other'] },
      { key: 'severity', type: 'enum', required: true, values: ['low', 'medium', 'high', 'critical'] },
      { key: 'location', type: 'text', required: false },
      { key: 'immediateAction', type: 'text', required: false },
      { key: 'partReference', type: 'text', required: false },
      { key: 'nextInspectionDays', type: 'integer', required: false },
    ],
  },
  inventory: {
    key: 'inventory',
    label: 'Warehouse shelf',
    hint: 'Point at the shelf and say the SKU, quantity and bin.',
    fields: [
      { key: 'sku', type: 'text', required: true },
      { key: 'description', type: 'text', required: false },
      { key: 'quantity', type: 'integer', required: true },
      { key: 'unit', type: 'enum', required: false, values: ['each', 'box', 'pallet', 'kg', 'litre', 'metre'] },
      { key: 'bin', type: 'text', required: false },
      { key: 'condition', type: 'enum', required: false, values: ['sealed', 'opened', 'damaged', 'expired'] },
    ],
  },
};

export const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  needs_review: 'Needs review',
  verified: 'Verified',
  queued: 'Queued',
  transferring: 'Transferring',
  acked: 'On desktop',
  conflict: 'Conflict',
  failed: 'Failed',
};
