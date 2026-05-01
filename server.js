require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

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

const activitySchema = new mongoose.Schema({
  action: { type: String, required: true },
  details: { type: String, required: true },
  user: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Project = mongoose.model('Project', projectSchema);
const Task = mongoose.model('Task', taskSchema);
const Activity = mongoose.model('Activity', activitySchema);

// Helper for Activity Logging
async function logActivity(action, details, user) {
  try {
    const act = await Activity.create({ action, details, user });
    io.emit('activityLogged', act);
  } catch (err) {
    console.error('Log error', err);
  }
}

// Database Seed Logic
async function seedDatabase() {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Seeding initial data...');
      const salt = await bcrypt.genSalt(10);
      
      const admin = await User.create({ name: 'Admin User', email: 'admin@taskflow.io', password: await bcrypt.hash('admin123', salt), role: 'admin' });
      const member = await User.create({ name: 'Team Member', email: 'member@taskflow.io', password: await bcrypt.hash('member123', salt), role: 'member' });

      const p1 = await Project.create({ name: 'Website Redesign', desc: 'Revamp the corporate website with the new brand guidelines.', color: '#6366f1', due: '2026-06-01' });
      const p2 = await Project.create({ name: 'Mobile App V2', desc: 'Develop the highly anticipated V2 for iOS and Android.', color: '#ec4899', due: '2026-07-15' });

      await Task.create([
        { title: 'Design System Update', desc: 'Update Figma tokens.', projectId: p1._id, assignee: admin._id, status: 'done', priority: 'high', due: '2026-05-10' },
        { title: 'Homepage Hero', desc: 'Build the new 3D animated hero.', projectId: p1._id, assignee: member._id, status: 'in-progress', priority: 'high', due: '2026-05-15' },
        { title: 'Auth Flow API', desc: 'Setup JWT endpoints.', projectId: p2._id, assignee: admin._id, status: 'todo', priority: 'medium', due: '2026-05-20' },
        { title: 'Push Notifications', desc: 'Integrate Firebase.', projectId: p2._id, assignee: member._id, status: 'todo', priority: 'high', due: '2026-06-05' }
      ]);
      
      await logActivity('system', 'Database seeded with initial data', 'System');
      console.log('Database seeded successfully.');
    }
  } catch (err) {
    console.error('Seed error', err);
  }
}

// Middleware
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ msg: 'No token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'taskflow_secure_123_local');
    req.user = decoded;
    next();
  } catch (e) {
    res.status(401).json({ msg: 'Invalid token' });
  }
};

const adminCheck = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Admin only' });
  next();
};

// --- ROUTES --- //

// Auth
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User exists' });
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    user = new User({ name, email, password: hash, role: role || 'member' });
    await user.save();
    
    await logActivity('user_joined', `New user registered: ${name}`, name);
    
    const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, process.env.JWT_SECRET || 'taskflow_secure_123_local');
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (e) { res.status(500).json({ msg: e.message }); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, process.env.JWT_SECRET || 'taskflow_secure_123_local');
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (e) { res.status(500).json({ msg: e.message }); }
});

// Users
app.get('/api/users', auth, adminCheck, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (e) { res.status(500).json({ msg: e.message }); }
});

// Projects
app.get('/api/projects', auth, async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (e) { res.status(500).json({ msg: e.message }); }
});

app.post('/api/projects', auth, adminCheck, async (req, res) => {
  try {
    const p = new Project(req.body);
    await p.save();
    await logActivity('project_created', `Project created: ${p.name}`, req.user.name);
    io.emit('dataChanged', { type: 'project' });
    res.json(p);
  } catch (e) { res.status(500).json({ msg: e.message }); }
});

app.put('/api/projects/:id', auth, adminCheck, async (req, res) => {
  try {
    const p = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!p) return res.status(404).json({ msg: 'Project not found' });
    await logActivity('project_created', `Project updated: ${p.name}`, req.user.name);
    io.emit('dataChanged', { type: 'project' });
    res.json(p);
  } catch (e) { res.status(500).json({ msg: e.message }); }
});

app.delete('/api/projects/:id', auth, adminCheck, async (req, res) => {
  try {
    const p = await Project.findByIdAndDelete(req.params.id);
    if (!p) return res.status(404).json({ msg: 'Project not found' });
    await logActivity('project_created', `Project deleted: ${p.name}`, req.user.name);
    io.emit('dataChanged', { type: 'project' });
    res.json({ msg: 'Project deleted' });
  } catch (e) { res.status(500).json({ msg: e.message }); }
});

// Tasks
app.get('/api/tasks', auth, async (req, res) => {
  try {
    const tasks = await Task.find().populate('projectId', 'name color').populate('assignee', 'name email');
    res.json(tasks);
  } catch (e) { res.status(500).json({ msg: e.message }); }
});

app.post('/api/tasks', auth, async (req, res) => {
  try {
    const t = new Task(req.body);
    await t.save();
    const populated = await Task.findById(t._id).populate('projectId', 'name color').populate('assignee', 'name email');
    await logActivity('task_created', `Task created: ${t.title}`, req.user.name);
    io.emit('dataChanged', { type: 'task' });
    res.json(populated);
  } catch (e) { res.status(500).json({ msg: e.message }); }
});

app.put('/api/tasks/:id', auth, async (req, res) => {
  try {
    const t = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!t) return res.status(404).json({ msg: 'Task not found' });
    await logActivity('task_updated', `Task updated: ${t.title} (Status: ${req.body.status || 'changed'})`, req.user.name);
    io.emit('dataChanged', { type: 'task' });
    res.json(t);
  } catch (e) { res.status(500).json({ msg: e.message }); }
});

app.delete('/api/tasks/:id', auth, adminCheck, async (req, res) => {
  try {
    const t = await Task.findByIdAndDelete(req.params.id);
    if(t) await logActivity('task_deleted', `Task deleted: ${t.title}`, req.user.name);
    io.emit('dataChanged', { type: 'task' });
    res.json({ msg: 'Deleted' });
  } catch (e) { res.status(500).json({ msg: e.message }); }
});

// Activities
app.get('/api/activities', auth, async (req, res) => {
  try {
    const logs = await Activity.find().sort({ createdAt: -1 }).limit(50);
    res.json(logs);
  } catch (e) { res.status(500).json({ msg: e.message }); }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  socket.on('disconnect', () => {});
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server on port ${PORT}`));
