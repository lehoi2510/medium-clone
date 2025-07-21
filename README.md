# Medium Clone API

A clone of Medium's backend API built with NestJS, Prisma, and MySQL. This project provides a robust foundation for a content publishing platform with user authentication, article management, and more.

## 📋 Features

- **User Authentication**: JWT-based authentication with signup and login
- **User Management**: User profiles with bio and image support
- **Article System**: Create, read, update, and delete articles
- **Database**: MySQL with Prisma ORM
- **Type Safety**: Full TypeScript support
- **Validation**: Request validation with class-validator
- **Security**: Password hashing with bcrypt

## 🛠️ Tech Stack

| Technology          | Purpose                   |
| ------------------- | ------------------------- |
| **NestJS**          | Backend framework         |
| **Prisma**          | Database ORM              |
| **MySQL**           | Database                  |
| **JWT**             | Authentication            |
| **Passport**        | Authentication middleware |
| **bcrypt**          | Password hashing          |
| **TypeScript**      | Programming language      |
| **class-validator** | Request validation        |

## 🚀 Quick Start

### Prerequisites

- **Node.js** v16.0.0 or higher
- **MySQL** v8.0 or higher
- **npm** or **yarn**

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/lehoi2510/medium-clone.git
   cd medium-clone
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Configuration**

   Create a `.env` file in the root directory:

   ```env
   # Database Configuration
   DATABASE_URL="mysql://username:password@localhost:3306/medium_clone"

   # JWT Configuration
   JWT_SECRET="your-super-secret-jwt-key-change-in-production"

   # Application Configuration
   PORT=3000
   NODE_ENV=development
   ```

4. **Database Setup**

   ```bash
   # Generate Prisma client
   npx prisma generate

   # Run database migrations
   npx prisma migrate dev

   # (Optional) Seed the database
   npx prisma db seed
   ```

## 🏃‍♂️ Running the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run start:prod

# Debug mode
npm run start:debug

# Build the application
npm run build
```

The API server will start at `http://localhost:3000`

## 📊 Database Schema

### 👤 User Model

```prisma
model User {
  id        Int      @id @default(autoincrement())
  username  String   @unique
  email     String   @unique
  password  String
  bio       String?
  image     String?
  articles  Article[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### 📄 Article Model

```prisma
model Article {
  id          Int      @id @default(autoincrement())
  title       String
  description String
  body        String   @db.Text
  authorId    Int
  author      User     @relation(fields: [authorId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## 📝 API Documentation

### 🔐 Authentication Endpoints

| Method | Endpoint       | Description       | Auth Required |
| ------ | -------------- | ----------------- | ------------- |
| POST   | `/auth/signup` | User registration | ❌            |
| POST   | `/auth/login`  | User login        | ❌            |

### 👤 User Endpoints

| Method | Endpoint | Description              | Auth Required |
| ------ | -------- | ------------------------ | ------------- |
| GET    | `/user`  | Get current user profile | ✅            |
| PUT    | `/user`  | Update user profile      | ✅            |

### 📋 Request/Response Examples

#### User Signup

```bash
POST /auth/signup
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### User Login

```bash
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

#### Get Current User (Protected)

```bash
GET /user
Authorization: Bearer <access_token>
```

**Response:**

```json
{
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "bio": "Software developer passionate about writing",
    "image": "https://example.com/avatar.jpg"
  }
}
```

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run end-to-end tests
npm run test:e2e

# Generate test coverage report
npm run test:cov
```

## 📦 Available Scripts

| Script                | Description                               |
| --------------------- | ----------------------------------------- |
| `npm run start`       | Start the application                     |
| `npm run start:dev`   | Start in development mode with hot reload |
| `npm run start:prod`  | Start in production mode                  |
| `npm run start:debug` | Start in debug mode                       |
| `npm run build`       | Build the application for production      |
| `npm run lint`        | Run ESLint for code quality               |
| `npm run format`      | Format code with Prettier                 |

## 🔧 Development

### Adding New Features

1. **Generate a new module:**

   ```bash
   nest g module feature-name
   nest g controller feature-name
   nest g service feature-name
   ```

2. **Add new database model:**
   - Edit `prisma/schema.prisma`
   - Run `npx prisma migrate dev --name add-feature-name`
   - Run `npx prisma generate`

### Environment Variables

| Variable       | Description               | Default     |
| -------------- | ------------------------- | ----------- |
| `DATABASE_URL` | MySQL connection string   | Required    |
| `JWT_SECRET`   | Secret key for JWT tokens | Required    |
| `PORT`         | Application port          | 3000        |
| `NODE_ENV`     | Environment mode          | development |

## 🚀 Deployment

### Using Docker (Recommended)

```dockerfile
# Create Dockerfile in project root
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
```

### Manual Deployment

1. Build the application: `npm run build`
2. Set environment variables
3. Run database migrations: `npx prisma migrate deploy`
4. Start the application: `npm run start:prod`

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Add tests** for your changes
5. **Commit your changes**
   ```bash
   git commit -m 'feat: add amazing feature'
   ```
6. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Code Style

- Use TypeScript
- Follow NestJS conventions
- Add JSDoc comments for public methods
- Write tests for new features
- Use meaningful commit messages

## 📄 License

This project is licensed under the **UNLICENSED** License - see the LICENSE file for details.

## 👨‍💻 Author

**LeHoi** - [lehoi2510](https://github.com/lehoi2510)

## 🙏 Acknowledgments

- [NestJS](https://nestjs.com/) for the amazing framework
- [Prisma](https://prisma.io/) for the excellent ORM
- [Medium](https://medium.com/) for the inspiration
