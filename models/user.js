// models/User.js
const { DataTypes } = import('sequelize');
const { sequelize } = import('../config/db'); // Importa a instância de conexão

const User = sequelize.define('User', {
    // Definindo as colunas da tabela 'users' (BDI)
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true, // Corresponde ao SERIAL PRIMARY KEY do SQL
    },
    username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true, // Restrição UNIQUE
    },
    passwordHash: { // Note o 'Hash' em CamelCase para o Sequelize
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'password_hash', // Mapeia para o nome da coluna no SQL
    },
    role: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'customer',
    },
    // O Sequelize adiciona automaticamente 'createdAt' e 'updatedAt'
}, {
    tableName: 'users', // Garante que o nome da tabela no BD seja 'users'
    timestamps: true,
});

module.exports = User;