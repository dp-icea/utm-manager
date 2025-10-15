# Flight Strip CRUD System

A comprehensive flight strip management system built with hexagonal architecture, MongoDB, and FastAPI.

## 🏗️ Architecture Overview

This implementation follows **Hexagonal Architecture** (Ports and Adapters) principles:

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   API Routes    │────│  Application     │────│   Domain        │
│   (FastAPI)     │    │   Use Cases      │    │   Entities      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                        │
         │                        │                        │
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Schemas       │    │     Ports        │    │  Infrastructure │
│ (Request/Resp)  │    │  (Interfaces)    │    │   (MongoDB)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                │
                    ┌──────────────────┐
                    │    Adapters      │
                    │   (MongoDB)      │
                    └──────────────────┘
```

## 📁 Project Structure

```
├── domain/
│   ├── flight_strip.py          # Core business entities and logic
│   └── base.py                  # Shared domain primitives
├── ports/
│   └── flight_strip_port.py     # Repository interface (abstract)
├── adapters/
│   └── flight_strip_mongodb_adapter.py  # MongoDB implementation
├── application/
│   └── flight_strip_use_case.py # Business use cases orchestration
├── infrastructure/
│   └── mongodb_client.py        # Database connection management
├── routes/
│   └── flight_strips.py         # REST API endpoints
├── schemas/
│   ├── requests/
│   │   └── flight_strip.py      # API request models
│   └── responses/
│       └── flight_strip.py      # API response models
└── config/
    └── config.py                # Configuration management
```

## 🚀 Features

### Core CRUD Operations
- ✅ **Create** flight strips with validation
- ✅ **Read** by ID or call sign
- ✅ **Update** with partial updates support
- ✅ **Delete** with business rule validation

### Advanced Features
- 🔍 **Advanced Search** with multiple filters
- 📊 **Dashboard Statistics** 
- 🎯 **Position Tracking** with real-time updates
- 👨‍✈️ **Controller Assignment** management
- 🚨 **Emergency Status** handling
- 📈 **Priority Management** system

### Business Logic
- **Status Lifecycle Management**: PLANNED → ACTIVE → COMPLETED/CANCELLED
- **Emergency Handling**: Automatic priority escalation
- **Position Updates**: Auto-status updates based on altitude
- **Validation Rules**: Prevent invalid state transitions
- **Attention Alerts**: Smart flagging system for controllers

## 🛠️ Setup Instructions

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Configure Environment
```bash
cp .env.sample .env.dev
```

Edit `.env.dev`:
```env
# MongoDB Configuration
MONGODB_URL=mongodb://localhost:27017
MONGODB_DATABASE=flight_strips_db

# Existing BR-UTM configuration
BRUTM_KEY=<Your BR-UTM Auth Key Here>
BRUTM_BASE_URL=http://api.br-utm.org
```

### 3. Start MongoDB
```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or install MongoDB locally
# https://docs.mongodb.com/manual/installation/
```

### 4. Run the Application
```bash
python -m uvicorn app:app --reload --port 8000
```

### 5. Test the System
```bash
python test_flight_strips.py
```

## 📚 API Documentation

Once running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/flight-strips/` | Create new flight strip |
| `GET` | `/flight-strips/{id}` | Get flight strip by ID |
| `GET` | `/flight-strips/call-sign/{call_sign}` | Get by call sign |
| `PUT` | `/flight-strips/{id}` | Update flight strip |
| `DELETE` | `/flight-strips/{id}` | Delete flight strip |
| `GET` | `/flight-strips/` | Search with filters |
| `GET` | `/flight-strips/status/active` | Get active flights |
| `PATCH` | `/flight-strips/{id}/position` | Update position |
| `PATCH` | `/flight-strips/{id}/controller` | Assign controller |
| `PATCH` | `/flight-strips/{id}/emergency` | Set emergency |
| `GET` | `/flight-strips/dashboard/stats` | Dashboard stats |

