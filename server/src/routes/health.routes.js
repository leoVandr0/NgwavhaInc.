import express from 'express'
import sequelize from '../config/mysql.js'

const router = express.Router()

router.get('/health', async (req, res) => {
  try {
    await sequelize.authenticate()
    res.json({ ok: true, status: 'db_connected' })
  } catch (err) {
    res.status(500).json({ ok: false, status: 'db_error', error: err?.message, stack: err?.stack })
  }
})

// Create Users table via POST to /api/health
router.post('/health', async (req, res) => {
  try {
    console.log('🚨 Creating Users table via health endpoint...')
    
    // Create Users table directly
    await sequelize.query(`
        CREATE TABLE IF NOT EXISTS Users (
            id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255),
            googleId VARCHAR(255) UNIQUE,
            isGoogleUser BOOLEAN DEFAULT FALSE,
            role ENUM('student', 'instructor', 'admin') DEFAULT 'student',
            avatar VARCHAR(255) DEFAULT 'default-avatar.png',
            bio TEXT,
            headline VARCHAR(255),
            website VARCHAR(255),
            twitter VARCHAR(255),
            linkedin VARCHAR(255),
            youtube VARCHAR(255),
            isActive BOOLEAN DEFAULT TRUE,
            emailVerified BOOLEAN DEFAULT FALSE,
            lastLogin DATETIME,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `)
    
    console.log('✅ Users table created via health endpoint')
    
    res.json({ 
      ok: true, 
      status: 'users_table_created',
      message: 'Users table created successfully',
      timestamp: new Date().toISOString()
    })
    
  } catch (err) {
    console.error('❌ Users table creation failed:', err)
    res.status(500).json({ 
      ok: false, 
      status: 'creation_error', 
      error: err?.message, 
      stack: err?.stack 
    })
  }
})

export default router
