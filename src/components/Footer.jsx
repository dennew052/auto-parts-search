import React from 'react';

export default function Footer() {
  return (
    <footer className="footer mt-auto py-4 bg-light border-top">
      <div className="container">
        <div className="row g-3 align-items-center">
          <div className="col-md-6 text-center text-md-start">
            <span className="fw-semibold text-secondary">
              Поиск автозапчастей и аналогов
            </span>
            <span className="text-muted small d-block mt-1">
              Двухэтапная интеграция с сервисом Проценка (Favorit Parts)
            </span>
          </div>

          <div className="col-md-6 text-center text-md-end">
            <div className="d-flex justify-content-center justify-content-md-end gap-3 small">
              <a
                href="https://lk.favorit-parts.ru/static/wsprice.pdf"
                target="_blank"
                rel="noreferrer"
                className="text-decoration-none text-primary d-inline-flex align-items-center gap-1"
              >
                <i className="bi bi-file-earmark-pdf"></i>
                <span>Документация API</span>
              </a>
              <span className="text-muted">•</span>
              <span className="text-muted">React + Redux Toolkit</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
