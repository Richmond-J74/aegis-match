# Auth-Gated App Testing Playbook (Emergent Google Auth + Email/Password)

## Step 1: Create Test User & Session (mongosh)
```
mongosh --eval "
use('test_database');
var userId = 'test-user-' + Date.now();
var sessionToken = 'test_session_' + Date.now();
db.users.insertOne({
  user_id: userId,
  email: 'test.user.' + Date.now() + '@example.com',
  name: 'Test User',
  role: 'client',
  picture: 'https://via.placeholder.com/150',
  onboarding_complete: true,
  created_at: new Date()
});
db.user_sessions.insertOne({
  user_id: userId,
  session_token: sessionToken,
  expires_at: new Date(Date.now() + 7*24*60*60*1000),
  created_at: new Date()
});
print('Session token: ' + sessionToken);
print('User ID: ' + userId);
"
```

## Step 2: Test Backend API
```
curl -X GET "$BASE/api/auth/me" -H "Authorization: Bearer YOUR_SESSION_TOKEN"
```

## Step 3: Browser Testing
Set cookie `session_token` (domain=app host, path=/, httpOnly, secure, sameSite=None), then navigate.

## Email/Password Bypass (for testing)
A dev login exists: POST /api/auth/register and POST /api/auth/login with {email,password}. These return a session_token stored in user_sessions the same way. Use for automated tests.

## Checklist
- User doc has user_id (custom UUID), _id excluded via projection.
- Session user_id matches user.user_id.
- /api/auth/me returns user (not 401).
- Dashboard loads without redirect.
- Callback detection uses useLocation().hash.
