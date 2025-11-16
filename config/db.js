// config/db.js (Alteração da função connectDB)
require('dotenv').config();
const { Sequelize } = require('sequelize');
// ... (código de inicialização do sequelize) ...

// Importa os modelos aqui para que o Sequelize os conheça
const User = require('../models/user.js'); // Importe o modelo User
// Você importaria aqui os outros modelos: Restaurant, MenuItem, Order, etc.

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Conexão com o banco de dados estabelecida com sucesso.');
        
        // NOVO: Sincroniza os modelos com o banco de dados
        // O Sequelize lerá os modelos e criará/atualizará as tabelas (BDI)
        await sequelize.sync({ alter: true }); // 'alter: true' ajusta a tabela sem perder dados
        console.log('Modelos de BD sincronizados com sucesso.');
        
    } catch (error) {
        console.error('Não foi possível conectar ou sincronizar com o banco de dados:', error);
        process.exit(1);
    }
};

module.exports = { sequelize, connectDB };