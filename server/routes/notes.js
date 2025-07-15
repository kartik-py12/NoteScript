const express = require('express');
const Note = require('../models/Note');
const auth = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const { noteSchema, updateNoteSchema } = require('../validation/schemas');

const router = express.Router();

// Get all notes (with filtering and pagination)
router.get('/', async (req, res) => {
  try {
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
    const { id } = req.params;
    
    // Validate ObjectId format
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid note ID format' });
    }
    
    const note = await Note.findById(id)
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
router.post('/', auth, validateRequest(noteSchema), async (req, res) => {
  try {
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
router.put('/:id', auth, validateRequest(updateNoteSchema), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId format
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid note ID format' });
    }
    
    const note = await Note.findById(id);

    if (!note || !note.isActive) {
      return res.status(404).json({ 
        success: false,
        message: 'Note not found' 
      });
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
      id,
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
    const { id } = req.params;
    
    // Validate ObjectId format
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid note ID format' });
    }
    
    const note = await Note.findById(id);

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
    const { id } = req.params;
    
    // Validate ObjectId format
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid note ID format' });
    }
    
    const note = await Note.findById(id);

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
