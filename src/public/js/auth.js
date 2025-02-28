document.addEventListener('DOMContentLoaded', () => {
    // Formulario de login
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
        
        // Añadir efectos de feedback táctil
        addNeumorphicEffects();
    }
    
    // Formulario de registro
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
        
        // Añadir efectos de feedback táctil
        addNeumorphicEffects();
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

// Añadir efectos de feedback táctil para el diseño neumórfico
function addNeumorphicEffects() {
    // Añadir efectos a los inputs
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        // Efecto al enfocar
        input.addEventListener('focus', () => {
            const formGroup = input.closest('.form-group');
            if (formGroup) {
                formGroup.style.transform = 'scale(1.02)';
            }
        });
        
        // Efecto al perder el foco
        input.addEventListener('blur', () => {
            const formGroup = input.closest('.form-group');
            if (formGroup) {
                formGroup.style.transform = 'scale(1)';
            }
        });
    });
    
    // Añadir efectos al botón
    const button = document.querySelector('.auth-button');
    if (button) {
        // Efecto al pasar el mouse
        button.addEventListener('mouseenter', () => {
            button.style.boxShadow = '8px 8px 16px var(--shadow-dark), -8px -8px 16px var(--shadow-light)';
        });
        
        // Efecto al quitar el mouse
        button.addEventListener('mouseleave', () => {
            button.style.boxShadow = '6px 6px 12px var(--shadow-dark), -6px -6px 12px var(--shadow-light)';
        });
        
        // Efecto al hacer clic
        button.addEventListener('mousedown', () => {
            button.style.boxShadow = 'inset 4px 4px 8px var(--shadow-dark), inset -4px -4px 8px var(--shadow-light)';
            button.style.transform = 'translateY(2px)';
        });
        
        // Efecto al soltar el clic
        button.addEventListener('mouseup', () => {
            setTimeout(() => {
                button.style.boxShadow = '6px 6px 12px var(--shadow-dark), -6px -6px 12px var(--shadow-light)';
                button.style.transform = 'translateY(0)';
            }, 150);
        });
    }
}

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
        
        // Mostrar efecto de carga en el botón
        const submitButton = document.querySelector('.auth-button');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Iniciando sesión...';
        submitButton.disabled = true;
        submitButton.style.opacity = '0.8';
        
        // Enviar solicitud al servidor
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Login exitoso
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('token', data.token);
            
            // Redirigir a la página principal
            window.location.href = '/';
        } else {
            // Error en el login
            errorElement.textContent = data.message || 'Credenciales inválidas';
            
            // Restaurar el botón
            submitButton.textContent = originalText;
            submitButton.disabled = false;
            submitButton.style.opacity = '1';
            
            // Efecto de sacudida en el formulario para indicar error
            const formElement = document.getElementById('login-form');
            formElement.classList.add('shake-animation');
            setTimeout(() => {
                formElement.classList.remove('shake-animation');
            }, 500);
        }
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        errorElement.textContent = 'Error de conexión. Inténtalo de nuevo.';
        
        // Restaurar el botón
        const submitButton = document.querySelector('.auth-button');
        submitButton.textContent = 'Iniciar Sesión';
        submitButton.disabled = false;
        submitButton.style.opacity = '1';
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
        
        // Mostrar efecto de carga en el botón
        const submitButton = document.querySelector('.auth-button');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Registrando...';
        submitButton.disabled = true;
        submitButton.style.opacity = '0.8';
        
        // Enviar solicitud al servidor
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Registro exitoso
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('token', data.token);
            
            // Redirigir a la página principal
            window.location.href = '/';
        } else {
            // Error en el registro
            errorElement.textContent = data.message || 'Error al registrarse';
            
            // Restaurar el botón
            submitButton.textContent = originalText;
            submitButton.disabled = false;
            submitButton.style.opacity = '1';
            
            // Efecto de sacudida en el formulario para indicar error
            const formElement = document.getElementById('register-form');
            formElement.classList.add('shake-animation');
            setTimeout(() => {
                formElement.classList.remove('shake-animation');
            }, 500);
        }
    } catch (error) {
        console.error('Error al registrarse:', error);
        errorElement.textContent = 'Error de conexión. Inténtalo de nuevo.';
        
        // Restaurar el botón
        const submitButton = document.querySelector('.auth-button');
        submitButton.textContent = 'Registrarse';
        submitButton.disabled = false;
        submitButton.style.opacity = '1';
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
