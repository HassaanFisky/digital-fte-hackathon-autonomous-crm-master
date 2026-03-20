# ARIA — Digital FTE | AI Customer Success Platform

## Live URLs
- **Backend (Koyeb)**: [Deploying...]
- **Frontend (Vercel)**: [Deploying...]

## Architecture
- **AI Engine**: Groq LLaMA 3.3 70B
- **Database**: Neon PostgreSQL
- **Event Streaming**: Confluent Kafka
- **Messaging**: Twilio WhatsApp
- **Frontend**: Next.js + Vercel
- **Backend**: FastAPI + Koyeb

## Channels Supported
1. Email (Gmail)
2. WhatsApp (Twilio)
3. Web Form

## Setup Instructions
1. Clone the repository
2. Add `.env` file with credentials
3. Install backend dependencies: `pip install -r backend/requirements.txt`
4. Install frontend dependencies: `cd frontend && npm install`
5. Deploy frontend to Vercel

## API Documentation
Swagger UI available at: `/docs` (when backend is running)

## GIAIC Hackathon 5
Submitted for GIAIC Hackathon 5.
