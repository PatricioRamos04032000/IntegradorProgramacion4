import { requireAuth } from './requireAuth.js';
import { api } from './api.js';

requireAuth();

let page = 1;
const pageSize = 10;

function qs() {
  const p = new URLSearchParams();
  ['documento', 'apellido', 'nombres', 'email'].forEach((field) => {
    const val = document.getElementById(field)?.value.trim();
    if (val) p.set(field, val);
  });
  p.set('limit', String(pageSize));
  p.set('offset', String((page - 1) * pageSize));
  return p.toString();
}

function showError(msg) {
  const el = document.getElementById('error');
  el.textContent = msg;
  el.style.display = 'block';
}

function limpiarFiltros() {
  ['documento', 'apellido', 'nombres', 'email'].forEach((field) => {
    const el = document.getElementById(field);
    if (el) el.value = '';
  });
}

async function cargar() {
  document.getElementById('error').style.display = 'none';
  try {
    const data = await api.get(`/api/v2/estudiantes?${qs()}`);
    if (!data) return;
    document.getElementById('pag').textContent = String(page);
    const tbody = document.getElementById('tbody');
    tbody.innerHTML = '';
    (data.items || []).forEach((s) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${s.documento}</td>
        <td>${s.apellido}</td>
        <td>${s.nombres}</td>
        <td>${s.email}</td>
        <td class="fcad-tabla-acciones">
          <a class="btn btn-sm btn-outline-primary" href="estudiantes-detalle.html?id=${s.idEstudiante}">Ver</a>
          <a class="btn btn-sm btn-outline-secondary" href="estudiantes-editar.html?id=${s.idEstudiante}">Editar</a>
          <button type="button" class="btn btn-sm btn-outline-danger btn-del" data-id="${s.idEstudiante}">Borrar</button>
        </td>`;
      tbody.appendChild(tr);
    });
    document.querySelectorAll('.btn-del').forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (!window.confirm('¿Eliminar este estudiante?')) return;
        const id = btn.getAttribute('data-id');
        try {
          await api.del(`/api/v2/estudiantes/${id}`);
          await cargar();
        } catch (e) {
          showError(e.message || 'No se pudo eliminar.');
        }
      });
    });
    const hasNext = (page - 1) * pageSize + (data.items || []).length < (data.total || 0);
    document.getElementById('btn-prev').disabled = page <= 1;
    document.getElementById('btn-next').disabled = !hasNext;
  } catch (e) {
    showError(e.message || 'Error al cargar estudiantes.');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('buscar').addEventListener('submit', (e) => {
    e.preventDefault();
    page = 1;
    cargar();
  });
  document.getElementById('btn-limpiar').addEventListener('click', () => {
    limpiarFiltros();
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
