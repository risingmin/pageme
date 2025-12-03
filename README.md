# PageMe

A résumé-to-website generator that transforms your resume into a beautiful personal portfolio website using AI.

## Features

- 📄 **Upload Resume** - Upload a `.txt` file or paste your resume text
- 🤖 **AI-Powered Generation** - Uses Ollama (local LLM) to generate a styled HTML portfolio
- 🎨 **Modern Design** - Generated sites use TailwindCSS with gradients, animations, and responsive layouts
- 📥 **Download HTML** - Download your generated site as a single HTML file
- 🔐 **User Authentication** - Secure login/register with JWT
- 📊 **Dashboard** - Manage all your generated sites in one place

## Tech Stack

**Frontend:**
- React 19 + TypeScript
- Vite
- TailwindCSS v4
- React Router v6
- Axios

**Backend:**
- Express.js
- MongoDB (Atlas)
- JWT Authentication
- Multer (file uploads)

**AI:**
- Ollama (local) with `gemma3:12b` model
- OpenAI-compatible API

## Getting Started

### Prerequisites

- Node.js 18+
- [Ollama](https://ollama.ai/) installed locally
- MongoDB Atlas account (or local MongoDB)

### 1. Install Dependencies

```bash
# Frontend
cd pageme
npm install

# Backend
cd server
npm install
```

### 2. Configure Environment

Create `server/.env`:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
OLLAMA_BASE_URL=http://localhost:11434/v1
OLLAMA_MODEL=gemma3:12b
```

### 3. Pull the AI Model

```bash
ollama pull gemma3:12b
```

### 4. Start the App

```bash
# Terminal 1: Start Ollama
ollama serve

# Terminal 2: Start Backend (port 3000)
node server/src/index.js

# Terminal 3: Start Frontend (port 5173)
npm run dev
```

### 5. Open the App

Visit [http://localhost:5173](http://localhost:5173)

## Usage

1. **Register** an account
2. **Login** to your dashboard
3. Click **"Generate new site"**
4. Upload your resume (`.txt`) or paste the text
5. Wait for AI to generate your portfolio
6. **View** or **Download** your generated website

## Project Structure

```
pageme/
├── src/                    # Frontend React app
│   ├── components/ui/      # Reusable UI components
│   ├── pages/              # Page components
│   ├── context/            # Auth context
│   ├── api/                # API clients
│   └── types/              # TypeScript types
├── server/                 # Backend Express app
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── models/         # Mongoose models
│   │   ├── services/       # AI service
│   │   └── middleware/     # Auth middleware
│   └── generated-sites/    # Generated HTML files
└── public/                 # Static assets
```

## License

MIT
