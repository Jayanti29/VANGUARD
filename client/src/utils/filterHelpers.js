export const filterList = (items, term, key) => items.filter(i => (i[key]||"").toLowerCase().includes(term.toLowerCase()));