## 🎯 Usage Examples

### Create Flight Strip
```bash
curl -X POST "http://localhost:8000/api/flight-strips/" \
  -H "Content-Type: application/json" \
  -d '{
    "call_sign": "UAV001",
    "aircraft_type": "Helicopter",
    "flight_type": "VLOS",
    "departure_point": "SBSP",
    "destination_point": "SBRJ",
    "priority": "NORMAL"
  }'
```

### Update Position
```bash
curl -X PATCH "http://localhost:8000/api/flight-strips/{id}/position" \
  -H "Content-Type: application/json" \
  -d '{
    "location": {"lng": -46.6333, "lat": -23.5505},
    "altitude": {"value": 100.0, "reference": "W84", "units": "M"},
    "heading": 90.0,
    "speed": 15.0
  }'
```

### Search Active Flights
```bash
curl "http://localhost:8000/api/flight-strips/status/active"
```

## 🏛️ Architecture Benefits

### 1. **Separation of Concerns**
- **Domain**: Pure business logic, no external dependencies
- **Application**: Orchestrates use cases, coordinates domain and infrastructure
- **Infrastructure**: Handles external concerns (database, APIs)

### 2. **Testability**
- Domain logic is easily unit testable
- Use cases can be tested with mock repositories
- Infrastructure can be tested in isolation

### 3. **Flexibility**
- Easy to swap MongoDB for PostgreSQL or other databases
- Can add new adapters (Redis cache, external APIs) without changing core logic
- API layer is decoupled from business logic

### 4. **Maintainability**
- Clear boundaries between layers
- Business rules are centralized in domain entities
- Infrastructure changes don't affect business logic

## 🔧 Database Design

### Collections

#### `flight_strips`
```javascript
{
  "_id": ObjectId,
  "call_sign": "UAV001",           // Unique index
  "flight_id": "FL001",
  "aircraft_type": "Helicopter",
  "status": "ACTIVE",              // Index
  "priority": "HIGH",              // Index
  "assigned_controller": "CTRL001", // Index
  "sector": "ALPHA",               // Index
  "current_position": {
    "location": {"lng": -46.6333, "lat": -23.5505},
    "altitude": {"value": 100.0, "reference": "W84", "units": "M"},
    "heading": 90.0,
    "speed": 15.0,
    "timestamp": ISODate
  },
  "created_at": ISODate,           // Index
  "updated_at": ISODate,           // Index
  // ... other fields
}
```

### Indexes
- `call_sign` (unique)
- `status`
- `assigned_controller`
- `sector`
- `priority`
- `created_at`
- `updated_at`
- Compound: `(status, priority)`
- Compound: `(assigned_controller, status)`
- Compound: `(sector, status)`

## 🚨 Business Rules

1. **Call Sign Uniqueness**: No duplicate call signs allowed
2. **Emergency Priority**: Emergency flights automatically get EMERGENCY priority
3. **Status Transitions**: Cannot reactivate COMPLETED/CANCELLED flights
4. **Deletion Rules**: Cannot delete flights in EMERGENCY status
5. **Position Updates**: Altitude changes auto-update operational status
6. **Attention Flags**: High priority or altitude deviations require attention

## 🔮 Future Enhancements

- **Real-time WebSocket updates** for position tracking
- **Conflict detection** between flight paths
- **Integration with external flight planning systems**
- **Audit logging** for all operations
- **Role-based access control** for controllers
- **Automated alerts** for emergency situations
- **Flight history tracking** and analytics
- **Integration with radar systems**

## 🤝 Contributing

This system follows enterprise-grade patterns and is designed for scalability and maintainability. When contributing:

1. Follow the hexagonal architecture principles
2. Keep domain logic pure (no external dependencies)
3. Use dependency injection for testability
4. Add comprehensive tests for new features
5. Update documentation for API changes

## 📄 License

This flight strip management system is part of the BR-UTM ecosystem and follows the project's licensing terms.