# Demo Login Instructions

## Quick Demo Authentication

Since this is for testing the job swiping and automation integration, here are demo credentials you can use:

### Test User Credentials
- **Email**: `demo@jobswipe.com`
- **Password**: `demo123456`

### How to Use:
1. Go to `/auth/signin` page
2. Enter the demo credentials above
3. Click "Sign in securely"
4. You'll be redirected to `/jobs` page
5. Now you can swipe right on jobs and test the automation!

### If Demo User Doesn't Exist:
If the demo user doesn't exist in the backend database, you have a few options:

1. **Register a new account**: Go to `/auth/signup` and create a test account
2. **Use existing credentials**: If you have existing credentials, use those
3. **Check backend logs**: Make sure the Fastify API server is running on `http://localhost:3001`

### Testing the Integration:
Once logged in:
1. Go to `/jobs` page
2. You should see job cards
3. Swipe right on a job
4. Check browser console for automation progress
5. Check WebSocket connection for real-time updates

### Backend Requirements:
Make sure you have:
- Fastify API server running on port 3001
- Database with job data
- Redis for queue processing
- WebSocket connections working

---

**Note**: This is just for testing the authentication and job swiping integration we just implemented!