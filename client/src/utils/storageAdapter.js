export const getLocal = (k, def) => { try { return JSON.parse(localStorage.getItem(k)) || def; } catch { return def; } };
