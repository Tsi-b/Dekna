#!/usr/bin/env python
"""
Quick script to seed additional mock orders for Chapa and Telebirr testing.

Usage:
    python seed_test_orders.py <user_id>

Example:
    python seed_test_orders.py 12345678-1234-1234-1234-123456789abc

This will create 10 new mock orders with varying amounts for testing:
- 5 orders for Chapa testing (amounts: 50, 150, 250, 500, 1000 ETB)
- 5 orders for Telebirr testing (amounts: 75, 200, 350, 750, 1500 ETB)
"""

import os
import sys
import django

# Setup Django environment
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from services.supabase_client import get_supabase_client
from django.conf import settings


def seed_test_orders(user_id: str):
    """Seed mock orders for testing Chapa and Telebirr payments."""
    
    if settings.DJANGO_ENV != "development":
        print("❌ Error: This script only works in development mode.")
        print("   Set DJANGO_ENV=development in your .env file.")
        sys.exit(1)
    
    client = get_supabase_client()
    
    # Chapa test orders with various amounts
    chapa_orders = [
        {"amount": "50.00", "label": "Small order"},
        {"amount": "150.00", "label": "Medium order"},
        {"amount": "250.00", "label": "Standard order"},
        {"amount": "500.00", "label": "Large order"},
        {"amount": "1000.00", "label": "Premium order"},
    ]
    
    # Telebirr test orders with various amounts
    telebirr_orders = [
        {"amount": "75.00", "label": "Small order"},
        {"amount": "200.00", "label": "Medium order"},
        {"amount": "350.00", "label": "Standard order"},
        {"amount": "750.00", "label": "Large order"},
        {"amount": "1500.00", "label": "Premium order"},
    ]
    
    print(f"🔄 Creating mock orders for user: {user_id}\n")
    
    # Create Chapa orders
    print("📦 Creating Chapa test orders...")
    chapa_rows = []
    for i, order in enumerate(chapa_orders, 1):
        chapa_rows.append({
            "user_id": user_id,
            "external_ref": f"chapa-test-{user_id[:8]}-{i}",
            "status": "created",
            "is_mock": True,
            "metadata": {
                "amount": order["amount"],
                "currency": "ETB",
                "provider": "chapa",
                "test_label": order["label"]
            }
        })
    
    try:
        resp = client.table("orders").insert(chapa_rows).execute()
        chapa_count = len(getattr(resp, "data", []))
        print(f"✅ Created {chapa_count} Chapa test orders")
        for i, order in enumerate(chapa_orders, 1):
            print(f"   - Order {i}: {order['amount']} ETB ({order['label']})")
    except Exception as e:
        print(f"❌ Failed to create Chapa orders: {e}")
        sys.exit(1)
    
    # Create Telebirr orders
    print("\n📦 Creating Telebirr test orders...")
    telebirr_rows = []
    for i, order in enumerate(telebirr_orders, 1):
        telebirr_rows.append({
            "user_id": user_id,
            "external_ref": f"telebirr-test-{user_id[:8]}-{i}",
            "status": "created",
            "is_mock": True,
            "metadata": {
                "amount": order["amount"],
                "currency": "ETB",
                "provider": "telebirr",
                "test_label": order["label"]
            }
        })
    
    try:
        resp = client.table("orders").insert(telebirr_rows).execute()
        telebirr_count = len(getattr(resp, "data", []))
        print(f"✅ Created {telebirr_count} Telebirr test orders")
        for i, order in enumerate(telebirr_orders, 1):
            print(f"   - Order {i}: {order['amount']} ETB ({order['label']})")
    except Exception as e:
        print(f"❌ Failed to create Telebirr orders: {e}")
        sys.exit(1)
    
    print(f"\n✨ Success! Created {chapa_count + telebirr_count} total mock orders")
    print(f"\n💡 You can now test payments with these orders:")
    print(f"   - Chapa: 5 orders (50-1000 ETB)")
    print(f"   - Telebirr: 5 orders (75-1500 ETB)")
    print(f"\n🔗 All orders are in 'created' status and ready for payment testing.")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python seed_test_orders.py <user_id>")
        print("\nExample:")
        print("  python seed_test_orders.py 12345678-1234-1234-1234-123456789abc")
        sys.exit(1)
    
    user_id = sys.argv[1]
    
    # Basic UUID validation
    if len(user_id) != 36 or user_id.count('-') != 4:
        print("❌ Error: Invalid user_id format. Expected UUID format.")
        print("   Example: 12345678-1234-1234-1234-123456789abc")
        sys.exit(1)
    
    seed_test_orders(user_id)
