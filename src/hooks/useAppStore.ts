import { useState, useEffect } from 'react';
import { AppState, DEFAULT_STATE } from '../types';

export function useAppStore() {
  const [state, setState] = useState<AppState>(() => {
    try {
      const item = window.localStorage.getItem('eke_idme_store');
      if (item) {
        // Deep merge with default state to ensure all fields exist
        const parsed = JSON.parse(item);
        return {
          ...DEFAULT_STATE,
          ...parsed,
          settings: { ...DEFAULT_STATE.settings, ...(parsed.settings || {}) },
          name_aliases: { ...DEFAULT_STATE.name_aliases, ...(parsed.name_aliases || {}) },
          custom_reasons: { ...DEFAULT_STATE.custom_reasons, ...(parsed.custom_reasons || {}) },
          gemini_api_keys: Array.isArray(parsed.gemini_api_keys) ? parsed.gemini_api_keys : DEFAULT_STATE.gemini_api_keys,
          roster: Array.isArray(parsed.roster) ? parsed.roster : DEFAULT_STATE.roster
        };
      }
    } catch (error) {
      console.warn('Error reading localStorage', error);
    }
    return DEFAULT_STATE;
  });

  useEffect(() => {
    try {
      window.localStorage.setItem('eke_idme_store', JSON.stringify(state));
    } catch (error) {
      console.warn('Error setting localStorage', error);
    }
  }, [state]);

  const updateState = (updater: (prev: AppState) => AppState) => {
    setState(updater);
  };

  return { state, updateState };
}
