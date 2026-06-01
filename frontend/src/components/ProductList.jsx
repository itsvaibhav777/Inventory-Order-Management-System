import StatusBadge from './common/StatusBadge';

export default function ProductList({ products, onEdit, onDelete, loading }) {
  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="loading-spinner"></div>
        <span>Loading products...</span>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📦</div>
        <div className="empty-state-text">No products yet</div>
        <div className="empty-state-sub">Add your first product to get started</div>
      </div>
    );
  }

  function getStockStatus(quantity) {
    if (quantity === 0) return 'Out of Stock';
    if (quantity < 10) return 'Low Stock';
    return 'In Stock';
  }

  return (
    <div className="table-wrapper">
      <table className="table">
        <thead>
          <tr>
            <th>Product</th>
            <th>SKU</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td style={{ fontWeight: 600 }}>{product.name}</td>
              <td>
                <span className="badge badge-accent">{product.sku}</span>
              </td>
              <td>${product.price.toFixed(2)}</td>
              <td style={{ fontWeight: 600 }}>{product.quantity}</td>
              <td>
                <StatusBadge status={getStockStatus(product.quantity)} />
              </td>
              <td>
                <div className="table-actions">
                  <button className="btn btn-ghost btn-sm" onClick={() => onEdit(product)} title="Edit">
                    ✏️
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => onDelete(product)} title="Delete">
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
