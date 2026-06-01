from datetime import datetime
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List


# ──────────────────────────────────────────────
# Product Schemas
# ──────────────────────────────────────────────

class ProductCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Product name")
    sku: str = Field(..., min_length=1, max_length=100, description="Unique SKU/code")
    price: float = Field(..., gt=0, description="Product price (must be > 0)")
    quantity: int = Field(..., ge=0, description="Quantity in stock (must be >= 0)")

    @field_validator("sku")
    @classmethod
    def sku_must_be_stripped(cls, v: str) -> str:
        return v.strip().upper()

    @field_validator("name")
    @classmethod
    def name_must_be_stripped(cls, v: str) -> str:
        return v.strip()


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    sku: Optional[str] = Field(None, min_length=1, max_length=100)
    price: Optional[float] = Field(None, gt=0)
    quantity: Optional[int] = Field(None, ge=0)

    @field_validator("sku")
    @classmethod
    def sku_must_be_stripped(cls, v):
        if v is not None:
            return v.strip().upper()
        return v

    @field_validator("name")
    @classmethod
    def name_must_be_stripped(cls, v):
        if v is not None:
            return v.strip()
        return v


class ProductResponse(BaseModel):
    id: int
    name: str
    sku: str
    price: float
    quantity: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ──────────────────────────────────────────────
# Customer Schemas
# ──────────────────────────────────────────────

class CustomerCreate(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=255, description="Customer full name")
    email: str = Field(..., min_length=1, max_length=255, description="Customer email")
    phone: str = Field(..., min_length=1, max_length=50, description="Phone number")

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        v = v.strip().lower()
        if "@" not in v or "." not in v.split("@")[-1]:
            raise ValueError("Invalid email address")
        return v

    @field_validator("full_name")
    @classmethod
    def name_must_be_stripped(cls, v: str) -> str:
        return v.strip()


class CustomerResponse(BaseModel):
    id: int
    full_name: str
    email: str
    phone: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ──────────────────────────────────────────────
# Order Schemas
# ──────────────────────────────────────────────

class OrderItemCreate(BaseModel):
    product_id: int = Field(..., description="ID of the product to order")
    quantity: int = Field(..., gt=0, description="Quantity to order (must be > 0)")


class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    product_name: Optional[str] = None
    product_sku: Optional[str] = None
    quantity: int
    unit_price: float
    subtotal: float

    model_config = {"from_attributes": True}


class OrderCreate(BaseModel):
    customer_id: int = Field(..., description="ID of the customer placing the order")
    items: List[OrderItemCreate] = Field(..., min_length=1, description="Order line items")


class OrderResponse(BaseModel):
    id: int
    customer_id: int
    customer_name: Optional[str] = None
    total_amount: float
    status: str
    created_at: datetime
    items: List[OrderItemResponse] = []

    model_config = {"from_attributes": True}


# ──────────────────────────────────────────────
# Dashboard Schema
# ──────────────────────────────────────────────

class DashboardResponse(BaseModel):
    total_products: int
    total_customers: int
    total_orders: int
    low_stock_products: List[ProductResponse]
    total_revenue: float
