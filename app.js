// --- STATE MANAGEMENT ---
let state = {
  user: null, // { name, email, role }
  theme: 'dark',
  projects: [
    { id: 'p1', name: 'Website Redesign', desc: 'Revamp the corporate site with new branding.', color: '#7c3aed', due: '2026-06-01', status: 'active' },
    { id: 'p2', name: 'Mobile App V2', desc: 'Implement dark mode and new navigation.', color: '#3b82f6', due: '2026-07-15', status: 'active' }
  ],
  tasks: [
    { id: 't1', title: 'Design System', desc: 'Create base components.', projectId: 'p1', priority: 'high', status: 'todo', assignee: 'Admin', due: '2026-05-10' },
    { id: 't2', title: 'API Integration', desc: 'Connect frontend to backend.', projectId: 'p2', priority: 'medium', status: 'in-progress', assignee: 'Member', due: '2026-05-15' },
    { id: 't3', title: 'User Research', desc: 'Gather feedback on V1.', projectId: 'p1', priority: 'low', status: 'done', assignee: 'Admin', due: '2026-04-20' }
  ],
  team: [
    { name: 'Admin User', email: 'admin@taskflow.io', role: 'admin' },
    { name: 'Member User', email: 'member@taskflow.io', role: 'member' }
  ]
};

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
  initCursor();
  
  // Check local storage for theme
  const savedTheme = localStorage.getItem('tf-theme');
  if (savedTheme) {
    state.theme = savedTheme;
    document.documentElement.setAttribute('data-theme', savedTheme);
  }
});

// --- CUSTOM CURSOR (Anime.js & Vanilla) ---
function initCursor() {
  const cursor = document.getElementById('cursor');
  const follower = document.getElementById('cursorFollower');
  
  document.addEventListener('mousemove', (e) => {
    // Vanilla for dot (zero latency)
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
    
    // Anime.js for smooth follower
    anime({
      targets: follower,
      left: e.clientX,
      top: e.clientY,
      duration: 300,
      easing: 'easeOutExpo'
    });
  });
}

// --- AUTH LOGIC ---
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

function handleLogin() {
  const email = document.getElementById('loginEmail').value;
  const errorEl = document.getElementById('loginError');
  
  if (!email) {
    errorEl.textContent = 'Please enter an email address.';
    return;
  }
  
  let role = 'member';
  let name = 'User';
  if (email.includes('admin')) { role = 'admin'; name = 'Admin User'; }
  else if (email.includes('member')) { role = 'member'; name = 'Member User'; }
  
  state.user = { name, email, role };
  errorEl.textContent = '';
  
  loginSuccess();
}

function handleRegister() {
  const name = document.getElementById('regName').value;
  const email = document.getElementById('regEmail').value;
  const role = document.getElementById('regRole').value;
  const errorEl = document.getElementById('regError');
  
  if (!name || !email) {
    errorEl.textContent = 'Please fill all fields.';
    return;
  }
  
  state.user = { name, email, role };
  errorEl.textContent = '';
  
  loginSuccess();
}

function loginSuccess() {
  // Animate out auth overlay
  anime({
    targets: '#authOverlay',
    opacity: 0,
    duration: 500,
    easing: 'easeInOutQuad',
    complete: () => {
      document.getElementById('authOverlay').classList.add('hidden');
      document.getElementById('app').classList.remove('hidden');
      initApp();
      
      // Animate in app
      anime({
        targets: ['.sidebar', '.topbar', '.page'],
        translateY: [20, 0],
        opacity: [0, 1],
        delay: anime.stagger(100),
        duration: 800,
        easing: 'easeOutElastic(1, .8)'
      });
    }
  });
}

function logout() {
  state.user = null;
  document.getElementById('app').classList.add('hidden');
  document.getElementById('authOverlay').classList.remove('hidden');
  document.getElementById('authOverlay').style.opacity = 1;
  document.getElementById('loginEmail').value = '';
  document.getElementById('loginPassword').value = '';
}

// --- APP LOGIC ---
function initApp() {
  // Setup user UI
  document.getElementById('userName').textContent = state.user.name;
  document.getElementById('userAvatar').textContent = state.user.name.charAt(0);
  document.getElementById('userRoleBadge').textContent = state.user.role;
  
  // Hide/Show Admin features
  const adminEls = document.querySelectorAll('.admin-only');
  if (state.user.role === 'admin') {
    adminEls.forEach(el => el.classList.remove('hidden'));
  } else {
    adminEls.forEach(el => el.classList.add('hidden'));
  }
  
  updateBadges();
  renderDashboard();
}

