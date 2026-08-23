const express = require('express');
const Track = require('../models/Track');
const Album = require('../models/Album');
const User = require('../models/User');
const Playlist = require('../models/Playlist');

const router = express.Router();

// Search all content
router.get('/all', async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const searchRegex = new RegExp(q, 'i');

    const tracks = await Track.find({
      $or: [{ title: searchRegex }, { description: searchRegex }],
      isPublic: true
    })
      .populate('artist', 'username firstName lastName avatar')
      .limit(parseInt(limit));

    const albums = await Album.find({
      $or: [{ title: searchRegex }, { description: searchRegex }],
      isPublic: true
    })
      .populate('artist', 'username firstName lastName avatar')
      .limit(parseInt(limit));

    const users = await User.find({
      $or: [{ username: searchRegex }, { firstName: searchRegex }, { lastName: searchRegex }],
      isActive: true
    })
      .select('-password -email -resetPasswordToken -resetPasswordExpiry')
      .limit(parseInt(limit));

    const playlists = await Playlist.find({
      $or: [{ title: searchRegex }, { description: searchRegex }],
      isPublic: true
    })
      .populate('owner', 'username avatar')
      .limit(parseInt(limit));

    res.json({
      query: q,
      results: {
        tracks,
        albums,
        users,
        playlists
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search tracks
router.get('/tracks', async (req, res) => {
  try {
    const { q, genre, skip = 0, limit = 20 } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const searchRegex = new RegExp(q, 'i');
    let filter = {
      $or: [{ title: searchRegex }, { description: searchRegex }],
      isPublic: true
    };

    if (genre) {
      filter.genre = genre;
    }

    const tracks = await Track.find(filter)
      .populate('artist', 'username firstName lastName avatar')
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    const total = await Track.countDocuments(filter);

    res.json({ tracks, total, query: q, skip: parseInt(skip), limit: parseInt(limit) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search albums
router.get('/albums', async (req, res) => {
  try {
    const { q, genre, skip = 0, limit = 20 } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const searchRegex = new RegExp(q, 'i');
    let filter = {
      $or: [{ title: searchRegex }, { description: searchRegex }],
      isPublic: true
    };

    if (genre) {
      filter.genre = genre;
    }

    const albums = await Album.find(filter)
      .populate('artist', 'username firstName lastName avatar')
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    const total = await Album.countDocuments(filter);

    res.json({ albums, total, query: q, skip: parseInt(skip), limit: parseInt(limit) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search artists/users
router.get('/artists', async (req, res) => {
  try {
    const { q, skip = 0, limit = 20 } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const searchRegex = new RegExp(q, 'i');
    const filter = {
      $or: [{ username: searchRegex }, { firstName: searchRegex }, { lastName: searchRegex }],
      isActive: true
    };

    const users = await User.find(filter)
      .select('-password -email -resetPasswordToken -resetPasswordExpiry')
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.json({ users, total, query: q, skip: parseInt(skip), limit: parseInt(limit) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search playlists
router.get('/playlists', async (req, res) => {
  try {
    const { q, skip = 0, limit = 20 } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const searchRegex = new RegExp(q, 'i');
    const filter = {
      $or: [{ title: searchRegex }, { description: searchRegex }],
      isPublic: true
    };

    const playlists = await Playlist.find(filter)
      .populate('owner', 'username avatar firstName lastName')
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    const total = await Playlist.countDocuments(filter);

    res.json({ playlists, total, query: q, skip: parseInt(skip), limit: parseInt(limit) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get trending
router.get('/trending', async (req, res) => {
  try {
    const trendingTracks = await Track.find({ isPublic: true })
      .populate('artist', 'username firstName lastName avatar')
      .sort({ views: -1, likes: -1 })
      .limit(20);

    res.json(trendingTracks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
