# TennisCenter

A full-stack web application for managing local tennis tournaments. It enables tournament organization, ranking tracking, match scheduling, and player interaction through a social feed.

---

## Tech Stack

**Backend:** Java 17+, Spring Boot, Spring Security (JWT), JPA/Hibernate, PostgreSQL  
**Frontend:** React 18, TypeScript, Vite, Material UI, styled-components, Framer Motion

---

## Prerequisites

Make sure the following are installed before running the application:

- **Java 17** or newer (JDK)
- **Maven** (or use the included `./mvnw` wrapper)
- **Node.js 18+** and **npm**
- **PostgreSQL 14+**

---

## Database Setup

1. Start your PostgreSQL server.

2. Create the database:

```sql
CREATE DATABASE tenniscenter;
```

3. Configure the connection in `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/tenniscenter
spring.datasource.username=postgres
spring.datasource.password=your_password

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

app.upload.dir=uploads
```

> **Note:** The `spring.jpa.hibernate.ddl-auto=update` property will automatically create and update tables on startup. No manual migration is required.

---

## Running the Backend

From the project root directory:

```bash
# With Maven installed globally
mvn spring-boot:run

# Or using the Maven wrapper
./mvnw spring-boot:run
```

The backend will start on **http://localhost:8080**.

---

## Running the Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will start on **http://localhost:5173**.

---

## Predefined User Accounts

The application does not ship with pre-seeded accounts. After startup, accounts are created as follows:

### Creating a Player Account (PLAYER role)

Go to **http://localhost:5173/register** and fill in the registration form:
- First name, Last name
- Username (must be unique)
- Email (must be unique) — used for login
- Player level (Entry / Starter / Medium / Master / Expert / Stellar)
- Password

### Creating an Admin Account (ADMIN role)

Admin accounts must be created manually in the database. You can either register a normal account through the UI and then update its role, or insert one directly.

**Option A — Promote an existing account:**

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'admin@tenniscenter.com';
```

**Option B — Insert an admin directly** (password must be a BCrypt hash):

```sql
INSERT INTO users (first_name, last_name, username, email, password, role, player_level, ranking_points, wins, losses)
VALUES (
  'Admin',
  'TennisCenter',
  'admin',
  'admin@tenniscenter.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  'ADMIN',
  'STELLAR',
  0, 0, 0
);
```

> **Note:** The BCrypt hash above corresponds to the password `admin123`. To generate a different hash, use an online BCrypt generator or the application's `passwordEncoder.encode("desired_password")` method.

### Recommended Test Accounts

| Role    | Email                      | Password   | How to Create                     |
|---------|----------------------------|------------|-----------------------------------|
| ADMIN   | admin@tenniscenter.com     | admin123   | SQL insert (see above)            |
| PLAYER  | player@tenniscenter.com    | player123  | Registration form                 |

---

## Authentication

- Login is done with **email** and **password** at **http://localhost:5173/login**
- Authentication uses **JWT** (JSON Web Tokens)
- The token is stored in `localStorage` and sent automatically via the `Authorization: Bearer <token>` header

---

## Main Features

- **Social Feed** — posts, likes, user avatars
- **Tournaments** — creation (admin), registration (players), single elimination and round robin + knockout brackets, match scheduling, score entry
- **Leaderboard** — based on automatically computed ranking points (100 pts per win, 25 pts per loss, 1-year expiry)
- **Player Profile** — stats, match history, titles and finals, profile image upload
- **Match Schedule** — upcoming and past matches with auto-scroll to the most recent
- **Head-to-Head (H2H)** — direct comparison between two players
- **Location & Court Management** — administered from the admin panel
- **Animated Background** — WebGL shader using simplex noise

---

## Project Structure

```
TennisCenter/
├── src/main/java/com/TennisCenter/
│   ├── config/          # Security, JWT, CORS, WebConfig
│   ├── controller/      # REST Controllers (Auth, Admin, Player, Feed)
│   ├── dto/             # Request/Response DTOs
│   ├── exception/       # Custom exceptions
│   ├── model/           # JPA Entities (User, Tournament, Match, etc.)
│   ├── repository/      # Spring Data JPA Repositories
│   └── service/         # Business logic, ranking, bracket generation
├── frontend/
│   ├── src/
│   │   ├── api/         # Axios instance & interceptors
│   │   ├── components/  # React components (admin, auth, common, layout)
│   │   ├── context/     # React Context (Toast)
│   │   ├── hooks/       # Custom hooks
│   │   ├── pages/       # Main pages
│   │   ├── styles/      # Global theme, design tokens
│   │   ├── types/       # TypeScript type definitions
│   │   └── utils/       # Utilities (resolveImageUrl, tiebreak, errors)
│   └── package.json
├── pom.xml
└── README.md
```

---

## Main API Endpoints

| Prefix              | Access        | Description                        |
|----------------------|---------------|------------------------------------|
| `/api/auth/**`       | Public        | Register, Login                    |
| `/api/admin/**`      | ADMIN only    | CRUD tournaments, locations, scores|
| `/api/player/**`     | PLAYER, ADMIN | Profile, history, tournament registration |
| `/uploads/**`        | Public        | Uploaded images (avatars)          |
