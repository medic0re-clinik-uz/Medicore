
'use strict';


let currentUser = null;
let toastTimer  = null;


function initTheme() { applyTheme(localStorage.getItem('theme') || 'light'); }

function applyTheme(t) {
  document.body.className = 'theme-' + t;
  localStorage.setItem('theme', t);
  const icon  = document.getElementById('theme-icon');
  const label = document.getElementById('theme-label');
  if (icon)  icon.textContent  = t === 'dark' ? '☀️' : '🌙';
  if (label) label.textContent = t === 'dark' ? 'Light Mode' : 'Dark Mode';
}

function toggleTheme() {
  applyTheme(localStorage.getItem('theme') === 'dark' ? 'light' : 'dark');
}


function initials(name) {
  return (name || '?').split(' ').filter(Boolean).slice(0,2).map(w => w[0]).join('').toUpperCase();
}
function calcAge(dob) {
  if (!dob) return '—';
  return new Date().getFullYear() - new Date(dob).getFullYear();
}
function escHtml(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function showToast(msg, type='info') {
  const t = document.getElementById('toast');
  t.className = 'toast toast-'+type;
  t.innerHTML = (type==='success'?'✓':type==='error'?'✕':'ℹ')+' '+escHtml(msg);
  t.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.add('hidden'), 2800);
}

function avatar(name, size=34, cls='av-primary') {
  return `<div class="avatar ${cls}" style="width:${size}px;height:${size}px;font-size:${Math.round(size*0.33)}px">${initials(name)}</div>`;
}
function badge(label, cls) {
  return `<span class="badge ${cls}">${escHtml(label)}</span>`;
}
function sevCls(s) {
  return {"Yengil":"sev-yengil","O'rtacha":"sev-ortacha","Og'ir":"sev-ogir","Juda og'ir":"sev-judaogir"}[s]||'badge-gray';
}
function staCls(s) {
  return {"Under Treatment":"badge-primary","Kuzatuvda":"badge-warning","Sog'aydi":"badge-success","Active":"badge-success","Inactive":"badge-gray"}[s]||'badge-gray';
}

let _debounceTimer = null;
function debounced(fn, ms=400) {
  clearTimeout(_debounceTimer);
  _debounceTimer = setTimeout(fn, ms);
}

function openModal(title, html, wide=false) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = html;
  document.getElementById('modal-box').className = wide ? 'modal-box wide' : 'modal-box';
  document.getElementById('modal-overlay').classList.remove('hidden');
}
function closeModal(e) {
  if (e && e.target !== document.getElementById('modal-overlay')) return;
  document.getElementById('modal-overlay').classList.add('hidden');
}

function openConfirm(msg, onOk) {
  document.getElementById('confirm-msg').textContent = msg;
  document.getElementById('confirm-overlay').classList.remove('hidden');
  document.getElementById('confirm-ok').onclick = () => { closeConfirm(); onOk(); };
}
function closeConfirm() {
  document.getElementById('confirm-overlay').classList.add('hidden');
}

function fillLogin(u, p) {
  document.getElementById('inp-username').value = u;
  document.getElementById('inp-password').value = p;
}
function togglePwd() {
  const inp = document.getElementById('inp-password');
  inp.type = inp.type === 'password' ? 'text' : 'password';
}
async function doLogin() {
  const username = document.getElementById('inp-username').value.trim();
  const password = document.getElementById('inp-password').value;
  const errEl    = document.getElementById('login-error');
  errEl.classList.add('hidden');
  if (!username || !password) {
    errEl.textContent = '⚠️ Enter staff ID and password';
    errEl.classList.remove('hidden');
    return;
  }
  try {
    const data = await Auth.login(username, password);
    localStorage.setItem('token', data.token);
    currentUser = data.user;
    startApp();
  } catch(err) {
    errEl.textContent = '⚠️ ' + err.message;
    errEl.classList.remove('hidden');
  }
}
async function doLogout() {
  try { await Auth.logout(); } catch(_) {}
  localStorage.removeItem('token');
  currentUser = null;
  document.getElementById('app').classList.add('hidden');
  document.getElementById('login-page').classList.remove('hidden');
  document.getElementById('inp-username').value = '';
  document.getElementById('inp-password').value = '';
}
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !document.getElementById('login-page').classList.contains('hidden')) doLogin();
});

const MENUS = {
  admin: [
    { key:'dashboard',  label:'Dashboard',                    icon:'🏠' },
    { key:'doctors',    label:'Physicians',                   icon:'🩺' },
    { key:'patients',   label:'Patients',                     icon:'🧑‍🤝‍🧑' },
    { key:'diseases',   label:'Diagnoses',                    icon:'📋' },
    { key:'clinic',     label:'Hospital Info',                icon:'🏥' },
    { key:'emergency',  label:'Emergency',                    icon:'🚨' },
  ],
  clinician: [
    { key:'dashboard',  label:'Dashboard',                    icon:'🏠' },
    { key:'patients',   label:'Patients',                     icon:'🧑‍🤝‍🧑' },
    { key:'diseases',   label:'Diagnoses',                    icon:'📋' },
    { key:'clinic',     label:'Hospital Info',                icon:'🏥' },
    { key:'emergency',  label:'Emergency',                    icon:'🚨' },
  ],
  receptionist: [
    { key:'dashboard',     label:'Dashboard',                  icon:'🏠' },
    { key:'patients',      label:'Patient Registry',          icon:'📁' },
    { key:'doctors_view',  label:'Physician Directory',       icon:'🩺' },
    { key:'emergency',     label:'Emergency',                 icon:'🚨' },
  ],
};
const ROLE_LABELS = { admin:'Hospital Administrator', clinician:'Physician', receptionist:'Reception' };

