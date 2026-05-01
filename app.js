let state = { user: null, token: null, theme: 'dark', projects: [], tasks: [], team: [], activities: [] };
const API = '/api';
let socket;

document.addEventListener('DOMContentLoaded', () => {
  initBgCanvas();
  const t = localStorage.getItem('tf-theme');
  if (t) { state.theme = t; document.documentElement.setAttribute('data-theme', t); }
  const token = localStorage.getItem('tf-token'), user = localStorage.getItem('tf-user');
  if (token && user) { state.token = token; state.user = JSON.parse(user); loginSuccess(); }
  initKeyboardShortcuts();
});

function initBgCanvas() {
  const c = document.getElementById('bgCanvas');
  if (!c) return;
  const ctx = c.getContext('2d');
  let w, h, particles = [];
  function resize() { w = c.width = window.innerWidth; h = c.height = window.innerHeight; }
  resize(); window.addEventListener('resize', resize);
  for (let i = 0; i < 80; i++) particles.push({ x: Math.random()*w, y: Math.random()*h, r: Math.random()*2+1, dx: (Math.random()-.5)*.4, dy: (Math.random()-.5)*.4, o: Math.random()*.5+.2 });
  (function draw() {
    requestAnimationFrame(draw);
    ctx.clearRect(0,0,w,h);
    particles.forEach(p => {
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fillStyle=`rgba(139,92,246,${p.o})`; ctx.fill();
      p.x+=p.dx; p.y+=p.dy;
      if(p.x<0||p.x>w) p.dx*=-1; if(p.y<0||p.y>h) p.dy*=-1;
    });
    for(let i=0;i<particles.length;i++) for(let j=i+1;j<particles.length;j++){
      const dx=particles[i].x-particles[j].x, dy=particles[i].y-particles[j].y, d=Math.sqrt(dx*dx+dy*dy);
      if(d<120){ctx.beginPath();ctx.moveTo(particles[i].x,particles[i].y);ctx.lineTo(particles[j].x,particles[j].y);ctx.strokeStyle=`rgba(139,92,246,${.08*(1-d/120)})`;ctx.stroke();}
    }
  })();
}

function initSocket() {
  if (typeof io !== 'undefined') {
    socket = io();
    socket.on('dataChanged', (data) => {
      console.log('Real-time update:', data);
      refreshData();
    });
    socket.on('activityLogged', (activity) => {
      state.activities.unshift(activity);
      if (document.getElementById('page-activity').classList.contains('active')) renderActivityLog();
      showToast(`Activity: ${activity.details}`);
    });
  }
}

async function refreshData() {
  try {
    state.projects = await apiCall('/projects');
    state.tasks = await apiCall('/tasks');
    if (state.user.role === 'admin') state.team = await apiCall('/users');
    renderDashboard();
    renderKanban();
    renderTasks();
    if (state.user.role === 'admin') { renderTeam(); renderAnalytics(); }
    updateBadges();
  } catch (e) { console.error('Refresh error', e); }
}

function initKeyboardShortcuts() {
  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      openCommandPalette();
    }
    if (e.key === 'Escape') {
      closeModal('cmdPaletteOverlay');
    }
  });
}

function openCommandPalette() {
  const overlay = document.getElementById('cmdPaletteOverlay');
  overlay.classList.remove('hidden');
  const input = document.getElementById('cmdInput');
  input.value = '';
  input.focus();
  handleCmdSearch('');
}

function handleCmdSearch(query) {
  const items = document.getElementById('cmdTaskItems');
  const taskRes = document.getElementById('cmdTaskResults');
  if (!query) {
    taskRes.style.display = 'none';
    return;
  }
  const filtered = state.tasks.filter(t => t.title.toLowerCase().includes(query.toLowerCase())).slice(0, 5);
  if (filtered.length > 0) {
    taskRes.style.display = 'block';
    items.innerHTML = filtered.map(t => `
      <div class="cmd-item" onclick="viewTaskDetails('${t._id}')">
        <svg viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
        <span>${t.title} <small style="color:var(--text-tertiary)">— ${t.projectId ? t.projectId.name : 'No Project'}</small></span>
      </div>
    `).join('');
  } else {
    taskRes.style.display = 'none';
  }
}

function viewTaskDetails(id) {
  closeModal('cmdPaletteOverlay');
  const task = state.tasks.find(t => t._id === id);
  if (task) {
    // Open task modal for editing/viewing
    openTaskModal(task);
  }
}

