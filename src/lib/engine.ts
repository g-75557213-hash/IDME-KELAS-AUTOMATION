import { AttendanceConstants, ParsedResult, Student, AppState } from '../types';

// Utility to clean text
const sanitize = (text: string) => text.trim().toUpperCase();

export function processLocalText(
  rawInputText: string, 
  state: AppState
): ParsedResult[] {
  const lines = rawInputText.split('\n');
  const results: ParsedResult[] = [];

  for (const rawLine of lines) {
    // Clean line: strip numbers, leading punctuation, bullets, emojis
    let cleanLine = rawLine
      .replace(/^[0-9\.\-\*\s]+/, '')
      .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
      .trim();

    if (!cleanLine) continue;

    let matchedName = cleanLine;
    let source: ParsedResult['source'] = 'Local Engine';
    let foundInRoster = false;

    // 1. Check Name Aliases
    const words = cleanLine.toLowerCase().split(' ');
    for (const [alias, fullName] of Object.entries(state.name_aliases)) {
      if (words.includes(alias.toLowerCase())) {
        matchedName = fullName;
        source = 'Alias Mapped';
        foundInRoster = true;
        break;
      }
    }

    // 2. Cross-reference with active roster if not aliased
    if (!foundInRoster && state.roster.length > 0) {
      const bestMatch = state.roster.find(s => 
        cleanLine.toUpperCase().includes(s.name.toUpperCase()) || 
        s.name.toUpperCase().includes(cleanLine.toUpperCase())
      );
      if (bestMatch) {
        matchedName = bestMatch.name;
        foundInRoster = true;
      }
    }

    // Reason Extraction
    let category = "PONTENG";
    let subReason = "PONTENG / MALAS KE SEKOLAH";
    let reasonMatched = false;

    const lowerLine = cleanLine.toLowerCase();

    // Check custom reasons
    for (const [key, val] of Object.entries(state.custom_reasons)) {
      if (lowerLine.includes(key.toLowerCase())) {
        category = val.category;
        subReason = val.subReason;
        reasonMatched = true;
        break;
      }
    }

    // Fallback: Check official constants if no custom reason matched
    if (!reasonMatched) {
      for (const [cat, subs] of Object.entries(AttendanceConstants)) {
        for (const sub of subs) {
          if (lowerLine.includes(sub.toLowerCase())) {
            category = cat;
            subReason = sub;
            reasonMatched = true;
            break;
          }
        }
        if (reasonMatched) break;
      }
    }

    results.push({
      id: Math.random().toString(36).substring(7),
      originalName: rawLine,
      name: matchedName.toUpperCase(),
      category,
      subReason,
      source
    });
  }

  return results;
}

export async function processWithGeminiAI(
  rawInputText: string,
  state: AppState
): Promise<ParsedResult[]> {
  if (state.gemini_api_keys.length === 0) {
    throw new Error("No Gemini API keys configured.");
  }

  const systemPrompt = `You are an IdME attendance extraction engine.
ROSTER: ${JSON.stringify(state.roster.map(r => r.name))}
ALIASES: ${JSON.stringify(state.name_aliases)}
CUSTOM REASONS: ${JSON.stringify(state.custom_reasons)}
OFFICIAL CATEGORIES: ${JSON.stringify(AttendanceConstants)}

Extract attendance records from the user's text.
RULES:
1. Try to match names to the ROSTER or ALIASES.
2. Determine the absence category and sub-reason based on CUSTOM REASONS or OFFICIAL CATEGORIES.
3. If reason is unknown, default to Category: "PONTENG", Sub-reason: "PONTENG / MALAS KE SEKOLAH".
4. MUST return a pure JSON array of objects.
FORMAT: [{"name": "OFFICIAL_NAME", "category": "CATEGORY_NAME", "subReason": "SUB_REASON_NAME", "originalName": "RAW_TEXT"}]`;

  let lastError: any = null;

  // Key Rotation Logic
  for (let i = 0; i < state.gemini_api_keys.length; i++) {
    const apiKey = state.gemini_api_keys[i];
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: rawInputText }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { 
            temperature: 0,
            responseMimeType: "application/json" 
          }
        })
      });

      if (!response.ok) {
        if (response.status === 429 || response.status === 400) {
          throw new Error(`API Key ${i + 1} failed (${response.status}). Trying next...`);
        }
        throw new Error(`API Error: ${response.status}`);
      }

      const result = await response.json();
      const textResponse = result.candidates[0].content.parts[0].text;
      const parsed = JSON.parse(textResponse);

      // Auto-correct and format
      return parsed.map((item: any) => {
        let cat = item.category;
        let sub = item.subReason;

        if (!AttendanceConstants[cat as keyof typeof AttendanceConstants]) {
          cat = "PONTENG";
          sub = "PONTENG / MALAS KE SEKOLAH";
        }

        return {
          id: Math.random().toString(36).substring(7),
          originalName: item.originalName || item.name,
          name: item.name.toUpperCase(),
          category: cat,
          subReason: sub,
          source: 'Gemini AI'
        };
      });

    } catch (err: any) {
      console.warn(err.message);
      lastError = err;
      // Continue to next key
    }
  }

  throw new Error(lastError?.message || "All Gemini API keys failed.");
}

