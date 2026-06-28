import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '../i18n/en.json';
import hi from '../i18n/hi.json';
import kn from '../i18n/kn.json';
import ta from '../i18n/ta.json';
import te from '../i18n/te.json';
import ml from '../i18n/ml.json';
import bn from '../i18n/bn.json';
import mr from '../i18n/mr.json';
import gu from '../i18n/gu.json';
import pa from '../i18n/pa.json';

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  kn: { translation: kn },
  ta: { translation: ta },
  te: { translation: te },
  ml: { translation: ml },
  bn: { translation: bn },
  mr: { translation: mr },
  gu: { translation: gu },
  pa: { translation: pa }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('vanguard_language') || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;
