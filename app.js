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
  initThreeJSBg();
  initRipples();
  
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

// init threejs bg
let bgScene, bgCamera, bgRenderer, bgParticles;
function initThreeJSBg() {
  const canvas = document.getElementById('bgCanvas');
  if (!canvas || typeof THREE === 'undefined') return;

  bgScene = new THREE.Scene();
  bgCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  bgRenderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  bgRenderer.setSize(window.innerWidth, window.innerHeight);

  const geometry = new THREE.BufferGeometry();
  const particlesCount = 300;
  const posArray = new Float32Array(particlesCount * 3);

  for(let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 10;
  }
  
  geometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
  const material = new THREE.PointsMaterial({ size: 0.05, color: 0x7c3aed, transparent: true, opacity: 0.6 });
  
  bgParticles = new THREE.Points(geometry, material);
  bgScene.add(bgParticles);
  bgCamera.position.z = 3;

  function animate() {
    requestAnimationFrame(animate);
    bgParticles.rotation.y += 0.003;
    bgParticles.rotation.x += 0.0015;
    bgRenderer.render(bgScene, bgCamera);
  }
  animate();

  window.addEventListener('resize', () => {
    bgCamera.aspect = window.innerWidth / window.innerHeight;
    bgCamera.updateProjectionMatrix();
    bgRenderer.setSize(window.innerWidth, window.innerHeight);
  });
}

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

function initRipples() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-primary, .btn-secondary, .login-btn, .k-card, .project-card, .stat-card');
    if (!btn) return;
    
    const circle = document.createElement("span");
    circle.classList.add("ripple-circle");
    
    const rect = btn.getBoundingClientRect();
    const diameter = Math.max(rect.width, rect.height);
    
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${e.clientX - rect.left - diameter / 2}px`;
    circle.style.top = `${e.clientY - rect.top - diameter / 2}px`;
    
    // Ensure the button has relative positioning and hidden overflow
    if (getComputedStyle(btn).position === 'static') {
      btn.style.position = 'relative';
    }
    btn.style.overflow = 'hidden';
    
    btn.appendChild(circle);
    setTimeout(() => circle.remove(), 500);
  });
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

function loginSuccess() {
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
  document.getElementById('userAvatar').textContent = state.user.name.charAt(0).toUpperCase();
  document.getElementById('userRoleBadge').textContent = state.user.role;
  
  const adminEls = document.querySelectorAll('.admin-only');
  if (state.user.role === 'admin') {
    adminEls.forEach(el => el.classList.remove('hidden'));
  } else {
    adminEls.forEach(el => el.classList.add('hidden'));
  }

  // Wire up quick add button
  const quickAddBtn = document.getElementById('quickAddBtn');
  if (quickAddBtn) {
    quickAddBtn.onclick = () => openTaskModal();
  }

  // Ensure dashboard is visible
  const dashPage = document.getElementById('page-dashboard');
  if (dashPage) dashPage.style.opacity = '1';
  
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
    
    // Server already filters for Member vs Admin, but just in case we enforce frontend filter
    if (state.user.role === 'admin') {
      state.tasks = tasks;
      state.team = await apiCall('/users');
    } else {
      state.tasks = tasks.filter(t => t.assignee && t.assignee._id === state.user.id);
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
  if (target) {
    target.classList.remove('hidden');
    if (typeof anime !== 'undefined') {
      anime({
        targets: target,
        rotateX: [10, 0],
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 600,
        easing: 'easeOutElastic(1, .8)'
      });
    }
  }
  
  const titles = { dashboard: 'Dashboard', projects: 'Projects', tasks: 'My Tasks', team: 'Team', analytics: 'Analytics' };
  document.getElementById('pageTitle').textContent = titles[pageId] || 'TaskFlow';
  
  if (pageId === 'dashboard') renderDashboard();
  if (pageId === 'projects') renderProjects();
  if (pageId === 'tasks') renderKanban();
  if (pageId === 'team' && state.user.role === 'admin') renderTeam();
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
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const overdue = state.tasks.filter(t => {
    if (t.status === 'done' || !t.due) return false;
    return new Date(t.due) < today;
  }).length;
  document.getElementById('overdueTasks').textContent = overdue;

  if (typeof anime !== 'undefined') {
    anime({
      targets: '.stat-value',
      innerHTML: [0, function(el) { return parseInt(el.textContent) || 0; }],
      round: 1,
      easing: 'easeOutExpo',
      duration: 1500
    });
  }

  const list = document.getElementById('recentTasksList');
  if (!list) return;
  list.innerHTML = '';
  
  if (state.tasks.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
        <h3>No tasks yet</h3>
        <p>Create your first task to get started.</p>
      </div>`;
  } else {
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

  // Render Dashboard Chart
  const ctx = document.getElementById('statusChart');
  if (ctx && typeof Chart !== 'undefined') {
    if (window.statusChartInstance) {
      window.statusChartInstance.destroy();
    }
    const todo = state.tasks.filter(t => t.status === 'todo').length;
    const inProgress = state.tasks.filter(t => t.status === 'in-progress').length;
    const done = state.tasks.filter(t => t.status === 'done').length;

    window.statusChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['To Do', 'In Progress', 'Done'],
        datasets: [{
          data: [todo, inProgress, done],
          backgroundColor: ['#4b5563', '#3b82f6', '#10b981'],
          borderWidth: 0,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom', labels: { color: state.theme === 'dark' ? '#fff' : '#000' } }
        }
      }
    });
  }
}

