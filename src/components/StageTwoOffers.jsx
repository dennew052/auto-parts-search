import React, { useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { goToStep, searchOffers } from '../features/parts/partsSlice';
import WarehouseDetailsModal from './WarehouseDetailsModal';

export default function StageTwoOffers() {
  const dispatch = useDispatch();
  const apiKey = useSelector((state) => state.parts.apiKey);
  const searchedNumber = useSelector((state) => state.parts.searchedNumber);
  const selectedBrand = useSelector((state) => state.parts.selectedBrand);
  const offers = useSelector((state) => state.parts.offers);
  const offersStatus = useSelector((state) => state.parts.offersStatus);

  const [selectedWarehouseItem, setSelectedWarehouseItem] = useState(null);
  const [filterType, setFilterType] = useState('all'); // 'all' | 'original' | 'analogue' | 'inStock'
  const [searchFilter, setSearchFilter] = useState('');
  const [sortBy, setSortBy] = useState('price-asc'); // 'price-asc' | 'price-desc' | 'stock-desc' | 'name-asc'

  if (offersStatus !== 'succeeded') {
    return null;
  }

  // Фильтрация и сортировка предложений
  const processedOffers = useMemo(() => {
    let list = [...offers];

    // Фильтр по типу (оригинал / аналог / в наличии)
    if (filterType === 'original') {
      list = list.filter((item) => !item.isAnalogue);
    } else if (filterType === 'analogue') {
      list = list.filter((item) => item.isAnalogue);
    } else if (filterType === 'inStock') {
      list = list.filter((item) => item.count > 0);
    }

    // Текстовый поиск внутри результатов
    if (searchFilter.trim()) {
      const q = searchFilter.trim().toLowerCase();
      list = list.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.brand.toLowerCase().includes(q) ||
          item.number.toLowerCase().includes(q)
      );
    }

    // Сортировка
    list.sort((a, b) => {
      if (sortBy === 'price-asc') {
        // Позиции с ценой 0 отправляем в конец
        if (a.price === 0 && b.price > 0) return 1;
        if (a.price > 0 && b.price === 0) return -1;
        return a.price - b.price;
      }
      if (sortBy === 'price-desc') {
        return b.price - a.price;
      }
      if (sortBy === 'stock-desc') {
        return b.count - a.count;
      }
      if (sortBy === 'name-asc') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });

    return list;
  }, [offers, filterType, searchFilter, sortBy]);

  const originalCount = offers.filter((o) => !o.isAnalogue).length;
  const analogueCount = offers.filter((o) => o.isAnalogue).length;
  const inStockCount = offers.filter((o) => o.count > 0).length;

  return (
    <>
      <div className="card shadow-sm border-0 my-4">
        {/* Шапка результатов Этапа 2 */}
        <div className="card-header bg-white py-3 border-bottom">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
                  onClick={() => dispatch(goToStep(1))}
                  title="Вернуться к списку производителей"
                >
                  <i className="bi bi-arrow-left"></i>
                  <span>Другой производитель</span>
                </button>
                <h5 className="mb-0 fw-bold text-dark">
                  Предложения и аналоги
                </h5>
              </div>
              <div className="d-flex flex-wrap align-items-center gap-2 mt-1">
                <span className="text-muted small">Артикул:</span>
                <span className="badge bg-light text-dark border font-monospace">{searchedNumber}</span>
                <span className="text-muted small">Выбранный производитель:</span>
                <span className="badge bg-primary-subtle text-primary border border-primary-subtle font-monospace fw-bold">
                  {selectedBrand}
                </span>
              </div>
            </div>

            <div className="d-flex align-items-center gap-2">
              <button
                type="button"
                className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1"
                onClick={() =>
                  dispatch(
                    searchOffers({
                      number: searchedNumber,
                      brand: selectedBrand,
                      key: apiKey
                    })
                  )
                }
                title="Обновить предложения"
              >
                <i className="bi bi-arrow-clockwise"></i>
                <span>Обновить</span>
              </button>
            </div>
          </div>
        </div>

        {/* Панель фильтров и сортировки */}
        <div className="card-body bg-light border-bottom p-3">
          <div className="row g-2 align-items-center">
            {/* Вкладки/фильтры */}
            <div className="col-lg-6 col-md-12">
              <div className="btn-group btn-group-sm w-100" role="group">
                <button
                  type="button"
                  className={`btn ${filterType === 'all' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setFilterType('all')}
                >
                  Все ({offers.length})
                </button>
                <button
                  type="button"
                  className={`btn ${filterType === 'original' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setFilterType('original')}
                >
                  {selectedBrand} ({originalCount})
                </button>
                <button
                  type="button"
                  className={`btn ${filterType === 'analogue' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setFilterType('analogue')}
                >
                  Аналоги ({analogueCount})
                </button>
                <button
                  type="button"
                  className={`btn ${filterType === 'inStock' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setFilterType('inStock')}
                >
                  В наличии ({inStockCount})
                </button>
              </div>
            </div>

            {/* Поиск по результатам */}
            <div className="col-lg-3 col-md-6">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-white">
                  <i className="bi bi-filter"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Фильтр по названию/бренду..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                />
                {searchFilter && (
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={() => setSearchFilter('')}
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* Сортировка */}
            <div className="col-lg-3 col-md-6">
              <select
                className="form-select form-select-sm"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="price-asc">Цена: по возрастанию</option>
                <option value="price-desc">Цена: по убыванию</option>
                <option value="stock-desc">Остаток: по убыванию</option>
                <option value="name-asc">По названию (А-Я)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Основная таблица результатов */}
        <div className="card-body p-0">
          {processedOffers.length === 0 ? (
            <div className="text-center py-5">
              <div className="text-muted mb-2 fs-2">
                <i className="bi bi-search"></i>
              </div>
              <h6 className="fw-bold text-dark">Предложений не найдено</h6>
              <p className="text-muted small mb-0">
                Попробуйте сбросить фильтры или выбрать другого производителя.
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light small text-uppercase text-secondary">
                  <tr>
                    <th style={{ width: '130px' }}>Тип</th>
                    <th style={{ width: '180px' }}>Производитель</th>
                    <th>Название детали</th>
                    <th className="text-end" style={{ width: '150px' }}>Стоимость (цена)</th>
                    <th className="text-center" style={{ width: '140px' }}>Остаток</th>
                    <th className="text-center" style={{ width: '140px' }}>Склады</th>
                  </tr>
                </thead>
                <tbody>
                  {processedOffers.map((item) => {
                    const isRequested = !item.isAnalogue;
                    const warehousesCount = item.warehouses ? item.warehouses.length : 0;
                    const hasStock = item.count > 0;

                    return (
                      <tr
                        key={item.id}
                        className={isRequested ? 'table-primary-subtle' : ''}
                      >
                        {/* 1. Тип (Запрошенный бренд / Аналог) */}
                        <td>
                          {isRequested ? (
                            <span className="badge bg-primary text-white d-inline-flex align-items-center gap-1">
                              <i className="bi bi-star-fill" style={{ fontSize: '0.7rem' }}></i>
                              <span>Запрошен</span>
                            </span>
                          ) : (
                            <span className="badge bg-secondary-subtle text-secondary border">
                              Аналог
                            </span>
                          )}
                        </td>

                        {/* 2. Производитель и артикул */}
                        <td>
                          <div className="fw-bold text-dark">{item.brand}</div>
                          <div className="font-monospace text-muted small">{item.number}</div>
                        </td>

                        {/* 3. Название детали */}
                        <td>
                          <div className="fw-semibold text-dark">{item.name}</div>
                          {item.notRefund && (
                            <span className="badge bg-warning-subtle text-warning-emphasis small mt-1">
                              Невозвратная
                            </span>
                          )}
                        </td>

                        {/* 4. Стоимость (цена) */}
                        <td className="text-end">
                          {item.price > 0 ? (
                            <div>
                              <div className="fs-6 fw-bold text-success">
                                {item.price.toLocaleString('ru-RU')} ₽
                              </div>
                              {warehousesCount > 1 && (
                                <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>
                                  от мин. цены
                                </small>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted small">По запросу</span>
                          )}
                        </td>

                        {/* 5. Доступный остаток на складе */}
                        <td className="text-center">
                          {hasStock ? (
                            <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 fs-7">
                              {item.count} шт.
                            </span>
                          ) : (
                            <span className="badge bg-light text-muted border px-2 py-1 fs-7">
                              0 шт.
                            </span>
                          )}
                        </td>

                        {/* 6. Подробности складов */}
                        <td className="text-center">
                          {warehousesCount > 0 ? (
                            <button
                              type="button"
                              className="btn btn-outline-secondary btn-sm py-1 px-2 d-inline-flex align-items-center gap-1"
                              onClick={() => setSelectedWarehouseItem(item)}
                              title="Посмотреть список складов и сроки отгрузки"
                            >
                              <i className="bi bi-buildings"></i>
                              <span>{warehousesCount} {warehousesCount === 1 ? 'склад' : 'склада'}</span>
                            </button>
                          ) : (
                            <span className="text-muted small">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Подвал таблицы со статистикой */}
        <div className="card-footer bg-white py-3 d-flex justify-content-between align-items-center small text-muted">
          <div>
            Показано позиций: <strong>{processedOffers.length}</strong> из <strong>{offers.length}</strong>
          </div>
          <div>
            Всего в наличии: <strong>{inStockCount}</strong> предложений
          </div>
        </div>
      </div>

      {/* Модальное окно складов */}
      <WarehouseDetailsModal
        item={selectedWarehouseItem}
        onClose={() => setSelectedWarehouseItem(null)}
      />
    </>
  );
}
