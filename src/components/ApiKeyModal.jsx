import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setApiKey, resetApiKey } from '../features/parts/partsSlice';
import { DEFAULT_API_KEY } from '../api/partsApi';

export default function ApiKeyModal({ isOpen, onClose }) {
  const currentKey = useSelector((state) => state.parts.apiKey);
  const [keyInput, setKeyInput] = useState(currentKey);
  const dispatch = useDispatch();

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    dispatch(setApiKey(keyInput));
    onClose();
  };

  const handleReset = () => {
    setKeyInput(DEFAULT_API_KEY);
    dispatch(resetApiKey());
  };

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content shadow border-0">
          <div className="modal-header bg-light">
            <h5 className="modal-title fs-6 fw-bold">
              <i className="bi bi-key-fill text-primary me-2"></i>
              Ключ доступа к API (key)
            </h5>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
          </div>
          <form onSubmit={handleSave}>
            <div className="modal-body py-4">
              <label htmlFor="apiKeyInput" className="form-label fw-semibold">
                Уникальный ключ покупателя:
              </label>
              <input
                id="apiKeyInput"
                type="text"
                className="form-control font-monospace"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="00000000-0000-0000-0000-000000000001"
                required
              />
              <div className="form-text mt-2 text-muted">
                По умолчанию используется демо-ключ из официальной документации Фаворит Моторс (
                <code className="user-select-all">{DEFAULT_API_KEY}</code>).
                Если у вас есть собственный ключ клиента, укажите его выше.
              </div>
            </div>
            <div className="modal-footer bg-light">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={handleReset}
              >
                Сбросить на демо-ключ
              </button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
                Отмена
              </button>
              <button type="submit" className="btn btn-primary btn-sm px-4">
                Сохранить
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
