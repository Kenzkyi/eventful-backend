# Eventful Backend API

A production-grade ticketing platform backend built with NestJS, PostgreSQL, and Redis.

## Features

- Authentication & Authorization (JWT + Role-based)
- Event Management
- Ticket Purchasing & QR Code Generation
- Paystack Payment Integration
- Email Reminders via Gmail OAuth2
- Real-time Notifications
- Analytics Dashboard
- Redis Caching
- Rate Limiting
- Swagger API Documentation

## Tech Stack

- NestJS (TypeScript)
- PostgreSQL + TypeORM
- Redis (Cache Layer)
- Paystack (Payments)
- Gmail API (Email)
- Jest (Testing)
- Swagger (API Docs)

## Getting Started

### Prerequisites

- Node.js v18+
- PostgreSQL
- Redis

### Installation

```bash
git clone <repo-url>
cd eventful-backend
npm install
cp .env.example .env
# Fill in your .env values
```

### Database Setup

```bash
npm run migration:run
```

### Running the App

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

### Testing

```bash
# Unit tests
npm run test

# Integration tests
npm run test -- --testPathPattern=integration
```

### API Documentation

Visit `http://localhost:3000/api/docs` after starting the app.

## API Modules

- `POST /auth/register` — Register a new user
- `POST /auth/login` — Login
- `GET /events` — Get all events
- `POST /events` — Create an event (creator only)
- `POST /tickets/purchase/:eventId` — Purchase a ticket
- `POST /payments/initialize/:ticketId` — Initialize payment
- `POST /payments/webhook` — Paystack webhook
- `GET /analytics/overview` — Creator analytics
- `GET /analytics/events/:eventId` — Event analytics
