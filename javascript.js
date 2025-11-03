// Petite app JS pour gérer la liste de collaborateurs
// Persistance simple via localStorage

const STORAGE_KEY = 'mini_collab_team_v1';

const defaultTeam = [
  {id: id(), name: 'Alice', role: 'Designer'},
  {id: id(), name: 'Bob', role: 'Dev'},
  {id: id(), name: 'Clara', role: 'PM'}
];

function id() {
  return Math.random().toString(36).slice(2, 9);
}

function loadTeam() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : defaultTeam.slice();
  } catch (e) {
    console.error('Erreur parse localStorage', e);
    return defaultTeam.slice();
  }
}

function saveTeam(arr) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}

let team = loadTeam();

const cardsEl = document.getElementById('cards');
const addForm = document.getElementById('addForm');
const filterInput = document.getElementById('filterInput');
const clearBtn = document.getElementById('clearBtn');

function render(filter = '') {
  cardsEl.innerHTML = '';
  const q = filter.trim().toLowerCase();
  const list = team.filter(t => !q || t.role.toLowerCase().includes(q));
  if (list.length === 0) {
    cardsEl.innerHTML = `<p style="color:#6b7280">Aucun collaborateur trouvé.</p>`;
    return;
  }
  list.forEach(member => {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <div class="meta">
        <div class="avatar">${(member.name[0]||'?').toUpperCase()}</div>
        <div>
          <h3>${escapeHtml(member.name)}</h3>
          <p>${escapeHtml(member.role)}</p>
        </div>
      </div>
      <div class="actions">
        <button class="btn edit" data-id="${member.id}">Éditer</button>
        <button class="btn delete" data-id="${member.id}">Supprimer</button>
      </div>
    `;
    cardsEl.appendChild(card);
  });
  attachActions();
}

function attachActions(){
  document.querySelectorAll('.btn.delete').forEach(btn=>{
    btn.onclick = () => {
      const id = btn.dataset.id;
      team = team.filter(t=>t.id!==id);
      saveTeam(team);
      render(filterInput.value);
    };
  });
  document.querySelectorAll('.btn.edit').forEach(btn=>{
    btn.onclick = () => {
      const id = btn.dataset.id;
      const member = team.find(t=>t.id===id);
      if(!member) return;
      const newName = prompt('Nom:', member.name);
      if(newName===null) return;
      const newRole = prompt('Rôle:', member.role);
      if(newRole===null) return;
      member.name = newName.trim() || member.name;
      member.role = newRole.trim() || member.role;
      saveTeam(team);
      render(filterInput.value);
    };
  });
}

addForm.addEventListener('submit', (e)=>{
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const role = document.getElementById('role').value.trim();
  if(!name || !role) return;
  const newMember = { id: id(), name, role };
  team.unshift(newMember);
  saveTeam(team);
  addForm.reset();
  render(filterInput.value);
});

filterInput.addEventListener('input', () => render(filterInput.value));
clearBtn.addEventListener('click', () => { filterInput.value=''; render(); });

function escapeHtml(str){
  return String(str).replace(/[&<>"']/g, function(m){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]); });
}

// initial render
render();
g