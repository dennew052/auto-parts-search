import React from 'react';

export default function LoadingSpinner({ message = 'Загрузка данных...', tip }) {
  return (
    <div className="card shadow-sm border-0 my-4 text-center py-5 bg-light">
      <div className="card-body">
        <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
          <span className="visually-hidden">Загрузка...</span>
        </div>
        <h5 className="text-secondary fw-normal">{message}</h5>
        {tip && <p className="text-muted small mt-2 mb-0">{tip}</p>}
      </div>
    </div>
  );
}
