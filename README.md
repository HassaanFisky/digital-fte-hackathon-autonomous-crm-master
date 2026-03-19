# Digital FTE CRM — ARIA v2.0

An enterprise-grade Autonomous CRM built for 100% cloud-native resilience. We’re talking a distributed agentic backbone with a self-healing logic controller and high-dimensional PostgreSQL memory. Everything is orchestrated asynchronously and deployed via Vercel for global low-latency. It’s high-end, zero-lag, and strictly production-ready.

## Architecture
- **Frontend**: Next.js 14 App Router, Tailwind CSS, Framer Motion, shadcn/ui.
- **Backend / Agent Core**: FastAPI, Groq LLaMA 3.3 70B, Kafka. 
- **DB**: Neon PostgreSQL (`asyncpg`).
- **Channels**: Web Form, SMS/WhatsApp (Twilio), Email (Gmail API).

### Setup Guide
1. Clone the repository: `git clone https://github.com/HassaanFisky/digital-fte-hackathon-autonomous-crm-master.git`
2. Install Python dependencies: `cd backend && pip install -r requirements.txt`
3. Install Node.js dependencies: `cd frontend && npm install`
4. Create `.env` file using `.env.example` as a template and provide your actual credentials.
5. Initialize DB Schema: `cd backend && python init_db.py`
6. Run Backend: `cd backend && uvicorn api.main:app --host 0.0.0.0 --port 8000`
7. Run Frontend: `cd frontend && npm run dev`

## Live Details
- **Live URL**: https://digital-fte-hackathon.vercel.app (Pending Vercel deployment update)
- **Status**: Production-Ready
