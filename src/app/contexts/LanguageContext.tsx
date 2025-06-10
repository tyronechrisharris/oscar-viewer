"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { initI18n, setLanguage as setAppLanguage } from '@/app/utils/i18n';

interface LanguageContextType {
  language: string;
  setLanguage: (language: string) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<string>('en'); // Default to English

  useEffect(() => {
    // Initialize i18n and set initial language state from localStorage or default
    const savedLang = localStorage.getItem('selectedLanguage') || 'en';
    setLanguageState(savedLang);
    initI18n(); // This will load the language and apply translations

    // Optional: Listen for language changes triggered by direct calls to setAppLanguage (e.g., from i18n.ts itself)
    // This ensures the React context state is in sync if language is changed outside of React components.
    const handleExternalLanguageChange = (event: CustomEvent) => {
      if (event.detail && event.detail.lang) {
        setLanguageState(event.detail.lang);
      }
    };

    window.addEventListener('languageChanged', handleExternalLanguageChange as EventListener);

    return () => {
      window.removeEventListener('languageChanged', handleExternalLanguageChange as EventListener);
    };
  }, []);

  const setLanguage = (lang: string) => {
    setAppLanguage(lang); // This will load and apply translations, and save to localStorage
    setLanguageState(lang); // Update React state
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
