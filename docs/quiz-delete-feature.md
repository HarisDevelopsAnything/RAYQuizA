# Quiz Delete Feature Documentation

## Overview
Added the ability for quiz creators to delete their own quizzes from the system. This includes backend authorization checks to ensure only the quiz creator can delete their quizzes.

## Implementation Details

### Backend Changes

#### New API Endpoint
**Route:** `DELETE /api/quizzes/:quizId`

**Request Body:**
```json
{
  "userEmail": "user@example.com"
}
```

**Response (Success - 200):**
```json
{
  "message": "Quiz deleted successfully",
  "quizId": "507f1f77bcf86cd799439011"
}
```

**Error Responses:**
- `400`: User email is required
- `403`: User can only delete quizzes they created
- `404`: Quiz not found
- `500`: Server error

**Security:**
- Verifies the requesting user's email matches the quiz creator's email
- Prevents unauthorized deletion of quizzes
- Uses email-based authentication for consistency with other features

**Location:** `server/index.js` (lines ~282-330)

### Frontend Changes

#### 1. QuizCard Component (`src/components/home/QuizCard/QuizCard.tsx`)

**New Props:**
- `onClickDelete?: () => void` - Callback when delete button is clicked

**UI Changes:**
- Added delete button (trash icon) in top-right corner
- Delete button appears only when `onClickDelete` prop is provided
- Uses `IoTrash` icon from `react-icons/io5`
- Styled as a ghost button with red color palette
- Positioned absolutely to not interfere with card layout
- Click event stops propagation to prevent triggering card actions

**Styling:**
- Small size (`sm`) for compact appearance
- Ghost variant for minimal visual impact until hover
- Red color palette to indicate destructive action
- Position: `absolute`, `top: 2`, `right: 2`

#### 2. Quizzes Page (`src/pages/Home/Quizzes.tsx`)

**New State:**
- `deleteDialogOpen: boolean` - Controls confirmation dialog visibility
- `quizToDelete: Quiz | null` - Stores the quiz pending deletion

**New Functions:**

**`handleDeleteClick(quiz: Quiz)`**
- Sets the quiz to be deleted
- Opens the confirmation dialog

**`handleDeleteConfirm()`**
- Gets user email from localStorage
- Sends DELETE request to backend with quiz ID and user email
- Updates local state to remove deleted quiz (optimistic UI update)
- Shows success/error toast notification
- Closes dialog and clears state

**`handleDeleteCancel()`**
- Closes dialog without deleting
- Clears the quiz-to-delete state

**New UI Components:**
- Confirmation dialog using Chakra UI Dialog components
- Shows quiz title in confirmation message
- Two buttons: Cancel (outline) and Delete (red, solid)

**Imports Added:**
```typescript
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogActionTrigger,
  Button,
  DialogTitle,
} from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
```

## User Flow

1. **User views their quizzes** on the "My Quizzes" page
2. **Delete button appears** on each quiz card (trash icon in top-right)
3. **User clicks delete button** on a quiz they want to remove
4. **Confirmation dialog appears** with quiz title and warning message
5. **User confirms or cancels:**
   - **Cancel:** Dialog closes, no action taken
   - **Confirm:** 
     - Quiz is deleted from database
     - Quiz card is removed from UI
     - Success toast notification appears
6. **Error handling:** If deletion fails (e.g., not the creator), error toast appears

## Security Features

1. **Backend Verification:**
   - Checks if quiz exists before deletion
   - Verifies requesting user's email matches quiz creator's email
   - Returns 403 Forbidden if not authorized

2. **Frontend Protection:**
   - Requires user to be logged in (checks localStorage)
   - Shows error if user not authenticated

3. **Confirmation Dialog:**
   - Prevents accidental deletions
   - Shows quiz title for clarity
   - Requires explicit confirmation

## Technical Considerations

### Email-Based Authorization
- Consistent with existing authentication pattern
- Uses `createdByEmail` field from quiz document
- Ensures only quiz creator can delete their quizzes

### Optimistic UI Update
- Quiz removed from local state immediately after successful API call
- Provides instant feedback to user
- No need to refetch entire quiz list

### Error Handling
- Network errors caught and displayed via toast
- Server errors (403, 404) show specific error messages
- User-friendly error descriptions

## Testing Checklist

- [ ] Delete button appears on quiz cards
- [ ] Clicking delete opens confirmation dialog
- [ ] Cancel button closes dialog without deleting
- [ ] Confirm button successfully deletes quiz
- [ ] Quiz card removed from UI after deletion
- [ ] Success toast appears after deletion
- [ ] Error toast appears on failure
- [ ] Cannot delete quiz created by another user
- [ ] Cannot delete without being logged in
- [ ] Backend returns 403 for unauthorized deletion attempts
- [ ] Backend returns 404 for non-existent quizzes

## Future Enhancements

1. **Soft Delete:** Instead of permanent deletion, mark as deleted (allows recovery)
2. **Bulk Delete:** Select multiple quizzes to delete at once
3. **Archive Feature:** Move to archive instead of delete
4. **Undo Delete:** Brief window to undo deletion
5. **Delete Associated Data:** Also delete quiz history entries for deleted quizzes
6. **Admin Override:** Allow admins to delete any quiz

## Related Files

**Backend:**
- `server/index.js` - DELETE endpoint implementation

**Frontend:**
- `src/components/home/QuizCard/QuizCard.tsx` - Delete button UI
- `src/pages/Home/Quizzes.tsx` - Delete logic and confirmation dialog

**Dependencies:**
- `react-icons/io5` - IoTrash icon
- `@chakra-ui/react` - Dialog components
- `@/components/ui/toaster` - Toast notifications

## API Example Usage

```javascript
// Delete a quiz
const response = await fetch('https://rayquiza-backend.onrender.com/api/quizzes/507f1f77bcf86cd799439011', {
  method: 'DELETE',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    userEmail: 'creator@example.com'
  })
});

const result = await response.json();
// Success: { message: "Quiz deleted successfully", quizId: "..." }
// Error: { error: "You can only delete quizzes you created" }
```
