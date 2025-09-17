const { app, BrowserWindow, ipcMain, Menu, Notification, powerSaveBlocker } = require('electron');
const path = require('path');
const fs = require('fs');
const { initializeDatabase, getDatabase, deleteTransaction } = require('./database/database.js');

const settingsPath = path.join(app.getPath('userData'), 'settings.json');
const balancePath = path.join(app.getPath('userData'), 'balance.json');
let powerSaveBlockerId = 0;
let mainWindow;
let settingsWindow;

let languages;

function getSettings() {
    try {
        if (fs.existsSync(settingsPath)) {
            const data = fs.readFileSync(settingsPath, 'utf8');
            const settings = JSON.parse(data);
            return settings;
        }
    } catch (err) {
        console.error('Erro ao ler as configurações:', err);
    }
    return { theme: 'dark', lang: 'pt-br', preventDisplaySleep: false };
}

function saveSettings(settings) {
    try {
        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    } catch (err) {
        console.error('Erro ao salvar as configurações:', err);
    }
}

function getBalance() {
    try {
        if (fs.existsSync(balancePath)) {
            const data = fs.readFileSync(balancePath, 'utf8');
            const balance = JSON.parse(data);
            return balance.value;
        }
    } catch (err) {
        console.error('Erro ao ler o saldo:', err);
    }
    return 0;
}

function saveBalance(balance) {
    try {
        fs.writeFileSync(balancePath, JSON.stringify({ value: balance }, null, 2));
    } catch (err) {
        console.error('Erro ao salvar o saldo:', err);
    }
}

function loadLanguage(langCode) {
    return languages[langCode] || languages['pt-br'];
}

function startPowerSaveBlocker() {
    if (powerSaveBlockerId === 0) {
        powerSaveBlockerId = powerSaveBlocker.start('prevent-display-sleep');
        console.log('PowerSaveBlocker ativado.');
    }
}

function stopPowerSaveBlocker() {
    if (powerSaveBlocker.isStarted(powerSaveBlockerId)) {
        powerSaveBlocker.stop(powerSaveBlockerId);
        powerSaveBlockerId = 0;
        console.log('PowerSaveBlocker desativado.');
    }
}

function createAppMenu() {
    const lang = loadLanguage(getSettings().lang);
    const menuTemplate = [
        {
            label: lang.menuFile,
            submenu: [
                {
                    label: lang.addTransactionBtn,
                    accelerator: process.platform === 'darwin' ? 'Cmd+N' : 'Ctrl+N',
                    click() {
                        if (mainWindow) {
                            mainWindow.webContents.send('open-add-transaction-sidebar');
                        }
                    }
                },
                { type: 'separator' },
                {
                    label: lang.menuExit,
                    accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
                    click() {
                        app.quit();
                    }
                }
            ]
        },
        {
            label: lang.menuSettings,
            submenu: [
                {
                    label: lang.menuOpenSettings,
                    click() {
                        createSettingsWindow();
                    }
                }
            ]
        }
    ];
    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);
}

function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 1024,
        height: 768,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });

    mainWindow.loadFile(path.join(__dirname, 'views', 'index.html'));

    const settings = getSettings();
    const lang = loadLanguage(settings.lang);

    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.send('update-language', lang);
        mainWindow.webContents.send('update-theme', settings.theme);
    });

    if (settings.preventDisplaySleep) {
        startPowerSaveBlocker();
    }
}

function createSettingsWindow() {
    settingsWindow = new BrowserWindow({
        width: 600,
        height: 400,
        parent: mainWindow,
        modal: true,
        show: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });

    settingsWindow.loadFile(path.join(__dirname, 'views', 'settings.html'));

    settingsWindow.once('ready-to-show', () => {
        settingsWindow.show();
    });

    settingsWindow.on('closed', () => {
        settingsWindow = null;
    });
}

function checkExpiredReminders() {
    const db = getDatabase();
    const today = new Date().toISOString().split('T')[0];
    
    db.all('SELECT * FROM transactions WHERE reminderDate != "" AND reminderDate <= ? AND category = "expense"', today, (err, rows) => {
        if (err) {
            console.error('Erro ao verificar lembretes:', err);
            return;
        }
        if (rows.length > 0) {
            const lang = loadLanguage(getSettings().lang);
            rows.forEach(row => {
                new Notification({
                    title: lang.reminderTitle,
                    body: `Lembrete: Pagar ${row.description} em ${row.reminderDate}`
                }).show();
            });
        }
    });
}

app.whenReady().then(() => {
    initializeDatabase();
    
    languages = {
        'en': JSON.parse(fs.readFileSync(path.join(__dirname, 'src', 'lang', 'en.json'), 'utf8')),
        'pt-br': JSON.parse(fs.readFileSync(path.join(__dirname, 'src', 'lang', 'pt.json'), 'utf8'))
    };

    createMainWindow();
    createAppMenu();
    checkExpiredReminders();

    ipcMain.on('new-transaction', (event, transaction) => {
        const db = getDatabase();
        const stmt = db.prepare('INSERT INTO transactions (value, category, description, date, reminderDate) VALUES (?, ?, ?, ?, ?)');
        stmt.run(transaction.value, transaction.category, transaction.description, transaction.date, transaction.reminderDate);
        stmt.finalize();

        const currentBalance = getBalance();
        const updatedBalance = transaction.category === 'income' 
                             ? currentBalance + transaction.value 
                             : currentBalance - transaction.value;
        saveBalance(updatedBalance);

        if (mainWindow) {
            mainWindow.webContents.send('transaction-added');
        }
    });

    ipcMain.on('delete-transaction', (event, id) => {
        deleteTransaction(id);
        if (mainWindow) {
            mainWindow.webContents.send('transaction-added');
        }
    });

    ipcMain.on('get-transactions', (event) => {
        const db = getDatabase();
        db.all('SELECT * FROM transactions ORDER BY date DESC', (err, rows) => {
            if (err) {
                console.error(err);
                return;
            }
            if (mainWindow) {
                mainWindow.webContents.send('transactions-list', { transactions: rows, balance: getBalance() });
            }
        });
    });

    ipcMain.on('clear-balance', () => {
        saveBalance(0);
        if (mainWindow) {
            mainWindow.webContents.send('balance-cleared');
        }
    });

    ipcMain.on('save-settings', (event, newSettings) => {
        const settings = getSettings();
        const updatedSettings = { ...settings, ...newSettings };
        saveSettings(updatedSettings);

        if (updatedSettings.preventDisplaySleep) {
            startPowerSaveBlocker();
        } else {
            stopPowerSaveBlocker();
        }
        
        if (newSettings.lang) {
            createAppMenu();
        }

        if (mainWindow) {
            if (newSettings.theme) {
                mainWindow.webContents.send('update-theme', newSettings.theme);
            }
            if (newSettings.lang) {
                const newLang = loadLanguage(newSettings.lang);
                mainWindow.webContents.send('update-language', newLang);
                if (settingsWindow) {
                    settingsWindow.webContents.send('update-language', newLang);
                }
            }
        }
    });

    ipcMain.handle('get-settings', () => {
        return getSettings();
    });

    ipcMain.on('update-theme', (event, theme) => {
        if (mainWindow) {
            if (theme === 'light') {
                mainWindow.webContents.executeJavaScript(`document.body.classList.add('light-theme');`);
            } else {
                mainWindow.webContents.executeJavaScript(`document.body.classList.remove('light-theme');`);
            }
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});