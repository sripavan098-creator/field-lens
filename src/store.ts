import { Profile, FieldRecord, RecordStatus } from './types';
import { PROFILES } from './profiles';

const STORAGE_KEY = 'fieldlens-records';
const DEVICE_ID_KEY = 'fieldlens-device-id';

function generateId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}${random}`;
}

function getDeviceId(): string {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = `device-${Math.random().toString(36).substring(2, 10)}`;
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

export function getAllRecords(): FieldRecord[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveRecords(records: FieldRecord[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function addRecord(record: FieldRecord): void {
  const records = getAllRecords();
  records.unshift(record);
  saveRecords(records);
}

export function updateRecord(id: string, updater: (r: FieldRecord) => FieldRecord): FieldRecord | null {
  const records = getAllRecords();
  const idx = records.findIndex(r => r.id === id);
  if (idx === -1) return null;
  records[idx] = updater(records[idx]);
  saveRecords(records);
  return records[idx];
}

export function deleteRecord(id: string): void {
  const records = getAllRecords().filter(r => r.id !== id);
  saveRecords(records);
}

export function getRecordById(id: string): FieldRecord | null {
  return getAllRecords().find(r => r.id === id) || null;
}

export function getQueueDepth() {
  const records = getAllRecords();
  return {
    ready: records.filter(r => r.sync.status === 'verified' || r.sync.status === 'queued').length,
    review: records.filter(r => r.sync.status === 'needs_review' || r.sync.status === 'draft').length,
    stuck: records.filter(r => r.sync.status === 'conflict' || r.sync.status === 'failed').length,
    total: records.length,
  };
}

export function getRecordsByStatus(statuses: RecordStatus[]): FieldRecord[] {
  return getAllRecords().filter(r => statuses.includes(r.sync.status));
}

export function createRecordFromCapture(params: {
  kind: string;
  narration: string;
  site: string;
  operator: string;
  photoUrl?: string;
  durationMs: number;
}): FieldRecord {
  const { kind, narration, site, operator, photoUrl, durationMs } = params;
  const id = generateId();
  
  // Simple extraction from narration
  const extraction = extractFields(kind, narration);
  
  const record: FieldRecord = {
    id,
    kind,
    capturedAt: new Date().toISOString(),
    capture: {
      narration,
      site: site || 'unassigned',
      operator: operator || null,
      geo: null,
    },
    evidence: {
      photoCount: photoUrl ? 1 : 0,
      audioMs: durationMs || 0,
      photoUrl,
    },
    extraction: {
      fields: extraction.fields,
      confidence: extraction.confidence,
      engine: 'fieldlens-rules:v1',
      needsReview: extraction.needsReview,
      fieldSources: extraction.fieldSources,
      missingRequired: extraction.missingRequired,
    },
    narrative: extraction.narrative,
    sync: {
      status: extraction.needsReview ? 'needs_review' : 'verified',
      attempts: 0,
      idempotencyKey: `idem-${id}`,
      lastError: null,
      ackedAt: null,
      batchId: null,
    },
    provenance: {
      deviceId: getDeviceId(),
      appVersion: '0.1.0',
      createdOffline: true,
    },
    metrics: {
      extractionMs: Math.round(Math.random() * 200 + 50),
    },
  };
  
  return record;
}

function extractFields(kind: string, narration: string) {
  const text = narration.toLowerCase().trim();
  const fields: Record<string, any> = {};
  const fieldSources: Record<string, string> = {};
  const confidences: number[] = [];

  if (kind === 'invoice') {
    // Vendor
    const vendorMatch = text.match(/(?:vendor|supplier|from|seller|company)\s+(?:is|:)?\s*([a-z][a-z\s&.]{2,30}?)(?:\s+(?:invoice|number|dated|total|bill))/i);
    if (vendorMatch) { fields.vendor = vendorMatch[1].trim(); fieldSources.vendor = 'audio'; confidences.push(0.85); }
    
    // Invoice number
    const invMatch = text.match(/(?:invoice\s*(?:number|no)?|bill\s*number|ref|reference)\s*(?:is|:)?\s*([a-z]{0,4}[-/]?\d[\d\-/]{1,15})/i);
    if (invMatch) { fields.invoiceNumber = invMatch[1].toUpperCase(); fieldSources.invoiceNumber = 'audio'; confidences.push(0.92); }
    
    // Date
    const dateMatch = text.match(/(?:invoice\s*date|dated|date)\s*(?:is|:)?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\d{4}-\d{2}-\d{2})/i);
    if (dateMatch) { fields.invoiceDate = dateMatch[1]; fieldSources.invoiceDate = 'audio'; confidences.push(0.88); }
    
    // Total
    const totalMatch = text.match(/(?:total\s*(?:due)?|grand\s*total|amount\s*due)\s*(?:is|:)?\s*[$€£₹]?\s*(\d[\d,]*\.?\d*)/i);
    if (totalMatch) { fields.total = parseFloat(totalMatch[1].replace(/,/g, '')); fieldSources.total = 'audio'; confidences.push(0.94); }
    
    // Currency
    if (/\bdollars?\b|\busd\b|\$/.test(text)) { fields.currency = 'USD'; fieldSources.currency = 'audio'; confidences.push(0.85); }
    else if (/\beuros?\b|\beur\b|€/.test(text)) { fields.currency = 'EUR'; fieldSources.currency = 'audio'; confidences.push(0.85); }
    else if (/\bpounds?\b|\bgbp\b|£/.test(text)) { fields.currency = 'GBP'; fieldSources.currency = 'audio'; confidences.push(0.85); }
    else if (/\brupees?\b|\binr\b|₹/.test(text)) { fields.currency = 'INR'; fieldSources.currency = 'audio'; confidences.push(0.85); }
    
    // PO Number
    const poMatch = text.match(/(?:purchase\s*order|po\s*(?:number)?)\s*(?:is|:)?\s*([a-z]{0,4}[-/]?\d[\d\-/]{1,15})/i);
    if (poMatch) { fields.poNumber = poMatch[1].toUpperCase(); fieldSources.poNumber = 'audio'; confidences.push(0.88); }
  }
  
  if (kind === 'inspection') {
    // Asset ID
    const assetMatch = text.match(/(?:asset\s*(?:id)?|unit\s*(?:id)?|pole|meter|pump|valve|tower|bridge)\s*(?:id\s*)?(?:is|:)?\s*([a-z]{0,6}[-/]?\d[\da-z\-/]{0,15})/i);
    if (assetMatch) { fields.assetId = assetMatch[1].toUpperCase(); fieldSources.assetId = 'audio'; confidences.push(0.9); }
    
    // Defect class
    const defects: Record<string, string> = {
      corrosion: 'corrosion', rust: 'corrosion', crack: 'crack', cracked: 'crack',
      leak: 'leak', leaking: 'leak', deformation: 'deformation', bent: 'deformation',
      blockage: 'blockage', blocked: 'blockage', electrical: 'electrical',
    };
    for (const [word, canonical] of Object.entries(defects)) {
      if (new RegExp(`\\b${word}\\b`, 'i').test(text)) {
        fields.defectClass = canonical;
        fieldSources.defectClass = 'audio';
        confidences.push(0.88);
        break;
      }
    }
    
    // Severity
    if (/\bcritical\b/i.test(text)) { fields.severity = 'critical'; fieldSources.severity = 'audio'; confidences.push(0.85); }
    else if (/\bhigh\b|\bsevere\b|\burgent\b/i.test(text)) { fields.severity = 'high'; fieldSources.severity = 'audio'; confidences.push(0.85); }
    else if (/\bmedium\b|\bmoderate\b/i.test(text)) { fields.severity = 'medium'; fieldSources.severity = 'audio'; confidences.push(0.85); }
    else if (/\blow\b|\bminor\b/i.test(text)) { fields.severity = 'low'; fieldSources.severity = 'audio'; confidences.push(0.85); }
    
    // Location
    const locMatch = text.match(/(?:location|near|beside|outside|at)\s+(?:is|:)?\s*([a-z][a-z\s\d+]{2,40}?)(?:\s+(?:severity|action|need|reinspect))/i);
    if (locMatch) { fields.location = locMatch[1].trim(); fieldSources.location = 'audio'; confidences.push(0.75); }
    
    // Action
    const actionMatch = text.match(/(?:immediate\s*action|action|need\s*to|needs|recommend|required)\s*(?:is|:)?\s*([a-z][a-z\s]{2,60}?)(?:\s+(?:reinspect|next|due))/i);
    if (actionMatch) { fields.immediateAction = actionMatch[1].trim(); fieldSources.immediateAction = 'audio'; confidences.push(0.7); }
    
    // Reinspect days
    const daysMatch = text.match(/(?:reinspect\s*(?:in)?|next\s*inspection\s*in|review\s*in|check\s*again\s*in)\s*(\d{1,4})\s*(?:days?|weeks?)/i);
    if (daysMatch) { fields.nextInspectionDays = parseInt(daysMatch[1]); fieldSources.nextInspectionDays = 'audio'; confidences.push(0.85); }
  }
  
  if (kind === 'inventory') {
    // SKU
    const skuMatch = text.match(/(?:sku|part\s*number|part|item\s*number|code)\s*(?:is|:)?\s*([a-z]{0,5}[-/]?\d[\da-z\-/]{0,17})/i);
    if (skuMatch) { fields.sku = skuMatch[1].toUpperCase(); fieldSources.sku = 'audio'; confidences.push(0.92); }
    
    // Quantity
    const qtyMatch = text.match(/(?:quantity|qty|count|there\s*are|we\s*have|stock\s*of)\s*(?:is|:)?\s*(\d{1,6})/i);
    if (qtyMatch) { fields.quantity = parseInt(qtyMatch[1]); fieldSources.quantity = 'audio'; confidences.push(0.9); }
    
    // Unit
    const unitMatch = text.match(/\b(each|box(?:es)?|pallet|pallets|kg|kilos?|litres?|liters?|metres?|meters?)\b/i);
    if (unitMatch) {
      const unitMap: Record<string, string> = { boxes: 'box', pallets: 'pallet', kilos: 'kg', kilo: 'kg', litres: 'litre', liters: 'litre', metres: 'metre', meters: 'metre' };
      fields.unit = unitMap[unitMatch[1].toLowerCase()] || unitMatch[1].toLowerCase();
      fieldSources.unit = 'audio';
      confidences.push(0.8);
    }
    
    // Bin
    const binMatch = text.match(/(?:bin|bay|aisle|shelf|rack)\s*(?:is|:)?\s*([a-z]{0,4}[-/]?\d[\da-z\-/]{0,12})/i);
    if (binMatch) { fields.bin = binMatch[1].toUpperCase(); fieldSources.bin = 'audio'; confidences.push(0.85); }
    
    // Condition
    const condMatch = text.match(/\b(sealed|opened|damaged|expired)\b/i);
    if (condMatch) { fields.condition = condMatch[1].toLowerCase(); fieldSources.condition = 'audio'; confidences.push(0.85); }
    
    // Description
    const descMatch = text.match(/(?:description|consists\s*of|which\s*are)\s*(?:is|:)?\s*([a-z][a-z\s]{2,40}?)(?:\s+(?:quantity|qty|bin|there))/i);
    if (descMatch) { fields.description = descMatch[1].trim(); fieldSources.description = 'audio'; confidences.push(0.65); }
  }

  // Calculate missing required fields
  const profile = kind === 'invoice' ? 'invoice' : kind === 'inspection' ? 'inspection' : 'inventory';
  const profileFields = PROFILES[profile]?.fields || [];
  const missingRequired = profileFields
    .filter((f: any) => f.required && (fields[f.key] === null || fields[f.key] === undefined))
    .map((f: any) => f.key);

  const confidence = confidences.length 
    ? Math.max(0, Math.min(1, confidences.reduce((a, b) => a + b, 0) / confidences.length - 0.06 * missingRequired.length))
    : 0;

  const captured = Object.entries(fields)
    .filter(([, v]) => v !== null && v !== undefined)
    .map(([k, v]) => `${k}="${v}"`)
    .join(', ');

  const narrative = `Offline ${profile} capture. Operator said: "${narration}". Extracted ${captured || 'nothing'}.${missingRequired.length ? ` Unread required fields: ${missingRequired.join(', ')}.` : ''}`;

  return {
    fields,
    fieldSources,
    confidence: Math.round(confidence * 100) / 100,
    needsReview: confidence < 0.75 || missingRequired.length > 0,
    missingRequired,
    narrative,
  };
}

export function simulateSync(): { sent: number; acked: number; conflicted: number; rejected: number } {
  const records = getAllRecords();
  const ready = records.filter(r => r.sync.status === 'verified' || r.sync.status === 'queued');
  
  const updatedRecords = records.map(r => {
    if (r.sync.status === 'verified' || r.sync.status === 'queued') {
      return { ...r, sync: { ...r.sync, status: 'acked' as RecordStatus, ackedAt: new Date().toISOString(), batchId: `batch-${Date.now().toString(36)}` } };
    }
    return r;
  });
  
  saveRecords(updatedRecords);
  
  return {
    sent: ready.length,
    acked: ready.length,
    conflicted: 0,
    rejected: 0,
  };
}
