import React, { useState } from 'react';
import MobileApp from './MobileApp';
import DesktopApp from './DesktopApp';

type AppView = 'mobile' | 'desktop' | 'overview';

function OverviewPage({ onSelect }: { onSelect: (view: AppView) => void }) {
  return (
    <div className="min-h-screen bg-[#0d1418] text-[#e8f1f4] font-sans">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#47d1a0]/10 via-transparent to-[#6cb8ff]/10" />
        <div className="relative max-w-5xl mx-auto px-6 py-16 md:py-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#47d1a0] to-[#6cb8ff] flex items-center justify-center text-[#04120d] font-extrabold text-xl tracking-wide shadow-lg shadow-[#47d1a0]/20">
              FL
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">FieldLens</h1>
              <p className="text-sm text-[#93a8b1]">Zero-connectivity field automator</p>
            </div>
          </div>

          <h2 className="text-3xl md:text-5xl font-bold leading-tight max-w-3xl mb-6">
            Point. Speak.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#47d1a0] to-[#6cb8ff]">
              Record.
            </span>
          </h2>
          <p className="text-lg text-[#93a8b1] max-w-2xl mb-10 leading-relaxed">
            A field worker points a phone at an invoice, a damaged pipe or a warehouse shelf, speaks what
            they see, and the phone turns that into a structured record — <strong className="text-[#e8f1f4]">without any network at all</strong>.
            Back at the office the record crosses to the desktop over the local link and the desktop
            puts the worker back on the exact record they were on.
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => onSelect('mobile')}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#2c8f6d] to-[#1f6e80] text-white font-semibold text-sm shadow-lg shadow-[#47d1a0]/20 hover:shadow-[#47d1a0]/30 transition-all hover:scale-[1.02]"
            >
              📱 Open Mobile Capture
            </button>
            <button
              onClick={() => onSelect('desktop')}
              className="px-6 py-3 rounded-xl border border-[#24343d] text-[#e8f1f4] font-semibold text-sm hover:border-[#6cb8ff] transition-all hover:scale-[1.02]"
            >
              🖥️ Open Desktop Guardian
            </button>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <h3 className="text-xl font-bold mb-8">How the pieces fit</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              icon: '🔍',
              title: 'Extraction Engine',
              desc: 'Turns narration + vision into fields, enforces the profile schema, flags anything it is unsure about.',
              tag: 'engine.js',
            },
            {
              icon: '💾',
              title: 'Local Store',
              desc: 'IndexedDB records and evidence blobs, content hashing, ULIDs. Everything stays on device.',
              tag: 'store.js',
            },
            {
              icon: '📡',
              title: 'Office Kit Transfer',
              desc: 'Packs the verified queue, sends it over the local link, and knows what happened to every record.',
              tag: 'transfer.js',
            },
            {
              icon: '📱',
              title: 'Mobile Capture UI',
              desc: 'Camera + mic as one control, profile picker, queue review, sync control.',
              tag: 'app.js',
            },
            {
              icon: '🖥️',
              title: 'Flow State Guardian',
              desc: 'Watches for a transfer and resumes the worker\'s last record the moment it lands.',
              tag: 'desktop.js',
            },
            {
              icon: '🔒',
              title: 'Record Contract',
              desc: 'The shape both sides agree on. Deduplication by content hash, never a client-supplied key.',
              tag: 'schema.json',
            },
          ].map(item => (
            <div key={item.title} className="bg-[#131e24] border border-[#24343d] rounded-xl p-5 hover:border-[#47d1a0]/30 transition-colors">
              <div className="text-2xl mb-2">{item.icon}</div>
              <h4 className="text-sm font-semibold mb-1">{item.title}</h4>
              <p className="text-xs text-[#93a8b1] leading-relaxed mb-2">{item.desc}</p>
              <code className="text-[10px] font-mono text-[#47d1a0] bg-[#47d1a0]/10 px-2 py-0.5 rounded">{item.tag}</code>
            </div>
          ))}
        </div>
      </div>

      {/* Key principles */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <h3 className="text-xl font-bold mb-8">The parts that are easy to get wrong</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              title: 'No duplicate ERP rows',
              desc: 'The desktop derives its own content hash from the bytes it received and deduplicates on that, never on a key the phone supplies. A phone that retries after a lost ack is recognised as a replay.',
              color: '#47d1a0',
            },
            {
              title: 'Evidence is kept, not summarised',
              desc: 'The original frame and audio are stored beside the extracted fields, and the desktop re-hashes every evidence blob on arrival. A record whose bytes do not match its stated hash is refused.',
              color: '#6cb8ff',
            },
            {
              title: 'Unsure records never reach the ERP',
              desc: 'Low confidence, a missing required field, or a value outside an enum marks the record for review. It stays out of the active row on the desktop and appears in the "held back" list.',
              color: '#f2b344',
            },
            {
              title: 'Offline is asserted, not assumed',
              desc: 'A bundle claiming a record was authored with connectivity is rejected at the envelope, so the "zero connectivity" property is enforced by the server rather than trusted from the client.',
              color: '#ff6b6b',
            },
          ].map(item => (
            <div key={item.title} className="bg-[#131e24] border border-[#24343d] rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                <h4 className="text-sm font-semibold">{item.title}</h4>
              </div>
              <p className="text-xs text-[#93a8b1] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Profiles */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <h3 className="text-xl font-bold mb-8">Extraction profiles</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              name: 'Invoice / Delivery Note',
              icon: '📄',
              fields: ['vendor', 'invoiceNumber', 'invoiceDate', 'total', 'currency', 'poNumber'],
              hint: 'Point at the document and say the vendor, number and total.',
            },
            {
              name: 'Infrastructure Inspection',
              icon: '🔧',
              fields: ['assetId', 'defectClass', 'severity', 'location', 'immediateAction'],
              hint: 'Point at the defect and say what it is, how bad, and where.',
            },
            {
              name: 'Warehouse Shelf',
              icon: '📦',
              fields: ['sku', 'quantity', 'unit', 'bin', 'condition', 'description'],
              hint: 'Point at the shelf and say the SKU, quantity and bin.',
            },
          ].map(p => (
            <div key={p.name} className="bg-[#131e24] border border-[#24343d] rounded-xl p-5">
              <div className="text-2xl mb-2">{p.icon}</div>
              <h4 className="text-sm font-semibold mb-1">{p.name}</h4>
              <p className="text-xs text-[#93a8b1] mb-3">{p.hint}</p>
              <div className="flex flex-wrap gap-1">
                {p.fields.map(f => (
                  <code key={f} className="text-[10px] font-mono text-[#47d1a0] bg-[#47d1a0]/10 px-1.5 py-0.5 rounded">{f}</code>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Architecture note */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="bg-gradient-to-br from-[#131e24] to-[#0d1418] border border-[#24343d] rounded-xl p-6 md:p-8">
          <h3 className="text-lg font-bold mb-3">Nothing calls the internet</h3>
          <p className="text-sm text-[#93a8b1] leading-relaxed max-w-3xl">
            There is no account, no cloud relay and no DNS lookup in any code path. The phone prefers a local
            Phi-3-Vision model on the NPU and, when the webview cannot host those weights, falls back to a
            deterministic rules extractor. It never invents a value to fill a field. The only outbound call
            is the Office Kit transfer to a machine on your own local network.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-1.5 text-xs text-[#93a8b1] bg-[#24343d]/50 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#47d1a0]" /> No cloud
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-[#93a8b1] bg-[#24343d]/50 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#47d1a0]" /> No account
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-[#93a8b1] bg-[#24343d]/50 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#47d1a0]" /> No DNS
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-[#93a8b1] bg-[#24343d]/50 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#47d1a0]" /> Offline-first
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-[#93a8b1] bg-[#24343d]/50 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#47d1a0]" /> Content-hash dedup
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-6 py-8 border-t border-[#24343d]">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#47d1a0] to-[#6cb8ff] flex items-center justify-center text-[#04120d] font-extrabold text-xs">
              FL
            </div>
            <span className="text-sm text-[#93a8b1]">FieldLens · Zero-connectivity field automator</span>
          </div>
          <div className="flex gap-4 text-xs text-[#93a8b1]">
            <span>JavaScript 58.4%</span>
            <span>Python 28.7%</span>
            <span>CSS 7.5%</span>
            <span>HTML 5.4%</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState<AppView>('overview');

  if (view === 'mobile') {
    return (
      <div>
        <div className="fixed top-4 left-4 z-50">
          <button
            onClick={() => setView('overview')}
            className="px-3 py-1.5 rounded-lg bg-[#131e24] border border-[#24343d] text-xs text-[#93a8b1] hover:text-[#e8f1f4] hover:border-[#6cb8ff] transition-colors shadow-lg"
          >
            ← Back to overview
          </button>
        </div>
        <MobileApp />
      </div>
    );
  }

  if (view === 'desktop') {
    return (
      <div>
        <div className="fixed top-4 left-4 z-50">
          <button
            onClick={() => setView('overview')}
            className="px-3 py-1.5 rounded-lg bg-[#131e24] border border-[#24343d] text-xs text-[#93a8b1] hover:text-[#e8f1f4] hover:border-[#6cb8ff] transition-colors shadow-lg"
          >
            ← Back to overview
          </button>
        </div>
        <DesktopApp />
      </div>
    );
  }

  return <OverviewPage onSelect={setView} />;
}
