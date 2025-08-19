# MauticX 📧

A modern email marketing platform built with Next.js, FastAPI, and Celery for scalable email campaign management.

## 🚀 Features

- **Contact Management**: Organize and segment your email contacts
- **Campaign Builder**: Create and manage email marketing campaigns
- **Email Templates**: Design beautiful email templates with drag-and-drop editor
- **Analytics Dashboard**: Track email performance with detailed analytics
- **Automation Workflows**: Set up automated email sequences
- **A/B Testing**: Test different email variations for better performance
- **Real-time Reporting**: Monitor campaign metrics in real-time

## 🏗️ Architecture

### Frontend (Next.js)
- **Framework**: Next.js 14 with App Router
- **UI Components**: Shadcn/ui with Tailwind CSS
- **Authentication**: NextAuth.js
- **State Management**: React Context + Hooks
- **Charts**: Recharts for analytics visualization

### Backend (FastAPI)
- **Framework**: FastAPI with Python 3.11+
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Authentication**: JWT tokens
- **API Documentation**: Auto-generated with OpenAPI/Swagger
- **Email Service**: SMTP integration for email delivery

### Worker (Celery)
- **Task Queue**: Celery with Redis broker
- **Background Jobs**: Email sending, data processing
- **Scheduling**: Periodic tasks for automated campaigns

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | FastAPI, Python, SQLAlchemy |
| Database | PostgreSQL |
| Queue | Redis, Celery |
| Authentication | NextAuth.js, JWT |
| Deployment | Docker, Docker Compose |

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm/pnpm
- Python 3.11+
- PostgreSQL
- Redis
- Docker (optional)

### Quick Start with Docker

1. **Clone the repository**
   ```bash
   git clone git@github.com:setiawand/mauticx.git
   cd mauticx
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start with Docker Compose**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Manual Installation

#### Frontend Setup
```bash
cd web
npm install
cp .env.example .env.local
# Configure your environment variables
npm run dev
```

#### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Set up database
alembic upgrade head

# Start the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Worker Setup
```bash
cd worker
pip install -r requirements.txt
celery -A main worker --loglevel=info
```

## 🔧 Configuration

### Environment Variables

Create `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/mauticx

# Redis
REDIS_URL=redis://localhost:6379/0

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# JWT Secret
SECRET_KEY=your-secret-key-here

# NextAuth
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3001
```

## 📊 Dashboard Features

### Overview Dashboard
- **Total Contacts**: Track your subscriber count
- **Active Campaigns**: Monitor running campaigns
- **Emails Sent**: View total email delivery stats
- **Open Rate**: Track email engagement metrics

### Campaign Analytics
- Email performance charts (sent vs opened)
- Recent campaign activity
- Engagement trends over time

## 🚀 Deployment

### Docker Production Deployment

1. **Build production images**
   ```bash
   docker-compose -f docker-compose.prod.yml build
   ```

2. **Deploy to production**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Manual Production Deployment

1. **Frontend (Next.js)**
   ```bash
   cd web
   npm run build
   npm start
   ```

2. **Backend (FastAPI)**
   ```bash
   cd backend
   gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
   ```

3. **Worker (Celery)**
   ```bash
   cd worker
   celery -A main worker --loglevel=info
   ```

## 🧪 Testing

### Frontend Tests
```bash
cd web
npm run test
```

### Backend Tests
```bash
cd backend
pytest
```

## 📝 API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/setiawand/mauticx/issues) page
2. Create a new issue with detailed information
3. Join our community discussions

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [FastAPI](https://fastapi.tiangolo.com/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Tabler Icons](https://tabler-icons.io/)

---

**MauticX** - Empowering your email marketing campaigns with modern technology 🚀