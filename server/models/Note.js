const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [30, 'Tag cannot be more than 30 characters']
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  views: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better performance
noteSchema.index({ author: 1, createdAt: -1 });
noteSchema.index({ isPublic: 1, createdAt: -1 });
noteSchema.index({ tags: 1 });
noteSchema.index({ title: 'text', content: 'text' });

// Virtual for like count
noteSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Populate author information
noteSchema.methods.toJSON = function() {
  const noteObject = this.toObject();
  noteObject.likeCount = this.likeCount;
  return noteObject;
};

module.exports = mongoose.model('Note', noteSchema);
