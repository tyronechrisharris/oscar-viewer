"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { initI18n, setAppLanguage } from '@/app/utils/i18n';

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
    // Initialize i18n - this will load language and apply translations
    // It also sets the initial language state based on localStorage or default 'en'
    initI18n();

    const currentLangFromStorage = localStorage.getItem('selectedLanguage') || 'en';
    if (currentLangFromStorage !== language) {
        setLanguageState(currentLangFromStorage);
    }

    const handleExternalLanguageChange = (event: CustomEvent) => {
      if (event.detail && event.detail.lang && event.detail.lang !== language) {
        setLanguageState(event.detail.lang);
      }
    };

    window.addEventListener('languageChanged', handleExternalLanguageChange as EventListener);

    return () => {
      window.removeEventListener('languageChanged', handleExternalLanguageChange as EventListener);
    };
  }, [language]); // Rerun if language state changes from within React

  const setLanguage = (lang: string) => {
    setAppLanguage(lang); // This will load and apply translations, save to localStorage, and dispatch event
    // No need to call setLanguageState here as the event listener will handle it,
    // or if the change originates from here, setAppLanguage will eventually update it via init/loadLanguage.
    // However, for immediate UI responsiveness within React components using the context value directly,
    // updating here might be preferred by some patterns. The event listener handles cases where
    // setAppLanguage is called from non-React parts of the code.
    // For simplicity and to rely on the event, we can comment out direct setLanguageState here.
    // setLanguageState(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
