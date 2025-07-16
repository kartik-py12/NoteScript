# Twilight Note Flow

NoteScript is a modern, full-featured note-taking platform built with the MERN stack. Create, organize, and share your thoughts with a powerful rich text editor supporting formatting, headers, lists, links, and JavaScript syntax highlighting for code blocks. Enjoy seamless public/private note sharing, tag-based organization, advanced search capabilities, and a beautiful dark/light theme system.

## 🌟 Features

### Core Features
- **User Authentication** - Secure registration and login
- **Rich Text Editor** - Full-featured editor with formatting options
- **Public/Private Notes** - Share notes publicly or keep them private
- **Tag System** - Organize notes with custom tags
- **Search & Filter** - Find notes quickly with advanced search
- **Responsive Design** - Works perfectly on all devices
- **Dark/Light Theme** - Toggle between themes

### Rich Text Editing
- Bold, italic, strikethrough, and inline code
- Headers (H1, H2, H3)
- Bullet and numbered lists
- Blockquotes and horizontal rules
- Link support with easy management
- **JavaScript Syntax Highlighting** - Beautiful code block highlighting for JavaScript
- Undo/redo functionality

### Advanced Features
- Auto-save functionality
- Note view counts
- Like system for public notes
- Tag-based filtering
- Sorting by date, title, and popularity
- User profiles and statistics

## 🎨 Design System

The app uses a carefully chosen color palette:

- **Primary (Raisin Black)**: `#272727` - Main UI elements
- **Secondary (Buff)**: `#D4AA7D` - Accent elements
- **Accent (Sunset)**: `#EFD09E` - Highlights and CTAs

## 🚀 Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **Vite** - Next generation frontend tooling
- **React Router** - Client-side routing
- **Zustand** - Lightweight state management
- **TailwindCSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible components
- **Tiptap** - Rich text editor
- **Lowlight** - JavaScript syntax highlighting for code blocks
- **Lucide React** - Beautiful icons

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Express Validator** - Input validation

## 📁 Project Structure

```
twilight-note-flow/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── store/         # Zustand stores
│   │   ├── lib/           # Utilities
│   │   └── ...
│   └── package.json
├── server/                # Node.js backend
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   └── package.json
├── package.json          # Root package.json
└── README.md
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd twilight-note-flow
   ```

2. **Install dependencies for all packages**
   ```bash
   npm run install-deps
   ```

3. **Set up environment variables**
   
   Create `.env` file in the `server` directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/twilight-note-flow
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=7d
   CLIENT_URL=http://localhost:3000
   ```

4. **Start the development servers**
   ```bash
   npm run dev
   ```

   This will start:
   - Backend server on `http://localhost:5000`
   - Frontend app on `http://localhost:3000`

### Individual Setup

#### Backend Setup
```bash
cd server
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

#### Frontend Setup
```bash
cd client
npm install
npm run dev
```

## 🔧 Available Scripts

### Root Directory
- `npm run dev` - Start both frontend and backend
- `npm run server` - Start only backend
- `npm run client` - Start only frontend
- `npm run install-deps` - Install dependencies for all packages

### Backend (`server/`)
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

### Frontend (`client/`)
- `npm run dev` - Start development server with Vite
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## 🗃️ Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  avatar: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Note Model
```javascript
{
  title: String,
  content: String (HTML),
  tags: [String],
  isPublic: Boolean,
  author: ObjectId (ref: User),
  likes: [ObjectId] (ref: User),
  views: Number,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Notes
- `GET /api/notes` - Get notes (with filtering)
- `GET /api/notes/:id` - Get single note
- `POST /api/notes` - Create new note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note
- `POST /api/notes/:id/like` - Toggle like on note
- `GET /api/notes/tags/all` - Get all tags

### Users
- `GET /api/users/:id` - Get user profile
- `GET /api/users/:id/notes` - Get user's public notes
- `GET /api/users/:id/stats` - Get user statistics

## 🎯 Usage

### Getting Started
1. **Create an account** or use the demo credentials
2. **Create your first note** using the rich text editor
3. **Add tags** to organize your notes
4. **Toggle privacy** to share notes publicly
5. **Explore public notes** from the community

### Demo Credentials
- Email: `demo@example.com`
- Password: `demo123`

### Key Features

#### Rich Text Editing
- Use the toolbar to format your text
- Add headers, lists, links, and more
- Auto-save keeps your work safe

#### Organization
- Add multiple tags to categorize notes
- Use search to find notes quickly
- Filter by tags, author, or date

#### Sharing
- Toggle notes to public to share with community
- View and like other users' public notes
- Keep personal notes private

## 🌐 Deployment

### Frontend (Netlify/Vercel)
1. Build the client: `cd client && npm run build`
2. Deploy the `build` folder to your hosting service
3. Set environment variables if needed

### Backend (Heroku/Railway)
1. Deploy the `server` directory
2. Set environment variables:
   - `NODE_ENV=production`
   - `MONGODB_URI=<your-mongodb-connection-string>`
   - `JWT_SECRET=<your-jwt-secret>`
   - `CLIENT_URL=<your-frontend-url>`

### Database (MongoDB Atlas)
1. Create a MongoDB Atlas cluster
2. Get the connection string
3. Update `MONGODB_URI` in your environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and commit: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - Frontend framework
- [Express.js](https://expressjs.com/) - Backend framework
- [MongoDB](https://www.mongodb.com/) - Database
- [TailwindCSS](https://tailwindcss.com/) - Styling
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Tiptap](https://tiptap.dev/) - Rich text editor
- [Zustand](https://github.com/pmndrs/zustand) - State management

## 📞 Support

If you have any questions or issues, please:
1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue if needed
3. Contact the maintainers

---

Built with ❤️ using the MERN stack
