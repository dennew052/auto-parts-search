import React from 'react';

export default function WarehouseDetailsModal({ item, onClose }) {
  if (!item) return null;

  const warehouses = item.warehouses || [];

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content shadow border-0">
          <div className="modal-header bg-light">
            <div>
              <h5 className="modal-title fs-6 fw-bold mb-0">
                <i className="bi bi-buildings text-primary me-2"></i>
                Наличие по складам: {item.brand} — {item.number}
              </h5>
              <small className="text-muted">{item.name}</small>
            </div>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
          </div>

          <div className="modal-body p-3">
            {warehouses.length === 0 ? (
              <div className="text-center py-4 text-muted">
                <i className="bi bi-box-seam fs-2 d-block mb-2"></i>
                Детальная информация по складам отсутствует (остаток: {item.count} шт.)
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover table-bordered align-middle mb-0">
                  <thead className="table-light small">
                    <tr>
                      <th>Склад</th>
                      <th>Тип</th>
                      <th className="text-center">Остаток</th>
                      <th className="text-end">Цена на складе</th>
                      <th>Срок отгрузки</th>
                      <th className="text-center">Возврат</th>
                    </tr>
                  </thead>
                  <tbody>
                    {warehouses.map((w, idx) => (
                      <tr key={w.id || idx}>
                        <td className="fw-semibold">
                          <span className="badge bg-secondary-subtle text-dark font-monospace">
                            {w.code || 'Склад'}
                          </span>
                        </td>
                        <td>
                          {w.own ? (
                            <span className="badge bg-primary-subtle text-primary">Собственный</span>
                          ) : (
                            <span className="badge bg-light text-secondary border">Партнерский</span>
                          )}
                        </td>
                        <td className="text-center fw-bold">
                          {w.stock > 0 ? (
                            <span className="text-success">{w.stock} шт.</span>
                          ) : (
                            <span className="text-muted">0</span>
                          )}
                        </td>
                        <td className="text-end fw-bold text-dark">
                          {Number(w.price) > 0 ? `${Number(w.price).toLocaleString('ru-RU')} ₽` : '—'}
                        </td>
                        <td className="small text-muted">
                          {formatDate(w.shipmentDate)}
                        </td>
                        <td className="text-center">
                          {w.notRefund ? (
                            <span className="badge bg-warning-subtle text-warning-emphasis" title="Невозвратная позиция">
                              Невозвратная
                            </span>
                          ) : (
                            <span className="badge bg-success-subtle text-success">
                              Возвратная
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="modal-footer bg-light py-2">
            <button type="button" className="btn btn-secondary btn-sm px-4" onClick={onClose}>
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
