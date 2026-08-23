const mongoose = require('mongoose');

const trackSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Track title is required'],
      trim: true,
      maxlength: [200, 'Track title cannot exceed 200 characters']
    },
    artist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Artist is required']
    },
    album: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Album'
    },
    duration: {
      type: Number,
      required: [true, 'Duration is required'],
      min: [0, 'Duration must be positive']
    },
    genre: {
      type: String,
      enum: ['Pop', 'Rock', 'Hip-Hop', 'Jazz', 'Classical', 'Electronic', 'R&B', 'Country', 'Folk', 'Other'],
      default: 'Other'
    },
    releaseDate: {
      type: Date,
      default: Date.now
    },
    audioUrl: {
      type: String,
      required: [true, 'Audio URL is required']
    },
    coverImage: {
      type: String,
      default: null
    },
    lyrics: {
      type: String,
      default: null
    },
    description: {
      type: String,
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    isPublic: {
      type: Boolean,
      default: true
    },
    isExplicit: {
      type: Boolean,
      default: false
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
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        text: String,
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    plays: {
      type: Number,
      default: 0,
      min: 0
    },
    shares: {
      type: Number,
      default: 0,
      min: 0
    },
    tags: [String],
    isApproved: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Index for search
trackSchema.index({ title: 'text', artist: 1, genre: 1 });
trackSchema.index({ createdAt: -1 });

// Increment views
trackSchema.methods.incrementViews = async function () {
  this.views += 1;
  return await this.save();
};

// Like track
trackSchema.methods.like = async function (userId) {
  if (!this.likedBy.includes(userId)) {
    this.likedBy.push(userId);
    this.likes += 1;
  }
  return await this.save();
};

// Unlike track
trackSchema.methods.unlike = async function (userId) {
  const index = this.likedBy.indexOf(userId);
  if (index !== -1) {
    this.likedBy.splice(index, 1);
    this.likes = Math.max(0, this.likes - 1);
  }
  return await this.save();
};

module.exports = mongoose.model('Track', trackSchema);
