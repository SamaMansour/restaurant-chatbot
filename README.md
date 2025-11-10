# Restaurant Reservation Bot

A chatbot for managing restaurant reservations.

## Overview

This project provides a structured chatbot that allows users to manage restaurant reservations through natural conversation.
It follows **Domain-Driven Design (DDD)** and **Clean Architecture** principles to maintain clear separation between domains, use cases, infrastructure, and interfaces.

### Users can:

* Create, modify, and cancel reservations
* Check available time slots
* Maintain multiple sessions concurrently

Built with **TypeScript**, **Node.js**, **Express**, and **PostgreSQL**.

## Tech Stack

* **Backend:** Node.js, TypeScript, Express
* **Database:** PostgreSQL with Sequelize ORM
* **Architecture:** Domain-Driven Design (DDD), Clean Architecture
* **Patterns Used:** State Machine, Strategy, Repository, and Service Layer
* **Optional Frontend:** React + Vite

## Quick Start

```bash
npm ci
cp .env.example .env
npm run db:migrate
npm run db:seed
npm run server
npm run cli
```

### .env Example

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/restaurant_bot"
```

## Features

* Guided conversational flow using a state machine
* Real-time time-slot availability
* Reservation creation, modification, and cancellation
* Robust input validation and error handling
* Supports concurrent user sessions
* Organized domain layers following DDD:
