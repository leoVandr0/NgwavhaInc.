import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.decomposition import TruncatedSVD
import mysql.connector
from pymongo import MongoClient
import os

class RecommendationService:
    def __init__(self):
        self.mysql_conn = None
        self.mongo_client = None
        self.tfidf_vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')
        self.svd = TruncatedSVD(n_components=50)
        self.course_features = None
        self.course_ids = None
        
    def connect_databases(self):
        """Connect to MySQL and MongoDB"""
        try:
            # MySQL connection
            self.mysql_conn = mysql.connector.connect(
                host=os.getenv('MYSQL_HOST', 'localhost'),
                user=os.getenv('MYSQL_USER', 'root'),
                password=os.getenv('MYSQL_PASSWORD', ''),
                database=os.getenv('MYSQL_DATABASE', 'skillforge')
            )
            
            # MongoDB connection
            mongo_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/')
            self.mongo_client = MongoClient(mongo_uri)
            
            print("✅ Connected to databases")
        except Exception as e:
            print(f"❌ Database connection failed: {e}")
            raise
    
    def get_course_data(self):
        """Fetch course data from MySQL and MongoDB"""
        if not self.mysql_conn:
            self.connect_databases()
        
        cursor = self.mysql_conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT c.id, c.title, c.description, c.level, c.average_rating, 
                   c.enrollments_count, cat.name as category
            FROM Course c
            LEFT JOIN Category cat ON c.category_id = cat.id
            WHERE c.status = 'published'
        """)
        courses = cursor.fetchall()
        cursor.close()
        
        return pd.DataFrame(courses)
    
    def get_user_enrollments(self, user_id):
        """Get user's enrollment history"""
        if not self.mysql_conn:
            self.connect_databases()
        
        cursor = self.mysql_conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT e.course_id, e.progress, e.is_completed, c.category_id
            FROM Enrollment e
            JOIN Course c ON e.course_id = c.id
            WHERE e.user_id = %s
        """, (user_id,))
        enrollments = cursor.fetchall()
        cursor.close()
        
        return pd.DataFrame(enrollments)
    
    def train_model(self):
        """Train the recommendation model using course features"""
        print("🔄 Training recommendation model...")
        
        # Get course data
        courses_df = self.get_course_data()
        
        if courses_df.empty:
            print("⚠️  No courses found for training")
            return
        
        # Create combined text features
        courses_df['combined_features'] = (
            courses_df['title'].fillna('') + ' ' +
            courses_df['description'].fillna('') + ' ' +
            courses_df['category'].fillna('') + ' ' +
            courses_df['level'].fillna('')
        )
        
        # TF-IDF vectorization
        tfidf_matrix = self.tfidf_vectorizer.fit_transform(courses_df['combined_features'])
        
        # Dimensionality reduction
        self.course_features = self.svd.fit_transform(tfidf_matrix)
        self.course_ids = courses_df['id'].values
        
        print(f"✅ Model trained with {len(courses_df)} courses")
    
    def get_similar_courses(self, course_id, limit=5):
        """Get similar courses using content-based filtering"""
        if self.course_features is None:
            self.train_model()
        
        try:
            # Find course index
            course_idx = np.where(self.course_ids == course_id)[0][0]
            
            # Calculate cosine similarity
            course_vector = self.course_features[course_idx].reshape(1, -1)
            similarities = cosine_similarity(course_vector, self.course_features)[0]
            
            # Get top similar courses (excluding the course itself)
            similar_indices = similarities.argsort()[::-1][1:limit+1]
            
            return [
                {
                    'course_id': str(self.course_ids[idx]),
                    'similarity_score': float(similarities[idx])
                }
                for idx in similar_indices
            ]
        except Exception as e:
            print(f"Error getting similar courses: {e}")
            return []
    
    def get_recommendations(self, user_id, limit=10):
        """
        Get personalized recommendations using hybrid approach:
        1. Collaborative filtering based on user history
        2. Content-based filtering
        3. Popularity-based recommendations
        """
        if self.course_features is None:
            self.train_model()
        
        # Get user's enrollment history
        user_enrollments = self.get_user_enrollments(user_id)
        
        if user_enrollments.empty:
            # New user - return popular courses
            return self._get_popular_courses(limit)
        
        # Get courses similar to what user has enrolled in
        enrolled_course_ids = user_enrollments['course_id'].values
        recommendations = []
        
        for course_id in enrolled_course_ids:
            similar = self.get_similar_courses(course_id, limit=3)
            recommendations.extend(similar)
        
        # Remove duplicates and sort by score
        seen = set()
        unique_recommendations = []
        for rec in recommendations:
            if rec['course_id'] not in seen and rec['course_id'] not in enrolled_course_ids:
                seen.add(rec['course_id'])
                unique_recommendations.append(rec)
        
        # Sort by similarity score
        unique_recommendations.sort(key=lambda x: x['similarity_score'], reverse=True)
        
        return unique_recommendations[:limit]
    
    def _get_popular_courses(self, limit=10):
        """Get popular courses for new users"""
        courses_df = self.get_course_data()
        
        # Sort by enrollments and rating
        courses_df['popularity_score'] = (
            courses_df['enrollments_count'] * 0.7 +
            courses_df['average_rating'] * 100 * 0.3
        )
        
        popular = courses_df.nlargest(limit, 'popularity_score')
        
        return [
            {
                'course_id': str(row['id']),
                'similarity_score': 1.0,
                'reason': 'popular'
            }
            for _, row in popular.iterrows()
        ]
