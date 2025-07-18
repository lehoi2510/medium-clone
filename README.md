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

- **Framework**: NestJS
- **Database**: MySQL with Prisma ORM
- **Authentication**: JWT with Passport
- **Language**: TypeScript
- **Validation**: class-validator & class-transformer
- **Password Hashing**: bcrypt

## 📁 Project Structure

```
src/
├── auth/                 # Authentication module
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.module.ts
│   ├── jwt.strategy.ts
│   └── dto/
│       ├── login.dto.ts
│       └── signup.dto.ts
├── user/                 # User module
│   └── user.entity.ts
├── prisma/              # Prisma configuration
│   ├── prisma.service.ts
│   ├── prisma.module.ts
│   └── seed.ts
├── app.module.ts
└── main.ts
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MySQL database
- npm or yarn

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

3. **Environment setup**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="mysql://username:password@localhost:3306/medium_clone"
   JWT_SECRET="your-secret-key"
   ```

4. **Database setup**
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
```

The API will be available at `http://localhost:3000`

## 📊 Database Schema

### User Model
```prisma
model User {
  id        Int      @id @default(autoincrement())
  username  String   @unique
  email     String   @unique
  password  String
  bio       String?
  image     String?
  articles  Article[]
}
```

### Article Model
```prisma
model Article {
  id          Int      @id @default(autoincrement())
  title       String
  description String
  body        String
  authorId    Int
  author      User     @relation(fields: [authorId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## 📝 API Endpoints

### Authentication
- `POST /auth/signup` - User registration
- `POST /auth/login` - User login

### Example Request Bodies

**Signup**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Login**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📦 Available Scripts

- `npm run build` - Build the application
- `npm run start` - Start the application
- `npm run start:dev` - Start in development mode with hot reload
- `npm run start:prod` - Start in production mode
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## 🔧 Development

### Adding New Features

1. Generate a new module:
   ```bash
   nest g module feature-name
   ```

2. Generate a controller:
   ```bash
   nest g controller feature-name
   ```

3. Generate a service:
   ```bash
   nest g service feature-name
   ```

### Database Changes

1. Modify the Prisma schema in `prisma/schema.prisma`
2. Generate and apply migration:
   ```bash
   npx prisma migrate dev --name migration-name
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the UNLICENSED License.

## 👨‍💻 Author

**LeHoi** - [lehoi2510](https://github.com/lehoi2510)

## 🙏 Acknowledgments

- [NestJS](https://nestjs.com/) for the amazing framework
- [Prisma](https://prisma.io/) for the excellent ORM
- [Medium](https://medium.com/) for the inspiration
