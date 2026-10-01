import { useEffect, useRef } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { useInstitutionalViewModel } from '../../viewmodel/useInstitutionalViewModel';
import { useReadingMode } from '../../viewmodel/useReadingMode';
import { InstitutionalBook } from '../components/InstitutionalBook';
import { LegalDocumentContent } from '../components/LegalDocumentContent';
import { AccessDialog } from '../components/AccessDialog';
import { Icon } from '../components/Icon';
import { useScrollLock } from '../hooks/useScrollLock';
import { theme } from '../styles/theme';
import '../styles/institutional.css';
import '../styles/book-experience.css';

export default function InstitutionalScreen() {
  const vm = useInstitutionalViewModel();
  const reading = useReadingMode();
  const menuButton = useRef<HTMLButtonElement>(null);
  const previousPage = useRef(vm.page);

  useEffect(() => {
    document.documentElement.lang = 'pt-BR';
    document.title = vm.document
      ? `${vm.document.title} | IpêBook`
      : 'IpêBook — Uma boa história merece continuar';
    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.content =
      vm.document?.intro ||
      'Conheça o IpêBook: um projeto de compra, troca e doação de livros para conectar leitores em Piripiri, Piauí.';
    if (previousPage.current !== vm.page) {
      window.scrollTo(0, 0);
      document.getElementById('conteudo')?.focus({ preventScroll: true });
      previousPage.current = vm.page;
    }
  }, [vm.page, vm.hash, vm.document]);

  useScrollLock(vm.menuOpen);

  const footer = (
    <footer className="site-footer container">
      <div className="footer-top">
        <div>
          <a className="brand" href="/#inicio">
            <img
              src={require('../../../assets/logo-web-96.webp')}
              alt=""
              width="36"
              height="36"
              style={{ borderRadius: '50%', objectFit: 'cover' }}
            />
            <span>IpêBook</span>
          </a>
          <p>Boas histórias merecem novos leitores.</p>
          <span className="footer-location">Feito para Piripiri, Piauí.</span>
        </div>
        <nav aria-label="Sobre o IpêBook">
          <h2>O projeto</h2>
          <a href="/#sobre">Sobre o IpêBook</a>
          <a href="/#como-funciona">Como funciona</a>
          <a href="/#duvidas">Dúvidas frequentes</a>
        </nav>
        <nav aria-label="Transparência">
          <h2>Transparência</h2>
          {vm.legalLinks.map((link) => (
            <a href={link.href} key={link.id}>
              {link.label}
            </a>
          ))}
        </nav>
        <nav aria-label="Acompanhe">
          <h2>Acompanhe</h2>
          <a
            href={vm.instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${vm.instagram.label} (abre em nova aba)`}
          >
            {vm.instagram.handle}
          </a>
          <a href={vm.contact.url} aria-label={`${vm.contact.label}: ${vm.contact.email}`}>
            {vm.contact.email}
          </a>
        </nav>
      </div>
      <div className="footer-bottom">
        <span>© 2026 IpêBook. Projeto de faculdade, sem fins lucrativos, em construção.</span>
        <span>Livros circulam. Histórias continuam.</span>
      </div>
    </footer>
  );

  return (
    <div
      onClick={(event) => {
        // Links internos navegam sem recarregar; abas novas, downloads e teclas modificadoras ficam com o navegador.
        const link = (event.target as HTMLElement).closest?.('a[href]');
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          !link ||
          link.hasAttribute('download') ||
          (link.getAttribute('target') ?? '_self') !== '_self'
        )
          return;
        const href = link.getAttribute('href') ?? '';
        if (!href.startsWith('/') || href.startsWith('//')) return;
        event.preventDefault();
        vm.navigate(href);
      }}
      className={`institutional ${vm.document ? '' : 'institutional-book'} ${
        !vm.document && !reading.isBook ? 'is-normal-reading' : ''
      }`}
      style={theme}
    >
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <header
        className="site-header"
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            vm.closeMenu();
            menuButton.current?.focus();
          }
        }}
      >
        <div className="container header-inner">
          <a className="brand" href="/#inicio" aria-label="IpêBook — início">
            <img
              src={require('../../../assets/logo-web-96.webp')}
              alt=""
              width="36"
              height="36"
              style={{ borderRadius: '50%', objectFit: 'cover' }}
            />
            <span>IpêBook</span>
          </a>
          <button
            ref={menuButton}
            className="menu-toggle"
            type="button"
            aria-label={vm.menuOpen ? 'Fechar sumário' : 'Abrir sumário'}
            aria-expanded={vm.menuOpen}
            aria-controls="main-navigation"
            onClick={vm.toggleMenu}
          >
            <Icon name={vm.menuOpen ? 'close' : 'menu'} size={18} />
            <span>{vm.menuOpen ? 'Fechar' : 'Sumário'}</span>
          </button>
          <nav
            id="main-navigation"
            aria-label="Navegação principal"
            className={`main-navigation ${vm.menuOpen ? 'is-open' : ''}`}
          >
            {/* Navegação horizontal para desktop */}
            <div className="nav-desktop-links">
              <a
                href="/#como-funciona"
                onClick={vm.closeMenu}
                aria-current={vm.hash === '#como-funciona' ? 'page' : undefined}
              >
                Como funciona
              </a>
              <a
                href="/#sobre"
                onClick={vm.closeMenu}
                aria-current={vm.hash === '#sobre' ? 'page' : undefined}
              >
                Sobre o projeto
              </a>
              <a
                href="/#duvidas"
                onClick={vm.closeMenu}
                aria-current={vm.hash === '#duvidas' ? 'page' : undefined}
              >
                Dúvidas
              </a>
              <a
                href={vm.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                className="nav-social"
                aria-label="Acompanhe no Instagram (abre em nova aba)"
              >
                Instagram
              </a>
            </div>

            {/* Sumário editorial exclusivo para o menu móvel */}
            <div className="nav-mobile-editorial">
              <div className="nav-editorial-header">
                <span className="nav-editorial-label">
                  <Icon name="leaf" size={14} /> Capítulos do livro
                </span>
                <span className="nav-ribbon-tag">6 capítulos</span>
              </div>
              <div className="nav-chapters-grid">
                {[
                  {
                    id: 'inicio',
                    num: '01',
                    title: 'Início',
                    desc: 'Uma boa história merece continuar',
                  },
                  {
                    id: 'sobre',
                    num: '02',
                    title: 'Sobre o projeto',
                    desc: 'O que nos move e raízes em Piripiri',
                  },
                  {
                    id: 'como-funciona',
                    num: '03',
                    title: 'Como funciona',
                    desc: 'Comprar, vender, trocar e doar',
                  },
                  {
                    id: 'em-construcao',
                    num: '04',
                    title: 'Estante de livros',
                    desc: 'Exemplos práticos e filtros de leitura',
                  },
                  {
                    id: 'duvidas',
                    num: '05',
                    title: 'Dúvidas frequentes',
                    desc: 'Perguntas comuns e respostas',
                  },
                  {
                    id: 'proximo-capitulo',
                    num: '06',
                    title: 'O próximo capítulo',
                    desc: 'Construindo juntos na comunidade',
                  },
                ].map((chapter) => {
                  const isActive =
                    vm.hash === `#${chapter.id}` || (!vm.hash && chapter.id === 'inicio');
                  return (
                    <a
                      key={chapter.id}
                      href={`/#${chapter.id}`}
                      onClick={vm.closeMenu}
                      className={`nav-chapter-card ${isActive ? 'is-active' : ''}`}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <span className="nav-chapter-num">{chapter.num}</span>
                      <div className="nav-chapter-details">
                        <strong className="nav-chapter-title">{chapter.title}</strong>
                        <span className="nav-chapter-desc">{chapter.desc}</span>
                      </div>
                      <span className="nav-chapter-arrow" aria-hidden="true">
                        <Icon name="arrow" size={14} />
                      </span>
                    </a>
                  );
                })}
              </div>

              <div className="nav-community-section">
                <span className="nav-section-title">Comunidade & Redes</span>
                <a
                  href={vm.instagram.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="nav-community-card"
                  aria-label="Acompanhe o IpêBook no Instagram (abre em nova aba)"
                >
                  <div className="nav-community-badge">
                    <Icon name="leaf" size={18} />
                  </div>
                  <div className="nav-community-info">
                    <strong>Acompanhe no Instagram</strong>
                    <span>{vm.instagram.handle} • Novidades e bastidores</span>
                  </div>
                  <span className="nav-community-external" aria-hidden="true">
                    ↗
                  </span>
                </a>
              </div>
            </div>

            <div className="nav-actions">
              <span className="nav-divider" />
              <div className="nav-status-badge">
                <Icon name="pin" size={13} />
                <span>Em construção para Piripiri, Piauí</span>
              </div>
              <div className="nav-action-buttons">
                <button
                  type="button"
                  className="button quiet nav-btn-entrar"
                  onClick={() => vm.openAccess('entrar')}
                >
                  Entrar
                </button>
                <button
                  type="button"
                  className="button primary nav-btn-criar"
                  onClick={() => vm.openAccess('criar')}
                >
                  Criar conta <Icon name="arrow" size={18} />
                </button>
              </div>
              <div className="nav-mobile-legal">
                <a href="/termos" onClick={vm.closeMenu}>
                  Termos
                </a>
                <span aria-hidden="true">•</span>
                <a href="/privacidade" onClick={vm.closeMenu}>
                  Privacidade
                </a>
                <span aria-hidden="true">•</span>
                <a href="/seguranca" onClick={vm.closeMenu}>
                  Segurança
                </a>
              </div>
            </div>
          </nav>
        </div>
      </header>

      {vm.document && vm.page !== 'inicio' ? (
        <main id="conteudo" tabIndex={-1} className="container legal-main">
          <a href="/#inicio" className="text-link back-link">
            ← Voltar à apresentação
          </a>
          <div className="legal-layout">
            <aside>
              <p className="eyebrow">Informações do projeto</p>
              <nav aria-label="Documentos legais">
                {vm.legalLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.href}
                    aria-current={vm.page === link.id ? 'page' : undefined}
                  >
                    {link.label}
                    <Icon name="arrow" size={18} />
                  </a>
                ))}
              </nav>
            </aside>
            <LegalDocumentContent document={vm.document} page={vm.page} />
          </div>
        </main>
      ) : (
        <InstitutionalBook
          hash={vm.hash}
          mode={reading.mode}
          onModeChange={reading.setMode}
          questions={vm.questions}
          footer={footer}
        />
      )}

      {vm.document && footer}
      <AccessDialog intent={vm.accessIntent} onClose={vm.closeAccess} fallbackFocus={menuButton} />
      <Analytics />
      <SpeedInsights />
    </div>
  );
}
