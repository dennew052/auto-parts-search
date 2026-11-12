import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Header from './components/Header';
import StepIndicator from './components/StepIndicator';
import StageOneSearch from './components/StageOneSearch';
import BrandList from './components/BrandList';
import StageTwoOffers from './components/StageTwoOffers';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import Footer from './components/Footer';
import { searchBrands, searchOffers, clearErrors } from './features/parts/partsSlice';

export default function App() {
  const dispatch = useDispatch();
  const apiKey = useSelector((state) => state.parts.apiKey);
  const currentStep = useSelector((state) => state.parts.currentStep);
  const searchedNumber = useSelector((state) => state.parts.searchedNumber);
  const selectedBrand = useSelector((state) => state.parts.selectedBrand);

  const brandsStatus = useSelector((state) => state.parts.brandsStatus);
  const brandsError = useSelector((state) => state.parts.brandsError);

  const offersStatus = useSelector((state) => state.parts.offersStatus);
  const offersError = useSelector((state) => state.parts.offersError);

  const handleRetryBrands = () => {
    if (searchedNumber) {
      dispatch(searchBrands({ number: searchedNumber, key: apiKey }));
    }
  };

  const handleRetryOffers = () => {
    if (searchedNumber && selectedBrand) {
      dispatch(searchOffers({ number: searchedNumber, brand: selectedBrand, key: apiKey }));
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-body-tertiary">
      <Header />

      <main className="container pb-5 flex-grow-1">
        {/* Индикатор этапов (1 -> 2) */}
        <StepIndicator />

        {/* ЭТАП 1: Поиск и выбор производителя */}
        {currentStep === 1 && (
          <>
            <StageOneSearch />

            {brandsStatus === 'loading' && (
              <LoadingSpinner
                message="Выполняется запрос к API..."
                tip="Поиск производителей, выпускающих деталь с указанным артикулом"
              />
            )}

            {brandsStatus === 'failed' && (
              <ErrorMessage
                title="Не удалось загрузить список производителей"
                message={brandsError}
                onRetry={handleRetryBrands}
                onClear={() => dispatch(clearErrors())}
              />
            )}

            {brandsStatus === 'succeeded' && <BrandList />}
          </>
        )}

        {/* ЭТАП 2: Получение предложений и аналогов */}
        {currentStep === 2 && (
          <>
            {offersStatus === 'loading' && (
              <LoadingSpinner
                message={`Загрузка предложений и аналогов для бренда ${selectedBrand}...`}
                tip="Инициализация повторного запроса к API с параметрами number, brand и analogues=on"
              />
            )}

            {offersStatus === 'failed' && (
              <ErrorMessage
                title="Не удалось загрузить предложения и аналоги"
                message={offersError}
                onRetry={handleRetryOffers}
                onClear={() => dispatch(clearErrors())}
              />
            )}

            {offersStatus === 'succeeded' && <StageTwoOffers />}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
