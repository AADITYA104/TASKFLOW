require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/taskflow';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'member'], default: 'member' }
});

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  desc: String,
  color: { type: String, default: '#7c3aed' },
  due: String,
  status: { type: String, default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  desc: String,
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  status: { type: String, enum: ['todo', 'in-progress', 'done'], default: 'todo' },
  assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  due: String,
  createdAt: { type: Date, default: Date.now }
});

const Activity = mongoose.model('Activity', new mongoose.Schema({
  action: { type: String, required: true },
  details: { type: String, required: true },
  user: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}));

const User = mongoose.model('User', userSchema);
const Project = mongoose.model('Project', projectSchema);
const Task = mongoose.model('Task', taskSchema);

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to DB. Clearing old data...');
    await User.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});
    await Activity.deleteMany({});

    console.log('Inserting new data...');
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('admin123', salt);
    const mhash = await bcrypt.hash('member123', salt);

    const admin = await User.create({ name: 'Admin User', email: 'admin@taskflow.io', password: hash, role: 'admin' });
    const member1 = await User.create({ name: 'Team Member', email: 'member@taskflow.io', password: mhash, role: 'member' });
    const member2 = await User.create({ name: 'Alice Smith', email: 'alice@taskflow.io', password: mhash, role: 'member' });
    const member3 = await User.create({ name: 'Bob Johnson', email: 'bob@taskflow.io', password: mhash, role: 'member' });

    const p1 = await Project.create({ name: 'Website Redesign', desc: 'Revamp the corporate website with the new brand guidelines.', color: '#6366f1', due: '2026-06-01' });
    const p2 = await Project.create({ name: 'Mobile App V2', desc: 'Develop the highly anticipated V2 for iOS and Android.', color: '#ec4899', due: '2026-07-15' });
    const p3 = await Project.create({ name: 'Marketing Campaign Q3', desc: 'Social media strategy and ad creatives.', color: '#10b981', due: '2026-08-01' });

    const tasks = [
      { title: 'Design System Update', desc: 'Update Figma tokens.', projectId: p1._id, assignee: admin._id, status: 'done', priority: 'high', due: '2026-05-10' },
      { title: 'Homepage Hero', desc: 'Build the new 3D animated hero.', projectId: p1._id, assignee: member1._id, status: 'in-progress', priority: 'high', due: '2026-05-15' },
      { title: 'Auth Flow API', desc: 'Setup JWT endpoints.', projectId: p2._id, assignee: admin._id, status: 'todo', priority: 'medium', due: '2026-05-20' },
      { title: 'Push Notifications', desc: 'Integrate Firebase.', projectId: p2._id, assignee: member2._id, status: 'todo', priority: 'high', due: '2026-06-05' },
      { title: 'Offline Mode Sync', desc: 'Implement background sync.', projectId: p2._id, assignee: member3._id, status: 'in-progress', priority: 'medium', due: '2026-06-10' },
      { title: 'Copywriting for Ads', desc: 'Write ad copy for Facebook.', projectId: p3._id, assignee: member1._id, status: 'todo', priority: 'low', due: '2026-07-01' },
      { title: 'Video Editing', desc: 'Edit the promo video.', projectId: p3._id, assignee: member2._id, status: 'done', priority: 'medium', due: '2026-06-25' },
      { title: 'Landing Page SEO', desc: 'Optimize meta tags.', projectId: p1._id, assignee: member3._id, status: 'todo', priority: 'low', due: '2026-05-28' },
      { title: 'App Store Screenshots', desc: 'Create 5 mockup images.', projectId: p2._id, assignee: member1._id, status: 'todo', priority: 'medium', due: '2026-06-15' },
      { title: 'Budget Approval', desc: 'Finalize Q3 budget.', projectId: p3._id, assignee: admin._id, status: 'in-progress', priority: 'high', due: '2026-07-05' }
    ];

    await Task.insertMany(tasks);
    
    await Activity.create([
      { action: 'system', details: 'Database reset and seeded with initial data', user: 'System' },
      { action: 'project_created', details: 'Project created: Website Redesign', user: 'Admin User' },
      { action: 'task_created', details: 'Task created: Auth Flow API', user: 'Admin User' }
    ]);

    console.log('Seeding complete!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
