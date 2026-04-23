async function test() {
  try {
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@mail.com', password: 'pass' })
    });
    
    if (!loginRes.ok) {
        throw new Error('Login failed with status ' + loginRes.status);
    }
    
    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log('Login successful, token length:', token.length);
    
    const notifRes = await fetch('http://localhost:5000/api/notifications', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const notifData = await notifRes.json();
    console.log('Notifications status:', notifRes.status);
    console.log('Notifications data:', notifData);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

test();
