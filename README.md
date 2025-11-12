# Restaurant Reservation Bot

A chatbot for managing restaurant reservations.

## Overview

Allows users to:

* Create, modify, and cancel reservations
* Check available time slots
* Maintain multiple sessions

Built with **TypeScript**, **Node.js**, **Express**, and **PostgreSQL** following clean architecture principles.

## Tech Stack

* Node.js, TypeScript, Express
* PostgreSQL, Sequelize ORM
* Patterns: State Machine, Strategy, Service Layer

## Quick Start

```bash
npm ci
cp .env.example .env
npm run db:create
npm run db:migrate
npm run db:seed
npm run server
npm run cli
```

**.env**

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/restaurant_bot"
```

## Features

* Guided conversation flow
* Real-time slot availability
* Reservation modification and cancellation
* Input validation and error handling
* Supports concurrent sessions
