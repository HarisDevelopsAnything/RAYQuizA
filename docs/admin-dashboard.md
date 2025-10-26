# Admin Dashboard Documentation

## Overview

The Admin Dashboard provides comprehensive administrative controls for managing users, quizzes, and monitoring system statistics.

## Access

- **URL**: `/admin`
- **Authentication**: Only users with admin email addresses can access this dashboard
- Admin emails are configured in `server/admin-routes.js` in the `ADMIN_EMAILS` array

## Features

### 1. System Statistics (Dashboard Cards)

- **Total Users**: Count of all registered users
- **Total Quizzes**: Count of all created quizzes
- **Banned Users**: Count of currently banned users
- **Quizzes Today**: Count of quizzes created today

### 2. User Management

- **View All Users**: See list of all registered users with their:
  - Name
  - Email address
  - Join date
  - Status (Active/Banned)
- **Search Users**: Filter users by name or email
- **Ban/Unban Users**: Toggle user ban status
  - Banned users are prevented from accessing the system
  - Ban timestamp is recorded
- **Delete Users**: Permanently remove users from the system
  - Also deletes all quizzes created by that user
  - Requires confirmation

### 3. Quiz Management

- **View All Quizzes**: See complete list of quizzes with:
  - Title
  - Quiz code
  - Creator name and email
  - Question count
  - Creation date
- **Search Quizzes**: Filter by title, code, or creator
- **Delete Quizzes**: Remove quizzes from the system
  - Requires confirmation

### 4. Real-time Updates

- **Refresh Button**: Manually refresh all data
- Data is automatically loaded when accessing the dashboard

## Configuration

### Adding Admin Users

Edit `server/admin-routes.js`:

```javascript
const ADMIN_EMAILS = [
  "harisdevelops@gmail.com",
  "your-admin-email@example.com", // Add more admin emails here
];
```

### API Endpoints

All endpoints require admin authentication (admin email in request):

- `POST /api/admin/verify` - Verify admin access
- `GET /api/admin/users` - Get all users
- `GET /api/admin/quizzes` - Get all quizzes
- `GET /api/admin/stats` - Get system statistics
- `PATCH /api/admin/users/:id/ban` - Ban/unban a user
- `DELETE /api/admin/users/:id` - Delete a user
- `DELETE /api/admin/quizzes/:id` - Delete a quiz
- `PATCH /api/admin/users/:id/credentials` - Update user credentials (implemented but not yet in UI)

## Security

- **Email-based Authentication**: Only users with emails in the `ADMIN_EMAILS` list can access admin features
- **Verification on Every Request**: Each API call verifies the admin email
- **User Confirmation**: Destructive actions (delete) require user confirmation
- **Access Redirection**: Non-admin users are automatically redirected to home page

## Usage

1. **Login**: Login with your Google account (must be an admin email)
2. **Navigate**: Go to `/admin` in your browser
3. **Manage**: Use the tabs to switch between Users and Quizzes
4. **Search**: Use the search bar to filter results
5. **Actions**: Click action buttons to ban/unban or delete items
6. **Refresh**: Click the refresh button to reload latest data

## Notes

- Deleting a user also deletes all their quizzes
- Banned users cannot login or access the system
- All actions are logged in the server console
- The dashboard shows real-time data from the MongoDB database
