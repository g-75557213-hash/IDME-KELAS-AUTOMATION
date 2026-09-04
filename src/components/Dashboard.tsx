import React, { useState } from 'react';
import { AppState, ParsedResult, AttendanceConstants } from '../types';
import { processLocalText, processWithGeminiAI, generateIdMEScript } from '../lib/engine';
import { Zap, Bot, Edit2, Play, CheckCircle2, AlertCircle } from 'lucide-react';

interface DashboardProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
  openConfig: () => void;
}

export function Dashboard({ state, updateState, openConfig }: DashboardProps) {
  const [inputText, setInputText] = useState('');
  const [results, setResults] = useState<ParsedResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleProcessLocal = () => {
    if (!inputText.trim()) return;
    setError(null);
    try {
      const data = processLocalText(inputText, state);
      setResults(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleProcessGemini = async () => {
    if (!inputText.trim()) return;
    setIsProcessing(true);
    setError(null);
    try {
      const data = await processWithGeminiAI(inputText, state);
      setResults(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const updateResult = (id: string, field: keyof ParsedResult, value: string) => {
    setResults(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const handleGenerateAndCopy = () => {
    const script = generateIdMEScript(results, state.settings.auto_submit);
    navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Main Input Area */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Main Input Area</h2>
          <div className="flex gap-2">
             <button onClick={openConfig} className="text-sm px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg font-medium hover:bg-blue-100 flex items-center gap-2">
               🎓 Modul Belajar
             </button>
          </div>
        </div>
        
        <textarea
          className="w-full h-40 p-4 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none font-sans text-gray-800 mb-4 bg-gray-50"
          placeholder="Paste WhatsApp text here..."
          value={inputText}
          onChange={e => setInputText(e.target.value)}
        ></textarea>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 border border-red-100 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={handleProcessLocal}
            className="py-3 bg-gray-800 hover:bg-gray-900 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <Zap className="w-5 h-5 text-yellow-400" /> 
            Process Local
          </button>
          <button
            onClick={handleProcessGemini}
            disabled={isProcessing}
            className="py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-75"
          >
            {isProcessing ? (
              <span className="animate-pulse">Processing...</span>
            ) : (
              <><Bot className="w-5 h-5 text-indigo-200" /> Tentukan dengan AI</>
            )}
          </button>
        </div>
      </div>

      {/* Results Data Table */}
      {results.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
            <h3 className="font-bold text-gray-800">Results Data Table</h3>
            <span className="text-sm font-medium text-gray-500">{results.length} students detected</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-white border-b text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Sub-Reason</th>
                  <th className="px-4 py-3">Detection Source</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result) => (
                  <tr key={result.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        {result.name}
                        <Edit2 className="w-3 h-3 text-gray-400 cursor-pointer" />
                      </div>
                      <div className="text-xs text-gray-400 font-normal mt-0.5">Raw: {result.originalName}</div>
                    </td>
                    <td className="px-4 py-3">
                      <select 
                        value={result.category}
                        onChange={(e) => {
                          const newCat = e.target.value;
                          const newSub = AttendanceConstants[newCat as keyof typeof AttendanceConstants][0];
                          updateResult(result.id, 'category', newCat);
                          updateResult(result.id, 'subReason', newSub);
                        }}
                        className="bg-white border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                      >
                        {Object.keys(AttendanceConstants).map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <select 
                        value={result.subReason}
                        onChange={(e) => updateResult(result.id, 'subReason', e.target.value)}
                        className="bg-white border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                      >
                        {AttendanceConstants[result.category as keyof typeof AttendanceConstants]?.map(sub => (
                          <option key={sub} value={sub}>{sub}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                        result.source === 'Gemini AI' ? 'bg-indigo-100 text-indigo-700' :
                        result.source === 'Alias Mapped' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {result.source}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Execution Bar */}
          <div className="p-4 bg-gray-50 border-t flex flex-col md:flex-row items-center justify-between gap-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={state.settings.auto_submit}
                  onChange={e => updateState(s => ({ ...s, settings: { ...s.settings, auto_submit: e.target.checked } }))}
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </div>
              <div>
                <div className="text-sm font-bold text-gray-800">Auto Simpan Sah</div>
                <div className="text-xs text-gray-500">Bypass confirmation modal</div>
              </div>
            </label>
            
            <button
              onClick={handleGenerateAndCopy}
              className={`px-8 py-3 font-bold rounded-xl flex items-center gap-2 transition-all ${
                copied 
                  ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200'
              }`}
            >
              {copied ? (
                <><CheckCircle2 className="w-5 h-5" /> Skrip Berjaya Disalin!</>
              ) : (
                <><Play className="w-5 h-5" /> Jalankan Automasi IdME Sekarang</>
              )}
            </button>
          </div>
          
          {copied && (
            <div className="p-3 bg-yellow-50 text-yellow-800 text-xs text-center border-t border-yellow-100">
              Paste script ini di ruangan URL portal IdME anda (padam 'javascript:' jika browser membuangnya secara automatik, dan taip semula).
            </div>
          )}
        </div>
      )}
    </div>
  );
}
