# School Management System Backend

A comprehensive Node.js backend API for managing school operations including student management, teacher administration, attendance tracking, exam management, and more.

## 🚀 **Features**

### Core Functionality

-   **User Management**: Complete user authentication and authorization system
-   **Student Management**: Student registration, profiles, and academic records
-   **Teacher Management**: Teacher profiles, subject assignments, and schedules
-   **Class Management**: Class creation, curriculum assignment, and student enrollment
-   **Attendance System**: Track student and employee attendance with detailed reporting
-   **Exam Management**: Create, manage, and grade exams with question banks
-   **Academic Structure**: Manage academic years, semesters, subjects, and curricula
-   **Financial Management**: Tuition payment tracking and fee management
-   **Notification System**: Firebase-powered push notifications and messaging
-   **File Upload**: Secure file upload and management system
-   **Bulk Operations**: Excel-based bulk import for students and data management

### Security & Authentication

-   **JWT Authentication**: Secure token-based authentication
-   **Role-Based Access Control**: Permission system with granular access control
-   **Password Encryption**: Secure password hashing with bcrypt
-   **Middleware Protection**: Comprehensive security middleware stack
-   **CORS Protection**: Cross-origin resource sharing security

### Technical Features

-   **RESTful API**: Well-structured REST API endpoints
-   **Database Migrations**: Version-controlled database schema management
-   **Data Validation**: Comprehensive input validation and sanitization
-   **Error Handling**: Centralized error handling and logging
-   **File Processing**: Excel and CSV file processing capabilities
-   **Firebase Integration**: Push notifications and messaging services

## 🛠 **Technology Stack**

-   **Runtime**: Node.js
-   **Framework**: Express.js v5.1.0
-   **Database**: PostgreSQL with Knex.js v3.1.0
-   **Authentication**: JWT (jsonwebtoken v9.0.2)
-   **Security**: bcrypt-nodejs, crypto
-   **File Processing**: multer, xlsx v0.18.5
-   **Notifications**: Firebase Admin SDK v13.4.0
-   **HTTP Client**: axios v1.9.0
-   **Development**: nodemon v3.1.10

## 📋 **Prerequisites**

Before running this project, make sure you have the following installed:

-   **Node.js** (v14 or higher)
-   **PostgreSQL** (v12 or higher)
-   **npm** or **yarn** package manager
-   **Firebase Project** (for notifications)

## 🚀 **Getting Started**

### 1. **Clone and Install**

```bash
# Clone the repository
git clone <repository-url>
cd project_one

# Install dependencies
npm install
```

### 2. **Environment Setup**

Create a `.env` file in the root directory:

```env
# Database Configuration
DB_PASS=your_postgresql_password
PORT=3001

# JWT Configuration
JWT_SECRET=your_jwt_secret_key

# Firebase Configuration (if using notifications)
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_CLIENT_ID=your_client_id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_CERT_URL=your_client_cert_url

# Other configurations
NODE_ENV=development
```

### 3. **Database Setup**

```bash
# Create PostgreSQL database
createdb school_db_3

# Run migrations
npx knex migrate:latest

# Run seeds (optional - for initial data)
npx knex seed:run
```

### 4. **Start the Server**

```bash
# Development mode with auto-reload
npm start

# Or run directly
node server.js
```

The server will start on `http://localhost:3001`

## 📚 **API Documentation**

### Base URL

```
http://localhost:3001/api
```

### Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Available Endpoints

#### User Management

-   `POST /users/login` - User authentication
-   `POST /users/register` - User registration
-   `GET /users/profile` - Get user profile
-   `PUT /users/profile` - Update user profile

#### Student Management

-   `GET /students` - Get all students
-   `POST /students` - Create new student
-   `GET /students/:id` - Get student by ID
-   `PUT /students/:id` - Update student
-   `DELETE /students/:id` - Delete student
-   `POST /students/bulk-upload` - Bulk student creation via Excel

#### Teacher Management

-   `GET /teachers` - Get all teachers
-   `POST /teachers` - Create new teacher
-   `GET /teachers/:id` - Get teacher by ID
-   `PUT /teachers/:id` - Update teacher
-   `DELETE /teachers/:id` - Delete teacher

#### Class Management

-   `GET /classes` - Get all classes
-   `POST /classes` - Create new class
-   `GET /classes/:id` - Get class by ID
-   `PUT /classes/:id` - Update class
-   `DELETE /classes/:id` - Delete class

#### Attendance System

-   `GET /attendance_students` - Get student attendance records
-   `POST /attendance_students` - Mark student attendance
-   `GET /attendance_employees` - Get employee attendance records
-   `POST /attendance_employees` - Mark employee attendance

#### Exam Management

-   `GET /exams` - Get all exams
-   `POST /exams` - Create new exam
-   `GET /exams/:id` - Get exam by ID
-   `PUT /exams/:id` - Update exam
-   `DELETE /exams/:id` - Delete exam
-   `GET /questions` - Get all questions
-   `POST /questions` - Create new question
-   `GET /exam_attempts` - Get exam attempts
-   `POST /exam_attempts` - Submit exam attempt

#### Academic Structure

-   `GET /academic_years` - Get academic years
-   `POST /academic_years` - Create academic year
-   `GET /semesters` - Get semesters
-   `POST /semesters` - Create semester
-   `GET /subjects` - Get subjects
-   `POST /subjects` - Create subject
-   `GET /curriculums` - Get curricula
-   `POST /curriculums` - Create curriculum

#### Financial Management

-   `GET /tuition-payments` - Get tuition payments
-   `POST /tuition-payments` - Create tuition payment
-   `PUT /tuition-payments/:id` - Update payment status

