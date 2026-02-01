import '@testing-library/jest-dom';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './i18n/locales/en.json';
import zhTW from './i18n/locales/zh-TW.json';

// Initialize i18n for tests
if (!i18next.isInitialized) {
	i18next.use(initReactI18next).init({
		resources: {
			en: { translation: en },
			'zh-TW': { translation: zhTW },
		},
		lng: 'en',
		fallbackLng: 'en',
		interpolation: {
			escapeValue: false,
		},
	});
}
