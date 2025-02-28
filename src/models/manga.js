const mongoose = require('mongoose');

const mangaSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    coverImage: {
        type: String,
        required: true
    },
    artist: {
        type: String,
        required: true
    },
    uploadedBy: {
        type: String,
        required: true
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
    chapters: [{
        number: Number,
        title: String,
        path: String,
        uploadDate: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    views: {
        type: Number,
        default: 0
    },
    lastViewed: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Manga', mangaSchema);
