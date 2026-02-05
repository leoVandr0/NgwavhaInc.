-- Create admin user script
-- Run this in your MySQL database to create an admin user

-- Insert admin user (password will be automatically hashed by the beforeCreate hook)
INSERT INTO Users (
    id, 
    name, 
    email, 
    password, 
    role, 
    isVerified, 
    createdAt, 
    updatedAt
) VALUES (
    UUID(), -- Generate a UUID
    'Admin User', -- Display name
    'admin@ngwavha.com', -- Email
    'admin123', -- Plain text password (will be hashed)
    'admin', -- Role
    1, -- Verified
    NOW(), -- Created at
    NOW()  -- Updated at
);

-- Alternative: Update existing user to admin role
-- UPDATE Users SET role = 'admin', isVerified = 1 WHERE email = 'your-email@example.com';
