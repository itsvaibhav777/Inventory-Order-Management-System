from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException, status
from app.models import Product, Customer, Order, OrderItem
from app.schemas import (
    ProductCreate, ProductUpdate, CustomerCreate,
    OrderCreate, DashboardResponse, ProductResponse
)


# ──────────────────────────────────────────────
# Product CRUD
# ──────────────────────────────────────────────

def create_product(db: Session, product_data: ProductCreate) -> Product:
    """Create a new product. Raises 400 if SKU already exists."""
    existing = db.query(Product).filter(Product.sku == product_data.sku).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Product with SKU '{product_data.sku}' already exists."
        )
    product = Product(**product_data.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


def get_products(db: Session) -> List[Product]:
    """Retrieve all products."""
    return db.query(Product).order_by(Product.created_at.desc()).all()


def get_product(db: Session, product_id: int) -> Product:
    """Retrieve a product by ID. Raises 404 if not found."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID {product_id} not found."
        )
    return product


def update_product(db: Session, product_id: int, product_data: ProductUpdate) -> Product:
    """Update a product. Raises 404 if not found, 400 if SKU conflict."""
    product = get_product(db, product_id)
    update_data = product_data.model_dump(exclude_unset=True)

    # Check SKU uniqueness if being updated
    if "sku" in update_data:
        existing = db.query(Product).filter(
            Product.sku == update_data["sku"],
            Product.id != product_id
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product with SKU '{update_data['sku']}' already exists."
            )

    for key, value in update_data.items():
        setattr(product, key, value)

    db.commit()
    db.refresh(product)
    return product


def delete_product(db: Session, product_id: int) -> Product:
    """Delete a product. Raises 404 if not found, 400 if referenced in orders."""
    product = get_product(db, product_id)

    # Check if product is referenced in any order items
    order_item_count = db.query(OrderItem).filter(OrderItem.product_id == product_id).count()
    if order_item_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete product that is referenced in existing orders."
        )

    db.delete(product)
    db.commit()
    return product


# ──────────────────────────────────────────────
# Customer CRUD
# ──────────────────────────────────────────────

def create_customer(db: Session, customer_data: CustomerCreate) -> Customer:
    """Create a new customer. Raises 400 if email already exists."""
    existing = db.query(Customer).filter(Customer.email == customer_data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Customer with email '{customer_data.email}' already exists."
        )
    customer = Customer(**customer_data.model_dump())
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer


def get_customers(db: Session) -> List[Customer]:
    """Retrieve all customers."""
    return db.query(Customer).order_by(Customer.created_at.desc()).all()


def get_customer(db: Session, customer_id: int) -> Customer:
    """Retrieve a customer by ID. Raises 404 if not found."""
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with ID {customer_id} not found."
        )
    return customer


def delete_customer(db: Session, customer_id: int) -> Customer:
    """Delete a customer. Raises 404 if not found, 400 if has orders."""
    customer = get_customer(db, customer_id)

    order_count = db.query(Order).filter(Order.customer_id == customer_id).count()
    if order_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete customer with existing orders."
        )

    db.delete(customer)
    db.commit()
    return customer


# ──────────────────────────────────────────────
# Order CRUD
# ──────────────────────────────────────────────

def create_order(db: Session, order_data: OrderCreate) -> Order:
    """
    Create a new order:
    1. Validate customer exists
    2. Validate all products exist and have sufficient stock
    3. Create order with items
    4. Reduce stock for each product
    5. Calculate total amount automatically
    """
    # Validate customer
    customer = db.query(Customer).filter(Customer.id == order_data.customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with ID {order_data.customer_id} not found."
        )

    # Validate products and stock
    order_items = []
    total_amount = 0.0

    for item in order_data.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with ID {item.product_id} not found."
            )
        if product.quantity < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Insufficient stock for product '{product.name}' (SKU: {product.sku}). "
                    f"Available: {product.quantity}, Requested: {item.quantity}."
                )
            )

        subtotal = product.price * item.quantity
        total_amount += subtotal

        order_items.append({
            "product": product,
            "quantity": item.quantity,
            "unit_price": product.price,
            "subtotal": subtotal,
        })

    # Create the order
    order = Order(
        customer_id=order_data.customer_id,
        total_amount=round(total_amount, 2),
        status="pending",
    )
    db.add(order)
    db.flush()  # Get the order ID without committing

    # Create order items and reduce stock
    for item_data in order_items:
        order_item = OrderItem(
            order_id=order.id,
            product_id=item_data["product"].id,
            quantity=item_data["quantity"],
            unit_price=item_data["unit_price"],
            subtotal=item_data["subtotal"],
        )
        db.add(order_item)

        # Reduce stock
        item_data["product"].quantity -= item_data["quantity"]

    db.commit()
    db.refresh(order)
    return order


def get_orders(db: Session) -> List[Order]:
    """Retrieve all orders with customer info."""
    return db.query(Order).order_by(Order.created_at.desc()).all()


def get_order(db: Session, order_id: int) -> Order:
    """Retrieve an order by ID with items. Raises 404 if not found."""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with ID {order_id} not found."
        )
    return order


def delete_order(db: Session, order_id: int) -> Order:
    """Delete/cancel an order and restore stock. Raises 404 if not found."""
    order = get_order(db, order_id)

    # Restore stock for each item
    for item in order.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if product:
            product.quantity += item.quantity

    db.delete(order)
    db.commit()
    return order


# ──────────────────────────────────────────────
# Dashboard
# ──────────────────────────────────────────────

def get_dashboard(db: Session) -> dict:
    """Get dashboard summary statistics."""
    total_products = db.query(Product).count()
    total_customers = db.query(Customer).count()
    total_orders = db.query(Order).count()
    total_revenue = db.query(func.coalesce(func.sum(Order.total_amount), 0.0)).scalar()

    # Low stock products (quantity < 10)
    low_stock = db.query(Product).filter(Product.quantity < 10).order_by(Product.quantity.asc()).all()

    return {
        "total_products": total_products,
        "total_customers": total_customers,
        "total_orders": total_orders,
        "total_revenue": round(float(total_revenue), 2),
        "low_stock_products": low_stock,
    }
