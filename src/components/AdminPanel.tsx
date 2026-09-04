import React, { useState } from 'react';
import { AppState } from '../types';
import { Lock, Save, Plus, Trash2, ShieldCheck, Link2 } from 'lucide-react';

interface Props {
  state: AppState;
  updateState: (newState: AppState) => void;
  closeAdmin: () => void;
}

const MONTHS = ['Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun', 'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'];

export function AdminPanel({ state, updateState, closeAdmin }: Props) {
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'kea8019') {
      setUnlocked(true);
      setError('');
    } else {
      setError('Kata laluan salah.');
    }
  };

  const updateSpreadsheet = (month: string, url: string) => {
    updateState({
      ...state,
      spreadsheets: {
        ...state.spreadsheets,
        [month]: url
      }
    });
  };

  if (!unlocked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] bg-white rounded-xl shadow-sm border p-8">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Akses Pentadbir (Admin)</h2>
        <p className="text-gray-500 mb-6 text-center max-w-md">Sila masukkan kata laluan untuk mengubah tetapan Spreadsheet bulanan dan konfigurasi sistem.</p>
        
        <form onSubmit={handleLogin} className="w-full max-w-xs flex flex-col gap-3">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 text-center"
            placeholder="Kata Laluan"
            autoFocus
          />
          {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}
          <button type="submit" className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-2 rounded-lg">
            Buka Kunci
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <div className="bg-gray-900 p-4 flex justify-between items-center text-white">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-green-400" />
          <h2 className="font-bold text-lg">Panel Pentadbir</h2>
        </div>
        <button onClick={closeAdmin} className="text-sm bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg transition-colors">
          Tutup Panel
        </button>
      </div>

      <div className="p-6">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Link2 className="w-5 h-5 text-blue-600" /> Pautan Google Spreadsheet Mengikut Bulan
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Sila masukkan URL (Pautan) Google Spreadsheet untuk setiap bulan. Pastikan tetapan kongsian sheet tersebut adalah <strong>"Anyone with the link can view"</strong>.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MONTHS.map(month => (
            <div key={month} className="bg-gray-50 p-3 rounded-lg border">
              <label className="block text-sm font-semibold text-gray-700 mb-1">{month}</label>
              <input
                type="text"
                placeholder={`Link Spreadsheet ${month}...`}
                className="w-full text-sm px-3 py-2 border rounded-md"
                value={state.spreadsheets[month] || ''}
                onChange={(e) => updateSpreadsheet(month, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
