import AuditLog from '../models/AuditLog.js';

export async function logAdminAction(params) {
  try {
    await AuditLog.create({ ...params, timestamp: new Date() });
  } catch (err) {
    console.error('Audit.logAdminAction failed:', err?.message);
  }
}

export default { logAdminAction };
