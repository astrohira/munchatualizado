// routes/user.routes.js

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const User = require('../models/user'); 

// Rota protegida: /api/users/dashboard-data
// O middleware 'protect' é executado ANTES da função da rota
router.get('/dashboard-data', protect, async (req, res) => {
    try {
        // req.user contém os dados do token (id, role) graças ao middleware 'protect'
        const userId = req.user.id; 
        
        // 1. Buscar o usuário e alguns dados (ex: nome, role) no BD
        const user = await User.findByPk(userId, {
            attributes: ['username', 'role', 'createdAt'] // Seleciona apenas campos seguros
        });

        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        // 2. Retornar os dados
        return res.status(200).json({
            message: `Dados do Dashboard para ${user.username}`,
            user,
            accessLevel: user.role,
            restrictedData: 'Esta informação só aparece porque você tem um token válido!'
        });

    } catch (error) {
        console.error('Erro ao buscar dados do dashboard:', error);
        return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

module.exports = router;