import fetch from 'node-fetch';

async function testUserCredentials() {
  console.log('🔐 Testing Your User Credentials...\n');
  
  const apiKey = 'AIzaSyAWsZzPo4uvUyzgsu-Phq64yHeRRDtTczE';
  
  // Test with your actual credentials
  const testCredentials = [
    { email: 'adi+testii33@gmail.com', password: 'Neo123456!' },
    { email: 'adikup@gmail.com', password: 'your-password' }, // Replace with actual password
  ];
  
  for (const cred of testCredentials) {
    console.log(`Testing: ${cred.email}`);
    
    try {
      const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: cred.email,
          password: cred.password,
          returnSecureToken: true
        })
      });
      
      const result = await response.json();
      
      if (result.localId) {
        console.log('✅ SUCCESS!');
        console.log('- User ID:', result.localId);
        console.log('- Email:', result.email);
        console.log('- Display Name:', result.displayName || 'Not set');
        console.log('- Email Verified:', result.emailVerified);
        console.log('');
      } else {
        console.log('❌ FAILED:', result.error?.message);
        console.log('');
      }
    } catch (error) {
      console.log('❌ ERROR:', error.message);
      console.log('');
    }
  }
  
  console.log('💡 If authentication fails, check:');
  console.log('1. User exists in Firebase Auth Console');
  console.log('2. Password is correct');
  console.log('3. User account is not disabled');
  console.log('4. Email is verified (if required)');
}

testUserCredentials();
