import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import fs from 'fs';

const run = async () => {
    try {
        const id = crypto.randomUUID();
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash('AdminPass123!', salt);

        const sql = `INSERT INTO user (id, name, email, password, role, is_verified, created_at, createdAt, updated_at, updatedAt) VALUES ('${id}', 'System Admin', 'admin@ngwavha.com', '${hash}', 'admin', 1, NOW(), NOW(), NOW(), NOW());`;

        console.log(sql);
        fs.writeFileSync('admin_insert.sql', sql);
        console.log('SQL written to admin_insert.sql');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

run();
