export const calcDistanceKm = (lat1, lon1, lat2, lon2) => Math.round(Math.hypot(lat2 - lat1, lon2 - lon1) * 111);
