// server.js

// 1. Importações e Configuração
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000; // Define a porta, padrão 3000
const API_BASE_URL = 'http://localhost:5173'; // Substitua pela porta do seu Front-End React

// 2. Middlewares
// Permite que o Front-End (em outra porta) se comunique com o Back-End
app.use(cors({
    origin: API_BASE_URL,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
}));

// Processa requisições JSON e URL-encoded
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 3. Rotas Base

// Rota de teste simples
app.get('/', (req, res) => {
    res.status(200).send('Servidor MunchDelivery API rodando! 🚀');
});

// Importação das rotas de Autenticação
const authRoutes = require('./routes/auth.routes'); 
app.use('/api/auth', authRoutes); 

// Importação das Rotas de Usuário (Protegidas)
const userRoutes = require('./routes/user.routes');
app.use('/api/users', userRoutes); // Configura o prefixo /api/users para as novas rotas

// 4. Inicialização do Servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Para acessar: http://localhost:${PORT}`);
});