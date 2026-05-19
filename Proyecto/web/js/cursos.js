import { api } from './api.js';

const pageSize = 10;
let offset = 0;
let estadosCargados = false;

function qs() {
  const nombre = document.getElementById('nombre').value.trim();
  const idCursoEstado = document.getElementById('idCursoEstado').value;
  const p = new URLSearchParams();
  if (nombre) p.set('nombre', nombre);
  if (idCursoEstado) p.set('idCursoEstado', idCursoEstado);
  p.set('limit', String(pageSize));
  p.set('offset', String(offset));
  return p.toString();
}

function showError(msg) {
  const el = document.getElementById('errorModal');
  document.getElementById('errorModalBody').textContent = msg;
  const modal = new bootstrap.Modal(el);
  el.addEventListener('hide.bs.modal', () => document.activeElement?.blur(), { once: true });
  modal.show();
}

async function cargarEstados() {
  if (estadosCargados) return;
  try {
    const estados = await api.get('/api/v2/cursos/estados');
    if (!estados) return;
    const sel = document.getElementById('idCursoEstado');
    sel.appendChild(new Option('Todos', ''));
    estados.forEach((e) => {
      sel.appendChild(new Option(e.descripcion, String(e.idCursoEstado)));
    });
    estadosCargados = true;
  } catch (e) {
    showError(e.message || 'Error al cargar estados.');
  }
}

async function cargar() {
  try {
    await cargarEstados();

    const data = await api.get(`/api/v2/cursos?${qs()}`);
    if (!data) return;

    const tbody = document.getElementById('tbody');
    tbody.innerHTML = '';
    (data.items || []).forEach((c) => {
      const tr = document.createElement('tr');
      const fi = c.fechaInicio ? new Date(c.fechaInicio).toLocaleDateString('es-AR') : '\u2014';
      tr.innerHTML = `
        <td>${c.idCurso}</td>
        <td>${c.nombre}</td>
        <td>${fi}</td>
        <td>${c.cantidadHoras}</td>
        <td>${c.inscriptosMax}</td>
        <td>${c.estado || ''}</td>
        <td>
          <a class="btn btn-sm btn-outline-primary" href="cursos-detalle.html?id=${c.idCurso}">Ver</a>
          <a class="btn btn-sm btn-outline-secondary" href="cursos-editar.html?id=${c.idCurso}">Editar</a>
          <button type="button" class="btn btn-sm btn-outline-danger btn-del" data-id="${c.idCurso}">Eliminar</button>
        </td>`;
      tbody.appendChild(tr);
    });

    document.querySelectorAll('.btn-del').forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (!window.confirm('\u00bfEliminar este curso?')) return;
        const id = btn.getAttribute('data-id');
        try {
          await api.del(`/api/v2/cursos/${id}`);
          await cargar();
        } catch (e) {
          showError(e.message || 'No se pudo eliminar.');
        }
      });
    });

    const total = data.total || 0;
    const currentPage = Math.floor(offset / pageSize) + 1;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    document.getElementById('pag-info').textContent = `P\u00e1gina ${currentPage} de ${totalPages} (${total} resultados)`;
    document.getElementById('btn-prev').disabled = offset <= 0;
    document.getElementById('btn-next').disabled = offset + pageSize >= total;
  } catch (e) {
    showError(e.message || 'Error al cargar cursos.');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('filtros').addEventListener('submit', (e) => {
    e.preventDefault();
    offset = 0;
    cargar();
  });
  document.getElementById('btn-prev').addEventListener('click', () => {
    if (offset >= pageSize) {
      offset -= pageSize;
      cargar();
    }
  });
  document.getElementById('btn-next').addEventListener('click', () => {
    offset += pageSize;
    cargar();
  });
  cargar();
});
