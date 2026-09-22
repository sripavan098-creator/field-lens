import React, { useState, useEffect } from 'react';
import { PROFILES } from './profiles';
import { FieldRecord, FlowState } from './types';
import { getAllRecords, getRecordsByStatus } from './store';

export default function DesktopApp() {
  const [flow, setFlow] = useState<FlowState | null>(null);
  const [status, setStatus] = useState<{ text: string; tone: 'idle' | 'ok' | 'error' }>({ text: 'Starting…', tone: 'idle' });
  const [inboxBase, setInboxBase] = useState('http://127.0.0.1:12000');
  const [activeRecord, setActiveRecord] = useState<FieldRecord | null>(null);
  const [handover, setHandover] = useState<{ title: string; detail: string } | null>(null);
  const [resumeBanner, setResumeBanner] = useState<string | null>(null);

  useEffect(() => {
    loadFlow();
    const interval = setInterval(loadFlow, 3000);
    return () => clearInterval(interval);
  }, []);

  function loadFlow() {
    const records = getAllRecords();
    const acked = records.filter(r => r.sync.status === 'acked');
    const review = records.filter(r => r.sync.status === 'needs_review');

    if (acked.length === 0 && review.length === 0) {
      setFlow({
        batchId: null,
        deviceId: null,
        fingerprint: null,
        receivedAt: null,
        active: null,
        continuation: [],
        pendingReview: review,
      });
      setStatus({ text: `Watching ${inboxBase} · checked every 3s`, tone: 'ok' });
      return;
    }

    const latestBatch = acked[0]?.sync.batchId || `batch-${Date.now().toString(36)}`;
    const newFlow: FlowState = {
      batchId: latestBatch,
      deviceId: acked[0]?.provenance.deviceId || 'device-7f3a2b',
      fingerprint: 'a3f2c1',
      receivedAt: acked[0]?.sync.ackedAt || new Date().toISOString(),
      active: acked[0] || null,
      continuation: acked.slice(1),
      pendingReview: review,
    };

    if (flow?.batchId && flow.batchId !== newFlow.batchId) {
      setHandover({
        title: newFlow.active
          ? `Transfer received. Reopening ${describe(newFlow.active)}.`
          : 'Transfer received, but every record in it needs review.',
        detail: `${newFlow.continuation.length} more record(s) queued behind it. ${newFlow.pendingReview.length ? `${newFlow.pendingReview.length} flagged for review - not written to the ERP.` : ''}`,
      });
    }

    setFlow(newFlow);
    if (!activeRecord && newFlow.active) setActiveRecord(newFlow.active);
    setStatus({ text: `Watching ${inboxBase} · checked every 3s`, tone: 'ok' });
  }

  function describe(record: FieldRecord): string {
    const fields = record.extraction.fields;
    const label = ({ invoice: 'invoice', inspection: 'inspection', inventory: 'stock count' } as any)[record.kind] || record.kind;
    const headline = fields.invoiceNumber || fields.assetId || fields.sku || fields.vendor || record.id.slice(0, 8);
    return `${label} ${headline}`;
  }

  function summarise(record: FieldRecord): string {
    const entries = Object.entries(record.extraction.fields).filter(([, v]) => v != null);
    if (!entries.length) return 'no fields read';
    return entries.slice(0, 3).map(([k, v]) => `${k}=${v}`).join(', ') + (entries.length > 3 ? ` +${entries.length - 3}` : '');
  }

  function handleTouch(action: string) {
    if (action === 'resumed') {
      setResumeBanner(`You resumed the active record. The batch is unchanged.`);
    }
  }

  const displayRecord = activeRecord || flow?.active;

  return (
    <div className="min-h-screen bg-[#0d1418] text-[#e8f1f4] font-sans">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-gradient-to-b from-[#131e24] to-[#0d1418] border-b border-[#24343d] px-6 py-4 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#47d1a0] to-[#6cb8ff] flex items-center justify-center text-[#04120d] font-extrabold text-sm tracking-wide">
            FL
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-wide">Flow State Guardian</h1>
            <p className="text-xs text-[#93a8b1]">Resumes your desktop work the moment an Office Kit transfer lands</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-wider text-[#93a8b1]">Inbox</span>
            <input
              value={inboxBase}
              onChange={e => setInboxBase(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-[#24343d] bg-[#0a1114] text-[#e8f1f4] text-sm font-mono w-64"
              placeholder="http://127.0.0.1:12000"
            />
          </div>
          <button
            onClick={loadFlow}
            className="px-4 py-2 rounded-lg border border-[#24343d] text-sm hover:border-[#6cb8ff] transition-colors mt-4"
          >
            Check now
          </button>
        </div>
      </header>

      {/* Status */}
      <p className={`mx-6 mt-3 text-sm ${
        status.tone === 'ok' ? 'text-[#d5ffee]' :
        status.tone === 'error' ? 'text-[#ffd9d9]' :
        'text-[#93a8b1]'
      }`}>
        {status.text}
      </p>

      <main className="px-6 py-4 max-w-[1200px] mx-auto">
        {/* Handover banner */}
        {handover && (
          <div className="bg-[#47d1a0]/10 border border-[#47d1a0] rounded-xl p-4 mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-[#d5ffee]">{handover.title}</h2>
              <p className="text-xs text-[#93a8b1] mt-1">{handover.detail}</p>
            </div>
            <button
              onClick={() => setHandover(null)}
              className="px-3 py-1.5 rounded-lg border border-[#24343d] text-sm hover:border-[#6cb8ff] transition-colors"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Resume banner */}
        {resumeBanner && (
          <div className="bg-[#6cb8ff]/10 border border-[#6cb8ff] rounded-xl p-4 mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-[#cbe8ff]">Welcome back</h2>
              <p className="text-xs text-[#93a8b1] mt-1">{resumeBanner}</p>
            </div>
            <button
              onClick={() => setResumeBanner(null)}
              className="px-3 py-1.5 rounded-lg border border-[#24343d] text-sm hover:border-[#6cb8ff] transition-colors"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Empty state */}
        {(!flow?.active && !(flow?.continuation?.length) && !(flow?.pendingReview?.length)) && (
          <p className="text-sm text-[#93a8b1] py-8 text-center">
            Nothing has arrived yet. Capture on the phone, verify in the queue, then run an Office Kit
            sync while connected to this machine's network. This page polls the inbox and will take over
            the moment a bundle lands.
          </p>
        )}

        {/* Main layout */}
        {(flow?.active || (flow?.continuation?.length ?? 0) > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4">
            {/* Active record */}
            <div className="bg-[#131e24] border border-[#24343d] rounded-xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h2 className="text-base font-semibold">Resume here</h2>
                  <span className="text-xs text-[#93a8b1]">The record you were last on</span>
                </div>
              </div>

              {displayRecord ? (
                <div>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <h3 className="text-lg font-semibold">{describe(displayRecord)}</h3>
                      <p className="text-xs text-[#93a8b1] mt-1">
                        {new Date(displayRecord.capturedAt).toLocaleString()} · captured offline on {displayRecord.provenance.deviceId} · extracted by {displayRecord.extraction.engine}
                      </p>
                    </div>
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs border ${
                      displayRecord.extraction.needsReview
                        ? 'border-[#f2b344] text-[#ffe4b3]'
                        : 'border-[#47d1a0] text-[#b6ffe4]'
                    }`}>
                      {displayRecord.extraction.needsReview ? 'needs review' : `confidence ${Math.round(displayRecord.extraction.confidence * 100)}%`}
                    </span>
                  </div>

                  <p className="italic text-[#cfe0e6] text-sm mb-2">
                    {displayRecord.narrative || displayRecord.capture.narration}
                  </p>
                  <p className="text-xs text-[#93a8b1] mb-4">
                    Operator said: "{displayRecord.capture.narration}"
                  </p>

                  {/* ERP-style field display */}
                  <div className="space-y-2">
                    {(PROFILES[displayRecord.kind]?.fields || []).map(spec => {
                      const value = displayRecord.extraction.fields[spec.key];
                      const source = displayRecord.extraction.fieldSources?.[spec.key];
                      return (
                        <div key={spec.key} className={`flex items-center gap-3 py-1.5 px-3 rounded-lg ${value == null ? 'opacity-50' : 'bg-[#0d1418]/50'}`}>
                          <span className="text-xs text-[#93a8b1] w-36 shrink-0">{spec.key}</span>
                          <strong className="text-sm font-mono flex-1">
                            {value != null ? String(value) : '—'}
                          </strong>
                          {source && (
                            <span className="text-[10px] font-mono text-[#6cb8ff]">{source}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 mt-5">
                    <button
                      onClick={() => handleTouch('resumed')}
                      className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#2c8f6d] to-[#1f6e80] text-white text-sm font-semibold border-0"
                    >
                      Continue here (mark as active)
                    </button>
                    <button
                      onClick={() => handleTouch('confirmed')}
                      className="px-4 py-2 rounded-lg border border-[#24343d] text-sm hover:border-[#6cb8ff] transition-colors"
                    >
                      {displayRecord.extraction.needsReview ? 'Accept as-is into ERP' : 'Re-confirm in ERP'}
                    </button>
                    <button
                      onClick={() => handleTouch('flagged')}
                      className="px-4 py-2 rounded-lg border border-[#24343d] text-sm hover:border-[#6cb8ff] transition-colors bg-transparent"
                    >
                      {displayRecord.extraction.needsReview ? 'Keep flagged for review' : 'Flag for review'}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-[#93a8b1]">
                  No active record yet. It appears here the instant an Office Kit bundle lands.
                </p>
              )}
            </div>

            {/* Continuation list */}
            <div className="bg-[#131e24] border border-[#24343d] rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-base font-semibold">Continue with</h2>
                  <span className="text-xs text-[#93a8b1]">{flow?.continuation.length || 0} in this batch</span>
                </div>
              </div>
              <ul className="space-y-2">
                {(flow?.continuation || []).map(record => (
                  <li key={record.id}>
                    <button
                      onClick={() => setActiveRecord(record)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        activeRecord?.id === record.id
                          ? 'border-[#6cb8ff] bg-[#6cb8ff]/5'
                          : 'border-[#24343d] hover:border-[#6cb8ff]/50'
                      }`}
                    >
                      <span className="text-sm font-medium block">{describe(record)}</span>
                      <span className="text-xs text-[#93a8b1] block mt-0.5">{summarise(record)}</span>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] border ${
                        record.extraction.needsReview
                          ? 'border-[#f2b344] text-[#ffe4b3]'
                          : 'border-[#47d1a0] text-[#b6ffe4]'
                      }`}>
                        {record.extraction.needsReview ? 'review' : 'clean'}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-[#93a8b1] mt-3">
                Clicking one makes it the active record on this desktop, so closing the laptop and reopening it resumes the same place.
              </p>
            </div>
          </div>
        )}

        {/* Review list */}
        {flow && flow.pendingReview.length > 0 && (
          <div className="bg-[#131e24] border border-[#24343d] rounded-xl p-5 mt-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-base font-semibold">Held back from the ERP</h2>
                <span className="text-xs text-[#f2b344]">{flow.pendingReview.length} flagged</span>
              </div>
            </div>
            <ul className="space-y-2">
              {flow.pendingReview.map(record => (
                <li key={record.id} className="flex items-center gap-3 p-3 rounded-lg border border-[#24343d]">
                  <span className="text-sm font-medium">{describe(record)}</span>
                  <span className="text-xs text-[#93a8b1] flex-1">
                    {summarise(record)} · {record.extraction.missingRequired?.join(', ') || 'low confidence'}
                  </span>
                  <span className="text-[10px] text-[#93a8b1]">held out of the ERP until a human confirms</span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-[#93a8b1] mt-3">
              Low-confidence or incomplete records land here instead of in the ERP. A field worker can
              correct them in the queue on the phone and re-sync.
            </p>
          </div>
        )}

        {/* Transfer log */}
        <div className="bg-[#131e24] border border-[#24343d] rounded-xl p-5 mt-4">
          <h2 className="text-base font-semibold mb-2">Transfer log</h2>
          <p className="text-xs text-[#93a8b1]">
            {flow?.batchId
              ? `Batch ${flow.batchId.slice(0, 10)} from ${flow.deviceId} (code ${flow.fingerprint}) landed ${flow.receivedAt ? new Date(flow.receivedAt).toLocaleTimeString() : 'just now'}.`
              : 'No transfer has landed on this desktop yet.'}
          </p>
          <p className="text-xs text-[#93a8b1] font-mono mt-1">{inboxBase}</p>
        </div>
      </main>

      <footer className="max-w-[1200px] mx-auto px-6 py-6 text-xs text-[#93a8b1]">
        This shell reads the FieldLens inbox over the loopback interface only. It never writes a row
        into the ERP on its own, and it makes no outbound network call.
      </footer>
    </div>
  );
}
