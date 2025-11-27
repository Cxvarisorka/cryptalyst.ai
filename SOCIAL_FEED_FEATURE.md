# Social Feed Feature Documentation

## Overview
A complete social networking feature has been added to Cryptalyst.ai, allowing users to create posts about coins and stocks, upload images, add tags, like posts, comment, and share on other platforms - similar to Binance's social feed.

## Features

### 📝 Post Creation
- Create posts about specific coins or stocks
- Rich text content (up to 5000 characters)
- Upload up to 4 images per post (max 5MB each)
- Add tags (up to 10 tags per post)
- Privacy controls: Public, Followers Only, or Private
- Support for JPEG, JPG, PNG, and WebP images

### 💬 Comments & Replies
- Comment on posts
- Reply to comments (nested replies)
- Edit and delete your own comments
- Like comments
- Real-time comment count updates

### ❤️ Likes & Engagement
- Like/unlike posts and comments
- View who liked a post
- Real-time like count updates
- Share posts on social platforms or copy link

### 🔍 Feed Features
- Browse all public posts
- Filter by asset type (crypto/stock)
- Sort by: Latest, Most Liked, Most Discussed
- Search posts by content, tags, or asset symbols
- Pagination with "Load More"
- Infinite scroll support

### 🎨 UI/UX
- Clean, modern dark theme design
- Responsive layout (mobile-friendly)
- Image galleries with grid layout
- Real-time interactions
- Smooth animations and transitions

## Architecture

### Backend (Express.js + MongoDB)

#### Models
1. **Post Model** (`/server/src/models/post.model.js`)
   - Asset information (symbol, name, type, image)
   - Content, images, tags
   - Engagement metrics (likes, comments, shares)
   - Privacy settings
   - Timestamps and moderation flags

2. **Comment Model** (`/server/src/models/comment.model.js`)
   - Post reference
   - User reference
   - Content
   - Parent comment support (for replies)
   - Like count

3. **Like Model** (`/server/src/models/like.model.js`)
   - Post/Comment reference
   - User reference
   - Automatic count updates via middleware

#### API Endpoints

**Posts**
- `POST /api/posts` - Create a new post (protected, with file upload)
- `GET /api/posts/feed` - Get feed posts with filters
- `GET /api/posts/:id` - Get single post
- `PATCH /api/posts/:id` - Update post (protected)
- `DELETE /api/posts/:id` - Delete post (protected)
- `POST /api/posts/:id/share` - Increment share count
- `GET /api/posts/asset/:symbol` - Get posts by asset
- `GET /api/posts/user/:userId` - Get posts by user
- `GET /api/posts/search?q=query` - Search posts

**Comments**
- `POST /api/posts/:postId/comments` - Create comment (protected)
- `GET /api/posts/:postId/comments` - Get comments for post
- `PATCH /api/comments/:id` - Update comment (protected)
- `DELETE /api/comments/:id` - Delete comment (protected)
- `GET /api/comments/:id/replies` - Get replies

**Likes**
- `POST /api/posts/:postId/like` - Toggle like on post (protected)
- `GET /api/posts/:postId/like/status` - Check if user liked post
- `GET /api/posts/:postId/likes` - Get users who liked post
- `POST /api/comments/:commentId/like` - Toggle like on comment (protected)

#### Services
- **Post Service** (`/server/src/services/post.service.js`)
  - Business logic for CRUD operations
  - Feed aggregation with filters
  - Search functionality
  - Image upload/deletion handling

#### File Upload
- **Multer** - Handle multipart form data
- **Cloudinary** - Cloud storage for images
  - Automatic image optimization
  - Responsive image transformations
  - Max dimensions: 1200x1200px
  - Format: Auto (WebP when supported)

### Frontend (React + Vite)

#### Components

1. **PostCreationForm** (`/client/src/components/posts/PostCreationForm.jsx`)
   - Asset selection (symbol, name, type)
   - Content editor with character count
   - Image upload with preview
   - Tag management
   - Visibility settings

2. **PostCard** (`/client/src/components/posts/PostCard.jsx`)
   - Display post with user info
   - Image gallery (responsive grid)
   - Like, comment, share buttons
   - Author actions (edit, delete)
   - Timestamp and visibility indicators

3. **CommentSection** (`/client/src/components/posts/CommentSection.jsx`)
   - Comment list with nested replies
   - Create/edit/delete comments
   - Like comments
   - Reply to comments
   - Pagination

#### Pages
- **SocialFeed** (`/client/src/pages/SocialFeed.jsx`)
  - Main feed page at `/feed`
  - Create post dialog
  - Filter and search
  - Post list with pagination
  - Comments dialog

#### Services
- **Post Service** (`/client/src/services/post.service.js`)
  - API client for all post operations
  - FormData handling for file uploads
  - Axios configuration with credentials

## Setup Instructions

### 1. Install Dependencies

**Backend:**
```bash
cd server
npm install
```
The following packages were added:
- `multer` - File upload middleware
- `cloudinary` - Cloud storage

