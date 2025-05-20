# PhotoShare

A simplified Instagram clone implementing core features of photo sharing and social interaction.

## Features

- User authentication (register, login)
- Photo uploads with captions
- Feed to view photos from followed users
- Like and comment functionality
- Follow/unfollow users
- User profiles
- Dark/light mode
- Responsive design for mobile and desktop

## Tech Stack

### Frontend

- **React** with **Vite** - Fast and modern frontend framework
- **TypeScript** - Type safety and better developer experience
- **React Router** - Client-side routing
- **TanStack Query** - Data fetching and state management
- **Tailwind CSS** - Utility-first CSS framework for styling
- **Firebase** - Authentication
- **Axios** - HTTP client for API calls

### Backend

- **Node.js** & **Express** - Backend server framework
- **Prisma** - ORM for database operations
- **MySQL** - SQL database
- **Cloudinary** - Media storage and delivery
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing

## Setup & Installation

### Prerequisites

- Node.js (v18 or higher)
- MySQL server
- Cloudinary account
- Firebase project (for authentication)

### Backend Setup

1. Navigate to the server directory:

   ```bash
   cd photoshare/server
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file with your configurations:

   ```
   DATABASE_URL="mysql://username:password@localhost:3306/photoshare"
   JWT_SECRET="your-jwt-secret-key"
   CLOUDINARY_CLOUD_NAME="your-cloud-name"
   CLOUDINARY_API_KEY="your-api-key"
   CLOUDINARY_API_SECRET="your-api-secret"
   ```

4. Set up the database and generate Prisma client:

   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

5. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the client directory:

   ```bash
   cd photoshare/client
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file with your configurations:

   ```
   VITE_API_URL=http://localhost:5000/api
   VITE_FIREBASE_API_KEY="your-firebase-api-key"
   VITE_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
   VITE_FIREBASE_PROJECT_ID="your-project-id"
   VITE_FIREBASE_STORAGE_BUCKET="your-project-id.appspot.com"
   VITE_FIREBASE_MESSAGING_SENDER_ID="your-messaging-sender-id"
   VITE_FIREBASE_APP_ID="your-app-id"
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Access the application at `http://localhost:5173`

## Future Enhancements

- Stories feature
- Direct messaging
- Explore page
- Video uploads
- Hashtags and search functionality
- Notifications
- Post collections/bookmarks

## License

MIT
 