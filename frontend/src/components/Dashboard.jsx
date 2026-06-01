import { useState, useEffect } from 'react';
import { dashboardApi } from '../api/client';
import StatusBadge from './common/StatusBadge';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);
      const response = await dashboardApi.get();
      setData(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="loading-spinner"></div>
        <span>Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">⚠️</div>
        <div className="empty-state-text">Failed to load dashboard</div>
        <div className="empty-state-sub">{error}</div>
        <button className="btn btn-primary" style={{ marginTop: 'var(--space-lg)' }} onClick={loadDashboard}>
          Retry
        </button>
      </div>
    );
  }

  const stats = [
    { label: 'Total Products', value: data.total_products, icon: '📦', variant: 'accent' },
    { label: 'Total Customers', value: data.total_customers, icon: '👥', variant: 'success' },
    { label: 'Total Orders', value: data.total_orders, icon: '🛒', variant: 'info' },
    { label: 'Revenue', value: `$${data.total_revenue.toLocaleString()}`, icon: '💰', variant: 'warning' },
  ];

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">Dashboard Overview</h2>
          <p className="page-subtitle">Monitor your inventory and orders at a glance</p>
        </div>
        <button className="btn btn-secondary" onClick={loadDashboard}>↻ Refresh</button>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((stat) => (
          <div key={stat.label} className={`stat-card ${stat.variant}`}>
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Low Stock Alerts */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">⚠️ Low Stock Alerts</h3>
          <span className="badge badge-warning">{data.low_stock_products.length} items</span>
        </div>
        {data.low_stock_products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">✅</div>
            <div className="empty-state-text">All products are well stocked</div>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.low_stock_products.map((product) => (
                  <tr key={product.id}>
                    <td style={{ fontWeight: 600 }}>{product.name}</td>
                    <td>
                      <span className="badge badge-accent">{product.sku}</span>
                    </td>
                    <td>${product.price.toFixed(2)}</td>
                    <td style={{ fontWeight: 700, color: product.quantity === 0 ? 'var(--color-danger)' : 'var(--color-warning)' }}>
                      {product.quantity}
                    </td>
                    <td>
                      <StatusBadge status={product.quantity === 0 ? 'Out of Stock' : 'Low Stock'} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
