let translations: Record<string, string> = {};

export async function loadLanguage(lang: string): Promise<void> {
  try {
    const response = await fetch(`/locales/${lang}.json`);
    if (!response.ok) {
      console.error(`Failed to load language file: ${lang}.json, status: ${response.status}`);
      // Fallback to English if the selected language file fails to load
      if (lang !== 'en') {
        console.log('Falling back to English.');
        await loadLanguage('en');
      }
      return;
    }
    translations = await response.json();
    applyTranslations();
  } catch (error) {
    console.error(`Error loading language file ${lang}.json:`, error);
    // Fallback to English on any error
    if (lang !== 'en') {
      console.log('Falling back to English on error.');
      await loadLanguage('en');
    }
  }
}

function applyTranslations(): void {
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    if (key && translations[key]) {
      // Only update if the new translation is different to avoid unnecessary re-renders/reflows
      if (element.textContent !== translations[key]) {
        element.textContent = translations[key];
      }
    }
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
    const key = element.getAttribute('data-i18n-placeholder');
    if (key && translations[key]) {
      if (element.getAttribute('placeholder') !== translations[key]) {
        element.setAttribute('placeholder', translations[key]);
      }
    }
  });

  document.querySelectorAll('[data-i18n-title]').forEach(element => {
    const key = element.getAttribute('data-i18n-title');
    if (key && translations[key]) {
      if (element.getAttribute('title') !== translations[key]) {
        element.setAttribute('title', translations[key]);
      }
    }
  });

  document.querySelectorAll('[data-i18n-aria-label]').forEach(element => {
    const key = element.getAttribute('data-i18n-aria-label');
    if (key && translations[key]) {
      if (element.getAttribute('aria-label') !== translations[key]) {
        element.setAttribute('aria-label', translations[key]);
      }
    }
  });

  // Handle value attributes for specific elements if needed, e.g. input buttons
  document.querySelectorAll('[data-i18n-value]').forEach(element => {
    const key = element.getAttribute('data-i18n-value');
    if (key && translations[key] && (element instanceof HTMLInputElement || element instanceof HTMLButtonElement)) {
      if (element.value !== translations[key]) {
        element.value = translations[key];
      }
    }
  });
}

export function setLanguage(lang: string): void {
  loadLanguage(lang).then(() => {
    localStorage.setItem('selectedLanguage', lang);
    // Dispatch a custom event to notify components that language has changed
    // This is useful if components need to re-render based on language change,
    // though direct DOM manipulation as done in applyTranslations might cover many cases.
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
  });
}

export function initI18n(): void {
  const savedLang = localStorage.getItem('selectedLanguage') || 'en';
  loadLanguage(savedLang);
}

// Initial call to setup i18n when the script is loaded.
// Depending on your app's structure, you might call this at a different entry point.
if (typeof window !== 'undefined') {
 initI18n();
}
