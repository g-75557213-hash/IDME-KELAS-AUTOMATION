import React, { useState } from 'react';
import { AppState, AttendanceConstants } from '../types';
import { Settings, Key, Users, List, Trash2, Database, Download } from 'lucide-react';

interface ConfigProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

export function Configuration({ state, updateState }: ConfigProps) {
  const [activeTab, setActiveTab] = useState<'roster' | 'aliases' | 'reasons' | 'keys'>('roster');

  const [newKey, setNewKey] = useState('');
  const [newAlias, setNewAlias] = useState({ short: '', full: '' });
  const [newReason, setNewReason] = useState({ key: '', category: Object.keys(AttendanceConstants)[0], sub: AttendanceConstants['MASALAH KESIHATAN'][0] });
  const [rawRoster, setRawRoster] = useState('');

  const addKey = () => {
    if (!newKey.trim()) return;
    updateState(s => ({ ...s, gemini_api_keys: [...s.gemini_api_keys, newKey.trim()] }));
    setNewKey('');
  };

  const addAlias = () => {
    if (!newAlias.short.trim() || !newAlias.full.trim()) return;
    updateState(s => ({
      ...s,
      name_aliases: { ...s.name_aliases, [newAlias.short.trim().toLowerCase()]: newAlias.full.trim() }
    }));
    setNewAlias({ short: '', full: '' });
  };

  const addReason = () => {
    if (!newReason.key.trim() || !newReason.category.trim() || !newReason.sub.trim()) return;
    updateState(s => ({
      ...s,
      custom_reasons: { 
        ...s.custom_reasons, 
        [newReason.key.trim().toLowerCase()]: { category: newReason.category, subReason: newReason.sub }
      }
    }));
    setNewReason({ key: '', category: Object.keys(AttendanceConstants)[0], sub: AttendanceConstants['MASALAH KESIHATAN'][0] });
  };

  const handleSyncRoster = () => {
    if (!rawRoster.trim()) return;
    const names = rawRoster.split('\n')
      .map(n => n.trim().toUpperCase())
      .filter(n => n.length > 2);
    
    updateState(s => ({
      ...s,
      roster: names.map(name => ({ name }))
    }));
    setRawRoster('');
  };

  const getRosterBookmarklet = () => {
    const code = `javascript:(function(){
      let names = [];
      document.querySelectorAll('tr.student-row td:nth-child(2), table tbody tr td:nth-child(2)').forEach(td => {
        if (td.textContent.trim().length > 3) names.push(td.textContent.trim());
      });
      navigator.clipboard.writeText(names.join('\\n')).then(() => alert('Roster disalin! Paste di eKehadiran Automation Studio.'));
    })();`;
    navigator.clipboard.writeText(code);
    alert('Bookmarklet disalin. Run di portal IdME.');
  };

  return (
    <div className="flex flex-col md:flex-row h-full border rounded-xl overflow-hidden bg-white shadow-sm">
      <div className="w-full md:w-64 bg-gray-50 border-r md:flex-shrink-0 flex flex-col">
        <div className="p-4 border-b font-semibold text-gray-800 flex items-center gap-2">
          <Settings className="w-5 h-5 text-gray-600" />
          Settings & Modul
        </div>
        <nav className="flex-1 p-2 space-y-1">
          <TabButton active={activeTab === 'roster'} onClick={() => setActiveTab('roster')} icon={<Database className="w-4 h-4" />}>Class Roster Sync</TabButton>
          <TabButton active={activeTab === 'aliases'} onClick={() => setActiveTab('aliases')} icon={<Users className="w-4 h-4" />}>Ajar Nama (Aliases)</TabButton>
          <TabButton active={activeTab === 'reasons'} onClick={() => setActiveTab('reasons')} icon={<List className="w-4 h-4" />}>Ajar Sebab (Reasons)</TabButton>
          <TabButton active={activeTab === 'keys'} onClick={() => setActiveTab('keys')} icon={<Key className="w-4 h-4" />}>API Keys</TabButton>
        </nav>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        {activeTab === 'roster' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Module A: Class Roster Sync</h2>
              <p className="text-sm text-gray-500 mt-1">Sync your class roster to enable highly accurate name matching.</p>
            </div>
            
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
              <h3 className="font-semibold text-blue-900 mb-2">Automated Sync (Via IdME)</h3>
              <p className="text-sm text-blue-700 mb-3">Salin bookmarklet ini, klik pada portal IdME, dan ia akan menyalin senarai nama pelajar.</p>
              <button onClick={getRosterBookmarklet} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 flex items-center gap-2">
                <Download className="w-4 h-4" /> Salin Skrip Sync Roster
              </button>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Manual Paste Roster (Satu nama setiap baris)</label>
              <textarea 
                className="w-full h-32 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="NUR QASEH SYUHADA BINTI ZURAIDI&#10;AHMAD ALIFF BIN ABU..."
                value={rawRoster}
                onChange={e => setRawRoster(e.target.value)}
              />
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Roster Aktif: {state.roster.length} Pelajar</span>
                <button onClick={handleSyncRoster} className="px-4 py-2 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-900">
                  Kemaskini Roster
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'aliases' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Ajar Nama (Alias Teacher)</h2>
              <p className="text-sm text-gray-500 mt-1">Latih sistem untuk mengenali nama panggilan (nickname).</p>
            </div>

            <div className="flex flex-col md:flex-row gap-2">
              <input 
                type="text" 
                placeholder="Nickname (e.g. qaseh)" 
                className="md:w-1/3 px-4 py-2 border rounded-lg"
                value={newAlias.short}
                onChange={e => setNewAlias({ ...newAlias, short: e.target.value })}
              />
              <select 
                className="flex-1 px-4 py-2 border rounded-lg bg-white"
                value={newAlias.full}
                onChange={e => setNewAlias({ ...newAlias, full: e.target.value })}
              >
                <option value="">-- Pilih Nama Penuh --</option>
                {state.roster.map(r => (
                  <option key={r.name} value={r.name}>{r.name}</option>
                ))}
              </select>
              <button onClick={addAlias} className="px-6 py-2 bg-blue-600 text-white rounded-lg">Simpan</button>
            </div>

            <ul className="space-y-2">
              {Object.entries(state.name_aliases).map(([short, full]) => (
                <li key={short} className="flex justify-between items-center p-3 border rounded-lg bg-gray-50">
                  <div>
                    <span className="font-bold text-gray-800 mr-2">{short}</span>
                    <span className="text-sm text-gray-500">&rarr; {full}</span>
                  </div>
                  <button onClick={() => updateState(s => { const n = {...s.name_aliases}; delete n[short]; return {...s, name_aliases: n}; })} className="text-red-500 p-1"><Trash2 className="w-4 h-4" /></button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === 'reasons' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Ajar Sebab (Reason Teacher)</h2>
              <p className="text-sm text-gray-500 mt-1">Latih sistem memadankan kata kunci dengan Kategori IdME rasmi.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <input 
                type="text" 
                placeholder="Kata kunci (cth: cacar air)" 
                className="px-4 py-2 border rounded-lg"
                value={newReason.key}
                onChange={e => setNewReason({ ...newReason, key: e.target.value })}
              />
              <select 
                className="px-4 py-2 border rounded-lg bg-white"
                value={newReason.category}
                onChange={e => {
                  const cat = e.target.value;
                  setNewReason({ ...newReason, category: cat, sub: AttendanceConstants[cat as keyof typeof AttendanceConstants][0] });
                }}
              >
                {Object.keys(AttendanceConstants).map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <select 
                className="px-4 py-2 border rounded-lg bg-white"
                value={newReason.sub}
                onChange={e => setNewReason({ ...newReason, sub: e.target.value })}
              >
                {AttendanceConstants[newReason.category as keyof typeof AttendanceConstants]?.map(sub => <option key={sub} value={sub}>{sub}</option>)}
              </select>
              <button onClick={addReason} className="px-6 py-2 bg-blue-600 text-white rounded-lg">Simpan</button>
            </div>

            <ul className="space-y-2">
              {Object.entries(state.custom_reasons).map(([key, val]) => (
                <li key={key} className="flex justify-between items-center p-3 border rounded-lg bg-gray-50">
                  <div>
                    <span className="font-bold text-gray-800 mr-2">"{key}"</span>
                    <span className="text-sm text-gray-500">&rarr; {val.category} ({val.subReason})</span>
                  </div>
                  <button onClick={() => updateState(s => { const n = {...s.custom_reasons}; delete n[key]; return {...s, custom_reasons: n}; })} className="text-red-500 p-1"><Trash2 className="w-4 h-4" /></button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === 'keys' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Gemini API Keys</h2>
              <p className="text-sm text-gray-500 mt-1">Module C: Gemini AI Fallback Engine keys.</p>
            </div>
            
            <div className="flex gap-2">
              <input 
                type="password" 
                placeholder="AIzaSy..." 
                className="flex-1 px-4 py-2 border rounded-lg"
                value={newKey}
                onChange={e => setNewKey(e.target.value)}
              />
              <button onClick={addKey} className="px-6 py-2 bg-blue-600 text-white rounded-lg">Add Key</button>
            </div>

            <ul className="space-y-2">
              {state.gemini_api_keys.map((key, i) => (
                <li key={i} className="flex justify-between items-center p-3 border rounded-lg bg-gray-50 font-mono text-sm text-gray-600">
                  {key.slice(0, 8)}...{key.slice(-4)}
                  <button onClick={() => updateState(s => ({ ...s, gemini_api_keys: s.gemini_api_keys.filter((_, idx) => idx !== i) }))} className="text-red-500 p-1"><Trash2 className="w-4 h-4" /></button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, children }: { active: boolean, onClick: () => void, icon: React.ReactNode, children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        active ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

