"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, translations } from '@/lib/dictionary';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: any;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  // Load language preference from localStorage on mount
  useEffect(() => {
    const savedLang = localStorage.getItem('panaversity-lang') as Language;
    if (savedLang && ['en', 'ur', 'ru'].includes(savedLang)) {
      setLanguage(savedLang);
    }
  }, []);

  // Save language preference to localStorage whenever it changes
  const updateLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('panaversity-lang', lang);
    // Update HTML lang attribute for accessibility
    document.documentElement.lang = lang;
  };

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage: updateLanguage, t }}>
      <div dir={language === 'ur' ? 'rtl' : 'ltr'}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
