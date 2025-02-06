<p align="center">
    <a href="https://laravel.com" target="_blank">
        <img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="300" alt="Laravel Logo">
    </a>
    <a href="https://react.dev" target="_blank">
        <img src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" width="150" alt="React Logo">
    </a>
</p>

# PlanMore

PlanMore é um sistema web desenvolvido com **Laravel, Breeze, Blade e React** para ajudar no **monitoramento financeiro pessoal**, permitindo previsões de gastos e controle de transações.

## 🚀 Funcionalidades Principais

- **Gerenciamento de Transações**: Classificação entre **entradas e saídas**.
- **Despesas Fixas e Previsões**: Identificação de **gastos recorrentes** e **parcelamentos**.
- **Gráficos e Relatórios**: Análises visuais do fluxo financeiro.
- **Autenticação Segura**: Login tradicional, via **Google** e **GitHub**.
- **Notificações**: Alertas automáticos via e-mail sobre **transações e metas financeiras**.

---

## 📥 Como Configurar o Projeto

### **1️⃣ Clonar o Repositório**
```bash
git clone https://github.com/J-Pantaroto/PlanMore.git
cd PlanMore
```

### **2️⃣ Instalar Dependências**
```bash
composer install
npm install
```

### **3️⃣ Configurar o Banco de Dados**
```bash
cp .env.example .env
php artisan key:generate
```
Edite o arquivo `.env` e configure o banco de dados:
```env
DB_DATABASE=planmore
DB_USERNAME=seu_usuario
DB_PASSWORD=sua_senha
```
Agora, rode as migrations:
```bash
php artisan migrate
```

### **4️⃣ Iniciar o Servidor**
```bash
php artisan serve
npm run dev
```
Acesse o sistema em **http://127.0.0.1:8000**

---

## 📊 Estrutura do Banco de Dados
- **users**: Armazena os usuários do sistema.
- **transactions**: Registra as movimentações financeiras.
- **categories**: Classifica os tipos de transações.
- **financial_predictions**: Projeta saldo futuro com base nos dados.
- **notifications**: Gerencia alertas e lembretes financeiros.

---

## 🛠 Tecnologias Utilizadas
- **Laravel**: Framework PHP para backend robusto.
- **Laravel Breeze**: Autenticação simplificada.
- **Blade**: Renderização rápida e eficiente.
- **React**: Componentes dinâmicos para gráficos e interações.
- **TailwindCSS**: Estilização moderna e responsiva.

---

## 📜 Licença
PlanMore é um software open-source licenciado sob a **MIT License**.