#### Notifications

-   `GET /notifications` - Get notifications
-   `POST /notifications` - Send notification
-   `POST /fcm` - Register FCM token

#### Permissions & Roles

-   `GET /roles` - Get all roles
-   `POST /roles` - Create new role
-   `GET /permissions` - Get all permissions
-   `POST /permissions` - Create new permission

## 📊 **Database Schema**

The system uses 37 database migrations to create a comprehensive schema including:

-   **Users & Authentication**: users, roles, permissions, role_permissions
-   **Academic Structure**: academic_years, semesters, subjects, curriculums
-   **People Management**: students, teachers, teachers_subjects
-   **Class Management**: classes, schedules, days, periods
-   **Assessment**: exams, questions, options, exam_attempts, answers, grades
-   **Attendance**: attendance_students, attendance_employees
-   **Financial**: tuition_payments
-   **Communication**: notifications, fcm_tokens, behaviors
-   **System**: archives, blacklisted_tokens

## 🔧 **Project Structure**

```
project_one/
├── api/
│   ├── controllers/          # Request handlers (30+ controllers)
│   ├── models/              # Database models (30+ models)
│   ├── routes/              # API route definitions (28+ routes)
│   ├── services/            # Business logic layer (30+ services)
│   ├── validators/          # Input validation (28+ validators)
│   └── index.js             # API router setup
├── config/
│   └── db.js                # Database configuration
├── firebase/
│   └── firebase-admin.js    # Firebase admin setup
├── middleware/              # Authentication & security middleware
│   ├── authMiddleware.js
│   ├── roleMiddleware.js
│   ├── hasPermission.js
│   └── uploadMiddleware.js
├── migrations/              # Database migrations (37 files)
├── seeds/                   # Database seeds (4 files)
├── uploads/                 # File upload directory
├── tools/                   # Utility scripts for exports
├── All_Compacts/           # Compact exports of all components
├── knexfile.js             # Knex configuration
├── server.js               # Main server file
└── package.json            # Dependencies and scripts
```

## 🧪 **Testing the API**

### Using Postman

1. **Import API Collection** (if available)
2. **Set Base URL**: `http://localhost:3001/api`
3. **Authentication**: Use JWT token in headers for protected routes

### Example API Calls

#### Login

```bash
POST /api/users/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password"
}
```

#### Get Students (Authenticated)

```bash
GET /api/students
Authorization: Bearer <jwt_token>
```

## 📁 **File Upload**

The system supports file uploads for:

-   **Student Photos**: Profile pictures and documents
-   **Excel Files**: Bulk data import (.xlsx, .xls, .csv)
-   **Documents**: Various school documents

### Upload Configuration

-   **Max File Size**: 5MB (configurable)
-   **Supported Formats**: Images, Excel files, PDFs
-   **Storage**: Local uploads directory with automatic cleanup

## 🔐 **Security Features**

-   **JWT Token Authentication**: Secure user sessions
-   **Password Hashing**: bcrypt encryption for passwords
-   **Input Validation**: Comprehensive data validation
-   **SQL Injection Protection**: Parameterized queries via Knex
-   **CORS Protection**: Configured cross-origin policies
-   **File Upload Security**: Type and size validation
-   **Permission System**: Role-based access control

## 🚨 **Error Handling**

The API provides comprehensive error handling:

### Common HTTP Status Codes

-   `200` - Success
-   `201` - Created
-   `400` - Bad Request (validation errors)
-   `401` - Unauthorized
-   `403` - Forbidden (insufficient permissions)
-   `404` - Not Found
-   `500` - Internal Server Error

### Error Response Format

```json
{
    "error": "Error message",
    "details": "Additional error information"
}
```

## 📈 **Performance Optimization**

-   **Database Indexing**: Optimized queries with proper indexing
-   **Connection Pooling**: PostgreSQL connection pooling
-   **Caching**: Firebase caching for notifications
-   **File Processing**: Efficient Excel processing for bulk operations
-   **Transaction Management**: Database transactions for data consistency

## 🔄 **Available Scripts**

```bash
# Start development server
npm start

# Database operations
npx knex migrate:latest          # Run all migrations
npx knex migrate:rollback        # Rollback last migration
npx knex seed:run               # Run seed files
npx knex migrate:make create_table_name  # Create new migration

# Export utilities (in tools/ directory)
node tools/exportAll.js         # Export all components
node tools/exportControllers.js # Export controllers
```

## 🗂️ **Additional Documentation**

-   **[Excel Upload Guide](./README_EXCEL_UPLOAD.md)** - Detailed guide for bulk student creation
-   **[API Routes](./api/routes/)** - Individual route documentation
-   **[Database Schema](./migrations/)** - Migration files for schema reference

## 🤝 **Contributing**

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/new-feature`
3. **Make your changes** and ensure tests pass
4. **Commit your changes**: `git commit -am 'Add new feature'`
5. **Push to the branch**: `git push origin feature/new-feature`
6. **Submit a pull request**

## 📝 **License**

This project is licensed under the ISC License.

## 🆘 **Support**

For support and questions:

1. **Check the documentation** for API usage and configuration
2. **Review server logs** for detailed error messages
3. **Test with simple data** to isolate issues
4. **Verify database connections** and environment variables
5. **Check Firebase configuration** for notification issues

## 🔄 **Recent Updates**

-   Comprehensive school management features
-   Firebase integration for notifications
-   Excel bulk import functionality
-   Enhanced security and authentication
-   Database optimization and migrations

---

**Happy coding! 🎉**

For more detailed information about specific features, check the individual documentation files in the project.
