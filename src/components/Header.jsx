import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { resetAll } from '../features/parts/partsSlice';
import { DEFAULT_API_KEY } from '../api/partsApi';
import ApiKeyModal from './ApiKeyModal';

export default function Header() {
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const apiKey = useSelector((state) => state.parts.apiKey);
  const dispatch = useDispatch();

  const isCustomKey = apiKey !== DEFAULT_API_KEY;

  return (
    <>
      <header className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm mb-4">
        <div className="container">
          <div className="navbar-brand d-flex align-items-center py-2 cursor-pointer" onClick={() => dispatch(resetAll())} role="button">
            <span className="bg-white text-primary rounded-circle p-2 me-2 d-inline-flex align-items-center justify-content-center" style={{ width: 38, height: 38 }}>
              <i className="bi bi-gear-wide-connected fs-5"></i>
            </span>
            <div>
              <div className="fw-bold fs-5 lh-1 text-white">АвтоЗапчасти</div>
              <small className="text-white-50 fs-8 d-block mt-1">Поиск деталей и аналогов • Favorit Parts API</small>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2">
            <button
              className="btn btn-outline-light btn-sm d-flex align-items-center gap-1"
              onClick={() => setIsKeyModalOpen(true)}
              title="Настройки ключа API"
            >
              <i className="bi bi-key"></i>
              <span>API Key</span>
              {isCustomKey && (
                <span className="badge bg-warning text-dark ms-1">Свой</span>
              )}
            </button>

            <button
              className="btn btn-light btn-sm d-flex align-items-center gap-1"
              onClick={() => dispatch(resetAll())}
              title="Начать поиск заново"
            >
              <i className="bi bi-arrow-repeat"></i>
              <span>Новый поиск</span>
            </button>
          </div>
        </div>
      </header>

      <ApiKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
      />
    </>
  );
}
