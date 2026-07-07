import { useState, useEffect } from 'react';
import { FiDownload, FiMoreVertical, FiCheck, FiX, FiRefreshCw, FiSearch, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import AdminLayout from '../../components/layout/AdminLayout';
import { getStoredPayments, saveStoredPayments } from '../../utils/storage';
import './AdminTable.css';

export default function Payments() {
  const [payments, setPayments] = useState(() => getStoredPayments());
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [toast, setToast] = useState(null);

  // Sync payments reactively on storage events
  useEffect(() => {
    setPayments(getStoredPayments());
    const handleSync = () => {
      setPayments(getStoredPayments());
    };
    window.addEventListener('storage', handleSync);
    return () => window.removeEventListener('storage', handleSync);
  }, []);

  const statusColor = { 
    Paid: 'badge badge-green', 
    Pending: 'badge badge-orange', 
    Refunded: 'badge badge-red' 
  };

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleUpdateStatus = (paymentId, nextStatus) => {
    const updated = payments.map(p => {
      if (p.id === paymentId) {
        return { ...p, status: nextStatus };
      }
      return p;
    });
    setPayments(updated);
    saveStoredPayments(updated);
    setActiveMenuId(null);
    showToast(`Payment ${paymentId} status changed to ${nextStatus}!`);
  };

  const handleSimulateInvoice = (payment) => {
    setActiveMenuId(null);
    showToast(`Invoice generated & downloaded for guest ${payment.guest}.`);
    
    // Simulate direct file download
    const element = document.createElement("a");
    const file = new Blob([
      `ELKHALIL HOTEL RECEIPT\n`,
      `=====================\n`,
      `Payment ID: ${payment.id}\n`,
      `Booking ID: ${payment.booking}\n`,
      `Guest Name: ${payment.guest}\n`,
      `Amount Paid: $${payment.amount}\n`,
      `Payment Method: ${payment.method}\n`,
      `Transaction Date: ${payment.date}\n`,
      `Current Status: ${payment.status}\n`,
      `=====================\n`,
      `Thank you for choosing El Khalil Hotel!`
    ], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `Receipt_${payment.id}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const filtered = payments.filter(p => {
    const matchSearch = p.guest.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <AdminLayout>
      <div className="admin-page">
        {toast && (
          <div className="admin-toast">
            <FiCheckCircle className="toast-icon" />
            {toast}
          </div>
        )}

        <div className="admin-page-header">
          <div>
            <h1>Payment Transactions</h1>
            <p>Track credit card transactions, PayPal logs, guest invoices, refund histories and status updates.</p>
          </div>
          <div className="admin-page-actions">
            <button className="btn btn-outline btn-sm" onClick={() => showToast('Payment logs exported to CSV.')}><FiDownload /> Export</button>
          </div>
        </div>

        <div className="admin-card">
          <div className="table-toolbar">
            <div className="search-box">
              <FiSearch className="search-icon" />
              <input 
                placeholder="Search by Guest or Payment ID..." 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
              />
            </div>
            <div className="toolbar-right">
              <select 
                className="form-input" 
                style={{ width: 'auto' }} 
                value={statusFilter} 
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value="All">All Payments</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Refunded">Refunded</option>
              </select>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Guest Name</th>
                  <th>Payment ID</th>
                  <th>Booking ID</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Transaction Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div className="table-user">
                        <div className="rb-avatar" style={{ background: 'var(--gold-bg)', color: 'var(--gold)' }}>{p.avatar}</div>
                        <div className="table-user-name" style={{ fontWeight: 600 }}>{p.guest}</div>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '13px' }}>{p.id}</td>
                    <td>{p.booking}</td>
                    <td><strong style={{ color: 'var(--gold)' }}>${p.amount}</strong></td>
                    <td>{p.method}</td>
                    <td>{p.date}</td>
                    <td><span className={statusColor[p.status]}>{p.status}</span></td>
                    <td style={{ textAlign: 'right', position: 'relative' }}>
                      <button 
                        className="icon-action-btn"
                        onClick={() => setActiveMenuId(activeMenuId === p.id ? null : p.id)}
                      >
                        <FiMoreVertical />
                      </button>

                      {activeMenuId === p.id && (
                        <div className="topbar-dropdown" style={{ right: '10px', top: '35px', minWidth: '160px', display: 'block' }}>
                          <button onClick={() => handleUpdateStatus(p.id, 'Paid')}>✔️ Mark as Paid</button>
                          <button onClick={() => handleUpdateStatus(p.id, 'Refunded')}>❌ Mark as Refunded</button>
                          <button onClick={() => handleUpdateStatus(p.id, 'Pending')}>⏳ Mark as Pending</button>
                          <button onClick={() => handleSimulateInvoice(p)} style={{ borderTop: '1px solid var(--gray-100)', color: 'var(--gold)' }}>📄 Download Invoice</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
