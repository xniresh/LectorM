document.addEventListener('DOMContentLoaded', () => {
    // Estado global para la paginación
    window.paginationState = {
        currentPage: 1,
        itemsPerPage: 20,
        totalItems: 0,
        totalPages: 0
    };

    fetchMangaList();
    fetchPopularMangas();
    // Desactivamos la función de manga aleatorio
    // fetchRandomManga();
    fetchUserInfo();
    
    const searchInput = document.querySelector('.search-bar input');
    searchInput.addEventListener('input', debounce(handleSearch, 300));
    
    // Manejar clic en Home
    const homeLink = document.getElementById('home-link');
    homeLink.addEventListener('click', () => {
        showDefaultView();
        fetchMangaList();
    });
    
    // Manejar clic en Mi Biblioteca
    const bibliotecaLink = document.getElementById('biblioteca-link');
    bibliotecaLink.addEventListener('click', () => {
        // Resaltar el enlace activo
        document.querySelectorAll('.categories li').forEach(li => {
            li.classList.remove('active');
        });
        bibliotecaLink.classList.add('active');
        
        // Ocultar sección de proyectos y mostrar todos los mangas
        document.querySelector('.projects').style.display = 'none';
        document.querySelector('.popular-books').style.display = 'block';
        document.querySelector('.popular-books h2').textContent = 'Mi Biblioteca';
        
        // Aplicar vista completa
        const popularBooks = document.querySelector('.popular-books');
        popularBooks.classList.add('full-view');
        
        // Cargar todos los mangas
        fetchMangaList();
    });
    
    // Mostrar vista por defecto
    showDefaultView();

    // Configuración del usuario
    setupUserMenu();
    
    // Cargar tema guardado
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeToggleIcons(savedTheme);
    
    // Manejar cambio de tema - Usar el nuevo ID 'theme-toggle'
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Inicializar el menú colapsable
    initCollapsibleMenu();
});

function showDefaultView() {
    // Mostrar proyectos y mangas populares
    document.querySelector('.projects').style.display = 'block';
    document.querySelector('.popular-books').style.display = 'block';
    document.querySelector('.popular-books h2').textContent = 'Mangas populares';
    
    // Quitar resaltado de enlaces
    document.querySelectorAll('.categories li').forEach(li => {
        li.classList.remove('active');
    });
    
    // Quitar vista completa
    const popularBooks = document.querySelector('.popular-books');
    popularBooks.classList.remove('full-view');
}

async function fetchPopularMangas() {
    try {
        const response = await fetch('/api/mangas/popular/list');
        const popularMangas = await response.json();
        updatePopularMangasList(popularMangas);
    } catch (error) {
        console.error('Error al cargar mangas populares:', error);
    }
}

async function fetchMangaList() {
    try {
        const response = await fetch('/api/mangas/list');
        const mangas = await response.json();
        window.allMangas = mangas; // Guardar todos los mangas
        window.paginationState.totalItems = mangas.length;
        window.paginationState.totalPages = Math.ceil(mangas.length / window.paginationState.itemsPerPage);
        updateMangaList(mangas);
        updateMangaCount(mangas.length);
    } catch (error) {
        console.error('Error al cargar mangas:', error);
    }
}

async function fetchRandomManga() {
    try {
        const response = await fetch('/api/mangas/random');
        const manga = await response.json();
        updateRandomManga(manga);
    } catch (error) {
        console.error('Error al cargar manga aleatorio:', error);
    }
}

function updatePopularMangasList(mangas) {
    const popularSection = document.querySelector('.popular-section .book-list');
    if (!popularSection) return;

    popularSection.innerHTML = '';
    mangas.forEach(manga => {
        const mangaCard = createMangaCard(manga);
        popularSection.appendChild(mangaCard);
    });
}

