import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { goToStep } from '../features/parts/partsSlice';

export default function StepIndicator() {
  const currentStep = useSelector((state) => state.parts.currentStep);
  const searchedNumber = useSelector((state) => state.parts.searchedNumber);
  const selectedBrand = useSelector((state) => state.parts.selectedBrand);
  const brands = useSelector((state) => state.parts.brands);
  const dispatch = useDispatch();

  const canGoToStep1 = currentStep === 2 && brands.length > 0;

  return (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-body p-3">
        <div className="row g-2 align-items-center text-center text-md-start">
          
          {/* Этап 1 */}
          <div
            className={`col-md-6 d-flex align-items-center justify-content-center justify-content-md-start p-2 rounded ${
              currentStep === 1
                ? 'bg-primary-subtle text-primary border border-primary-subtle'
                : canGoToStep1
                ? 'bg-light text-muted cursor-pointer hover-shadow-sm'
                : 'text-muted'
            }`}
            onClick={() => canGoToStep1 && dispatch(goToStep(1))}
            style={{ cursor: canGoToStep1 ? 'pointer' : 'default', transition: 'all 0.2s' }}
            title={canGoToStep1 ? 'Нажмите, чтобы вернуться к выбору другого производителя' : ''}
          >
            <div
              className={`rounded-circle d-flex align-items-center justify-content-center me-3 fw-bold ${
                currentStep === 1
                  ? 'bg-primary text-white'
                  : currentStep > 1
                  ? 'bg-success text-white'
                  : 'bg-secondary text-white'
              }`}
              style={{ width: 36, height: 36, minWidth: 36 }}
            >
              {currentStep > 1 ? <i className="bi bi-check-lg"></i> : '1'}
            </div>
            <div>
              <div className="fw-bold small text-uppercase">Этап 1: Производители</div>
              <div className="fs-6">
                {searchedNumber ? (
                  <span>
                    Артикул: <strong className="text-dark">{searchedNumber}</strong>
                  </span>
                ) : (
                  <span className="text-muted">Ввод артикула и поиск брендов</span>
                )}
              </div>
            </div>
          </div>

          {/* Этап 2 */}
          <div
            className={`col-md-6 d-flex align-items-center justify-content-center justify-content-md-start p-2 rounded ${
              currentStep === 2
                ? 'bg-primary-subtle text-primary border border-primary-subtle'
                : 'text-muted'
            }`}
          >
            <div
              className={`rounded-circle d-flex align-items-center justify-content-center me-3 fw-bold ${
                currentStep === 2 ? 'bg-primary text-white' : 'bg-secondary-subtle text-secondary'
              }`}
              style={{ width: 36, height: 36, minWidth: 36 }}
            >
              2
            </div>
            <div>
              <div className="fw-bold small text-uppercase">Этап 2: Аналоги и предложения</div>
              <div className="fs-6">
                {selectedBrand ? (
                  <span>
                    Бренд: <strong className="text-dark">{selectedBrand}</strong>
                  </span>
                ) : (
                  <span className="text-muted">Выбор бренда и подбор аналогов</span>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
