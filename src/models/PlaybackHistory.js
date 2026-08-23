const mongoose = require('mongoose');

const playbackHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    track: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Track',
      required: true
    },
    playedAt: {
      type: Date,
      default: Date.now
    },
    duration: {
      type: Number,
      default: 0
    },
    listenedDuration: {
      type: Number,
      default: 0
    },
    device: {
      type: String,
      default: 'web'
    }
  },
  {
    timestamps: true
  }
);

playbackHistorySchema.index({ user: 1, playedAt: -1 });

module.exports = mongoose.model('PlaybackHistory', playbackHistorySchema);
