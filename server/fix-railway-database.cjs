// Railway Database Schema Fix
// Run this in Railway console to add missing columns

const mysql = require('mysql2/promise');

async function fixRailwayDatabase() {
    try {
        console.log('🔧 Fixing Railway database schema...');
        
        // Connect to Railway database
        const connection = await mysql.createConnection({
            host: process.env.MYSQLHOST,
            port: process.env.MYSQLPORT || 3306,
            user: process.env.MYSQLUSER,
            password: process.env.MYSQLPASSWORD,
            database: process.env.MYSQLDATABASE
        });

        console.log('✅ Connected to Railway MySQL');

        // Add missing instructor approval columns
        const columnsToAdd = [
            {
                name: 'is_rejected',
                sql: `ALTER TABLE users ADD COLUMN is_rejected BOOLEAN DEFAULT FALSE COMMENT 'For instructors - marked as rejected by admin'`
            },
            {
                name: 'rejected_at',
                sql: `ALTER TABLE users ADD COLUMN rejected_at DATETIME NULL COMMENT 'When instructor was rejected by admin'`
            },
            {
                name: 'rejected_by',
                sql: `ALTER TABLE users ADD COLUMN rejected_by UUID NULL COMMENT 'Admin who rejected the instructor'`
            },
            {
                name: 'rejection_reason',
                sql: `ALTER TABLE users ADD COLUMN rejection_reason TEXT NULL COMMENT 'Reason for rejecting instructor application'`
            }
        ];

        for (const column of columnsToAdd) {
            try {
                await connection.execute(column.sql);
                console.log(`✅ Added column: ${column.name}`);
            } catch (error) {
                if (error.code === 'ER_DUP_FIELDNAME') {
                    console.log(`ℹ️ Column ${column.name} already exists`);
                } else {
                    console.error(`❌ Error adding ${column.name}:`, error.message);
                }
            }
        }

        // Verify columns were added
        const [columns] = await connection.execute(
            `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
             WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' 
             AND COLUMN_NAME IN ('is_rejected', 'rejected_at', 'rejected_by', 'rejection_reason')`,
            [process.env.MYSQLDATABASE]
        );

        console.log('✅ Current instructor approval columns:');
        columns.forEach(col => {
            console.log(`   - ${col.COLUMN_NAME}`);
        });

        await connection.end();

        console.log('🎉 Railway database schema fixed!');
        console.log('📧 Instructor registration should now work');
        
        return { success: true };

    } catch (error) {
        console.error('❌ Error fixing Railway database:', error);
        return { success: false, error: error.message };
    }
}

module.exports = { fixRailwayDatabase };

// Auto-run if called directly
if (require.main === module) {
    fixRailwayDatabase();
}
