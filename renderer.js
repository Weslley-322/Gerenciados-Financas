document.addEventListener('DOMContentLoaded', () => {
    const statusEl = document.getElementById('status');
    const totalBalanceEl = document.getElementById('total-balance-el');
    const totalIncomeEl = document.getElementById('total-income-el');
    const totalExpenseEl = document.getElementById('total-expense-el');
    const transactionsList = document.getElementById('transactions-list');
    const addTransactionBtn = document.getElementById('add-transaction-btn');
    const transactionSidebar = document.getElementById('transaction-sidebar');
    const closeSidebarBtn = document.getElementById('close-sidebar-btn');
    const addTransactionForm = document.getElementById('add-transaction-form');
    const clearBalanceBtn = document.getElementById('clear-balance-btn'); 

    let lang;

    function formatdate(dateString){
        if (!dateString) return '';
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    }

    function updateUIWithTranslations() {
        if (!lang) return;
        
        const mainTitle = document.getElementById('app-title');
        if (mainTitle) mainTitle.textContent = lang.appTitle;

        const statusEl = document.getElementById('status');
        if (statusEl) statusEl.textContent = lang.statusReady;

        const addTransactionBtn = document.getElementById('add-transaction-btn');
        if (addTransactionBtn) addTransactionBtn.textContent = lang.addTransactionBtn;
        
        const transactionsTitle = document.querySelector('#transactions-container h2');
        if (transactionsTitle) transactionsTitle.textContent = lang.transactionsTitle;
        
        const addTransactionTitle = document.getElementById('add-transaction-title');
        if (addTransactionTitle) addTransactionTitle.textContent = lang.addTransactionTitle;
        
        const transactionTypeLabel = document.querySelector('label[for="type"]');
        if (transactionTypeLabel) transactionTypeLabel.textContent = lang.transactionType;
        
        const incomeRadioLabel = document.querySelector('label[for="type-income"]');
        if (incomeRadioLabel) incomeRadioLabel.textContent = lang.typeIncome;
        
        const expenseRadioLabel = document.querySelector('label[for="type-expense"]');
        if (expenseRadioLabel) expenseRadioLabel.textContent = lang.typeExpense;
        
        const valueLabel = document.querySelector('label[for="value"]');
        if (valueLabel) valueLabel.textContent = lang.valueLabel;
        
        const descriptionLabel = document.querySelector('label[for="description"]');
        if (descriptionLabel) descriptionLabel.textContent = lang.descriptionLabel;
        
        const dateLabel = document.querySelector('label[for="date"]');
        if (dateLabel) dateLabel.textContent = lang.dateLabel;
        
        const reminderLabel = document.querySelector('label[for="reminder-date"]');
        if (reminderLabel) reminderLabel.textContent = lang.reminderDateLabel;
        
        const submitBtn = document.querySelector('#add-transaction-form button[type="submit"]');
        if (submitBtn) submitBtn.textContent = lang.submitBtn;

        const totalBalanceLabel = document.getElementById('total-balance-label');
        if (totalBalanceLabel) totalBalanceLabel.textContent = lang.totalBalance;

        const totalIncomeLabel = document.getElementById('total-income-label');
        if (totalIncomeLabel) totalIncomeLabel.textContent = lang.totalIncome;

        const totalExpenseLabel = document.getElementById('total-expense-label');
        if (totalExpenseLabel) totalExpenseLabel.textContent = lang.totalExpense;

        const clearBalanceBtn = document.getElementById('clear-balance-btn');
        if (clearBalanceBtn) clearBalanceBtn.textContent = lang.clearBalanceBtn;
    }

    function renderTransactions(data) {
        if (!lang) return;
        const { transactions, balance } = data;

        let totalIncome = 0;
        let totalExpense = 0;
        
        if (transactionsList) {
            transactionsList.innerHTML = '';
            if (transactions.length > 0) {
                transactions.forEach(transaction => {
                    const listItem = document.createElement('li');
                    const valueClass = transaction.category === 'income' ? 'income' : 'expense';
                    const displayValue = transaction.value;

                    if (transaction.category === 'income') {
                        totalIncome += transaction.value;
                    } else {
                        totalExpense += transaction.value;
                    }
                    
                    const formattedDate = formatdate(transaction.date);

                    listItem.innerHTML = `
                        <div class="transaction-details">
                            <span class="transaction-description">${transaction.description || 'N/A'}</span>
                            <span class="transaction-date">${formattedDate}</span>
                        </div>
                        <span class="transaction-value ${valueClass}">R$ ${displayValue.toFixed(2)}</span>
                        <button class="delete-btn" data-id="${transaction.id}">×</button>
                    `;
                    transactionsList.appendChild(listItem);
                });
            } else {
                transactionsList.innerHTML = `<li>${lang.noTransactions}</li>`;
            }
        }
        
        if (totalBalanceEl) totalBalanceEl.textContent = `R$ ${balance.toFixed(2)}`;
        if (totalIncomeEl) totalIncomeEl.textContent = `R$ ${totalIncome.toFixed(2)}`;
        if (totalExpenseEl) totalExpenseEl.textContent = `R$ ${Math.abs(totalExpense).toFixed(2)}`;
    }

    if (addTransactionBtn) {
        addTransactionBtn.addEventListener('click', () => {
            transactionSidebar.classList.add('open');
        });
    }

    if (closeSidebarBtn) {
        closeSidebarBtn.addEventListener('click', () => {
            transactionSidebar.classList.remove('open');
        });
    }

    if (addTransactionForm) {
        addTransactionForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const type = document.querySelector('input[name="type"]:checked').value;
            let value = parseFloat(document.getElementById('value').value);
            const date = document.getElementById('date').value;
            const description = document.getElementById('description').value;
            const reminderDate = document.getElementById('reminder-date').value;
            
            if (type === 'expense') {
                value = Math.abs(value);
            }

            window.electronAPI.sendTransactionData({ value, date, category: type, description, reminderDate });
            
            transactionSidebar.classList.remove('open');
            addTransactionForm.reset();
        });
    }

    if (transactionsList) {
        transactionsList.addEventListener('click', (event) => {
            if (event.target.classList.contains('delete-btn')) {
                const transactionId = event.target.dataset.id;
                window.electronAPI.deleteTransaction(transactionId);
            }
        });
    }

    if (clearBalanceBtn) {
        clearBalanceBtn.addEventListener('click', () => {
            window.electronAPI.clearBalance();
        });
    }

    window.electronAPI.onOpenAddTransactionSidebar(() => {
        if (transactionSidebar) {
            transactionSidebar.classList.add('open');
        }
    });

    window.electronAPI.onTransactionsReceived((data) => {
        renderTransactions(data);
    });

    window.electronAPI.onTransactionAdded(() => {
        window.electronAPI.getTransactions();
    });

    window.electronAPI.onBalanceCleared(() => {
        window.electronAPI.getTransactions();
    });

    window.electronAPI.onUpdateLanguage(newLang => {
        lang = newLang;
        updateUIWithTranslations();
        window.electronAPI.getTransactions();
    });

    window.electronAPI.onUpdateTheme(theme => {
        if (theme === 'light') {
            document.body.classList.add('light-theme');
        } else {
            document.body.classList.remove('light-theme');
        }
    });

    window.electronAPI.getTransactions();
});