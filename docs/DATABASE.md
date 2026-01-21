# Database Schema

## MySQL Database (Structured Data)

### Users Table
```sql
CREATE TABLE User (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('student', 'instructor', 'admin') DEFAULT 'student',
  avatar VARCHAR(255) DEFAULT 'default-avatar.png',
  bio TEXT,
  headline VARCHAR(255),
  website VARCHAR(255),
  twitter VARCHAR(255),
  linkedin VARCHAR(255),
  youtube VARCHAR(255),
  is_verified BOOLEAN DEFAULT FALSE,
  reset_password_token VARCHAR(255),
  reset_password_expire DATETIME,
  stripe_customer_id VARCHAR(255),
  stripe_account_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Categories Table
```sql
CREATE TABLE Category (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  icon VARCHAR(255),
  parent_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES Category(id)
);
```

### Courses Table
```sql
CREATE TABLE Course (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  subtitle VARCHAR(255),
  description TEXT NOT NULL,
  price DECIMAL(10, 2) DEFAULT 0.00,
  estimated_price DECIMAL(10, 2),
  thumbnail VARCHAR(255),
  video_preview VARCHAR(255),
  level ENUM('beginner', 'intermediate', 'expert', 'all') DEFAULT 'all',
  language VARCHAR(50) DEFAULT 'English',
  status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
  published_at DATETIME,
  total_duration INT DEFAULT 0,
  total_lectures INT DEFAULT 0,
  average_rating FLOAT DEFAULT 0,
  ratings_count INT DEFAULT 0,
  enrollments_count INT DEFAULT 0,
  mongo_content_id VARCHAR(255),
  instructor_id VARCHAR(36) NOT NULL,
  category_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (instructor_id) REFERENCES User(id),
  FOREIGN KEY (category_id) REFERENCES Category(id)
);
```

### Enrollments Table
```sql
CREATE TABLE Enrollment (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  course_id VARCHAR(36) NOT NULL,
  progress FLOAT DEFAULT 0,
  completed_lectures JSON,
  last_accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at DATETIME,
  certificate_url VARCHAR(255),
  price_paid DECIMAL(10, 2) NOT NULL,
  payment_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES User(id),
  FOREIGN KEY (course_id) REFERENCES Course(id),
  UNIQUE KEY unique_enrollment (user_id, course_id)
);
```

### Reviews Table
```sql
CREATE TABLE Review (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  course_id VARCHAR(36) NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES User(id),
  FOREIGN KEY (course_id) REFERENCES Course(id),
  UNIQUE KEY unique_review (user_id, course_id)
);
```

### Transactions Table
```sql
CREATE TABLE Transaction (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  course_id VARCHAR(36),
  stripe_payment_intent_id VARCHAR(255),
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'usd',
  status ENUM('pending', 'succeeded', 'failed', 'refunded') DEFAULT 'pending',
  payment_method VARCHAR(50) DEFAULT 'card',
  receipt_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES User(id),
  FOREIGN KEY (course_id) REFERENCES Course(id)
);
```

---

## MongoDB Database (Unstructured Content)

### CourseContent Collection
```javascript
{
  _id: ObjectId,
  courseId: String, // References MySQL Course.id
  sections: [
    {
      _id: ObjectId,
      title: String,
      description: String,
      position: Number,
      lectures: [
        {
          _id: ObjectId,
          title: String,
          description: String,
          videoUrl: String,
          videoDuration: Number, // in seconds
          videoPublicId: String,
          type: String, // 'video', 'quiz', 'assignment', 'text'
          content: String,
          resources: [
            {
              title: String,
              url: String,
              type: String // 'pdf', 'zip', 'link'
            }
          ],
          isFree: Boolean,
          position: Number
        }
      ]
    }
  ],
  totalDuration: Number,
  totalLectures: Number,
  updatedAt: Date
}
```

---

## Relationships

### One-to-Many
- **User → Courses** (Instructor creates many courses)
- **User → Enrollments** (Student enrolls in many courses)
- **Course → Enrollments** (Course has many enrollments)
- **Course → Reviews** (Course has many reviews)
- **Category → Courses** (Category contains many courses)
- **Category → Subcategories** (Self-referencing)

### One-to-One
- **Course → CourseContent** (MySQL Course links to MongoDB Content via `mongo_content_id`)

### Many-to-Many (through Enrollment)
- **Users ↔ Courses** (Students can enroll in multiple courses, courses have multiple students)

---

## Indexes

### MySQL Indexes
```sql
-- User indexes
CREATE INDEX idx_user_email ON User(email);
CREATE INDEX idx_user_role ON User(role);

-- Course indexes
CREATE INDEX idx_course_slug ON Course(slug);
CREATE INDEX idx_course_status ON Course(status);
CREATE INDEX idx_course_instructor ON Course(instructor_id);
CREATE INDEX idx_course_category ON Course(category_id);

-- Enrollment indexes
CREATE INDEX idx_enrollment_user ON Enrollment(user_id);
CREATE INDEX idx_enrollment_course ON Enrollment(course_id);

-- Review indexes
CREATE INDEX idx_review_course ON Review(course_id);
CREATE INDEX idx_review_user ON Review(user_id);
```

### MongoDB Indexes
```javascript
db.coursecontents.createIndex({ "courseId": 1 }, { unique: true });
db.coursecontents.createIndex({ "sections.lectures.type": 1 });
```

---

## Data Flow

1. **Course Creation:**
   - Instructor creates course → MySQL `Course` table
   - System creates empty content → MongoDB `CourseContent` collection
   - `Course.mongo_content_id` references MongoDB document

2. **Enrollment:**
   - Student purchases course → Stripe Payment Intent
   - Webhook confirms payment → Create `Enrollment` record
   - Update `Course.enrollments_count`

3. **Progress Tracking:**
   - Student completes lecture → Update `Enrollment.completed_lectures` (JSON array)
   - Calculate progress percentage
   - If 100% → Set `is_completed = true`, generate certificate

4. **Reviews:**
   - Student submits review → Create `Review` record
   - Recalculate `Course.average_rating` and `ratings_count`
