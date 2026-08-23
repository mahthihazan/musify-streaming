const express = require('express');
const User = require('../models/User');
const Track = require('../models/Track');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get user profile by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('followers', 'username avatar')
      .populate('following', 'username avatar')
      .populate('likedTracks')
      .populate('playlists');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user.getProfile());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user profile (authenticated)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.params.id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to update this profile' });
    }

    const { firstName, lastName, bio, avatar } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (bio) user.bio = bio;
    if (avatar) user.avatar = avatar;

    await user.save();

    res.json({ message: 'Profile updated successfully', user: user.getProfile() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's tracks
router.get('/:id/tracks', async (req, res) => {
  try {
    const { skip = 0, limit = 20 } = req.query;

    const tracks = await Track.find({ artist: req.params.id, isPublic: true })
      .populate('artist', 'username firstName lastName avatar')
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    const total = await Track.countDocuments({ artist: req.params.id, isPublic: true });

    res.json({ tracks, total, skip: parseInt(skip), limit: parseInt(limit) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Follow user (authenticated)
router.post('/:id/follow', authenticateToken, async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!userToFollow || !currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!currentUser.following.includes(req.params.id)) {
      currentUser.following.push(req.params.id);
      userToFollow.followers.push(req.user.id);

      await currentUser.save();
      await userToFollow.save();
    }

    res.json({ 
      message: 'User followed successfully',
      followersCount: userToFollow.followers.length 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Unfollow user (authenticated)
router.post('/:id/unfollow', authenticateToken, async (req, res) => {
  try {
    const userToUnfollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!userToUnfollow || !currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const followingIndex = currentUser.following.indexOf(req.params.id);
    const followersIndex = userToUnfollow.followers.indexOf(req.user.id);

    if (followingIndex !== -1) {
      currentUser.following.splice(followingIndex, 1);
    }

    if (followersIndex !== -1) {
      userToUnfollow.followers.splice(followersIndex, 1);
    }

    await currentUser.save();
    await userToUnfollow.save();

    res.json({ 
      message: 'User unfollowed successfully',
      followersCount: userToUnfollow.followers.length 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's followers
router.get('/:id/followers', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('followers', 'username avatar firstName lastName');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user.followers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's following
router.get('/:id/following', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('following', 'username avatar firstName lastName');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user.following);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get liked tracks (authenticated)
router.get('/me/liked-tracks', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('likedTracks');

    res.json(user.likedTracks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add track to liked (authenticated)
router.post('/me/liked-tracks/:trackId', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const track = await Track.findById(req.params.trackId);

    if (!track) {
      return res.status(404).json({ error: 'Track not found' });
    }

    if (!user.likedTracks.includes(req.params.trackId)) {
      user.likedTracks.push(req.params.trackId);
      await user.save();
    }

    res.json({ message: 'Track added to liked tracks', likedTracks: user.likedTracks.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove track from liked (authenticated)
router.delete('/me/liked-tracks/:trackId', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    const index = user.likedTracks.indexOf(req.params.trackId);
    if (index !== -1) {
      user.likedTracks.splice(index, 1);
      await user.save();
    }

    res.json({ message: 'Track removed from liked tracks', likedTracks: user.likedTracks.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
