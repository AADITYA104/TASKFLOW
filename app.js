let state = { user: null, token: null, theme: 'dark', projects: [], tasks: [], team: [] };
const API = '/api';

document.addEventListener('DOMContentLoaded', () => {
  initBgCanvas();
  const t = localStorage.getItem('tf-theme');
  if (t) { state.theme = t; document.documentElement.setAttribute('data-theme', t); }
  const token = localStorage.getItem('tf-token'), user = localStorage.getItem('tf-user');
  if (token && user) { state.token = token; state.user = JSON.parse(user); loginSuccess(); }
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

function switchToRegister() { document.getElementById('loginForm').classList.add('hidden'); document.getElementById('registerForm').classList.remove('hidden'); }
function switchToLogin() { document.getElementById('registerForm').classList.add('hidden'); document.getElementById('loginForm').classList.remove('hidden'); }

async function apiCall(ep, method='GET', body=null) {
  const h = { 'Content-Type':'application/json' };
  if (state.token) h['Authorization'] = `Bearer ${state.token}`;
  const opts = { method, headers: h };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${API}${ep}`, opts);
  if (!res.ok) { const e = await res.json(); throw new Error(e.msg || 'API Error'); }
  return res.json();
}

async function handleLogin() {
  const email = document.getElementById('loginEmail').value;
  const pw = document.getElementById('loginPassword').value;
  const err = document.getElementById('loginError');
  if (!email || !pw) { err.textContent = 'Email and password required.'; return; }
  try {
    const d = await apiCall('/auth/login','POST',{email,password:pw});
    state.token=d.token; state.user=d.user;
    localStorage.setItem('tf-token',d.token); localStorage.setItem('tf-user',JSON.stringify(d.user));
    err.textContent=''; loginSuccess();
  } catch(e) { err.textContent=e.message; }
}

async function handleRegister() {
  const name=document.getElementById('regName').value, email=document.getElementById('regEmail').value;
  const pw=document.getElementById('regPassword').value, role=document.getElementById('regRole').value;
  const err=document.getElementById('regError');
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
  setTimeout(() => { overlay.classList.add('hidden'); document.getElementById('app').classList.remove('hidden'); initApp(); }, 500);
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
  document.getElementById('quickAddBtn').onclick=()=>openTaskModal();
  const dp=document.getElementById('page-dashboard'); if(dp) dp.style.opacity='1';
  await loadData();
  renderDashboard();
}

async function loadData() {
  try {
    const [projects, tasks] = await Promise.all([apiCall('/projects'), apiCall('/tasks')]);
    state.projects=projects;
    if(state.user.role==='admin'){state.tasks=tasks;state.team=await apiCall('/users');}
    else{state.tasks=tasks.filter(t=>t.assignee&&t.assignee._id===state.user.id);}
    updateBadges();
  } catch(e) {
    showToast('Failed to load data');
    if(e.message==='No token'||e.message==='Invalid token') logout();
  }
}

function updateBadges() {
  document.getElementById('projectsBadge').textContent=state.projects.length;
  document.getElementById('tasksBadge').textContent=state.tasks.length;
}

function navigate(pageId, navItem) {
  if(navItem){document.querySelectorAll('.nav-item').forEach(el=>el.classList.remove('active'));navItem.classList.add('active');}
  document.querySelectorAll('.page').forEach(p=>{p.classList.add('hidden');p.style.opacity='0';});
  const t=document.getElementById(`page-${pageId}`);
  if(t){t.classList.remove('hidden');t.style.opacity='1';}
  const titles={dashboard:'Dashboard',projects:'Projects',tasks:'My Tasks',team:'Team',analytics:'Analytics'};
  document.getElementById('pageTitle').textContent=titles[pageId]||'TaskFlow';
  document.getElementById('breadcrumb').textContent=titles[pageId]||'';
  if(pageId==='dashboard') renderDashboard();
  if(pageId==='projects') renderProjects();
  if(pageId==='tasks') renderKanban();
  if(pageId==='team'&&state.user.role==='admin') renderTeam();
  if(pageId==='analytics') renderAnalytics();
}

function toggleTheme() {
  state.theme=state.theme==='dark'?'light':'dark';
  document.documentElement.setAttribute('data-theme',state.theme);
  localStorage.setItem('tf-theme',state.theme);
}

function handleSearch(val) {
  const v=val.toLowerCase();
  if(!v){renderKanban();return;}
  const filtered=state.tasks.filter(t=>t.title.toLowerCase().includes(v));
  const cols={'todo':[],'in-progress':[],'done':[]};
  filtered.forEach(t=>{if(cols[t.status]) cols[t.status].push(t);});
  renderKanbanCols(cols);
  navigate('tasks',document.querySelector('[data-page="tasks"]'));
}

function renderDashboard() {
  const pEl=document.getElementById('totalProjects');if(pEl) pEl.textContent=state.projects.length;
  document.getElementById('totalTasks').textContent=state.tasks.length;
  const done=state.tasks.filter(t=>t.status==='done').length;
  document.getElementById('completedTasks').textContent=done;
  const today=new Date();today.setHours(0,0,0,0);
  const overdue=state.tasks.filter(t=>t.status!=='done'&&t.due&&new Date(t.due)<today).length;
  document.getElementById('overdueTasks').textContent=overdue;

  const list=document.getElementById('recentTasksList');if(!list) return;
  list.innerHTML='';
  if(state.tasks.length===0){
    list.innerHTML='<div class="empty-state"><h3>No tasks yet</h3><p>Create your first task to get started.</p></div>';
  } else {
    const recent=[...state.tasks].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).slice(0,5);
    recent.forEach(t=>{
      const name=t.assignee?t.assignee.name:'Unassigned';
      const el=document.createElement('div');el.className='task-list-item';
      el.innerHTML=`<div class="t-info"><span class="t-title">${t.title}</span><div class="t-meta"><span>Due: ${t.due||'—'}</span><span>${name}</span></div></div><span class="t-status s-${t.status}">${t.status.replace('-',' ')}</span>`;
      list.appendChild(el);
    });
  }

  const ctx=document.getElementById('statusChart');
  if(ctx&&typeof Chart!=='undefined'){
    if(window._sc) window._sc.destroy();
    const td=state.tasks.filter(t=>t.status==='todo').length;
    const ip=state.tasks.filter(t=>t.status==='in-progress').length;
    window._sc=new Chart(ctx,{type:'doughnut',data:{labels:['To Do','In Progress','Done'],datasets:[{data:[td,ip,done],backgroundColor:['#64748b','#0ea5e9','#10b981'],borderWidth:0,hoverOffset:6}]},options:{responsive:true,cutout:'65%',plugins:{legend:{position:'bottom',labels:{color:state.theme==='dark'?'#e2e8f0':'#1e293b',padding:16,font:{size:12}}}}}});
  }
}

function renderProjects(filter='all') {
  const g=document.getElementById('projectsGrid');if(!g)return;g.innerHTML='';
  let projs=state.projects;
  if(filter!=='all') projs=projs.filter(p=>p.status===filter);
  if(projs.length===0){g.innerHTML='<div class="empty-state" style="grid-column:1/-1"><h3>No projects found</h3><p>Create a new project.</p></div>';return;}
  projs.forEach(p=>{
    const tc=state.tasks.filter(t=>t.projectId&&t.projectId._id===p._id).length;
    const c=document.createElement('div');c.className='project-card';
    c.innerHTML=`<div class="p-color-bar" style="background:${p.color}"></div><div class="p-header"><span class="p-title">${p.name}</span></div><p class="p-desc">${p.desc||''}</p><div class="p-meta"><span>${tc} Tasks</span><span>Due: ${p.due||'—'}</span></div>`;
    g.appendChild(c);
  });
}

function filterProjects(s,btn){document.querySelectorAll('#page-projects .filter-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');renderProjects(s);}

function renderKanban(filter='all') {
  const cols={'todo':[],'in-progress':[],'done':[]};
  const today=new Date();today.setHours(0,0,0,0);
  state.tasks.forEach(t=>{
    let show=filter==='all'||(filter==='overdue'?t.status!=='done'&&t.due&&new Date(t.due)<today:t.status===filter);
    if(show&&cols[t.status]) cols[t.status].push(t);
  });
  renderKanbanCols(cols);
}

function renderKanbanCols(cols) {
  ['todo','in-progress','done'].forEach(status=>{
    const col=document.getElementById(`col-${status}`);if(!col) return;
    col.innerHTML='';
    const countEl=document.getElementById(`count-${status}`);if(countEl) countEl.textContent=cols[status].length;
    cols[status].forEach(t=>{
      const proj=t.projectId||{color:'#888',name:'General'};
      const card=document.createElement('div');card.className='k-card';card.draggable=true;card.id=`task-${t._id}`;
      card.ondragstart=(e)=>drag(e,t._id);
      card.addEventListener('mousemove',e=>{
        const r=card.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;
        const rx=((y-r.height/2)/(r.height/2))*-12, ry=((x-r.width/2)/(r.width/2))*12;
        card.style.transform=`perspective(600px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.03,1.03,1.03)`;
      });
      card.addEventListener('mouseleave',()=>{card.style.transform='';});
      const an=t.assignee?t.assignee.name.charAt(0).toUpperCase():'?';
      card.innerHTML=`<div class="k-tags"><span class="k-tag" style="background:${proj.color}18;color:${proj.color}">${proj.name}</span><span class="k-tag" style="background:var(--bg-tertiary);color:var(--text-secondary)">${t.priority}</span></div><div class="k-title">${t.title}</div><div class="k-meta"><span>${t.due||''}</span><div class="k-assignee" title="${t.assignee?t.assignee.name:'Unassigned'}">${an}</div></div>`;
      col.appendChild(card);
    });
  });
}

function filterTasks(s,btn){document.querySelectorAll('#page-tasks .filter-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');renderKanban(s);}
function allowDrop(ev){ev.preventDefault();}
function drag(ev,taskId){ev.dataTransfer.setData('text',taskId);}

async function dropTask(ev,newStatus) {
  ev.preventDefault();
  const id=ev.dataTransfer.getData('text'), task=state.tasks.find(t=>t._id===id);
  if(task&&task.status!==newStatus){
    const old=task.status;task.status=newStatus;renderKanban();
    if(newStatus==='done'&&typeof confetti!=='undefined') confetti({particleCount:80,spread:60,origin:{y:.6},colors:['#8b5cf6','#10b981','#0ea5e9']});
    try{await apiCall(`/tasks/${id}`,'PUT',{status:newStatus});renderDashboard();}
    catch(e){task.status=old;renderKanban();showToast('Error updating task');}
  }
}

function openModal(id){document.getElementById(id)?.classList.remove('hidden');}
function closeModal(id){document.getElementById(id)?.classList.add('hidden');}

function showToast(msg) {
  const c=document.getElementById('toastContainer');if(!c)return;
  const t=document.createElement('div');t.className='toast';t.textContent=msg;
  c.appendChild(t);setTimeout(()=>t.remove(),3000);
}

async function openTaskModal() {
  const ps=document.getElementById('taskProject');
  ps.innerHTML=state.projects.map(p=>`<option value="${p._id}">${p.name}</option>`).join('');
  const as=document.getElementById('taskAssignee');
  if(state.user.role==='admin'&&state.team.length>0) as.innerHTML=state.team.map(u=>`<option value="${u._id}">${u.name}</option>`).join('');
  else if(state.user.role==='admin'){try{state.team=await apiCall('/users');as.innerHTML=state.team.map(u=>`<option value="${u._id}">${u.name}</option>`).join('');}catch(e){as.innerHTML=`<option value="${state.user.id}">${state.user.name}</option>`;}}
  else as.innerHTML=`<option value="${state.user.id}">${state.user.name}</option>`;
  document.getElementById('taskTitle').value='';document.getElementById('taskDesc').value='';document.getElementById('taskDue').value='';
  document.getElementById('taskModalTitle').textContent='New Task';
  openModal('taskModalOverlay');
}

async function saveTask() {
  const title=document.getElementById('taskTitle').value;if(!title)return showToast('Title required!');
  const payload={title,desc:document.getElementById('taskDesc').value,projectId:document.getElementById('taskProject').value,priority:document.getElementById('taskPriority').value,assignee:document.getElementById('taskAssignee').value,due:document.getElementById('taskDue').value,status:document.getElementById('taskStatus').value};
  try{const t=await apiCall('/tasks','POST',payload);state.tasks.push(t);updateBadges();renderKanban();renderDashboard();closeModal('taskModalOverlay');showToast('Task created!');}
  catch(e){showToast(e.message);}
}

function openProjectModal(){document.getElementById('projectName').value='';document.getElementById('projectDesc').value='';openModal('projectModalOverlay');}

async function saveProject() {
  const name=document.getElementById('projectName').value;if(!name) return showToast('Name required!');
  const payload={name,desc:document.getElementById('projectDesc').value,color:document.getElementById('projectColor').value,due:document.getElementById('projectDue').value};
  try{const p=await apiCall('/projects','POST',payload);state.projects.push(p);updateBadges();renderProjects();renderDashboard();closeModal('projectModalOverlay');showToast('Project created!');}
  catch(e){showToast(e.message);}
}

function renderTeam() {
  const g=document.getElementById('teamGrid');if(!g||!state.team)return;
  g.innerHTML=state.team.map(u=>`<div class="dash-card"><div class="user-card"><div class="user-avatar" style="width:48px;height:48px;font-size:1.1rem">${u.name.charAt(0).toUpperCase()}</div><div class="user-info"><span class="user-name" style="font-size:1rem">${u.name}</span><span class="user-role">${u.role}</span><span style="font-size:.72rem;color:var(--text-tertiary)">${u.email}</span></div></div></div>`).join('');
}

function renderAnalytics() {
  const ctx=document.getElementById('analyticsChart');
  if(ctx&&typeof Chart!=='undefined'){
    if(window._ac) window._ac.destroy();
    const td=state.tasks.filter(t=>t.status==='todo').length;
    const ip=state.tasks.filter(t=>t.status==='in-progress').length;
    const dn=state.tasks.filter(t=>t.status==='done').length;
    window._ac=new Chart(ctx,{type:'doughnut',data:{labels:['To Do','In Progress','Done'],datasets:[{data:[td,ip,dn],backgroundColor:['#64748b','#0ea5e9','#10b981'],borderWidth:0}]},options:{responsive:true,cutout:'60%',plugins:{legend:{position:'bottom',labels:{color:state.theme==='dark'?'#e2e8f0':'#1e293b',padding:16}}}}});
  }
  const perf=document.getElementById('teamPerfList');
  if(perf&&state.team.length>0){
    perf.innerHTML=state.team.map(u=>{
      const ut=state.tasks.filter(t=>t.assignee&&t.assignee._id===u._id);
      const done=ut.filter(t=>t.status==='done').length;
      const pct=ut.length?Math.round((done/ut.length)*100):0;
      return `<div class="task-list-item"><div class="t-info"><span class="t-title">${u.name}</span><div class="t-meta"><span>${done}/${ut.length} done</span><span>${pct}%</span></div></div><div style="width:100px;height:6px;background:var(--bg-tertiary);border-radius:3px;overflow:hidden"><div style="width:${pct}%;height:100%;background:var(--status-done);border-radius:3px"></div></div></div>`;
    }).join('');
  }
}

function openInviteModal(){document.getElementById('inviteName').value='';document.getElementById('inviteEmail').value='';document.getElementById('invitePassword').value='Welcome123';openModal('inviteModalOverlay');}

async function sendInvite() {
  const name=document.getElementById('inviteName').value,email=document.getElementById('inviteEmail').value,pw=document.getElementById('invitePassword').value,role=document.getElementById('inviteRole').value;
  if(!name||!email||!pw) return showToast('All fields required!');
  try{await apiCall('/auth/register','POST',{name,email,password:pw,role});state.team=await apiCall('/users');renderTeam();closeModal('inviteModalOverlay');showToast(`Invited ${name}!`);}
  catch(e){showToast(e.message==='User exists'?'User already exists.':'Error: '+e.message);}
}

async function deleteTask(taskId) {
  if(!taskId||!confirm('Delete this task?')) return;
  try{await apiCall(`/tasks/${taskId}`,'DELETE');state.tasks=state.tasks.filter(t=>t._id!==taskId);updateBadges();renderKanban();renderDashboard();showToast('Task deleted');}
  catch(e){showToast(e.message);}
}
