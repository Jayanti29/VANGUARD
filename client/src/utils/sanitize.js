export const sanitizeInput = (str) => (str||"").replace(/[<>]/g, "");
