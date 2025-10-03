# UTM Manager

A specialized UTM management system for drone operations built with FastAPI backend and React frontend, designed for Formula 1 Brazil 2025 testing with 6 preset operational zones and real-time airspace monitoring capabilities.

## Live Demo

TODO

## Screenshot

TODO

## Overview

UTM Manager provides a specialized web-based interface for managing drone flight strips and operations during the Formula 1 Brazil 2025 testing event. The system features 6 preset operational zones designed for coordinated drone activities, real-time flight strip tracking using Cesium 3D visualization, and comprehensive APIs for flight strip lifecycle management.

### Key Features

- **6 Preset Operational Zones**: Pre-configured zones specifically designed for F1 Brazil 2025 testing
- **Flight Strip Management**: Create, update, and track flight strips throughout their lifecycle
- **Real-time Monitoring**: Live visualization of drone operations and flight strip status
- **Zone-based Operations**: Coordinate activities across designated operational areas
- **Conflict Detection**: Identify and manage potential conflicts between flight operations

## Architecture

- **Backend**: FastAPI-based REST API with clean architecture principles
- **Frontend**: React + TypeScript with Vite, featuring Cesium for 3D visualization
- **Deployment**: Docker containerized with nginx reverse proxy
- **Database**: MongoDB integration via Motor async driver

## F1 Brazil 2025 Configuration

This system is specifically configured for the Formula 1 Brazil 2025 testing event with the following operational setup:

### Operational Zones
- **Zone 1-6**: Pre-configured operational areas around the circuit
- **Zone Boundaries**: Defined coordinates and altitude restrictions
- **Zone Status**: Real-time monitoring of zone availability and conflicts
- **Zone Coordination**: Cross-zone operation management and handoffs

### Flight Strip Workflow
1. **Strip Creation**: Define flight parameters and assign to operational zone
2. **Pre-flight Validation**: Automated conflict checking and zone availability
3. **Active Monitoring**: Real-time tracking during flight operations
4. **Post-flight Processing**: Operation completion and data archival

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)

### Environment Setup

1. Copy environment files:
```bash
cp backend/.env.sample backend/.env.dev
cp interface/.env.sample interface/.env
```

2. Configure your environment variables in the copied files.

### Development

#### Using Docker Compose
```bash
# Start all services
docker-compose -f docker-compose.dev.yml up

# Backend will be available at http://localhost:8000
# Frontend will be available at http://localhost:80
```

#### Local Development

**Backend:**
```bash
cd backend
pip install -r requirements.txt
python main.py
```

**Frontend:**
```bash
cd interface
npm install
npm run dev
```

### Production Deployment

```bash
docker-compose up -d
```

## API Documentation

Once running, access the interactive API documentation at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Main Endpoints

- `/api/flight-strips` - Flight strip lifecycle management
- `/api/zones` - Operational zone configuration and status
- `/api/operations` - Drone operation tracking and coordination
- `/api/conflicts` - Conflict detection and resolution
- `/api/airspace` - Airspace management operations
- `/api/healthy` - System health checks

## Project Structure

```
├── backend/                 # FastAPI backend
│   ├── adapters/           # External service adapters
│   ├── application/        # Application services (flight strips, zones)
│   ├── domain/            # Domain models (flight strips, operations, zones)
│   ├── infrastructure/    # Infrastructure components
│   ├── ports/             # Interface definitions
│   ├── routes/            # API route handlers
│   ├── schemas/           # Pydantic models (flight strip schemas)
│   └── services/          # Business logic services
├── interface/             # React frontend
│   ├── src/              # Source code
│   │   ├── components/   # Flight strip components
│   │   ├── zones/        # Zone management interface
│   │   └── operations/   # Operation tracking views
│   ├── public/           # Static assets
│   └── dist/             # Build output
├── docs/                 # Documentation
└── docker-compose.yml    # Production deployment
```

## Technology Stack

### Backend
- **FastAPI** - Modern Python web framework
- **Motor** - Async MongoDB driver
- **Pydantic** - Data validation and serialization
- **JWT** - Authentication and authorization
- **Uvicorn** - ASGI server

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Cesium** - 3D globe and mapping for zone visualization
- **Tailwind CSS** - Styling framework
- **Radix UI** - Component primitives for flight strip UI
- **React Query** - Data fetching and real-time updates

## Development Guidelines

### Code Style
- Backend follows Black formatting (line length: 79)
- Frontend uses ESLint with TypeScript rules
- Both codebases maintain strict type checking

### Testing
```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd interface
npm run test
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes following the code style guidelines
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the terms specified in the LICENSE file.

## Support

For questions and support, please refer to the project documentation or create an issue in the repository.
