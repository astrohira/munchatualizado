// routes/auth.routes.js (Modificado)

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();

// NOVO: Importa o modelo User
const User = require('../models/user'); 

// ⚠️ REMOVIDO: const users = {}; 
const JWT_SECRET = 'sua_chave_secreta_super_forte'; 

// --- Rota de Registro (/api/auth/register) ---
router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Nome de usuário e senha são obrigatórios.' });
    }

    try {
        // 1. Verificar se o usuário já existe (Consulta ao BD)
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
            return res.status(409).json({ message: 'Nome de usuário já existe.' });
        }
        
        // 2. Criptografia da Senha (DBEI)
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);
        
        // Simulação da role (papel)
        const role = ['mcdonalds-br', 'kfc-br'].includes(username) ? 'owner' : 'customer';

        // 3. Salvar o Novo Usuário no BD (Criação no BD)
        const newUser = await User.create({
            username,
            passwordHash,
            role
        });

        return res.status(201).json({ message: 'Usuário registrado com sucesso.' });

    } catch (error) {
        console.error('Erro no registro:', error);
        return res.status(500).json({ message: 'Erro interno do servidor ao registrar.' });
    }
});

// --- Rota de Login (/api/auth/login) ---
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // ... (Validação de campos - mantida) ...

    try {
        // 1. Buscar o usuário no BD
        const user = await User.findOne({ where: { username } });

        if (!user) {
            return res.status(401).json({ message: 'Nome de usuário ou senha incorretos.' });
        }

        // 2. Comparar a senha (usando a hash do BD)
        const isMatch = await bcrypt.compare(password, user.passwordHash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Nome de usuário ou senha incorretos.' });
        }

        // 3. Gerar o Token JWT (DBEI: Token)
        const payload = { 
            id: user.id, // Usamos o ID do BD
            role: user.role, 
            type: 'access' 
        };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }); 

        // 4. Retornar o Token e os dados do usuário
        return res.status(200).json({
            message: 'Login bem-sucedido!',
            user: { username: user.username, role: user.role },
            token: token
        });

    } catch (error) {
        console.error('Erro no login:', error);
        return res.status(500).json({ message: 'Erro interno do servidor ao fazer login.' });
    }
});

module.exports = router;