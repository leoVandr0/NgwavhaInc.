# NgwavhaInc.
# SkillForge - Professional Learning Management System 🎓

A fully functional Udemy-like platform with advanced features including ML-powered recommendations, payment processing, and certificate generation.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-18.2.0-blue.svg)

## ✨ Features

### 🔐 **Authentication & User Management**
- Secure JWT-based authentication
- Role-based access control (Student, Instructor, Admin)
- Profile management with social links
- Password reset functionality

### 📚 **Course Management**
- Create, edit, and publish courses
- Rich content support (videos, PDFs, quizzes)
- Section and lecture organization
- Course categories and tags
- Advanced search and filtering

### 💳 **Payment & Enrollment**
- Stripe payment integration
- Automated enrollment on payment success
- Transaction history
- Discount codes and pricing tiers

### 📊 **Analytics & Tracking**
- Student progress tracking
- Instructor revenue dashboards
- Course completion metrics
- Admin site-wide analytics

### 🤖 **ML Recommendations**
- Personalized course suggestions
- Content-based filtering
- Collaborative filtering
- Hybrid recommendation system

### 🏆 **Certificates**
- Auto-generated completion certificates
- Downloadable PDFs
- Shareable certificate links
- Verification system

### 📧 **Email Notifications**
- Welcome emails
- Enrollment confirmations
- Course completion notifications
- New content alerts

### 🎨 **Modern UI/UX**
- Responsive design (mobile-friendly)
- Black & Sky Blue theme
- Smooth animations (Framer Motion)
- Intuitive navigation

## 🚀 Tech Stack

### Frontend
- **React 18** + **Vite** - Fast, modern development
- **Tailwind CSS** - Utility-first styling
- **Zustand** - Lightweight state management
- **React Query** - Server state management
- **Framer Motion** - Smooth animations
- **Lucide React** - Beautiful icons

### Backend
- **Node.js** + **Express.js** - RESTful API
- **JWT** - Secure authentication
- **Sequelize** - MySQL ORM
- **Mongoose** - MongoDB ODM
- **Stripe** - Payment processing
- **SendGrid/Nodemailer** - Email service

### Databases
- **MySQL** - Structured data (users, enrollments, transactions)
- **MongoDB** - Unstructured data (course content, videos)

### ML Engine
- **Python** + **Flask** - ML API
- **scikit-learn** - Machine learning
- **TF-IDF** - Text vectorization
- **SVD** - Dimensionality reduction

### Deployment
- **Railway** - Full-stack hosting
- **Managed MySQL & MongoDB**

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+
- MySQL 8.0+
- MongoDB 6.0+

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd udemy_clone
   ```

2. **Install dependencies**
   ```bash
   # Root dependencies
   npm install
   
   # Server dependencies
   cd server && npm install
   
   # Client dependencies
   cd ../client && npm install
   
   # ML engine dependencies
   cd ../ml-engine && pip install -r requirements.txt
   ```

3. **Configure environment variables**
   ```bash
   # Copy example files
   cp server/.env.example server/.env
   cp client/.env.example client/.env
   cp ml-engine/.env.example ml-engine/.env
   
   # Edit .env files with your credentials
   ```

4. **Set up databases**
   ```sql
   -- MySQL
   CREATE DATABASE skillforge;
   
   -- MongoDB will auto-create on first connection
   ```

5. **Start all services**
   ```bash
   # From root directory
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000
   - ML Engine: http://localhost:8000

📖 **For detailed setup instructions, see [SETUP.md](./docs/SETUP.md)**

---

## 📁 Project Structure

```
udemy_clone/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom hooks
│   │   ├── store/          # Zustand stores
│   │   ├── services/       # API services
│   │   ├── utils/          # Utility functions
│   │   └── styles/         # Global styles
│   └── public/             # Static assets
├── server/                 # Node.js backend
│   ├── config/             # Configuration files
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   └── utils/              # Utility functions
├── ml-engine/              # Python ML service
│   ├── models/             # ML models
│   ├── services/           # Recommendation logic
│   └── api/                # Flask API
├── docs/                   # Documentation
└── scripts/                # Deployment scripts
```

## 🎨 Color Theme

- **Primary**: Sky Blue (#0EA5E9)
- **Secondary**: Dark (#0F172A)
- **Background**: Black (#000000)
- **Surface**: Dark Gray (#1E293B)
- **Accent**: Cyan (#06B6D4)

## 🔐 User Roles

1. **Student** - Browse, enroll, learn, review courses
2. **Instructor** - Create, manage courses, view analytics
3. **Admin** - Full system access, reporting, user management

## 🛠️ Features

### Authentication
- [x] Secure signup/login with JWT
- [x] Password reset via email
- [x] OAuth integration (Google)
- [x] Role-based access control

### Course Management
- [x] Create/Edit/Delete courses
- [x] Video content upload
- [x] PDF attachments
- [x] Quizzes and assignments
- [x] Categories and tags
- [x] Search and filtering

### Enrollment & Payments
- [x] Course browsing and enrollment
- [x] Stripe payment integration
- [x] Subscription plans
- [x] Discounts and coupons
- [x] Refund processing

### Analytics & Reporting
- [x] Instructor dashboard
- [x] Student progress tracking
- [x] Revenue analytics
- [x] Admin reporting

### Additional Features
- [x] Course recommendations (ML)
- [x] Completion certificates
- [x] Ratings and reviews
- [x] Email notifications
- [x] Mobile responsive design

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.9+
- MySQL 8.0+
- MongoDB 6.0+

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd udemy_clone
```

2. Install dependencies
```bash
# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install

# Install ML engine dependencies
cd ../ml-engine && pip install -r requirements.txt
```

3. Configure environment variables
```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

4. Start the development servers
```bash
# Start all services
npm run dev
```

## 📚 Documentation

Comprehensive documentation is available in the `/docs` folder:

- **[Setup Guide](./docs/SETUP.md)** - Complete installation and configuration
- **[API Documentation](./docs/API.md)** - All API endpoints with examples
- **[Database Schema](./docs/DATABASE.md)** - MySQL and MongoDB schemas
- **[Architecture](./docs/ARCHITECTURE.md)** - System design and tech stack
- **[ML Recommendations](./docs/ML_RECOMMENDATIONS.md)** - Recommendation algorithms
- **[Deployment Guide](./docs/DEPLOYMENT.md)** - Railway deployment instructions

## 📸 Screenshots

### Homepage
![Homepage](./docs/screenshots/homepage.png)

### Course Details
![Course Details](./docs/screenshots/course-details.png)

### Student Dashboard
![Student Dashboard](./docs/screenshots/student-dashboard.png)

### Instructor Dashboard
![Instructor Dashboard](./docs/screenshots/instructor-dashboard.png)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 🐛 Known Issues

- Certificate generation requires additional setup
- Video upload size limited to 100MB
- ML recommendations require training data

---

## 🗺️ Roadmap

- [ ] Real-time notifications (WebSocket)
- [ ] Mobile app (React Native)
- [ ] Live streaming classes
- [ ] Discussion forums
- [ ] Gamification (badges, leaderboards)
- [ ] Multi-language support
- [ ] Dark/Light theme toggle

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**SkillForge Team**

- GitHub: [@skillforge](https://github.com/skillforge)
- Email: support@skillforge.com

---

## 🙏 Acknowledgments

- Inspired by Udemy, Coursera, and other leading LMS platforms
- Built with amazing open-source technologies
- Special thanks to all contributors

---

**⭐ If you find this project useful, please give it a star!**
