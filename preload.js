const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    sendMessageToMain: (message) => ipcRenderer.send('renderer-ready', message),
    onMainResponse: (callback) => ipcRenderer.on('main-response', (event, ...args) => callback(...args)),
    sendTransactionData: (data) => ipcRenderer.send('new-transaction', data),
    getTransactions: () => ipcRenderer.send('get-transactions'),
    onTransactionsReceived: (callback) => ipcRenderer.on('transactions-list', (event, ...args) => callback(...args)),
    onTransactionAdded: (callback) => ipcRenderer.on('transaction-added', (event, ...args) => callback(...args)),
    deleteTransaction: (id) => ipcRenderer.send('delete-transaction', id),
    saveSettings: (settings) => ipcRenderer.send('save-settings', settings),
    getSettings: () => ipcRenderer.invoke('get-settings'),
    onUpdateTheme: (callback) => ipcRenderer.on('update-theme', (event, ...args) => callback(...args)),
    onUpdateLanguage: (callback) => ipcRenderer.on('update-language', (event, ...args) => callback(...args)),
    onOpenAddTransactionSidebar: (callback) => ipcRenderer.on('open-add-transaction-sidebar', (event, ...args) => callback(...args)),
    clearBalance: () => ipcRenderer.send('clear-balance'),
    onBalanceCleared: (callback) => ipcRenderer.on('balance-cleared', (event, ...args) => callback(...args)),
});