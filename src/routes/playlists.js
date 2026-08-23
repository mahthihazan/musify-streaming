const express = require('express');
const Playlist = require('../models/Playlist');
const Track = require('../models/Track');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all playlists
router.get('/', async (req, res) => {
  try {
    const { skip = 0, limit = 20, sort = '-createdAt' } = req.query;

    const playlists = await Playlist.find({ isPublic: true })
      .populate('owner', 'username firstName lastName avatar')
      .populate('tracks')
      .sort(sort)
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    const total = await Playlist.countDocuments({ isPublic: true });

    res.json({ playlists, total, skip: parseInt(skip), limit: parseInt(limit) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's playlists (authenticated)
router.get('/user/me', authenticateToken, async (req, res) => {
  try {
    const playlists = await Playlist.find({ owner: req.user.id })
      .populate('owner', 'username firstName lastName avatar')
      .populate('tracks');

    res.json(playlists);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get playlist by ID
router.get('/:id', async (req, res) => {
  try {
    const playlist = await Playlist.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate('owner', 'username firstName lastName avatar')
      .populate('tracks')
      .populate('followers', 'username avatar');

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    res.json(playlist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create playlist (authenticated)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, isPublic, isCollaborative } = req.body;

    const playlist = new Playlist({
      title,
      description,
      owner: req.user.id,
      isPublic: isPublic !== undefined ? isPublic : true,
      isCollaborative: isCollaborative || false
    });

    await playlist.save();
    await playlist.populate('owner', 'username firstName lastName avatar');

    res.status(201).json({ message: 'Playlist created successfully', playlist });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add track to playlist (authenticated)
router.post('/:id/tracks/:trackId', authenticateToken, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    // Check if user is owner or collaborator
    if (playlist.owner.toString() !== req.user.id && !playlist.collaborators.includes(req.user.id)) {
      return res.status(403).json({ error: 'Unauthorized to modify this playlist' });
    }

    const track = await Track.findById(req.params.trackId);
    if (!track) {
      return res.status(404).json({ error: 'Track not found' });
    }

    if (!playlist.tracks.includes(req.params.trackId)) {
      playlist.tracks.push(req.params.trackId);
      playlist.totalTracks = playlist.tracks.length;
      await playlist.save();
    }

    res.json({ message: 'Track added to playlist', playlist });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove track from playlist (authenticated)
router.delete('/:id/tracks/:trackId', authenticateToken, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    // Check if user is owner or collaborator
    if (playlist.owner.toString() !== req.user.id && !playlist.collaborators.includes(req.user.id)) {
      return res.status(403).json({ error: 'Unauthorized to modify this playlist' });
    }

    playlist.tracks = playlist.tracks.filter(trackId => trackId.toString() !== req.params.trackId);
    playlist.totalTracks = playlist.tracks.length;
    await playlist.save();

    res.json({ message: 'Track removed from playlist', playlist });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Like playlist (authenticated)
router.post('/:id/like', authenticateToken, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    if (!playlist.likedBy.includes(req.user.id)) {
      playlist.likedBy.push(req.user.id);
      playlist.likes += 1;
      await playlist.save();
    }

    res.json({ message: 'Playlist liked', likes: playlist.likes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Unlike playlist (authenticated)
router.post('/:id/unlike', authenticateToken, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    const index = playlist.likedBy.indexOf(req.user.id);
    if (index !== -1) {
      playlist.likedBy.splice(index, 1);
      playlist.likes = Math.max(0, playlist.likes - 1);
      await playlist.save();
    }

    res.json({ message: 'Playlist unliked', likes: playlist.likes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Follow playlist (authenticated)
router.post('/:id/follow', authenticateToken, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    if (!playlist.followers.includes(req.user.id)) {
      playlist.followers.push(req.user.id);
      await playlist.save();
    }

    res.json({ message: 'Playlist followed', followers: playlist.followers.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update playlist (authenticated)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    if (playlist.owner.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to modify this playlist' });
    }

    const { title, description, isPublic, coverImage } = req.body;
    if (title) playlist.title = title;
    if (description) playlist.description = description;
    if (isPublic !== undefined) playlist.isPublic = isPublic;
    if (coverImage) playlist.coverImage = coverImage;

    await playlist.save();

    res.json({ message: 'Playlist updated successfully', playlist });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete playlist (authenticated)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    if (playlist.owner.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to delete this playlist' });
    }

    await Playlist.findByIdAndDelete(req.params.id);

    res.json({ message: 'Playlist deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
