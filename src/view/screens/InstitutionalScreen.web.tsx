import { useEffect, useRef } from 'react';
import { useInstitutionalViewModel } from '../../viewmodel/useInstitutionalViewModel';
import { AccessDialog } from '../components/AccessDialog';
import { BookComposition } from '../components/BookComposition';
import { Icon, type IconName } from '../components/Icon';
import { theme } from '../styles/theme';
import '../styles/institutional.css';

const modalities: {
  title: string;
  className: string;
  icon: IconName;
  description: string;
  note: string;
}[] = [
  {
    title: 'Compre uma nova história',
    className: 'sale',
    icon: 'arrow',
    description:
      'Encontre um livro que você quer ler e valorize os exemplares que já têm uma história.',
    note: 'Venda com preço em reais',
  },
  {
    title: 'Troque suas leituras',
    className: 'trade',
    icon: 'exchange',
    description: 'Aquele livro que você terminou pode ser exatamente o que outra pessoa procura.',
    note: 'Um acordo entre leitores',
  },
  {
    title: 'Doe um novo começo',
    className: 'donation',
    icon: 'heart',
    description:
      'Abra espaço na estante e leve o prazer da leitura para mais alguém da sua cidade.',
    note: 'Doação é sempre gratuita',
  },
];

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
    const anchor = document.getElementById(vm.hash.slice(1));
    if (vm.page === 'inicio' && anchor) anchor.scrollIntoView();
  }, [vm.page, vm.hash, vm.document]);

  return (
    <div className="institutional" style={theme}>
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
              src="/assets/logo.jpg"
              alt=""
              width="36"
              height="36"
              style={{ borderRadius: '50%', objectFit: 'cover' }}
            />
            <span>IpêBook</span>
          </a>
          <button
            ref={menuButton}
            className="icon-button menu-toggle"
            type="button"
            aria-label={vm.menuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={vm.menuOpen}
            aria-controls="main-navigation"
            onClick={vm.toggleMenu}
          >
            <Icon name={vm.menuOpen ? 'close' : 'menu'} />
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
              <section className="legal-sources">
                <h2>Fontes para consulta</h2>
                <a
                  href="https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Lei Geral de Proteção de Dados Pessoais (abre em nova aba)
                </a>
                <a
                  href="https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia_orientativo_cookies_e_protecao_de_dados_pessoais"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Orientações da ANPD sobre cookies (abre em nova aba)
                </a>
              </section>
            </article>
          </div>
        </main>
      ) : (
        <main id="conteudo" tabIndex={-1}>
          <section id="inicio" className="container hero" aria-labelledby="hero-title">
            <div className="hero-copy">
              <span className="location-tag">
                <Icon name="pin" size={17} /> Feito para leitores de Piripiri, PI
              </span>
              <h1 id="hero-title">Uma boa história merece continuar.</h1>
              <p className="hero-description">
                Compre, troque e doe livros na sua comunidade. Conecte sua próxima leitura a alguém
                perto de você.
              </p>
              <div className="hero-actions">
                <button
                  type="button"
                  className="button primary large"
                  onClick={() => vm.openAccess('criar')}
                >
                  Quero participar <Icon name="arrow" size={20} />
                </button>
                <a className="button secondary large" href="#como-funciona">
                  Conhecer o projeto
                </a>
              </div>
              <p className="project-status">
                <span /> Um projeto crescendo, uma história de cada vez.
              </p>
            </div>
            <BookComposition />
          </section>
          <div className="container values-strip" aria-label="Valores do projeto">
            <div>
              <Icon name="pin" />
              <span>Conexões na sua cidade</span>
            </div>
            <div>
              <Icon name="exchange" />
              <span>Mais histórias circulando</span>
            </div>
            <div>
              <Icon name="leaf" />
              <span>Novos destinos para seus livros</span>
            </div>
          </div>

          <section
            className="container modalities-section"
            id="modalidades"
            aria-labelledby="modalities-title"
          >
            <div className="section-heading">
              <p className="eyebrow">Cada livro pode ir mais longe</p>
              <h2 id="modalities-title">Três jeitos de virar a página.</h2>
              <p>Na sua estante ou na de outra pessoa, sempre cabe uma nova história.</p>
            </div>
            <div className="modalities-grid">
              {modalities.map((item) => (
                <article
                  className={`modality-card animate-fade-in ${item.className}`}
                  key={item.title}
                >
                  <span className="feature-icon">
                    <Icon name={item.icon} size={26} />
                  </span>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <span className="modality-note">
                    <Icon name="check" size={16} />
                    {item.note}
                  </span>
                </article>
              ))}
            </div>
          </section>

          <section id="como-funciona" className="how-section" aria-labelledby="how-title">
            <div className="container how-layout">
              <div>
                <p className="eyebrow">Simples, de pessoa para pessoa</p>
                <h2 id="how-title">
                  Da sua estante
                  <br />
                  para um novo capítulo.
                </h2>
                <p className="section-description">
                  Três passos simples para dar uma nova vida aos livros da sua estante e conhecer
                  outras pessoas.
                </p>
                <span className="status-label">Conheça a experiência que estamos preparando</span>
              </div>
              <ol className="steps">
                <li>
                  <span className="step-number">01</span>
                  <div>
                    <h3>Encontre ou compartilhe</h3>
                    <p>
                      Busque sua próxima leitura ou escolha um livro da sua estante para vender,
                      trocar ou doar.
                    </p>
                  </div>
                </li>
                <li>
                  <span className="step-number">02</span>
                  <div>
                    <h3>Converse e combine</h3>
                    <p>
                      Alinhe o estado do livro, o valor ou a troca e todos os detalhes com a outra
                      pessoa.
                    </p>
                  </div>
                </li>
                <li>
                  <span className="step-number">03</span>
                  <div>
                    <h3>Faça a história continuar</h3>
                    <p>
                      Combinem um encontro em um local público da cidade e deem um novo destino ao
                      livro.
                    </p>
                  </div>
                </li>
              </ol>
            </div>
          </section>

          <section id="sobre" className="container about-section" aria-labelledby="about-title">
            <div className="about-mark" aria-hidden="true">
              <span className="about-flower">✳</span>
              <span>Histórias aproximam.</span>
              <span>Livros conectam.</span>
              <div className="about-location">
                <Icon name="pin" size={18} /> Piripiri, Piauí
              </div>
            </div>
            <div>
              <p className="eyebrow">Um projeto com raízes aqui</p>
              <h2 id="about-title">
                Bom para sua estante.
                <br />
                Melhor para a comunidade.
              </h2>
              <p>
                O IpêBook nasce da ideia de que um livro não precisa ficar parado depois da última
                página. Ele pode despertar a curiosidade, abrir uma conversa e chegar a um novo
                leitor.
              </p>
              <p>
                Começamos por Piripiri, conectando pessoas da mesma cidade e incentivando a
                circulação de livros por meio da venda, da troca e da doação.
              </p>
              <a className="text-link" href="#como-funciona">
                Veja como queremos fazer isso <Icon name="arrow" size={20} />
              </a>
            </div>
          </section>

          <section className="container privacy-section" aria-labelledby="privacy-title">
            <span className="feature-icon">
              <Icon name="shield" size={28} />
            </span>
            <div>
              <h2 id="privacy-title">Respeito também faz parte da história.</h2>
              <p>
                Conheça as condições de uso, como esta página funciona e seus direitos sobre dados
                pessoais. Informação clara, antes de qualquer cadastro.
              </p>
              <div className="privacy-links">
                {vm.legalLinks.map((link) => (
                  <a className="text-link" key={link.id} href={`#${link.id}`}>
                    {link.label}
                    <Icon name="arrow" size={16} />
                  </a>
                ))}
              </div>
            </div>
          </section>

          <section id="duvidas" className="container faq-section" aria-labelledby="faq-title">
            <div>
              <p className="eyebrow">Vamos esclarecer</p>
              <h2 id="faq-title">
                Antes de começar
                <br />
                uma nova história.
              </h2>
              <p>Algumas respostas para conhecer melhor o IpêBook.</p>
            </div>
            <div className="faq-list">
              {vm.questions.map((item) => (
                <details key={item.question}>
                  <summary>
                    {item.question}
                    <span className="faq-plus">
                      <Icon name="plus" size={20} />
                    </span>
                  </summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
          </section>

          <section className="container closing-section" aria-labelledby="closing-title">
            <span className="closing-flower" aria-hidden="true">
              ✳
            </span>
            <h2 id="closing-title">
              Sua próxima história
              <br />
              pode estar bem perto.
            </h2>
            <p>Faça parte dessa ideia. Vamos colocar mais livros em movimento.</p>
            <button
              type="button"
              className="button light large"
              onClick={() => vm.openAccess('criar')}
            >
              Quero fazer parte <Icon name="arrow" size={20} />
            </button>
            <span className="closing-note">
              O aplicativo está em preparação. Conheça o projeto enquanto isso.
            </span>
          </section>
        </main>
      )}

      <footer className="site-footer container">
        <div className="footer-top">
          <div>
            <a className="brand" href="#inicio">
              <img
                src="/assets/logo.jpg"
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
        </div>
        <div className="footer-bottom">
          <span>© 2026 IpêBook. Um projeto em construção.</span>
          <span>Livros circulam. Histórias continuam.</span>
        </div>
      </footer>
      <AccessDialog intent={vm.accessIntent} onClose={vm.closeAccess} fallbackFocus={menuButton} />
    </div>
  );
}
