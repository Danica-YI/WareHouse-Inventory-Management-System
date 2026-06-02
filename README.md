# WIMS - Warehouse Inventory Management System

A full-stack web application for managing warehouse inventory, built with React.js frontend and Node.js/Express backend, deployed on AWS EC2.

## Tech Stack

- **Frontend**: React.js, Vite, Axios
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas
- **Authentication**: JWT (JSON Web Token)
- **Deployment**: AWS EC2, Nginx, PM2
- **CI/CD**: GitHub Actions (self-hosted runner)
- **Testing**: Mocha, Chai, Sinon

## Features

- User authentication (login/register) with JWT
- Admin and Staff role-based access control
- Stock Management (CRUD)
- Supplier Management (CRUD)
- Purchase Order Management (CRUD)
- Stock Movement tracking (inbound/outbound)
- Stock Adjustment records
- Low stock alert management

## Project Structure
```
IFN636-A1.2/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── tests/
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── context/
│   │   ├── pages/
│   │   └── service/
│   └── index.html
└── .github/
    └── workflows/
        └── ci.yml
```

## Getting Started

### Prerequisites
- Node.js v20+
- npm
- MongoDB Atlas account

### Local Development

1. Clone the repository:

git clone https://github.com/Danica-YI/IFN636-A1.2.git


2. Install backend dependencies:

cd backend
npm install


3. Create `.env` file in backend:

MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
PORT=5001


4. Start backend:

npm start


5. Install frontend dependencies:

cd frontend
npm install


6. Start frontend:

npm run dev


### Running Tests

cd backend
npm test


## Deployment (AWS EC2)

- Backend runs on PM2 (port 5001)
- Frontend served via PM2 (port 3000)
- Nginx reverse proxy on port 80
- CI/CD automated via GitHub Actions self-hosted runner

## Live Demo

- **Live URL**: https://ware-house-inventory-management-sys.vercel.app
- **Backend**: Hosted on Render
- **Previously deployed on AWS EC2** (Nginx + PM2 + GitHub Actions CI/CD)
- <img width="1253" height="684" alt="ec2" src="https://github.com/user-attachments/assets/fa26f56d-6ba1-4559-b11e-def27fa39a1e" />


## Test Account

| Role  |       Email         | Password |
|-------|---------------------|----------|
| Admin | admin1@gmail.com | 123      |
| Staff | staff1@gmail.com    | 123      |
