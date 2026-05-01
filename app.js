let state = {
  user: null,
  token: null,
  theme: 'dark',
  projects: [],
  tasks: [],
  team: []
};

const API_URL = '/api';

document.addEventListener('DOMContentLoaded', () => {
  initCursor();
  
  const savedTheme = localStorage.getItem('tf-theme');
  if (savedTheme) {
    state.theme = savedTheme;
    document.documentElement.setAttribute('data-theme', savedTheme);
  }

  const token = localStorage.getItem('tf-token');
  const user = localStorage.getItem('tf-user');
  
  if (token && user) {
    state.token = token;
    state.user = JSON.parse(user);
    loginSuccess();
  }
});

function initCursor() {
  const cursor = document.getElementById('cursor');
  const follower = document.getElementById('cursorFollower');
  
  if (!cursor || !follower) return;

  document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
    
    if (typeof anime !== 'undefined') {
      anime({
        targets: follower,
        left: e.clientX,
        top: e.clientY,
        duration: 300,
        easing: 'easeOutExpo'
      });
    }
  });
}

function fillDemo(email, pass) {
  document.getElementById('loginEmail').value = email;
  document.getElementById('loginPassword').value = pass;
}

function switchToRegister() {
  document.getElementById('loginForm').classList.add('hidden');
  document.getElementById('registerForm').classList.remove('hidden');
}

function switchToLogin() {
  document.getElementById('registerForm').classList.add('hidden');
  document.getElementById('loginForm').classList.remove('hidden');
}

async function apiCall(endpoint, method = 'GET', body = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (state.token) headers['Authorization'] = `Bearer ${state.token}`;
  
  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);
  
  const res = await fetch(`${API_URL}${endpoint}`, options);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.msg || 'API Error');
  }
  return res.json();
}

async function handleLogin() {
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  const errorEl = document.getElementById('loginError');
  
  if (!email || !password) {
    errorEl.textContent = 'Email and password required.';
    return;
  }
  
  try {
    const data = await apiCall('/auth/login', 'POST', { email, password });
    state.token = data.token;
    state.user = data.user;
    localStorage.setItem('tf-token', data.token);
    localStorage.setItem('tf-user', JSON.stringify(data.user));
    errorEl.textContent = '';
    loginSuccess();
  } catch (err) {
    errorEl.textContent = err.message;
  }
}

async function handleRegister() {
  const name = document.getElementById('regName').value;
  const email = document.getElementById('regEmail').value;
  const password = document.getElementById('regPassword').value;
  const role = document.getElementById('regRole').value;
  const errorEl = document.getElementById('regError');
  
  if (!name || !email || !password) {
    errorEl.textContent = 'All fields are required.';
    return;
  }
  
  try {
    const data = await apiCall('/auth/register', 'POST', { name, email, password, role });
    state.token = data.token;
    state.user = data.user;
    localStorage.setItem('tf-token', data.token);
    localStorage.setItem('tf-user', JSON.stringify(data.user));
    errorEl.textContent = '';
    loginSuccess();
  } catch (err) {
    errorEl.textContent = err.message;
  }
}

async function loginSuccess() {
  if (typeof anime !== 'undefined') {
    anime({
      targets: '#authOverlay',
      opacity: 0,
      duration: 500,
      easing: 'easeInOutQuad',
      complete: () => {
        document.getElementById('authOverlay').classList.add('hidden');
        document.getElementById('app').classList.remove('hidden');
        initApp();
      }
    });
  } else {
    document.getElementById('authOverlay').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
    initApp();
  }
}

function logout() {
  state.user = null;
  state.token = null;
  localStorage.removeItem('tf-token');
  localStorage.removeItem('tf-user');
  document.getElementById('app').classList.add('hidden');
  document.getElementById('authOverlay').classList.remove('hidden');
  document.getElementById('authOverlay').style.opacity = 1;
}

async function initApp() {
  document.getElementById('userName').textContent = state.user.name;
  document.getElementById('userAvatar').textContent = state.user.name.charAt(0);
  document.getElementById('userRoleBadge').textContent = state.user.role;
  
  const adminEls = document.querySelectorAll('.admin-only');
  if (state.user.role === 'admin') {
    adminEls.forEach(el => el.classList.remove('hidden'));
  } else {
    adminEls.forEach(el => el.classList.add('hidden'));
  }
  
  await loadData();
  renderDashboard();
}