export function generateIdMEScript(data: ParsedResult[], autoSubmit: boolean): string {
  const code = `
(function() {
  const data = ${JSON.stringify(data)};
  const autoSubmit = ${autoSubmit};
  
  console.log("eKehadiran IdME Automation starting...", data);
  
  // Module D: IdME DOM Automation Engine (The Select2 Handler)
  const rows = document.querySelectorAll('tr, .student-row'); // Broad selection for stability
  let processed = 0;
  
  data.forEach(student => {
    // Name Matching: Strict name lookup (min 3-word boundary match if possible)
    let targetRow = null;
    const studentWords = student.name.split(' ').filter(w => w.length > 2);
    
    for (let row of rows) {
      const rowText = row.textContent.toUpperCase();
      // If we have enough words, try a robust match, otherwise exact included match
      let matchCount = 0;
      for (let word of studentWords) {
        if (rowText.includes(word)) matchCount++;
      }
      
      if (matchCount >= Math.min(3, studentWords.length) || rowText.includes(student.name)) {
        targetRow = row;
        break;
      }
    }

    if (targetRow) {
      console.log("Found student:", student.name);
      
      // Checkbox Toggling
      const absentInput = targetRow.querySelector('input[type="radio"][value="0"], input[type="radio"][value="TIDAK HADIR"], input[type="checkbox"].absent-check');
      if (absentInput && !absentInput.checked) {
        absentInput.click();
      }

      // Select2 Dropdown Interaction Simulation
      setTimeout(() => {
        const categorySelect = targetRow.querySelector('select[name*="sebab"], select[name*="category"], .category-select');
        if (categorySelect) {
          // Select category natively
          const catOption = Array.from(categorySelect.options).find(o => (o as HTMLOptionElement).text.toUpperCase().includes(student.category.toUpperCase()));
          if (catOption) {
            (categorySelect as HTMLSelectElement).value = (catOption as HTMLOptionElement).value;
            categorySelect.dispatchEvent(new Event('change', { bubbles: true }));
            
            // Try to force jQuery Select2 update if present in window
            if ((window as any).jQuery) {
              (window as any).jQuery(categorySelect).trigger('change');
            }
          }
        }
        
        // AJAX Dynamic Wait Loop (Sub-Reason Loading)
        let attempts = 0;
        const waitInterval = setInterval(() => {
          attempts++;
          const subSelect = targetRow.querySelector('select[name*="sub_sebab"], select[name*="subReason"], .subreason-select') as HTMLSelectElement | null;
          
          if (subSelect && (subSelect.options.length > 1 || attempts > 40)) { // Max 2 seconds wait
            clearInterval(waitInterval);
            
            const subOption = Array.from(subSelect.options).find(o => (o as HTMLOptionElement).text.toUpperCase().includes(student.subReason.toUpperCase()));
            if (subOption) {
              subSelect.value = (subOption as HTMLOptionElement).value;
              subSelect.dispatchEvent(new Event('change', { bubbles: true }));
              if ((window as any).jQuery) {
                (window as any).jQuery(subSelect).trigger('change');
              }
            }
          }
        }, 50);
      }, 100);
      
      processed++;
    }
  });
  
  // Auto Simpan Sah (SweetAlert Interceptor)
  if (autoSubmit && processed > 0) {
    setTimeout(() => {
      console.log("Auto-submitting form...");
      const submitBtn = document.querySelector('button[type="submit"], #btnSimpan, #btnSubmit, .btn-primary') as HTMLButtonElement | null;
      if (submitBtn) {
        submitBtn.click();
        
        // Intercept SweetAlert modal
        setTimeout(() => {
          const swalConfirm = document.querySelector('.swal2-confirm, .swal-button--confirm') as HTMLButtonElement | null;
          if (swalConfirm) {
            swalConfirm.click();
            console.log("SweetAlert confirmed.");
          }
        }, 800);
      }
    }, 2000); // Wait for all AJAX to settle
  } else {
    alert("IdME Automation Complete. Processed " + processed + " students.");
  }
})();
  `.trim();
  
  return `javascript:${encodeURIComponent(code)}`;
}
