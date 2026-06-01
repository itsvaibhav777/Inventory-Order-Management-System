import { useState, useEffect, useCallback } from 'react';
import { ordersApi } from '../api/client';
import OrderList from '../components/OrderList';
import OrderForm from '../components/OrderForm';
import OrderDetails from '../components/OrderDetails';
import { useToast } from '../components/common/Toast';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [detailOrder, setDetailOrder] = useState(null);
  const { addToast } = useToast();

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await ordersApi.getAll();
      setOrders(res.data);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  async function handleSubmit(data) {
    try {
      setSubmitting(true);
      await ordersApi.create(data);
      addToast('Order placed successfully');
      setFormOpen(false);
      loadOrders();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleViewDetails(order) {
    try {
      const res = await ordersApi.getById(order.id);
      setDetailOrder(res.data);
    } catch (err) {
      addToast(err.message, 'error');
    }
  }

  async function handleDelete(order) {
    if (!window.confirm(`Cancel and delete Order #${order.id}? Stock will be restored.`)) return;
    try {
      await ordersApi.delete(order.id);
      addToast('Order cancelled successfully. Stock restored.');
      loadOrders();
    } catch (err) {
      addToast(err.message, 'error');
    }
  }

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">Orders</h2>
          <p className="page-subtitle">Track and manage customer orders</p>
        </div>
        <button className="btn btn-primary" onClick={() => setFormOpen(true)}>
          + New Order
        </button>
      </div>

      <div className="card">
        <OrderList
          orders={orders}
          onViewDetails={handleViewDetails}
          onDelete={handleDelete}
          loading={loading}
        />
      </div>

      <OrderForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        loading={submitting}
      />

      <OrderDetails
        isOpen={!!detailOrder}
        onClose={() => setDetailOrder(null)}
        order={detailOrder}
      />
    </div>
  );
}
