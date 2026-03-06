import sequelize from '../config/mysql.js';

export async function up() {
    const queryInterface = sequelize.getQueryInterface();

    try {
        console.log('🔄 Starting Cascading Deletion Migrations...');

        // Helper to drop and recreate constraint with CASCADE
        const updateConstraint = async (tableName, columnName, refTable, refColumn, constraintName) => {
            console.log(`📦 Updating constraint for ${tableName}.${columnName}...`);
            try {
                // Drop existing FK if it exists
                await sequelize.query(`ALTER TABLE ${tableName} DROP FOREIGN KEY ${constraintName}`);
            } catch (err) {
                console.log(`⚠️ Note: Could not drop ${constraintName} (it might have a different name or not exist).`);
            }

            // Add new FK with CASCADE
            await sequelize.query(`
                ALTER TABLE ${tableName} 
                ADD CONSTRAINT ${constraintName} 
                FOREIGN KEY (${columnName}) 
                REFERENCES ${refTable}(${refColumn}) 
                ON DELETE CASCADE 
                ON UPDATE CASCADE
            `);
        };

        // 1. Courses (InstructorId -> Users)
        // Note: Constraint names in Sequelize are usually tableName_columnName_foreign_idx or similar
        // We'll try to use standard names or names found in describeTable
        await updateConstraint('Courses', 'instructorId', 'Users', 'id', 'Courses_instructorId_foreign_idx');

        // 2. Enrollments (userId -> Users)
        await updateConstraint('Enrollments', 'userId', 'Users', 'id', 'Enrollments_userId_foreign_idx');
        // 3. Enrollments (courseId -> Courses)
        await updateConstraint('Enrollments', 'courseId', 'Courses', 'id', 'Enrollments_courseId_foreign_idx');

        // 4. Reviews (userId -> Users)
        await updateConstraint('Reviews', 'userId', 'Users', 'id', 'Reviews_userId_foreign_idx');
        // 5. Reviews (courseId -> Courses)
        await updateConstraint('Reviews', 'courseId', 'Courses', 'id', 'Reviews_courseId_foreign_idx');

        // 6. Transactions (userId -> Users)
        await updateConstraint('Transactions', 'userId', 'Users', 'id', 'Transactions_userId_foreign_idx');

        // 7. CartItems (userId -> Users)
        await updateConstraint('CartItems', 'userId', 'Users', 'id', 'CartItems_userId_foreign_idx');
        // 8. WishlistItems (userId -> Users)
        await updateConstraint('WishlistItems', 'userId', 'Users', 'id', 'WishlistItems_userId_foreign_idx');

        console.log('✅ Cascading deletion constraints updated successfully.');
    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    }
}

export async function down() {
    // Optional rollback to SET NULL or RESTRICT
}

if (import.meta.url === `file://${process.argv[1]}`) {
    up().then(() => process.exit(0)).catch(() => process.exit(1));
}
