# Wakeb Map (خريطة واكب)

An interactive, bilingual (Arabic/English) GIS web application for saving, categorizing, and searching locations on a map. Built as a full-stack monorepo with a Spring Boot backend and a Vue.js + Leaflet frontend.

## Overview

Wakeb Map allows users to search for places, save locations to their personal accounts, organize them by category, and explore them on an interactive satellite map.

The application includes account management features such as registration, email verification, login, password management, and account deletion, along with an admin dashboard for user management.

This project was developed during an Information Systems co-op training program at **Wakeb Data Communications & IT Company**, within the **Command & Control Department**, as part of the cooperative training requirements at **Najran University**.

## Features

- **Authentication & Accounts** — JWT-based authentication, registration, email verification, password change/reset, and account deletion
- **Admin Panel** — dedicated dashboard for viewing, paginating, and managing users
- **Saved Locations** — full CRUD operations with 9 location categories: religious, education, health, food, fuel, shop, office, residential, and generic
- **Hybrid Search** — Foursquare Places API as the primary search provider, with automatic fallback to OpenStreetMap/Nominatim when needed
- **Interactive Map** — Esri satellite imagery with labeled streets and boundaries, powered by Leaflet
- **Bilingual UI** — full Arabic and English support with RTL/LTR handling
- **Custom Theme** — Wakeb-inspired colors and interface styling
- **API Documentation** — interactive Swagger/OpenAPI documentation

## Tech Stack

### Backend

- Java
- Spring Boot
- Spring Security
- MongoDB
- JWT Authentication
- BCrypt Password Hashing
- springdoc-openapi / Swagger UI

### Frontend

- Vue.js
- Leaflet.js
- Vite

## Project Structure

```text
.
├── backend/     # Spring Boot REST API
└── frontend/    # Vue.js + Leaflet client
```

## Getting Started

### Prerequisites

- Java 17+
- Maven
- Node.js
- npm
- MongoDB instance
- Foursquare Places API key

### Backend

```bash
cd backend
mvn spring-boot:run
```

Configure the required environment-specific values before running the application, including the MongoDB connection, JWT secret, and email configuration.

The backend API runs by default at:

```text
http://localhost:8080
```

Swagger UI:

```text
http://localhost:8080/swagger-ui.html
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Configure the required frontend environment variables using the provided `.env.example` file.

## Roadmap

- Docker containerization
- Production deployment

## Author

**Yazeed Ahmad Alhammami**  
Information Systems — Najran University  
Co-op Training — Wakeb Data Communications & IT Company
