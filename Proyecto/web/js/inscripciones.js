import { api } from './api.js';

let page = 1;
const pageSize = 10;

function qs() {
  const q = document.getElementById('q').value.trim();
  const p = new URLSearchParams();
  if (q) p.set('q', q);
  p.set('page', String(page));
  p.set('pageSize', String(pageSize));
  return p.toString();
}

function showError(msg) {
  const el = document.getElementById('error');
  el.textContent = msg;
  el.style.display = 'block';
}

async function cargar() {
  document.getElementById('error').style.display = 'none';
  try {
    const data = await api.get(`/inscripciones?${qs()}`);
    if (!data) return;
    document.getElementById('pag').textContent = String(data.page);
    const tbody = document.getElementById('tbody');
    tbody.innerHTML = '';
    (data.items || []).forEach((ins) => {
      const tr = document.createElement('tr');
      const fecha = ins.fecha_hora_inscripcion
        ? new Date(ins.fecha_hora_inscripcion).toLocaleDateString('es-AR')
        : '—';
      tr.innerHTML = `
        <td>${fecha}</td>
        <td>${ins.curso_nombre}</td>
        <td>${ins.apellido}, ${ins.nombres}</td>
        <td>${ins.documento}</td>
        <td>
          <a class="btn btn-sm btn-outline-primary" href="inscripciones-detalle.html?id=${ins.id_inscripcion}">Ver</a>
          <button type="button" class="btn btn-sm btn-outline-danger btn-del" data-id="${ins.id_inscripcion}">Dar de baja</button>
        </td>`;
      tbody.appendChild(tr);
    });
    document.querySelectorAll('.btn-del').forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (!window.confirm('¿Dar de baja esta inscripción?')) return;
        const id = btn.getAttribute('data-id');
        try {
          await api.del(`/inscripciones/${id}`);
          await cargar();
        } catch (e) {
          showError(e.message || 'No se pudo dar de baja.');
        }
      });
    });
    document.getElementById('btn-prev').disabled = data.page <= 1;
    document.getElementById('btn-next').disabled = !data.hasNext;
  } catch (e) {
    showError(e.message || 'Error al cargar inscripciones.');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('buscar').addEventListener('submit', (e) => {
    e.preventDefault();
    page = 1;
    cargar();
  });
  document.getElementById('btn-prev').addEventListener('click', () => {
    if (page > 1) {
      page -= 1;
      cargar();
    }
  });
  document.getElementById('btn-next').addEventListener('click', () => {
    page += 1;
    cargar();
  });
  cargar();
});
