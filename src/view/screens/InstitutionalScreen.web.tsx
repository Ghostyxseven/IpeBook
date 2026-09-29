import { useEffect, useRef } from 'react';
import { useInstitutionalViewModel } from '../../viewmodel/useInstitutionalViewModel';
import { InstitutionalBook } from '../components/InstitutionalBook';
import { AccessDialog } from '../components/AccessDialog';
import { Icon } from '../components/Icon';
import { theme } from '../styles/theme';
import '../styles/institutional.css';
import '../styles/book-experience.css';

export default function InstitutionalScreen() {
  const vm = useInstitutionalViewModel();
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

  const footer = (
    <footer className="site-footer container">
      <div className="footer-top">
        <div>
          <a className="brand" href="#inicio">
            <img
              src="/assets/logo-clean.png"
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
          <a href="#sobre">Sobre o IpêBook</a>
          <a href="#como-funciona">Como funciona</a>
          <a href="#duvidas">Dúvidas frequentes</a>
        </nav>
        <nav aria-label="Transparência">
          <h2>Transparência</h2>
          {vm.legalLinks.map((link) => (
            <a href={`#${link.id}`} key={link.id}>
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
        </nav>
      </div>
      <div className="footer-bottom">
        <span>© 2026 IpêBook. Um projeto em construção.</span>
        <span>Livros circulam. Histórias continuam.</span>
      </div>
    </footer>
  );

  return (
    <div className={`institutional ${vm.document ? '' : 'institutional-book'}`} style={theme}>
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
          <a className="brand" href="#inicio" aria-label="IpêBook — início">
            <img
              src="/assets/logo-clean.png"
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
            <a href="#como-funciona" onClick={vm.closeMenu}>
              Como funciona
            </a>
            <a href="#sobre" onClick={vm.closeMenu}>
              Sobre o projeto
            </a>
            <a href="#duvidas" onClick={vm.closeMenu}>
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
            <span className="nav-divider" />
            <button type="button" className="button quiet" onClick={() => vm.openAccess('entrar')}>
              Entrar
            </button>
            <button type="button" className="button primary" onClick={() => vm.openAccess('criar')}>
              Criar conta <Icon name="arrow" size={18} />
            </button>
          </nav>
        </div>
      </header>

      {vm.document ? (
        <main id="conteudo" tabIndex={-1} className="container legal-main">
          <a href="#inicio" className="text-link back-link">
            ← Voltar à apresentação
          </a>
          <div className="legal-layout">
            <aside>
              <p className="eyebrow">Informações do projeto</p>
              <nav aria-label="Documentos legais">
                {vm.legalLinks.map((link) => (
                  <a
                    key={link.id}
                    href={`#${link.id}`}
                    aria-current={vm.page === link.id ? 'page' : undefined}
                  >
                    {link.label}
                    <Icon name="arrow" size={18} />
                  </a>
                ))}
              </nav>
            </aside>
            <article>
              <span className="status-label">Versão preliminar · 29 de setembro de 2026</span>
              <h1>{vm.document.title}</h1>
              <p className="lead">{vm.document.intro}</p>
              {vm.document.summary && vm.document.summary.length > 0 && (
                <div className="legal-summary">
                  <span className="summary-title">Pontos principais desta leitura</span>
                  <ul>
                    {vm.document.summary.map((point) => (
                      <li key={point}>
                        <Icon name="check" size={18} />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="legal-notice">
                <Icon name="shield" />
                <p>
                  O responsável e o canal de atendimento ainda precisam ser definidos. Estes textos
                  descrevem a apresentação atual e devem ser revisados antes da operação do serviço.
                </p>
              </div>
              {vm.document.sections.map((section) => (
                <section key={section.title}>
                  <h2>{section.title}</h2>
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </section>
              ))}
              {vm.document.sources.length > 0 && (
                <section className="legal-sources">
                  <h2>Fontes para consulta</h2>
                  {vm.document.sources.map((source) => (
                    <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer">
                      {source.label} (abre em nova aba)
                    </a>
                  ))}
                </section>
              )}
            </article>
          </div>
        </main>
      ) : (
        <InstitutionalBook hash={vm.hash} questions={vm.questions} footer={footer} />
      )}

      {vm.document && footer}
      <AccessDialog intent={vm.accessIntent} onClose={vm.closeAccess} fallbackFocus={menuButton} />
    </div>
  );
}
