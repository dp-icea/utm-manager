# UTM Manager - Airspace Control Module

A specialized airspace management interface developed as part of the BR-UTM (Brazilian Unmanned Traffic Management) project. This module specifically handles drone operations during the Formula 1 Event in Brazil 2025, managing airspace control across 6 designated zones around the F1 track with real-time flight strip management and 3D visualization capabilities.

## Demo

### Screenshots
![Demo Screenshot](assets/demo.png)

### Video Demo

[Screencast from 08-10-2025 16:22:45.webm](https://github.com/user-attachments/assets/6fde223d-35b0-4612-85aa-71f77e7ed95b)

## Overview

This module is part of the larger BR-UTM (Brazilian Unmanned Traffic Management) project, which encompasses multiple systems and components for comprehensive drone airspace management across Brazil. This specific component focuses on the Formula 1 Event in Brazil 2025, where the Brazilian Airspace Department has divided the zones near the F1 track into 6 distinct operational areas: Red, Orange, Green, Purple, Blue, and Yellow zones.

When authorities such as police officers, firefighters, or other authorized personnel need to operate drones in the region, an Airspace Traffic Controller records flight information on strips, documenting which zone is occupied, by whom, at what altitude, departure/arrival times, and aircraft identification.

### Module Capabilities

- **6-Zone Airspace Management**: Red, Orange, Green, Purple, Blue, and Yellow zones with interactive 3D visualization
- **Flight Strip Management**: Complete lifecycle management of flight strips with filtering and creation capabilities
- **Real-time Drone Tracking**: Receives and displays positions from drones that voluntarily share information
- **Interactive 3D Map**: Cesium-powered 3D viewer with clickable zones and drone markers
- **Multi-Zone Filtering**: Select multiple zones to filter aircraft operations across different areas

## Architecture

- **Backend**: FastAPI-based REST API with clean architecture principles
- **Frontend**: React + TypeScript with Vite, featuring Cesium for 3D visualization
- **Deployment**: Docker containerized with nginx reverse proxy

## F1 Event Airspace Zone Configuration

This module manages 6 designated airspace zones specifically configured for the Formula 1 Brazil 2025 event:

### Flight Strip Management Workflow
1. **Authority Request**: Police, firefighters, or authorized personnel request drone operation
2. **Strip Creation**: Airspace Traffic Controller creates flight strip with zone assignment
3. **Zone Documentation**: Records aircraft ID, altitude, departure/arrival times, and operator details
4. **Real-time Monitoring**: Track drone positions and zone occupancy status
5. **Multi-zone Operations**: Coordinate flights across multiple zones when required

### Interactive Features
- **Zone Selection**: Click on 3D zones to filter aircraft in specific areas
- **Drone Tracking**: Click on drone markers to view detailed flight information
- **Multi-zone Filtering**: Select multiple zones simultaneously for comprehensive monitoring
- **Flight Strip Sidebar**: Complete list of active flights with filtering capabilities

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

- `/api/flights` - Airspace conflict detection and resolution within F1 zones
- `/api/flights` - Airspace conflict detection and resolution within F1 zones
- `/api/healthy` - Module health monitoring and BR-UTM integration status

## Project Structure

```
├── backend/               # FastAPI backend for airspace management
│   ├── adapters/          # External service adapters for drone data
│   ├── application/       # Flight strip and zone management services
│   ├── domain/            # Domain models for airspace, zones, and operations
│   ├── infrastructure/    # Database and external system integration
│   ├── ports/             # Interface definitions for Brazilian airspace standards
│   ├── routes/            # API endpoints for flight strips and zone management
│   ├── schemas/           # Data models for flight strips and zone operations
│   └── services/          # Business logic for airspace traffic control
├── interface/             # React frontend with 3D visualization
│   ├── src/               # Source code following feature-sliced architecture
│   │   ├── app/           # App related config files
│   │   ├── pages/         # Page-wise divisions of the app
│   │   └── shared/        # Shared files related to the application
│   ├── public/            # Static assets and zone configuration
│   └── dist/              # Production build
├── assets/                # Demo screenshots and videos
├── docs/                  # System documentation and ADRs
└── docker-compose.yml     # Production deployment configuration
```

## Technology Stack

### Backend
- **FastAPI** - Modern Python web framework
- **Pydantic** - Data validation and serialization
- **Uvicorn** - ASGI server

### Frontend
- **React 19** - UI framework for airspace management interface
- **TypeScript** - Type safety for flight strip and zone data
- **Vite** - Build tool and development server
- **Cesium** - 3D globe visualization for the 6 airspace zones
- **Tailwind CSS** - Styling framework for responsive design
- **Radix UI** - Component primitives for flight strip management UI

## Development Guidelines

### Code Style
- Backend follows Black formatting (line length: 79)
- Frontend uses ESLint with TypeScript rules
- Both codebases maintain strict type checking

## License

This project is licensed under the terms specified in the LICENSE file.

## Support

For questions and support, please refer to the project documentation or create an issue in the repository.
