const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;
const Manga = require('../models/Manga');

// Obtener mangas populares
router.get('/popular/list', async (req, res) => {
    try {
        const popularMangas = await Manga.find()
            .sort({ views: -1 })
            .limit(10);
        res.json(popularMangas);
    } catch (error) {
        console.error('Error al obtener mangas populares:', error);
        res.status(500).json({ error: 'Error al cargar mangas populares' });
    }
});

// Incrementar vistas de un manga
router.post('/:mangaId/view', async (req, res) => {
    try {
        const now = new Date();
        const manga = await Manga.findByIdAndUpdate(
            req.params.mangaId,
            { 
                $inc: { views: 1 },
                lastViewed: now
            },
            { new: true }
        );
        if (!manga) {
            return res.status(404).json({ error: 'Manga no encontrado' });
        }
        
        // Registrar en consola para debugging
        console.log(`Manga visualizado: ${manga.title}, ID: ${manga._id}, Vistas: ${manga.views}, Última vista: ${now}`);
        
        res.json(manga);
    } catch (error) {
        console.error('Error al actualizar vistas:', error);
        res.status(500).json({ error: 'Error al actualizar vistas' });
    }
});

// Obtener lista de mangas
router.get('/list', async (req, res) => {
    try {
        const searchTerm = req.query.search;
        let query = { status: 'activo' };
        
        if (searchTerm) {
            query.title = { 
                $regex: searchTerm, 
                $options: 'i' 
            };
        }
        
        const mangas = await Manga.find(query).sort({ title: 1 });
        res.json(mangas);
    } catch (error) {
        console.error('Error al leer mangas:', error);
        res.status(500).json({ error: 'Error al cargar los mangas' });
    }
});

// Obtener manga específico con todos sus detalles
router.get('/:mangaId', async (req, res) => {
    try {
        const manga = await Manga.findById(req.params.mangaId);
        if (!manga) {
            return res.status(404).json({ error: 'Manga no encontrado' });
        }
        res.json(manga);
    } catch (error) {
        console.error('Error al obtener manga:', error);
        res.status(500).json({ error: 'Error al cargar el manga' });
    }
});

// Obtener imágenes de un manga específico
router.get('/:mangaId/images', async (req, res) => {
    try {
        // Primero verificar si el manga existe
        const manga = await Manga.findById(req.params.mangaId);
        if (!manga) {
            return res.status(404).json({ error: 'Manga no encontrado' });
        }

        const mangaPath = path.join(process.cwd(), 'Manga', manga.id);
        
        // Verificar si el directorio existe
        try {
            await fs.access(mangaPath);
        } catch (err) {
            return res.status(404).json({ error: 'Directorio del manga no encontrado' });
        }

        const files = await fs.readdir(mangaPath);
        const images = files
            .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
            .sort((a, b) => {
                // Ordenar numéricamente si los nombres son números
                const numA = parseInt(a.split('.')[0]);
                const numB = parseInt(b.split('.')[0]);
                if (!isNaN(numA) && !isNaN(numB)) {
                    return numA - numB;
                }
                return a.localeCompare(b);
            })
            .map(file => `/manga/${manga.id}/${file}`);

        if (images.length === 0) {
            return res.status(404).json({ error: 'No se encontraron imágenes en este manga' });
        }

        console.log('Imágenes encontradas:', images); // Log para debug
        res.json({ images }); // Enviar como objeto
    } catch (error) {
        console.error('Error al leer imágenes:', error);
        res.status(500).json({ error: 'Error al cargar las imágenes' });
    }
});

// Actualizar información del manga
router.put('/:mangaId', async (req, res) => {
    try {
        const manga = await Manga.findByIdAndUpdate(
            req.params.mangaId,
            {
                $set: {
                    title: req.body.title,
                    description: req.body.description,
                    artist: req.body.artist,
                    genres: req.body.genres,
                    tags: req.body.tags,
                    language: req.body.language,
                    uploadedBy: req.body.uploadedBy,
                    updatedAt: Date.now()
                }
            },
            { new: true }
        );
        res.json(manga);
    } catch (error) {
        console.error('Error al actualizar manga:', error);
        res.status(500).json({ error: 'Error al actualizar el manga' });
    }
});

// Obtener todos los géneros únicos
router.get('/metadata/genres', async (req, res) => {
    try {
        const genres = await Manga.distinct('genres');
        res.json(genres);
    } catch (error) {
        console.error('Error al obtener géneros:', error);
        res.status(500).json({ error: 'Error al cargar los géneros' });
    }
});

// Obtener todos los tags únicos
router.get('/metadata/tags', async (req, res) => {
    try {
        const tags = await Manga.distinct('tags');
        res.json(tags);
    } catch (error) {
        console.error('Error al obtener tags:', error);
        res.status(500).json({ error: 'Error al cargar los tags' });
    }
});

// Obtener todos los artistas únicos
router.get('/metadata/artists', async (req, res) => {
    try {
        const artists = await Manga.distinct('artist');
        res.json(artists);
    } catch (error) {
        console.error('Error al obtener artistas:', error);
        res.status(500).json({ error: 'Error al cargar los artistas' });
    }
});

// Obtener un manga aleatorio
router.get('/random', async (req, res) => {
    try {
        const count = await Manga.countDocuments();
        if (count === 0) {
            return res.json(null);
        }
        
        const random = Math.floor(Math.random() * count);
        const randomManga = await Manga.findOne().skip(random);
        
        res.json(randomManga);
    } catch (error) {
        console.error('Error al obtener manga aleatorio:', error);
        res.status(500).json({ error: 'Error al cargar manga aleatorio' });
    }
});

module.exports = router; 