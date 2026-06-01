import Modal from './common/Modal';
import StatusBadge from './common/StatusBadge';

export default function OrderDetails({ isOpen, onClose, order }) {
  if (!order) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Order #${order.id}`}
      footer={
        <button className="btn btn-secondary" onClick={onClose}>Close</button>
      }
    >
      <div className="order-detail-grid">
        <div>
          <div className="detail-label">Customer</div>
          <div className="detail-value">{order.customer_name || '—'}</div>
        </div>
        <div>
          <div className="detail-label">Status</div>
          <div className="detail-value">
            <StatusBadge status={order.status} />
          </div>
        </div>
        <div>
          <div className="detail-label">Order Date</div>
          <div className="detail-value">
            {new Date(order.created_at).toLocaleString()}
          </div>
        </div>
        <div>
          <div className="detail-label">Total Amount</div>
          <div className="detail-value" style={{ color: 'var(--color-accent)', fontWeight: 800, fontSize: 'var(--font-size-xl)' }}>
            ${order.total_amount.toFixed(2)}
          </div>
        </div>
      </div>

      <h4 style={{ marginBottom: 'var(--space-md)', color: 'var(--color-text-secondary)' }}>
        Order Items ({order.items?.length || 0})
      </h4>
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Unit Price</th>
              <th>Qty</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {order.items?.map((item) => (
              <tr key={item.id}>
                <td style={{ fontWeight: 600 }}>{item.product_name || '—'}</td>
                <td>
                  <span className="badge badge-accent">{item.product_sku || '—'}</span>
                </td>
                <td>${item.unit_price.toFixed(2)}</td>
                <td>{item.quantity}</td>
                <td style={{ fontWeight: 700 }}>${item.subtotal.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Modal>
  );
}
