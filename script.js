const STORAGE_KEY = 'stadium-seat-markers-v2';
const mapWrapper = document.getElementById('mapWrapper');
const markersLayer = document.getElementById('markersLayer');
const seatList = document.getElementById('seatList');
const dialog = document.getElementById('seatDialog');
const form = document.getElementById('seatForm');
const nameInput = document.getElementById('personName');
const noteInput = document.getElementById('seatNote');
const cancelBtn = document.getElementById('cancelBtn');

let markers = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
let pendingPoint = null;

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(markers));
}

function render() {
  markersLayer.innerHTML = '';
  seatList.innerHTML = '';

  if (markers.length === 0) {
    seatList.textContent = 'No seats marked yet.';
    seatList.className = 'seat-list empty';
  } else {
    seatList.className = 'seat-list';
  }

  markers.forEach((m) => {
    const marker = document.createElement('div');
    marker.className = 'marker';
    marker.style.left = `${m.x}%`;
    marker.style.top = `${m.y}%`;
    marker.title = `${m.name}${m.note ? ' — ' + m.note : ''}. Click to remove.`;
    marker.innerHTML = `<div class="label"></div><div class="pin"></div>`;
    marker.querySelector('.label').textContent = m.name;
    marker.addEventListener('click', (event) => {
      event.stopPropagation();
      if (confirm(`Remove marker for ${m.name}?`)) {
        markers = markers.filter(item => item.id !== m.id);
        save();
        render();
      }
    });
    markersLayer.appendChild(marker);

    const item = document.createElement('div');
    item.className = 'seat-item';
    const details = document.createElement('div');
    details.innerHTML = `<strong></strong><span></span>`;
    details.querySelector('strong').textContent = m.name;
    details.querySelector('span').textContent = m.note || `Position: ${m.x.toFixed(1)}%, ${m.y.toFixed(1)}%`;
    const remove = document.createElement('button');
    remove.textContent = 'Remove';
    remove.addEventListener('click', () => {
      markers = markers.filter(item => item.id !== m.id);
      save();
      render();
    });
    item.append(details, remove);
    seatList.appendChild(item);
  });
}

mapWrapper.addEventListener('click', (event) => {
  const rect = mapWrapper.getBoundingClientRect();
  pendingPoint = {
    x: ((event.clientX - rect.left) / rect.width) * 100,
    y: ((event.clientY - rect.top) / rect.height) * 100
  };
  nameInput.value = '';
  noteInput.value = '';
  dialog.showModal();
  nameInput.focus();
});

form.addEventListener('submit', () => {
  if (!pendingPoint) return;
  markers.push({
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    name: nameInput.value.trim(),
    note: noteInput.value.trim(),
    x: pendingPoint.x,
    y: pendingPoint.y,
    createdAt: new Date().toISOString()
  });
  pendingPoint = null;
  save();
  render();
});

cancelBtn.addEventListener('click', () => dialog.close());

render();
