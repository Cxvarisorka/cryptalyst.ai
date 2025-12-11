import { useState } from 'react';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧', required: true },
  { code: 'ka', name: 'Georgian', flag: '🇬🇪', required: false }
];

export const LanguageTabs = ({ activeTab, onTabChange, children }) => {
  return (
    <div>
      <div className="flex gap-2 border-b mb-4">
        {LANGUAGES.map(lang => (
          <button
            key={lang.code}
            onClick={() => onTabChange(lang.code)}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === lang.code
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {lang.flag} {lang.name} {lang.required && <span className="text-red-500">*</span>}
          </button>
        ))}
      </div>
      <div>{children}</div>
    </div>
  );
};

export { LANGUAGES };
