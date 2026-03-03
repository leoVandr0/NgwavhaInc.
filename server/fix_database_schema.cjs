const mysql = require('mysql2/promise');

async function fixDatabaseSchema() {
    try {
        console.log('🔧 Fixing database schema...');
        
        // Connect to MySQL
        const connection = await mysql.createConnection({
            host: process.env.MYSQLHOST || 'localhost',
            port: process.env.MYSQLPORT || 3306,
            user: process.env.MYSQLUSER || 'root',
            password: process.env.MYSQLPASSWORD || '',
            database: process.env.MYSQLDATABASE || 'ngwavha'
        });

        console.log('✅ Connected to MySQL');

        // Check if tables exist
        const [tables] = await connection.execute(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = ?
        `, [process.env.MYSQLDATABASE || 'ngwavha']);

        const existingTables = tables.map(t => t[0]).sort();

        console.log('📋 Existing tables:', existingTables);

        // Create tables if they don't exist
        if (!existingTables.includes('users')) {
            console.log('🔧 Creating users table...');
            await connection.execute(`
                CREATE TABLE IF NOT EXISTS users (
                    id CHAR(36) PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    email VARCHAR(255) NOT NULL UNIQUE,
                    password VARCHAR(255) DEFAULT NULL,
                    role ENUM('student', 'instructor', 'admin') DEFAULT 'student',
                    avatar VARCHAR(255) DEFAULT 'default-avatar.png',
                    bio TEXT DEFAULT NULL,
                    headline VARCHAR(255) DEFAULT NULL,
                    website VARCHAR(255) DEFAULT NULL,
                    twitter VARCHAR(255) DEFAULT NULL,
                    linkedin VARCHAR(255) DEFAULT NULL,
                    youtube VARCHAR(255) DEFAULT NULL,
                    is_verified TINYINT(1) DEFAULT 0,
                    is_approved TINYINT(1) DEFAULT 0,
                    approved_at DATETIME DEFAULT NULL,
                    approved_by CHAR(36) DEFAULT NULL,
                    reset_password_token VARCHAR(255) DEFAULT NULL,
                    reset_password_expire DATETIME DEFAULT NULL,
                    stripe_customer_id VARCHAR(255) DEFAULT NULL,
                    stripe_account_id VARCHAR(255) DEFAULT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    skills TEXT DEFAULT NULL,
                    certifications TEXT DEFAULT NULL,
                    experience TEXT DEFAULT NULL,
                    google_id VARCHAR(255) DEFAULT NULL UNIQUE,
                    is_google_user TINYINT(1) DEFAULT 0,
                    notification_preferences JSON DEFAULT NULL,
                    phone_number VARCHAR(255) DEFAULT NULL,
                    whatsapp_number VARCHAR(255) DEFAULT NULL
                )
            `);
            console.log('✅ Users table created');
        }

        if (!existingTables.includes('courses')) {
            console.log('🔧 Creating courses table...');
            await connection.execute(`
                CREATE TABLE IF NOT EXISTS courses (
                    id CHAR(36) PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    slug VARCHAR(255) NOT NULL UNIQUE,
                    subtitle VARCHAR(255) DEFAULT NULL,
                    description TEXT DEFAULT NULL,
                    price DECIMAL(10,2) DEFAULT NULL,
                    estimated_price DECIMAL(10,2) DEFAULT NULL,
                    thumbnail VARCHAR(255) DEFAULT NULL,
                    video_preview TEXT DEFAULT NULL,
                    preview_video_path VARCHAR(255) DEFAULT NULL,
                    preview_video_duration INT DEFAULT NULL,
                    preview_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
                    preview_uploaded_at DATETIME DEFAULT NULL,
                    preview_uploaded_by CHAR(36) DEFAULT NULL,
                    preview_approved_at DATETIME DEFAULT NULL,
                    preview_approved_by CHAR(36) DEFAULT NULL,
                    preview_reject_reason TEXT DEFAULT NULL,
                    level ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
                    language VARCHAR(50) DEFAULT 'english',
                    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
                    published_at DATETIME DEFAULT NULL,
                    total_duration INT DEFAULT 0,
                    total_lectures INT DEFAULT 0,
                    average_rating DECIMAL(3,2) DEFAULT 0,
                    ratings_count INT DEFAULT 0,
                    enrollments_count INT DEFAULT 0,
                    mongo_content_id VARCHAR(255) DEFAULT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    instructor_id CHAR(36) DEFAULT NULL,
                    category_id CHAR(36) DEFAULT NULL
                )
            `);
            console.log('✅ Courses table created');
        }

        if (!existingTables.includes('enrollments')) {
            console.log('🔧 Creating enrollments table...');
            await connection.execute(`
                CREATE TABLE IF NOT EXISTS enrollments (
                    id CHAR(36) PRIMARY KEY,
                    progress INT DEFAULT 0,
                    completed_lectures INT DEFAULT 0,
                    last_accessed_at DATETIME DEFAULT NULL,
                    is_completed TINYINT(1) DEFAULT 0,
                    completed_at DATETIME DEFAULT NULL,
                    certificate_url VARCHAR(255) DEFAULT NULL,
                    price_paid DECIMAL(10,2) DEFAULT 0,
                    payment_id VARCHAR(255) DEFAULT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    user_id CHAR(36) DEFAULT NULL,
                    course_id CHAR(36) DEFAULT NULL
                )
            `);
            console.log('✅ Enrollments table created');
        }

        if (!existingTables.includes('categories')) {
            console.log('🔧 Creating categories table...');
            await connection.execute(`
                CREATE TABLE IF NOT EXISTS categories (
                    id CHAR(36) PRIMARY KEY,
                    name VARCHAR(255) NOT NULL UNIQUE,
                    slug VARCHAR(255) NOT NULL UNIQUE,
                    icon VARCHAR(255) DEFAULT NULL,
                    parent_id CHAR(36) DEFAULT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            `);
            console.log('✅ Categories table created');
        }

        console.log('🎉 Database schema fixed!');
        await connection.end();
        
    } catch (error) {
        console.error('❌ Error fixing database schema:', error);
        process.exit(1);
    }
}

fixDatabaseSchema();
