import { useState, useEffect, useCallback } from 'react';
import { productsApi } from '../api/client';
import ProductList from '../components/ProductList';
import ProductForm from '../components/ProductForm';
import { useToast } from '../components/common/Toast';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { addToast } = useToast();

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await productsApi.getAll();
      setProducts(res.data);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  async function handleSubmit(data) {
    try {
      setSubmitting(true);
      if (editingProduct) {
        await productsApi.update(editingProduct.id, data);
        addToast('Product updated successfully');
      } else {
        await productsApi.create(data);
        addToast('Product created successfully');
      }
      setFormOpen(false);
      setEditingProduct(null);
      loadProducts();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  function handleEdit(product) {
    setEditingProduct(product);
    setFormOpen(true);
  }

  async function handleDelete(product) {
    if (!window.confirm(`Delete "${product.name}" (${product.sku})?`)) return;
    try {
      await productsApi.delete(product.id);
      addToast('Product deleted successfully');
      loadProducts();
    } catch (err) {
      addToast(err.message, 'error');
    }
  }

  function handleOpenNew() {
    setEditingProduct(null);
    setFormOpen(true);
  }

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">Products</h2>
          <p className="page-subtitle">Manage your product inventory</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenNew}>
          + Add Product
        </button>
      </div>

      <div className="card">
        <ProductList
          products={products}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={loading}
        />
      </div>

      <ProductForm
        isOpen={formOpen}
        onClose={() => { setFormOpen(false); setEditingProduct(null); }}
        onSubmit={handleSubmit}
        product={editingProduct}
        loading={submitting}
      />
    </div>
  );
}
