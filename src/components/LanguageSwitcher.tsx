import { useTranslation } from 'react-i18next';

const languages = [
	{ code: 'en', name: 'English' },
	{ code: 'zh-TW', name: '繁體中文' },
];

export default function LanguageSwitcher() {
	const { i18n } = useTranslation();

	const handleLanguageChange = (langCode: string) => {
		i18n.changeLanguage(langCode);
		localStorage.setItem('preferredLanguage', langCode);
	};

	return (
		<div className="flex gap-2">
			{languages.map((lang) => (
				<button
					key={lang.code}
					onClick={() => handleLanguageChange(lang.code)}
					className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
						i18n.language === lang.code
							? 'bg-blue-600 text-white shadow-md'
							: 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600'
					}`}
				>
					{lang.name}
				</button>
			))}
		</div>
	);
}