function buildSidebar() {
  document.getElementById('s-avatar').textContent = initials(currentUser.name);
  document.getElementById('s-name').textContent   = currentUser.name;
  document.getElementById('s-role').textContent   = ROLE_LABELS[currentUser.role] || '';
  const nav = document.getElementById('sidebar-nav');
  nav.innerHTML = (MENUS[currentUser.role]||[]).map(m =>
    `<button class="nav-item" data-key="${m.key}" onclick="navigate('${m.key}')">
      <span class="nav-icon">${m.icon}</span>${escHtml(m.label)}
    </button>`
  ).join('');
}
function setActiveNav(key) {
  document.querySelectorAll('.nav-item').forEach(el =>
    el.classList.toggle('active', el.dataset.key === key)
  );
}
function navigate(key) {
  setActiveNav(key);
  const pages = {
    dashboard: renderDashboard, doctors: renderDoctors,
    patients: renderPatients,  diseases: renderDiseases,
    doctors_view: renderDoctorsView, clinic: renderClinic,
    emergency: renderEmergency,
  };
  if (pages[key]) pages[key]();
}
function startApp() {
  document.getElementById('login-page').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
  buildSidebar();
  applyTheme(localStorage.getItem('theme') || 'light');
  showToast(`Welcome, ${currentUser.name}!`, 'success');
  navigate('dashboard');
}

async function renderDashboard() {
  const el = document.getElementById('page-content');
  el.innerHTML = `<div class="page-header"><h1>Dashboard</h1><p>Healing Heart Hospital — Integrated Patient Records and Clinical Management</p></div>
    <p class="text2">Loading...</p>`;
  try {
    const [stats, doctors, patients] = await Promise.all([Stats.get(), Doctors.getAll(), Patients.getAll()]);
    const isAdmin = currentUser.role === 'admin';
    const cards = [
      isAdmin ? `<div class="card stat-card"><div class="stat-icon" style="background:var(--primary-light)">⚕</div><div><div class="stat-label">Physicians</div><div class="stat-value">${stats.doctors}</div></div></div>` : '',
      `<div class="card stat-card"><div class="stat-icon" style="background:var(--accent-light)">♥</div><div><div class="stat-label">Patients</div><div class="stat-value">${stats.patients}</div></div></div>`,
      `<div class="card stat-card"><div class="stat-icon" style="background:var(--warning-light)">⊕</div><div><div class="stat-label">Diagnoses</div><div class="stat-value">${stats.diseases}</div></div></div>`,
      `<div class="card stat-card"><div class="stat-icon" style="background:var(--success-light)">✓</div><div><div class="stat-label">Recovered</div><div class="stat-value">${stats.recovered}</div></div></div>`,
      `<div class="card stat-card"><div class="stat-icon" style="background:var(--danger-light)">⊗</div><div><div class="stat-label">Under Treatment</div><div class="stat-value">${stats.treating}</div></div></div>`,
    ].join('');

    const recPats = (stats.recent.patients||[]).map(p => {
      const doc = doctors.find(d => d.id === p.doctorId);
      return `<div class="dash-row">${avatar(p.name,30,'av-accent')}
        <div><div class="dash-row-name">${escHtml(p.name)}</div>
        <div class="dash-row-sub">${doc?escHtml(doc.name):'—'}</div></div>
        <div class="dash-row-right">${p.registeredAt||''}</div></div>`;
    }).join('');

    const recDis = (stats.recent.diseases||[]).map(d => {
      const pat = patients.find(p => p.id === d.patientId);
      return `<div class="dash-row">
        <div class="avatar av-primary" style="width:30px;height:30px;font-size:9px;border-radius:6px">${escHtml(d.icdCode.split('.')[0])}</div>
        <div><div class="dash-row-name">${escHtml(d.icdCode)} — ${escHtml(d.description)}</div>
        <div class="dash-row-sub">${pat?escHtml(pat.name):'—'}</div></div>
        <div class="dash-row-right">${badge(d.severity, sevCls(d.severity))}</div></div>`;
    }).join('');

    el.innerHTML = `
      <div class="page-header"><h1>Dashboard</h1><p>Healing Heart Hospital — Integrated Patient Records and Clinical Management</p></div>
      <div class="stats-grid">${cards}</div>
      <div class="dash-grid">
        <div class="card dash-card"><h3>Recent Patients</h3>${recPats||'<p class="empty">No data available</p>'}</div>
        <div class="card dash-card"><h3>Recent Diagnoses</h3>${recDis||'<p class="empty">No data available</p>'}</div>
      </div>`;
  } catch(err) {
    el.innerHTML += `<p style="color:var(--danger);margin-top:12px">${err.message}</p>`;
  }
}

