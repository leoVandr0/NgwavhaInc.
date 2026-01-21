# Machine Learning Recommendation System

## Overview

The SkillForge ML recommendation engine uses a **hybrid approach** combining multiple techniques to provide personalized course recommendations:

1. **Content-Based Filtering** - Recommends courses similar to what users have enrolled in
2. **Collaborative Filtering** - Finds patterns in user behavior
3. **Popularity-Based** - Recommends trending courses for new users

---

## Architecture

```
┌─────────────────┐
│   MySQL DB      │  ← User enrollments, course metadata
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  ML Engine      │  ← Python Flask API
│  (Port 8000)    │
│                 │
│  • TF-IDF       │  ← Text vectorization
│  • SVD          │  ← Dimensionality reduction
│  • Cosine Sim   │  ← Similarity calculation
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  Node.js API    │  ← Calls ML engine
│  (Port 5000)    │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  React Client   │  ← Displays recommendations
└─────────────────┘
```

---

## How It Works

### 1. Feature Extraction

The system extracts features from courses using **TF-IDF (Term Frequency-Inverse Document Frequency)**:

```python
# Combine text features
combined_features = title + description + category + level

# Vectorize
tfidf_matrix = TfidfVectorizer(max_features=1000).fit_transform(combined_features)
```

**Why TF-IDF?**
- Identifies important words in course descriptions
- Reduces weight of common words
- Creates numerical representation of text

### 2. Dimensionality Reduction

Uses **Truncated SVD** to reduce feature space:

```python
svd = TruncatedSVD(n_components=50)
course_features = svd.fit_transform(tfidf_matrix)
```

**Benefits:**
- Reduces computation time
- Removes noise
- Captures latent semantic relationships

### 3. Similarity Calculation

Computes **Cosine Similarity** between course vectors:

```python
similarities = cosine_similarity(course_vector, all_course_vectors)
```

**Cosine Similarity Formula:**
```
similarity(A, B) = (A · B) / (||A|| × ||B||)
```

Range: 0 (completely different) to 1 (identical)

---

## Recommendation Strategies

### For New Users (Cold Start)

**Problem:** No enrollment history

**Solution:** Popularity-based recommendations

```python
def get_popular_courses(limit=10):
    popularity_score = (enrollments_count × 0.7) + (average_rating × 100 × 0.3)
    return top_courses_by_popularity
```

**Weights:**
- 70% enrollment count (social proof)
- 30% average rating (quality)

### For Existing Users

**Strategy:** Content-based filtering

```python
def get_recommendations(user_id, limit=10):
    # 1. Get user's enrolled courses
    enrolled_courses = get_user_enrollments(user_id)
    
    # 2. Find similar courses for each enrolled course
    recommendations = []
    for course in enrolled_courses:
        similar = get_similar_courses(course.id, limit=3)
        recommendations.extend(similar)
    
    # 3. Remove duplicates and already enrolled
    unique_recs = filter_and_deduplicate(recommendations)
    
    # 4. Sort by similarity score
    return sorted(unique_recs, key=lambda x: x['score'], reverse=True)[:limit]
```

---

## API Endpoints

### Get Personalized Recommendations

**Endpoint:** `GET /api/recommendations/:userId?limit=10`

**Example Request:**
```bash
curl http://localhost:8000/api/recommendations/user-123?limit=5
```

**Response:**
```json
{
  "user_id": "user-123",
  "recommendations": [
    {
      "course_id": "course-456",
      "similarity_score": 0.92,
      "reason": "similar_to_enrolled"
    },
    {
      "course_id": "course-789",
      "similarity_score": 0.87,
      "reason": "similar_to_enrolled"
    }
  ]
}
```

### Get Similar Courses

**Endpoint:** `GET /api/similar-courses/:courseId?limit=5`

**Example Request:**
```bash
curl http://localhost:8000/api/similar-courses/course-123?limit=5
```

**Response:**
```json
{
  "course_id": "course-123",
  "similar_courses": [
    {
      "course_id": "course-456",
      "similarity_score": 0.95
    }
  ]
}
```

### Train Model

**Endpoint:** `POST /api/train`

**Example Request:**
```bash
curl -X POST http://localhost:8000/api/train
```

**When to Retrain:**
- New courses added
- Significant enrollment changes
- Scheduled (e.g., daily via cron)

---

## Performance Optimization

