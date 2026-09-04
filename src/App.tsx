import React, { useState } from 'react';
import { useAppStore } from './hooks/useAppStore';
import { Configuration } from './components/Configuration';
import { Dashboard } from './components/Dashboard';
import { LayoutDashboard, Settings, Users, Key, Globe, ExternalLink, AlertTriangle } from 'lucide-react';

export default function App() {
  const { state, updateState } = useAppStore();
  const [currentView, setCurrentView] = useState<'runner' | 'config' | 'portal'>('runner');

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      <header className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
              ID
            </div>
            <h1 className="text-xl font-bold text-gray-900 hidden sm:block">eKehadiran IdME Automation Studio</h1>
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
                onClick={() => setCurrentView('portal')}
                className={`px-3 py-1.5 rounded-md font-medium text-sm flex items-center gap-2 transition-colors ${
                  currentView === 'portal' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Globe className="w-4 h-4" /> Portal IdME
              </button>
              <button 
                onClick={() => setCurrentView('config')}
                className={`px-3 py-1.5 rounded-md font-medium text-sm flex items-center gap-2 transition-colors ${
                  currentView === 'config' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Settings className="w-4 h-4" /> Settings
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full p-4 md:p-6">
        {currentView === 'runner' && (
          <Dashboard state={state} updateState={updateState} openConfig={() => setCurrentView('config')} />
        )}
        {currentView === 'config' && (
          <Configuration state={state} updateState={updateState} />
        )}
        {currentView === 'portal' && (
          <div className="h-[calc(100vh-8rem)] w-full bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col">
            <div className="bg-gray-50 border-b p-3 flex justify-between items-center">
              <div className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-600" /> IdME Portal Web View
              </div>
              <a 
                href="https://idme.moe.gov.my/login" 
                target="_blank" 
                rel="noreferrer" 
                className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1 font-medium bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                Buka di Tab Baru <ExternalLink className="w-4 h-4" />
              </a>
            </div>
            
            <div className="flex-1 w-full bg-gray-200 relative">
              <iframe 
                src="https://idme.moe.gov.my/login" 
                className="absolute inset-0 w-full h-full border-none bg-white"
                title="IdME Portal"
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
              />
            </div>
            
            <div className="p-3 bg-yellow-50 border-t border-yellow-200 flex items-start gap-3 text-sm text-yellow-800">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-yellow-600" />
              <div>
                <p className="font-semibold">Nota Keselamatan & Bookmarklet:</p>
                <p className="mt-1">
                  1. Jika paparan di atas kosong (kelabu/putih), ia bermakna server KPM menyekat iframe (X-Frame-Options). Sila gunakan butang <strong>"Buka di Tab Baru"</strong> di atas.
                </p>
                <p>
                  2. Browser moden mungkin menghalang perlaksanaan "Bookmarklet" di dalam iframe merentas domain. Anda disarankan menjalankan skrip automasi (Jalankan Automasi) di tab rasmi IdME.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
