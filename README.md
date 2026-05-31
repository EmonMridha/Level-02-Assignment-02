# DevPulse API

A collaborative backend platform for software teams to report bugs, request features, and manage issue workflows.

## Live URL

https://your-live-link.com

## GitHub Repository

https://github.com/yourusername/devpulse

---

## Features

* User registration & login with JWT authentication
* Role-based authorization (Contributor & Maintainer)
* Create, update, view, and delete issues
* Issue filtering & sorting
* Secure password hashing using bcrypt
* PostgreSQL database with raw SQL queries
* Centralized error handling
* Environment variable & CORS configuration

---

## Tech Stack

* Node.js
* TypeScript
* Express.js
* PostgreSQL
* bcryptjs
* jsonwebtoken

---

## Project Setup

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/devpulse.git
cd devpulse
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file:

```env
PORT=5000
DATABASE_URL=your_database_url
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173
```

### 4. Run Project

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm run build
npm start
```

---

## API Endpoints

### Authentication

* `POST /api/auth/signup`
* `POST /api/auth/login`

### Issues

* `POST /api/issues`
* `GET /api/issues`
* `GET /api/issues/:id`
* `PATCH /api/issues/:id`
* `DELETE /api/issues/:id`

---

## Database Schema

### Users Table

* id
* name
* email
* password
* role
* created_at
* updated_at

### Issues Table

* id
* title
* description
* type
* status
* reporter_id
* created_at
* updated_at

---

## Author

Developed as part of the DevPulse Backend Assignment.