### 1. Caching

Cache computed similarities to avoid recalculation:

```python
from functools import lru_cache

@lru_cache(maxsize=1000)
def get_similar_courses(course_id, limit):
    # Cached for repeated requests
    pass
```

### 2. Batch Processing

Process recommendations in batches:

```python
# Instead of one-by-one
for user in users:
    get_recommendations(user.id)

# Batch process
get_batch_recommendations(user_ids)
```

### 3. Incremental Updates

Update model incrementally instead of full retraining:

```python
def update_model_with_new_course(course):
    # Add new course vector to existing model
    new_vector = tfidf_vectorizer.transform([course.combined_features])
    course_features = np.vstack([course_features, new_vector])
```

---

## Evaluation Metrics

### 1. Precision@K

Measures accuracy of top K recommendations:

```python
precision_at_k = (relevant_recommendations_in_top_k) / k
```

### 2. Recall@K

Measures coverage of relevant items:

```python
recall_at_k = (relevant_recommendations_in_top_k) / (total_relevant_items)
```

### 3. Mean Average Precision (MAP)

Average precision across all users:

```python
MAP = mean([precision_at_k for all users])
```

### 4. Click-Through Rate (CTR)

Real-world metric:

```python
CTR = (clicks_on_recommendations) / (total_recommendations_shown)
```

---

## Future Enhancements

### 1. Deep Learning

Implement neural collaborative filtering:

```python
from tensorflow.keras import Model, layers

class RecommenderNet(Model):
    def __init__(self, num_users, num_courses, embedding_size):
        super().__init__()
        self.user_embedding = layers.Embedding(num_users, embedding_size)
        self.course_embedding = layers.Embedding(num_courses, embedding_size)
        
    def call(self, inputs):
        user_vector = self.user_embedding(inputs[:, 0])
        course_vector = self.course_embedding(inputs[:, 1])
        return tf.reduce_sum(user_vector * course_vector, axis=1)
```

### 2. Contextual Bandits

Adapt recommendations based on user feedback:

```python
# Multi-armed bandit approach
def select_recommendation(user_context):
    # Balance exploration vs exploitation
    if random() < epsilon:
        return explore_new_course()
    else:
        return exploit_best_course()
```

### 3. Session-Based Recommendations

Use RNNs for sequential patterns:

```python
# Track user's learning path
user_sequence = [course1, course2, course3]
next_course = lstm_model.predict(user_sequence)
```

### 4. Multi-Modal Learning

Combine text, video thumbnails, and user demographics:

```python
# Text features
text_features = tfidf_vectorizer.transform(descriptions)

# Image features (from thumbnails)
image_features = cnn_model.predict(thumbnails)

# Combined features
combined = concatenate([text_features, image_features])
```

---

## Monitoring

### Track Recommendation Quality

```python
# Log recommendation events
{
  "user_id": "user-123",
  "recommended_courses": ["course-1", "course-2"],
  "clicked_course": "course-1",
  "enrolled": true,
  "timestamp": "2024-01-20T10:30:00Z"
}
```

### A/B Testing

Test different algorithms:

```python
if user_id % 2 == 0:
    recommendations = content_based_filter(user_id)
else:
    recommendations = collaborative_filter(user_id)
```

Compare metrics:
- Click-through rate
- Enrollment rate
- User satisfaction

---

## Troubleshooting

### Low Similarity Scores

**Problem:** All recommendations have low scores

**Solutions:**
- Increase `max_features` in TF-IDF
- Adjust SVD components
- Add more course metadata

### Cold Start for Courses

**Problem:** New courses not recommended

**Solutions:**
- Use course metadata (category, level)
- Implement content-based filtering
- Boost new courses temporarily

### Scalability Issues

**Problem:** Slow recommendations for large datasets

**Solutions:**
- Use approximate nearest neighbors (Annoy, FAISS)
- Implement caching
- Pre-compute similarities offline

---

## References

- [Recommender Systems Handbook](https://www.springer.com/gp/book/9780387858203)
- [Matrix Factorization Techniques](https://datajobs.com/data-science-repo/Recommender-Systems-[Netflix].pdf)
- [TF-IDF Documentation](https://scikit-learn.org/stable/modules/generated/sklearn.feature_extraction.text.TfidfVectorizer.html)
- [Cosine Similarity](https://en.wikipedia.org/wiki/Cosine_similarity)
