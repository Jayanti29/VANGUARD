export const vibrateDevice = (pattern = [100]) => { if (navigator.vibrate) navigator.vibrate(pattern); };
