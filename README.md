# AANA - Clinical Trial Protocol Design Platform

AANA is an AI-powered platform that helps connect patients with innovative clinical trials through intelligent protocol design and optimization.

## Features

- **Protocol Design**: AI-assisted protocol creation with real-time suggestions
- **Site Selection**: Heat map visualization of disease prevalence with state rankings
- **Investigator Profiles**: Detailed profiles of qualified investigators
- **AI Integration**: DeepSeek-powered protocol optimization and recommendations
- **Real-time Collaboration**: Multi-user editing capabilities
- **Regulatory Compliance**: Built-in compliance checks and guidelines

## Tech Stack

- **Frontend**: React.js with Material-UI
- **Backend**: Node.js/Express
- **Database**: PostgreSQL
- **AI Integration**: DeepSeek API
- **Authentication**: JWT-based auth
- **Real-time Updates**: WebSocket

## Project Structure

```
project/
├── frontend/           # React frontend application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── services/    # API services
│   │   └── utils/       # Utility functions
│   └── public/         # Static assets
├── backend/           # Node.js backend
│   ├── src/
│   │   ├── controllers/ # Route controllers
│   │   ├── models/      # Database models
│   │   └── services/    # Business logic
│   └── config/        # Configuration files
└── docs/             # Documentation
```

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/AANA.git
   ```

2. Install dependencies:
   ```bash
   # Frontend
   cd frontend
   npm install

   # Backend
   cd ../backend
   npm install
   ```

3. Set up environment variables:
   - Create `.env` files in both frontend and backend directories
   - Add necessary environment variables (see `.env.example`)

4. Start the development servers:
   ```bash
   # Frontend
   cd frontend
   npm start

   # Backend
   cd ../backend
   npm run dev
   ```

## Environment Variables

### Frontend
```
REACT_APP_API_URL=http://localhost:8000
REACT_APP_DEEPSEEK_API_KEY=your_deepseek_api_key
REACT_APP_DEEPSEEK_API_URL=https://api.deepseek.com/v1
```

### Backend
```
PORT=8000
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

Your Name - your.email@example.com
Project Link: [https://github.com/yourusername/AANA](https://github.com/yourusername/AANA)

## Troubleshooting Guide

If you're experiencing issues with the application not showing any data, follow these steps to fix the problems:

### Backend Setup

1. Activate the virtual environment:
   ```bash
   # On macOS/Linux
   source myenv/bin/activate
   
   # On Windows
   myenv\Scripts\activate
   ```

2. Start the Django backend server:
   ```bash
   cd project/backend
   python manage.py runserver 8000
   ```

3. Verify the backend is running by visiting:
   - http://localhost:8000/api/trials/active/
   - http://localhost:8000/api/studies/featured/
   - http://localhost:8000/api/database-stats/

### Frontend Setup

1. Install dependencies:
   ```bash
   cd project/frontend
   
   # If using npm
   npm install
   npm install react-icons axios miragejs
   
   # If using yarn with corepack
   corepack enable
   yarn install
   ```

2. Fix Google Maps API key:
   - Open `.env.development` and replace `YOUR_GOOGLE_API_KEY` with a valid Google Maps API key
   - Or remove the Google Maps functionality if not needed

3. Start the frontend:
   ```bash
   npm start
   # or
   yarn start
   ```

### Common Issues and Solutions

1. **No data showing in the application**
   - Ensure the backend server is running on port 8000
   - Check that `REACT_APP_USE_MOCK_API=false` in `.env.development`
   - Verify the API endpoints in `src/api.js` match the backend URLs

2. **Missing dependencies**
   - Run `npm install` or `yarn install` to reinstall all dependencies
   - Specifically install `react-icons` with `npm install react-icons`

3. **Google Maps API errors**
   - Ensure you have a valid API key in `.env.development`
   - Make sure the Google Maps script in `public/index.html` is properly configured

4. **PowerShell/Terminal issues**
   - Use a regular terminal (not PowerShell) for running commands
   - On macOS, use Terminal.app or iTerm
   - On Windows, use Command Prompt or Git Bash

## API Endpoints

- Active Trials: `/api/trials/active/`
- Featured Studies: `/api/studies/featured/`
- Study Details: `/api/studies/{study_id}/`
- Search Studies: `/api/studies/search/?q={query}`
- Enrollment Request: `/api/enrollment/request/`
- Database Stats: `/api/database-stats/`
- NLP Query Processing: `/api/nlp/process/` # AANA
