export async function seedRailwayAdmin() {
  try {
    const { default: User } = await import('../models/User.js');

    // Support multiple env var names for flexibility
    const adminEmail = process.env.RAILWAY_ADMIN_EMAIL ||
      process.env.ADMIN_EMAIL ||
      process.env.railway_admin_email ||
      'admin@ngwavha.com';

    const adminPassword = process.env.RAILWAY_ADMIN_PASSWORD ||
      process.env.ADMIN_PASSWORD ||
      process.env.railway_admin_password ||
      'admin123';

    let existing = await User.findOne({ where: { email: adminEmail } });

    if (!existing) {
      const { v4: uuidv4 } = await import('uuid');
      // DO NOT hash here. User model beforeCreate hook handles it.
      await User.create({
        id: uuidv4(),
        name: 'Railway Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        isVerified: true,
        isApproved: true
      });
      console.log('✅ Railway admin seeded:', adminEmail);
    } else {
      // Logic to sync password if env var changed or if forcing reset
      const isMatch = await existing.matchPassword(adminPassword);
      const FORCE = (process.env.FORCE_RAILWAY_ADMIN_RESET === 'true');

      if (FORCE || !isMatch) {
        // DO NOT hash here. User model beforeUpdate hook handles it.
        await existing.update({
          password: adminPassword,
          role: 'admin',
          isVerified: true,
          isApproved: true
        });
        console.log('🔐 Railway admin credentials updated/synced from env vars');
      } else {
        await existing.update({ role: 'admin', isVerified: true, isApproved: true });
        console.log('✅ Railway admin already exists and matches env:', adminEmail);
      }
    }
  } catch (err) {
    console.error('❗ Railway admin seed failed:', err?.message);
  }
}

export default { seedRailwayAdmin };
