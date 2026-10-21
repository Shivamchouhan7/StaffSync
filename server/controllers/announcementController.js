const Announcement = require('../models/Announcement');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Get announcements for the current user's role
// @route   GET /api/announcements
// @access  Private
const getAnnouncements = async (req, res, next) => {
  try {
    const role = req.user.role;
    // HR can view all announcements; others can view targetRole: 'all' or their specific role
    const query = role === 'hr' ? {} : { targetRole: { $in: ['all', role] } };

    const announcements = await Announcement.find(query)
      .sort({ isPinned: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      data: announcements,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new announcement (HR only)
// @route   POST /api/announcements
// @access  Private/HR
const createAnnouncement = async (req, res, next) => {
  try {
    const { title, content, priority = 'medium', targetRole = 'all', isPinned = false } = req.body;

    const announcement = await Announcement.create({
      title,
      content,
      priority,
      targetRole,
      isPinned,
      createdBy: req.user._id,
      authorName: req.user.name,
    });

    // Notify targeted users in app
    let recipientQuery = { isActive: true };
    if (targetRole !== 'all') {
      recipientQuery.role = targetRole;
    }

    const recipients = await User.find(recipientQuery).select('_id');
    const notificationDocs = recipients.map((u) => ({
      recipient: u._id,
      title: `Announcement: ${title}`,
      message: content.length > 120 ? `${content.substring(0, 117)}...` : content,
      type: 'announcement',
      relatedId: announcement._id,
    }));

    if (notificationDocs.length > 0) {
      await Notification.insertMany(notificationDocs);
    }

    res.status(201).json({
      success: true,
      message: 'Announcement published successfully.',
      data: announcement,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an announcement (HR only)
// @route   PUT /api/announcements/:id
// @access  Private/HR
const updateAnnouncement = async (req, res, next) => {
  try {
    const { title, content, priority, targetRole, isPinned } = req.body;

    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found.',
      });
    }

    if (title) announcement.title = title;
    if (content) announcement.content = content;
    if (priority) announcement.priority = priority;
    if (targetRole) announcement.targetRole = targetRole;
    if (isPinned !== undefined) announcement.isPinned = isPinned;

    await announcement.save();

    res.status(200).json({
      success: true,
      message: 'Announcement updated successfully.',
      data: announcement,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an announcement (HR only)
// @route   DELETE /api/announcements/:id
// @access  Private/HR
const deleteAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found.',
      });
    }

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
  updateAnnouncement,
  deleteAnnouncement,
};
