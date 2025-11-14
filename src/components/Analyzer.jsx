import { useEffect, useMemo, useState } from 'react'

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function StatCard({ title, value, sub }) {
  return (
    <div className="p-4 rounded-xl bg-white/70 backdrop-blur border border-gray-200 shadow-sm">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-semibold text-gray-900">{value}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  )
}

function CodePill({ code, display, confidence }) {
  const conf = Math.round((confidence || 0) * 100)
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-800">
      <span className="text-xs font-semibold">{code}</span>
      <span className="text-sm">{display}</span>
      <span className="ml-auto text-xs bg-white/70 px-2 py-0.5 rounded border border-blue-200">{conf}%</span>
    </div>
  )
}

function EntityRow({ e }) {
  return (
    <div className="flex items-start gap-2 p-2 rounded border bg-white">
      <div className="text-xs uppercase px-2 py-1 rounded bg-gray-100 text-gray-700">{e.type}</div>
      <div className="text-gray-800 font-medium">{e.normalized?.display || e.text}</div>
      <div className={`ml-auto text-xs px-2 py-0.5 rounded ${e.assertion === 'present' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-50 text-gray-600 border border-gray-200'}`}>
        {e.assertion}
      </div>
    </div>
  )
}

export default function Analyzer() {
  const [transcript, setTranscript] = useState('Patient: I have had fever and cough for three days.\nDoctor: Sounds like influenza. No pneumonia.\nPatient: Also a bit of sore throat.')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState(null)

  const analyze = async () => {
    setLoading(true); setError(null)
    try {
      const res = await fetch(`${BACKEND}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript })
      })
      if (!res.ok) throw new Error(`Analyze failed: ${res.status}`)
      const data = await res.json()
      setResult(data)
      fetchStats()
    } catch (e) {
      setError(e.message)
    } finally { setLoading(false) }
  }

  const fetchStats = async () => {
    try {
      const res = await fetch(`${BACKEND}/api/stats`)
      if (res.ok) setStats(await res.json())
    } catch {}
  }

  useEffect(() => { fetchStats() }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-50">
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Clinical Conversation Analyzer</h1>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <StatCard title="Conversations" value={stats?.totalConversations ?? '-'} />
            {stats?.topCodes?.[0] && (
              <StatCard title="Top Code" value={`${stats.topCodes[0].code}`} sub={stats.topCodes[0].display} />
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">Transcript</label>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              rows={12}
              className="w-full rounded-xl border border-gray-300 p-4 font-mono text-sm shadow-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 bg-white/80"
              placeholder="Paste the patient-doctor conversation here..."
            />
            <div className="flex items-center gap-3">
              <button onClick={analyze} disabled={loading}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50">
                {loading ? 'Analyzing...' : 'Analyze & Code'}
              </button>
              {error && <span className="text-sm text-red-600">{error}</span>}
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-white/70 backdrop-blur border border-gray-200 space-y-3">
              <div className="text-sm font-semibold text-gray-700">Detected Entities</div>
              {result?.entities?.length ? result.entities.map((e, i) => (
                <EntityRow key={i} e={e} />
              )) : (
                <div className="text-sm text-gray-500">Run analysis to see extracted findings.</div>
              )}
            </div>

            <div className="p-4 rounded-xl bg-white/70 backdrop-blur border border-gray-200 space-y-3">
              <div className="text-sm font-semibold text-gray-700">Proposed Codes</div>
              {result?.codeProposals?.length ? result.codeProposals.map((c, i) => (
                <CodePill key={i} code={c.code} display={c.display} confidence={c.confidence} />
              )) : (
                <div className="text-sm text-gray-500">No proposals yet.</div>
              )}
            </div>
          </div>
        </div>

        {result && (
          <div className="p-4 rounded-xl bg-white/70 border border-gray-200">
            <div className="text-sm text-gray-600">Conversation saved with ID:</div>
            <div className="font-mono text-gray-900">{result.conversationId}</div>
          </div>
        )}
      </div>
    </div>
  )
}
