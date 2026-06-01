from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import OrderCreate, OrderResponse, OrderItemResponse
from app import crud

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("", response_model=OrderResponse, status_code=201)
def create_order(order: OrderCreate, db: Session = Depends(get_db)):
    """Create a new order. Automatically reduces stock and calculates total."""
    db_order = crud.create_order(db, order)
    return _build_order_response(db_order)


@router.get("", response_model=List[OrderResponse])
def get_orders(db: Session = Depends(get_db)):
    """Retrieve all orders."""
    orders = crud.get_orders(db)
    return [_build_order_response(o) for o in orders]


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db)):
    """Retrieve order details by ID."""
    order = crud.get_order(db, order_id)
    return _build_order_response(order)


@router.delete("/{order_id}", response_model=OrderResponse)
def delete_order(order_id: int, db: Session = Depends(get_db)):
    """Cancel/delete an order. Stock is automatically restored."""
    order = crud.delete_order(db, order_id)
    return _build_order_response(order)


def _build_order_response(order) -> dict:
    """Build an OrderResponse dict with customer name and product details on items."""
    return {
        "id": order.id,
        "customer_id": order.customer_id,
        "customer_name": order.customer.full_name if order.customer else None,
        "total_amount": order.total_amount,
        "status": order.status,
        "created_at": order.created_at,
        "items": [
            {
                "id": item.id,
                "product_id": item.product_id,
                "product_name": item.product.name if item.product else None,
                "product_sku": item.product.sku if item.product else None,
                "quantity": item.quantity,
                "unit_price": item.unit_price,
                "subtotal": item.subtotal,
            }
            for item in order.items
        ],
    }