async function renderDoctors(q='') {
  const el = document.getElementById('page-content');
  const isAdmin = currentUser.role === 'admin';
  el.innerHTML = `
    <div class="page-header"><h1>Physicians</h1><p>Manage all physicians at the hospital</p></div>
    <div class="toolbar">
      <input class="search-input" id="doc-q" placeholder="Search by name, specialty, department..." value="${escHtml(q)}"
        oninput="debounced(()=>renderDoctors(document.getElementById('doc-q').value))"/>
      ${isAdmin?`<button class="btn btn-primary" onclick="openDoctorForm()">+ Add Physician</button>`:''}
    </div>
    <div class="table-wrap"><p style="padding:20px" class="text2">Loading...</p></div>`;
  try {
    const [docs, patients] = await Promise.all([Doctors.getAll(q), Patients.getAll()]);
    const heads = ['Shifokor','Specialty',"Department",'Experience','Phone','Status','Patients',...(isAdmin?['Amallar']:[])];
    const rows = docs.map(doc => {
      const cnt = patients.filter(p => p.doctorId === doc.id).length;
      const docJson = encodeURIComponent(JSON.stringify(doc));
      return `<tr>
        <td><div class="flex gap-8" style="align-items:center">${avatar(doc.name,34,'av-primary')}
          <div><div class="fw-600">${escHtml(doc.name)}</div><div class="text-sm text3">${escHtml(doc.email||'')}</div></div></div></td>
        <td>${escHtml(doc.specialty)}</td>
        <td class="text2">${escHtml(doc.department)}</td>
        <td>${doc.experience} yil</td>
        <td class="text2">${escHtml(doc.phone||'')}</td>
        <td>${badge(doc.status, staCls(doc.status))}</td>
        <td style="font-weight:600;color:var(--primary)">${cnt}</td>
        ${isAdmin?`<td><div class="flex gap-6">
          <button class="btn btn-sm btn-edit" onclick="openDoctorFormById('${docJson}')">Tahrirlash</button>
          <button class="btn btn-sm btn-del" onclick="deleteDoctor(${doc.id})">O'chirish</button>
        </div></td>`:''}
      </tr>`;
    }).join('');
    el.querySelector('.table-wrap').innerHTML = `<table>
      <thead><tr>${heads.map(h=>`<th>${h}</th>`).join('')}</tr></thead>
      <tbody>${rows||`<tr><td colspan="${heads.length}" class="empty">Natija topilmadi</td></tr>`}</tbody>
    </table>`;
  } catch(err) { showToast(err.message,'error'); }
}

function openDoctorFormById(encoded) {
  openDoctorForm(JSON.parse(decodeURIComponent(encoded)));
}

function openDoctorForm(doc=null) {
  const specs = ['Kardiologiya','Nevrologiya','Dermatologiya','Ortopediya','Umumiy amaliyot','Diagnostika'];
  const depts = ["Yurak-qon tomir","Neyrologiya","Teri kasalliklari","Suyak-bo'g'im","Umumiy bo'lim","Diagnostika"];
  const val   = (f, fb='') => doc ? (doc[f]!==undefined ? doc[f] : fb) : fb;
  openModal(doc?'Shifokorni tahrirlash':"Add Physician qo'shish", `
    <div class="form-grid">
      <div><label class="fg-label">Full Name <span class="fg-required">*</span></label>
        <input class="fg-input" id="f-name" value="${escHtml(val('name'))}" placeholder="Dr. Ism Familiya"/></div>
      <div><label class="fg-label">Specialty <span class="fg-required">*</span></label>
        <select class="fg-select" id="f-spec">${specs.map(s=>`<option ${val('specialty')===s?'selected':''}>${s}</option>`).join('')}</select></div>
      <div><label class="fg-label">Department <span class="fg-required">*</span></label>
        <select class="fg-select" id="f-dept">${depts.map(d=>`<option ${val('department')===d?'selected':''}>${d}</option>`).join('')}</select></div>
      <div><label class="fg-label">Experience (yil)</label>
        <input class="fg-input" id="f-exp" type="number" min="0" value="${val('experience',0)}"/></div>
      <div><label class="fg-label">Phone</label>
        <input class="fg-input" id="f-phone" value="${escHtml(val('phone'))}" placeholder="+998 90 000-00-00"/></div>
      <div><label class="fg-label">Email</label>
        <input class="fg-input" id="f-email" value="${escHtml(val('email'))}" placeholder="shifokor@caretrack.uz"/></div>
      <div><label class="fg-label">Status</label>
        <select class="fg-select" id="f-status">
          <option ${val('status')==='Active'?'selected':''}>Active</option>
          <option ${val('status')==='Inactive'?'selected':''}>Inactive</option>
        </select></div>
    </div>
    <div class="form-actions">
      <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveDoctor(${doc?doc.id:'null'})">Save</button>
    </div>`, true);
}

async function saveDoctor(id) {
  const data = {
    name:       document.getElementById('f-name').value.trim(),
    specialty:  document.getElementById('f-spec').value,
    department: document.getElementById('f-dept').value,
    experience: +document.getElementById('f-exp').value||0,
    phone:      document.getElementById('f-phone').value.trim(),
    email:      document.getElementById('f-email').value.trim(),
    status:     document.getElementById('f-status').value,
  };
  if (!data.name) { showToast("Ism kiritilishi shart",'error'); return; }
  try {
    if (id) { await Doctors.update(id,data); showToast("Shifokor yangilandi",'success'); }
    else    { await Doctors.create(data);    showToast("Shifokor qo'shildi",'success'); }
    closeModal(); renderDoctors();
  } catch(err) { showToast(err.message,'error'); }
}
async function deleteDoctor(id) {
  openConfirm("Shifokorni o'chirishni tasdiqlaysizmi?", async () => {
    try { await Doctors.remove(id); showToast("O'chirildi",'info'); renderDoctors(); }
    catch(err) { showToast(err.message,'error'); }
  });
}


