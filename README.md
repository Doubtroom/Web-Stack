# DoubtRoom 🚀

<div align="center">
  <img src="./backend/public/logo.png" alt="DoubtRoom Logo" width="200"/>
</div>

<p align="center">
  <strong>A modern, real-time platform for students to ask and answer doubts, share knowledge, and connect with peers.</strong>
</p>

<p align="center">
  <a href="#-demo">Live Demo</a> •
  <a href="#-features">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-setup">Local Setup</a>
</p>

---

## 🎥 Demo

Here is a live demo of the project, and some GIFs showcasing its features.

**[Link to Live Site](https://www.doubtroom.com/)**


| Feature | '' |
| --- | --- |
| **User Authentication** | ![Auth GIF](https://cdn.dribbble.com/users/846207/screenshots/17484538/media/32de5311b18501ff62be3ca5c0724ec2.gif) |
| **Asking a Question** | ![Ask Question GIF](https://media.tenor.com/uaTT7uIRkzkAAAAM/minions-confuse.gif) |
| **Answering a Question** | ![Answer GIF](https://media.tenor.com/aRFty3sf7DkAAAAM/tell-me-answer-me.gif) |
| **Real-time Comments** | ![Comments GIF](https://data.textstudio.com/output/sample/animated/8/4/1/5/comment-3-5148.gif) |


---

## ✨ Features

DoubtRoom is packed with features to facilitate a seamless learning experience:

*   **🙋‍♀️ Ask & Answer:** Users can post questions with rich text, images, and tags. Others can provide detailed answers.
*   **💬 Real-time Comments:** Engage in discussions on questions and answers.
*   **🔼/🔽 Upvote/Downvote:** Vote on the quality of answers to highlight the best solutions.
*   **🔍 Powerful Search:** Easily find questions on specific topics.
*   **👤 User Profiles:** View user activity, including questions asked and answered.
*   **🔔 Notifications:** Get notified about answers and comments on your questions. (Future Scope)
*   **🔒 Secure Authentication:** JWT-based authentication with password encryption and Google OAuth.
*   **🖼️ Image Uploads:** Cloudinary integration for hosting images in questions and answers.
*   **✉️ Email Notifications:** OTP verification and password reset via email.

---

## 💻 Tech Stack

This project is a full-stack application built with the MERN stack and other modern technologies.

### Frontend

*   **[React](https://reactjs.org/):** A JavaScript library for building user interfaces.
*   **[Vite](https://vitejs.dev/):** A fast build tool for modern web projects.
*   **[Redux Toolkit](https://redux-toolkit.js.org/):** The official, opinionated, batteries-included toolset for efficient Redux development.
*   **[React Router](https://reactrouter.com/):** For declarative routing in React.
*   **[Tailwind CSS](https://tailwindcss.com/):** A utility-first CSS framework for rapid UI development.
*   **[Axios](https://axios-http.com/):** A promise-based HTTP client for the browser and Node.js.
*   **[Framer Motion](https://www.framer.com/motion/):** A production-ready motion library for React.

### Backend

*   **[Node.js](https://nodejs.org/):** A JavaScript runtime built on Chrome's V8 JavaScript engine.
*   **[Express.js](https://expressjs.com/):** A minimal and flexible Node.js web application framework.
*   **[MongoDB](https://www.mongodb.com/):** A NoSQL database for storing application data.
*   **[Mongoose](https://mongoosejs.com/):** An elegant MongoDB object modeling tool for Node.js.
*   **[JSON Web Tokens (JWT)](https://jwt.io/):** For secure user authentication.
*   **[Bcrypt.js](https://www.npmjs.com/package/bcryptjs):** For hashing passwords.
*   **[Cloudinary](https://cloudinary.com/):** For cloud-based image and video management.
*   **[Nodemailer](https://nodemailer.com/):** For sending emails from Node.js applications.

---

## 🚀 Local Setup

Follow these instructions to set up the project locally on your machine.

### Prerequisites

*   [Node.js](https://nodejs.org/en/download/) (v14 or later)
*   [npm](https://www.npmjs.com/get-npm)
*   [Git](https://git-scm.com/downloads)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/Doubtroom.git
cd Doubtroom
```

### 2. Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd ../frontend
npm install
```

### 3. Set Up Environment Variables

This project requires environment variables to be configured for both the backend and frontend.

#### Backend (`/backend/.env`)

Create a `.env` file in the `backend` directory and add the following variables.

```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
CLIENT_URL=http://localhost:5173
JWT_SECRET=your_jwt_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret
EMAIL_USER=your_gmail_address
EMAIL_PASS=your_gmail_app_password
GOOGLE_CLIENT_ID=your_google_oauth_client_id
NODE_ENV=development
```

#### Frontend (`/frontend/.env`)

Create a `.env` file in the `frontend` directory and add the following variables. The project is configured to use Firebase and Appwrite, so you can fill in the variables for the service you are using.

```env
# The base URL of your backend API
VITE_API_BASE_URL=http://localhost:5000

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_AUTH_DOMIAN=your_firebase_auth_domain
VITE_PROJECT_ID=your_firebase_project_id
VITE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_APP_ID=your_firebase_app_id
VITE_MEASUREMENT_ID=your_firebase_measurement_id

# Appwrite Configuration
VITE_APPWRITE_BUCKET_ID=your_appwrite_bucket_id
VITE_APPWRITE_PROJECT_ID=your_appwrite_project_id
VITE_APPWRITE_ENDPOINT=your_appwrite_endpoint

# Other
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
```

### 4. Run the Application

**Start the backend server:**
```bash
cd ../backend
npm run dev
```

**Start the frontend development server:**
```bash
cd ../frontend
npm run dev
```

The frontend should now be running on `http://localhost:5173` (or whatever port Vite chooses) and the backend on `http://localhost:5000`.

--- 