function updateMangaList(mangas) {
    const { currentPage, itemsPerPage } = window.paginationState;
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const mangasToShow = mangas.slice(start, end);
    
    const bookList = document.querySelector('.book-list');
    const oldItems = bookList.children;
    
    // Remover items con animación
    Array.from(oldItems).forEach(item => {
        item.classList.add('fade-exit');
        setTimeout(() => item.remove(), 300);
    });

    // Crear nuevos items con animación
    setTimeout(() => {
        bookList.innerHTML = mangasToShow.map(manga => {
            // Determinar la imagen de portada
            const coverImage = manga.coverImage || manga.firstPage || '/images/default-cover.jpg';
            
            return `
            <div class="manga-card fade-enter">
                <div class="manga-cover" onclick="window.location.href='/manga/${manga._id}'">
                    <img src="${coverImage}" alt="${manga.title}" onerror="this.src='/images/default-cover.jpg'">
                </div>
                <div class="manga-info">
                    <h3 onclick="window.location.href='/manga/${manga._id}'">${manga.title}</h3>
                    <p>${manga.pageCount || manga.pages || 1} páginas</p>
                    <div class="manga-actions">
                        <button class="info-button" onclick="event.stopPropagation(); window.location.href='/manga/${manga._id}'">Info</button>
                        <button class="read-button" onclick="event.stopPropagation(); window.location.href='/read/${manga._id}'">Leer</button>
                    </div>
                </div>
            </div>
        `}).join('');

        // Agregar animación de entrada
        setTimeout(() => {
            document.querySelectorAll('.manga-card').forEach(card => {
                card.classList.remove('fade-enter');
            });
        }, 50);

        updatePagination();
    }, 300);
}

function updateRandomManga(manga) {
    if (!manga) {
        console.log("No se encontró ningún manga para mostrar");
        return;
    }
    
    const randomMangaSection = document.querySelector('.random-manga-section');
    if (!randomMangaSection) return;

    randomMangaSection.innerHTML = '';
    
    const coverImage = manga.coverImage || manga.firstPage || '/images/default-cover.jpg';
    
    const mangaCard = document.createElement('div');
    mangaCard.classList.add('manga-card');
    
    const mangaCover = document.createElement('div');
    mangaCover.classList.add('manga-cover');
    mangaCover.onclick = () => window.location.href = `/manga/${manga._id}`;
    
    const mangaImage = document.createElement('img');
    mangaImage.src = coverImage;
    mangaImage.alt = manga.title || 'Manga sin título';
    mangaImage.onerror = () => mangaImage.src = '/images/default-cover.jpg';
    
    mangaCover.appendChild(mangaImage);
    
    const mangaInfo = document.createElement('div');
    mangaInfo.classList.add('manga-info');
    
    const mangaTitle = document.createElement('h3');
    mangaTitle.textContent = manga.title || 'Manga sin título';
    mangaTitle.onclick = () => window.location.href = `/manga/${manga._id}`;
    
    const mangaArtist = document.createElement('p');
    mangaArtist.textContent = manga.artist || 'Artista desconocido';
    
    const mangaActions = document.createElement('div');
    mangaActions.classList.add('manga-actions');
    
    const readButton = document.createElement('button');
    readButton.classList.add('read-button');
    readButton.textContent = 'Leer';
    readButton.onclick = (event) => {
        event.stopPropagation();
        window.location.href = `/read/${manga._id}`;
    };
    
    mangaActions.appendChild(readButton);
    
    mangaInfo.appendChild(mangaTitle);
    mangaInfo.appendChild(mangaArtist);
    mangaInfo.appendChild(mangaActions);
    
    mangaCard.appendChild(mangaCover);
    mangaCard.appendChild(mangaInfo);
    
    randomMangaSection.appendChild(mangaCard);
    
    // Actualizar el título del proyecto
    const projectTitle = document.querySelector('#random-manga h3');
    if (projectTitle) {
        projectTitle.textContent = 'Manga Recomendado';
    }
    
    // Actualizar la descripción
    const projectDesc = document.querySelector('#random-manga p');
    if (projectDesc) {
        projectDesc.textContent = 'Actualizado al refrescar';
    }
}