// --- NAVIGATION ---
function navigate(pageId, navItem) {
  // Update nav active state
  if (navItem) {
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    navItem.classList.add('active');
  }
  
  // Hide all pages
  document.querySelectorAll('.page').forEach(page => page.classList.add('hidden'));
  
  // Show target page
  const target = document.getElementById(`page-${pageId}`);
  target.classList.remove('hidden');
  
  // Update Title
  const titles = { dashboard: 'Dashboard', projects: 'Projects', tasks: 'My Tasks', team: 'Team', analytics: 'Analytics' };
  document.getElementById('pageTitle').textContent = titles[pageId] || 'TaskFlow';
  
  // Page specific renders
  if (pageId === 'dashboard') renderDashboard();
  if (pageId === 'projects') renderProjects();
  if (pageId === 'tasks') renderKanban();
  if (pageId === 'team' && state.user.role === 'admin') renderTeam();
  
  // Animate page in
  anime({
    targets: target,
    opacity: [0, 1],
    translateY: [10, 0],
    duration: 500,
    easing: 'easeOutCubic'
  });
}

// --- THEME ---
function toggleTheme() {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', state.theme);
  localStorage.setItem('tf-theme', state.theme);
}

// --- RENDERING ---
function updateBadges() {
  document.getElementById('projectsBadge').textContent = state.projects.length;
  const myTasks = state.tasks.filter(t => t.assignee === state.user.name || state.user.role === 'admin').length;
  document.getElementById('tasksBadge').textContent = myTasks;
}

function renderDashboard() {
  // Stats
  document.getElementById('totalProjects').textContent = state.projects.length;
  document.getElementById('totalTasks').textContent = state.tasks.length;
  const completed = state.tasks.filter(t => t.status === 'done').length;
  document.getElementById('completedTasks').textContent = completed;
  
  const today = new Date().toISOString().split('T')[0];
  const overdue = state.tasks.filter(t => t.status !== 'done' && t.due < today).length;
  document.getElementById('overdueTasks').textContent = overdue;
  
  // Animate stats numbers
  anime({
    targets: '.stat-value',
    innerHTML: [0, function(el) { return el.textContent; }],
    round: 1,
    easing: 'easeOutExpo',
    duration: 1500
  });

  // Recent Tasks
  const list = document.getElementById('recentTasksList');
  list.innerHTML = '';
  const recent = [...state.tasks].reverse().slice(0, 4);
  
  recent.forEach((t, i) => {
    const item = document.createElement('div');
    item.className = 'task-list-item';
    item.innerHTML = `
      <div class="t-info">
        <span class="t-title">${t.title}</span>
        <div class="t-meta">
          <span>Due: ${t.due}</span> • <span>${t.assignee}</span>
        </div>
      </div>
      <span class="t-status s-${t.status}">${t.status.replace('-', ' ')}</span>
    `;
    list.appendChild(item);
  });
}

function renderProjects(filter = 'all') {
  const grid = document.getElementById('projectsGrid');
  grid.innerHTML = '';
  
  let projs = state.projects;
  if(filter !== 'all') projs = projs.filter(p => p.status === filter);
  
  projs.forEach(p => {
    const taskCount = state.tasks.filter(t => t.projectId === p.id).length;
    const card = document.createElement('div');
    card.className = 'project-card';
    card.innerHTML = `
      <div class="p-color-bar" style="background:${p.color}"></div>
      <div class="p-header">
        <span class="p-title">${p.name}</span>
      </div>
      <p class="p-desc">${p.desc}</p>
      <div class="p-meta">
        <span>${taskCount} Tasks</span>
        <span>Due: ${p.due}</span>
      </div>
    `;
    grid.appendChild(card);
  });
  
  anime({
    targets: '.project-card',
    opacity: [0, 1],
    scale: [0.95, 1],
    delay: anime.stagger(50),
    duration: 400,
    easing: 'easeOutQuad'
  });
}

