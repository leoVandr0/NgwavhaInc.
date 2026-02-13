// Test login endpoint
import fetch from 'node-fetch';

const testLogin = async () => {
    try {
        console.log('Testing login endpoint...');
        
        const response = await fetch('http://localhost:8080/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'testpassword'
            })
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers.raw());
        
        const text = await response.text();
        console.log('Response body:', text);
        
        if (response.ok) {
            const data = JSON.parse(text);
            console.log('Login successful:', data);
        } else {
            console.error('Login failed:', text);
        }
    } catch (error) {
        console.error('Test error:', error);
    }
};

testLogin();
