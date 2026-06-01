import { useState, useEffect, useCallback } from 'react';
import { customersApi } from '../api/client';
import CustomerList from '../components/CustomerList';
import CustomerForm from '../components/CustomerForm';
import { useToast } from '../components/common/Toast';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { addToast } = useToast();

  const loadCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await customersApi.getAll();
      setCustomers(res.data);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  async function handleSubmit(data) {
    try {
      setSubmitting(true);
      await customersApi.create(data);
      addToast('Customer created successfully');
      setFormOpen(false);
      loadCustomers();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(customer) {
    if (!window.confirm(`Delete customer "${customer.full_name}"?`)) return;
    try {
      await customersApi.delete(customer.id);
      addToast('Customer deleted successfully');
      loadCustomers();
    } catch (err) {
      addToast(err.message, 'error');
    }
  }

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">Customers</h2>
          <p className="page-subtitle">Manage your customer database</p>
        </div>
        <button className="btn btn-primary" onClick={() => setFormOpen(true)}>
          + Add Customer
        </button>
      </div>

      <div className="card">
        <CustomerList
          customers={customers}
          onDelete={handleDelete}
          loading={loading}
        />
      </div>

      <CustomerForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        loading={submitting}
      />
    </div>
  );
}
