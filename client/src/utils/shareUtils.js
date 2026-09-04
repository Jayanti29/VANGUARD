export const shareContent = (title, text, url) => navigator.share ? navigator.share({ title, text, url }) : false;