function updatePagination() {
    const { currentPage, totalPages, totalItems, itemsPerPage } = window.paginationState;
    const start = (currentPage - 1) * itemsPerPage + 1;
    const end = Math.min(currentPage * itemsPerPage, totalItems);
    
    const paginationHTML = `
        <div class="pagination">
            <button onclick="changePage(1)" ${currentPage === 1 ? 'disabled' : ''}>
                <span class="material-icons">first_page</span>
            </button>
            <button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
                <span class="material-icons">chevron_left</span>
            </button>
            <span class="page-info">
                ${start}-${end} de ${totalItems} mangas
            </span>
            <button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
                <span class="material-icons">chevron_right</span>
            </button>
            <button onclick="changePage(${totalPages})" ${currentPage === totalPages ? 'disabled' : ''}>
                <span class="material-icons">last_page</span>
            </button>
        </div>
    `;
    
    // Agregar paginación después de la lista de mangas
    const bookList = document.querySelector('.book-list');
    let paginationDiv = document.querySelector('.pagination');
    if (!paginationDiv) {
        paginationDiv = document.createElement('div');
        bookList.parentNode.insertBefore(paginationDiv, bookList.nextSibling);
    }
    paginationDiv.outerHTML = paginationHTML;
}

function changePage(newPage) {
    window.paginationState.currentPage = newPage;
    updateMangaList(window.allMangas);
    
    // Desplazarse al inicio de la página
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function updateMangaCount(count) {
    const countElement = document.getElementById('manga-count-number');
    if (countElement) {
        countElement.textContent = count;
    }
    
    // Actualizar también el contador en la barra lateral
    const sidebarCountElement = document.getElementById('sidebar-manga-count');
    if (sidebarCountElement) {
        sidebarCountElement.textContent = `${count} mangas`;
    }
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

async function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    if (searchTerm.length < 2) {
        window.paginationState.currentPage = 1;
        fetchMangaList();
        return;
    }
    
    try {
        // Hacer la búsqueda en el servidor
        const response = await fetch(`/api/mangas/list?search=${encodeURIComponent(searchTerm)}`);
        const mangas = await response.json();
        
        window.paginationState.currentPage = 1;
        window.paginationState.totalItems = mangas.length;
        window.paginationState.totalPages = Math.ceil(mangas.length / window.paginationState.itemsPerPage);
        updateMangaList(mangas);
    } catch (error) {
        console.error('Error en la búsqueda:', error);
    }
}

function handleAddProject() {
    // Implementar lógica para añadir nuevo proyecto
    console.log('Añadir nuevo proyecto');
}

async function downloadManga(mangaId) {
    try {
        const response = await fetch(`/api/mangas/${mangaId}/download`);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `manga-${mangaId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    } catch (error) {
        console.error('Error al descargar:', error);
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeToggleIcons(newTheme);
}

function updateThemeToggleIcons(theme) {
    const lightIcon = document.querySelector('.light-icon');
    const darkIcon = document.querySelector('.dark-icon');
    
    if (!lightIcon || !darkIcon) return;
    
    if (theme === 'dark') {
        lightIcon.classList.remove('active');
        darkIcon.classList.add('active');
    } else {
        lightIcon.classList.add('active');
        darkIcon.classList.remove('active');
    }
}

function createMangaCard(manga) {
    const coverImage = manga.coverImage || manga.firstPage || '/images/default-cover.jpg';
    
    const mangaCard = document.createElement('div');
    mangaCard.classList.add('manga-card');
    
    const mangaCover = document.createElement('div');
    mangaCover.classList.add('manga-cover');
    mangaCover.onclick = () => window.location.href = `/manga/${manga._id}`;
    
    const mangaImage = document.createElement('img');
    mangaImage.src = coverImage;
    mangaImage.alt = manga.title;
    mangaImage.onerror = () => mangaImage.src = '/images/default-cover.jpg';
    
    mangaCover.appendChild(mangaImage);
    
    const mangaInfo = document.createElement('div');
    mangaInfo.classList.add('manga-info');
    
    const mangaTitle = document.createElement('h3');
    mangaTitle.textContent = manga.title;
    mangaTitle.onclick = () => window.location.href = `/manga/${manga._id}`;
    
    const mangaPages = document.createElement('p');
    mangaPages.textContent = `${manga.pageCount || manga.pages || 1} páginas`;
    
    const mangaActions = document.createElement('div');
    mangaActions.classList.add('manga-actions');
    
    const infoButton = document.createElement('button');
    infoButton.classList.add('info-button');
    infoButton.textContent = 'Info';
    infoButton.onclick = (event) => {
        event.stopPropagation();
        window.location.href = `/manga/${manga._id}`;
    };
    
    const readButton = document.createElement('button');
    readButton.classList.add('read-button');
    readButton.textContent = 'Leer';
    readButton.onclick = (event) => {
        event.stopPropagation();
        window.location.href = `/read/${manga._id}`;
    };
    
    mangaActions.appendChild(infoButton);
    mangaActions.appendChild(readButton);
    
    mangaInfo.appendChild(mangaTitle);
    mangaInfo.appendChild(mangaPages);
    mangaInfo.appendChild(mangaActions);
    
    mangaCard.appendChild(mangaCover);
    mangaCard.appendChild(mangaInfo);
    
    return mangaCard;
}

// Funcionalidad para el menú de usuario
function setupUserMenu() {
    const userAvatar = document.getElementById('user-avatar');
    const userDropdown = document.getElementById('user-dropdown');
    const logoutButton = document.getElementById('logout-button');
    
    if (userAvatar && userDropdown) {
        userAvatar.addEventListener('click', () => {
            userDropdown.classList.toggle('active');
        });
        
        // Cerrar el dropdown al hacer clic fuera de él
        document.addEventListener('click', (event) => {
            if (!userAvatar.contains(event.target) && !userDropdown.contains(event.target)) {
                userDropdown.classList.remove('active');
            }
        });
    }
    
    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }
}

// Obtener información del usuario
async function fetchUserInfo() {
    try {
        const response = await fetch('/api/auth/check');
        const data = await response.json();
        
        if (response.ok && data.isAuthenticated) {
            updateUserInfo(data.user);
            setupUserMenu();
        } else {
            // Redirigir a login si no está autenticado
            window.location.href = '/login';
        }
    } catch (error) {
        console.error('Error al obtener información del usuario:', error);
    }
}

// Actualizar la información del usuario en la UI
function updateUserInfo(user) {
    const usernameDisplay = document.getElementById('username-display');
    const emailDisplay = document.getElementById('email-display');
    const sidebarUsername = document.getElementById('sidebar-username');
    
    if (usernameDisplay) {
        usernameDisplay.textContent = user.username;
    }
    
    if (emailDisplay) {
        emailDisplay.textContent = user.email;
    }
    
    // Actualizar nombre de usuario en la barra lateral
    if (sidebarUsername) {
        sidebarUsername.textContent = user.username;
    }
}

// Cerrar sesión
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

// Función para inicializar el menú colapsable
function initCollapsibleMenu() {
    const collapseButton = document.getElementById('collapse-menu');
    const sidebar = document.getElementById('sidebar');
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    
    // Detectar si es un dispositivo móvil o tableta
    const isMobile = window.matchMedia('(max-width: 1024px)').matches;
    
    if (collapseButton && sidebar) {
        // Diferente comportamiento para móviles y escritorio
        if (isMobile) {
            // En móviles, el menú se expande hacia abajo
            collapseButton.addEventListener('click', () => {
                sidebar.classList.toggle('expanded');
                localStorage.setItem('menuExpanded', sidebar.classList.contains('expanded'));
            });
            
            if (mobileMenuToggle) {
                mobileMenuToggle.addEventListener('click', () => {
                    sidebar.classList.toggle('expanded');
                    localStorage.setItem('menuExpanded', sidebar.classList.contains('expanded'));
                });
            }
            
            // Comprobar si hay un estado guardado para móvil
            const menuState = localStorage.getItem('menuExpanded');
            if (menuState === 'true') {
                sidebar.classList.add('expanded');
            }
        } else {
            // En escritorio, el menú se colapsa horizontalmente
            collapseButton.addEventListener('click', () => {
                sidebar.classList.toggle('collapsed');
                localStorage.setItem('menuCollapsed', sidebar.classList.contains('collapsed'));
            });
            
            // Comprobar si hay un estado guardado para escritorio
            const menuState = localStorage.getItem('menuCollapsed');
            if (menuState === 'true') {
                sidebar.classList.add('collapsed');
            }
        }
    }
    
    // Monitorear cambios en el tamaño de ventana
    window.addEventListener('resize', debounce(() => {
        const newIsMobile = window.matchMedia('(max-width: 1024px)').matches;
        
        // Si cambió entre móvil y escritorio, recargar para aplicar los estilos adecuados
        if (newIsMobile !== isMobile) {
            window.location.reload();
        }
    }, 250));
}