async function loadData() {
  try {
    const [projects, tasks] = await Promise.all([
      apiCall('/projects'),
      apiCall('/tasks')
    ]);
    state.projects = projects;
    state.tasks = tasks;
    
    if (state.user.role === 'admin') {
      state.team = await apiCall('/users');
    }
    updateBadges();
  } catch (err) {
    showToast('Failed to load data');
    if (err.message === 'No token' || err.message === 'Invalid token') logout();
  }
}

function updateBadges() {
  document.getElementById('projectsBadge').textContent = state.projects.length;
  document.getElementById('tasksBadge').textContent = state.tasks.length;
}

function navigate(pageId, navItem) {
  if (navItem) {
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    navItem.classList.add('active');
  }
  
  document.querySelectorAll('.page').forEach(page => page.classList.add('hidden'));
  
  const target = document.getElementById(`page-${pageId}`);
  if (target) target.classList.remove('hidden');
  
  const titles = { dashboard: 'Dashboard', projects: 'Projects', tasks: 'My Tasks', team: 'Team', analytics: 'Analytics' };
  document.getElementById('pageTitle').textContent = titles[pageId] || 'TaskFlow';
  
  if (pageId === 'dashboard') renderDashboard();
  if (pageId === 'projects') renderProjects();
  if (pageId === 'tasks') renderKanban();
  if (pageId === 'team' && state.user.role === 'admin') renderTeam();
  
  if (typeof anime !== 'undefined' && target) {
    anime({
      targets: target,
      opacity: [0, 1],
      translateY: [10, 0],
      duration: 500,
      easing: 'easeOutCubic'
    });
  }
}

function toggleTheme() {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', state.theme);
  localStorage.setItem('tf-theme', state.theme);
}

function renderDashboard() {
  document.getElementById('totalProjects').textContent = state.projects.length;
  document.getElementById('totalTasks').textContent = state.tasks.length;
  
  const completed = state.tasks.filter(t => t.status === 'done').length;
  document.getElementById('completedTasks').textContent = completed;
  
  const today = new Date().toISOString().split('T')[0];
  const overdue = state.tasks.filter(t => t.status !== 'done' && t.due < today).length;
  document.getElementById('overdueTasks').textContent = overdue;

  const list = document.getElementById('recentTasksList');
  if (!list) return;
  list.innerHTML = '';
  
  const recent = [...state.tasks].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4);
  
  recent.forEach((t) => {
    const item = document.createElement('div');
    item.className = 'task-list-item';
    const assigneeName = t.assignee ? t.assignee.name : 'Unassigned';
    
    item.innerHTML = `
      <div class="t-info">
        <span class="t-title">${t.title}</span>
        <div class="t-meta">
          <span>Due: ${t.due || 'No date'}</span> • <span>${assigneeName}</span>
        </div>
      </div>
      <span class="t-status s-${t.status}">${t.status.replace('-', ' ')}</span>
    `;
    list.appendChild(item);
  });
}

function renderProjects(filter = 'all') {
  const grid = document.getElementById('projectsGrid');
  if (!grid) return;
  grid.innerHTML = '';
  
  let projs = state.projects;
  if(filter !== 'all') projs = projs.filter(p => p.status === filter);
  
  projs.forEach(p => {
    const taskCount = state.tasks.filter(t => t.projectId && t.projectId._id === p._id).length;
    const card = document.createElement('div');
    card.className = 'project-card';
    card.innerHTML = `
      <div class="p-color-bar" style="background:${p.color}"></div>
      <div class="p-header">
        <span class="p-title">${p.name}</span>
      </div>
      <p class="p-desc">${p.desc || ''}</p>
      <div class="p-meta">
        <span>${taskCount} Tasks</span>
        <span>Due: ${p.due || 'No date'}</span>
      </div>
    `;
    grid.appendChild(card);
  });
}

