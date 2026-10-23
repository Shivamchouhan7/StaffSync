const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('../models/User');
const Employee = require('../models/Employee');
const Manager = require('../models/Manager');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Announcement = require('../models/Announcement');
const Training = require('../models/Training');
const Notification = require('../models/Notification');

const seedData = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('Error: MONGODB_URI is not set in environment variables.');
      process.exit(1);
    }

    await mongoose.connect(uri);
    console.log('[Seed] Connected to MongoDB.');

    // Clear existing collections
    await Promise.all([
      User.deleteMany({}),
      Employee.deleteMany({}),
      Manager.deleteMany({}),
      Attendance.deleteMany({}),
      Leave.deleteMany({}),
      Announcement.deleteMany({}),
      Training.deleteMany({}),
      Notification.deleteMany({}),
    ]);
    console.log('[Seed] Cleared existing data.');

    const defaultPassword = 'Password@123';

    // 1. Create Users
    const hrUser = await User.create({
      name: 'Elena Rostova',
      email: 'hr@staffsync.com',
      password: defaultPassword,
      role: 'hr',
      isActive: true,
    });

    const managerUser = await User.create({
      name: 'Marcus Vance',
      email: 'manager@staffsync.com',
      password: defaultPassword,
      role: 'manager',
      isActive: true,
    });

    const managerUser2 = await User.create({
      name: 'Sarah Chen',
      email: 'sarah.manager@staffsync.com',
      password: defaultPassword,
      role: 'manager',
      isActive: true,
    });

    const empUser1 = await User.create({
      name: 'Alex Rivera',
      email: 'employee@staffsync.com',
      password: defaultPassword,
      role: 'employee',
      isActive: true,
    });

    const empUser2 = await User.create({
      name: 'Priya Sharma',
      email: 'priya@staffsync.com',
      password: defaultPassword,
      role: 'employee',
      isActive: true,
    });

    const empUser3 = await User.create({
      name: 'David Kim',
      email: 'david@staffsync.com',
      password: defaultPassword,
      role: 'employee',
      isActive: true,
    });

    console.log('[Seed] Created Users.');

    // 2. Create Employee Records
    await Employee.create({
      user: hrUser._id,
      employeeId: 'EMP-1001',
      department: 'Human Resources',
      designation: 'Head of People Operations',
      salary: 115000,
      phone: '+1-555-0101',
      address: { street: '100 Metro Ave', city: 'San Francisco', state: 'CA', zipCode: '94105', country: 'USA' },
      status: 'active',
    });

    await Employee.create({
      user: managerUser._id,
      employeeId: 'EMP-1002',
      department: 'Engineering',
      designation: 'Engineering Director',
      salary: 145000,
      phone: '+1-555-0102',
      address: { street: '240 Silicon Way', city: 'San Jose', state: 'CA', zipCode: '95112', country: 'USA' },
      status: 'active',
    });

    await Employee.create({
      user: managerUser2._id,
      employeeId: 'EMP-1003',
      department: 'Product & Design',
      designation: 'Design Operations Lead',
      salary: 135000,
      phone: '+1-555-0103',
      address: { street: '88 Creative St', city: 'Oakland', state: 'CA', zipCode: '94607', country: 'USA' },
      status: 'active',
    });

    const emp1Record = await Employee.create({
      user: empUser1._id,
      employeeId: 'EMP-1004',
      department: 'Engineering',
      designation: 'Senior Full Stack Engineer',
      salary: 110000,
      manager: managerUser._id,
      phone: '+1-555-0104',
      address: { street: '512 Market Blvd', city: 'San Francisco', state: 'CA', zipCode: '94102', country: 'USA' },
      emergencyContact: { name: 'Maria Rivera', relationship: 'Spouse', phone: '+1-555-0999' },
      status: 'active',
    });

    const emp2Record = await Employee.create({
      user: empUser2._id,
      employeeId: 'EMP-1005',
      department: 'Engineering',
      designation: 'Cloud Infrastructure Specialist',
      salary: 105000,
      manager: managerUser._id,
      phone: '+1-555-0105',
      address: { street: '77 Mission St', city: 'San Francisco', state: 'CA', zipCode: '94103', country: 'USA' },
      emergencyContact: { name: 'Raj Sharma', relationship: 'Brother', phone: '+1-555-0888' },
      status: 'active',
    });

    const emp3Record = await Employee.create({
      user: empUser3._id,
      employeeId: 'EMP-1006',
      department: 'Product & Design',
      designation: 'Product UI/UX Designer',
      salary: 98000,
      manager: managerUser2._id,
      phone: '+1-555-0106',
      address: { street: '310 Howard St', city: 'San Francisco', state: 'CA', zipCode: '94105', country: 'USA' },
      emergencyContact: { name: 'Grace Kim', relationship: 'Sister', phone: '+1-555-0777' },
      status: 'active',
    });

    console.log('[Seed] Created Employee records.');

    // 3. Create Managers
    await Manager.create({
      user: managerUser._id,
      department: 'Engineering',
      teamMembers: [empUser1._id, empUser2._id],
      responsibilities: ['Frontend architecture', 'Backend microservices', 'Sprint planning', 'Mentorship'],
    });

    await Manager.create({
      user: managerUser2._id,
      department: 'Product & Design',
      teamMembers: [empUser3._id],
      responsibilities: ['Design systems', 'User research', 'Brand consistency'],
    });

    console.log('[Seed] Created Manager assignments.');

    // 4. Create Attendance records
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const twoDaysAgo = new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0];

    const todayCheckInTime = new Date();
    todayCheckInTime.setHours(9, 15, 0, 0);

    const emp1CheckIn = new Date();
    emp1CheckIn.setHours(9, 10, 0, 0);

    const emp2CheckIn = new Date();
    emp2CheckIn.setHours(9, 45, 0, 0); // Late check-in

    await Attendance.create([
      {
        user: empUser1._id,
        date: today,
        checkIn: emp1CheckIn,
        status: 'present',
        notes: 'Working on StaffSync client dashboard',
      },
      {
        user: empUser2._id,
        date: today,
        checkIn: emp2CheckIn,
        status: 'late',
        notes: 'Commute delay on transit',
      },
      {
        user: managerUser._id,
        date: today,
        checkIn: todayCheckInTime,
        status: 'present',
        notes: 'Architecture sync and team 1-on-1s',
      },
      // Historical attendance
      {
        user: empUser1._id,
        date: yesterday,
        checkIn: new Date(Date.now() - 86400000 + 9 * 3600000),
        checkOut: new Date(Date.now() - 86400000 + 17 * 3600000 + 30 * 60000),
        workHours: 8.5,
        status: 'present',
      },
      {
        user: empUser1._id,
        date: twoDaysAgo,
        checkIn: new Date(Date.now() - 86400000 * 2 + 9 * 3600000),
        checkOut: new Date(Date.now() - 86400000 * 2 + 18 * 3600000),
        workHours: 9.0,
        status: 'present',
      },
    ]);

    console.log('[Seed] Created Attendance records.');

    // 5. Create Leaves
    const nextWeekStart = new Date(Date.now() + 86400000 * 7);
    const nextWeekEnd = new Date(Date.now() + 86400000 * 9);

    const pastLeaveStart = new Date(Date.now() - 86400000 * 14);
    const pastLeaveEnd = new Date(Date.now() - 86400000 * 12);

    await Leave.create([
      {
        user: empUser1._id,
        leaveType: 'annual',
        startDate: nextWeekStart,
        endDate: nextWeekEnd,
        daysCount: 3,
        reason: 'Family vacation trip',
        status: 'pending',
      },
      {
        user: empUser2._id,
        leaveType: 'casual',
        startDate: new Date(Date.now() + 86400000 * 3),
        endDate: new Date(Date.now() + 86400000 * 4),
        daysCount: 2,
        reason: 'Personal errands and family commitment',
        status: 'pending',
      },
      {
        user: empUser1._id,
        leaveType: 'sick',
        startDate: pastLeaveStart,
        endDate: pastLeaveEnd,
        daysCount: 3,
        reason: 'Viral fever and medical rest',
        status: 'approved',
        reviewedBy: managerUser._id,
        reviewNotes: 'Approved. Hope you feel better.',
        reviewDate: pastLeaveStart,
      },
    ]);

    console.log('[Seed] Created Leave records.');

    // 6. Create Announcements
    await Announcement.create([
      {
        title: 'Q1 All-Hands & Product Roadmap Presentation',
        content:
          'Join us this Friday at 3:00 PM EST for the quarterly company all-hands meeting. We will review our achievements, introduce new team members, and present the upcoming engineering roadmap.',
        priority: 'high',
        targetRole: 'all',
        createdBy: hrUser._id,
        authorName: hrUser.name,
        isPinned: true,
      },
      {
        title: 'Updated Health & Wellness Benefits Package',
        content:
          'Human Resources has partnered with new health coverage providers to offer expanded dental, vision, and mental wellness coverage effective next month. Please check your benefits portal.',
        priority: 'medium',
        targetRole: 'all',
        createdBy: hrUser._id,
        authorName: hrUser.name,
        isPinned: false,
      },
      {
        title: 'Manager Leadership Workshop & OKR Alignment',
        content:
          'All team leads and managers are requested to submit quarterly OKR drafts by Wednesday ahead of the management sync.',
        priority: 'medium',
        targetRole: 'manager',
        createdBy: hrUser._id,
        authorName: hrUser.name,
        isPinned: false,
      },
    ]);

    console.log('[Seed] Created Announcements.');

    // 7. Create Trainings
    const training1 = await Training.create({
      title: 'Modern Cloud Architecture & Docker Best Practices',
      description:
        'Hands-on workshop covering containerization strategies, Docker Compose, Kubernetes fundamentals, and automated CI/CD pipelines.',
      category: 'Technical',
      department: 'Engineering',
      trainer: 'DevOps Guild',
      startDate: new Date(Date.now() + 86400000 * 10),
      endDate: new Date(Date.now() + 86400000 * 12),
      capacity: 20,
      createdBy: managerUser._id,
      enrolledUsers: [
        {
          user: empUser1._id,
          status: 'enrolled',
          enrolledAt: new Date(),
        },
        {
          user: empUser2._id,
          status: 'enrolled',
          enrolledAt: new Date(),
        },
      ],
      status: 'upcoming',
    });

    const training2 = await Training.create({
      title: 'Workplace Security & Phishing Awareness 2026',
      description:
        'Mandatory annual security training for all StaffSync personnel covering two-factor auth, social engineering defenses, and data handling protocols.',
      category: 'Compliance',
      department: 'All',
      trainer: 'InfoSec Team',
      startDate: new Date(Date.now() + 86400000 * 5),
      endDate: new Date(Date.now() + 86400000 * 6),
      capacity: 50,
      createdBy: hrUser._id,
      enrolledUsers: [
        {
          user: empUser1._id,
          status: 'completed',
          enrolledAt: new Date(Date.now() - 86400000 * 2),
          completionDate: new Date(),
          score: 95,
        },
      ],
      status: 'in_progress',
    });

    console.log('[Seed] Created Trainings.');

    // 8. Create Notifications
    await Notification.create([
      {
        recipient: empUser1._id,
        title: 'Welcome to StaffSync',
        message: 'Your employee profile is active. You can check in for today and explore your workspace.',
        type: 'system',
      },
      {
        recipient: managerUser._id,
        title: 'New Leave Request Submitted',
        message: 'Alex Rivera submitted an annual leave request for 3 day(s).',
        type: 'leave',
      },
      {
        recipient: hrUser._id,
        title: 'System Initialized',
        message: 'StaffSync HRMS database seed executed successfully.',
        type: 'system',
      },
    ]);

    console.log('[Seed] Created Notifications.');

    console.log('\n======================================================');
    console.log(' StaffSync Seed Completed Successfully!');
    console.log('======================================================');
    console.log('Available Demo Accounts (Password: Password@123):');
    console.log('  1. HR Administrator:  hr@staffsync.com');
    console.log('  2. Engineering Lead:   manager@staffsync.com');
    console.log('  3. Design Lead:        sarah.manager@staffsync.com');
    console.log('  4. Senior Engineer:    employee@staffsync.com');
    console.log('  5. Cloud Specialist:   priya@staffsync.com');
    console.log('  6. UI/UX Designer:     david@staffsync.com');
    console.log('======================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error] Failed to seed database:', error);
    process.exit(1);
  }
};

seedData();
