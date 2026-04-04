# CraveBite Restaurant App - Authentication System

A complete restaurant ordering application with user authentication built with Node.js, Express, MongoDB, and vanilla JavaScript.

## 🚀 Features

### Backend (Node.js + Express + MongoDB)
- ✅ User registration and login with JWT authentication
- ✅ Password hashing with bcrypt
- ✅ Input validation with express-validator
- ✅ Role-based access control (User/Admin)
- ✅ Password reset functionality
- ✅ User profile management
- ✅ Security middleware (helmet, rate limiting, CORS)
- ✅ MongoDB integration with Mongoose

### Frontend (Vanilla JavaScript + Tailwind CSS)
- ✅ Modern, responsive UI design
- ✅ User registration and login forms
- ✅ Authentication state management
- ✅ Protected routes
- ✅ User profile display
- ✅ Logout functionality
- ✅ Form validation
- ✅ Error handling

## 📁 Project Structure

```
restaurant-app/
├── client/                 # Frontend files
│   ├── index.html         # Home page with auth
│   ├── login.html         # Login page
│   ├── signup.html        # Registration page
│   ├── menu.html          # Menu page
│   ├── cart.html          # Shopping cart
│   ├── checkout.html      # Checkout page
│   └── images/            # Food images
├── models/                # Database models
│   └── User.js           # User schema
├── middleware/            # Custom middleware
│   └── auth.js           # Authentication middleware
├── routes/               # API routes
│   ├── auth.js           # Authentication routes
│   └── user.js           # User management routes
├── server.js             # Main server file
├── package.json          # Backend dependencies
└── env.example           # Environment variables template
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- Git

### 1. Clone the Repository
```bash
git clone <repository-url>
cd restaurant-app
```

### 2. Install Backend Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```bash
cp env.example .env
```

Edit the `.env` file with your configuration:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/cravebite

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Client URL (for CORS)
CLIENT_URL=http://localhost:3000
```

### 4. Start MongoDB
**Local MongoDB:**
```bash
# Start MongoDB service
mongod
```

**MongoDB Atlas (Cloud):**
- Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
- Create a cluster and get your connection string
- Replace `MONGODB_URI` in `.env` with your Atlas connection string

### 5. Start the Backend Server
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

### 6. Open the Frontend
Open `client/index.html` in your browser or serve it with a local server:

```bash
# Using Python
python -m http.server 3000

# Using Node.js (install http-server globally)
npx http-server client -p 3000
```

## 🔐 API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /signup` - Register a new user
- `POST /login` - User login
- `POST /logout` - User logout
- `GET /me` - Get current user profile
- `POST /forgot-password` - Send password reset email
- `POST /reset-password/:token` - Reset password with token

### User Routes (`/api/user`)
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile
- `PUT /change-password` - Change password
- `DELETE /account` - Deactivate account
- `GET /orders` - Get user orders (placeholder)

### Admin Routes (`/api/user/admin`)
- `GET /users` - Get all users (admin only)
- `PUT /users/:id` - Update user by admin

## 👤 User Roles

### Regular User
- Register and login
- Update profile information
- Change password
- View orders (future feature)
- Deactivate account

### Admin User
- All regular user permissions
- View all users
- Manage user accounts
- Update user roles

## 🔒 Security Features

- **Password Hashing**: Bcrypt with salt rounds
- **JWT Authentication**: Stateless token-based auth
- **Input Validation**: Server-side validation with express-validator
- **Rate Limiting**: Prevent brute force attacks
- **CORS Protection**: Configured for security
- **Helmet**: Security headers
- **Environment Variables**: Sensitive data protection

## 🎨 Frontend Features

- **Responsive Design**: Works on all devices
- **Modern UI**: Clean, professional design with Tailwind CSS
- **Form Validation**: Client-side validation
- **Error Handling**: User-friendly error messages
- **Authentication State**: Persistent login state
- **Loading States**: Visual feedback during API calls

## 🧪 Testing the Authentication

### 1. Create a New Account
1. Go to `http://localhost:3000/signup.html`
2. Fill in the registration form
3. Submit to create your account

### 2. Login
1. Go to `http://localhost:3000/login.html`
2. Enter your email and password
3. You'll be redirected to the home page

### 3. Test Protected Features
- The navbar will show your name when logged in
- You can logout using the logout button
- Try accessing protected routes

## 🚀 Deployment

### Backend Deployment (Heroku/Netlify/Vercel)
1. Set environment variables in your hosting platform
2. Deploy the Node.js application
3. Update the `API_BASE_URL` in frontend files

### Frontend Deployment
1. Update `API_BASE_URL` to point to your deployed backend
2. Deploy static files to any hosting service

## 🔧 Customization

### Adding New User Fields
1. Update the User model in `models/User.js`
2. Modify signup form in `client/signup.html`
3. Update validation in `routes/auth.js`

### Styling Changes
- Modify Tailwind classes in HTML files
- Add custom CSS in `<style>` tags
- Update color scheme by changing yellow classes

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Error:**
- Ensure MongoDB is running
- Check your connection string in `.env`
- Verify network connectivity

**CORS Errors:**
- Update `CLIENT_URL` in `.env`
- Check that frontend and backend ports match

**JWT Errors:**
- Ensure `JWT_SECRET` is set in `.env`
- Check token expiration settings

**Port Already in Use:**
- Change `PORT` in `.env`
- Kill existing processes on the port

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For support or questions, please open an issue in the repository.

---

**Happy Coding! 🍕🍔🍝** 