function filterProjects(status, btn) {
  document.querySelectorAll('#page-projects .filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderProjects(status);
}

function renderKanban() {
  const cols = { 'todo': [], 'in-progress': [], 'done': [] };
  
  state.tasks.forEach(t => {
    if(cols[t.status]) cols[t.status].push(t);
  });
  
  ['todo', 'in-progress', 'done'].forEach(status => {
    const col = document.getElementById(`col-${status}`);
    if (!col) return;
    col.innerHTML = '';
    document.getElementById(`count-${status}`).textContent = cols[status].length;
    
    cols[status].forEach(t => {
      const proj = t.projectId || { color: '#ccc', name: 'General' };
      const card = document.createElement('div');
      card.className = 'k-card';
      card.draggable = true;
      card.id = `task-${t._id}`;
      card.ondragstart = (e) => drag(e, t._id);
      
      const assigneeName = t.assignee ? t.assignee.name.charAt(0) : '?';
      
      card.innerHTML = `
        <div class="k-tags">
          <span class="k-tag" style="background:${proj.color}20; color:${proj.color}">${proj.name}</span>
          <span class="k-tag" style="background:var(--bg-tertiary); color:var(--text-secondary)">${t.priority}</span>
        </div>
        <div class="k-title">${t.title}</div>
        <div class="k-meta">
          <span>${t.due || ''}</span>
          <div class="k-assignee" title="${t.assignee ? t.assignee.name : 'Unassigned'}">${assigneeName}</div>
        </div>
      `;
      col.appendChild(card);
    });
  });
}

function filterTasks(status, btn) {
  document.querySelectorAll('#page-tasks .filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderKanban();
}

function allowDrop(ev) {
  ev.preventDefault();
}

function drag(ev, taskId) {
  ev.dataTransfer.setData("text", taskId);
}

async function dropTask(ev, newStatus) {
  ev.preventDefault();
  const taskId = ev.dataTransfer.getData("text");
  const task = state.tasks.find(t => t._id === taskId);
  
  if (task && task.status !== newStatus) {
    const oldStatus = task.status;
    task.status = newStatus;
    renderKanban(); 
    
    try {
      await apiCall(`/tasks/${taskId}`, 'PUT', { status: newStatus });
      renderDashboard();
    } catch (err) {
      task.status = oldStatus; 
      renderKanban();
      showToast('Error updating task');
    }
  }
}

function openModal(id) {
  const overlay = document.getElementById(id);
  if (overlay) overlay.classList.remove('hidden');
}

function closeModal(id) {
  const overlay = document.getElementById(id);
  if (overlay) overlay.classList.add('hidden');
}

function showToast(msg) {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

async function openTaskModal() {
  const pSelect = document.getElementById('taskProject');
  pSelect.innerHTML = state.projects.map(p => `<option value="${p._id}">${p.name}</option>`).join('');
  
  const aSelect = document.getElementById('taskAssignee');
  if (state.user.role === 'admin' && state.team.length > 0) {
    aSelect.innerHTML = state.team.map(u => `<option value="${u._id}">${u.name}</option>`).join('');
  } else {
    aSelect.innerHTML = `<option value="${state.user.id}">${state.user.name}</option>`;
  }
  
  document.getElementById('taskTitle').value = '';
  document.getElementById('taskDesc').value = '';
  document.getElementById('taskDue').value = '';
  
  openModal('taskModalOverlay');
}

async function saveTask() {
  const title = document.getElementById('taskTitle').value;
  if (!title) return showToast('Title required!');
  
  const payload = {
    title,
    desc: document.getElementById('taskDesc').value,
    projectId: document.getElementById('taskProject').value,
    priority: document.getElementById('taskPriority').value,
    assignee: document.getElementById('taskAssignee').value,
    due: document.getElementById('taskDue').value,
    status: document.getElementById('taskStatus').value
  };
  
  try {
    const newTask = await apiCall('/tasks', 'POST', payload);
    state.tasks.push(newTask);
    updateBadges();
    renderKanban();
    renderDashboard();
    closeModal('taskModalOverlay');
    showToast('Task created!');
  } catch (err) {
    showToast(err.message);
  }
}

function openProjectModal() {
  document.getElementById('projectName').value = '';
  document.getElementById('projectDesc').value = '';
  openModal('projectModalOverlay');
}

async function saveProject() {
  const name = document.getElementById('projectName').value;
  if (!name) return showToast('Project name required!');
  
  const payload = {
    name,
    desc: document.getElementById('projectDesc').value,
    color: document.getElementById('projectColor').value,
    due: document.getElementById('projectDue').value
  };
  
  try {
    const newProj = await apiCall('/projects', 'POST', payload);
    state.projects.push(newProj);
    updateBadges();
    renderProjects();
    renderDashboard();
    closeModal('projectModalOverlay');
    showToast('Project created!');
  } catch (err) {
    showToast(err.message);
  }
}

function renderTeam() {
  const grid = document.getElementById('teamGrid');
  if (!grid || !state.team) return;
  grid.innerHTML = state.team.map(u => `
    <div class="dash-card">
      <div class="user-card">
        <div class="user-avatar" style="width:48px;height:48px;font-size:1.2rem">${u.name.charAt(0)}</div>
        <div class="user-info">
          <span class="user-name" style="font-size:1rem">${u.name}</span>
          <span class="user-role">${u.role}</span>
          <span style="font-size:0.75rem;color:var(--text-tertiary)">${u.email}</span>
        </div>
      </div>
    </div>
  `).join('');
}
