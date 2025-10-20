"""
Test script for Flight Strip CRUD operations
Run this after starting the application to test the MongoDB integration
"""

import asyncio
import httpx
from datetime import datetime, timedelta
from typing import Dict, Any

BASE_URL = "http://localhost:8000/api/flight-strips"


async def test_flight_strip_crud():
    """Test complete CRUD operations for flight strips"""
    
    async with httpx.AsyncClient() as client:
        print("🚁 Testing Flight Strip CRUD Operations\n")
        
        # Test 1: Create a flight strip
        print("1. Creating flight strip...")
        create_data = {
            "call_sign": "UAV001",
            "flight_id": "FL001",
            "aircraft_type": "Helicopter",
            "registration": "PP-UAV01",
            "departure_point": "SBSP",
            "destination_point": "SBRJ",
            "planned_departure_time": (datetime.utcnow() + timedelta(hours=1)).isoformat() + "Z",
            "estimated_arrival_time": (datetime.utcnow() + timedelta(hours=3)).isoformat() + "Z",
            "flight_type": "VLOS",
            "priority": "NORMAL",
            "requested_altitude": {
                "value": 100.0,
                "reference": "W84",
                "units": "M"
            },
            "assigned_altitude": {
                "value": 100.0,
                "reference": "W84",
                "units": "M"
            },
            "planned_route": [
                {"lng": -46.6333, "lat": -23.5505},
                {"lng": -43.1729, "lat": -22.9068}
            ],
            "assigned_controller": "CTRL001",
            "sector": "ALPHA",
            "remarks": "Test flight for system validation"
        }
        
        response = await client.post(BASE_URL, json=create_data)
        if response.status_code == 201:
            flight_strip = response.json()["flight_strip"]
            flight_id = flight_strip["id"]
            print(f"✅ Created flight strip: {flight_strip['call_sign']} (ID: {flight_id})")
        else:
            print(f"❌ Failed to create flight strip: {response.text}")
            return
        
        # Test 2: Get flight strip by ID
        print(f"\n2. Retrieving flight strip by ID...")
        response = await client.get(f"{BASE_URL}/{flight_id}")
        if response.status_code == 200:
            retrieved_strip = response.json()
            print(f"✅ Retrieved flight strip: {retrieved_strip['call_sign']}")
        else:
            print(f"❌ Failed to retrieve flight strip: {response.text}")
        
        # Test 3: Get flight strip by call sign
        print(f"\n3. Retrieving flight strip by call sign...")
        response = await client.get(f"{BASE_URL}/call-sign/UAV001")
        if response.status_code == 200:
            retrieved_strip = response.json()
            print(f"✅ Retrieved flight strip by call sign: {retrieved_strip['call_sign']}")
        else:
            print(f"❌ Failed to retrieve flight strip by call sign: {response.text}")
        
        # Test 4: Update position
        print(f"\n4. Updating flight position...")
        position_data = {
            "location": {"lng": -46.6000, "lat": -23.5000},
            "altitude": {
                "value": 120.0,
                "reference": "W84",
                "units": "M"
            },
            "heading": 90.0,
            "speed": 15.0,
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
        
        response = await client.patch(f"{BASE_URL}/{flight_id}/position", json=position_data)
        if response.status_code == 200:
            updated_strip = response.json()["flight_strip"]
            print(f"✅ Updated position for flight: {updated_strip['call_sign']}")
        else:
            print(f"❌ Failed to update position: {response.text}")
        
        # Test 5: Update flight strip
        print(f"\n5. Updating flight strip...")
        update_data = {
            "status": "ACTIVE",
            "priority": "HIGH",
            "remarks": "Updated test flight - now active"
        }
        
        response = await client.put(f"{BASE_URL}/{flight_id}", json=update_data)
        if response.status_code == 200:
            updated_strip = response.json()["flight_strip"]
            print(f"✅ Updated flight strip: {updated_strip['call_sign']} - Status: {updated_strip['status']}")
        else:
            print(f"❌ Failed to update flight strip: {response.text}")
        
        # Test 6: Search active flights
        print(f"\n6. Searching active flights...")
        response = await client.get(f"{BASE_URL}/status/active")
        if response.status_code == 200:
            active_flights = response.json()["flight_strips"]
            print(f"✅ Found {len(active_flights)} active flights")
        else:
            print(f"❌ Failed to search active flights: {response.text}")
        
        # Test 7: Get dashboard stats
        print(f"\n7. Getting dashboard statistics...")
        response = await client.get(f"{BASE_URL}/dashboard/stats")
        if response.status_code == 200:
            stats = response.json()
            print(f"✅ Dashboard stats: {stats['status_counts']}")
        else:
            print(f"❌ Failed to get dashboard stats: {response.text}")
        
        # Test 8: Set emergency status
        print(f"\n8. Setting emergency status...")
        emergency_data = {
            "emergency_info": "Engine failure - requesting immediate landing"
        }
        
        response = await client.patch(f"{BASE_URL}/{flight_id}/emergency", json=emergency_data)
        if response.status_code == 200:
            emergency_strip = response.json()["flight_strip"]
            print(f"🚨 Emergency set for flight: {emergency_strip['call_sign']} - Priority: {emergency_strip['priority']}")
        else:
            print(f"❌ Failed to set emergency: {response.text}")
        
        # Test 9: Search with filters
        print(f"\n9. Searching with filters...")
        response = await client.get(f"{BASE_URL}/?status=EMERGENCY&priority=EMERGENCY")
        if response.status_code == 200:
            emergency_flights = response.json()["flight_strips"]
            print(f"🚨 Found {len(emergency_flights)} emergency flights")
        else:
            print(f"❌ Failed to search with filters: {response.text}")
        
        # Test 10: Delete flight strip (this should fail due to emergency status)
        print(f"\n10. Attempting to delete emergency flight (should fail)...")
        response = await client.delete(f"{BASE_URL}/{flight_id}")
        if response.status_code == 403:
            print(f"✅ Correctly prevented deletion of emergency flight")
        else:
            print(f"❌ Unexpected response when deleting emergency flight: {response.status_code}")
        
        # Test 11: Update status to completed and then delete
        print(f"\n11. Updating to completed status and deleting...")
        update_data = {"status": "COMPLETED"}
        response = await client.put(f"{BASE_URL}/{flight_id}", json=update_data)
        
        if response.status_code == 200:
            response = await client.delete(f"{BASE_URL}/{flight_id}")
            if response.status_code == 200:
                deleted_response = response.json()
                print(f"✅ Successfully deleted flight strip: {deleted_response['deleted_id']}")
            else:
                print(f"❌ Failed to delete flight strip: {response.text}")
        else:
            print(f"❌ Failed to update status to completed: {response.text}")
        
        print(f"\n🎉 Flight Strip CRUD testing completed!")


if __name__ == "__main__":
    print("Make sure your application is running on http://localhost:8000")
    print("And MongoDB is running on mongodb://localhost:27017\n")
    asyncio.run(test_flight_strip_crud())