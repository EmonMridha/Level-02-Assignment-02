# DevPulse API

A collaborative backend platform for software teams to report bugs, request features, and manage issue workflows.

## Live URL

https://assignment-02-swart.vercel.app/

## GitHub Repository

https://github.com/EmonMridha/Level-02-Assignment-02

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


## API Endpoints
/api/auth/signup
/api/auth/login
/api/issues
/api/issues?sort=newest
/api/issues/:id

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


