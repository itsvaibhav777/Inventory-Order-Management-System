import { useState, useEffect } from 'react';
import Modal from './common/Modal';
import { customersApi, productsApi } from '../api/client';

export default function OrderForm({ isOpen, onClose, onSubmit, loading }) {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState([{ product_id: '', quantity: 1 }]);
  const [errors, setErrors] = useState({});
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadData();
      setCustomerId('');
      setItems([{ product_id: '', quantity: 1 }]);
      setErrors({});
    }
  }, [isOpen]);

  async function loadData() {
    setDataLoading(true);
    try {
      const [custRes, prodRes] = await Promise.all([
        customersApi.getAll(),
        productsApi.getAll(),
      ]);
      setCustomers(custRes.data);
      setProducts(prodRes.data);
    } catch (err) {
      console.error('Failed to load form data:', err);
    } finally {
      setDataLoading(false);
    }
  }

  function addItem() {
    setItems([...items, { product_id: '', quantity: 1 }]);
  }

  function removeItem(index) {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  }

  function updateItem(index, field, value) {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  }

  function getSelectedProduct(productId) {
    return products.find((p) => p.id === parseInt(productId));
  }

  function calculateTotal() {
    return items.reduce((total, item) => {
      const product = getSelectedProduct(item.product_id);
      if (product && item.quantity > 0) {
        return total + product.price * item.quantity;
      }
      return total;
    }, 0);
  }

  function validate() {
    const errs = {};
    if (!customerId) errs.customer = 'Please select a customer';

    const itemErrors = [];
    items.forEach((item, i) => {
      const itemErr = {};
      if (!item.product_id) itemErr.product = 'Select a product';
      else {
        const product = getSelectedProduct(item.product_id);
        if (product && item.quantity > product.quantity) {
          itemErr.quantity = `Only ${product.quantity} in stock`;
        }
      }
      if (!item.quantity || item.quantity < 1) itemErr.quantity = 'Min quantity is 1';
      if (Object.keys(itemErr).length > 0) itemErrors[i] = itemErr;
    });

    if (Object.keys(itemErrors).length > 0) errs.items = itemErrors;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      customer_id: parseInt(customerId),
      items: items.map((item) => ({
        product_id: parseInt(item.product_id),
        quantity: parseInt(item.quantity),
      })),
    });
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Order"
      footer={
        <>
          <div style={{ marginRight: 'auto', fontWeight: 700, fontSize: 'var(--font-size-lg)', color: 'var(--color-accent)' }}>
            Total: ${calculateTotal().toFixed(2)}
          </div>
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading || dataLoading}>
            {loading ? (
              <><span className="loading-spinner" style={{ width: 16, height: 16, borderWidth: 2 }}></span> Placing...</>
            ) : (
              'Place Order'
            )}
          </button>
        </>
      }
    >
      {dataLoading ? (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <span>Loading data...</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {/* Customer Selection */}
          <div className="form-group">
            <label className="form-label" htmlFor="order-customer">Customer</label>
            <select
              id="order-customer"
              className={`form-select ${errors.customer ? 'error' : ''}`}
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
            >
              <option value="">Select a customer...</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name} ({c.email})
                </option>
              ))}
            </select>
            {errors.customer && <div className="form-error">{errors.customer}</div>}
          </div>

          {/* Order Items */}
          <div className="order-items-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Order Items</label>
              <button type="button" className="btn btn-secondary btn-sm" onClick={addItem}>
                + Add Item
              </button>
            </div>

            {items.map((item, index) => {
              const selectedProduct = getSelectedProduct(item.product_id);
              const itemErrors = errors.items?.[index] || {};
              return (
                <div key={index} className="order-item-row">
                  <div className="form-group">
                    <label className="form-label">Product</label>
                    <select
                      className={`form-select ${itemErrors.product ? 'error' : ''}`}
                      value={item.product_id}
                      onChange={(e) => updateItem(index, 'product_id', e.target.value)}
                    >
                      <option value="">Select product...</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} — ${p.price.toFixed(2)} (Stock: {p.quantity})
                        </option>
                      ))}
                    </select>
                    {itemErrors.product && <div className="form-error">{itemErrors.product}</div>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Qty</label>
                    <input
                      className={`form-input ${itemErrors.quantity ? 'error' : ''}`}
                      type="number"
                      min="1"
                      max={selectedProduct?.quantity || 999}
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                    />
                    {itemErrors.quantity && <div className="form-error">{itemErrors.quantity}</div>}
                  </div>
                  <div>
                    <button
                      type="button"
                      className="btn btn-danger btn-icon"
                      onClick={() => removeItem(index)}
                      disabled={items.length === 1}
                      title="Remove item"
                      style={{ marginTop: 'var(--space-lg)' }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </form>
      )}
    </Modal>
  );
}
