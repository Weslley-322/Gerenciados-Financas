const { app } = require('electron');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

let db;

function initializeDatabase() {
    const dbPath = path.join(app.getPath('userData'), 'finance.db');
    db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('Erro ao abrir o banco de dados:', err.message);
        } else {
            console.log('Banco de dados conectado com sucesso!');
            createTable();
        }
    });
}

function createTable() {
    if (!db) {
        console.error('Banco de dados não inicializado.');
        return;
    }
    db.run(`
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            value REAL NOT NULL,
            date TEXT NOT NULL,
            category TEXT,
            description TEXT,
            reminderDate TEXT
        )
    `, (err) => {
        if (err) {
            console.error('Erro ao criar a tabela:', err.message);
        } else {
            console.log('Tabela "transactions" criada ou já existe.');
        }
    });
}

function getDatabase() {
    return db;
}

function deleteTransaction(id, callback) {
    db.run(`DELETE FROM transactions WHERE id = ?`, id, callback);
}

module.exports = {
    initializeDatabase,
    getDatabase,
    deleteTransaction
};