# CensorPRO

**CensorPRO** enables platforms to automatically and/or manually moderate user-generated content (text, images). 
Use it to filter profanity, hate speech, spam, or other undesired content and maintain a safe community.

## Features

- **Automatic moderation**: AI-based content moderation for Text and Images  
- **Manual moderation UI**: Dashboard for moderators to review flagged content  
- **User management / roles (e.g. user, moderator, admin)** 
- **API endpoints for frontend / external integration**  

## Repository Structure 

- **Backend/** — contains server-side code (Express, models, controllers, routes)  
- **Frontend/** — contains client-side application  
- **Root-level** `package*.json` manages some shared dependencies or scripts

## Installation & Setup

### Prerequisites

- Node.js (v14+ or your target version)  
- (Optional) Database (MongoDB / Postgres / etc.)  
- (Optional) Environment variables / API keys for moderation models

### Steps

1. Clone the repo  
   ```bash
   git clone https://github.com/Nayanpawar03/CensorPRO.git
   cd CensorPRO
```

2. Install dependencies for backend and frontend
```bash
cd Backend
npm install

cd ../Frontend
npm install
```

3. Setup environment variables. Create a .env file in Backend with content like:
```bash
PORT=5000
DB_URI=your_database_connection_string
MOD_MODEL_KEY=your_model_api_key
```

4. Run the app
```bash
cd..
npm run dev
```