let _patQ='', _patDoc='';
async function renderPatients(q, doctorId) {
  if (q !== undefined) _patQ = q;
  if (doctorId !== undefined) _patDoc = doctorId;
  const el = document.getElementById('page-content');
  const role = currentUser.role;
  el.innerHTML = `
    <div class="page-header"><h1>Patients</h1><p>Patient Registrydan o'tgan barcha bemorlar</p></div>
    <div class="toolbar">
      <input class="search-input" id="pat-q" placeholder="Ism, telefon, manzil bo'yicha qidirish..." value="${escHtml(_patQ)}"
        oninput="debounced(()=>renderPatients(document.getElementById('pat-q').value))"/>
      <select class="filter-select" id="pat-doc" onchange="renderPatients(undefined,this.value)">
        <option value="">Barcha shifokorlar</option>
      </select>
      <button class="btn btn-primary" onclick="openPatientForm()">+ Yangi bemor</button>
    </div>
    <div class="table-wrap"><p style="padding:20px" class="text2">Loading...</p></div>`;
  try {
    const [pats, docs, diseases] = await Promise.all([
      Patients.getAll(_patQ, _patDoc), Doctors.getAll(), Diseases.getAll()
    ]);
    
    const sel = document.getElementById('pat-doc');
    docs.forEach(d => {
      const o = document.createElement('option');
      o.value = d.id; o.textContent = d.name;
      if (String(_patDoc) === String(d.id)) o.selected = true;
      sel.appendChild(o);
    });
    const canDel = role==='admin'||role==='receptionist';
    const rows = pats.map(p => {
      const doc    = docs.find(d=>d.id===p.doctorId);
      const disCnt = diseases.filter(d=>d.patientId===p.id).length;
      const encoded = encodeURIComponent(JSON.stringify(p));
      return `<tr>
        <td><div class="flex gap-8" style="align-items:center">${avatar(p.name,34,'av-accent')}
          <div><div class="fw-600">${escHtml(p.name)}</div>
          <div class="text-sm text3">${escHtml(p.address||'')}</div></div></div></td>
        <td>${calcAge(p.dob)} yosh · ${escHtml(p.gender||'')}</td>
        <td class="text2">${escHtml(p.phone||'')}</td>
        <td>${badge(p.bloodType||'—','badge-danger')}</td>
        <td class="text2">${doc?escHtml(doc.name):'<span class="text3">—</span>'}</td>
        <td style="font-weight:600;color:${disCnt?'var(--primary)':'var(--text3)'}">${disCnt}</td>
        <td><div class="flex gap-6">
          <button class="btn btn-sm btn-view" onclick="viewPatient(${p.id})">Profil</button>
          <button class="btn btn-sm btn-edit" onclick="openPatientFormById('${encoded}')">Tahrirlash</button>
          ${canDel?`<button class="btn btn-sm btn-del" onclick="deletePatient(${p.id})">O'chirish</button>`:''}
        </div></td>
      </tr>`;
    }).join('');
    el.querySelector('.table-wrap').innerHTML = `<table>
      <thead><tr>${['Bemor','Yosh / Jins','Phone','Qon guruhi','Shifokor','Diagnoses','Amallar'].map(h=>`<th>${h}</th>`).join('')}</tr></thead>
      <tbody>${rows||'<tr><td colspan="7" class="empty">Natija topilmadi</td></tr>'}</tbody>
    </table>`;
  } catch(err) { showToast(err.message,'error'); }
}

function openPatientFormById(encoded) {
  openPatientForm(JSON.parse(decodeURIComponent(encoded)));
}

async function openPatientForm(pat=null) {
  let docs = [];
  try { docs = await Doctors.getAll(); } catch(_) {}
  const val  = (f, fb='') => pat ? (pat[f]!==undefined ? pat[f] : fb) : fb;
  const blds = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];
  openModal(pat?"Bemorni tahrirlash":"Yangi bemor ro'yxatga olish", `
    <div class="form-grid">
      <div><label class="fg-label">Full Name <span class="fg-required">*</span></label>
        <input class="fg-input" id="fp-name" value="${escHtml(val('name'))}" placeholder="Ism Familiya"/></div>
      <div><label class="fg-label">Tug'ilgan sana <span class="fg-required">*</span></label>
        <input class="fg-input" id="fp-dob" type="date" value="${escHtml(val('dob'))}"/></div>
      <div><label class="fg-label">Jins</label>
        <select class="fg-select" id="fp-gender">
          <option ${val('gender')==='Erkak'?'selected':''}>Erkak</option>
          <option ${val('gender')==='Ayol'?'selected':''}>Ayol</option>
        </select></div>
      <div><label class="fg-label">Qon guruhi</label>
        <select class="fg-select" id="fp-blood">
          ${blds.map(b=>`<option ${val('bloodType')===b?'selected':''}>${b}</option>`).join('')}
        </select></div>
      <div><label class="fg-label">Phone</label>
        <input class="fg-input" id="fp-phone" value="${escHtml(val('phone'))}" placeholder="+998 90 000-00-00"/></div>
      <div><label class="fg-label">Manzil</label>
        <input class="fg-input" id="fp-addr" value="${escHtml(val('address'))}" placeholder="Shahar, Tuman"/></div>
      <div style="grid-column:span 2"><label class="fg-label">Biriktirilgan shifokor <span class="fg-required">*</span></label>
        <select class="fg-select" id="fp-doc">
          <option value="">— Tanlang —</option>
          ${docs.map(d=>`<option value="${d.id}" ${String(val('doctorId'))===String(d.id)?'selected':''}>${escHtml(d.name)} — ${escHtml(d.specialty)}</option>`).join('')}
        </select></div>
    </div>
    <div class="form-actions">
      <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="savePatient(${pat?pat.id:'null'})">Save</button>
    </div>`, true);
}

async function savePatient(id) {
  const data = {
    name:      document.getElementById('fp-name').value.trim(),
    dob:       document.getElementById('fp-dob').value,
    gender:    document.getElementById('fp-gender').value,
    bloodType: document.getElementById('fp-blood').value,
    phone:     document.getElementById('fp-phone').value.trim(),
    address:   document.getElementById('fp-addr').value.trim(),
    doctorId:  +document.getElementById('fp-doc').value||null,
  };
  if (!data.name||!data.dob) { showToast("Ism va tug'ilgan sana majburiy",'error'); return; }
  try {
    if (id) { await Patients.update(id,data); showToast("Bemor ma'lumotlari yangilandi",'success'); }
    else    { await Patients.create(data);    showToast("Bemor ro'yxatga olindi",'success'); }
    closeModal(); renderPatients();
  } catch(err) { showToast(err.message,'error'); }
}
async function deletePatient(id) {
  openConfirm("Bemorni o'chirishni tasdiqlaysizmi?", async () => {
    try { await Patients.remove(id); showToast("Bemor o'chirildi",'info'); renderPatients(); }
    catch(err) { showToast(err.message,'error'); }
  });
}

async function viewPatient(id) {
  try {
    const p   = await Patients.getOne(id);
    const doc = p.doctor;
    const dis = p.diseases||[];
    const docHtml = doc ? `<div class="flex gap-8" style="align-items:center">
      ${avatar(doc.name,38,'av-primary')}
      <div><div class="fw-600">${escHtml(doc.name)}</div>
      <div class="text2 text-sm">${escHtml(doc.specialty)} · ${escHtml(doc.department)}</div>
      <div class="text3 text-sm">📞 ${escHtml(doc.phone||'')}</div></div></div>`
      : '<span class="text3">Shifokor biriktirilmagan</span>';

    const disHtml = dis.length===0
      ? '<p class="empty">Kasallik yozuvlari mavjud emas</p>'
      : dis.map(d => `
          <div class="disease-row">
            <div class="disease-row-top">
              <div style="flex:1">
                <span class="icd-badge">${escHtml(d.icdCode)}</span>
                <span class="disease-row-name">${escHtml(d.description)}</span>
                <div class="disease-row-diag">${escHtml(d.diagnosis||'')}</div>
                <div class="disease-row-date">📅 ${d.date||''}</div>
              </div>
              <div class="disease-badges">
                ${badge(d.severity, sevCls(d.severity))}
                ${badge(d.status, staCls(d.status))}
              </div>
            </div>
          </div>`).join('');

    openModal('Bemor profili', `
      <div class="profile-grid">
        <div class="profile-info">
          <div class="profile-info-top">${avatar(p.name,46,'av-accent')}
            <div><div class="fw-700" style="font-size:15px">${escHtml(p.name)}</div>
            <div class="text2 text-sm">${escHtml(p.gender||'')} · ${calcAge(p.dob)} yosh · ${escHtml(p.bloodType||'')}</div></div>
          </div>
          <p>📞 ${escHtml(p.phone||'—')}<br>📍 ${escHtml(p.address||'—')}<br>📅 Patient Registry: ${p.registeredAt||'—'}</p>
        </div>
        <div class="profile-info">
          <div class="text3 text-sm fw-700" style="text-transform:uppercase;letter-spacing:.6px;margin-bottom:10px">Biriktirilgan shifokor</div>
          ${docHtml}
        </div>
      </div>
      <div class="profile-diseases-title">Kasallik / Tashxis tarixi (${dis.length})</div>
      ${disHtml}`, true);
  } catch(err) { showToast(err.message,'error'); }
}

let _disFilters = {};
async function renderDiseases(filters) {
  if (filters !== undefined) _disFilters = filters;
  const el = document.getElementById('page-content');
  const isAdmin = currentUser.role==='admin';
  el.innerHTML = `
    <div class="page-header"><h1>Diagnoses / Diagnoses</h1><p>Barcha bemor kasallik va tashxis yozuvlari</p></div>
    <div class="toolbar">
      <input class="search-input" id="dis-q" placeholder="ICD kodi, kasallik nomi yoki bemor ism..."
        value="${escHtml(_disFilters.q||'')}" oninput="debounced(()=>getDisFilter())"/>
      <select class="filter-select" id="dis-sev" onchange="getDisFilter()">
        <option value="">Barcha darajalar</option>
        ${["Yengil","O'rtacha","Og'ir","Juda og'ir"].map(s=>`<option ${_disFilters.severity===s?'selected':''}>${s}</option>`).join('')}
      </select>
      <select class="filter-select" id="dis-sta" onchange="getDisFilter()">
        <option value="">Barcha holatlar</option>
        ${["Under Treatment","Kuzatuvda","Sog'aydi"].map(s=>`<option ${_disFilters.status===s?'selected':''}>${s}</option>`).join('')}
      </select>
      <button class="btn btn-primary" onclick="openDiseaseForm()">+ Yangi yozuv</button>
    </div>
    <div class="table-wrap"><p style="padding:20px" class="text2">Loading...</p></div>`;
  try {
    const [dis, patients] = await Promise.all([Diseases.getAll(_disFilters), Patients.getAll()]);
    const heads = ['ICD Kodi','Kasallik','Bemor','Sana',"Og'irlik darajasi",'Status','Amallar'];
    const rows = dis.map(d => {
      const pat     = patients.find(p=>p.id===d.patientId);
      const encoded = encodeURIComponent(JSON.stringify(d));
      return `<tr>
        <td>${badge(d.icdCode,'badge-primary')}</td>
        <td><div class="fw-600">${escHtml(d.description)}</div>
            <div class="text3 text-sm">${escHtml(d.diagnosis||'')}</div></td>
        <td>${pat?`<div class="flex gap-8" style="align-items:center">${avatar(pat.name,28,'av-accent')}
                   <span>${escHtml(pat.name)}</span></div>`:'<span class="text3">—</span>'}</td>
        <td class="text2">${d.date||''}</td>
        <td>${badge(d.severity, sevCls(d.severity))}</td>
        <td>${badge(d.status, staCls(d.status))}</td>
        <td><div class="flex gap-6">
          <button class="btn btn-sm btn-edit" onclick="openDiseaseFormById('${encoded}')">Tahrirlash</button>
          ${isAdmin?`<button class="btn btn-sm btn-del" onclick="deleteDisease(${d.id})">O'chirish</button>`:''}
        </div></td>
      </tr>`;
    }).join('');
    el.querySelector('.table-wrap').innerHTML = `<table>
      <thead><tr>${heads.map(h=>`<th>${h}</th>`).join('')}</tr></thead>
      <tbody>${rows||`<tr><td colspan="${heads.length}" class="empty">Natija topilmadi</td></tr>`}</tbody>
    </table>`;
  } catch(err) { showToast(err.message,'error'); }
}
function getDisFilter() {
  const q  = document.getElementById('dis-q')?.value||'';
  const sv = document.getElementById('dis-sev')?.value||'';
  const st = document.getElementById('dis-sta')?.value||'';
  renderDiseases({...(q&&{q}), ...(sv&&{severity:sv}), ...(st&&{status:st})});
}

const ICD_LIST = [
  {code:'I10',  desc:'Birlamchi gipertenziya'},
  {code:'I25.1',desc:'Aterosklerotik yurak kasalligi'},
  {code:'G43.0',desc:'Migren — aurasiz'},
  {code:'I21.0',desc:"O'tkir transmural miokard infarkti"},
  {code:'L20.0',desc:'Atopik dermatit'},
  {code:'M17.0',desc:'Tizza artrozi'},
  {code:'J18.9',desc:'Pnevmoniya, aniqlanmagan'},
  {code:'E11.9',desc:'2-tur qandli diabet'},
  {code:'K29.7',desc:'Gastrit, aniqlanmagan'},
  {code:'N39.0',desc:"Siydik yo'li infeksiyasi"},
  {code:'J06.9',desc:"O'tkir yuqori nafas yo'li infeksiyasi"},
  {code:'K21.0',desc:'Gastroezofageal refluks kasalligi'},
];

function openDiseaseFormById(encoded) {
  openDiseaseForm(JSON.parse(decodeURIComponent(encoded)));
}
async function openDiseaseForm(dis=null) {
  let patients = [];
  try { patients = await Patients.getAll(); } catch(_) {}
  const val = (f,fb='') => dis ? (dis[f]!==undefined ? dis[f] : fb) : fb;
  openModal(dis?'Kasallikni tahrirlash':"Yangi kasallik yozuvi", `
    <div class="form-grid">
      <div><label class="fg-label">Bemor <span class="fg-required">*</span></label>
        <select class="fg-select" id="fd-pat">
          <option value="">— Tanlang —</option>
          ${patients.map(p=>`<option value="${p.id}" ${String(val('patientId'))===String(p.id)?'selected':''}>${escHtml(p.name)}</option>`).join('')}
        </select></div>
      <div><label class="fg-label">ICD Kodi <span class="fg-required">*</span></label>
        <select class="fg-select" id="fd-icd" onchange="autoFillDesc()">
          ${ICD_LIST.map(i=>`<option value="${i.code}" ${val('icdCode')===i.code?'selected':''}>${i.code} — ${i.desc}</option>`).join('')}
        </select></div>
      <div><label class="fg-label">Tavsif <span class="fg-required">*</span></label>
        <input class="fg-input" id="fd-desc" value="${escHtml(val('description'))}" placeholder="Kasallik nomi"/></div>
      <div><label class="fg-label">Batafsil tashxis</label>
        <input class="fg-input" id="fd-diag" value="${escHtml(val('diagnosis'))}" placeholder="Klinitsist xulosasi..."/></div>
      <div><label class="fg-label">Og'irlik darajasi</label>
        <select class="fg-select" id="fd-sev">
          ${["Yengil","O'rtacha","Og'ir","Juda og'ir"].map(s=>`<option ${val('severity')===s?'selected':''}>${s}</option>`).join('')}
        </select></div>
      <div><label class="fg-label">Status</label>
        <select class="fg-select" id="fd-sta">
          ${["Under Treatment","Kuzatuvda","Sog'aydi"].map(s=>`<option ${val('status')===s?'selected':''}>${s}</option>`).join('')}
        </select></div>
      <div><label class="fg-label">Sana</label>
        <input class="fg-input" id="fd-date" type="date" value="${val('date',new Date().toISOString().slice(0,10))}"/></div>
    </div>
    <div class="form-actions">
      <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveDisease(${dis?dis.id:'null'})">Save</button>
    </div>`, true);
}
function autoFillDesc() {
  const sel  = document.getElementById('fd-icd');
  const desc = document.getElementById('fd-desc');
  const icd  = ICD_LIST.find(i=>i.code===sel.value);
  if (icd && !desc.value) desc.value = icd.desc;
}
async function saveDisease(id) {
  const data = {
    patientId:   +document.getElementById('fd-pat').value||0,
    icdCode:     document.getElementById('fd-icd').value,
    description: document.getElementById('fd-desc').value.trim(),
    diagnosis:   document.getElementById('fd-diag').value.trim(),
    severity:    document.getElementById('fd-sev').value,
    status:      document.getElementById('fd-sta').value,
    date:        document.getElementById('fd-date').value,
  };
  if (!data.patientId||!data.icdCode||!data.description) {
    showToast("Bemor, ICD kodi va tavsif majburiy",'error'); return;
  }
  try {
    if (id) { await Diseases.update(id,data); showToast("Kasallik yangilandi",'success'); }
    else    { await Diseases.create(data);    showToast("Kasallik qo'shildi",'success'); }
    closeModal(); renderDiseases();
  } catch(err) { showToast(err.message,'error'); }
}
async function deleteDisease(id) {
  openConfirm("Kasallik yozuvini o'chirishni tasdiqlaysizmi?", async () => {
    try { await Diseases.remove(id); showToast("O'chirildi",'info'); renderDiseases(); }
    catch(err) { showToast(err.message,'error'); }
  });
}

async function renderDoctorsView() {
  const el = document.getElementById('page-content');
  el.innerHTML = `<div class="page-header"><h1>Shifokor jadvali</h1><p>Barcha shifokorlar va ularning ish vaqtlari</p></div>
    <p class="text2">Loading...</p>`;
  try {
    const [docs, patients] = await Promise.all([Doctors.getAll(), Patients.getAll()]);
    const cards = docs.map(doc => {
      const cnt = patients.filter(p=>p.doctorId===doc.id).length;
      return `<div class="card doc-card">
        <div class="doc-card-top">
          ${avatar(doc.name,42,'av-primary')}
          <div><div class="doc-card-name">${escHtml(doc.name)}</div>
          <div class="doc-card-spec">${escHtml(doc.specialty)}</div>
          <div style="margin-top:5px">${badge(doc.status, staCls(doc.status))}</div></div>
        </div>
        <div class="doc-card-info">
          🏢 ${escHtml(doc.department)}<br>
          📞 ${escHtml(doc.phone||'—')}<br>
          👥 ${cnt} ta bemor · ${doc.experience} yil tajriba
        </div>
      </div>`;
    }).join('');
    el.innerHTML = `<div class="page-header"><h1>Shifokor jadvali</h1>
      <p>Barcha shifokorlar va ularning ish vaqtlari</p></div>
      <div class="doc-cards">${cards}</div>`;
  } catch(err) { showToast(err.message,'error'); }
}

async function renderClinic() {
  const el = document.getElementById('page-content');
  const isAdmin = currentUser.role==='admin';
  el.innerHTML = `<div class="page-header"><h1>Klinik ma'lumot</h1><p>CareTrack Clinic umumiy ma'lumotlari va xizmatlar</p></div>
    <p class="text2">Loading...</p>`;
  try {
    const [docs, patients, diseases] = await Promise.all([Doctors.getAll(), Patients.getAll(), Diseases.getAll()]);
    const deptMap = {};
    docs.forEach(d => {
      if (!deptMap[d.department]) deptMap[d.department] = {doctors:0, patients:0};
      deptMap[d.department].doctors++;
      patients.filter(p=>p.doctorId===d.id).forEach(()=> deptMap[d.department].patients++);
    });
    const services = [
      "Umumiy amaliyot konsultatsiyalari",
      "Kardiologiya ixtisoslashgan qabul",
      "Nevrologiya ixtisoslashgan qabul",
      "Dermatologiya ixtisoslashgan qabul",
      "Ortopediya ixtisoslashgan qabul",
      "Qon tahlili va laboratoriya xizmatlari",
      "Tasvirlash diagnostikasi (rentgen, UZI)",
      "EKG va yurak elektrokardiyografiyasi",
      "Kasallik va tashxisni yozib olish va boshqarish",
      "Departmentlar bo'ylab bemor tarixini kuzatish",
      "Departmentlar o'rtasida yo'llanma boshqarish",
    ];

    el.innerHTML = `
      <div class="page-header">
        <h1>Klinik ma'lumot</h1>
        <p>CareTrack Clinic umumiy ma'lumotlari va xizmatlar ro'yxati</p>
      </div>

      
      <div class="info-section">
        <h2>🏥 Klinika haqida</h2>
        <div class="info-grid">
          <div class="info-item"><div class="info-item-label">Klinika nomi</div><div class="info-item-value fw-600">CareTrack Clinic</div></div>
          <div class="info-item"><div class="info-item-label">Manzil</div><div class="info-item-value">Toshkent shahri, Sergeli tumani</div></div>
          <div class="info-item"><div class="info-item-label">Dashboard telefon</div><div class="info-item-value">+998 88 613-72-21</div></div>
          <div class="info-item"><div class="info-item-label">Email</div><div class="info-item-value">medicore@caretrack.uz</div></div>
          <div class="info-item"><div class="info-item-label">Ish vaqti</div><div class="info-item-value">Dush–Shanba, 09:00–18:00</div></div>
          <div class="info-item"><div class="info-item-label">Tizimda</div><div class="info-item-value">${docs.length} shifokor · ${patients.length} bemor</div></div>
        </div>
      </div>

      
      <div class="info-section">
        <h2>⚕ Ko'rsatiladigan xizmatlar</h2>
        <ul class="service-list">
          ${services.map(s=>`<li><span class="service-dot"></span>${s}</li>`).join('')}
        </ul>
      </div>

      
      <div class="info-section">
        <h2>🏢 Departmentlar holati</h2>
        <div class="table-wrap" style="box-shadow:none;border-radius:8px">
          <table style="min-width:400px"><thead><tr>
            <th>Department nomi</th><th>Physicians</th><th>Patients</th><th>Status</th>
          </tr></thead><tbody>
          ${Object.entries(deptMap).map(([dept,info])=>`<tr>
            <td class="fw-600">${escHtml(dept)}</td>
            <td>${info.doctors}</td>
            <td>${info.patients}</td>
            <td>${badge('Active','badge-success')}</td>
          </tr>`).join('')}
          </tbody></table>
        </div>
      </div>

      
      <div class="info-section">
        <h2>📊 Kasallik statistikasi</h2>
        <div class="info-grid">
          <div class="info-item"><div class="info-item-label">Jami yozuvlar</div><div class="info-item-value fw-700" style="font-size:22px">${diseases.length}</div></div>
          <div class="info-item"><div class="info-item-label">Under Treatment</div><div class="info-item-value" style="color:var(--primary);font-size:18px;font-weight:700">${diseases.filter(d=>d.status==="Under Treatment").length}</div></div>
          <div class="info-item"><div class="info-item-label">Kuzatuvda</div><div class="info-item-value" style="color:var(--warning);font-size:18px;font-weight:700">${diseases.filter(d=>d.status==="Kuzatuvda").length}</div></div>
          <div class="info-item"><div class="info-item-label">Sog'aydi</div><div class="info-item-value" style="color:var(--success);font-size:18px;font-weight:700">${diseases.filter(d=>d.status==="Sog'aydi").length}</div></div>
        </div>
      </div>`;
  } catch(err) { showToast(err.message,'error'); }
}

function renderEmergency() {
  const el = document.getElementById('page-content');
  const contacts = [
    { dept:"Kardiologiya — Emergency",   phone:"+998 71 200-11-99", avail:"24/7", doc:"Dr. Alisher Karimov",    note:"Yurak xurujlari, o'tkir koronar sindrom" },
    { dept:"Nevrologiya — Emergency",    phone:"+998 71 200-12-99", avail:"24/7", doc:"Dr. Nilufar Rashidova",  note:"Insult, miyaga qon quyilish holatlari" },
    { dept:"Ortopediya — Emergency",     phone:"+998 71 200-13-99", avail:"24/7", doc:"Dr. Malika Yusupova",   note:"Suyak sinishi, travmatologiya" },
    { dept:"Umumiy navbatchI tabib",      phone:"+998 71 200-10-00", avail:"24/7", doc:"Navbatchı shifokor",    note:"Barcha favqulodda holatlar uchun birinchi qo'ng'iroq" },
    { dept:"Tez yordam dispetcheri",      phone:"103",               avail:"24/7", doc:"Tez yordam markazi",    note:"Hayotga xavf soluvchi holatlar" },
  ];
  const rows = contacts.map((c,i) => `<tr>
    <td class="fw-600">${escHtml(c.dept)}</td>
    <td style="font-size:16px;font-weight:700;color:var(--danger)">${escHtml(c.phone)}</td>
    <td>${badge(c.avail,'badge-success')}</td>
    <td class="text2">${escHtml(c.doc)}</td>
    <td class="text2 text-sm">${escHtml(c.note)}</td>
  </tr>`).join('');

  const steps = [
    "Darhol navbatchi shifokorga qo'ng'iroq qiling",
    "Bemorning F.I.O., yoshi va holati haqida ma'lumot bering",
    "Xonangiz raqamini yoki joylashuvingizni bildiring",
    "Ko'rsatmalar bo'yicha harakat qiling — tabib kelguniga qadar",
  ];

  el.innerHTML = `
    <div class="page-header"><h1>Emergency aloqa</h1><p>Ish vaqtidan tashqari va favqulodda tibbiy yordam xizmati</p></div>

    <div class="emergency-banner">
      <div class="emergency-icon">🚨</div>
      <div>
        <div class="emergency-title">Emergency vaziyatda — 24/7 xizmat</div>
        <div class="emergency-sub">Klinika asosiy favqulodda liniyasi — kunning istalgan vaqtida</div>
      </div>
      <div class="emergency-phone">+998 71 200-10-00</div>
    </div>

    <div class="info-section">
      <h2>📞 Departmentlar favqulodda kontaktlari</h2>
      <div class="table-wrap" style="box-shadow:none;border-radius:8px">
        <table style="min-width:600px"><thead><tr>
          <th>Department</th><th>Phone</th><th>Mavjudlik</th><th>Mas'ul shifokor</th><th>Izoh</th>
        </tr></thead><tbody>${rows}</tbody></table>
      </div>
    </div>

    <div class="info-section">
      <h2>📋 Emergency holatlarda harakatlar tartibi</h2>
      <ul class="service-list">
        ${steps.map((s,i)=>`<li>
          <div class="avatar av-primary" style="width:24px;height:24px;font-size:11px;border-radius:50%;flex-shrink:0">${i+1}</div>
          ${s}
        </li>`).join('')}
      </ul>
    </div>

    <div class="info-section">
      <h2>ℹ️ Muhim eslatma</h2>
      <p class="text2" style="font-size:13.5px;line-height:1.8">
        Emergency tibbiy yordam kerak bo'lganda avval <strong style="color:var(--text)">103</strong> (Tez yordam)ga murojaat qiling.
        Klinika ichidagi favqulodda holatlarda navbatchi shifokorni chaqiring.
        Barcha favqulodda murojaat 24 soat, haftaning 7 kuni qabul qilinadi.
      </p>
    </div>`;
}

window.addEventListener('DOMContentLoaded', () => {
  initTheme();
  localStorage.removeItem('token'); 
});