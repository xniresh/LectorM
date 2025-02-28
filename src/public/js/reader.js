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

        // Crear un contenedor para todas las imágenes
        const imagesContainer = document.createElement('div');
        imagesContainer.className = 'images-container';

        // Cargar cada imagen
        for (const [index, imagePath] of data.images.entries()) {
            console.log('Cargando imagen:', imagePath); // Debug log
            const imgContainer = document.createElement('div');
            imgContainer.className = 'image-container';

            const img = document.createElement('img');
            img.className = 'manga-image';
            img.loading = 'lazy';
            img.dataset.page = index + 1;

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

        // Agregar controles de navegación
        const nav = document.createElement('div');
        nav.className = 'reader-nav';
        nav.innerHTML = `
            <button class="nav-button prev" onclick="scrollToPreviousImage()">
                <span class="material-icons">arrow_upward</span>
            </button>
            <button class="nav-button next" onclick="scrollToNextImage()">
                <span class="material-icons">arrow_downward</span>
            </button>
        `;
        document.body.appendChild(nav);

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

// Funciones de navegación
function scrollToPreviousImage() {
    const images = document.querySelectorAll('.image-container');
    for (let i = images.length - 1; i >= 0; i--) {
        const img = images[i];
        const rect = img.getBoundingClientRect();
        if (rect.top < 0) {
            img.scrollIntoView({ behavior: 'smooth' });
            break;
        }
    }
}

function scrollToNextImage() {
    const images = document.querySelectorAll('.image-container');
    for (const img of images) {
        const rect = img.getBoundingClientRect();
        if (rect.top > 0) {
            img.scrollIntoView({ behavior: 'smooth' });
            break;
        }
    }
}

// Funciones de navegación
function scrollToPreviousImage() {
    const images = document.querySelectorAll('.image-container');
    for (let i = images.length - 1; i >= 0; i--) {
        const img = images[i];
        const rect = img.getBoundingClientRect();
        if (rect.top < 0) {
            img.scrollIntoView({ behavior: 'smooth' });
            break;
        }
    }
}

function scrollToNextImage() {
    const images = document.querySelectorAll('.image-container');
    for (const img of images) {
        const rect = img.getBoundingClientRect();
        if (rect.top > 0) {
            img.scrollIntoView({ behavior: 'smooth' });
            break;
        }
    }
}