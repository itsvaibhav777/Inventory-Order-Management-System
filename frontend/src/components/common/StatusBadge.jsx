export default function StatusBadge({ status }) {
  const statusMap = {
    pending: 'warning',
    completed: 'success',
    cancelled: 'danger',
    'in-stock': 'success',
    'low-stock': 'warning',
    'out-of-stock': 'danger',
  };

  const variant = statusMap[status?.toLowerCase()] || 'info';

  return <span className={`badge badge-${variant}`}>{status}</span>;
}
