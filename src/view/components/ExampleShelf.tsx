import type { BookExample, ExampleFilter } from '../../model/entities/BookExperience';
import type { useBookExperience } from '../../viewmodel/useBookExperience';
import { BookDialog } from './BookDialog';
import { Icon } from './Icon';

type Experience = ReturnType<typeof useBookExperience>;
export function ExampleCover({ book }: { book: BookExample }) {
  return (
    <div className={`example-cover cover-${book.cover}`} aria-hidden="true">
      <span className="cover-collection">Coleção imaginária</span>
      <strong>{book.title}</strong>
      <span className="cover-symbol">
        <Icon
          name={book.cover === 'forest' ? 'leaf' : book.cover === 'sun' ? 'pin' : 'heart'}
          size={44}
        />
      </span>
      <span className="cover-edition">Uma história de exemplo</span>
    </div>
  );
}
export function ExampleShelf({ vm }: { vm: Experience }) {
  return (
    <>
      <div className="shelf-tools">
        <div className="shelf-filters" role="group" aria-label="Filtrar exemplos por modalidade">
          {(['Todos', 'Venda', 'Troca', 'Doação'] as ExampleFilter[]).map((filter) => (
            <button
              type="button"
              key={filter}
              aria-pressed={vm.filter === filter}
              onClick={() => vm.setFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
        <label className="shelf-search">
          <span>Buscar nos exemplos</span>
          <input
            type="search"
            value={vm.query}
            onChange={(event) => vm.setQuery(event.target.value)}
            placeholder="Título ou categoria"
          />
        </label>
      </div>
      <p className="shelf-count" role="status">
        {vm.examples.length}{' '}
        {vm.examples.length === 1 ? 'exemplo encontrado' : 'exemplos encontrados'} · títulos e
        condições fictícios
      </p>
      {vm.examples.length ? (
        <div className="example-grid">
          {vm.examples.map((book) => (
            <article className="example-card" key={book.id}>
              <ExampleCover book={book} />
              <div className="example-copy">
                <span className={`modality-label label-${book.cover}`}>{book.modality}</span>
                <h3>{book.title}</h3>
                <p>{book.category} · exemplo ilustrativo</p>
                <strong className="example-price">{vm.exampleTerms(book)}</strong>
                <p className="example-condition">
                  {book.modality === 'Troca'
                    ? book.interest
                    : book.modality === 'Venda'
                      ? 'Preço ilustrativo, sem oferta real.'
                      : 'Doação gratuita, sem oferta real.'}
                </p>
                <button
                  type="button"
                  className="example-detail"
                  onClick={() => vm.openExample(book)}
                  aria-label={`Ver exemplo: ${book.title}`}
                >
                  Conhecer o exemplo <Icon name="arrow" size={18} />
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="shelf-empty">
          <Icon name="leaf" size={32} />
          <h3>Nenhum exemplo por aqui.</h3>
          <p>Tente outro título, uma categoria ou veja todas as modalidades.</p>
          <button type="button" className="button secondary" onClick={vm.resetSearch}>
            Limpar busca e filtros
          </button>
        </div>
      )}
      <div className="chapter-note">
        <Icon name="shield" size={20} />
        <p>
          Esta estante demonstra a proposta. Não há livros disponíveis para comprar, reservar ou
          solicitar nesta versão.
        </p>
      </div>
      <BookDialog open={Boolean(vm.selectedBook)} onClose={vm.closeExample} titleId="example-title">
        {vm.selectedBook && (
          <div className="example-dialog-content">
            <span className="edition-label">Exemplo fictício · não é um anúncio</span>
            <h2 id="example-title">{vm.selectedBook.title}</h2>
            <div className="example-dialog-grid">
              <ExampleCover book={vm.selectedBook} />
              <div>
                <span className="modality-label">{vm.selectedBook.modality}</span>
                <p>{vm.selectedBook.description}</p>
                <strong className="example-price">{vm.exampleTerms(vm.selectedBook)}</strong>
                <p>{vm.selectedBook.condition}</p>
                {vm.selectedBook.modality === 'Troca' && (
                  <p>
                    <strong>Interesse de troca:</strong> {vm.selectedBook.interest}
                  </p>
                )}
              </div>
            </div>
            <div className="chapter-note">
              <Icon name="pin" />
              <p>
                No aplicativo futuro, confirme edição, estado e condições com a pessoa e combine uma
                entrega em local público. Contato e negociação ainda não estão disponíveis.
              </p>
            </div>
            <button
              className="button primary"
              type="button"
              onClick={() =>
                vm.openGuide(
                  vm.selectedBook!.modality === 'Venda'
                    ? 'comprar'
                    : vm.selectedBook!.modality === 'Troca'
                      ? 'trocar'
                      : 'doar',
                )
              }
            >
              Entender como vai funcionar <Icon name="arrow" size={18} />
            </button>
          </div>
        )}
      </BookDialog>
    </>
  );
}
