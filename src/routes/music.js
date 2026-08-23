const express = require('express');
const Track = require('../models/Track');
const Album = require('../models/Album');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all tracks
router.get('/tracks', async (req, res) => {
  try {
    const { genre, skip = 0, limit = 20, sort = '-createdAt' } = req.query;

    let filter = { isPublic: true };
    if (genre) filter.genre = genre;

    const tracks = await Track.find(filter)
      .populate('artist', 'username firstName lastName avatar')
      .sort(sort)
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    const total = await Track.countDocuments(filter);

    res.json({ tracks, total, skip: parseInt(skip), limit: parseInt(limit) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get track by ID
router.get('/tracks/:id', async (req, res) => {
  try {
    const track = await Track.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('artist', 'username firstName lastName avatar');

    if (!track) {
      return res.status(404).json({ error: 'Track not found' });
    }

    res.json(track);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload new track (authenticated)
router.post('/tracks', authenticateToken, async (req, res) => {
  try {
    const { title, audioUrl, genre, duration, description, coverImage } = req.body;

    const track = new Track({
      title,
      artist: req.user.id,
      audioUrl,
      genre,
      duration,
      description,
      coverImage
    });

    await track.save();
    await track.populate('artist', 'username firstName lastName avatar');

    res.status(201).json({ message: 'Track uploaded successfully', track });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Like track
router.post('/tracks/:id/like', authenticateToken, async (req, res) => {
  try {
    const track = await Track.findById(req.params.id);
    if (!track) {
      return res.status(404).json({ error: 'Track not found' });
    }

    await track.like(req.user.id);
    res.json({ message: 'Track liked', likes: track.likes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Unlike track
router.post('/tracks/:id/unlike', authenticateToken, async (req, res) => {
  try {
    const track = await Track.findById(req.params.id);
    if (!track) {
      return res.status(404).json({ error: 'Track not found' });
    }

    await track.unlike(req.user.id);
    res.json({ message: 'Track unliked', likes: track.likes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all albums
router.get('/albums', async (req, res) => {
  try {
    const { genre, skip = 0, limit = 20, sort = '-releaseDate' } = req.query;

    let filter = { isPublic: true };
    if (genre) filter.genre = genre;

    const albums = await Album.find(filter)
      .populate('artist', 'username firstName lastName avatar')
      .sort(sort)
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    const total = await Album.countDocuments(filter);

    res.json({ albums, total, skip: parseInt(skip), limit: parseInt(limit) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get album by ID
router.get('/albums/:id', async (req, res) => {
  try {
    const album = await Album.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate('artist', 'username firstName lastName avatar')
      .populate('tracks');

    if (!album) {
      return res.status(404).json({ error: 'Album not found' });
    }

    res.json(album);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create album (authenticated)
router.post('/albums', authenticateToken, async (req, res) => {
  try {
    const { title, coverImage, description, releaseDate, genre } = req.body;

    const album = new Album({
      title,
      artist: req.user.id,
      coverImage,
      description,
      releaseDate,
      genre
    });

    await album.save();
    await album.populate('artist', 'username firstName lastName avatar');

    res.status(201).json({ message: 'Album created successfully', album });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get top tracks
router.get('/top-tracks', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const tracks = await Track.find({ isPublic: true })
      .populate('artist', 'username firstName lastName avatar')
      .sort({ likes: -1, views: -1 })
      .limit(parseInt(limit));

    res.json(tracks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
