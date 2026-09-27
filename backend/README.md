# Farmora API

A comprehensive farm management API built with Node.js, Express, and PostgreSQL.

## Documentation

📚 **[Complete API Documentation](./API_DOCUMENTATION.md)** - Detailed documentation for all available endpoints

## Quick Overview

The Farmora API provides the following features:

- **Authentication & User Management** - User signup, login, and profile management
- **Package Management** - Subscription packages with CRUD operations
- **Subscription Management** - User subscription handling
- **Configuration Management** - Manage farms, seasons, items, vendors, and batches

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database
- npm or yarn package manager

### Installation

1. Clone the repository

```bash
git clone <repository-url>
cd backend
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables
   Create a `.env` file in the backend directory with the following variables:

```
DB_HOST=your_database_host
DB_PORT=5432
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
JWT_SECRET=your_jwt_secret
PORT=3000
```

4. Run database migrations

```bash
npm run db:migrate
```

5. (Optional) Seed the database

```bash
npm run db:seed
```

### Running the Application

Development mode with auto-reload:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

The server will start on the port specified in your configuration (default: 3000).

## API Endpoints Overview

### Authentication (`/api/auth`)

- `POST /signup` - Create a new user
- `POST /login` - Authenticate user
- `GET /users` - Get all users

### Packages (`/api/packages`)

- `POST /` - Create package (Admin only)
- `GET /` - Get all packages
- `GET /:package_id` - Get package by ID
- `PUT /:package_id` - Update package (Admin only)
- `DELETE /:package_id` - Delete package

### Subscriptions (`/api/subscriptions`)

- `POST /subscribe` - Create subscription
- `GET /` - Get all subscriptions

### Configuration (`/api/config`)

- **Seasons**: Full CRUD operations on `/seasons` endpoints
- **Farms**: Full CRUD operations on `/farms` endpoints
- **Items**: Full CRUD operations on `/items` endpoints
- **Vendors**: Full CRUD operations on `/vendors` endpoints
- **Batches**: Full CRUD operations on `/batches` endpoints

For detailed endpoint documentation, please refer to the [API Documentation](./API_DOCUMENTATION.md).

## Available Scripts

- `npm start` - Start the application
- `npm run dev` - Start in development mode with nodemon
- `npm run doc` - Generate JSDoc documentation
- `npm run db:migrate` - Run database migrations
- `npm run db:migrate:undo` - Undo last migration
- `npm run db:seed` - Seed the database
- `npm run db:seed:undo` - Undo last seed

## Technologies Used

- **Express.js** - Web framework
- **Sequelize** - ORM for PostgreSQL
- **JWT** - Authentication
- **Joi** - Request validation
- **Bcrypt** - Password hashing
- **Nodemailer** - Email functionality

## Project Structure

```
backend/
├── src/
│   ├── controllers/     # Request handlers
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── middlewares/     # Custom middleware
│   ├── validators/      # Request validation
│   ├── utils/           # Utility functions
│   └── errors/          # Custom error classes
├── models/              # Sequelize models
├── migrations/          # Database migrations
├── seeders/             # Database seeders
├── config/              # Configuration files
└── app.js               # Application entry point
```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Support

For issues, questions, or contributions, please open an issue in the repository.
