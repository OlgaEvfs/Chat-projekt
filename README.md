Chat projekt

Simple real-time chat application built with Express, Socket.io, and TypeScript, using an MVC architecture. Supports hot-reload development and public access via ngrok.

⚙️ Requirements

Node.js v18+

npm or yarn

📥 Installation & Setup
1️⃣ Clone the repository
git clone https://github.com/OlgaEvfs/Chat-projekt
cd chatts

2️⃣ Install dependencies
npm install

🔐 Environment Variables

Create a .env file in the project root:

NGROK_TOKEN=your_ngrok_token


⚠️ Important:
Do NOT commit your .env file.
Make sure .env is listed in .gitignore.

🌍 Running a Public Tunnel (ngrok)

The project includes a script to start ngrok using the token from .env:

npm run tunnel


This uses:

scripts/tunnel.js


After launching, ngrok will provide a public HTTPS URL to access the chat from other devices or share with testers.

▶️ Run Modes
🔧 Development Mode (Hot Reload)
npm run dev


Runs the project with nodemon, which automatically restarts the server whenever .ts files change.

📦 Build TypeScript (Optional)
npm run build


Compiles TypeScript files into the dist/ directory.

🚀 Run Compiled Version
npm start