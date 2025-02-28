const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const mangaRoutes = require('./routes/manga');
const { router: authRoutes, verifyToken } = require('./routes/auth');
const { initializeDatabase } = require('./utils/dbInitializer');

const app = express();
const PORT = process.env.PORT || 3000;

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lectormanga', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('Conectado a MongoDB');
    // Inicializar la base de datos si está vacía
    initializeDatabase();
})
.catch((error) => {
    console.error('Error conectando a MongoDB:', error);
});

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// Servir la carpeta Manga
app.use('/manga', express.static(path.join(process.cwd(), 'Manga')));

// Rutas de API
app.use('/api/mangas', mangaRoutes);
app.use('/api/auth', authRoutes);

// Middleware para proteger rutas
const protectRoute = (req, res, next) => {
    // Excluir rutas públicas
    const publicRoutes = ['/login', '/register'];
    if (publicRoutes.includes(req.path)) {
        return next();
    }
    
    // Verificar token para rutas protegidas
    const token = req.cookies.token;
    if (!token) {
        return res.redirect('/login');
    }
    
    try {
        const jwt = require('jsonwebtoken');
        jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
        next();
    } catch (error) {
        res.clearCookie('token');
        return res.redirect('/login');
    }
};

// Rutas de vistas
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'register.html'));
});

// Proteger rutas principales
app.get('/', protectRoute, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Ruta para los detalles del manga
app.get('/manga/:mangaId', protectRoute, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'manga-detail.html'));
});

// Ruta para el lector
app.get('/read/:mangaId', protectRoute, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'reader.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});