function filterProjects(status, btn) {
  document.querySelectorAll('#page-projects .filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderProjects(status);
}

// --- KANBAN & DRAG DROP ---
function renderKanban(filter = 'all') {
  const cols = { 'todo': [], 'in-progress': [], 'done': [] };
  
  let tasksToRender = state.tasks;
  if(state.user.role !== 'admin') {
     tasksToRender = tasksToRender.filter(t => t.assignee === state.user.name);
  }
  
  // apply filter if needed (simplification: handled by specific views normally, we map all here)
  
  tasksToRender.forEach(t => {
    if(cols[t.status]) cols[t.status].push(t);
  });
  
  ['todo', 'in-progress', 'done'].forEach(status => {
    const col = document.getElementById(`col-${status}`);
    col.innerHTML = '';
    document.getElementById(`count-${status}`).textContent = cols[status].length;
    
    cols[status].forEach(t => {
      const proj = state.projects.find(p => p.id === t.projectId) || { color: '#ccc', name: 'Unknown' };
      const card = document.createElement('div');
      card.className = 'k-card';
      card.draggable = true;
      card.id = `task-${t.id}`;
      card.ondragstart = (e) => drag(e, t.id);
      
      card.innerHTML = `
        <div class="k-tags">
          <span class="k-tag" style="background:${proj.color}20; color:${proj.color}">${proj.name}</span>
          <span class="k-tag" style="background:var(--bg-tertiary); color:var(--text-secondary)">${t.priority}</span>
        </div>
        <div class="k-title">${t.title}</div>
        <div class="k-meta">
          <span>${t.due}</span>
          <div class="k-assignee" title="${t.assignee}">${t.assignee.charAt(0)}</div>
        </div>
      `;
      col.appendChild(card);
    });
  });
}

function filterTasks(status, btn) {
  document.querySelectorAll('#page-tasks .filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  // Simple re-render for now
  renderKanban();
}

function allowDrop(ev) {
  ev.preventDefault();
}

function drag(ev, taskId) {
  ev.dataTransfer.setData("text", taskId);
}

function dropTask(ev, newStatus) {
  ev.preventDefault();
  const taskId = ev.dataTransfer.getData("text");
  const task = state.tasks.find(t => t.id === taskId);
  if(task && task.status !== newStatus) {
    task.status = newStatus;
    renderKanban();
    renderDashboard();
    showToast(`Task moved to ${newStatus.replace('-', ' ')}`);
  }
}

// --- MODALS & FORMS ---
function openModal(id) {
  const overlay = document.getElementById(id);
  overlay.classList.remove('hidden');
}

function closeModal(id) {
  document.getElementById(id).classList.add('hidden');
}

function showToast(msg) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// Populate task form options
document.getElementById('quickAddBtn').onclick = openTaskModal;

function openTaskModal() {
  const pSelect = document.getElementById('taskProject');
  pSelect.innerHTML = state.projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
  
  const aSelect = document.getElementById('taskAssignee');
  aSelect.innerHTML = state.team.map(u => `<option value="${u.name}">${u.name}</option>`).join('');
  
  document.getElementById('taskTitle').value = '';
  document.getElementById('taskDesc').value = '';
  document.getElementById('taskDue').value = '';
  
  openModal('taskModalOverlay');
}

function saveTask() {
  const title = document.getElementById('taskTitle').value;
  if(!title) return showToast('Title required!');
  
  const newTask = {
    id: 't' + Date.now(),
    title,
    desc: document.getElementById('taskDesc').value,
    projectId: document.getElementById('taskProject').value,
    priority: document.getElementById('taskPriority').value,
    assignee: document.getElementById('taskAssignee').value,
    due: document.getElementById('taskDue').value || new Date().toISOString().split('T')[0],
    status: document.getElementById('taskStatus').value
  };
  
  state.tasks.push(newTask);
  updateBadges();
  renderKanban();
  renderDashboard();
  closeModal('taskModalOverlay');
  showToast('Task created successfully!');
}

function openProjectModal() {
  document.getElementById('projectName').value = '';
  document.getElementById('projectDesc').value = '';
  openModal('projectModalOverlay');
}

function saveProject() {
  const name = document.getElementById('projectName').value;
  if(!name) return showToast('Project name required!');
  
  state.projects.push({
    id: 'p' + Date.now(),
    name,
    desc: document.getElementById('projectDesc').value,
    color: document.getElementById('projectColor').value,
    due: document.getElementById('projectDue').value,
    status: 'active'
  });
  
  updateBadges();
  renderProjects();
  renderDashboard();
  closeModal('projectModalOverlay');
  showToast('Project created!');
}

function renderTeam() {
  const grid = document.getElementById('teamGrid');
  if(!grid) return;
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
