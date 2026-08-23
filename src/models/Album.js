const mongoose = require('mongoose');

const albumSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Album title is required'],
      trim: true,
      maxlength: [200, 'Album title cannot exceed 200 characters']
    },
    artist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Artist is required']
    },
    coverImage: {
      type: String,
      required: [true, 'Album cover image is required']
    },
    description: {
      type: String,
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    releaseDate: {
      type: Date,
      required: [true, 'Release date is required']
    },
    genre: {
      type: String,
      enum: ['Pop', 'Rock', 'Hip-Hop', 'Jazz', 'Classical', 'Electronic', 'R&B', 'Country', 'Folk', 'Other'],
      default: 'Other'
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
    isPublic: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

albumSchema.index({ title: 'text', artist: 1, genre: 1 });
albumSchema.index({ releaseDate: -1 });

module.exports = mongoose.model('Album', albumSchema);
