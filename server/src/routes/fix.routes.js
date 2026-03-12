import { Router } from 'express'
import sequelize from '../config/mysql.js'

const router = Router()

// POST /api/fix/create-tables - Create all database tables
router.post('/create-tables', async (req, res) => {
  try {
    await sequelize.sync({ force: false })
    res.json({ success: true, message: 'All tables created/verified' })
  } catch (err) {
    console.error('Table creation error:', err)
    res.status(500).json({ success: false, error: err.message })
  }
})

// Basic health check for the fix route
router.get('/health', async (req, res) => {
  try {
    await sequelize.authenticate()
    res.json({ success: true, database: 'connected' })
  } catch (err) {
    res.status(500).json({ success: false, database: 'disconnected', error: err.message })
  }
})

export default router
