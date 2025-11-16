// middleware/auth.middleware.js

const jwt = require('jsonwebtoken');

// A chave secreta deve ser a mesma usada para assinar o token no auth.routes.js
const JWT_SECRET = 'sua_chave_secreta_super_forte'; 

const protect = (req, res, next) => {
    let token;

    // 1. Verificar se o token está presente no cabeçalho
    // Esperamos o formato: Authorization: Bearer <token>
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Pegar o token da string 'Bearer <token>'
            token = req.headers.authorization.split(' ')[1];

            // 2. Verificar e decodificar o token
            const decoded = jwt.verify(token, JWT_SECRET);

            // 3. Adicionar os dados do usuário (id, role) à requisição
            // Isso permite que as rotas subsequentes saibam quem está logado
            req.user = decoded;

            next(); // Continuar para a próxima função da rota (o controlador)

        } catch (error) {
            console.error('Erro de autorização:', error);
            // 4. Retornar erro se o token for inválido, expirado ou manipulado
            return res.status(401).json({ message: 'Não autorizado, token falhou.' });
        }
    }

    // 5. Retornar erro se não houver token no cabeçalho
    if (!token) {
        return res.status(401).json({ message: 'Não autorizado, nenhum token.' });
    }
};

module.exports = { protect };