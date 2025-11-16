// src/App.jsx
import React, { useState, useEffect } from 'react';

// Importar componentes de página
import HomePage from './pages/HomePage.jsx';
import RestaurantsListPage from './pages/RestaurantsListPage.jsx';
import RestaurantMenuPage from './pages/RestaurantMenuPage.jsx';
import CartPage from './pages/CartPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import AuthPage from './pages/AuthPage.jsx';
import UserDashboardPage from './pages/UserDashboardPage.jsx';
import RestaurantOwnerProfilePage from './pages/RestaurantOwnerProfilePage.jsx';
import Navbar from './components/NavBar.jsx';
import Footer from './components/Footer.jsx';

// NOVO: URL base da sua API (Back-End)
const API_BASE_URL = 'http://localhost:3000/api';

function App() {
    // Variáveis de Estado
    const [currentPage, setCurrentPage] = useState(localStorage.getItem('munchdelivery_currentPage') || 'home');
    const [selectedRestaurantId, setSelectedRestaurantId] = useState(localStorage.getItem('munchdelivery_selectedRestaurantId') || null);
    const [cart, setCart] = useState(JSON.parse(localStorage.getItem('munchdelivery_cart')) || []);
    // Alteramos a inicialização para usar o token em vez da flag isLoggedIn direta
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('munchdelivery_token')); 
    const [loggedInUser, setLoggedInUser] = useState(localStorage.getItem('munchdelivery_loggedInUser') || null);
    const [authMessage, setAuthMessage] = useState(null); 
    const [appMessage, setAppMessage] = useState(null); 
    const [selectedCategory, setSelectedCategory] = useState(localStorage.getItem('munchdelivery_selectedCategory') || '');
    const [userLocation, setUserLocation] = useState(null);
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    // Efeitos para persistir o estado no localStorage
    // ATENÇÃO: Removemos a persistência de isLoggedIn e loggedInUser, pois agora dependem do TOKEN
    useEffect(() => {
        localStorage.setItem('munchdelivery_currentPage', currentPage);
    }, [currentPage]);

    useEffect(() => {
        localStorage.setItem('munchdelivery_selectedRestaurantId', selectedRestaurantId);
    }, [selectedRestaurantId]);

    useEffect(() => {
        localStorage.setItem('munchdelivery_cart', JSON.stringify(cart));
    }, [cart]);

    useEffect(() => {
        localStorage.setItem('munchdelivery_selectedCategory', selectedCategory);
    }, [selectedCategory]);
    
    // NOVO EFEITO: Efeito para verificar o token e carregar o usuário na inicialização
    useEffect(() => {
        const token = localStorage.getItem('munchdelivery_token');
        if (token) {
            // Se houver um token, idealmente faríamos uma chamada para validar e obter dados do usuário.
            // Para manter este exemplo simples, apenas definimos como logado se o token existir.
            // Em produção, você chamaria: fetch(`${API_BASE_URL}/auth/me`, { headers: { 'Authorization': `Bearer ${token}` } });
            setIsLoggedIn(true);
            // O loggedInUser deve ser definido após a validação do token, 
            // mas mantemos o valor salvo localmente para fins de simulação rápida.
        } else {
            setIsLoggedIn(false);
            setLoggedInUser(null);
        }
    }, []);

    // Efeito para limpar mensagens da aplicação após um tempo
    useEffect(() => {
        if (appMessage) {
            const timer = setTimeout(() => {
                setAppMessage(null);
            }, 3000); 
            return () => clearTimeout(timer);
        }
    }, [appMessage]);

    // Função de navegação
    const navigate = (page, params = {}) => {
        setCurrentPage(page);
        setAuthMessage(null); 
        setAppMessage(null); 
        setShowMobileMenu(false); 

        if (page === 'restaurantMenu' && params.restaurantId) {
            setSelectedRestaurantId(params.restaurantId);
        } else {
            setSelectedRestaurantId(null);
        }

        if (page === 'home' || page === 'login' || page === 'checkout') {
            setSelectedCategory('');
        }
    };

    // Função para definir a localização do usuário
    const handleSetUserLocation = (location) => {
        setUserLocation(location);
        setAppMessage({ type: 'success', text: 'Localização obtida com sucesso!' }); 
    };

    // Funções do Carrinho (mantidas)
    const addToCart = (itemToAdd) => {
        setCart(prevCart => {
            const existingItemIndex = prevCart.findIndex(item => item.id === itemToAdd.id);
            if (existingItemIndex > -1) {
                const newCart = [...prevCart];
                newCart[existingItemIndex].quantity += 1;
                return newCart;
            } else {
                return [...prevCart, { ...itemToAdd, quantity: 1 }];
            }
        });
        setAppMessage({ type: 'success', text: `${itemToAdd.name} adicionado ao carrinho!` });
    };

    const updateQuantity = (itemId, newQuantity) => {
        setCart(prevCart => {
            const itemIndex = prevCart.findIndex(item => item.id === itemId);
            if (itemIndex > -1) {
                if (newQuantity <= 0) {
                    setAppMessage({ type: 'info', text: 'Item removido do carrinho.' }); 
                    return prevCart.filter(item => item.id !== itemId);
                } else {
                    const newCart = [...prevCart];
                    newCart[itemIndex].quantity = newQuantity;
                    return newCart;
                }
            }
            return prevCart;
        });
    };

    const removeItem = (itemId) => {
        setCart(prevCart => prevCart.filter(item => item.id !== itemId));
        setAppMessage({ type: 'info', text: 'Item removido do carrinho.' }); 
    };

    // NOVO: Funções de Autenticação com API (DBEI)
    const register = async (username, password) => {
        if (!username || !password) {
            setAuthMessage({ type: 'error', text: 'Nome de usuário e senha são obrigatórios.' });
            return;
        }
        
        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                setAuthMessage({ type: 'success', text: data.message || 'Registro realizado com sucesso! Faça login.' });
            } else {
                setAuthMessage({ type: 'error', text: data.message || 'Falha ao registrar usuário.' });
            }
        } catch (error) {
            console.error('Erro de conexão com a API:', error);
            setAuthMessage({ type: 'error', text: 'Não foi possível conectar ao servidor para registrar.' });
        }
    };

    const login = async (username, password) => {
        if (!username || !password) {
            setAuthMessage({ type: 'error', text: 'Nome de usuário e senha são obrigatórios.' });
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                // 1. Receber o TOKEN e o usuário (dados não sensíveis) do Back-End
                const { user, token } = data; 
                
                // 2. Armazenar o TOKEN e o usuário no localStorage
                localStorage.setItem('munchdelivery_token', token); // Chave de segurança!
                localStorage.setItem('munchdelivery_loggedInUser', user.username);
                
                setIsLoggedIn(true);
                setLoggedInUser(user.username);
                setAuthMessage({ type: 'success', text: `Bem-vindo, ${user.username}!` });
                
                // Lógica de navegação baseada no tipo de usuário/retorno da API
                if (user.role === 'owner') { 
                    navigate('ownerProfile');
                } else {
                    navigate('dashboard');
                }

            } else { 
                setAuthMessage({ type: 'error', text: data.message || 'Nome de usuário ou senha incorretos.' });
            }
        } catch (error) {
            console.error('Erro de conexão com a API:', error);
            setAuthMessage({ type: 'error', text: 'Não foi possível conectar ao servidor de autenticação.' });
        }
    };

    const logout = () => {
        setIsLoggedIn(false);
        setLoggedInUser(null);
        // Remove as chaves de segurança do localStorage
        localStorage.removeItem('munchdelivery_token');
        localStorage.removeItem('munchdelivery_loggedInUser');
        setAppMessage({ type: 'info', text: 'Você foi desconectado.' });
        navigate('home');
    };

    // Função para atualizar a categoria selecionada
    const selectCategory = (categoryId) => {
        setSelectedCategory(categoryId);
    };

    // Renderização condicional de conteúdo
    let content;
    switch (currentPage) {
        case 'home':
            content = <HomePage navigate={navigate} selectedCategory={selectedCategory} onSelectCategory={selectCategory} onSetUserLocation={handleSetUserLocation} />;
            break;
        case 'restaurants':
            content = <RestaurantsListPage navigate={navigate} selectedCategory={selectedCategory} onSelectCategory={selectCategory} userLocation={userLocation} />;
            break;
        case 'restaurantMenu':
            content = <RestaurantMenuPage addToCart={addToCart} restaurantId={selectedRestaurantId} navigate={navigate} />;
            break;
        case 'cart':
            content = <CartPage cart={cart} updateQuantity={updateQuantity} removeItem={removeItem} navigate={navigate} />;
            break;
        case 'checkout':
            content = <CheckoutPage cart={cart} navigate={navigate} setAppMessage={setAppMessage} />;
            break;
        case 'login':
        case 'dashboard':
        case 'ownerProfile':
            // Lógica de navegação após login (agora mais simples, pois depende do estado/role após a API)
            if (isLoggedIn) {
                // A navegação real deve ser feita na função login, mas este bloco trata 
                // de redirecionamentos diretos via URL (ex: dashboard)
                if (loggedInUser && loggedInUser.role === 'owner') { // Exemplo: verifica a role no objeto do usuário
                     content = <RestaurantOwnerProfilePage loggedInUser={loggedInUser} logout={logout} navigate={navigate} />;
                } else if (isLoggedIn) {
                    content = <UserDashboardPage loggedInUser={loggedInUser} logout={logout} navigate={navigate} />;
                }
            } else {
                content = <AuthPage login={login} register={register} authMessage={authMessage} isLoggedIn={isLoggedIn} />;
            }
            break;
        default:
            content = <HomePage navigate={navigate} selectedCategory={selectedCategory} onSelectCategory={selectCategory} onSetUserLocation={handleSetUserLocation} />;
    }

    return (
        <div id="app-root-react">
            <header>
                <h1>MunchDelivery</h1>
            </header>
            <Navbar navigate={navigate} isLoggedIn={isLoggedIn} logout={logout} loggedInUser={loggedInUser} showMobileMenu={showMobileMenu} setShowMobileMenu={setShowMobileMenu} />
            {/* Área para mensagens da aplicação */}
            {appMessage && (
                <div className={`app-message ${appMessage.type}`}>
                    {appMessage.text}
                </div>
            )}
            {content}
            <Footer />
        </div>
    );
}

export default App;