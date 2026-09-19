# GoalForge – Personal Goal & Execution Mastery Platform

GoalForge is an enterprise-grade personal goal achievement, milestone tracking, and habit mastery web application engineered with **React 18 + Vite** on the frontend, **Java 17 + Spring Boot 3 (Spring Security 6, JWT)** on the backend, and powered by **PostgreSQL** (with **Supabase** cloud readiness & containerized orchestration via **Docker & Docker Compose**).

---

## Table of Contents
1. [Project Structure](#1-project-structure)
2. [Setup Instructions](#2-setup-instructions)
3. [Database Schema](#3-database-schema)
4. [API Documentation](#4-api-documentation)
5. [Environment Variable Instructions](#5-environment-variable-instructions)
6. [How to Run Frontend](#6-how-to-run-frontend)
7. [How to Run Backend](#7-how-to-run-backend)
8. [Testing Instructions](#8-testing-instructions)
9. [Deployment Instructions](#9-deployment-instructions)
10. [Capstone Project Features Summary](#10-capstone-project-features-summary)

---

## 1. Project Structure

```
GoalForge/
├── .env.example                               # Root environment configuration template
├── docker-compose.yml                         # Multi-container orchestration (PostgreSQL, Backend, Frontend)
├── README.md                                  # Capstone project documentation
│
├── frontend/                                  # React 18 + Vite Client Application
│   ├── Dockerfile                             # Multi-stage production build (Node 20 Alpine + Nginx Alpine)
│   ├── nginx.conf                             # Production web server config (gzip, SPA fallback, /api reverse proxy)
│   ├── .env.example                           # Frontend client environment variables
│   ├── index.html                             # Single Page Application HTML root
│   ├── package.json                           # NPM dependencies & scripts
│   ├── vite.config.js                         # Vite dev proxy configuration & bundler plugins
│   └── src/
│       ├── main.jsx                           # Application bootstrap and React DOM mount
│       ├── App.jsx                            # Route registry & ProtectedRoute wrapper
│       ├── index.css                          # Modern design system (Glassmorphism, dark palette, CSS tokens)
│       ├── assets/                            # SVG logos, branding graphics, and badges
│       ├── components/                        # Reusable UI component library
│       │   ├── Navbar.jsx                     # Top navigation bar with streak pill & profile menu
│       │   ├── Sidebar.jsx                    # Collapsible responsive navigation drawer
│       │   ├── GoalCard.jsx                   # Goal progress card with visual completion meters
│       │   ├── PhaseTimeline.jsx              # Interactive milestone phase timeline
│       │   ├── PhaseTaskList.jsx              # Sub-task execution checklist with inline status toggles
│       │   ├── Skeleton.jsx                   # Modern shimmer skeleton loaders (9 UI variations)
│       │   ├── EmptyState.jsx                 # Dynamic zero-data illustrations & action triggers
│       │   ├── ConfirmModal.jsx               # Reusable confirmation dialogue for destructive operations
│       │   ├── ErrorState.jsx                 # Resilient fallback error boundaries & recovery actions
│       │   ├── NotificationBell.jsx           # Real-time alert tray with unread indicators
│       │   ├── StatusBadge.jsx                # High-contrast categorical badges (Priority & Status)
│       │   └── charts/                        # Interactive analytical visualizations
│       │       ├── GoalCompletionChart.jsx    # Donut breakdown (Completed vs In Progress vs Not Started)
│       │       ├── TaskCompletionBarChart.jsx # Weekly task completion rate histogram
│       │       ├── ActivityHeatmap.jsx        # 30-day GitHub-style habit contribution grid
│       │       └── WeeklyProgressLineChart.jsx# 7-day momentum velocity line chart
│       ├── context/                           # React State Contexts
│       │   ├── AuthContext.jsx                # JWT authentication, user session persistence, & logout
│       │   └── ThemeContext.jsx               # Dark/Light theme mode provider
│       ├── hooks/                             # Custom React hooks
│       │   ├── useGoals.js                    # Goal data fetching, filtering, and caching
│       │   ├── usePhases.js                   # Phase lifecycle orchestration
│       │   └── useTasks.js                    # Task execution and status cascading
│       ├── layouts/                           # Layout wrappers
│       │   ├── MainLayout.jsx                 # Authenticated shell layout (Sidebar + Header + Content)
│       │   └── AuthLayout.jsx                 # Clean minimalist authentication wrapper
│       ├── pages/                             # High-fidelity views
│       │   ├── Dashboard.jsx                  # Master command center (Dynamic KPIs, streak counter, charts)
│       │   ├── GoalsPage.jsx                  # Goal catalog with category filters, sort, and creation modals
│       │   ├── GoalDetailsPage.jsx            # Deep-dive view with Phase Roadmap & Task checklists
│       │   ├── CalendarPage.jsx               # Interactive calendar aggregating target deadlines & milestones
│       │   ├── ProgressPage.jsx               # Daily reflection log journal with percentage entries
│       │   ├── AnalyticsPage.jsx              # Comprehensive performance analytics & completion trends
│       │   ├── AchievementsPage.jsx           # Milestone trophy showcase & automated badge unlocks
│       │   ├── NotificationsPage.jsx          # Notification management hub with filter & mark-all-read
│       │   ├── ProfilePage.jsx                # User account statistics and personal bio management
│       │   ├── SettingsPage.jsx               # Preferences, security options, and password resets
│       │   ├── LoginPage.jsx                  # Secure login portal with form validation & demo login
│       │   ├── RegisterPage.jsx               # Account creation with live password strength meters
│       │   ├── NotFoundPage.jsx               # Custom 404 error page with route recovery
│       │   └── DesignSystemShowcase.jsx       # Component showroom for colors, buttons, and badges
│       ├── services/                          # Axios API clients
│       │   ├── api.js                         # Centralized Axios instance with JWT interceptors
│       │   ├── authService.js                 # Register, Login, Me, and Logout endpoints
│       │   ├── goalService.js                 # CRUD for user goals
│       │   ├── phaseService.js                # CRUD for goal phases & ordering
│       │   ├── taskService.js                 # CRUD for tasks & completion status toggles
│       │   ├── progressService.js             # Statistics, streak calculations, and reflection logs
│       │   ├── achievementService.js          # Gamification badge evaluations & unlock records
│       │   ├── calendarService.js             # Date-based event aggregation
│       │   ├── notificationService.js         # Alerts and notification dismissals
│       │   └── userService.js                 # Profile management and password updates
│       └── utils/                             # Utility helpers
│           ├── dateUtils.js                   # Timezone-safe date formatters and relative calculations
│           └── validators.js                  # Client-side input validation expressions
│
└── backend/                                   # Java 17 + Spring Boot 3 REST API
    ├── Dockerfile                             # Multi-stage container build (Maven + Eclipse Temurin 17 JRE)
    ├── .env.example                           # Backend environment variables template
    ├── pom.xml                                # Maven build descriptors and dependencies
    └── src/
        ├── main/
        │   ├── java/com/goalforge/
        │   │   ├── GoalForgeApplication.java  # Spring Boot main runner with clean DB demo toggle
        │   │   ├── controller/                # REST Controllers
        │   │   │   ├── AuthController.java    # /api/auth (register, login, me)
        │   │   │   ├── GoalController.java    # /api/goals (CRUD, filtering, search)
        │   │   │   ├── GoalPhaseController.java # /api/goals/{id}/phases (Milestone roadmap)
        │   │   │   ├── TaskController.java    # /api/phases/{id}/tasks, /api/tasks/{id} (Tasks & toggles)
        │   │   │   ├── ProgressController.java# /api/progress (stats, logs, reflection CRUD)
        │   │   │   ├── AchievementController.java # /api/achievements (badge checks & summary)
        │   │   │   ├── CalendarController.java# /api/calendar (aggregated date events)
        │   │   │   ├── NotificationController.java # /api/notifications (alerts, read markers)
        │   │   │   ├── UserController.java    # /api/users (profile & password management)
        │   │   │   └── HealthController.java  # /api/health (DB connectivity & system status)
        │   │   ├── dto/                       # Request/Response Data Transfer Objects
        │   │   │   ├── ApiResponse.java       # Standardized JSON response envelope
        │   │   │   ├── AuthResponse.java      # JWT bearer token & authenticated user payload
        │   │   │   ├── LoginRequest.java      # Credentials payload with validation annotations
        │   │   │   ├── RegisterRequest.java   # Registration payload with email & password criteria
        │   │   │   ├── GoalDto.java           # Goal transfer object
        │   │   │   ├── GoalPhaseDto.java      # Phase roadmap transfer object
        │   │   │   ├── TaskDto.java           # Actionable task transfer object
        │   │   │   ├── DailyProgressDto.java  # Reflection log transfer object
        │   │   │   ├── ProgressStatisticsDto.java # Aggregated KPIs, charts, and streaks
        │   │   │   ├── AchievementDto.java    # Gamification achievement details
        │   │   │   ├── AchievementSummaryDto.java # Achievement summary statistics
        │   │   │   ├── CalendarEventDto.java  # Aggregated calendar timeline event
        │   │   │   ├── NotificationDto.java   # System notification item
        │   │   │   ├── UserProfileDto.java    # Public profile transfer object
        │   │   │   └── ChangePasswordRequest.java # Password change payload
        │   │   ├── entity/                    # JPA Hibernate Entities
        │   │   │   ├── User.java              # User credentials and bio table
        │   │   │   ├── Goal.java              # Goal entity with cascade relationships
        │   │   │   ├── GoalPhase.java         # Milestone phase entity
        │   │   │   ├── Task.java              # Execution task entity
        │   │   │   ├── DailyProgress.java     # User reflection progress logs
        │   │   │   ├── Achievement.java       # Unlocked achievement records
        │   │   │   └── Notification.java      # Notification and alert records
        │   │   ├── exception/                 # Centralized Exception Handling
        │   │   │   ├── GlobalExceptionHandler.java # @RestControllerAdvice returning RFC 7807 compliant errors
        │   │   │   ├── ResourceNotFoundException.java # HTTP 404 handler
        │   │   │   ├── EmailAlreadyExistsException.java # HTTP 409 conflict handler
        │   │   │   └── UnauthorizedException.java # HTTP 401 & 403 authorization handlers
        │   │   ├── repository/                # Spring Data JPA Repositories
        │   │   │   ├── UserRepository.java
        │   │   │   ├── GoalRepository.java
        │   │   │   ├── GoalPhaseRepository.java
        │   │   │   ├── TaskRepository.java
        │   │   │   ├── DailyProgressRepository.java
        │   │   │   ├── AchievementRepository.java
        │   │   │   └── NotificationRepository.java
        │   │   ├── security/                  # Spring Security 6 Architecture
        │   │   │   ├── SecurityConfig.java    # Stateless session filter chain & CORS config
        │   │   │   ├── JwtTokenProvider.java  # HMAC-SHA256 token creation, parsing, & validation
        │   │   │   ├── JwtAuthenticationFilter.java # Per-request Bearer token extraction
        │   │   │   └── CustomUserDetailsService.java # Database user authentication provider
        │   │   └── service/                   # Core Business Logic Layer
        │   │       ├── UserService.java       # Account and profile management
        │   │       ├── GoalService.java       # Goal management & multi-tenant security
        │   │       ├── GoalPhaseService.java  # Phase roadmap calculations & goal cascades
        │   │       ├── TaskService.java       # Task tracking, status toggles, & cascading progress
        │   │       ├── DailyProgressService.java # Streak engine & analytics aggregation
        │   │       ├── AchievementService.java# Dynamic milestone achievement evaluation
        │   │       ├── CalendarService.java   # Calendar timeline aggregation
        │   │       └── NotificationService.java # Contextual notification generator
        │   └── resources/
        │       ├── application.properties     # Production-ready configuration with environment variables
        │       └── application-supabase.properties.example
        └── test/                              # Automated Unit and Integration Test Suite
            └── java/com/goalforge/
                ├── GoalForgeApplicationTests.java # Context loading test
                ├── controller/
                │   ├── AuthControllerTest.java    # Authentication & JWT security tests
                │   ├── GoalControllerTest.java    # Goal CRUD & multi-tenant isolation tests
                │   ├── GoalPhaseControllerTest.java # Phase management tests
                │   ├── TaskControllerTest.java    # Cascading progress engine & task security tests
                │   ├── NotificationControllerTest.java # Notification feed tests
                │   ├── ProgressControllerTest.java # Analytics calculation tests
                │   └── UserControllerTest.java    # User profile tests
                └── security/
                    └── JwtTokenProviderTest.java  # JWT generation & validation tests
```

---

## 2. Setup Instructions

### Prerequisites
- **Node.js**: `v18.0.0` or higher (Node 20 LTS recommended)
- **Java Development Kit (JDK)**: `17` or higher
- **Apache Maven**: `3.8+` (or use `./mvnw` wrapper if installed)
- **Database**: PostgreSQL `14+` (local or cloud via Supabase) or in-memory H2 (default fallback)
- **Docker & Docker Compose**: Optional, for containerized execution

### Quick Clone & Directory Setup
```bash
git clone <repository-url>
cd "Personal Goal"
```

---

## 3. Database Schema

GoalForge uses a relational schema with multi-tenant foreign keys, strict cascade rules, and automated timestamp tracking.

```
       +------------------+
       |      users       |
       +------------------+
       | id (PK)          |
       | email (UQ)       |
       | password_hash    |
       | full_name        |
       | bio, avatar_url  |
       +--------+---------+
                |
     +----------+----------+-------------------+--------------------+
     | 1:N                 | 1:N               | 1:N                | 1:N
+----+----+           +----+-----+       +-----+------+      +------+------+
|  goals  |           |  daily   |       |achieve-    |      |notifi-      |
|         |           | progress |       |  ments     |      | cations     |
+----+----+           +----------+       +------------+      +-------------+
     | 1:N
+----+--------+
| goal_phases |
+----+--------+
     | 1:N
+----+----+
|  tasks  |
+---------+
```

### PostgreSQL DDL Schema Script

```sql
-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    bio VARCHAR(500),
    avatar_url VARCHAR(255),
    role VARCHAR(50) DEFAULT 'ROLE_USER',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Goals Table
CREATE TABLE IF NOT EXISTS goals (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(150) NOT NULL,
    description VARCHAR(1000),
    category VARCHAR(50) NOT NULL DEFAULT 'Career',
    priority VARCHAR(20) NOT NULL DEFAULT 'Medium',
    status VARCHAR(30) NOT NULL DEFAULT 'Not Started',
    progress INTEGER NOT NULL DEFAULT 0,
    start_date DATE,
    target_date DATE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_goals_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Goal Phases Table (Milestones)
CREATE TABLE IF NOT EXISTS goal_phases (
    id BIGSERIAL PRIMARY KEY,
    goal_id BIGINT NOT NULL,
    phase_name VARCHAR(150) NOT NULL,
    description VARCHAR(1000),
    phase_order INTEGER NOT NULL DEFAULT 1,
    status VARCHAR(30) NOT NULL DEFAULT 'Not Started',
    progress_percentage INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_phases_goal FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE
);

-- 4. Tasks Table (Actionable execution items)
CREATE TABLE IF NOT EXISTS tasks (
    id BIGSERIAL PRIMARY KEY,
    phase_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description VARCHAR(1000),
    due_date DATE,
    priority VARCHAR(20) NOT NULL DEFAULT 'Medium',
    status VARCHAR(30) NOT NULL DEFAULT 'Pending',
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tasks_phase FOREIGN KEY (phase_id) REFERENCES goal_phases(id) ON DELETE CASCADE
);

-- 5. Daily Progress Logs (Habit journaling & reflections)
CREATE TABLE IF NOT EXISTS daily_progress (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    goal_id BIGINT,
    progress_date DATE NOT NULL,
    progress_percentage INTEGER NOT NULL DEFAULT 0,
    notes VARCHAR(1000),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_daily_progress_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_daily_progress_goal FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE SET NULL
);

-- 6. Achievements Table (Gamification badges)
CREATE TABLE IF NOT EXISTS achievements (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(150) NOT NULL,
    description VARCHAR(255) NOT NULL,
    achievement_type VARCHAR(50) NOT NULL,
    unlocked_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_achievements_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uq_user_achievement UNIQUE (user_id, achievement_type)
);

-- 7. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    message VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'SYSTEM',
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for high-performance multi-tenant querying
CREATE INDEX IF NOT EXISTS idx_goals_user ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_phases_goal ON goal_phases(goal_id);
CREATE INDEX IF NOT EXISTS idx_tasks_phase ON tasks(phase_id);
CREATE INDEX IF NOT EXISTS idx_daily_progress_user ON daily_progress(user_id, progress_date);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
```

---

## 4. API Documentation

All protected endpoints require the HTTP Authorization header:
```http
Authorization: Bearer <JWT_TOKEN>
```

All responses follow the unified envelope:
```json
{
  "success": true,
  "message": "Operation description",
  "data": { ... }
}
```

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new account (`fullName`, `email`, `password`) | No |
| `POST` | `/api/auth/login` | Authenticate credentials (`email`, `password`) | No |
| `GET` | `/api/auth/me` | Fetch currently authenticated user session details | **Yes** |

### 🎯 Goals (`/api/goals`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/goals` | List all goals (query params: `?category=`, `?status=`) | **Yes** |
| `POST` | `/api/goals` | Create a new goal | **Yes** |
| `GET` | `/api/goals/{id}` | Get goal details by ID (enforces ownership) | **Yes** |
| `PUT` | `/api/goals/{id}` | Update goal properties | **Yes** |
| `DELETE`| `/api/goals/{id}` | Delete goal and cascade delete all child phases & tasks | **Yes** |

### 🗺️ Goal Phases (`/api/goals/{goalId}/phases`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/goals/{goalId}/phases` | List all phases for a goal ordered by `phaseOrder` | **Yes** |
| `POST` | `/api/goals/{goalId}/phases` | Add an execution phase (`phaseName`, `description`, `phaseOrder`)| **Yes** |
| `GET` | `/api/goals/{goalId}/phases/{id}` | Get phase details | **Yes** |
| `PUT` | `/api/goals/{goalId}/phases/{id}` | Update phase | **Yes** |
| `DELETE`| `/api/goals/{goalId}/phases/{id}`| Delete phase and trigger goal progress recalculation | **Yes** |

### ✅ Tasks (`/api/phases/{phaseId}/tasks` & `/api/tasks/{id}`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/phases/{phaseId}/tasks` | Get tasks (filters: `search`, `status`, `priority`, `sort`) | **Yes** |
| `POST` | `/api/phases/{phaseId}/tasks` | Create task (`title`, `dueDate`, `priority`, `status`) | **Yes** |
| `GET` | `/api/tasks/{id}` | Get task details | **Yes** |
| `PUT` | `/api/tasks/{id}` | Update task details | **Yes** |
| `PATCH`| `/api/tasks/{id}/complete` | Toggle completion (`?completed=true|false`), triggers cascading progress | **Yes** |
| `DELETE`| `/api/tasks/{id}` | Delete task, triggers phase progress recalculation | **Yes** |

### 📈 Progress & Analytics (`/api/progress`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/progress/stats` | Aggregated statistics, streaks, weekly velocity, and heatmaps | **Yes** |
| `GET` | `/api/progress/logs` | List user daily reflection notes | **Yes** |
| `POST` | `/api/progress/logs` | Create daily reflection log | **Yes** |
| `PUT` | `/api/progress/logs/{id}` | Edit reflection log | **Yes** |
| `DELETE`| `/api/progress/logs/{id}`| Remove reflection log | **Yes** |

### 🏆 Achievements (`/api/achievements`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/achievements` | Retrieve unlocked & locked badges with unlock progress | **Yes** |
| `POST` | `/api/achievements/check` | Trigger automated condition evaluation and unlock new badges | **Yes** |
| `GET` | `/api/achievements/{id}` | Get specific achievement details | **Yes** |

### 📅 Calendar (`/api/calendar`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/calendar/events` | Aggregated feed of goal target dates and task due dates | **Yes** |

### 🔔 Notifications (`/api/notifications`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/notifications` | Get user notifications feed | **Yes** |
| `GET` | `/api/notifications/unread-count` | Get unread badge count | **Yes** |
| `PATCH`| `/api/notifications/{id}/read` | Mark individual notification as read | **Yes** |
| `PUT` | `/api/notifications/read-all` | Mark all notifications as read | **Yes** |
| `DELETE`| `/api/notifications/{id}` | Delete notification | **Yes** |
| `DELETE`| `/api/notifications` | Clear all notifications | **Yes** |

### 👤 Profile & System Health
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/health` | Public uptime & database status check | No |
| `GET` | `/api/users/profile` | Retrieve comprehensive user profile and account KPIs | **Yes** |
| `PUT` | `/api/users/profile` | Update display name and biography | **Yes** |
| `POST` | `/api/users/change-password` | Update account password with old password verification | **Yes** |

---

## 5. Environment Variable Instructions

GoalForge reads standard environment variables with sensible production defaults.

### Backend (`backend/.env` or OS Environment Variables)
| Variable | Required | Default Value | Description |
|---|---|---|---|
| `DATABASE_URL` | Optional | `jdbc:h2:mem:goalforgedb` | JDBC connection URL (PostgreSQL or H2) |
| `DATABASE_USERNAME` | Optional | `sa` (H2) or `postgres` | Database username |
| `DATABASE_PASSWORD` | Optional | `""` | Database user password |
| `JWT_SECRET` | Recommended | `GoalForgeSuperSecretKeyThatIsAtLeast256BitsLongForHMACSHA256Security!` | Secret key used to sign and verify JWT tokens |
| `PORT` | Optional | `8080` | Spring Boot HTTP listening port |
| `CORS_ALLOWED_ORIGINS` | Optional | `http://localhost:5173,http://localhost:3000` | Allowed origins for Cross-Origin Resource Sharing |
| `DEMO_DATA_ENABLED` | Optional | `false` | When `false`, boots with 100% clean, empty database |

#### Supabase Integration Example
```env
DATABASE_URL=jdbc:postgresql://db.<PROJECT_REF>.supabase.co:5432/postgres?sslmode=require
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=<YOUR_SUPABASE_PASSWORD>
JWT_SECRET=super_secure_custom_production_jwt_secret_key_minimum_32_characters
DEMO_DATA_ENABLED=false
```

### Frontend (`frontend/.env` or OS Environment Variables)
| Variable | Required | Default Value | Description |
|---|---|---|---|
| `VITE_API_URL` | Optional | `/api` | Base URL pointing to the Spring Boot REST API |
| `VITE_API_BASE_URL` | Optional | `/api` | Fallback alias for the REST API base URL |

---

## 6. How to Run Frontend

### Local Development Server
```bash
cd frontend
npm install
npm run dev
```
- The frontend will start at: `http://localhost:5173`
- Development API requests to `/api/*` are automatically proxied to `http://localhost:8080` via `vite.config.js`.

### Production Build & Preview
```bash
cd frontend
npm run build
npm run preview
```
- Builds the optimized production assets into `frontend/dist/`.

---

## 7. How to Run Backend

### Running with Maven
```bash
cd backend
mvn spring-boot:run
```
- The backend server will start at: `http://localhost:8080`.
- Swagger / Health check is available at: `http://localhost:8080/api/health`.

### Running with External PostgreSQL / Supabase
```powershell
# PowerShell
$env:DATABASE_URL="jdbc:postgresql://localhost:5432/goalforgedb"
$env:DATABASE_USERNAME="postgres"
$env:DATABASE_PASSWORD="secretpassword"
$env:DEMO_DATA_ENABLED="false"
mvn spring-boot:run
```

```bash
# Linux / macOS Bash
DATABASE_URL="jdbc:postgresql://localhost:5432/goalforgedb" \
DATABASE_USERNAME="postgres" \
DATABASE_PASSWORD="secretpassword" \
DEMO_DATA_ENABLED="false" \
mvn spring-boot:run
```

---

## 8. Testing Instructions

### Running Backend Unit & Integration Tests
```bash
cd backend
mvn test
```
- Runs 33 automated test assertions covering Spring Security, JWT filters, cascades, and controller validations with **0 failures and 0 errors**.

### Running the End-to-End (E2E) Lifecycle Script
A complete automated end-to-end integration test is provided in PowerShell to validate the full 14-stage user lifecycle and security perimeter:

```powershell
powershell -ExecutionPolicy Bypass -File "scratch/test_e2e_lifecycle.ps1"
```

The script executes and validates:
1. User Registration (`POST /api/auth/register`)
2. User Login & Token issuance (`POST /api/auth/login`)
3. Authenticated Profile & Clean Database verification (`GET /api/auth/me`, `GET /api/goals`)
4. Goal Creation (`POST /api/goals`)
5. Milestone Phases Creation (`POST /api/goals/{id}/phases`)
6. Task Creation (`POST /api/phases/{id}/tasks`)
7. Task Completion & Phase Cascading Progress to 50% (`PATCH /api/tasks/{id}/complete`)
8. All Phase Tasks Completion to 100% and Status change to Completed
9. Goal Overall Progress automatic update to 50% (1 of 2 phases complete)
10. Milestone Achievement unlock evaluation (`POST /api/achievements/check`)
11. Dashboard KPI & statistics reflection (`GET /api/progress/stats`)
12. Calendar aggregation of target dates and milestones (`GET /api/calendar/events`)
13. Notification delivery and read receipt (`GET /api/notifications`, `PATCH /api/notifications/{id}/read`)
14. Multi-Tenant Security & Isolation (Attacker User B blocked with `403 Forbidden` when attempting to access User A's goal or mutate User A's task)
15. Unauthenticated Access Denial (`401 Unauthorized` without JWT)

---

## 9. Deployment Instructions

### Option 1: Docker Compose (Single Command Full-Stack Deployment)
GoalForge includes a root `docker-compose.yml` orchestrating PostgreSQL 15, the Spring Boot backend, and Nginx-powered React frontend with health checks:

```bash
# Set your environment variables in .env (or use defaults)
docker-compose up --build -d
```

Services started:
- **Frontend**: `http://localhost:3000` (Nginx reverse proxying `/api` to backend)
- **Backend API**: `http://localhost:8080`
- **PostgreSQL Database**: `localhost:5432`

To shut down:
```bash
docker-compose down -v
```

### Option 2: Standalone Docker Containers

#### 1. Build and Run Backend Container
```bash
cd backend
docker build -t goalforge-backend .
docker run -d -p 8080:8080 \
  -e DATABASE_URL="jdbc:postgresql://<HOST>:5432/postgres?sslmode=require" \
  -e DATABASE_USERNAME="<USER>" \
  -e DATABASE_PASSWORD="<PASS>" \
  -e JWT_SECRET="<YOUR_SECRET>" \
  --name goalforge-api goalforge-backend
```

#### 2. Build and Run Frontend Container
```bash
cd frontend
docker build -t goalforge-frontend .
docker run -d -p 80:80 \
  -e VITE_API_URL="http://your-backend-host:8080/api" \
  --name goalforge-web goalforge-frontend
```

---

## 10. Capstone Project Features Summary

### Core Platform Capabilities
1. **End-to-End User Lifecycle**:
   - Secure authentication with BCrypt hashing and stateless HMAC-SHA256 JWT tokens.
   - Comprehensive multi-tenant data isolation guaranteeing users only see and modify their own goals, phases, tasks, and progress.
2. **Cascading Progress Calculation Engine**:
   - Marking sub-tasks completed automatically updates the parent phase percentage.
   - Completing all tasks in a phase marks the phase `Completed`.
   - The overall Goal progress is automatically calculated as the weighted average across all constituent execution phases.
3. **Automated Gamification & Milestones**:
   - Real-time achievement evaluation unlocks badges ("First Goal Created", "First Task Completed", "10 Tasks Completed", "7 Day Streak", "First Goal Completed").
4. **Interactive Analytical Visualizations**:
   - Donut charts for goal distribution by status.
   - Weekly bar charts showing completed vs pending task velocity.
   - 30-day GitHub-style habit activity heatmap with 5 shading levels.
   - 7-day progress velocity line chart.
5. **Aggregated Calendar Timeline**:
   - Merges goal target dates and actionable task deadlines into an interactive calendar view with color-coded priority indicators.
6. **Zero Dummy Data Guarantee**:
   - The platform starts with a completely clean database for new users.
   - UI gracefully presents custom-designed empty states with immediate action prompts.
   - Mock/seed data is gated behind an explicit environment flag (`DEMO_DATA_ENABLED=false` by default).
7. **Production Containerization**:
   - Production-ready multi-stage Docker builds for both Java backend and React/Vite frontend.
   - Single-command deployment via Docker Compose with health checks and restart policies.
