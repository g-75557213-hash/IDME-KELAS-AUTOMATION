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
            {/* IDME PORTAL LAUNCHER & AUTO-LOGIN (TOP) */}
            <div className="w-full bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col">
              <div className="bg-gray-50 border-b p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-600" /> Log Masuk Automatik IdME
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-green-700 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200">
                  <ShieldCheck className="w-4 h-4" /> Selamat: Tiada data disimpan
                </div>
              </div>
              
              <div className="p-4 flex flex-col md:flex-row gap-4">
                <div className="flex-1 space-y-3">
                  <p className="text-sm text-gray-600">
                    Sistem akan menjana satu skrip khas untuk automatik memasukkan ID, menanda kunci keselamatan, dan mengisi kata laluan.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input 
                      type="text" 
                      placeholder="No. Kad Pengenalan" 
                      className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 uppercase text-sm"
                      id="temp_ic"
                    />
                    <input 
                      type="password" 
                      placeholder="Kata Laluan" 
                      className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      id="temp_pass"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2 justify-end min-w-[200px]">
                  <button 
                    onClick={() => {
                      const icInput = document.getElementById('temp_ic') as HTMLInputElement;
                      const passInput = document.getElementById('temp_pass') as HTMLInputElement;
                      const ic = icInput.value;
                      const pass = passInput.value;
                      
                      if (!ic || !pass) {
                        alert("Sila masukkan No. IC dan Kata Laluan");
                        return;
                      }

                      const code = `
(function(){
  const ic = "${ic}";
  const pass = "${pass}";
  
  const icInput = document.getElementById('ic');
  if (icInput) {
     icInput.value = ic;
     icInput.dispatchEvent(new Event('input', { bubbles: true }));
     
     const submitBtn = document.querySelector('button[type="submit"]');
     if (submitBtn) submitBtn.click();
     
     let attempts = 0;
     const checkInterval = setInterval(() => {
        attempts++;
        const checkLog = document.getElementById('check_log');
        const passInput = document.getElementById('password');
        
        if (checkLog && passInput) {
           clearInterval(checkInterval);
           
           if (!checkLog.checked) checkLog.click();
           
           passInput.value = pass;
           passInput.dispatchEvent(new Event('input', { bubbles: true }));
           
           setTimeout(() => {
              const finalSubmit = document.querySelector('button[type="submit"]');
              if (finalSubmit) {
                finalSubmit.click();
                // Simpan flag untuk redirect
                sessionStorage.setItem('idme_auto_redirect', 'true');
              }
           }, 500);
        }
        if (attempts > 40) clearInterval(checkInterval); // Stop after 20s
     }, 500);
  } else {
     // Jika tiada input IC, mungkin kita di dashboard selepas login
     if (sessionStorage.getItem('idme_auto_redirect') === 'true') {
        sessionStorage.removeItem('idme_auto_redirect');
        window.location.href = "https://moeispel.moe.gov.my/sahsiah/kehadiran/tabguru";
     } else {
        alert('Sila run skrip ini di halaman login utama IdME.');
     }
  }
})();
                      `.trim();
                      
                      const bookmarklet = `javascript:${encodeURIComponent(code)}`;
                      navigator.clipboard.writeText(bookmarklet).then(() => {
                        alert("Skrip Log Masuk disalin! Menuju ke portal IdME...");
                        
                        // Kosongkan input demi keselamatan
                        icInput.value = '';
                        passInput.value = '';
                        
                        window.open('https://idme.moe.gov.my/login', 'idmeWindow', 'width=1100,height=800,left=200,top=100');
                      });
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm flex items-center justify-center gap-2 font-medium px-4 py-3 rounded-lg transition-colors shadow-sm w-full"
                  >
                    <ExternalLink className="w-4 h-4" /> Salin Skrip & Buka IdME
                  </button>
                  <a 
                    href="https://moeispel.moe.gov.my/sahsiah/kehadiran/tabguru"
                    target="_blank"
                    rel="noreferrer"
                    className="text-center text-xs text-blue-600 hover:underline py-1"
                  >
                    Terus ke Tab Guru (Jika sudah login)
                  </a>
                </div>
              </div>
              
              <div className="p-3 bg-yellow-50 text-xs text-yellow-800 flex items-start gap-2 border-t">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-yellow-600" />
                <p>
                  <strong>Cara Guna:</strong> Masukkan IC & Kata laluan &rarr; Tekan butang biru &rarr; Di tetingkap IdME yang terbuka, tampal (Paste) di ruangan URL di atas dan tekan Enter (Taip semula <code>javascript:</code> di depan jika dipadam oleh browser).
                  <br/><span className="text-red-600 font-medium">Nota: Data ini akan terus dipadam apabila butang ditekan dan tidak akan disimpan di dalam sistem.</span>
                </p>
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
