import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export default function Pagination({ currentPage, totalItems, itemsPerPage, onPageChange }) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
      {/* Prev */}
      <button
        type="button"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="icon-action-btn"
        style={{
          opacity: currentPage === 1 ? 0.4 : 1,
          cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
          padding: '8px',
          borderRadius: '8px',
          background: 'var(--white)',
          border: '1.5px solid var(--gray-200)',
          color: 'var(--gray-700)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <FiChevronLeft size={16} />
      </button>

      {/* Page Numbers */}
      {pages.map(page => (
        <button
          key={page}
          type="button"
          onClick={() => onPageChange(page)}
          style={{
            minWidth: '36px',
            height: '36px',
            borderRadius: '8px',
            border: page === currentPage ? '1.5px solid var(--primary)' : '1.5px solid var(--gray-200)',
            background: page === currentPage ? 'var(--primary)' : 'var(--white)',
            color: page === currentPage ? '#fff' : 'var(--gray-700)',
            fontWeight: page === currentPage ? 700 : 500,
            cursor: 'pointer',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
          }}
        >
          {page}
        </button>
      ))}

      {/* Next */}
      <button
        type="button"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="icon-action-btn"
        style={{
          opacity: currentPage === totalPages ? 0.4 : 1,
          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
          padding: '8px',
          borderRadius: '8px',
          background: 'var(--white)',
          border: '1.5px solid var(--gray-200)',
          color: 'var(--gray-700)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <FiChevronRight size={16} />
      </button>
    </div>
  );
}
