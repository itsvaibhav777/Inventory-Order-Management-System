# Inventory & Order Management System

A full-stack web application for managing products, customers, orders, and inventory tracking. Built with React, FastAPI, and PostgreSQL, fully containerized with Docker.

![Tech Stack](https://img.shields.io/badge/React-18-blue?logo=react)
![Tech Stack](https://img.shields.io/badge/FastAPI-0.111-green?logo=fastapi)
![Tech Stack](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql)
![Tech Stack](https://img.shields.io/badge/Docker-Compose-blue?logo=docker)

## Features

- **Product Management** — Full CRUD with SKU tracking and stock levels
- **Customer Management** — Create and manage customer records
- **Order Management** — Place orders with automatic stock reduction and total calculation
- **Dashboard** — Real-time overview with low-stock alerts
- **Business Logic** — Unique SKU/email enforcement, stock validation, auto-calculations
- **Responsive UI** — Premium dark-themed design that works on desktop and mobile

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router, Axios |
| Backend | Python, FastAPI, SQLAlchemy, Pydantic |
| Database | PostgreSQL 16 |
| Containerization | Docker, Docker Compose |
| Deployment | Render (backend), Vercel (frontend) |

## Quick Start with Docker Compose

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/)

### Steps

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd inventory-order-management
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   # Edit .env if you want to change defaults
   ```

3. **Start all services**
   ```bash
   docker-compose up --build
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs (Swagger): http://localhost:8000/docs
   - API Docs (ReDoc): http://localhost:8000/redoc

5. **Stop services**
   ```bash
   docker-compose down
   ```

## Local Development (Without Docker)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt

# Set environment variable
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/inventory_db

uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/products` | Create a product |
| GET | `/products` | List all products |
| GET | `/products/{id}` | Get product by ID |
| PUT | `/products/{id}` | Update a product |
| DELETE | `/products/{id}` | Delete a product |

### Customers
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/customers` | Create a customer |
| GET | `/customers` | List all customers |
| GET | `/customers/{id}` | Get customer by ID |
| DELETE | `/customers/{id}` | Delete a customer |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/orders` | Create an order |
| GET | `/orders` | List all orders |
| GET | `/orders/{id}` | Get order by ID |
| DELETE | `/orders/{id}` | Cancel/delete an order |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard` | Get summary statistics |

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |

## Docker Hub

```bash
# Build and push backend image
docker build -t <your-dockerhub-username>/inventory-backend:latest ./backend
docker push <your-dockerhub-username>/inventory-backend:latest
```

## Deployment

### Backend (Render)
1. Create a new **Web Service** on [Render](https://render.com)
2. Connect your GitHub repository
3. Set root directory to `backend/`
4. Select **Docker** as the runtime
5. Create a **PostgreSQL** database on Render
6. Add environment variables:
   - `DATABASE_URL` — from Render PostgreSQL
   - `CORS_ORIGINS` — your Vercel frontend URL

### Frontend (Vercel)
1. Import your repository on [Vercel](https://vercel.com)
2. Set root directory to `frontend/`
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Add environment variable:
   - `VITE_API_URL` — your Render backend URL

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI entry point
│   │   ├── config.py        # Environment configuration
│   │   ├── database.py      # SQLAlchemy setup
│   │   ├── models.py        # ORM models
│   │   ├── schemas.py       # Pydantic schemas
│   │   ├── crud.py          # Database operations
│   │   └── routers/         # API route handlers
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── api/             # API client
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── App.jsx          # Router setup
│   │   └── index.css        # Design system
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml
├── .env.example
└── README.md
```

## License

MIT
