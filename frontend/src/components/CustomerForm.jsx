import { useState, useEffect } from 'react';
import Modal from './common/Modal';

const emptyForm = { full_name: '', email: '', phone: '' };

export default function CustomerForm({ isOpen, onClose, onSubmit, loading }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setForm(emptyForm);
      setErrors({});
    }
  }, [isOpen]);

  function validate() {
    const errs = {};
    if (!form.full_name.trim()) errs.full_name = 'Full name is required';
    if (!form.email.trim()) {
      errs.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errs.email = 'Enter a valid email address';
    }
    if (!form.phone.trim()) errs.phone = 'Phone number is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      full_name: form.full_name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
    });
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Customer"
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <><span className="loading-spinner" style={{ width: 16, height: 16, borderWidth: 2 }}></span> Saving...</>
            ) : (
              'Create Customer'
            )}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="customer-name">Full Name</label>
          <input
            id="customer-name"
            className={`form-input ${errors.full_name ? 'error' : ''}`}
            type="text"
            placeholder="e.g. John Smith"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          />
          {errors.full_name && <div className="form-error">{errors.full_name}</div>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="customer-email">Email Address</label>
          <input
            id="customer-email"
            className={`form-input ${errors.email ? 'error' : ''}`}
            type="email"
            placeholder="e.g. john@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          {errors.email && <div className="form-error">{errors.email}</div>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="customer-phone">Phone Number</label>
          <input
            id="customer-phone"
            className={`form-input ${errors.phone ? 'error' : ''}`}
            type="tel"
            placeholder="e.g. +1 555-0123"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          {errors.phone && <div className="form-error">{errors.phone}</div>}
        </div>
      </form>
    </Modal>
  );
}
