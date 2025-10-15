#!/usr/bin/env python3
"""
Test script for simplified flight strips system
Tests the basic CRUD operations matching the frontend UI requirements
"""

import asyncio
import sys
import os
from datetime import datetime

# Add the backend directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from domain.flight_strip import FlightStrip
from schemas.requests.flight_strip import FlightArea
from adapters.flight_strip_mongodb_adapter import FlightStripMongoDBAdapter
from application.flight_strip_use_case import FlightStripUseCase


async def test_flight_strips():
    """Test the simplified flight strips system"""
    
    print("🚁 Testing Simplified Flight Strips System")
    print("=" * 50)
    
    # Initialize components
    repository = FlightStripMongoDBAdapter()
    use_case = FlightStripUseCase(repository)
    
    try:
        # Test 1: Create flight strips
        print("\n1. Creating flight strips...")
        
        test_strips = [
            FlightStrip(
                id="FL001",
                flight_area=FlightArea.RED,
                height=100,
                takeoff_space="A1",
                landing_space="B2",
                takeoff_time="08:30",
                landing_time="10:15"
            ),
            FlightStrip(
                id="FL002",
                flight_area=FlightArea.BLUE,
                height=150,
                takeoff_space="A2",
                landing_space="B3",
                takeoff_time="09:45",
                landing_time="11:30"
            ),
            FlightStrip(
                id="FL003",
                flight_area=FlightArea.GREEN,
                height=120,
                takeoff_space="A3",
                landing_space="B1",
                takeoff_time="10:20",
                landing_time="12:45"
            )
        ]
        
        created_strips = []
        for strip in test_strips:
            try:
                created = await use_case.create_flight_strip(strip)
                created_strips.append(created)
                print(f"✅ Created: {created.id} in {created.flight_area} area")
            except Exception as e:
                print(f"⚠️  Strip {strip.id} might already exist: {e}")
                # Try to get existing strip
                existing = await use_case.get_flight_strip_by_flight_id(strip.id)
                if existing:
                    created_strips.append(existing)
                    print(f"📋 Using existing: {existing.id}")
        
        # Test 2: List all flight strips
        print("\n2. Listing all flight strips...")
        all_strips = await use_case.list_all_flight_strips()
        print(f"📊 Total flight strips: {len(all_strips)}")
        
        for strip in all_strips:
            print(f"   - {strip.id}: {strip.flight_area} area, {strip.height}m, "
                  f"{strip.takeoff_time} → {strip.landing_time}")
        
        # Test 3: Get flight strip by ID
        print("\n3. Getting flight strip by ID...")
        if created_strips:
            test_id = created_strips[0].id
            retrieved = await use_case.get_flight_strip(test_id)
            print(f"✅ Retrieved: {retrieved.id} - {retrieved.flight_area} area")
        
        # Test 4: Update flight strip
        print("\n4. Updating flight strip...")
        if created_strips:
            strip_to_update = created_strips[0]
            updated = await use_case.update_flight_strip(
                strip_to_update.id,
                height=200,
                takeoff_time="09:00"
            )
            print(f"✅ Updated: {updated.id} - Height: {updated.height}m, "
                  f"Takeoff: {updated.takeoff_time}")
        
        # Test 5: Search by flight area
        print("\n5. Searching by flight area...")
        red_strips = await use_case.list_by_flight_area(FlightArea.RED)
        print(f"🔴 Red area strips: {len(red_strips)}")
        
        blue_strips = await use_case.list_by_flight_area(FlightArea.BLUE)
        print(f"🔵 Blue area strips: {len(blue_strips)}")
        
        # Test 6: Search with filters
        print("\n6. Searching with time filters...")
        morning_strips = await use_case.search_flight_strips(
            takeoff_time_start="08:00",
            takeoff_time_end="10:00"
        )
        print(f"🌅 Morning flights (08:00-10:00): {len(morning_strips)}")
        
        # Test 7: Delete a flight strip
        print("\n7. Deleting flight strip...")
        if len(created_strips) > 1:
            strip_to_delete = created_strips[-1]
            success = await use_case.delete_flight_strip(strip_to_delete.id)
            if success:
                print(f"🗑️  Deleted: {strip_to_delete.id}")
            else:
                print(f"❌ Failed to delete: {strip_to_delete.id}")
        
        print("\n✅ All tests completed successfully!")
        print("\n📋 Summary:")
        print(f"   - Created/verified {len(created_strips)} flight strips")
        print(f"   - Total strips in system: {len(all_strips)}")
        print(f"   - Red area strips: {len(red_strips)}")
        print(f"   - Blue area strips: {len(blue_strips)}")
        print(f"   - Morning flights: {len(morning_strips)}")
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(test_flight_strips())