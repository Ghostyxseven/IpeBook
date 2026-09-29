import type { ReactNode } from 'react';
import { useBookExperience } from '../../viewmodel/useBookExperience';
import { BookPresentation } from './BookPresentation';
import { ExampleShelf } from './ExampleShelf';
import { Icon } from './Icon';

export function InstitutionalBook({
  hash,
  questions,
  footer,
}: {
  hash: string;
  questions: { question: string; answer: string }[];
  footer: ReactNode;
}) {
  const vm = useBookExperience();
  return (
    <BookPresentation hash={hash}>
      <section id="inicio" className="reader-chapter reader-cover" aria-labelledby="hero-title">
        <div className="cover-introduction">
          <span className="edition-label">
            <span className="status-dot" />
            Em construção, com raízes em Piripiri
          </span>
          <h1 id="hero-title">Uma boa história merece continuar.</h1>
          <p className="chapter-lead">
            Compre, venda, troque ou doe livros na sua comunidade. O IpêBook está nascendo para
            aproximar quem tem uma história na estante de quem quer começar a próxima.
          </p>
          <div className="reader-actions">
            <button className="button primary" onClick={() => vm.openGuide('comprar')}>
              Quero comprar <Icon name="arrow" size={18} />
            </button>
            <button className="button secondary" onClick={() => vm.openGuide('vender')}>
              Quero vender
            </button>
          </div>
          <p className="action-caption">
            Conheça os guias. Compras e anúncios ainda não estão disponíveis.
          </p>
          <div className="cover-paths">
            <a href="#como-funciona" onClick={() => vm.selectGuide('trocar')}>
              <Icon name="exchange" size={20} />
              <span>
                Prefere trocar?<small>Uma leitura por outra.</small>
              </span>
            </a>
            <a href="#como-funciona" onClick={() => vm.selectGuide('doar')}>
              <Icon name="heart" size={20} />
              <span>
                Quer doar?<small>Um novo leitor, sem custo.</small>
              </span>
            </a>
          </div>
        </div>
        <div
          className="cover-scene"
          aria-label="Capa ilustrativa do livro de apresentação do IpêBook"
        >
          <div className="bound-book">
            <span className="bound-spine" aria-hidden="true">
              IpêBook · Histórias que continuam
            </span>
            <div className="bound-front">
              <span className="bound-edition">Um encontro entre livros e leitores</span>
              <img src="/assets/logo-clean.png" alt="" />
              <strong>
                Histórias que
                <br />
                continuam.
              </strong>
              <span className="bound-rule" />
              <span className="bound-place">
                <strong>IpêBook</strong>
                <small>Piripiri, Piauí</small>
              </span>
            </div>
          </div>
          <p className="cover-scene-caption">O próximo capítulo pode começar com você.</p>
        </div>
        <div className="cover-bottom">
          <span>
            <Icon name="pin" size={18} />
            Pensado para encontros na comunidade
          </span>
          <a href="#sobre">
            Abra o próximo capítulo <Icon name="arrow" size={18} />
          </a>
        </div>
      </section>

      <section id="sobre" className="reader-chapter" aria-labelledby="about-title">
        <div className="chapter-heading">
          <span className="edition-label">O que nos move</span>
          <h2 id="about-title">
            Livros guardam histórias.
            <br />E também criam encontros.
          </h2>
        </div>
        <div className="purpose-layout">
          <div className="purpose-letter">
            <p className="chapter-lead">
              Depois da última página, um livro ainda tem muito para contar.
            </p>
            <p>
              Ele pode ser a descoberta de alguém, uma leitura que faltava ou o presente que abre
              uma nova curiosidade. Queremos ajudar esses encontros a acontecerem perto de casa.
            </p>
            <p>
              O IpêBook é uma proposta comunitária para Piripiri, no Piauí. Reunir compra, venda,
              troca e doação em um mesmo lugar é o nosso jeito de convidar os livros a circular.
            </p>
            <div className="reader-quote">
              <Icon name="leaf" size={28} />
              <blockquote>Da sua estante para uma nova história.</blockquote>
              <span>Esse é o começo do IpêBook.</span>
            </div>
          </div>
          <div className="purpose-values">
            <article>
              <Icon name="pin" />
              <div>
                <h3>Mais perto de quem lê</h3>
                <p>
                  A proposta é conectar pessoas da mesma cidade e facilitar a combinação da entrega.
                </p>
              </div>
            </article>
            <article>
              <Icon name="exchange" />
              <div>
                <h3>Mais caminhos para cada livro</h3>
                <p>
                  Vender, trocar ou doar: escolha o destino que faz sentido para o seu exemplar.
                </p>
              </div>
            </article>
            <article>
              <Icon name="heart" />
              <div>
                <h3>Mais espaço para novas leituras</h3>
                <p>
                  Um livro em circulação encontra outros interesses, outras mãos e outras
                  interpretações.
                </p>
              </div>
            </article>
            <div className="chapter-note">
              <Icon name="shield" />
              <p>
                O projeto está em construção. Por enquanto, explore os guias e os exemplos para
                conhecer a proposta de uma comunidade de leitores em Piripiri.
              </p>
            </div>
          </div>
        </div>
        <a href="#como-funciona" className="chapter-next">
          Veja como participar de cada jeito <Icon name="arrow" size={18} />
        </a>
      </section>

      <section id="como-funciona" className="reader-chapter" aria-labelledby="how-title">
        <div className="chapter-heading">
          <span className="edition-label">Escolha seu caminho</span>
          <h2 id="how-title">Cada livro pode ter um novo destino.</h2>
          <p>
            Veja como a experiência está sendo pensada para quem procura e para quem compartilha.
          </p>
        </div>
        <div className="guide-picker" role="group" aria-label="Escolher guia">
          {vm.guides.map((guide) => (
            <button
              key={guide.id}
              type="button"
              aria-pressed={vm.guideId === guide.id}
              aria-controls="reader-guide"
              onClick={() => vm.selectGuide(guide.id)}
            >
              {guide.label}
              <Icon
                name={guide.id === 'trocar' ? 'exchange' : guide.id === 'doar' ? 'heart' : 'arrow'}
                size={18}
              />
            </button>
          ))}
        </div>
        <div id="reader-guide" className="guide-layout" aria-labelledby="guide-title">
          <div>
            <h3 id="guide-title">{vm.guide.title}</h3>
            <p className="guide-intro">{vm.guide.intro}</p>
            <ol className="reader-steps">
              {vm.guide.steps.map((step, index) => (
                <li key={step.title}>
                  <span className="reader-step-number">{index + 1}</span>
                  <div>
                    <h4>{step.title}</h4>
                    <p>{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <aside className="guide-checklist">
            <span className="edition-label">Antes de combinar</span>
            <h3>Uma boa experiência começa com clareza.</h3>
            <ul>
              {vm.guide.checklist.map((item) => (
                <li key={item}>
                  <Icon name="check" size={18} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="guide-status">{vm.guide.note}</p>
            <a href="#em-construcao" className="chapter-next">
              Explorar os exemplos <Icon name="arrow" size={18} />
            </a>
          </aside>
        </div>
      </section>

      <section
        id="em-construcao"
        className="reader-chapter shelf-chapter"
        aria-labelledby="shelf-title"
      >
        <div className="chapter-heading">
          <span className="edition-label">Uma prévia para explorar</span>
          <h2 id="shelf-title">Uma estante de possibilidades.</h2>
          <p>
            Experimente os filtros e abra os detalhes. Todos os livros abaixo são exemplos
            fictícios.
          </p>
        </div>
        <ExampleShelf vm={vm} />
      </section>

      <section id="duvidas" className="reader-chapter" aria-labelledby="faq-title">
        <div className="chapter-heading">
          <span className="edition-label">Leitura sem entrelinhas</span>
          <h2 id="faq-title">Dúvidas frequentes</h2>
          <p>O que já dá para fazer, o que estamos preparando e como cada modalidade funciona.</p>
        </div>
        <div className="reader-faq-layout">
          <div className="faq-list">
            {questions.map((item) => (
              <details key={item.question}>
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
          <aside className="reader-help">
            <Icon name="shield" size={32} />
            <h3>Primeiro, entenda o combinado.</h3>
            <p>
              Na venda, confira preço e conservação. Na troca, confirmem os interesses. Na doação, a
              gratuidade deve estar clara.
            </p>
            <h4>Para o encontro</h4>
            <p>
              Prefira um local público, combine o horário e confira o exemplar antes de concluir.
            </p>
            <a className="chapter-next" href="#como-funciona">
              Rever os guias <Icon name="arrow" size={18} />
            </a>
            <a className="chapter-next" href="#privacidade">
              Como tratamos seus dados <Icon name="arrow" size={18} />
            </a>
          </aside>
        </div>
      </section>

      <section id="proximo-capitulo" className="reader-chapter" aria-labelledby="closing-title">
        <div className="chapter-heading">
          <span className="edition-label">A história está só começando</span>
          <h2 id="closing-title">
            O próximo capítulo
            <br />
            está sendo escrito.
          </h2>
          <p>
            Você já pode conhecer a proposta. Veja o que existe nesta apresentação e o que ainda
            precisa ser construído.
          </p>
        </div>
        <div className="development-path">
          <article>
            <span className="development-status">
              <Icon name="check" size={18} />
              Disponível aqui
            </span>
            <h3>Conhecer e explorar</h3>
            <p>
              Guias de compra, venda, troca e doação; exemplos interativos; dúvidas e informações do
              projeto.
            </p>
            <a href="#em-construcao" className="chapter-next">
              Visitar a estante ilustrativa <Icon name="arrow" size={18} />
            </a>
          </article>
          <article>
            <span className="development-status planned">Planejado</span>
            <h3>Conectar leitores</h3>
            <p>
              Contas, anúncios de exemplares e conversa entre pessoas para combinar compras, trocas
              e doações.
            </p>
            <span className="development-footnote">
              Esses recursos ainda não estão disponíveis.
            </span>
          </article>
          <article>
            <span className="development-status planned">Antes de operar</span>
            <h3>Preparar com cuidado</h3>
            <p>
              Validar os fluxos, definir atendimento, completar os documentos e informar as
              condições de uso.
            </p>
            <span className="development-footnote">Ainda não há data de lançamento anunciada.</span>
          </article>
        </div>
        <div className="closing-invitation">
          <div>
            <h3>Enquanto isso, olhe para a sua estante.</h3>
            <p>Qual livro você gostaria de encontrar? E qual já pode seguir para outra pessoa?</p>
          </div>
          <div className="reader-actions">
            <button className="button primary" onClick={() => vm.openGuide('vender')}>
              Preparar meu livro
            </button>
            <button className="button secondary" onClick={() => vm.openGuide('comprar')}>
              Entender a compra
            </button>
          </div>
        </div>
      </section>
      <section
        id="informacoes"
        className="reader-chapter information-chapter"
        aria-labelledby="info-title"
      >
        <div className="chapter-heading">
          <span className="edition-label">Informações desta edição</span>
          <h2 id="info-title">
            Uma comunidade começa
            <br />
            com confiança.
          </h2>
          <p>
            Conheça a proposta, entenda os limites desta versão e consulte os documentos do projeto.
          </p>
        </div>
        <div className="information-strip">
          <div>
            <Icon name="pin" />
            <h3>Feito para Piripiri</h3>
            <p>Um projeto que valoriza os encontros entre leitores da mesma cidade.</p>
          </div>
          <div>
            <Icon name="shield" />
            <h3>Transparência desde o início</h3>
            <p>
              Sem cadastro nesta apresentação. Documentos preliminares disponíveis para consulta.
            </p>
          </div>
          <div>
            <Icon name="leaf" />
            <h3>Uma edição em construção</h3>
            <p>
              Sem anúncios ou transações reais. Atendimento e lançamento serão informados quando
              definidos.
            </p>
          </div>
        </div>
        {footer}
      </section>
    </BookPresentation>
  );
}
