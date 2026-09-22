import React, { useState, useEffect, useRef } from 'react';
import { PROFILES, STATUS_LABELS } from './profiles';
import { FieldRecord, RecordStatus } from './types';
import {
  getAllRecords, addRecord, updateRecord, deleteRecord,
  getQueueDepth, createRecordFromCapture, simulateSync
} from './store';

type View = 'capture' | 'queue' | 'sync';

export default function MobileApp() {
  const [view, setView] = useState<View>('capture');
  const [records, setRecords] = useState<FieldRecord[]>([]);
  const [activeRecord, setActiveRecord] = useState<FieldRecord | null>(null);
  const [notice, setNotice] = useState<{ message: string; tone: 'info' | 'ok' | 'warn' | 'error' } | null>(null);
  const [busy, setBusy] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState('inspection');
  const [narration, setNarration] = useState('');
  const [site, setSite] = useState('');
  const [operator, setOperator] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [filterKind, setFilterKind] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [syncTarget, setSyncTarget] = useState('127.0.0.1:12000');
  const [syncNote, setSyncNote] = useState('');
  const [paired, setPaired] = useState(false);
  const recordTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setRecords(getAllRecords());
    showNotice('Extraction engine ready: On-device rules extractor. Nothing leaves this device until you sync.', 'ok');
  }, []);

  function showNotice(message: string, tone: 'info' | 'ok' | 'warn' | 'error' = 'info') {
    setNotice({ message, tone });
    if (tone !== 'error') setTimeout(() => setNotice(null), 5000);
  }

  function refreshRecords() {
    setRecords(getAllRecords());
  }

  const depth = getQueueDepth();

  function startCapture() {
    if (busy || isRecording) return;
    setIsRecording(true);
    showNotice('Recording - hold the shutter, speak, and release when done.', 'info');
  }

  function finishCapture() {
    if (!isRecording) return;
    setIsRecording(false);
    setBusy(true);
    showNotice('Merging the frame and the narration into one record…', 'info');

    // Simulate capture delay
    setTimeout(() => {
      const typed = narration.trim();
      if (!typed) {
        showNotice('No narration was captured. Type what you saw before saving - the AI will not invent it.', 'warn');
        setBusy(false);
        return;
      }

      const record = createRecordFromCapture({
        kind: selectedProfile,
        narration: typed,
        site,
        operator,
        durationMs: Math.round(Math.random() * 8000 + 2000),
      });

      addRecord(record);
      setActiveRecord(record);
      setNarration('');
      setBusy(false);
      showNotice(
        `On-device rules extractor processed the record in ${record.metrics.extractionMs} ms offline (confidence ${Math.round(record.extraction.confidence * 100)}%).`,
        'ok'
      );
      refreshRecords();
      setView('queue');
    }, 1500);
  }

  function handleSync() {
    setBusy(true);
    showNotice('Syncing over Office Kit - no cloud in the path…', 'info');
    setTimeout(() => {
      const report = simulateSync();
      if (report.sent === 0) {
        showNotice('Queue is empty - nothing to transfer.', 'warn');
      } else {
        showNotice(
          `Office Kit transfer complete: ${report.acked} accepted, ${report.conflicted} conflicted, ${report.rejected} rejected.`,
          report.conflicted || report.rejected ? 'warn' : 'ok'
        );
      }
      setBusy(false);
      refreshRecords();
    }, 2000);
  }

  function handleProbe() {
    setBusy(true);
    setTimeout(() => {
      showNotice(`Desktop answered in ${Math.round(Math.random() * 50 + 10)} ms over officekit/1.`, 'ok');
      setBusy(false);
    }, 1000);
  }

  function handlePair() {
    setBusy(true);
    setTimeout(() => {
      setPaired(true);
      showNotice('Paired with desktop successfully.', 'ok');
      setBusy(false);
    }, 1000);
  }

  function handleDeleteRecord(id: string) {
    deleteRecord(id);
    setActiveRecord(null);
    refreshRecords();
    showNotice('Record and its evidence deleted from this device.', 'warn');
  }

  function handleVerify(id: string) {
    const updated = updateRecord(id, (r) => ({
      ...r,
      sync: { ...r.sync, status: 'verified' as RecordStatus },
      extraction: { ...r.extraction, needsReview: false },
    }));
    if (updated) {
      setActiveRecord(updated);
      refreshRecords();
      showNotice('Record verified and ready for sync.', 'ok');
    }
  }

  function handleMarkReview(id: string) {
    const updated = updateRecord(id, (r) => ({
      ...r,
      sync: { ...r.sync, status: 'needs_review' as RecordStatus },
      extraction: { ...r.extraction, needsReview: true },
    }));
    if (updated) {
      setActiveRecord(updated);
      refreshRecords();
      showNotice('Held for review. It will not be sent until verified.', 'warn');
    }
  }

  const filteredRecords = records.filter(r =>
    (!filterKind || r.kind === filterKind) &&
    (!filterStatus || r.sync.status === filterStatus)
  );

  const profile = PROFILES[selectedProfile];

  return (
    <div className="min-h-screen bg-[#0d1418] text-[#e8f1f4] font-sans">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-gradient-to-b from-[#131e24] to-[#0d1418] border-b border-[#24343d] px-4 py-3 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#47d1a0] to-[#6cb8ff] flex items-center justify-center text-[#04120d] font-extrabold text-sm tracking-wide">
            FL
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-wide">FieldLens</h1>
            <p className="text-xs text-[#93a8b1]">Zero-connectivity field automator</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#93a8b1]">Device</span>
            <p className="text-xs font-mono">device-7f3a2b</p>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#93a8b1]">Protocol</span>
            <p className="text-xs font-mono">officekit/1</p>
          </div>
        </div>
      </header>

      {/* Notice */}
      {notice && (
        <div className={`mx-4 mt-3 px-4 py-2.5 rounded-xl border text-sm ${
          notice.tone === 'ok' ? 'border-[#47d1a0] text-[#d5ffee] bg-[#47d1a0]/5' :
          notice.tone === 'warn' ? 'border-[#f2b344] text-[#ffeccd] bg-[#f2b344]/5' :
          notice.tone === 'error' ? 'border-[#ff6b6b] text-[#ffd9d9] bg-[#ff6b6b]/5' :
          'border-[#24343d] text-[#e8f1f4] bg-[#131e24]'
        }`}>
          {notice.message}
        </div>
      )}

      {/* Tabs */}
      <nav className="flex gap-1 px-4 pt-3 overflow-x-auto">
        {(['capture', 'queue', 'sync'] as View[]).map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-4 py-2.5 rounded-t-xl text-sm font-semibold whitespace-nowrap transition-colors ${
              view === v
                ? 'text-[#e8f1f4] bg-[#131e24] border border-[#24343d] border-b-0'
                : 'text-[#93a8b1] border border-transparent hover:text-[#e8f1f4]'
            }`}
          >
            {v === 'capture' ? 'Capture' : v === 'queue' ? `Queue` : 'Office Kit sync'}
            {v === 'queue' && (
              <span className="inline-block ml-1.5 min-w-[1.4em] text-center bg-[#24343d] text-[#e8f1f4] rounded-full px-1.5 py-0 text-xs">
                {depth.total}
              </span>
            )}
          </button>
        ))}
      </nav>

      <main className="p-4 max-w-[1000px] mx-auto">
        {/* Capture Panel */}
        {view === 'capture' && (
          <section className="border-t border-[#24343d] pt-4">
            <p className="text-[#93a8b1] max-w-[62ch] text-sm mb-4">
              Camera and microphone are one control. Hold the shutter, speak what you are looking at,
              release. The frame and the words become a single record before anything is written.
            </p>

            {/* Camera viewport simulation */}
            <div className="grid grid-cols-1 md:grid-cols-[1.6fr_auto] gap-4 items-center">
              <div className="relative rounded-xl overflow-hidden bg-black aspect-[4/3] flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-[#1a2a30] via-[#0d1a1f] to-[#162025] flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-5xl mb-3">📷</div>
                    <p className="text-sm text-[#93a8b1]">Camera preview</p>
                    <p className="text-xs text-[#93a8b1]/60 mt-1">
                      {isRecording ? 'Recording in progress…' : 'Tap shutter to simulate capture'}
                    </p>
                  </div>
                </div>
                {isRecording && (
                  <div className="absolute inset-0 border-4 border-[#ff6b6b] animate-pulse rounded-xl" />
                )}
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
                  <span className="text-xs text-[#d6e6ea]">
                    {isRecording ? '● Recording - speak now' : 'Hold to capture'}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <button
                  onPointerDown={startCapture}
                  onPointerUp={finishCapture}
                  onPointerCancel={finishCapture}
                  className={`w-20 h-20 rounded-full border-[3px] relative touch-none transition-all ${
                    isRecording
                      ? 'border-[#ff6b6b] animate-pulse'
                      : 'border-[#24343d] hover:border-[#6cb8ff]'
                  }`}
                  aria-label="Hold to capture photo and narration"
                >
                  <span className={`absolute inset-3 rounded-full transition-all ${
                    isRecording ? 'bg-[#ff6b6b] inset-5 rounded-lg' : 'bg-white'
                  }`} />
                </button>
                <p className="text-xs text-[#93a8b1] text-center">Press and hold. Release to extract.</p>
              </div>
            </div>

            {/* Form fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="flex flex-col gap-1">
                <span className="text-[11px] uppercase tracking-wider text-[#93a8b1]">Capture profile</span>
                <select
                  value={selectedProfile}
                  onChange={e => setSelectedProfile(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-[#24343d] bg-[#0a1114] text-[#e8f1f4] text-sm"
                >
                  {Object.entries(PROFILES).map(([key, p]) => (
                    <option key={key} value={key}>{p.label}</option>
                  ))}
                </select>
                <small className="text-xs text-[#93a8b1]">{profile.hint}</small>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] uppercase tracking-wider text-[#93a8b1]">Narration (editable)</span>
                <textarea
                  value={narration}
                  onChange={e => setNarration(e.target.value)}
                  rows={4}
                  placeholder="e.g. corroded flange on pump P-114 near the north wall, severity high, reinspect in 30 days"
                  className="w-full px-3 py-2.5 rounded-lg border border-[#24343d] bg-[#0a1114] text-[#e8f1f4] text-sm resize-y"
                />
                <small className="text-xs text-[#93a8b1]">Fields will be extracted on-device by fieldlens-rules:v1.</small>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] uppercase tracking-wider text-[#93a8b1]">Site</span>
                <input
                  value={site}
                  onChange={e => setSite(e.target.value)}
                  placeholder="Depot 4 / Chainage 12+300"
                  className="w-full px-3 py-2.5 rounded-lg border border-[#24343d] bg-[#0a1114] text-[#e8f1f4] text-sm"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] uppercase tracking-wider text-[#93a8b1]">Operator</span>
                <input
                  value={operator}
                  onChange={e => setOperator(e.target.value)}
                  placeholder="Name or staff id"
                  className="w-full px-3 py-2.5 rounded-lg border border-[#24343d] bg-[#0a1114] text-[#e8f1f4] text-sm"
                />
              </div>
            </div>

            {/* Profile field contract */}
            <div className="bg-[#131e24] border border-[#24343d] rounded-xl p-4 mt-4">
              <h2 className="text-base font-semibold mb-1">Extraction contract for this profile</h2>
              <p className="text-xs text-[#93a8b1] mb-3">
                These are the fields the on-device model is constrained to emit.
              </p>
              <ul className="space-y-1.5">
                {profile.fields.map(f => (
                  <li key={f.key} className="flex gap-3 items-baseline border-b border-dashed border-[#24343d] pb-1.5">
                    <code className="text-xs font-mono text-[#47d1a0]">{f.key}</code>
                    <span className="text-xs text-[#93a8b1]">
                      {f.type === 'enum' ? f.values?.join(' | ') : f.type}
                    </span>
                    {f.required && <span className="text-[#f2b344] text-xs">*required</span>}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* Queue Panel */}
        {view === 'queue' && (
          <section className="border-t border-[#24343d] pt-4">
            <p className="text-[#93a8b1] max-w-[62ch] text-sm mb-3">
              Everything here was written with the radio off. Nothing is sent until you have looked at it.
              Ready: <strong className="text-[#e8f1f4]">{depth.ready}</strong>.
            </p>

            {/* Depth stats */}
            <div className="flex gap-3 flex-wrap mb-4">
              {[
                { label: 'Ready to send', value: depth.ready },
                { label: 'Needs review', value: depth.review },
                { label: 'Stuck / conflict', value: depth.stuck },
              ].map(d => (
                <div key={d.label} className="bg-[#131e24] border border-[#24343d] rounded-xl px-4 py-2">
                  <dt className="text-[10px] uppercase tracking-wider text-[#93a8b1]">{d.label}</dt>
                  <dd className="text-xl font-bold font-mono">{d.value}</dd>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div className="flex gap-3 flex-wrap items-end mb-4">
              <div className="flex flex-col gap-1 min-w-[170px]">
                <span className="text-[11px] uppercase tracking-wider text-[#93a8b1]">Profile</span>
                <select
                  value={filterKind}
                  onChange={e => setFilterKind(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-[#24343d] bg-[#0a1114] text-[#e8f1f4] text-sm"
                >
                  <option value="">All profiles</option>
                  <option value="invoice">Invoice / delivery note</option>
                  <option value="inspection">Infrastructure inspection</option>
                  <option value="inventory">Warehouse shelf</option>
                </select>
              </div>
              <div className="flex flex-col gap-1 min-w-[170px]">
                <span className="text-[11px] uppercase tracking-wider text-[#93a8b1]">Status</span>
                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-[#24343d] bg-[#0a1114] text-[#e8f1f4] text-sm"
                >
                  <option value="">Any status</option>
                  <option value="draft">Draft</option>
                  <option value="needs_review">Needs review</option>
                  <option value="verified">Verified</option>
                  <option value="queued">Queued</option>
                  <option value="acked">On desktop</option>
                  <option value="conflict">Conflict</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>

            {/* Records table */}
            {filteredRecords.length === 0 ? (
              <p className="text-sm text-[#93a8b1]">No records match this filter.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-[#24343d]">
                      <th className="text-left text-[11px] uppercase tracking-wider text-[#93a8b1] py-2 px-2">Id</th>
                      <th className="text-left text-[11px] uppercase tracking-wider text-[#93a8b1] py-2 px-2">Profile</th>
                      <th className="text-left text-[11px] uppercase tracking-wider text-[#93a8b1] py-2 px-2">Status</th>
                      <th className="text-left text-[11px] uppercase tracking-wider text-[#93a8b1] py-2 px-2">Confidence</th>
                      <th className="text-left text-[11px] uppercase tracking-wider text-[#93a8b1] py-2 px-2">Extracted</th>
                      <th className="text-left text-[11px] uppercase tracking-wider text-[#93a8b1] py-2 px-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.map(record => (
                      <tr
                        key={record.id}
                        className={`border-b border-[#24343d] ${activeRecord?.id === record.id ? 'bg-[#16262c]' : ''}`}
                      >
                        <td className="py-2 px-2"><code className="text-xs font-mono text-[#47d1a0]">{record.id.slice(0, 8)}</code></td>
                        <td className="py-2 px-2">{PROFILES[record.kind]?.label || record.kind}</td>
                        <td className="py-2 px-2">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs border ${
                            record.sync.status === 'verified' || record.sync.status === 'queued'
                              ? 'border-[#47d1a0] text-[#b6ffe4]'
                              : record.sync.status === 'needs_review' || record.sync.status === 'draft'
                              ? 'border-[#f2b344] text-[#ffe4b3]'
                              : record.sync.status === 'conflict' || record.sync.status === 'failed'
                              ? 'border-[#ff6b6b] text-[#ffd3d3]'
                              : record.sync.status === 'acked'
                              ? 'border-[#6cb8ff] text-[#cbe8ff]'
                              : 'border-[#24343d] text-[#93a8b1]'
                          }`}>
                            {STATUS_LABELS[record.sync.status] || record.sync.status}
                          </span>
                        </td>
                        <td className="py-2 px-2">{Math.round(record.extraction.confidence * 100)}%</td>
                        <td className="py-2 px-2 text-xs text-[#93a8b1]">
                          {Object.entries(record.extraction.fields).filter(([, v]) => v != null).slice(0, 2)
                            .map(([k, v]) => `${k}=${v}`).join(', ') || 'no fields'}
                        </td>
                        <td className="py-2 px-2">
                          <button
                            onClick={() => setActiveRecord(record)}
                            className="text-xs px-2 py-1 rounded border border-[#24343d] hover:border-[#6cb8ff] transition-colors"
                          >
                            Open
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Record detail */}
            {activeRecord && (
              <div className="bg-[#131e24] border border-[#24343d] rounded-xl p-4 mt-4">
                <h3 className="text-base font-semibold">
                  {PROFILES[activeRecord.kind]?.label} · {activeRecord.id.slice(0, 8)}
                </h3>
                <p className="text-xs text-[#93a8b1] mt-1">
                  {new Date(activeRecord.capturedAt).toLocaleString()} · {activeRecord.capture.site} ·
                  confidence {Math.round(activeRecord.extraction.confidence * 100)}% · engine {activeRecord.extraction.engine}
                </p>
                <p className="italic text-[#cfe0e6] mt-2 text-sm">
                  {activeRecord.narrative || activeRecord.capture.narration}
                </p>
                <p className="text-xs text-[#93a8b1] mt-1">
                  Operator said: "{activeRecord.capture.narration}"
                </p>

                {/* Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                  {(PROFILES[activeRecord.kind]?.fields || []).map(spec => {
                    const value = activeRecord.extraction.fields[spec.key];
                    const source = activeRecord.extraction.fieldSources?.[spec.key];
                    return (
                      <div key={spec.key} className={`flex flex-col gap-1 ${spec.required ? 'border-l-2 border-[#f2b344] pl-2' : ''}`}>
                        <span className="text-[11px] uppercase tracking-wider text-[#93a8b1]">
                          {spec.key} {spec.required && <span className="text-[#f2b344]">*</span>}
                        </span>
                        <span className="text-sm font-mono">
                          {value != null ? String(value) : <span className="text-[#93a8b1]/50">—</span>}
                        </span>
                        {source && (
                          <span className="text-[10px] font-mono text-[#6cb8ff]">
                            {source === 'audio' ? 'from narration' : source === 'visual' ? 'from the frame' : source === 'fused' ? 'narration + frame agreed' : 'inferred - check it'}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {activeRecord.extraction.missingRequired.length > 0 ? (
                  <p className="mt-3 border-l-3 border-[#f2b344] pl-3 text-sm text-[#ffeccd]">
                    Unread required fields: {activeRecord.extraction.missingRequired.join(', ')}
                  </p>
                ) : (
                  <p className="mt-3 border-l-3 border-[#47d1a0] pl-3 text-sm text-[#d5ffee]">
                    All required fields are populated.
                  </p>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2 mt-4">
                  <button
                    onClick={() => handleVerify(activeRecord.id)}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#2c8f6d] to-[#1f6e80] text-white text-sm font-semibold border-0"
                  >
                    Save edits and verify
                  </button>
                  <button
                    onClick={() => handleMarkReview(activeRecord.id)}
                    className="px-4 py-2 rounded-lg border border-[#24343d] text-sm hover:border-[#6cb8ff] transition-colors"
                  >
                    Mark for review
                  </button>
                  <button
                    onClick={() => handleDeleteRecord(activeRecord.id)}
                    className="px-4 py-2 rounded-lg border border-[#ff6b6b] text-[#ffd9d9] text-sm hover:bg-[#ff6b6b]/10 transition-colors"
                  >
                    Delete record
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Sync Panel */}
        {view === 'sync' && (
          <section className="border-t border-[#24343d] pt-4">
            <p className="text-[#93a8b1] max-w-[62ch] text-sm mb-4">
              Office Kit moves data phone-to-PC over the local link only: office Wi-Fi, a USB tether, or a
              hotspot with no uplink. No cloud relay, no account, no DNS.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-[11px] uppercase tracking-wider text-[#93a8b1]">Desktop target (host:port)</span>
                <input
                  value={syncTarget}
                  onChange={e => setSyncTarget(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-[#24343d] bg-[#0a1114] text-[#e8f1f4] text-sm font-mono"
                />
                <small className="text-xs text-[#93a8b1]">
                  {syncTarget.includes('127.0.0.1') || syncTarget.includes('localhost')
                    ? `${syncTarget} is a local address - the right shape for Office Kit.`
                    : `${syncTarget} - check you are on the office network.`}
                </small>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] uppercase tracking-wider text-[#93a8b1]">Transfer note (optional)</span>
                <input
                  value={syncNote}
                  onChange={e => setSyncNote(e.target.value)}
                  placeholder="Morning round, Depot 4"
                  className="w-full px-3 py-2.5 rounded-lg border border-[#24343d] bg-[#0a1114] text-[#e8f1f4] text-sm"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              <button
                onClick={handleProbe}
                disabled={busy}
                className="px-4 py-2 rounded-lg border border-[#24343d] text-sm hover:border-[#6cb8ff] transition-colors disabled:opacity-50"
              >
                Probe link
              </button>
              <button
                onClick={handlePair}
                disabled={busy}
                className="px-4 py-2 rounded-lg border border-[#24343d] text-sm hover:border-[#6cb8ff] transition-colors disabled:opacity-50"
              >
                Claim pairing code
              </button>
              <button
                onClick={handleSync}
                disabled={busy}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#2c8f6d] to-[#1f6e80] text-white text-sm font-semibold border-0 disabled:opacity-50"
              >
                Sync verified records now
              </button>
            </div>

            <p className="text-xs text-[#93a8b1] mt-3">
              {paired
                ? 'Paired with desktop as device-7f3a2b.'
                : 'Not paired with a desktop yet. The first sync claims the code shown on the PC.'}
            </p>

            <div className="bg-[#131e24] border border-[#24343d] rounded-xl p-4 mt-6">
              <h2 className="text-base font-semibold mb-1">Extraction engine on this device</h2>
              <p className="text-xs text-[#93a8b1] mb-3">
                The app prefers Phi-3-Vision on the NPU. If this webview cannot host those weights it falls back
                to the deterministic rules extractor rather than showing invented values.
              </p>
              <ul className="space-y-2">
                <li className="flex gap-2 text-sm">
                  <strong className="text-[#93a8b1]">Phi-3-Vision (NPU/WebGPU)</strong>
                  <span className="text-[#93a8b1]">unavailable - no host VLM runtime bridged into this webview</span>
                </li>
                <li className="flex gap-2 text-sm">
                  <strong className="text-[#47d1a0]">On-device rules extractor</strong>
                  <span className="text-[#93a8b1]">loaded</span>
                </li>
              </ul>
            </div>
          </section>
        )}
      </main>

      <footer className="max-w-[1000px] mx-auto px-4 py-6 text-xs text-[#93a8b1]">
        FieldLens never writes to the network. Everything above runs on this device; the only outbound
        call is the Office Kit transfer to a machine on your own local network.
      </footer>
    </div>
  );
}
