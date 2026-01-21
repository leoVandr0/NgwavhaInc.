# SkillForge - Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  React + Vite + Tailwind CSS (Black & Sky Blue Theme)   │  │
│  │  • React Router for navigation                            │  │
│  │  • Zustand for state management                           │  │
│  │  • React Query for data fetching                          │  │
│  │  • Framer Motion for animations                           │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓ HTTP/REST
┌─────────────────────────────────────────────────────────────────┐
│                         API LAYER                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Node.js + Express.js                                     │  │
│  │  • JWT Authentication                                      │  │
│  │  • Role-based Access Control                              │  │
│  │  • Stripe Payment Integration                             │  │
│  │  • Email Service (SendGrid/Nodemailer)                    │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                    ↓                           ↓
┌──────────────────────────┐    ┌──────────────────────────────┐
│   DATABASE LAYER         │    │   ML ENGINE                   │
│  ┌────────────────────┐  │    │  ┌────────────────────────┐  │
│  │  MySQL             │  │    │  │  Python Flask          │  │
│  │  (Structured)      │  │    │  │  • TF-IDF              │  │
│  │  • Users           │  │    │  │  • SVD                 │  │
│  │  • Courses         │  │    │  │  • Cosine Similarity   │  │
│  │  • Enrollments     │  │    │  └────────────────────────┘  │
│  │  • Transactions    │  │    └──────────────────────────────┘
│  │  • Reviews         │  │
│  └────────────────────┘  │
│                          │
│  ┌────────────────────┐  │
│  │  MongoDB           │  │
│  │  (Unstructured)    │  │
│  │  • Course Content  │  │
│  │  • Videos          │  │
│  │  • Resources       │  │
│  └────────────────────┘  │
└──────────────────────────┘
```

## Technology Stack

### Frontend
- **Framework:** React 18 with Vite
- **Styling:** Tailwind CSS (Custom Black & Sky Blue theme)
- **Routing:** React Router v6
- **State Management:** Zustand with persistence
- **Data Fetching:** React Query
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Forms:** React Hook Form
- **Notifications:** React Hot Toast

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcryptjs
- **Validation:** Express Validator
- **File Upload:** Multer
- **Security:** Helmet, CORS, Rate Limiting

### Databases
- **MySQL 8.0+** (via Sequelize ORM)
  - User accounts
  - Course metadata
  - Enrollments
  - Transactions
  - Reviews
  
- **MongoDB 6.0+** (via Mongoose ODM)
  - Course content (videos, PDFs)
  - Lecture data
  - Resources

### Payment Processing
- **Stripe API**
  - Payment Intents
  - Webhooks for automated enrollment
  - Customer management

### Email Service
- **SendGrid** (primary)
- **Nodemailer** (fallback/SMTP)

### Machine Learning
- **Python 3.9+**
- **Flask** - REST API
- **scikit-learn** - ML algorithms
- **pandas** - Data manipulation
- **numpy** - Numerical computing

### Deployment
- **Railway** - Full-stack hosting
- **MySQL** - Railway managed database
- **MongoDB** - Railway managed database

## Key Features Implementation

### 1. Authentication & Authorization
```javascript
// JWT-based authentication
const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });

// Role-based middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
};
```

### 2. Payment Flow
```
1. User clicks "Enroll" → Frontend
2. Create Payment Intent → Backend → Stripe
3. User completes payment → Stripe
4. Webhook notification → Backend
5. Create Enrollment → Database
6. Send confirmation email → User
```

### 3. Course Progress Tracking
```javascript
// Update progress when lecture completed
enrollment.completedLectures.push(lectureId);
enrollment.progress = (completedLectures.length / totalLectures) * 100;

// Auto-generate certificate at 100%
if (enrollment.progress >= 100) {
  enrollment.isCompleted = true;
  generateCertificate(enrollment);
}
```

### 4. ML Recommendations
```python
# Content-based filtering
1. Extract features from courses (TF-IDF)
2. Reduce dimensions (SVD)
3. Calculate similarity (Cosine)
4. Return top N similar courses

# Hybrid approach
- New users → Popular courses
- Existing users → Similar to enrolled courses
```

### 5. Email Notifications
```javascript
// Triggered events
- User registration → Welcome email
- Course enrollment → Confirmation email
- Course completion → Certificate email
- New content added → Update notification
- Password reset → Reset link email
```

## Security Measures

1. **Password Security**
   - bcrypt hashing with salt rounds
   - Minimum password requirements

2. **API Security**
   - JWT token authentication
   - Rate limiting (100 requests/15 min)
   - Helmet.js for HTTP headers
   - CORS configuration

3. **Payment Security**
   - Stripe webhook signature verification
   - No credit card data stored
   - PCI compliance through Stripe

4. **Data Validation**
   - Input sanitization
   - Express Validator
   - SQL injection prevention (Sequelize)
   - NoSQL injection prevention (Mongoose)

## Scalability Considerations

### Horizontal Scaling
- Stateless API design
- JWT tokens (no server-side sessions)
- Database connection pooling

### Caching Strategy
- Client-side caching (React Query)
- API response caching (future: Redis)
- CDN for static assets

### Database Optimization
- Indexed columns (email, slug, IDs)
- Pagination for large datasets
- Lazy loading for course content

### File Storage
- Current: Local uploads folder
- Future: Cloud storage (Cloudinary/S3)

## Monitoring & Logging

### Application Logs
```javascript
// Morgan for HTTP logging
app.use(morgan('combined'));

// Custom error logging
console.error('Error:', error.message, error.stack);
```

### Database Monitoring
- Sequelize query logging (development)
- Mongoose debug mode

### Performance Metrics
- API response times
- Database query performance
- Payment success rate
- Email delivery rate

## Development Workflow

```bash
# Install dependencies
npm install

# Development mode (all services)
npm run dev

# Individual services
npm run dev:server   # Backend on :5000
npm run dev:client   # Frontend on :5173
npm run dev:ml       # ML engine on :8000

# Production build
npm run build

# Database migrations
npm run db:migrate
npm run db:seed
```

## Testing Strategy

### Unit Tests
- Controller functions
- Utility functions
- ML algorithms

### Integration Tests
- API endpoints
- Database operations
- Payment flow

### E2E Tests
- User registration/login
- Course enrollment
- Payment processing

## Future Enhancements

1. **Real-time Features**
   - WebSocket for live updates
   - Real-time progress tracking
   - Live chat support

2. **Advanced Analytics**
   - Student engagement metrics
   - Course performance dashboards
   - Revenue analytics

3. **Content Delivery**
   - Video streaming optimization
   - Adaptive bitrate streaming
   - Offline download support

4. **Social Features**
   - Discussion forums
   - Student Q&A
   - Peer reviews

5. **Mobile Apps**
   - React Native apps
   - Push notifications
   - Offline learning
