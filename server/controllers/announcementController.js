const Announcement = require('../models/Announcement');

// @desc Get all announcements (pinned first, newest first)
// @route GET /api/announcements
const getAnnouncements = async (req, res, next) => {
  try {
    const { category, priority } = req.query;
    const filter = {};

    if (category && category !== 'All') {
      filter.category = category;
    }
    if (priority && priority !== 'All') {
      filter.priority = priority;
    }

    const announcements = await Announcement.find(filter)
      .populate('author', 'firstName lastName designation role email')
      .sort({ isPinned: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: announcements.length,
      announcements,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Create new announcement (HR & Manager)
// @route POST /api/announcements
const createAnnouncement = async (req, res, next) => {
  try {
    const { title, content, category = 'General', priority = 'Medium', targetDepartment = 'All', isPinned = false } =
      req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both title and content.',
      });
    }

    if (!req.employee) {
      return res.status(400).json({
        success: false,
        message: 'Author employee profile not found.',
      });
    }

    const announcement = new Announcement({
      title,
      content,
      category,
      priority,
      author: req.employee._id,
      targetDepartment,
      isPinned: Boolean(isPinned),
    });

    await announcement.save();

    const populated = await Announcement.findById(announcement._id).populate(
      'author',
      'firstName lastName designation role email'
    );

    res.status(201).json({
      success: true,
      message: 'Announcement broadcasted successfully.',
      announcement: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Delete announcement (HR or author)
// @route DELETE /api/announcements/:id
const deleteAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found.',
      });
    }

    const isHR = req.user.role === 'hr';
    const isAuthor =
      req.employee && announcement.author && req.employee._id.toString() === announcement.author.toString();

    if (!isHR && !isAuthor) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this announcement.',
      });
    }

    await Announcement.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
};
