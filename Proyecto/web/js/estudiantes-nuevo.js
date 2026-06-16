import { requireAuth } from './requireAuth.js';
import { api } from './api.js';

function showError(msg) {
  const el = document.getElementById('error');
  el.textContent = msg;
  el.style.display = 'block';
}

document.addEventListener('DOMContentLoaded', async () => {
  await requireAuth();

  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const localTodayStr = `${year}-${month}-${day}`;
  document.getElementById('fecha_nacimiento').max = localTodayStr;

  document.getElementById('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    document.getElementById('error').style.display = 'none';

    const fechaNacimientoVal = document.getElementById('fecha_nacimiento').value;
    if (fechaNacimientoVal > localTodayStr) {
      showError('La fecha de nacimiento no puede ser futura a la actual.');
      return;
    }

    const body = {
      documento: document.getElementById('documento').value.trim(),
      apellido: document.getElementById('apellido').value.trim(),
      nombres: document.getElementById('nombres').value.trim(),
      email: document.getElementById('email').value.trim(),
      fechaNacimiento: fechaNacimientoVal,
    };
    try {
      const est = await api.post('/api/v2/estudiantes', body);
      window.location.href = `estudiantes-detalle.html?id=${est.idEstudiante}`;
    } catch (err) {
      showError(err.message || 'Error al crear.');
    }
  });
});
