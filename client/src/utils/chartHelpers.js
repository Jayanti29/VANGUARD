export const calcPriceChange = (today, yesterday) => (((today - yesterday) / yesterday) * 100).toFixed(1);
