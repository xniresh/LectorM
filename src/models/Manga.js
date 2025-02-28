const mongoose = require('mongoose');

const mangaSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true
    },
    coverImage: {
        type: String,
        required: true
    },
    firstPage: {
        type: String,
        required: true
    },
    pageCount: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    artist: {
        type: String,
        default: 'Desconocido'
    },
    genres: [{
        type: String
    }],
    tags: [{
        type: String
    }],
    language: {
        type: String,
        default: 'Español'
    },
    status: {
        type: String,
        enum: ['activo', 'inactivo'],
        default: 'activo'
    },
    uploadedBy: {
        type: String,
        default: 'Anónimo'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Manga', mangaSchema); 