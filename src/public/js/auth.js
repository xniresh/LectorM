document.addEventListener('DOMContentLoaded', () => {
    // Formulario de login
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Formulario de registro
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Link para olvidar contraseña
    const forgotPasswordLink = document.getElementById('forgot-password');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            alert('Funcionalidad en desarrollo. Por favor, contacta al administrador.');
        });
    }
    
    // Verificar si el usuario está autenticado
    checkAuthStatus();
});

// Manejar el envío del formulario de login
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorElement = document.getElementById('login-error');
    
    // Validación básica
    if (!username || !password) {
        errorElement.textContent = 'Por favor, completa todos los campos';
        return;
    }
    
    try {
        // Limpiar mensaje de error
        errorElement.textContent = '';
        
        // Enviar solicitud al servidor
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Error al iniciar sesión');
        }
        
        // Redireccionar a la página principal
        window.location.href = '/';
    } catch (error) {
        errorElement.textContent = error.message;
        console.error('Error de login:', error);
    }
}

// Manejar el envío del formulario de registro
async function handleRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const errorElement = document.getElementById('register-error');
    
    // Validación básica
    if (!username || !email || !password || !confirmPassword) {
        errorElement.textContent = 'Por favor, completa todos los campos';
        return;
    }
    
    if (password !== confirmPassword) {
        errorElement.textContent = 'Las contraseñas no coinciden';
        return;
    }
    
    if (password.length < 6) {
        errorElement.textContent = 'La contraseña debe tener al menos 6 caracteres';
        return;
    }
    
    try {
        // Limpiar mensaje de error
        errorElement.textContent = '';
        
        // Enviar solicitud al servidor
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Error al registrarse');
        }
        
        // Mostrar mensaje de éxito y redirigir a la página de login
        alert(data.message || 'Registro exitoso. Por favor, inicia sesión.');
        window.location.href = '/login';
    } catch (error) {
        errorElement.textContent = error.message;
        console.error('Error de registro:', error);
    }
}

// Verificar si el usuario está autenticado
async function checkAuthStatus() {
    try {
        const response = await fetch('/api/auth/check');
        const data = await response.json();
        
        if (response.ok && data.isAuthenticated) {
            // Si estamos en la página de login o registro y el usuario ya está autenticado,
            // redirigir a la página principal
            const currentPath = window.location.pathname;
            if (currentPath === '/login' || currentPath === '/register') {
                window.location.href = '/';
            }
            
            // Actualizar la UI para usuarios autenticados
            updateUIForAuthenticatedUser(data.user);
        } else {
            // Si no estamos en la página de login o registro y el usuario no está autenticado,
            // redirigir a login
            const currentPath = window.location.pathname;
            if (currentPath !== '/login' && currentPath !== '/register') {
                window.location.href = '/login';
            }
        }
    } catch (error) {
        console.error('Error al verificar estado de autenticación:', error);
    }
}

// Actualizar la UI para usuarios autenticados
function updateUIForAuthenticatedUser(user) {
    // Esta función se puede implementar para actualizar elementos de la UI
    // cuando el usuario está autenticado, como mostrar su nombre, etc.
    console.log('Usuario autenticado:', user);
}

// Función para cerrar sesión
async function logout() {
    try {
        const response = await fetch('/api/auth/logout', {
            method: 'POST'
        });
        
        if (response.ok) {
            window.location.href = '/login';
        }
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
    }
}
