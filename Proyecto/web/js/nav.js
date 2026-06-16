import { performLogout } from './auth.js';

function paginaActual() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  if (page === 'index.html') return 'index.html';
  if (page.startsWith('inscripciones')) return 'inscripciones.html';
  if (page.startsWith('estudiantes')) return 'estudiantes.html';
  if (page.startsWith('cursos')) return 'cursos.html';
  return page;
}

function initLogout() {
  const logout = document.getElementById('logout-link');
  if (!logout) return;

  logout.addEventListener('click', async (e) => {
    e.preventDefault();
    await performLogout();
  });
}

function initSidebarNav(nav) {
  const activa = paginaActual();
  nav.querySelectorAll('a[href]').forEach((link) => {
    const href = link.getAttribute('href');
    if (href === activa) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });
}

function initResponsiveNav() {
  const nav = document.querySelector('.fcad-nav');
  const container = document.querySelector('.fcad-contenedor-principal');
  if (!nav || !container) return;

  // 1. Crear cabecera móvil
  const mobileHeader = document.createElement('div');
  mobileHeader.className = 'fcad-mobile-header';
  
  // Botón hamburguesa
  const hamburgerBtn = document.createElement('button');
  hamburgerBtn.type = 'button';
  hamburgerBtn.className = 'fcad-hamburger-btn';
  hamburgerBtn.setAttribute('aria-label', 'Abrir menú');
  hamburgerBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <line x1="3" y1="12" x2="21" y2="12"></line>
      <line x1="3" y1="6" x2="21" y2="6"></line>
      <line x1="3" y1="18" x2="21" y2="18"></line>
    </svg>
  `;
  
  // Logo en cabecera móvil
  const mobileBrand = document.createElement('a');
  mobileBrand.href = 'index.html';
  mobileBrand.className = 'fcad-mobile-brand';
  mobileBrand.innerHTML = `<img src="fcad-logo.png" alt="FCAD Logo" class="mobile-logo" />`;
  
  // Espaciador para centrar logo en flex
  const spacer = document.createElement('div');
  spacer.style.width = '40px';

  mobileHeader.appendChild(hamburgerBtn);
  mobileHeader.appendChild(mobileBrand);
  mobileHeader.appendChild(spacer);
  
  container.insertBefore(mobileHeader, container.firstChild);

  // 2. Crear backdrop
  const backdrop = document.createElement('div');
  backdrop.className = 'fcad-nav-backdrop';
  document.body.appendChild(backdrop);

  // Funciones de control
  function openMenu() {
    nav.classList.add('mobile-open');
    backdrop.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    nav.classList.remove('mobile-open');
    backdrop.classList.remove('show');
    document.body.style.overflow = '';
  }

  hamburgerBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openMenu();
  });

  backdrop.addEventListener('click', closeMenu);

  // Botón cerrar (X) dentro del drawer
  const brandContainer = nav.querySelector('.fcad-brand');
  if (brandContainer) {
    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'fcad-sidebar-close-btn';
    closeBtn.setAttribute('aria-label', 'Cerrar menú');
    closeBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    `;
    closeBtn.addEventListener('click', closeMenu);
    brandContainer.appendChild(closeBtn);
  }

  // Cerrar menú al hacer clic en cualquier enlace
  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });
}

function initNav() {
  initLogout();

  const nav = document.querySelector('.fcad-nav');
  if (nav) {
    initSidebarNav(nav);
    initResponsiveNav();
  }
}

document.addEventListener('DOMContentLoaded', initNav);
