# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### Register User
**POST** `/auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword",
  "role": "student" // or "instructor"
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "student",
  "token": "jwt_token_here"
}
```

### Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "student",
  "token": "jwt_token_here"
}
```

### Get Profile
**GET** `/auth/profile`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "id": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "student",
  "bio": "...",
  "avatar": "url"
}
```

---

## Course Endpoints

### Get All Courses
**GET** `/courses`

**Query Parameters:**
- `keyword` (optional): Search term
- `category` (optional): Category slug
- `pageNumber` (optional): Page number (default: 1)

**Response:**
```json
{
  "courses": [
    {
      "id": "uuid",
      "title": "Course Title",
      "slug": "course-title-123",
      "description": "...",
      "price": 49.99,
      "thumbnail": "url",
      "averageRating": 4.5,
      "enrollmentsCount": 1234,
      "instructor": {
        "name": "Instructor Name",
        "avatar": "url"
      },
      "category": {
        "name": "Web Development",
        "slug": "web-development"
      }
    }
  ],
  "page": 1,
  "pages": 10
}
```

### Get Course by Slug
**GET** `/courses/:slug`

**Response:**
```json
{
  "id": "uuid",
  "title": "Course Title",
  "slug": "course-title-123",
  "description": "...",
  "price": 49.99,
  "level": "intermediate",
  "language": "English",
  "totalDuration": 1200,
  "totalLectures": 45,
  "instructor": {
    "id": "uuid",
    "name": "Instructor Name",
    "bio": "...",
    "avatar": "url"
  },
  "content": {
    "sections": [
      {
        "title": "Section 1",
        "lectures": [
          {
            "title": "Lecture 1",
            "videoDuration": 600
          }
        ]
      }
    ]
  },
  "reviews": [...]
}
```

### Create Course (Instructor Only)
**POST** `/courses`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "New Course",
  "description": "Course description",
  "price": 49.99,
  "categoryId": 1,
  "level": "beginner"
}
```

### Update Course (Instructor Only)
**PUT** `/courses/:id`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Updated Title",
  "status": "published"
}
```

---

## Enrollment Endpoints

### Get My Courses
**GET** `/enrollments/my-courses`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
[
  {
    "id": "uuid",
    "progress": 65.5,
    "isCompleted": false,
    "course": {
      "id": "uuid",
      "title": "Course Title",
      "thumbnail": "url"
    }
  }
]
```

### Check Enrollment
**GET** `/enrollments/check/:courseId`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "isEnrolled": true,
  "enrollment": {
    "id": "uuid",
    "progress": 50
  }
}
```

### Update Progress
**PUT** `/enrollments/:courseId/progress`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "lectureId": "lecture_id_here"
}
```

---

## Payment Endpoints

### Create Payment Intent
**POST** `/payments/create-intent`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "courseId": "uuid"
}
```

**Response:**
```json
{
  "clientSecret": "stripe_client_secret",
  "paymentIntentId": "pi_xxx"
}
```

---

## ML Recommendation Endpoints

### Get Personalized Recommendations
**GET** `/recommendations/:userId`

**Query Parameters:**
- `limit` (optional): Number of recommendations (default: 10)

**Response:**
```json
{
  "user_id": "uuid",
  "recommendations": [
    {
      "course_id": "uuid",
      "similarity_score": 0.85
    }
  ]
}
```

### Get Similar Courses
**GET** `/similar-courses/:courseId`

**Query Parameters:**
- `limit` (optional): Number of similar courses (default: 5)

**Response:**
```json
{
  "course_id": "uuid",
  "similar_courses": [
    {
      "course_id": "uuid",
      "similarity_score": 0.92
    }
  ]
}
```

---

## Error Responses

All endpoints may return the following error responses:

**400 Bad Request:**
```json
{
  "message": "Error description"
}
```

**401 Unauthorized:**
```json
{
  "message": "Not authorized, no token"
}
```

**403 Forbidden:**
```json
{
  "message": "User role student is not authorized to access this route"
}
```

**404 Not Found:**
```json
{
  "message": "Resource not found"
}
```

**500 Internal Server Error:**
```json
{
  "message": "Error description",
  "stack": "..." // Only in development
}
```
