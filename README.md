# DSA Hub - MongoDB Edition

A Data Structures & Algorithms learning hub with MongoDB database integration.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup MongoDB

**Option A: Local MongoDB (Recommended)**
- Install MongoDB: https://www.mongodb.com/try/download/community
- It will start automatically after installation

**Option B: MongoDB Atlas (Cloud - Free)**
- Sign up: https://www.mongodb.com/cloud/atlas/register
- Create free cluster
- Get connection string
- Update `.env` file

### 3. Configure Environment

The `.env` file is already set up for local MongoDB:
```env
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=dsa-hub
```

For MongoDB Atlas, update with your connection string.

### 4. Run the App
```bash
npm run dev
```

Visit http://localhost:8080/

## 📚 Documentation

See `.env.example` for environment configuration reference.

## ✨ Features

- ✅ Profile management with PIN protection
- ✅ AI-powered problem solver (Gemini Flash)
- ✅ Gallery for saving DSA question screenshots
- ✅ Topic-based organization
- ✅ Difficulty tracking (Easy, Medium, Hard)
- ✅ Import/Export functionality
- ✅ MongoDB database for persistent storage

## 🗄️ Database

This app uses MongoDB for data storage:

- **profiles** collection - User profiles
- **gallery_items** collection - Saved question images

No schema setup needed - MongoDB creates collections automatically!

## 🛠️ Tech Stack

- **Frontend**: React 19, TanStack Router, TanStack Start
- **Styling**: Tailwind CSS, Radix UI
- **Database**: MongoDB
- **Build Tool**: Vite

## 📦 Project Structure

```
src/
├── components/       # React components
├── routes/          # TanStack Router routes
│   └── api/        # API endpoints
├── store/          # Zustand state management
├── lib/            # Utilities and MongoDB connection
└── data/           # Static data (topics)
```

## 🔧 Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Format code
npm run format
```

## 🌐 Environment Variables

Create a `.env` file:

```env
# Local MongoDB
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=dsa-hub

# Or MongoDB Atlas
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
# MONGODB_DB_NAME=dsa-hub
```

## 📝 API Endpoints

- `GET /api/profiles` - Get all profiles
- `POST /api/profiles` - Create profile
- `DELETE /api/profiles?id={id}` - Delete profile
- `POST /api/auth` - Authenticate
- `GET /api/gallery?profileId={id}` - Get gallery items
- `POST /api/gallery` - Add gallery item
- `DELETE /api/gallery?id={id}&profileId={pid}` - Delete item
- `DELETE /api/gallery/clear?profileId={id}` - Clear all items
- `POST /api/gallery/import` - Import items

## 🎯 Usage

1. **Create Profile**: Set up your profile with a PIN
2. **Browse Topics**: Explore DSA topics
3. **Save Questions**: Upload screenshots of questions you're working on
4. **Track Progress**: Organize by difficulty and topic
5. **Export/Import**: Backup your data anytime

## 🔒 Security Note

The PIN protection is for local convenience only and is NOT secure authentication. Anyone with access to your device can bypass it. Do not use this for sensitive data.

## 📄 License

This project is open source and available for educational purposes.

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

---

**Happy Coding!** 🚀