**Frontend:**
```bash
cd client
npm install
```
The following package was added:
- `date-fns` - Date formatting

### 2. Cloudinary Configuration

1. Sign up for a free account at [https://cloudinary.com/](https://cloudinary.com/)
2. Get your credentials from the dashboard:
   - Cloud Name
   - API Key
   - API Secret

3. Add to `server/.env`:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Start the Application

**Backend:**
```bash
cd server
npm run dev
```

**Frontend:**
```bash
cd client
npm run dev
```

## Usage

### Creating a Post

1. Navigate to `/feed` (protected route - requires login)
2. Click "Create Post" button
3. Fill in the form:
   - Select asset type (Crypto or Stock)
   - Enter symbol (e.g., BTC, AAPL)
   - Enter asset name (e.g., Bitcoin, Apple)
   - Write your content
   - (Optional) Add up to 4 images
   - (Optional) Add tags
   - Select visibility
4. Click "Post"

### Interacting with Posts

- **Like:** Click the heart icon
- **Comment:** Click the comment icon to open comments dialog
- **Share:** Click the share icon (uses native share API or copies link)
- **Delete:** Click the three dots menu (only for your posts)

### Filtering Feed

- **Asset Type:** Filter by Crypto or Stock
- **Sort By:** Latest, Most Liked, or Most Discussed
- **Search:** Enter keywords, tags, or asset symbols

## Security Features

### Input Validation
- File type validation (only images)
- File size limits (5MB per image)
- Content length limits (5000 chars for posts, 2000 for comments)
- Tag limits (10 per post, 30 chars each)
- XSS protection via sanitization

### Authorization
- JWT-based authentication
- User ownership checks for edit/delete operations
- Protected routes require authentication
- Privacy controls (public, followers, private)

### Rate Limiting
- Existing rate limiting applies to all endpoints
- Prevents spam and abuse

## Database Indexes

Optimized queries with compound indexes:
- `asset.symbol + createdAt` - Posts by asset
- `userId + createdAt` - User's posts
- `createdAt` - Recent posts
- `tags + createdAt` - Posts by tag
- `postId + createdAt` - Comments for post
- `postId + userId` - Unique likes

## File Structure

```
server/
├── src/
│   ├── models/
│   │   ├── post.model.js
│   │   ├── comment.model.js
│   │   └── like.model.js
│   ├── controllers/
│   │   ├── post.controller.js
│   │   ├── comment.controller.js
│   │   └── like.controller.js
│   ├── routes/
│   │   ├── post.routes.js
│   │   ├── comment.routes.js
│   │   └── like.routes.js
│   ├── services/
│   │   └── post.service.js
│   ├── middleware/
│   │   └── upload.middleware.js
│   └── config/
│       └── cloudinary.js

client/
├── src/
│   ├── components/
│   │   └── posts/
│   │       ├── PostCreationForm.jsx
│   │       ├── PostCard.jsx
│   │       └── CommentSection.jsx
│   ├── pages/
│   │   └── SocialFeed.jsx
│   └── services/
│       └── post.service.js
```

## Best Practices Implemented

### Code Quality
- ✅ Clean, readable code with descriptive variable names
- ✅ Comprehensive JSDoc comments
- ✅ Modular component structure
- ✅ Separation of concerns (service layer, controllers, models)
- ✅ Consistent error handling
- ✅ Input validation at multiple layers

### Performance
- ✅ Database indexing for fast queries
- ✅ Pagination to limit data transfer
- ✅ Image optimization via Cloudinary
- ✅ Lean queries for better performance
- ✅ Efficient state management

### Security
- ✅ JWT authentication
- ✅ User authorization checks
- ✅ File upload validation
- ✅ XSS protection
- ✅ Rate limiting
- ✅ HttpOnly cookies

### User Experience
- ✅ Responsive design
- ✅ Loading states
- ✅ Error messages
- ✅ Smooth animations
- ✅ Real-time updates
- ✅ Mobile-friendly interface

## Future Enhancements

Potential improvements:
- Real-time updates with WebSockets
- Following/followers system
- Notifications
- Post bookmarks/saves
- Trending posts algorithm
- Hashtag pages
- User mentions
- Post editing
- Rich text editor
- GIF support
- Video uploads
- Post analytics
- Content moderation tools
- Report functionality

## Troubleshooting

### Images not uploading
- Check Cloudinary credentials in `.env`
- Verify file size is under 5MB
- Ensure file type is image (JPEG, PNG, WebP)

### Posts not appearing
- Check if user is authenticated
- Verify backend server is running
- Check browser console for errors
- Ensure MongoDB is connected

### Comments not loading
- Check post ID is valid
- Verify user has permission to view post
- Check network requests in browser DevTools

## Support

For issues or questions:
1. Check the browser console for errors
2. Check server logs for backend errors
3. Verify environment variables are set correctly
4. Ensure all dependencies are installed

---

**Built with ❤️ using React, Express, MongoDB, and Cloudinary**
