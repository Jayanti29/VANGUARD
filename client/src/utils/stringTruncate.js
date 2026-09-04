export const truncate = (str, max = 50) => str && str.length > max ? str.slice(0, max) + "..." : str;
