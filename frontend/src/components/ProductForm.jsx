import { useState, useEffect } from 'react';
import Modal from './common/Modal';

const emptyForm = { name: '', sku: '', price: '', quantity: '' };

export default function ProductForm({ isOpen, onClose, onSubmit, product, loading }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  const isEdit = !!product;

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || '',
        sku: product.sku || '',
        price: product.price?.toString() || '',
        quantity: product.quantity?.toString() || '',
      });
    } else {
      setForm(emptyForm);
    }
    setErrors({});
  }, [product, isOpen]);

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Product name is required';
    if (!form.sku.trim()) errs.sku = 'SKU is required';
    if (!form.price || parseFloat(form.price) <= 0) errs.price = 'Price must be greater than 0';
    if (form.quantity === '' || parseInt(form.quantity) < 0) errs.quantity = 'Quantity must be 0 or more';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      name: form.name.trim(),
      sku: form.sku.trim(),
      price: parseFloat(form.price),
      quantity: parseInt(form.quantity),
    });
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Product' : 'Add New Product'}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <><span className="loading-spinner" style={{ width: 16, height: 16, borderWidth: 2 }}></span> Saving...</>
            ) : (
              isEdit ? 'Update Product' : 'Create Product'
            )}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="product-name">Product Name</label>
          <input
            id="product-name"
            className={`form-input ${errors.name ? 'error' : ''}`}
            type="text"
            placeholder="e.g. Wireless Keyboard"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          {errors.name && <div className="form-error">{errors.name}</div>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="product-sku">SKU / Code</label>
            <input
              id="product-sku"
              className={`form-input ${errors.sku ? 'error' : ''}`}
              type="text"
              placeholder="e.g. KB-001"
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
            />
            {errors.sku && <div className="form-error">{errors.sku}</div>}
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="product-price">Price ($)</label>
            <input
              id="product-price"
              className={`form-input ${errors.price ? 'error' : ''}`}
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
            {errors.price && <div className="form-error">{errors.price}</div>}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="product-quantity">Quantity in Stock</label>
          <input
            id="product-quantity"
            className={`form-input ${errors.quantity ? 'error' : ''}`}
            type="number"
            min="0"
            placeholder="0"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
          />
          {errors.quantity && <div className="form-error">{errors.quantity}</div>}
        </div>
      </form>
    </Modal>
  );
}
