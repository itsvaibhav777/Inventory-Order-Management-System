import StatusBadge from './common/StatusBadge';

export default function OrderList({ orders, onViewDetails, onDelete, loading }) {
  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="loading-spinner"></div>
        <span>Loading orders...</span>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🛒</div>
        <div className="empty-state-text">No orders yet</div>
        <div className="empty-state-sub">Create your first order to get started</div>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table className="table">
        <thead>
          <tr>
            <th>Order #</th>
            <th>Customer</th>
            <th>Items</th>
            <th>Total</th>
            <th>Status</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>
                <span style={{ fontWeight: 700, color: 'var(--color-accent)' }}>#{order.id}</span>
              </td>
              <td style={{ fontWeight: 600 }}>{order.customer_name || '—'}</td>
              <td>
                <span className="badge badge-info">{order.items?.length || 0} items</span>
              </td>
              <td style={{ fontWeight: 700 }}>${order.total_amount.toFixed(2)}</td>
              <td>
                <StatusBadge status={order.status} />
              </td>
              <td style={{ color: 'var(--color-text-muted)' }}>
                {new Date(order.created_at).toLocaleDateString()}
              </td>
              <td>
                <div className="table-actions">
                  <button className="btn btn-ghost btn-sm" onClick={() => onViewDetails(order)} title="View Details">
                    👁️
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => onDelete(order)} title="Cancel Order">
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
