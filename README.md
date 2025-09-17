# Gerenciador Financeiro Pessoal

Um aplicativo de desktop intuitivo para gerenciar suas finanças pessoais de forma simples e segura, construído com o framework Electron.

O aplicativo permite que você adicione e acompanhe suas transações de receitas e despesas, visualize o saldo total e mantenha um controle detalhado do seu fluxo de caixa.

## Funcionalidades Principais

* **Registro de Transações:** Adicione novas receitas e despesas com valor, categoria e descrição.
* **Visualização de Dados:** Acompanhe o saldo total e a soma de receitas e despesas em tempo real.
* **Opções de Personalização:**
* **Temas:** Alternância entre os modos claro e escuro.
* **Idiomas:** Suporte para português (Brasil) e inglês.
* **Prevenção de Hibernação:** Opção para manter a tela ligada, ideal para monitorar a aplicação por longos períodos.
* **Notificações de Lembretes:** Receba notificações para despesas futuras com base em uma data de lembrete.
* **Experiência de Usuário Aprimorada:**
* **Splash Screen:** Uma tela de carregamento animada com um GIF, proporcionando uma inicialização mais agradável.
* **Ícone do Aplicativo:** Ícone personalizado na barra de tarefas e na área de trabalho, garantindo uma identidade visual única.
* **Banco de Dados Local:** Todas as transações são armazenadas em um banco de dados SQLite3, garantindo que seus dados permaneçam privados e seguros em seu computador.

## Tecnologias Utilizadas

* **Electron:** Para a construção da aplicação de desktop.
* **Node.js:** O ambiente de execução do JavaScript.
* **HTML, CSS e JavaScript:** As tecnologias padrão da web para a interface do usuário.
* **SQLite3:** Um banco de dados leve e local, ideal para projetos que não precisam de um servidor externo.
* **`electron-builder`:** Ferramenta para empacotar e distribuir o aplicativo final.

## Como Instalar e Rodar o Projeto

Siga estes passos para configurar e executar o aplicativo em seu ambiente de desenvolvimento.

### Pré-requisitos
Certifique-se de ter o [Node.js](https://nodejs.org/) e o npm (gerenciador de pacotes do Node) instalados em sua máquina.

### 1. Clonar o Repositório
```bash
git clone [https://github.com/seu-usuario/seu-repositorio.git](https://github.com/seu-usuario/seu-repositorio.git)
cd seu-repositorio