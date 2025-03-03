async function incrementViews(mangaId) {
    try {
        await fetch(`/api/mangas/${mangaId}/view`, { method: 'POST' });
    } catch (error) {
        console.error('Error al incrementar vistas:', error);
    }
}

async function loadMangaImages(mangaId) {
    const reader = document.getElementById('reader');
    // Incrementar vistas cuando se carga el manga
    await incrementViews(mangaId);
    try {
        console.log('Cargando imágenes para manga:', mangaId); // Debug log
        reader.innerHTML = '<p class="loading">Cargando imágenes...</p>';

        const response = await fetch(`/api/mangas/${mangaId}/images`);
        if (!response.ok) {
            throw new Error(response.status === 404 ? 'No se encontró el manga' : 'Error al cargar las imágenes');
        }
        
        const data = await response.json();
        console.log('Respuesta del servidor:', data); // Debug log

        if (!data.images || !Array.isArray(data.images) || data.images.length === 0) {
            throw new Error('No se encontraron imágenes para este manga');
        }

        // Limpiar el contenedor
        reader.innerHTML = '';

        // Crear un contenedor para todas las imágenes con ancho adaptativo
        const imagesContainer = document.createElement('div');
        imagesContainer.className = 'images-container';
        
        // Asegurarnos de que las imágenes respeten el ancho máximo del contenedor
        imagesContainer.style.width = '100%';

        // Cargar cada imagen
        for (const [index, imagePath] of data.images.entries()) {
            console.log('Cargando imagen:', imagePath); // Debug log
            const imgContainer = document.createElement('div');
            imgContainer.className = 'image-container';

            const img = document.createElement('img');
            img.className = 'manga-image';
            img.loading = 'lazy';
            img.dataset.page = index + 1;
            // Asegurar que la imagen se ajuste al ancho del contenedor
            img.style.maxWidth = '100%';

            // Agregar eventos para manejo de carga y errores
            img.onerror = () => {
                console.error(`Error al cargar la imagen: ${imagePath}`);
                img.src = '/images/error-image.png';
                imgContainer.classList.add('error');
            };

            img.onload = () => {
                console.log('Imagen cargada:', imagePath); // Debug log
                imgContainer.classList.add('loaded');
            };

            // Agregar número de página
            const pageNumber = document.createElement('div');
            pageNumber.className = 'page-number';
            pageNumber.textContent = `Página ${index + 1}`;

            img.src = imagePath;
            imgContainer.appendChild(img);
            imgContainer.appendChild(pageNumber);
            imagesContainer.appendChild(imgContainer);
        }

        reader.appendChild(imagesContainer);

    } catch (error) {
        console.error('Error:', error);
        reader.innerHTML = `
            <div class="error-container">
                <p class="error-message">${error.message}</p>
                <button onclick="window.location.href='/'">Volver al inicio</button>
            </div>
        `;
    }
}

// Inicializar la funcionalidad de cambio de tema
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM cargado - inicializando tema');
    
    // Cargar tema guardado
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Actualizar los iconos del toggle
    updateThemeToggleIcons(savedTheme);
    
    // Manejar cambio de tema
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        console.log('Botón de tema encontrado, añadiendo evento click');
        themeToggle.addEventListener('click', toggleTheme);
    } else {
        console.log('Error: Botón de tema no encontrado');
    }
});

function toggleTheme() {
    console.log('Cambiando tema');
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeToggleIcons(newTheme);
}

function updateThemeToggleIcons(theme) {
    console.log('Actualizando iconos para tema:', theme);
    const lightIcon = document.querySelector('.theme-toggle .light-icon');
    const darkIcon = document.querySelector('.theme-toggle .dark-icon');
    
    if (!lightIcon || !darkIcon) {
        console.log('Error: No se encontraron los iconos de tema');
        return;
    }
    
    if (theme === 'dark') {
        lightIcon.classList.remove('active');
        darkIcon.classList.add('active');
    } else {
        lightIcon.classList.add('active');
        darkIcon.classList.remove('active');
    }
    console.log('Iconos actualizados');
}