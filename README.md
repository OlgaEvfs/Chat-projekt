# Chat Projekt

Simple real-time chat application built with **Express**, **Socket.io**, and **TypeScript**, using an **MVC architecture**. Supports hot-reload development and public access via **ngrok**.

## ⚙️ Requirements

- Node.js v18+
- npm

## 📥 Installation & Setup

1️⃣ **Clone the repository**  

git clone https://github.com/OlgaEvfs/Chat-projekt.git
cd Chat-projekt

2️⃣ Install dependencies

npm install

## Environment Variables
Create a .env file in the project root: NGROK_TOKEN=your_ngrok_token

⚠️ Important:

Do NOT commit your .env file.

Make sure .env is listed in .gitignore.

## Running the Project
Step 1: Start the server (development mode with hot reload)

npm run dev

Step 2: Run a public tunnel with ngrok

npm run tunnel

Uses scripts/tunnel.js to create a public HTTPS URL.

This allows access to your chat from other devices or to share with testers.

Note: Always start npm run dev first, then npm run tunnel.

## How to Use
Open the provided ngrok URL in your browser.

Type a username and join the chat.

Start sending messages in real-time.

Anyone with the URL can access the chat while your server is running.

## Technologies Used
Node.js

Express

Socket.io

TypeScript

ngrok

MVC Architecture