async function renderActivityLog() {
  try {
    const list = document.getElementById('activityList');
    if (!state.activities.length) state.activities = await apiCall('/activities');
    
    if (state.activities.length === 0) {
      list.innerHTML = '<div class="empty-state">No activities logged yet.</div>';
      return;
    }

    list.innerHTML = state.activities.map(a => `
      <div class="activity-item">
        <div class="act-icon">${getActIcon(a.action)}</div>
        <div class="act-content">
          <div class="act-title">${a.user}</div>
          <div class="act-details">${a.details}</div>
          <div class="act-meta">
            <span>${new Date(a.createdAt).toLocaleString()}</span>
          </div>
        </div>
      </div>
    `).join('');
  } catch (e) { console.error(e); }
}

function getActIcon(action) {
  const icons = {
    'task_created': '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
    'task_updated': '<svg viewBox="0 0 24 24"><path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"/><polygon points="18 2 22 6 12 16 8 16 8 12 18 2"/></svg>',
    'task_deleted': '<svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
    'project_created': '<svg viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>',
    'user_joined': '<svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>',
    'system': '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>'
  };
  return icons[action] || icons['system'];
}

function switchToRegister() { document.getElementById('loginForm').classList.add('hidden'); document.getElementById('registerForm').classList.remove('hidden'); }
function switchToLogin() { document.getElementById('registerForm').classList.add('hidden'); document.getElementById('loginForm').classList.remove('hidden'); }

