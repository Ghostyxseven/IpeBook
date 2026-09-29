import { Icon } from './Icon';

export function BookComposition() {
  return (
    <div
      className="book-scene"
      role="img"
      aria-label="Ilustração de três livros: histórias que passam de leitor para leitor. Não são anúncios reais."
    >
      <div className="scene-orbit" />
      <div className="scene-sun" />
      <div className="scene-star star-one">✳</div>
      <div className="scene-star star-two">✳</div>
      <div className="book book-back">
        <span className="book-small">Um livro,</span>
        <strong>
          muitos
          <br />
          caminhos.
        </strong>
        <div className="book-lines" />
        <span className="book-bottom">Para compartilhar</span>
      </div>
      <div className="book book-front">
        <span className="book-small">Histórias que ficam</span>
        <strong>
          Novos
          <br />
          capítulos
        </strong>
        <div className="book-flower">
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <span />
        </div>
        <span className="book-bottom">Em outras mãos.</span>
      </div>
      <div className="book book-flat">
        <span>Uma boa história merece continuar</span>
      </div>
      <div className="reader-note">
        <span className="note-icon">
          <Icon name="heart" size={20} />
        </span>
        <span>
          De leitor
          <br />
          <strong>para leitor.</strong>
        </span>
      </div>
      <div className="scene-caption">
        <span>Venda</span>
        <span>Troca</span>
        <span>Doação</span>
      </div>
    </div>
  );
}