function renderProjects(filter = 'all') {
  const grid = document.getElementById('projectsGrid');
  if (!grid) return;
  grid.innerHTML = '';
  
  let projs = state.projects;
  if(filter !== 'all') projs = projs.filter(p => p.status === filter);
  
  if (projs.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 6a2 2 0 012-2h5l2 2h9a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/></svg>
        <h3>No projects found</h3>
        <p>Create a new project to organize your team's work.</p>
      </div>`;
    return;
  }

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

function renderKanban(filter = 'all') {
  const cols = { 'todo': [], 'in-progress': [], 'done': [] };
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  state.tasks.forEach(t => {
    let show = false;
    if (filter === 'all') show = true;
    else if (filter === 'overdue') show = t.status !== 'done' && t.due && new Date(t.due) < today;
    else if (t.status === filter) show = true;

    if (show && cols[t.status]) cols[t.status].push(t);
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
      
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = ((y - centerY) / centerY) * -25;
        const rotateY = ((x - centerX) / centerX) * 25;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
      });

      const assigneeName = t.assignee ? t.assignee.name.charAt(0).toUpperCase() : '?';
      
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
  renderKanban(status);
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
    
    if (newStatus === 'done' && typeof confetti !== 'undefined') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#7c3aed', '#10b981', '#3b82f6']
      });
    }

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
  // Load real team members into dropdown
  if (state.user.role === 'admin' && state.team.length > 0) {
    aSelect.innerHTML = state.team.map(u => `<option value="${u._id}">${u.name}</option>`).join('');
  } else {
    // If team is not loaded, try to fetch it
    try {
      if (state.user.role === 'admin') {
        state.team = await apiCall('/users');
        aSelect.innerHTML = state.team.map(u => `<option value="${u._id}">${u.name}</option>`).join('');
      } else {
        aSelect.innerHTML = `<option value="${state.user.id}">${state.user.name}</option>`;
      }
    } catch(e) {
      aSelect.innerHTML = `<option value="${state.user.id}">${state.user.name}</option>`;
    }
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
        <div class="user-avatar" style="width:48px;height:48px;font-size:1.2rem">${u.name.charAt(0).toUpperCase()}</div>
        <div class="user-info">
          <span class="user-name" style="font-size:1rem">${u.name}</span>
          <span class="user-role">${u.role}</span>
          <span style="font-size:0.75rem;color:var(--text-tertiary)">${u.email}</span>
        </div>
      </div>
    </div>
  `).join('');
}

function openInviteModal() {
  document.getElementById('inviteName').value = '';
  document.getElementById('inviteEmail').value = '';
  document.getElementById('invitePassword').value = 'Welcome123';
  openModal('inviteModalOverlay');
}

async function sendInvite() {
  const name = document.getElementById('inviteName').value;
  const email = document.getElementById('inviteEmail').value;
  const password = document.getElementById('invitePassword').value;
  const role = document.getElementById('inviteRole').value;
  
  if (!name || !email || !password) return showToast('All fields required!');
  
  try {
    // Calling the register API to create a new user from Admin panel
    await apiCall('/auth/register', 'POST', { name, email, password, role });
    
    // Refresh team list
    state.team = await apiCall('/users');
    renderTeam();
    
    closeModal('inviteModalOverlay');
    showToast(`Successfully invited ${name} as ${role}!`);
  } catch (err) {
    if (err.message === 'User exists') {
      showToast('A user with that email already exists.');
    } else {
      showToast('Error inviting member: ' + err.message);
    }
  }
}

function fillDemo(email, password) {
  document.getElementById('loginEmail').value = email;
  document.getElementById('loginPassword').value = password;
  handleLogin();
}
