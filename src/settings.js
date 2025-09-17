document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const languageSelector = document.getElementById('language-selector');
    const powerSaveBlockerCheckbox = document.getElementById('power-save-blocker');

    // Carregar as preferências salvas
    window.electronAPI.getSettings().then(settings => {
        // Define o estado do toggle (true para dark, false para light)
        themeToggle.checked = settings.theme === 'dark';

        if (settings.lang) {
            languageSelector.value = settings.lang;
        }
        if (settings.preventDisplaySleep) {
            powerSaveBlockerCheckbox.checked = settings.preventDisplaySleep;
        }
    });
    
    // Salvar a preferência de tema quando o usuário a altera
    themeToggle.addEventListener('change', (event) => {
        const isDark = event.target.checked;
        const newTheme = isDark ? 'dark' : 'light';
        window.electronAPI.saveSettings({ theme: newTheme });
    });

    // Salvar a preferência de idioma quando o usuário a altera
    languageSelector.addEventListener('change', (event) => {
        window.electronAPI.saveSettings({ lang: event.target.value });
    });

    // Salvar a preferência do powerSaveBlocker quando o usuário a altera
    powerSaveBlockerCheckbox.addEventListener('change', (event) => {
        window.electronAPI.saveSettings({ preventDisplaySleep: event.target.checked });
    });

    // Lida com a atualização de idioma para os elementos da interface
    window.electronAPI.onUpdateLanguage(newLang => {
        const themeLabel = document.getElementById('theme-label');
        if (themeLabel) themeLabel.textContent = newLang.themeLabel;
        
        const languageLabel = document.getElementById('language-label');
        if (languageLabel) languageLabel.textContent = newLang.languageLabel;

        const powerSaverBlockerLabel = document.getElementById('power-save-blocker-label');
        if (powerSaverBlockerLabel) powerSaverBlockerLabel.textContent = newLang.powerSaverBlockerLabel;

        const langPtbrOption = document.getElementById('lang-ptbr-option');
        if (langPtbrOption) langPtbrOption.textContent = newLang.languagePTBR;

        const langEnOption = document.getElementById('lang-en-option');
        if (langEnOption) langEnOption.textContent = newLang.languageEN;
    });
});