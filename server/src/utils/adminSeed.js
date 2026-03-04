export async function seedRailwayAdmin() {
  try {
    const { default: User } = await import('../models/User.js');
    const adminEmail = process.env.RAILWAY_ADMIN_EMAIL || process.env.railway_admin_email || 'admin@ngwavha.com';
    const adminPassword = process.env.RAILWAY_ADMIN_PASSWORD || process.env.railway_admin_password || 'admin123';
    let existing = await User.findOne({ where: { email: adminEmail } });
    if (!existing) {
      const { v4: uuidv4 } = await import('uuid');
      const bcrypt = (await import('bcryptjs')).default;
      const hashed = await bcrypt.hash(adminPassword, 10);
      await User.create({ id: uuidv4(), name: 'Railway Admin', email: adminEmail, password: hashed, role: 'admin', isVerified: true, isApproved: true });
      console.log('✅ Railway admin seeded:', adminEmail);
    } else {
      const bcrypt = (await import('bcryptjs')).default;
      const isMatch = await bcrypt.compare(adminPassword, existing.password);
      if (!isMatch) {
        const newHash = await bcrypt.hash(adminPassword, 10);
        await existing.update({ password: newHash, role: 'admin', isVerified: true, isApproved: true });
        console.log('🔐 Railway admin password updated from env var');
      } else {
        await existing.update({ role: 'admin', isVerified: true, isApproved: true });
        console.log('✅ Railway admin already exists:', adminEmail);
      }
    }
  } catch (err) {
    console.error('❗ Railway admin seed failed:', err?.message);
  }
}

export default { seedRailwayAdmin };
