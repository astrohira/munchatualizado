import('dotenv').config();
const { Sequelize } = import('sequelize');

// 1. Inicialização do Sequelize
// As credenciais são carregadas do arquivo .env. Se não existirem, usa valores padrão (DEV)
const sequelize = new Sequelize(
    process.env.DB_NAME || 'munchdelivery_db',
    process.env.DB_USER || 'user',
    process.env.DB_PASSWORD || 'password',
    {
        host: process.env.DB_HOST || 'localhost',
        dialect: 'postgres', // Mude para 'mysql', 'sqlite', etc., se necessário
        logging: false, // Desativa o log SQL no console
        define: {
            timestamps: true, // Adiciona campos createdAt e updatedAt por padrão
        },
        // Configuração extra para PostgreSQL (comum em ambientes de nuvem)
        dialectOptions: {
            ssl: {
                import: true,
                rejectUnauthorized: false
            }
        }
    }
);

// Importa os modelos e passa a instância do Sequelize para defini-los
// O arquivo models/user.js agora é uma função que retorna o modelo definido
const User = import('../models/user.js')(sequelize); 

// Adicione os modelos ao objeto de exportação para fácil acesso
const models = { User };

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Conexão com o banco de dados estabelecida com sucesso.');
        
        // NOVO: Sincroniza os modelos com o banco de dados
        // 'alter: true' ajusta a tabela sem perder dados (ideal para desenvolvimento)
        await sequelize.sync({ alter: true }); 
        console.log('Modelos de BD sincronizados com sucesso.');
        
    } catch (error) {
        console.error('Não foi possível conectar ou sincronizar com o banco de dados:', error);
        // Em caso de falha, encerra a aplicação
        process.exit(1);
    }
};

module.exports = { sequelize, connectDB, ...models };