const fs = require('fs').promises;
const path = require('path');
const Manga = require('../models/Manga');

async function initializeDatabase() {
    try {
        const mangaPath = path.join(process.cwd(), 'Manga');
        const localMangas = await fs.readdir(mangaPath);
        
        // Obtener todos los mangas de la base de datos
        const dbMangas = await Manga.find();
        
        // Marcar mangas inactivos que ya no existen localmente
        for (const dbManga of dbMangas) {
            if (!localMangas.includes(dbManga.id)) {
                await Manga.findByIdAndUpdate(dbManga._id, { status: 'inactivo' });
                console.log(`Manga marcado como inactivo: ${dbManga.title}`);
            }
        }
        
        // Procesar mangas locales
        const mangaPromises = localMangas.map(async (manga) => {
            const mangaDir = path.join(mangaPath, manga);
            const stats = await fs.stat(mangaDir);
            
            if (stats.isDirectory()) {
                const files = await fs.readdir(mangaDir);
                const images = files.filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file)).sort();
                
                // Verificar si el manga ya existe en la base de datos
                const existingManga = await Manga.findOne({ id: manga });
                
                if (existingManga) {
                    // Actualizar manga existente
                    await Manga.findByIdAndUpdate(existingManga._id, {
                        title: manga.replace(/-/g, ' '),
                        coverImage: `/manga/${manga}/${images[0]}`,
                        firstPage: `/manga/${manga}/${images[0]}`,
                        pageCount: images.length,
                        status: 'activo',
                        updatedAt: new Date()
                    });
                    return null;
                } else {
                    // Crear nuevo manga
                    return new Manga({
                        id: manga,
                        title: manga.replace(/-/g, ' '),
                        coverImage: `/manga/${manga}/${images[0]}`,
                        firstPage: `/manga/${manga}/${images[0]}`,
                        pageCount: images.length,
                        status: 'activo',
                        createdAt: new Date(),
                        updatedAt: new Date()
                    });
                }
            }
        });

        // Filtrar valores nulos y guardar nuevos mangas
        const newMangaDocuments = (await Promise.all(mangaPromises)).filter(Boolean);
        if (newMangaDocuments.length > 0) {
            await Manga.insertMany(newMangaDocuments);
            console.log(`${newMangaDocuments.length} nuevos mangas agregados`);
        }
        
        // Contar mangas activos
        const activeCount = await Manga.countDocuments({ status: 'activo' });
        console.log(`Total de mangas activos: ${activeCount}`);
        
    } catch (error) {
        console.error('Error inicializando la base de datos:', error);
    }
}

module.exports = { initializeDatabase }; 