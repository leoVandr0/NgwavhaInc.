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

export default router
