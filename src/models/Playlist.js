const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Playlist title is required'],
      trim: true,
      maxlength: [200, 'Playlist title cannot exceed 200 characters']
    },
    description: {
      type: String,
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner is required']
    },
    coverImage: {
      type: String,
      default: null
    },
    tracks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Track'
      }
    ],
    totalTracks: {
      type: Number,
      default: 0
    },
    duration: {
      type: Number,
      default: 0
    },
    isPublic: {
      type: Boolean,
      default: true
    },
    views: {
      type: Number,
      default: 0,
      min: 0
    },
    likes: {
      type: Number,
      default: 0,
      min: 0
    },
    likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    isCollaborative: {
      type: Boolean,
      default: false
    },
    collaborators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    timestamps: true
  }
);

playlistSchema.index({ title: 'text', owner: 1 });
playlistSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Playlist', playlistSchema);
