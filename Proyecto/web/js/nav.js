import { API_BASE } from './config.js';
import { clearSession } from './auth.js';

function paginaActual() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  if (page === 'index.html') return 'index.html';
  if (page.startsWith('inscripciones')) return 'inscripciones.html';
  if (page.startsWith('estudiantes')) return 'estudiantes.html';
  if (page.startsWith('cursos')) return 'cursos.html';
  return page;
}

function cerrarNavMobile(nav) {
  if (window.innerWidth >= 992 || typeof bootstrap === 'undefined') return;
  const inst = bootstrap.Collapse.getInstance(nav);
  if (inst) inst.hide();
}

function initNav() {
  const header = document.querySelector('.fcad-header');
  const nav = document.querySelector('.fcad-nav');
  if (!header || !nav) return;

  nav.id = 'fcad-nav-collapse';
  nav.classList.add('collapse', 'fcad-nav-collapse');

  const titulo = header.querySelector('.fcad-titulo');
  if (titulo && !header.querySelector('.fcad-nav-toggler')) {
    const grupo = document.createElement('div');
    grupo.className = 'd-flex align-items-center gap-2 flex-grow-1 min-w-0';

    const toggler = document.createElement('button');
    toggler.type = 'button';
    toggler.className = 'fcad-nav-toggler navbar-toggler border-0 shadow-none';
    toggler.setAttribute('data-bs-toggle', 'collapse');
    toggler.setAttribute('data-bs-target', '#fcad-nav-collapse');
    toggler.setAttribute('aria-controls', 'fcad-nav-collapse');
    toggler.setAttribute('aria-expanded', 'false');
    toggler.setAttribute('aria-label', 'Abrir menú');
    toggler.innerHTML = '<span class="navbar-toggler-icon"></span>';

    const logoLink = document.createElement('a');
    logoLink.href = 'index.html';
    logoLink.className = 'd-flex align-items-center ms-1 me-1';
    logoLink.innerHTML = '<img src="fcad-logo.png" alt="FCAD Logo" style="height: 48px; width: auto; object-fit: contain;">';

    titulo.parentNode.insertBefore(grupo, titulo);
    grupo.appendChild(toggler);
    grupo.appendChild(logoLink);
    grupo.appendChild(titulo);
  }

  const activa = paginaActual();
  nav.querySelectorAll('a[href]').forEach((link) => {
    const href = link.getAttribute('href');
    if (href === activa) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
    link.addEventListener('click', () => cerrarNavMobile(nav));
  });

  const logout = document.getElementById('logout-link');
  if (logout) {
    logout.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        await fetch(`${API_BASE}/api/v2/auth/logout`, {
          method: 'POST',
          credentials: 'include',
        });
      } catch {
        // Si falla el logout remoto, igual limpiamos la sesion local.
      }
      clearSession();
      window.location.href = 'login.html';
    });
  }
}

document.addEventListener('DOMContentLoaded', initNav);
