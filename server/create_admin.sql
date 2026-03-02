-- Create admin user SQL script
-- Run this in your MySQL database

INSERT INTO Users (id, name, email, password, role, isVerified, isApproved, createdAt, updatedAt)
VALUES (
    UUID(), 
    'Admin User', 
    'admin@ngwavha.com', 
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- password: admin123
    'admin', 
    true, 
    true, 
    NOW(), 
    NOW()
);

-- Verify the admin was created
SELECT id, name, email, role, isVerified, isApproved FROM Users WHERE role = 'admin';
