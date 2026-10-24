const mongoose = require('mongoose');
const User = require('../models/User');
const Employee = require('../models/Employee');
const LeaveRequest = require('../models/LeaveRequest');
const Attendance = require('../models/Attendance');
const Announcement = require('../models/Announcement');
const TrainingProgram = require('../models/TrainingProgram');
const connectDB = require('../config/db');
const { formatDateStr } = require('../controllers/attendanceController');

const seedData = async () => {
  try {
    console.log('[Seeder] Connecting to database...');
    await connectDB();

    console.log('[Seeder] Clearing old records...');
    await Promise.all([
      User.deleteMany({}),
      Employee.deleteMany({}),
      LeaveRequest.deleteMany({}),
      Attendance.deleteMany({}),
      Announcement.deleteMany({}),
      TrainingProgram.deleteMany({}),
    ]);

    console.log('[Seeder] Seeding Employees...');

    // 1. Create Employees
    const empSarah = await Employee.create({
      employeeId: 'HR-1001',
      firstName: 'Sarah',
      lastName: 'Jenkins',
      email: 'hr@staffsync.com',
      phone: '+1 (555) 234-5678',
      department: 'Human Resources',
      designation: 'VP of People & Culture',
      role: 'hr',
      salary: 115000,
      status: 'Active',
      address: { street: '124 Market St', city: 'San Francisco', state: 'CA', zip: '94105' },
      emergencyContact: { name: 'Michael Jenkins', relationship: 'Spouse', phone: '+1 (555) 987-6543' },
      skills: ['Talent Acquisition', 'Compensation & Benefits', 'Conflict Resolution', 'HR Analytics'],
    });

    const empDavid = await Employee.create({
      employeeId: 'MGR-2001',
      firstName: 'David',
      lastName: 'Miller',
      email: 'manager@staffsync.com',
      phone: '+1 (555) 345-6789',
      department: 'Engineering',
      designation: 'Engineering Manager',
      role: 'manager',
      salary: 135000,
      status: 'Active',
      address: { street: '456 Tech Plaza', city: 'San Francisco', state: 'CA', zip: '94107' },
      emergencyContact: { name: 'Claire Miller', relationship: 'Sister', phone: '+1 (555) 876-5432' },
      skills: ['Engineering Management', 'System Architecture', 'Agile / Scrum', 'Mentorship'],
    });

    const empAlex = await Employee.create({
      employeeId: 'EMP-3001',
      firstName: 'Alex',
      lastName: 'Rivera',
      email: 'alex.rivera@staffsync.com',
      phone: '+1 (555) 456-7890',
      department: 'Engineering',
      designation: 'Senior Full Stack Engineer',
      role: 'employee',
      manager: empDavid._id,
      salary: 95000,
      status: 'Active',
      address: { street: '789 Mission St', city: 'San Francisco', state: 'CA', zip: '94103' },
      emergencyContact: { name: 'Elena Rivera', relationship: 'Mother', phone: '+1 (555) 765-4321' },
      skills: ['React', 'Node.js', 'MongoDB', 'Docker', 'TypeScript'],
    });

    const empPriya = await Employee.create({
      employeeId: 'EMP-3002',
      firstName: 'Priya',
      lastName: 'Patel',
      email: 'priya.patel@staffsync.com',
      phone: '+1 (555) 567-8901',
      department: 'Product & Design',
      designation: 'Staff Product Designer',
      role: 'employee',
      salary: 92000,
      status: 'Active',
      address: { street: '321 Pine St', city: 'San Francisco', state: 'CA', zip: '94104' },
      emergencyContact: { name: 'Rohan Patel', relationship: 'Brother', phone: '+1 (555) 654-3210' },
      skills: ['Figma', 'Design Systems', 'User Research', 'Prototyping'],
    });

    const empMarcus = await Employee.create({
      employeeId: 'EMP-3003',
      firstName: 'Marcus',
      lastName: 'Chen',
      email: 'marcus.chen@staffsync.com',
      phone: '+1 (555) 678-9012',
      department: 'Engineering',
      designation: 'DevOps & Site Reliability Engineer',
      role: 'employee',
      manager: empDavid._id,
      salary: 102000,
      status: 'Active',
      address: { street: '654 Bush St', city: 'San Francisco', state: 'CA', zip: '94108' },
      emergencyContact: { name: 'Grace Chen', relationship: 'Spouse', phone: '+1 (555) 543-2109' },
      skills: ['Kubernetes', 'AWS', 'Terraform', 'CI/CD Pipelines'],
    });

    const empEmily = await Employee.create({
      employeeId: 'EMP-3004',
      firstName: 'Emily',
      lastName: 'Watson',
      email: 'emily.watson@staffsync.com',
      phone: '+1 (555) 789-0123',
      department: 'Finance & Operations',
      designation: 'Senior Financial Analyst',
      role: 'employee',
      salary: 88000,
      status: 'Active',
      address: { street: '987 Montgomery St', city: 'San Francisco', state: 'CA', zip: '94111' },
      emergencyContact: { name: 'Robert Watson', relationship: 'Father', phone: '+1 (555) 432-1098' },
      skills: ['Financial Modeling', 'Budgeting', 'Payroll Analysis', 'ERP Systems'],
    });

    console.log('[Seeder] Creating User credentials...');

    // 2. Create Linked Users with Password "password123"
    const users = [
      { email: 'hr@staffsync.com', role: 'hr', employeeRef: empSarah._id },
      { email: 'manager@staffsync.com', role: 'manager', employeeRef: empDavid._id },
      { email: 'alex.rivera@staffsync.com', role: 'employee', employeeRef: empAlex._id },
      { email: 'priya.patel@staffsync.com', role: 'employee', employeeRef: empPriya._id },
      { email: 'marcus.chen@staffsync.com', role: 'employee', employeeRef: empMarcus._id },
      { email: 'emily.watson@staffsync.com', role: 'employee', employeeRef: empEmily._id },
    ];

    for (const u of users) {
      const user = new User({
        email: u.email,
        password: 'password123',
        role: u.role,
        employeeRef: u.employeeRef,
      });
      await user.save();
      await Employee.findByIdAndUpdate(u.employeeRef, { userRef: user._id });
    }

    console.log('[Seeder] Seeding Leave Requests...');

    // 3. Create Leave Requests
    const now = new Date();
    await LeaveRequest.create([
      {
        employee: empAlex._id,
        leaveType: 'Annual Leave',
        startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3),
        endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 6),
        daysCount: 4,
        reason: 'Annual family road trip and vacation.',
        status: 'Pending',
      },
      {
        employee: empMarcus._id,
        leaveType: 'Casual Leave',
        startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
        endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2),
        daysCount: 2,
        reason: 'Personal family commitments and relocation assistance.',
        status: 'Pending',
      },
      {
        employee: empPriya._id,
        leaveType: 'Sick Leave',
        startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 10),
        endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 8),
        daysCount: 3,
        reason: 'Recovering from acute viral flu and doctor recommended rest.',
        status: 'Approved',
        reviewedBy: empDavid._id,
        reviewerComments: 'Approved. Hope you feel better!',
        reviewedAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 9),
      },
      {
        employee: empEmily._id,
        leaveType: 'Casual Leave',
        startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 15),
        endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 14),
        daysCount: 2,
        reason: 'Attending sibling graduation ceremony.',
        status: 'Approved',
        reviewedBy: empSarah._id,
        reviewerComments: 'Approved by HR. Have a wonderful time!',
        reviewedAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 15),
      },
      {
        employee: empAlex._id,
        leaveType: 'Emergency Leave',
        startDate: new Date(now.getFullYear(), now.getMonth() - 1, 10),
        endDate: new Date(now.getFullYear(), now.getMonth() - 1, 11),
        daysCount: 2,
        reason: 'Urgent home plumbing repair and electrical overhaul.',
        status: 'Approved',
        reviewedBy: empDavid._id,
        reviewerComments: 'Approved without issue.',
        reviewedAt: new Date(now.getFullYear(), now.getMonth() - 1, 9),
      },
    ]);

    console.log('[Seeder] Seeding Attendance Records...');

    // 4. Create Attendance Records for Today and Past days
    const todayStr = formatDateStr();
    const todayCheckInTime = new Date();
    todayCheckInTime.setHours(9, 15, 0, 0);

    // Today's attendance
    await Attendance.create([
      {
        employee: empSarah._id,
        date: todayStr,
        checkIn: new Date(todayCheckInTime.getTime() - 10 * 60000),
        status: 'Present',
        location: 'Office',
        workHours: 4.2,
      },
      {
        employee: empDavid._id,
        date: todayStr,
        checkIn: todayCheckInTime,
        status: 'Present',
        location: 'Office',
        workHours: 4.0,
      },
      {
        employee: empAlex._id,
        date: todayStr,
        checkIn: new Date(todayCheckInTime.getTime() + 25 * 60000), // 9:40 AM -> Late
        status: 'Late',
        location: 'Remote',
        workHours: 3.5,
        notes: 'Slight delay due to transit commute.',
      },
      {
        employee: empPriya._id,
        date: todayStr,
        checkIn: new Date(todayCheckInTime.getTime() - 5 * 60000),
        status: 'Present',
        location: 'Office',
        workHours: 4.1,
      },
    ]);

    // Past attendance records for Alex Rivera (so employee dashboard has rich history)
    for (let i = 1; i <= 6; i++) {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - i);
      const pastStr = formatDateStr(pastDate);

      const checkIn = new Date(pastDate);
      checkIn.setHours(9, Math.floor(Math.random() * 25), 0);
      const checkOut = new Date(pastDate);
      checkOut.setHours(17, 30 + Math.floor(Math.random() * 45), 0);

      const hours = Number(((checkOut - checkIn) / 3600000).toFixed(1));

      await Attendance.create({
        employee: empAlex._id,
        date: pastStr,
        checkIn,
        checkOut,
        status: hours >= 8 ? 'Present' : 'Half-day',
        workHours: hours,
        location: i % 2 === 0 ? 'Remote' : 'Office',
      });
    }

    console.log('[Seeder] Seeding Announcements...');

    // 5. Create Announcements
    await Announcement.create([
      {
        title: 'Q4 Strategic All-Hands & Product Roadmap Presentation',
        content:
          'Join the executive leadership team this Thursday at 2:00 PM PST in the Main Auditorium or via Zoom. We will review our quarterly product milestones, enterprise growth, and celebrate team accomplishments.',
        category: 'Company News',
        priority: 'Urgent',
        author: empDavid._id,
        targetDepartment: 'All',
        isPinned: true,
      },
      {
        title: 'Annual Health & Wellness Benefit Enrollment Window Open',
        content:
          'Open enrollment for medical, dental, vision, and flexible spending accounts is now active through the end of the month. Please review your benefit packages in the employee portal and submit any modifications.',
        category: 'HR Policy',
        priority: 'High',
        author: empSarah._id,
        targetDepartment: 'All',
        isPinned: true,
      },
      {
        title: 'Engineering Innovation & Hackathon 2026',
        content:
          'Get your cross-functional squads ready! The annual 48-hour engineering and design hackathon kicks off next month. Cash prizes, cloud credits, and incubation opportunities for winning teams.',
        category: 'Events',
        priority: 'Medium',
        author: empDavid._id,
        targetDepartment: 'Engineering',
        isPinned: false,
      },
      {
        title: 'New Hybrid Workplace & Remote Expense Policy Update',
        content:
          'HR has published updated guidelines regarding home office ergonomics allowances and flexible hybrid office booking schedules. Please review the updated handbook on the portal.',
        category: 'HR Policy',
        priority: 'Low',
        author: empSarah._id,
        targetDepartment: 'All',
        isPinned: false,
      },
    ]);

    console.log('[Seeder] Seeding Training Programs...');

    // 6. Create Training Programs
    await TrainingProgram.create([
      {
        title: 'Advanced Microservices Architecture & Event-Driven Systems',
        description:
          'Deep dive into asynchronous messaging with Kafka, distributed tracing, resilient circuit breakers, and zero-downtime container deployments.',
        category: 'Engineering & Tech',
        instructor: 'Dr. Gregory Vance, Principal Architect',
        department: 'Engineering',
        duration: '16 Hours',
        startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 5),
        endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 20),
        status: 'In Progress',
        createdBy: empDavid._id,
        enrolledEmployees: [
          {
            employee: empAlex._id,
            enrolledAt: new Date(),
            progress: 65,
            status: 'In Progress',
          },
          {
            employee: empMarcus._id,
            enrolledAt: new Date(),
            progress: 80,
            status: 'In Progress',
          },
        ],
      },
      {
        title: 'Design Systems at Scale & Accessible UI Components',
        description:
          'Building token-based cross-platform design libraries, WCAG 2.1 AA compliance, and bridging designer-developer workflows.',
        category: 'Design & UI/UX',
        instructor: 'Elena Rostova, Design Principal',
        department: 'Product & Design',
        duration: '10 Hours',
        startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 10),
        endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 15),
        status: 'In Progress',
        createdBy: empDavid._id,
        enrolledEmployees: [
          {
            employee: empPriya._id,
            enrolledAt: new Date(),
            progress: 90,
            status: 'In Progress',
          },
          {
            employee: empAlex._id,
            enrolledAt: new Date(),
            progress: 40,
            status: 'In Progress',
          },
        ],
      },
      {
        title: 'Executive Leadership, Agile Coaching & People Management',
        description:
          'Core management frameworks, conducting effective 1-on-1s, psychological safety in high-performing teams, and conflict resolution.',
        category: 'Management & Leadership',
        instructor: 'Sarah Jenkins, VP of People',
        department: 'Human Resources',
        duration: '12 Hours',
        startDate: new Date(now.getFullYear(), now.getMonth() + 1, 1),
        endDate: new Date(now.getFullYear(), now.getMonth() + 1, 28),
        status: 'Upcoming',
        createdBy: empSarah._id,
        enrolledEmployees: [
          {
            employee: empDavid._id,
            enrolledAt: new Date(),
            progress: 0,
            status: 'Not Started',
          },
        ],
      },
      {
        title: 'Corporate Cybersecurity & SOC 2 Type II Security Essentials',
        description:
          'Mandatory annual data protection certification, phishing defense simulation, access token security, and secure coding guidelines.',
        category: 'Compliance & Security',
        instructor: 'Internal Security Operations Team',
        department: 'All',
        duration: '4 Hours',
        startDate: new Date(now.getFullYear(), now.getMonth() - 20, 1),
        endDate: new Date(now.getFullYear(), now.getMonth() - 5, 1),
        status: 'Completed',
        createdBy: empSarah._id,
        enrolledEmployees: [
          {
            employee: empAlex._id,
            enrolledAt: new Date(),
            progress: 100,
            status: 'Completed',
            completedAt: new Date(),
          },
          {
            employee: empEmily._id,
            enrolledAt: new Date(),
            progress: 100,
            status: 'Completed',
            completedAt: new Date(),
          },
        ],
      },
    ]);

    console.log('[Seeder] Database successfully populated with initial data!');
    console.log('------------------------------------------------------------');
    console.log('Demo Credentials:');
    console.log('  HR:       hr@staffsync.com        / password123');
    console.log('  Manager:  manager@staffsync.com   / password123');
    console.log('  Employee: alex.rivera@staffsync.com / password123');
    console.log('------------------------------------------------------------');
    process.exit(0);
  } catch (error) {
    console.error('[Seeder Error]:', error);
    process.exit(1);
  }
};

seedData();
