import type { LegalDocument, LegalPage } from '../../model/entities/Institutional';
import { contact, controller } from '../../model/services/institutional.ts';
import { Icon } from './Icon';

function focusReadingTarget(id: string) {
  const target = document.getElementById(id);
  target?.focus({ preventScroll: true });
  target?.scrollIntoView({ block: 'start', behavior: 'instant' });
}

export function LegalDocumentContent({
  document: content,
  page,
}: {
  document: LegalDocument;
  page: LegalPage;
}) {
  const indexId = `${page}-assuntos`;

  return (
    <article className="legal-article">
      <header className="legal-heading">
        <span className="status-label">Sobre esta versão do IpêBook</span>
        <h1>{content.title}</h1>
        <p className="lead">{content.intro}</p>
        <p className="legal-version">Texto preliminar · Revisto em {content.revisedAt}</p>
      </header>

      <div className="legal-summary" aria-labelledby={`${page}-resumo`}>
        <h2 id={`${page}-resumo`} className="summary-title">
          O essencial em poucas palavras
        </h2>
        <ul>
          {content.summary.map((point) => (
            <li key={point}>
              <Icon name="check" size={18} />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>

      <details className="legal-index" key={page}>
        <summary id={indexId}>
          <span>Ir direto ao assunto</span>
          <span className="legal-index-count">{content.sections.length} tópicos</span>
        </summary>
        <nav aria-label="Assuntos desta página">
          {content.sections.map((section, index) => (
            <button
              key={section.title}
              type="button"
              onClick={() => focusReadingTarget(`${page}-assunto-${index}`)}
            >
              <span className="legal-topic-number" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span>{section.title.replace(/^\d+\.\s*/, '')}</span>
              <Icon name="arrow" size={16} />
            </button>
          ))}
        </nav>
      </details>

      <div className="legal-notice">
        <Icon name="shield" />
        <p>
          <strong>O projeto ainda está em construção.</strong> Trabalho de faculdade, sem fins
          lucrativos, conduzido por uma equipe de pessoas físicas. Responsável pelos dados:{' '}
          {controller.name}. Para dúvidas e pedidos, escreva para{' '}
          <a href={contact.url}>{contact.email}</a>. Estes textos explicam a apresentação atual.
        </p>
      </div>

      {content.sections.map((section, index) => (
        <section
          className="legal-topic"
          key={section.title}
          aria-labelledby={`${page}-assunto-${index}`}
        >
          <span className="legal-topic-number" aria-hidden="true">
            {String(index + 1).padStart(2, '0')}
          </span>
          <h2 id={`${page}-assunto-${index}`} tabIndex={-1}>
            {section.title.replace(/^\d+\.\s*/, '')}
          </h2>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <button
            className="legal-return"
            type="button"
            onClick={() => focusReadingTarget(indexId)}
          >
            ↑ Voltar aos assuntos
          </button>
        </section>
      ))}

      {content.sources.length > 0 && (
        <section className="legal-sources">
          <h2>Quer saber mais?</h2>
          <p>Consulte as fontes oficiais. Os links abrem em uma nova aba.</p>
          {content.sources.map((source) => (
            <a
              key={source.url}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${source.label} (abre em nova aba)`}
            >
              {source.label} ↗
            </a>
          ))}
        </section>
      )}
    </article>
  );
}
