import React, { useState } from 'react';
import { useAppStore } from './hooks/useAppStore';
import { Configuration } from './components/Configuration';
import { Dashboard } from './components/Dashboard';
import { AdminPanel } from './components/AdminPanel';
import { LayoutDashboard, Settings, Users, Key, Globe, ExternalLink, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function App() {
  const { state, updateState } = useAppStore();
  const [currentView, setCurrentView] = useState<'runner' | 'config' | 'admin'>('runner');

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      <header className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
              ID
            </div>
            <h1 className="text-xl font-bold text-gray-900 hidden sm:block">IdME Kelas Automasi</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs font-medium text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full border">
               <Users className="w-3.5 h-3.5 text-blue-600" /> Roster: {state.roster.length}
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full border">
               <Key className="w-3.5 h-3.5 text-green-600" /> Keys: {state.gemini_api_keys.length}
            </div>
            <nav className="flex gap-2 border-l pl-4 ml-2">
              <button 
                onClick={() => setCurrentView('runner')}
                className={`px-3 py-1.5 rounded-md font-medium text-sm flex items-center gap-2 transition-colors ${
                  currentView === 'runner' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" /> Runner
              </button>
              <button 
                onClick={() => setCurrentView('config')}
                className={`px-3 py-1.5 rounded-md font-medium text-sm flex items-center gap-2 transition-colors ${
                  currentView === 'config' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Settings className="w-4 h-4" /> Tetapan
              </button>
              <button 
                onClick={() => setCurrentView('admin')}
                className={`px-3 py-1.5 rounded-md font-medium text-sm flex items-center gap-2 transition-colors ${
                  currentView === 'admin' ? 'bg-red-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <ShieldCheck className="w-4 h-4" /> Admin
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full p-4 md:p-6 flex flex-col gap-6">
        {currentView === 'runner' && (
          <>
            {/* IDME PORTAL LAUNCHER (TOP) */}
            <div className="w-full bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col">
              <div className="bg-gray-50 border-b p-3 flex justify-between items-center">
                <div className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-600" /> Portal IdME
                </div>
                <button 
                  onClick={() => window.open('https://idme.moe.gov.my/login', 'idmeWindow', 'width=1100,height=800,left=200,top=100')}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm flex items-center gap-2 font-medium px-4 py-2 rounded-lg transition-colors shadow-sm"
                >
                  <ExternalLink className="w-4 h-4" /> Buka IdME (Tetingkap Split)
                </button>
              </div>
              
              <div className="p-4 bg-yellow-50 text-sm text-yellow-800 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-yellow-600" />
                <div>
                  <p className="font-semibold mb-1">Nota Keselamatan & Paparan Bersebelahan:</p>
                  <p>Berdasarkan amaran sebelum ini, laman web KPM menghalang sistem kami daripada memaparkan portal IdME ke dalam kotak secara terus (disebabkan <em>X-Frame-Options: DENY</em>). Ini adalah sekuriti standard web.</p>
                  <p className="mt-2">Sebagai alternatif yang lebih baik, sila klik butang <strong>"Buka IdME"</strong> di atas. Ia akan membuka Portal IdME dalam satu tetingkap (tab pop-up) baru. Anda boleh meletakkannya bersebelahan sistem ini untuk menarik butang Automasi dengan mudah!</p>
                </div>
              </div>
            </div>

            <Dashboard state={state} updateState={updateState} openConfig={() => setCurrentView('admin')} />
          </>
        )}
        
        {currentView === 'config' && (
          <Configuration state={state} updateState={updateState} />
        )}

        {currentView === 'admin' && (
          <AdminPanel state={state} updateState={updateState} closeAdmin={() => setCurrentView('runner')} />
        )}
      </main>
    </div>
  );
}
