export default function CustomerList({ customers, onDelete, loading }) {
  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="loading-spinner"></div>
        <span>Loading customers...</span>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">👥</div>
        <div className="empty-state-text">No customers yet</div>
        <div className="empty-state-sub">Add your first customer to get started</div>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.id}>
              <td style={{ fontWeight: 600 }}>{customer.full_name}</td>
              <td style={{ color: 'var(--color-accent)' }}>{customer.email}</td>
              <td>{customer.phone}</td>
              <td style={{ color: 'var(--color-text-muted)' }}>
                {new Date(customer.created_at).toLocaleDateString()}
              </td>
              <td>
                <div className="table-actions">
                  <button className="btn btn-danger btn-sm" onClick={() => onDelete(customer)} title="Delete">
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
