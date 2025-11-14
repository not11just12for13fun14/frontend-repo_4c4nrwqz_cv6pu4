import Analyzer from './components/Analyzer'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-50">
      <header className="sticky top-0 bg-white/70 backdrop-blur border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-lg font-semibold text-gray-900">ClinDoc & Coding</div>
          <nav className="flex items-center gap-4 text-sm">
            <a href="/" className="text-indigo-700 font-medium">Analyzer</a>
            <a href="/test" className="text-gray-600 hover:text-gray-900">System Check</a>
          </nav>
        </div>
      </header>

      <Analyzer />

      <footer className="mt-10 border-t border-gray-200 bg-white/60">
        <div className="max-w-6xl mx-auto px-4 py-6 text-xs text-gray-500">
          Auto-extracts entities from conversations and proposes ICD-10-CM codes. Demo-only lexicon; connect to full terminology services for production.
        </div>
      </footer>
    </div>
  )
}

export default App
