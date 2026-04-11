"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, translations } from '@/lib/dictionary';

export const languages: Record<Language, { name: string }> = {
  en: { name: 'English' },
  ur: { name: 'اردو' },
  ru: { name: 'Roman Urdu' },
};

interface LanguageContextType {
  language: Language;
  lang: Language;
  setLanguage: (lang: Language) => void;
  changeLanguage: (lang: string) => void;
  t: any;
  languages: typeof languages;
}

// Safe default value — prevents "Cannot read .language of undefined" on SSG
const defaultContext: LanguageContextType = {
  language: 'en',
  lang: 'en',
  setLanguage: () => {},
  changeLanguage: () => {},
  t: translations['en'],
  languages,
};

const LanguageContext = createContext<LanguageContextType>(defaultContext);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const savedLang = localStorage.getItem('panaversity-lang') as Language;
    if (savedLang && ['en', 'ur', 'ru'].includes(savedLang)) {
      setLanguageState(savedLang);
      document.documentElement.lang = savedLang;
      document.documentElement.dir = savedLang === 'ur' ? 'rtl' : 'ltr';
    }
  }, []);

  const updateLanguage = (lang: string) => {
    const l = lang as Language;
    setLanguageState(l);
    if (typeof window !== 'undefined') {
      localStorage.setItem('panaversity-lang', l);
      document.documentElement.lang = l;
      document.documentElement.dir = l === 'ur' ? 'rtl' : 'ltr';
      window.dispatchEvent(new CustomEvent('lang-change', { detail: { lang: l } }));
    }
  };

  const t = translations[language];

  return (
    <LanguageContext.Provider
      value={{
        language,
        lang: language,
        setLanguage: updateLanguage,
        changeLanguage: updateLanguage,
        t,
        languages,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
