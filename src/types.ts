export const AttendanceConstants = {
  "MASALAH KESIHATAN": ["DEMAM", "BATUK / SELSEMA", "KUARANTIN", "LAIN-LAIN SAKIT"],
  "MASALAH PERIBADI": ["URUSAN KELUARGA", "KENDERAAN ROSAK", "KEMATIAN"],
  "AKTIVITI LUAR SEKOLAH": ["WAKIL SEKOLAH", "PROGRAM KPM"],
  "PONTENG": ["PONTENG / MALAS KE SEKOLAH"]
};

export interface Student {
  name: string;
}

export interface ParsedResult {
  id: string;
  originalName: string;
  name: string;
  category: string;
  subReason: string;
  source: 'Local Engine' | 'Alias Mapped' | 'Gemini AI' | 'Manual';
}

export interface AppState {
  gemini_api_keys: string[];
  name_aliases: Record<string, string>;
  custom_reasons: Record<string, { category: string; subReason: string }>;
  settings: {
    auto_submit: boolean;
  };
  roster: Student[];
  spreadsheets: Record<string, string>;
}

export const DEFAULT_STATE: AppState = {
  gemini_api_keys: [],
  name_aliases: {},
  custom_reasons: {},
  settings: {
    auto_submit: false
  },
  roster: [],
  spreadsheets: {}
};

