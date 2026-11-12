import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { searchBrands, setArticleQuery } from '../features/parts/partsSlice';

export default function StageOneSearch() {
  const dispatch = useDispatch();
  const apiKey = useSelector((state) => state.parts.apiKey);
  const articleQuery = useSelector((state) => state.parts.articleQuery);
  const brandsStatus = useSelector((state) => state.parts.brandsStatus);
  const recentSearches = useSelector((state) => state.parts.recentSearches);

  const [localInput, setLocalInput] = useState(articleQuery || '');
  const [validationError, setValidationError] = useState('');

  const isLoading = brandsStatus === 'loading';

  const handleSearch = (numberToSearch) => {
    const term = (numberToSearch !== undefined ? numberToSearch : localInput).trim();
    if (!term) {
      setValidationError('Пожалуйста, укажите артикул автозапчасти');
      return;
    }
    setValidationError('');
    dispatch(setArticleQuery(term));
    dispatch(searchBrands({ number: term, key: apiKey }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch();
  };

  const handleSelectSample = (sample) => {
    setLocalInput(sample);
    handleSearch(sample);
  };

  return (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-body p-4">
        <h4 className="card-title fw-bold mb-1 d-flex align-items-center">
          <i className="bi bi-search text-primary me-2"></i>
          Этап 1: Поиск производителей по артикулу
        </h4>
        <p className="card-subtitle text-muted mb-4">
          Введите каталожный номер (артикул) автозапчасти для получения списка брендов, выпускающих данную деталь.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="row g-2 align-items-start">
            <div className="col-lg-9 col-md-8">
              <div className="input-group input-group-lg">
                <span className="input-group-text bg-white border-end-0 text-muted">
                  <i className="bi bi-upc-scan"></i>
                </span>
                <input
                  type="text"
                  className={`form-control border-start-0 ps-0 text-uppercase fw-semibold ${
                    validationError ? 'is-invalid' : ''
                  }`}
                  placeholder="Например: 01089, 7160500039S, 0189"
                  value={localInput}
                  onChange={(e) => {
                    setLocalInput(e.target.value);
                    if (validationError) setValidationError('');
                  }}
                  disabled={isLoading}
                  autoFocus
                />
                {localInput && (
                  <button
                    type="button"
                    className="btn btn-outline-secondary border-start-0"
                    onClick={() => setLocalInput('')}
                    disabled={isLoading}
                    title="Очистить поле"
                  >
                    <i className="bi bi-x-lg"></i>
                  </button>
                )}
              </div>
              {validationError && (
                <div className="text-danger small mt-1">{validationError}</div>
              )}
            </div>

            <div className="col-lg-3 col-md-4">
              <button
                type="submit"
                className="btn btn-primary btn-lg w-100 d-flex align-items-center justify-content-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    <span>Поиск...</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-search"></i>
                    <span>Найти бренды</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Примеры артикулов для быстрого тестирования */}
        <div className="mt-3 pt-3 border-top d-flex flex-wrap align-items-center gap-2">
          <span className="small text-muted me-1">Примеры из документации:</span>
          {recentSearches.map((sample) => (
            <button
              key={sample}
              type="button"
              className="btn btn-outline-secondary btn-sm rounded-pill px-3 py-1 font-monospace"
              onClick={() => handleSelectSample(sample)}
              disabled={isLoading}
            >
              {sample}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
