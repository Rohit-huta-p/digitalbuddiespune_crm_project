# CRM-Project

A full-stack Customer Relationship Management (CRM) system built with Spring Boot (Backend) and Next.js (Frontend).

## 📋 Project Overview

This CRM system provides comprehensive tools for managing customers, employees, projects, tasks, attendance, billing, leads, and social media calendar.

### Features

- **Employee Management**: Create, update, and manage employee records with salary tracking
- **Client Management**: Manage client details, projects, and work updates
- **Lead Management**: Track leads with follow-ups and status management
- **Project Management**: Create and manage project groups with task assignments
- **Task Management**: Assign, schedule, and track tasks across projects
- **Attendance System**: Check-in/check-out with location tracking and attendance reports
- **Billing**: Generate and manage bills for clients
- **Social Media Calendar**: Schedule and manage social media posts
- **Chat System**: Internal communication between team members
- **Authentication**: JWT-based secure authentication

## 🏗️ Project Structure

```
CRM-Project/
├── CRM_Backend-dev/        # Spring Boot Backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/crm/
│   │   │   │   ├── controller/
│   │   │   │   ├── model/
│   │   │   │   ├── repos/
│   │   │   │   ├── service/
│   │   │   │   ├── security/
│   │   │   │   └── utility/
│   │   │   └── resources/
│   │   └── test/
│   └── pom.xml
│
└── crm-frontend-ts/        # Next.js Frontend
    ├── src/
    │   ├── app/
    │   ├── components/
    │   ├── context/
    │   ├── hooks/
    │   ├── lib/
    │   └── types/
    ├── package.json
    └── next.config.mjs
```

## 🛠️ Technology Stack

### Backend
- **Framework**: Spring Boot 3.x
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **Build Tool**: Maven
- **Java Version**: 17+
- **Key Dependencies**:
  - Spring Security
  - Spring Data JPA
  - Lombok
  - Jakarta Mail (for email services)
  - iText PDF (for PDF generation)

### Frontend
- **Framework**: Next.js 14
- **Language**: TypeScript
- **UI Components**: Shadcn/UI, Radix UI
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Form Handling**: React Hook Form
- **Charts**: Recharts
- **HTTP Client**: Axios
- **Date Handling**: date-fns

## 🚀 Deployment Instructions

### Prerequisites

- Java Development Kit (JDK) 17 or higher
- Maven 3.6+
- Node.js 18+ and npm
- MySQL 8.0+
- Git

### Backend Deployment

1. **Clone the repository**
   ```bash
   git clone https://github.com/varadwagh327/CRM-Project.git
   cd CRM-Project/CRM_Backend-dev
   ```

2. **Configure Database**
   
   Create a MySQL database and update `src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/crm_database
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   spring.jpa.hibernate.ddl-auto=update
   ```

3. **Configure Email Service** (Optional)
   
   Update email configuration in `application.properties`:
   ```properties
   spring.mail.host=smtp.gmail.com
   spring.mail.port=587
   spring.mail.username=your_email@gmail.com
   spring.mail.password=your_app_password
   ```

4. **Build the project**
   ```bash
   mvn clean install
   ```

5. **Run the application**
   ```bash
   mvn spring-boot:run
   ```
   
   Or run the JAR file:
   ```bash
   java -jar target/crm-0.0.1-SNAPSHOT.jar
   ```

   Backend will run on: `http://localhost:8080`

### Frontend Deployment

1. **Navigate to frontend directory**
   ```bash
   cd crm-frontend-ts
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API endpoint**
   
   Update API base URL in your frontend configuration (typically in `.env.local`):
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8080
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

   Frontend will run on: `http://localhost:3000`

5. **Build for production**
   ```bash
   npm run build
   npm start
   ```

## 🔐 Default Credentials

After initial setup, use these credentials to login (if configured):
- **Username**: admin (or as configured)
- **Password**: (set during first employee creation)

## 📝 API Documentation

The backend exposes RESTful APIs at `http://localhost:8080/api`

Key endpoints include:
- `/auth/login` - Authentication
- `/employees` - Employee management
- `/clients` - Client management
- `/projects` - Project management
- `/tasks` - Task management
- `/attendance` - Attendance tracking
- `/leads` - Lead management
- `/billing` - Billing operations

## 🌐 Environment Variables

### Backend
Create `application.properties` or use environment variables:
- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `JWT_SECRET`
- `SPRING_MAIL_USERNAME`
- `SPRING_MAIL_PASSWORD`

### Frontend
Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## 📦 Production Deployment

### Docker Deployment (Recommended)

Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_DATABASE: crm_database
      MYSQL_ROOT_PASSWORD: root_password
    ports:
      - "3306:3306"
  
  backend:
    build: ./CRM_Backend-dev
    ports:
      - "8080:8080"
    depends_on:
      - mysql
  
  frontend:
    build: ./crm-frontend-ts
    ports:
      - "3000:3000"
    depends_on:
      - backend
```

Run with:
```bash
docker-compose up -d
```

## 🧪 Testing

### Backend Tests
```bash
cd CRM_Backend-dev
mvn test
```

### Frontend Tests
```bash
cd crm-frontend-ts
npm test
```

## 📄 License

This project is proprietary software.

## 👥 Contributors

- **Varad Wagh** - [@varadwagh327](https://github.com/varadwagh327)

## 🐛 Known Issues

- Review the **Problems** panel in VS Code for code quality warnings (unused imports, variables)
- These are non-blocking warnings and don't affect functionality

## 📞 Support

For issues and questions, please open an issue on GitHub.

---

**Last Updated**: November 28, 2025
