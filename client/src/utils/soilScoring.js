export const evaluateSoilHealth = (npk, ph) => ph >= 6.0 && ph <= 7.5 ? "Optimal" : "Needs Lime/Gypsum treatment";