async function apiCall(ep, method='GET', body=null) {
  const h = { 'Content-Type':'application/json' };
  if (state.token) h['Authorization'] = `Bearer ${state.token}`;
  const opts = { method, headers: h };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${ep.startsWith('/api') ? ep : API + ep}`, opts);
  if (!res.ok) { const e = await res.json(); throw new Error(e.msg || 'API Error'); }
  return res.json();
}

async function handleLogin() {
  const email = document.getElementById('loginEmail').value, pw = document.getElementById('loginPassword').value, err = document.getElementById('loginError');
  if (!email || !pw) { err.textContent = 'Email and password required.'; return; }
  try {
    const d = await apiCall('/auth/login','POST',{email,password:pw});
    state.token=d.token; state.user=d.user;
    localStorage.setItem('tf-token',d.token); localStorage.setItem('tf-user',JSON.stringify(d.user));
    err.textContent=''; loginSuccess();
  } catch(e) { err.textContent=e.message; }
}

async function handleRegister() {
  const name=document.getElementById('regName').value, email=document.getElementById('regEmail').value, pw=document.getElementById('regPassword').value, role=document.getElementById('regRole').value, err=document.getElementById('regError');
  if(!name||!email||!pw){err.textContent='All fields required.';return;}
  try {
    const d=await apiCall('/auth/register','POST',{name,email,password:pw,role});
    state.token=d.token;state.user=d.user;
    localStorage.setItem('tf-token',d.token);localStorage.setItem('tf-user',JSON.stringify(d.user));
    err.textContent='';loginSuccess();
  } catch(e){err.textContent=e.message;}
}

function fillDemo(email, pw) {
  document.getElementById('loginEmail').value = email;
  document.getElementById('loginPassword').value = pw;
  handleLogin();
}

function loginSuccess() {
  const overlay = document.getElementById('authOverlay');
  overlay.style.transition = 'opacity .5s';
  overlay.style.opacity = '0';
  setTimeout(() => { 
    overlay.classList.add('hidden'); 
    document.getElementById('app').classList.remove('hidden'); 
    initApp(); 
    initSocket();
  }, 500);
}

function logout() {
  state.user=null;state.token=null;
  localStorage.removeItem('tf-token');localStorage.removeItem('tf-user');
  document.getElementById('app').classList.add('hidden');
  const o=document.getElementById('authOverlay');o.classList.remove('hidden');o.style.opacity='1';
}

async function initApp() {
  document.getElementById('userName').textContent=state.user.name;
  document.getElementById('userAvatar').textContent=state.user.name.charAt(0).toUpperCase();
  document.getElementById('userRoleBadge').textContent=state.user.role;
  const adminEls=document.querySelectorAll('.admin-only');
  if(state.user.role==='admin') adminEls.forEach(el=>el.classList.remove('hidden'));
  else adminEls.forEach(el=>el.classList.add('hidden'));
  
  await refreshData();
}

function navigate(page, el) {
  document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
  if (el) el.classList.add('active');
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  const target = document.getElementById(`page-${page}`);
  target.classList.remove('hidden');
  target.classList.add('active');
  
  const titles = { 'dashboard':'Dashboard', 'projects':'Projects', 'tasks':'My Tasks', 'team':'Team Management', 'analytics':'Analytics', 'activity':'Activity Log' };
  document.getElementById('pageTitle').textContent = titles[page] || 'TaskFlow';
  document.getElementById('breadcrumb').textContent = `Workspace / ${titles[page]}`;

  if (page === 'activity') renderActivityLog();
}

function updateBadges() {
  document.getElementById('projectsBadge').textContent = state.projects.length;
  document.getElementById('tasksBadge').textContent = state.tasks.filter(t => t.status !== 'done').length;
}

function renderDashboard() {
  document.getElementById('stat-projects').textContent = state.projects.length;
  document.getElementById('stat-tasks').textContent = state.tasks.length;
  document.getElementById('stat-team').textContent = state.team.length || 1;
  document.getElementById('stat-due').textContent = state.tasks.filter(t => t.status !== 'done').length;

  const recent = [...state.tasks].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
  const list = document.getElementById('recentTasksList');
  if (recent.length === 0) { list.innerHTML = '<div class="empty-state">No tasks yet.</div>'; return; }
  list.innerHTML = recent.map(t => `
    <div class="task-list-item" onclick="openTaskModal(${JSON.stringify(t).replace(/"/g, '&quot;')})">
      <div class="t-main">
        <div class="t-title">${t.title}</div>
        <div class="t-meta">
          <span style="color:${t.projectId?.color || 'var(--text-tertiary)'}">● ${t.projectId?.name || 'No Project'}</span>
          <span>Due: ${t.due || 'No date'}</span>
        </div>
      </div>
      <div class="t-status" style="border-color:${getStatusColor(t.status)}; color:${getStatusColor(t.status)}">${t.status}</div>
    </div>
  `).join('');
}

function renderKanban() {
  const cols = ['todo', 'in-progress', 'done'];
  cols.forEach(status => {
    const colTasks = state.tasks.filter(t => t.status === status);
    document.getElementById(`count-${status}`).textContent = colTasks.length;
    const container = document.getElementById(`col-${status}`);
    if (colTasks.length === 0) { container.innerHTML = '<div style="padding:20px; text-align:center; color:var(--text-tertiary); font-size:0.8rem;">Drop tasks here</div>'; return; }
    container.innerHTML = colTasks.map(t => `
      <div class="k-card" draggable="true" ondragstart="dragTask(event, '${t._id}')" onclick="openTaskModal(${JSON.stringify(t).replace(/"/g, '&quot;')})" id="task-${t._id}">
        <div class="k-title">${t.title}</div>
        <div class="k-tags"><span class="k-tag" style="border-color:${getPriorityColor(t.priority)}; color:${getPriorityColor(t.priority)}">${t.priority}</span></div>
        <div class="k-meta">
          <span>${t.projectId?.name || ''}</span>
          <div class="k-assignee" title="${t.assignee?.name || 'Unassigned'}">${(t.assignee?.name || '?').charAt(0)}</div>
        </div>
      </div>
    `).join('');
  });
}

function renderTasks() {
  const list = document.getElementById('taskListContainer');
  if (!list) return;
  if (state.tasks.length === 0) { list.innerHTML = '<div class="empty-state">No tasks yet. Create one above.</div>'; return; }
  list.innerHTML = state.tasks.map(t => `
    <div class="task-list-item" onclick="openTaskModal(${JSON.stringify(t).replace(/"/g, '&quot;')})">
      <div class="t-main">
        <div class="t-title">${t.title}</div>
        <div class="t-meta">
          <span style="color:${t.projectId?.color || 'var(--text-tertiary)'}">● ${t.projectId?.name || 'No Project'}</span>
          <span>Due: ${t.due || 'No date'}</span>
          <span style="color:var(--text-tertiary)">Assignee: ${t.assignee?.name || 'Unassigned'}</span>
        </div>
      </div>
      <div class="t-status" style="border-color:${getStatusColor(t.status)}; color:${getStatusColor(t.status)}">${t.status}</div>
    </div>
  `).join('');
}

function renderTeam() {
  const grid = document.getElementById('teamGrid');
  grid.innerHTML = state.team.map(u => `
    <div class="stat-card">
      <div class="user-avatar" style="width:48px; height:48px; font-size:1.2rem;">${u.name.charAt(0)}</div>
      <div class="user-info">
        <div class="user-name">${u.name}</div>
        <div class="user-role">${u.role}</div>
        <div style="font-size:0.75rem; color:var(--text-tertiary)">${u.email}</div>
      </div>
    </div>
  `).join('');
}

function renderAnalytics() {
  const ctx = document.getElementById('analyticsChart');
  if (!ctx) return;
  const counts = { todo: 0, 'in-progress': 0, done: 0 };
  state.tasks.forEach(t => counts[t.status]++);
  
  if (window.myChart) window.myChart.destroy();
  window.myChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['To Do', 'In Progress', 'Done'],
      datasets: [{
        data: [counts.todo, counts['in-progress'], counts.done],
        backgroundColor: ['#71717a', '#3b82f6', '#10b981'],
        borderWidth: 0,
        hoverOffset: 10
      }]
    },
    options: { cutout: '70%', plugins: { legend: { display: false } } }
  });
}

// Modal Handlers
function openTaskModal(task = null) {
  const m = document.getElementById('taskModalOverlay');
  const title = document.getElementById('taskModalTitle');
  const pid = document.getElementById('taskProj');
  const uid = document.getElementById('taskAssignee');
  
  pid.innerHTML = state.projects.map(p => `<option value="${p._id}">${p.name}</option>`).join('');
  uid.innerHTML = state.team.map(u => `<option value="${u._id}">${u.name}</option>`).join('');
  
  if (task) {
    title.textContent = 'Edit Task';
    document.getElementById('taskModalId').value = task._id;
    document.getElementById('taskTitle').value = task.title;
    document.getElementById('taskDesc').value = task.desc || '';
    document.getElementById('taskProj').value = task.projectId?._id || '';
    document.getElementById('taskAssignee').value = task.assignee?._id || '';
    document.getElementById('taskPriority').value = task.priority;
    document.getElementById('taskStatus').value = task.status;
    document.getElementById('taskDue').value = task.due || '';
    document.getElementById('deleteTaskBtn').classList.remove('hidden');
  } else {
    title.textContent = 'New Task';
    document.getElementById('taskForm').reset();
    document.getElementById('taskModalId').value = '';
    document.getElementById('deleteTaskBtn').classList.add('hidden');
  }
  m.classList.remove('hidden');
}

async function saveTask() {
  const id = document.getElementById('taskModalId').value;
  const data = {
    title: document.getElementById('taskTitle').value,
    desc: document.getElementById('taskDesc').value,
    projectId: document.getElementById('taskProj').value,
    assignee: document.getElementById('taskAssignee').value,
    priority: document.getElementById('taskPriority').value,
    status: document.getElementById('taskStatus').value,
    due: document.getElementById('taskDue').value
  };
  try {
    if (id) await apiCall(`/tasks/${id}`, 'PUT', data);
    else await apiCall('/tasks', 'POST', data);
    
    if (data.status === 'done') triggerTaskGlow(id);
    
    closeModal('taskModalOverlay');
    refreshData();
    showToast(id ? 'Task updated' : 'Task created');
  } catch (e) { showToast(e.message, true); }
}

async function deleteTask() {
  const id = document.getElementById('taskModalId').value;
  if (!confirm('Delete this task? This action cannot be undone.')) return;
  try {
    await apiCall(`/tasks/${id}`, 'DELETE');
    closeModal('taskModalOverlay');
    refreshData();
    showToast('Task deleted');
  } catch (e) { showToast(e.message, true); }
}

function triggerTaskGlow(id) {
  const el = document.getElementById(`task-${id}`);
  if (el) {
    el.classList.add('task-completed-glow');
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#10b981', '#ffffff'] });
    setTimeout(() => el.classList.remove('task-completed-glow'), 2000);
  }
}

function openProjectModal() {
  document.getElementById('projectForm').reset();
  document.getElementById('projectModalOverlay').classList.remove('hidden');
}

async function saveProject() {
  const data = {
    name: document.getElementById('projName').value,
    desc: document.getElementById('projDesc').value,
    color: document.getElementById('projColor').value,
    due: document.getElementById('projDue').value
  };
  try {
    await apiCall('/projects', 'POST', data);
    closeModal('projectModalOverlay');
    refreshData();
    showToast('Project created');
  } catch (e) { showToast(e.message, true); }
}

function closeModal(id) { document.getElementById(id).classList.add('hidden'); }

// Drag & Drop
function dragTask(e, id) { e.dataTransfer.setData('text', id); }
function allowDrop(e) { e.preventDefault(); }
async function dropTask(e, status) {
  e.preventDefault();
  const id = e.dataTransfer.getData('text');
  try {
    await apiCall(`/tasks/${id}`, 'PUT', { status });
    if (status === 'done') triggerTaskGlow(id);
    refreshData();
  } catch (e) { showToast(e.message, true); }
}

// Utils
function getStatusColor(s) {
  return { 'todo':'var(--status-todo)', 'in-progress':'var(--status-inprog)', 'done':'var(--status-done)' }[s] || 'var(--text-tertiary)';
}
function getPriorityColor(p) {
  return { 'high':'#ef4444', 'medium':'#f59e0b', 'low':'#3b82f6' }[p] || 'var(--text-tertiary)';
}
function toggleTheme() {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', state.theme);
  localStorage.setItem('tf-theme', state.theme);
}
function showToast(msg, isErr=false) {
  const container = document.getElementById('toast-container');
  const t = document.createElement('div');
  t.className = 'toast';
  if (isErr) t.style.borderColor = 'var(--status-overdue)';
  t.textContent = msg;
  container.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}
