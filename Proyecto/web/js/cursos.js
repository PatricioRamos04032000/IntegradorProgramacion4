import { api } from './api.js';

let page = 1;
const pageSize = 10;

function qs() {
  const q = document.getElementById('q').value.trim();
  const estado = document.getElementById('estado').value;
  const p = new URLSearchParams();
  if (q) p.set('q', q);
  if (estado) p.set('estado', estado);
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
    const data = await api.get(`/cursos?${qs()}`);
    if (!data) return;

    const sel = document.getElementById('estado');
    if (sel.options.length === 0) {
      sel.appendChild(new Option('Todos', ''));
      (data.estados || []).forEach((e) => {
        sel.appendChild(new Option(e.descripcion, String(e.id_curso_estado)));
      });
      if (data.filtros && data.filtros.estado) {
        sel.value = String(data.filtros.estado);
      }
      if (data.filtros && data.filtros.q) {
        document.getElementById('q').value = data.filtros.q;
      }
    }

    const tbody = document.getElementById('tbody');
    tbody.innerHTML = '';
    (data.items || []).forEach((c) => {
      const tr = document.createElement('tr');
      const fi = c.fecha_inicio ? new Date(c.fecha_inicio).toLocaleDateString('es-AR') : '—';
      tr.innerHTML = `
        <td>${c.id_curso}</td>
        <td>${c.nombre}</td>
        <td>${fi}</td>
        <td>${c.cantidad_horas}</td>
        <td>${c.inscriptos_max}</td>
        <td>${c.estado || ''}</td>
        <td>
          <a class="btn btn-sm btn-outline-primary" href="cursos-detalle.html?id=${c.id_curso}">Ver</a>
          <a class="btn btn-sm btn-outline-secondary" href="cursos-editar.html?id=${c.id_curso}">Editar</a>
          <button type="button" class="btn btn-sm btn-outline-danger btn-del" data-id="${c.id_curso}">Eliminar</button>
        </td>`;
      tbody.appendChild(tr);
    });

    document.querySelectorAll('.btn-del').forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (!window.confirm('¿Eliminar este curso?')) return;
        const id = btn.getAttribute('data-id');
        try {
          await api.del(`/cursos/${id}`);
          await cargar();
        } catch (e) {
          showError(e.message || 'No se pudo eliminar.');
        }
      });
    });

    document.getElementById('pag-info').textContent = `Página ${data.page} de ${data.totalPages} (${data.total} resultados)`;
    document.getElementById('btn-prev').disabled = data.page <= 1;
    document.getElementById('btn-next').disabled = data.page >= data.totalPages;
  } catch (e) {
    showError(e.message || 'Error al cargar cursos.');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('filtros').addEventListener('submit', (e) => {
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
