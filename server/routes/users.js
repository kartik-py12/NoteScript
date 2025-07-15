const express = require('express');
const { query, validationResult } = require('express-validator');
const User = require('../models/User');
const Note = require('../models/Note');
const auth = require('../middleware/auth');

const router = express.Router();

// Get user profile by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || !user.isActive) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's public notes count
    const publicNotesCount = await Note.countDocuments({
      author: user._id,
      isPublic: true,
      isActive: true
    });

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        publicNotesCount
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).json({ message: 'Server error while fetching user' });
  }
});

// Get user's public notes
router.get('/:id/notes', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('sortBy').optional().isIn(['createdAt', 'updatedAt', 'title', 'views']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const user = await User.findById(req.params.id);

    if (!user || !user.isActive) {
      return res.status(404).json({ message: 'User not found' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build sort object
    const sortBy = req.query.sortBy || 'updatedAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const sort = { [sortBy]: sortOrder };

    // Get user's public notes
    const notes = await Note.find({
      author: user._id,
      isPublic: true,
      isActive: true
    })
      .populate('author', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Note.countDocuments({
      author: user._id,
      isPublic: true,
      isActive: true
    });

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      },
      notes,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit
      }
    });
  } catch (error) {
    console.error('Get user notes error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).json({ message: 'Server error while fetching user notes' });
  }
});

// Get user statistics (for dashboard)
router.get('/:id/stats', auth, async (req, res) => {
  try {
    // Only allow users to view their own stats
    if (req.params.id !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view these statistics' });
    }

    const userId = req.user._id;

    // Get note counts
    const totalNotes = await Note.countDocuments({
      author: userId,
      isActive: true
    });

    const publicNotes = await Note.countDocuments({
      author: userId,
      isPublic: true,
      isActive: true
    });

    const privateNotes = await Note.countDocuments({
      author: userId,
      isPublic: false,
      isActive: true
    });

    // Get total views
    const viewsResult = await Note.aggregate([
      { $match: { author: userId, isActive: true } },
      { $group: { _id: null, totalViews: { $sum: '$views' } } }
    ]);

    const totalViews = viewsResult.length > 0 ? viewsResult[0].totalViews : 0;

    // Get total likes
    const likesResult = await Note.aggregate([
      { $match: { author: userId, isActive: true } },
      { $project: { likeCount: { $size: '$likes' } } },
      { $group: { _id: null, totalLikes: { $sum: '$likeCount' } } }
    ]);

    const totalLikes = likesResult.length > 0 ? likesResult[0].totalLikes : 0;

    // Get most popular note
    const popularNote = await Note.findOne({
      author: userId,
      isActive: true
    })
      .sort({ views: -1 })
      .select('title views')
      .limit(1);

    res.json({
      stats: {
        totalNotes,
        publicNotes,
        privateNotes,
        totalViews,
        totalLikes,
        mostPopularNote: popularNote
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).json({ message: 'Server error while fetching user statistics' });
  }
});

module.exports = router;
