export const getOptimalDimensions = (w, h, max) => w > h ? [max, Math.round((h*max)/w)] : [Math.round((w*max)/h), max];
