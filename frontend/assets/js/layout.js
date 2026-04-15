(function () {
  function isInsurancePage() {
    return window.location.pathname.includes('/seguros/') || /\/seguros\//.test(window.location.href);
  }

  function paths() {
    const insurancePage = isInsurancePage();
    return {
      home: insurancePage ? '../index.html' : './index.html',
      assets: insurancePage ? '../../assets' : '../assets',
      instagram: 'https://www.instagram.com/innovacorretoradeseguros/',
      facebook: 'https://www.facebook.com/innovacorretoradeseguros/',
      linkedin: 'https://www.linkedin.com/innovacorretoradeseguros/',
      youtube: 'https://www.youtube.com/innovacorretoradeseguros/'
    };
  }

  function renderHeader() {
    const target = document.getElementById('site-header');
    if (!target) return;

    const p = paths();
    target.innerHTML = `
      <div class="topbar">
        <div class="container topbar-inner">
          <div class="topbar-contact">
            <a href="tel:+5571981125225"><i class="fa-solid fa-phone"></i> (71) 98112-5225</a>
            <a href="mailto:contato@innovaseguros.net.br"><i class="fa-solid fa-envelope"></i> contato@innovaseguros.net.br</a>
          </div>
          <div class="topbar-social" aria-label="Redes sociais">
            <a href="${p.instagram}" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><i class="fa-brands fa-instagram"></i></a>
            <a href="${p.facebook}" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><i class="fa-brands fa-facebook-f"></i></a>
            <a href="${p.linkedin}" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><i class="fa-brands fa-linkedin-in"></i></a>
            <a href="${p.youtube}" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><i class="fa-brands fa-youtube"></i></a>
          </div>
        </div>
      </div>
      <div class="nav-wrap container">
        <a class="brand brand-logo" href="${p.home}" aria-label="Innova Corretora de Seguros">
          <img src="${p.assets}/img/logomarca.png" alt="Innova Corretora de Seguros" />
        </a>
        <nav class="nav">
          <a href="${p.home}#seguros">Seguros</a>
          <a href="${p.home}#diferenciais">Diferenciais</a>
          <a href="${p.home}#faq">FAQ</a>
        </nav>
        <a class="btn btn-light" href="${p.home}#seguros">Escolher seguro</a>
      </div>`;
  }

  function renderFooter() {
    const target = document.getElementById('site-footer');
    if (!target) return;

    const p = paths();
    target.innerHTML = `
      <footer class="footer">
        <div class="container footer-grid">
          <div>
            <a class="brand brand-logo footer-logo" href="${p.home}" aria-label="Innova Corretora de Seguros">
              <img src="${p.assets}/img/logomarca.png" alt="Innova Corretora de Seguros" />
            </a>
            <p class="footer-text">Atendimento em Salvador e RMS, com soluções voltadas para quem busca segurança, agilidade e orientação de confiança na hora de contratar seu seguro.</p>
          </div>
          <div>
            <h3>Contato</h3>
            <ul class="footer-list">
              <li><a href="tel:+5571981125225">(71) 98112-5225</a></li>
              <li><a href="mailto:contato@innovaseguros.net.br">contato@innovaseguros.net.br</a></li>
              <li>Salvador e RMS</li>
            </ul>
          </div>
          <div>
            <h3>Redes sociais</h3>
            <div class="footer-social" aria-label="Redes sociais da Innova Corretora">
              <a href="${p.instagram}" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><i class="fa-brands fa-instagram"></i></a>
              <a href="${p.facebook}" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><i class="fa-brands fa-facebook-f"></i></a>
              <a href="${p.linkedin}" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><i class="fa-brands fa-linkedin-in"></i></a>
              <a href="${p.youtube}" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><i class="fa-brands fa-youtube"></i></a>
            </div>
          </div>
        </div>
        <div class="container footer-bottom">
          <p align="center">© 2026. Innova Corretora de Seguros Ltda.</p>
          <p align="center">Todos os direitos reservados.</p>
        </div>
      </footer>`;
  }

  document.addEventListener('DOMContentLoaded', function () {
    renderHeader();
    renderFooter();
  });
})();
