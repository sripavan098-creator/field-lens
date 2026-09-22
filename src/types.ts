export type FieldType = 'text' | 'number' | 'integer' | 'date' | 'enum';

export interface FieldSpec {
  key: string;
  type: FieldType;
  required: boolean;
  values?: string[];
}

export interface Profile {
  key: string;
  label: string;
  hint: string;
  fields: FieldSpec[];
}

export type RecordStatus = 'draft' | 'needs_review' | 'verified' | 'queued' | 'transferring' | 'acked' | 'conflict' | 'failed';

export interface FieldRecord {
  id: string;
  kind: string;
  capturedAt: string;
  capture: {
    narration: string;
    site: string;
    operator: string | null;
    geo: null;
  };
  evidence: {
    photoCount: number;
    audioMs: number;
    photoUrl?: string;
  };
  extraction: {
    fields: Record<string, any>;
    confidence: number;
    engine: string;
    needsReview: boolean;
    fieldSources: Record<string, string>;
    missingRequired: string[];
  };
  narrative: string;
  sync: {
    status: RecordStatus;
    attempts: number;
    idempotencyKey: string;
    lastError: string | null;
    ackedAt: string | null;
    batchId: string | null;
  };
  provenance: {
    deviceId: string;
    appVersion: string;
    createdOffline: boolean;
  };
  metrics: {
    extractionMs: number;
  };
}

export interface FlowState {
  batchId: string | null;
  deviceId: string | null;
  fingerprint: string | null;
  receivedAt: string | null;
  active: FieldRecord | null;
  continuation: FieldRecord[];
  pendingReview: FieldRecord[];
}
