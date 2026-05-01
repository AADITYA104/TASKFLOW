require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// DB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/taskflow';
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('DB connected');
    seedDatabase();
  })
  .catch(err => console.error('DB error', err));

// Schemas
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

const User = mongoose.model('User', userSchema);
const Project = mongoose.model('Project', projectSchema);
const Task = mongoose.model('Task', taskSchema);

// Database Seed Logic
async function seedDatabase() {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Seeding initial data...');
      const salt = await bcrypt.genSalt(10);
      const adminPassword = await bcrypt.hash('admin123', salt);
      const memberPassword = await bcrypt.hash('member123', salt);

      const admin = await User.create({ name: 'Admin User', email: 'admin@taskflow.io', password: adminPassword, role: 'admin' });
      const member = await User.create({ name: 'Member User', email: 'member@taskflow.io', password: memberPassword, role: 'member' });

      const p1 = await Project.create({ name: 'Website Redesign', desc: 'Overhaul of our main landing page and dashboard.', color: '#ec4899', due: '2026-12-31' });
      const p2 = await Project.create({ name: 'Mobile App V2', desc: 'React Native mobile application launch.', color: '#3b82f6', due: '2026-10-15' });
      const p3 = await Project.create({ name: 'Marketing Campaign', desc: 'Q3 marketing materials and ads.', color: '#10b981', due: '2026-08-01' });
      const p4 = await Project.create({ name: 'Security Audit', desc: 'Comprehensive penetration testing and fixes.', color: '#f59e0b', due: '2026-06-30' });
      const p5 = await Project.create({ name: 'Cloud Migration', desc: 'Moving from local servers to AWS infrastructure.', color: '#8b5cf6', due: '2027-01-20' });

      await Task.create([
        { title: 'Design Mockups', desc: 'Create Figma designs for the new dashboard.', projectId: p1._id, priority: 'high', status: 'done', assignee: admin._id, due: '2026-06-01' },
        { title: 'Frontend Implementation', desc: 'Convert designs to React components.', projectId: p1._id, priority: 'high', status: 'in-progress', assignee: member._id, due: '2026-06-15' },
        { title: 'API Integration', desc: 'Connect frontend to the new GraphQL API.', projectId: p1._id, priority: 'medium', status: 'todo', assignee: member._id, due: '2026-07-01' },
        { title: 'Setup CI/CD', desc: 'Configure GitHub Actions for mobile app.', projectId: p2._id, priority: 'medium', status: 'done', assignee: admin._id, due: '2026-05-15' },
        { title: 'App Store Assets', desc: 'Design screenshots and icons for App Store.', projectId: p2._id, priority: 'low', status: 'todo', assignee: member._id, due: '2026-09-01' },
        { title: 'Push Notifications', desc: 'Integrate Firebase push notifications.', projectId: p2._id, priority: 'high', status: 'in-progress', assignee: admin._id, due: '2026-08-10' },
        { title: 'Ad Copywriting', desc: 'Write 5 variations of ad copy for Facebook.', projectId: p3._id, priority: 'medium', status: 'todo', assignee: member._id, due: '2026-07-15' },
        { title: 'Video Production', desc: 'Shoot promotional video for Q3.', projectId: p3._id, priority: 'high', status: 'in-progress', assignee: admin._id, due: '2026-07-20' },
        { title: 'Vulnerability Scan', desc: 'Run automated scanning tools.', projectId: p4._id, priority: 'high', status: 'done', assignee: admin._id, due: '2026-05-10' },
        { title: 'Patch Dependencies', desc: 'Update all npm packages to latest secure versions.', projectId: p4._id, priority: 'medium', status: 'todo', assignee: member._id, due: '2026-06-05' },
        { title: 'AWS Account Setup', desc: 'Create IAM roles and configure billing.', projectId: p5._id, priority: 'low', status: 'done', assignee: admin._id, due: '2026-04-30' },
        { title: 'Database Migration', desc: 'Export and import MongoDB data to Atlas.', projectId: p5._id, priority: 'high', status: 'todo', assignee: admin._id, due: '2026-11-15' },
      ]);
      console.log('Database seeded successfully.');
    }
  } catch (err) {
    console.error('Seeding error:', err);
  }
}

// Middleware
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ msg: 'No token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    req.user = decoded;
    next();
  } catch (e) {
    res.status(400).json({ msg: 'Invalid token' });
  }
};

const adminCheck = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Admin only' });
  next();
};

// Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User exists' });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    user = new User({ name, email, password: hash, role });
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role, name: user.name }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role, name: user.name }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

app.get('/api/users', auth, adminCheck, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

app.get('/api/projects', auth, async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

app.post('/api/projects', auth, adminCheck, async (req, res) => {
  try {
    const newProject = new Project(req.body);
    await newProject.save();
    res.json(newProject);
  } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

app.put('/api/projects/:id', auth, adminCheck, async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(project);
  } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

app.delete('/api/projects/:id', auth, adminCheck, async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    await Task.deleteMany({ projectId: req.params.id });
    res.json({ msg: 'Project deleted' });
  } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

app.get('/api/tasks', auth, async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== 'admin') {
      query.assignee = req.user.id;
    }
    const tasks = await Task.find(query).populate('projectId').populate('assignee', 'name email');
    res.json(tasks);
  } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

app.post('/api/tasks', auth, async (req, res) => {
  try {
    const task = new Task(req.body);
    await task.save();
    const populatedTask = await Task.findById(task._id).populate('projectId').populate('assignee', 'name email');
    res.json(populatedTask);
  } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

app.put('/api/tasks/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ msg: 'Task not found' });

    // Security fix: Only admin or the assigned user can update the task
    if (req.user.role !== 'admin' && task.assignee.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to update this task' });
    }

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('projectId')
      .populate('assignee', 'name email');
    res.json(updatedTask);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

app.delete('/api/tasks/:id', auth, adminCheck, async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Task deleted' });
  } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server on port ${PORT}`));
