export async function fetchSheetCSV(url: string): Promise<string> {
  if (!url) throw new Error("Sila masukkan link Google Spreadsheet");
  
  // Extract ID from Google Sheets URL
  // Matches formats like: https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
  const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (!match) throw new Error("Link Google Spreadsheet tidak sah. Sila pastikan anda menyalin URL penuh dari address bar.");
  
  const id = match[1];
  const csvUrl = `https://docs.google.com/spreadsheets/d/${id}/export?format=csv`;
  
  try {
    const res = await fetch(csvUrl);
    if (!res.ok) {
      throw new Error(`Gagal (Status ${res.status}). Pastikan Spreadsheet telah ditetapkan kepada "Anyone with the link can view".`);
    }
    return await res.text();
  } catch (err: any) {
    if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
      throw new Error("Ralat Rangkaian: Google menghalang capaian (CORS). Sila pastikan Sheet diset 'Anyone can view' ATAU cuba pasang Chrome Extension 'Allow CORS: Access-Control-Allow-Origin'.");
    }
    throw err;
  }
}
