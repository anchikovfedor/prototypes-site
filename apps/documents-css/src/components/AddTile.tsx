// Плитка «Загрузить ещё» — и как отдельная карточка в сетке, и как ячейка в развёрнутом документе.
export function AddTile() {
  return (
    <div className="add-tile">
      <div className="add-tile__text">
        <span className="add-tile__title">Загрузить ещё</span>
        <span className="add-tile__hint">Нажмите, чтобы добавить документ</span>
      </div>
      <span className="add-tile__btn" aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M10 4.5v11M4.5 10h11"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </span>
    </div>
  );
}
