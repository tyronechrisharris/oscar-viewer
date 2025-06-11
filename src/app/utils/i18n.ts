let translations: Record<string, string> = {};

export async function loadLanguage(lang: string): Promise<void> {
  try {
    const response = await fetch(`/locales/${lang}.json`);
    if (!response.ok) {
      console.error(`Failed to load language file: ${lang}.json, status: ${response.status}`);
      if (lang !== 'en') {
        console.warn(`Falling back to English as ${lang}.json was not found or failed to load.`);
        await loadLanguage('en');
      }
      return;
    }
    translations = await response.json();
    applyTranslations();
  } catch (error) {
    console.error(`Error loading language file ${lang}.json:`, error);
    if (lang !== 'en') {
      console.warn('Falling back to English due to an error.');
      await loadLanguage('en');
    }
  }
}

function applyTranslations(): void {
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    if (key && translations[key]) {
      if (element.textContent !== translations[key]) {
        element.textContent = translations[key];
      }
    } else if (key) {
      // console.warn(`Translation key not found: ${key}`);
    }
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
    const key = element.getAttribute('data-i18n-placeholder');
    if (key && translations[key]) {
      if (element.getAttribute('placeholder') !== translations[key]) {
        element.setAttribute('placeholder', translations[key]);
      }
    } else if (key) {
      // console.warn(`Translation key not found for placeholder: ${key}`);
    }
  });

  document.querySelectorAll('[data-i18n-title]').forEach(element => {
    const key = element.getAttribute('data-i18n-title');
    if (key && translations[key]) {
      if (element.getAttribute('title') !== translations[key]) {
        element.setAttribute('title', translations[key]);
      }
    } else if (key) {
      // console.warn(`Translation key not found for title: ${key}`);
    }
  });

  document.querySelectorAll('[data-i18n-aria-label]').forEach(element => {
    const key = element.getAttribute('data-i18n-aria-label');
    if (key && translations[key]) {
      if (element.getAttribute('aria-label') !== translations[key]) {
        element.setAttribute('aria-label', translations[key]);
      }
    } else if (key) {
      // console.warn(`Translation key not found for aria-label: ${key}`);
    }
  });

  document.querySelectorAll('[data-i18n-value]').forEach(element => {
    const key = element.getAttribute('data-i18n-value');
    if (key && translations[key] && (element instanceof HTMLInputElement || element instanceof HTMLButtonElement)) {
      if (element.value !== translations[key]) {
        element.value = translations[key];
      }
    } else if (key) {
      // console.warn(`Translation key not found for value: ${key}`);
    }
  });
}

export function setAppLanguage(lang: string): void {
  loadLanguage(lang).then(() => {
    localStorage.setItem('selectedLanguage', lang);
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
  });
}

export function initI18n(): void {
  const savedLang = localStorage.getItem('selectedLanguage') || 'en';
  setAppLanguage(savedLang); // Use setAppLanguage to ensure translations are applied after loading
}

// Ensure this only runs in the browser
if (typeof window !== 'undefined') {
  initI18n();
}
