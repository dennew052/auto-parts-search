import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { searchOffers } from '../features/parts/partsSlice';

export default function BrandList() {
  const dispatch = useDispatch();
  const apiKey = useSelector((state) => state.parts.apiKey);
  const searchedNumber = useSelector((state) => state.parts.searchedNumber);
  const brands = useSelector((state) => state.parts.brands);
  const brandsStatus = useSelector((state) => state.parts.brandsStatus);

  if (brandsStatus !== 'succeeded') {
    return null;
  }

  const handleSelectBrand = (brandName) => {
    dispatch(searchOffers({
      number: searchedNumber,
      brand: brandName,
      key: apiKey
    }));
  };

  if (brands.length === 0) {
    return (
      <div className="card shadow-sm border-0 my-4 text-center py-5">
        <div className="card-body">
          <div className="text-muted mb-3" style={{ fontSize: '3rem' }}>
            <i className="bi bi-inbox"></i>
          </div>
          <h5 className="fw-bold text-dark">Производители не найдены</h5>
          <p className="text-muted mb-3">
            По артикулу <strong className="text-primary">{searchedNumber}</strong> не найдено совпадений в каталоге.
          </p>
          <p className="small text-muted mb-0">
            Попробуйте проверить опечатки или выберите один из тестовых артикулов (например, <span className="font-monospace fw-semibold">01089</span> или <span className="font-monospace fw-semibold">7160500039S</span>).
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card shadow-sm border-0 my-4">
      <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
        <div>
          <h5 className="mb-0 fw-bold text-dark">
            <i className="bi bi-tags-fill text-primary me-2"></i>
            Найденные производители для артикула: <span className="badge bg-primary fs-6 font-monospace">{searchedNumber}</span>
          </h5>
          <small className="text-muted">Выберите нужного производителя для получения аналогов и ценовых предложений</small>
        </div>
        <span className="badge bg-secondary-subtle text-secondary px-3 py-2 fs-7">
          Всего брендов: {brands.length}
        </span>
      </div>

      <div className="card-body p-3">
        <div className="row g-3">
          {brands.map((b) => {
            const hasStock = b.totalCount > 0;
            return (
              <div key={b.brand} className="col-lg-4 col-md-6">
                <div className="card h-100 border border-1 hover-shadow transition-all">
                  <div className="card-body d-flex flex-column p-3">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h5 className="card-title fw-bold text-primary mb-0 text-truncate" title={b.brand}>
                        {b.brand}
                      </h5>
                      {hasStock ? (
                        <span className="badge bg-success-subtle text-success border border-success-subtle">
                          В наличии: {b.totalCount} шт.
                        </span>
                      ) : (
                        <span className="badge bg-light text-muted border">
                          0 шт.
                        </span>
                      )}
                    </div>

                    <p className="card-text text-muted small flex-grow-1 mb-3 text-truncate-2" title={b.sampleName}>
                      {b.sampleName || 'Деталь ' + searchedNumber}
                    </p>

                    <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                      <div>
                        {b.minPrice > 0 ? (
                          <div>
                            <span className="text-muted small">от </span>
                            <span className="fw-bold text-dark fs-6">
                              {b.minPrice.toLocaleString('ru-RU')} ₽
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted small">Цена по запросу</span>
                        )}
                      </div>

                      <button
                        type="button"
                        className="btn btn-primary btn-sm px-3 d-flex align-items-center gap-1"
                        onClick={() => handleSelectBrand(b.brand)}
                      >
                        <span>Выбрать</span>
                        <i className="bi bi-arrow-right-short fs-6"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
