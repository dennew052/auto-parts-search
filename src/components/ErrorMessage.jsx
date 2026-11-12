import React from 'react';

export default function ErrorMessage({ title = 'Ошибка при выполнении запроса', message, onRetry, onClear }) {
  return (
    <div className="alert alert-danger shadow-sm border-danger-subtle my-4" role="alert">
      <div className="d-flex align-items-start">
        <div className="fs-3 text-danger me-3 lh-1">
          <i className="bi bi-exclamation-triangle-fill"></i>
        </div>
        <div className="flex-grow-1">
          <h5 className="alert-heading mb-1">{title}</h5>
          <p className="mb-2 text-danger-emphasis">{message || 'Не удалось получить данные с сервера API.'}</p>
          <div className="mt-3 d-flex gap-2">
            {onRetry && (
              <button
                type="button"
                className="btn btn-outline-danger btn-sm px-3"
                onClick={onRetry}
              >
                <i className="bi bi-arrow-clockwise me-1"></i> Повторить запрос
              </button>
            )}
            {onClear && (
              <button
                type="button"
                className="btn btn-link btn-sm text-secondary text-decoration-none"
                onClick={onClear}
              >
                Закрыть
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
