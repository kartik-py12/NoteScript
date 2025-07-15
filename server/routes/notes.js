const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Note = require('../models/Note');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all notes (with filtering and pagination)
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('isPublic').optional().isBoolean().withMessage('isPublic must be a boolean'),
  query('author').optional().isMongoId().withMessage('Author must be a valid ID'),
  query('tags').optional().isString().withMessage('Tags must be a string'),
  query('search').optional().isString().withMessage('Search must be a string'),
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

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = { isActive: true };

    if (req.query.isPublic !== undefined) {
      filter.isPublic = req.query.isPublic === 'true';
    }

    if (req.query.author) {
      filter.author = req.query.author;
    }

    if (req.query.tags) {
      const tags = req.query.tags.split(',').map(tag => tag.trim().toLowerCase());
      filter.tags = { $in: tags };
    }

    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    // Build sort object
    const sortBy = req.query.sortBy || 'updatedAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const sort = { [sortBy]: sortOrder };

    // Execute query
    const notes = await Note.find(filter)
      .populate('author', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Note.countDocuments(filter);

    res.json({
      notes,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit
      }
    });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ message: 'Server error while fetching notes' });
  }
});

// Get single note by ID
router.get('/:id', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id)
      .populate('author', 'name email');

    if (!note || !note.isActive) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Increment view count
    note.views += 1;
    await note.save();

    res.json({ note });
  } catch (error) {
    console.error('Get note error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.status(500).json({ message: 'Server error while fetching note' });
  }
});

// Create new note
router.post('/', auth, [
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title must be between 1 and 200 characters'),
  body('content').isLength({ min: 1 }).withMessage('Content is required'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('tags.*').optional().trim().isLength({ max: 30 }).withMessage('Each tag must be 30 characters or less'),
  body('isPublic').optional().isBoolean().withMessage('isPublic must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { title, content, tags = [], isPublic = false } = req.body;

    // Process tags
    const processedTags = tags
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag.length > 0);

    const note = new Note({
      title,
      content,
      tags: processedTags,
      isPublic,
      author: req.user._id
    });

    await note.save();
    await note.populate('author', 'name email');

    res.status(201).json({
      message: 'Note created successfully',
      note
    });
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ message: 'Server error while creating note' });
  }
});

// Update note
router.put('/:id', auth, [
  body('title').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Title must be between 1 and 200 characters'),
  body('content').optional().isLength({ min: 1 }).withMessage('Content cannot be empty'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('tags.*').optional().trim().isLength({ max: 30 }).withMessage('Each tag must be 30 characters or less'),
  body('isPublic').optional().isBoolean().withMessage('isPublic must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const note = await Note.findById(req.params.id);

    if (!note || !note.isActive) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Check if user owns the note
    if (note.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this note' });
    }

    const updateData = {};
    const { title, content, tags, isPublic } = req.body;

    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (isPublic !== undefined) updateData.isPublic = isPublic;

    if (tags !== undefined) {
      updateData.tags = tags
        .map(tag => tag.trim().toLowerCase())
        .filter(tag => tag.length > 0);
    }

    const updatedNote = await Note.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('author', 'name email');

    res.json({
      message: 'Note updated successfully',
      note: updatedNote
    });
  } catch (error) {
    console.error('Update note error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.status(500).json({ message: 'Server error while updating note' });
  }
});

// Delete note
router.delete('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note || !note.isActive) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Check if user owns the note
    if (note.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this note' });
    }

    // Soft delete
    note.isActive = false;
    await note.save();

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Delete note error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.status(500).json({ message: 'Server error while deleting note' });
  }
});

// Toggle like on note
router.post('/:id/like', auth, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note || !note.isActive) {
      return res.status(404).json({ message: 'Note not found' });
    }

    if (!note.isPublic) {
      return res.status(403).json({ message: 'Cannot like private notes' });
    }

    const userId = req.user._id;
    const likeIndex = note.likes.indexOf(userId);

    if (likeIndex > -1) {
      // Unlike
      note.likes.splice(likeIndex, 1);
    } else {
      // Like
      note.likes.push(userId);
    }

    await note.save();
    await note.populate('author', 'name email');

    res.json({
      message: likeIndex > -1 ? 'Note unliked' : 'Note liked',
      note,
      isLiked: likeIndex === -1
    });
  } catch (error) {
    console.error('Like note error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.status(500).json({ message: 'Server error while liking note' });
  }
});

// Get all unique tags
router.get('/tags/all', async (req, res) => {
  try {
    const tags = await Note.aggregate([
      { $match: { isActive: true } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 100 }
    ]);

    res.json({ 
      tags: tags.map(tag => ({
        name: tag._id,
        count: tag.count
      }))
    });
  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({ message: 'Server error while fetching tags' });
  }
});

module.exports = router;
