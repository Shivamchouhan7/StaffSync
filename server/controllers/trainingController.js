const Training = require('../models/Training');
const Notification = require('../models/Notification');

// @desc    Get all trainings
// @route   GET /api/trainings
// @access  Private
const getTrainings = async (req, res, next) => {
  try {
    const { status, category } = req.query;

    const query = {};
    if (status && status !== 'All') query.status = status;
    if (category && category !== 'All') query.category = category;

    const trainings = await Training.find(query)
      .populate('createdBy', 'name role')
      .populate('enrolledUsers.user', 'name email role')
      .sort({ startDate: 1 });

    res.status(200).json({
      success: true,
      data: trainings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single training program
// @route   GET /api/trainings/:id
// @access  Private
const getTrainingById = async (req, res, next) => {
  try {
    const training = await Training.findById(req.params.id)
      .populate('createdBy', 'name role')
      .populate('enrolledUsers.user', 'name email role');

    if (!training) {
      return res.status(404).json({
        success: false,
        message: 'Training program not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: training,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a training program (HR or Manager)
// @route   POST /api/trainings
// @access  Private (HR or Manager)
const createTraining = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      department = 'All',
      trainer,
      startDate,
      endDate,
      capacity = 25,
    } = req.body;

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      return res.status(400).json({
        success: false,
        message: 'Training end date cannot be earlier than start date.',
      });
    }

    const training = await Training.create({
      title,
      description,
      category,
      department,
      trainer,
      startDate: start,
      endDate: end,
      capacity,
      createdBy: req.user._id,
      enrolledUsers: [],
    });

    res.status(201).json({
      success: true,
      message: 'Training program created successfully.',
      data: training,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a training program (HR or Creator Manager)
// @route   PUT /api/trainings/:id
// @access  Private (HR or Manager)
const updateTraining = async (req, res, next) => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) {
      return res.status(404).json({
        success: false,
        message: 'Training program not found.',
      });
    }

    // Only HR or original creator can update
    if (req.user.role !== 'hr' && training.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only edit training programs that you created.',
      });
    }

    const { title, description, category, department, trainer, startDate, endDate, capacity, status } = req.body;

    if (title) training.title = title;
    if (description) training.description = description;
    if (category) training.category = category;
    if (department) training.department = department;
    if (trainer) training.trainer = trainer;
    if (startDate) training.startDate = new Date(startDate);
    if (endDate) training.endDate = new Date(endDate);
    if (capacity !== undefined) training.capacity = capacity;
    if (status) training.status = status;

    await training.save();

    res.status(200).json({
      success: true,
      message: 'Training program updated successfully.',
      data: training,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Enroll in training (Employee/User)
// @route   POST /api/trainings/:id/enroll
// @access  Private
const enrollTraining = async (req, res, next) => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) {
      return res.status(404).json({
        success: false,
        message: 'Training program not found.',
      });
    }

    const alreadyEnrolled = training.enrolledUsers.some(
      (item) => item.user.toString() === req.user._id.toString()
    );

    if (alreadyEnrolled) {
      return res.status(400).json({
        success: false,
        message: 'You are already enrolled in this training program.',
      });
    }

    if (training.enrolledUsers.length >= training.capacity) {
      return res.status(400).json({
        success: false,
        message: 'Training program has reached maximum capacity.',
      });
    }

    training.enrolledUsers.push({
      user: req.user._id,
      status: 'enrolled',
      enrolledAt: new Date(),
    });

    await training.save();

    res.status(200).json({
      success: true,
      message: 'Successfully enrolled in training program.',
      data: training,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update enrollment completion status and score (HR or Manager)
// @route   PATCH /api/trainings/:id/enrollment/:userId
// @access  Private (HR or Manager)
const updateEnrollment = async (req, res, next) => {
  try {
    const { status, score } = req.body;
    const training = await Training.findById(req.params.id);

    if (!training) {
      return res.status(404).json({
        success: false,
        message: 'Training program not found.',
      });
    }

    const enrollment = training.enrolledUsers.find(
      (e) => e.user.toString() === req.params.userId
    );

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'User is not enrolled in this training.',
      });
    }

    if (status) enrollment.status = status;
    if (score !== undefined) enrollment.score = score;
    if (status === 'completed') enrollment.completionDate = new Date();

    await training.save();

    res.status(200).json({
      success: true,
      message: 'Enrollment record updated successfully.',
      data: training,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTrainings,
  getTrainingById,
  createTraining,
  updateTraining,
  enrollTraining,
  updateEnrollment,
};
