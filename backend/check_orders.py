#!/usr/bin/env python
"""
Quick script to check existing orders for a user.

Usage:
    python check_orders.py <user_id>

Example:
    python check_orders.py 12345678-1234-1234-1234-123456789abc
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


def check_orders(user_id: str):
    """Check existing orders for a user."""
    
    client = get_supabase_client()
    
    print(f"🔍 Checking orders for user: {user_id}\n")
    
    try:
        # Get all orders for the user
        resp = client.table("orders").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        orders = getattr(resp, "data", [])
        
        if not orders:
            print("📭 No orders found for this user.")
            print("\n💡 Create some test orders using:")
            print(f"   python seed_test_orders.py {user_id}")
            return
        
        print(f"📦 Found {len(orders)} order(s):\n")
        
        # Group by status
        by_status = {}
        for order in orders:
            status = order.get("status", "unknown")
            if status not in by_status:
                by_status[status] = []
            by_status[status].append(order)
        
        # Display summary
        print("📊 Summary by status:")
        for status, order_list in sorted(by_status.items()):
            mock_count = sum(1 for o in order_list if o.get("is_mock"))
            print(f"   {status}: {len(order_list)} orders ({mock_count} mock)")
        
        print("\n" + "="*80)
        print("📋 Order Details:")
        print("="*80 + "\n")
        
        # Display each order
        for i, order in enumerate(orders, 1):
            order_id = order.get("id", "N/A")
            status = order.get("status", "unknown")
            is_mock = "🧪 MOCK" if order.get("is_mock") else "💰 REAL"
            external_ref = order.get("external_ref", "N/A")
            created_at = order.get("created_at", "N/A")
            
            metadata = order.get("metadata", {}) or {}
            amount = metadata.get("amount", "N/A")
            currency = metadata.get("currency", "ETB")
            provider = metadata.get("provider", "N/A")
            test_label = metadata.get("test_label", "")
            
            print(f"Order #{i}")
            print(f"  ID: {order_id}")
            print(f"  Status: {status}")
            print(f"  Type: {is_mock}")
            print(f"  External Ref: {external_ref}")
            print(f"  Amount: {amount} {currency}")
            if provider != "N/A":
                print(f"  Provider: {provider}")
            if test_label:
                print(f"  Label: {test_label}")
            print(f"  Created: {created_at}")
            print()
        
        # Show payment info if available
        print("="*80)
        print("💳 Checking payment records...")
        print("="*80 + "\n")
        
        for order in orders:
            order_id = order.get("id")
            try:
                payment_resp = client.table("payments").select("*").eq("order_id", order_id).execute()
                payments = getattr(payment_resp, "data", [])
                
                if payments:
                    for payment in payments:
                        print(f"Payment for Order {order_id[:8]}...")
                        print(f"  Payment ID: {payment.get('id')}")
                        print(f"  Status: {payment.get('status')}")
                        print(f"  Provider: {payment.get('provider', 'N/A')}")
                        print(f"  Amount: {payment.get('amount')} {payment.get('currency')}")
                        if payment.get('tx_ref'):
                            print(f"  TX Ref: {payment.get('tx_ref')}")
                        if payment.get('c2b_merch_order_id'):
                            print(f"  Merch Order ID: {payment.get('c2b_merch_order_id')}")
                        print()
            except Exception as e:
                print(f"  ⚠️  Could not fetch payments: {e}\n")
        
    except Exception as e:
        print(f"❌ Error fetching orders: {e}")
        sys.exit(1)


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python check_orders.py <user_id>")
        print("\nExample:")
        print("  python check_orders.py 12345678-1234-1234-1234-123456789abc")
        sys.exit(1)
    
    user_id = sys.argv[1]
    
    # Basic UUID validation
    if len(user_id) != 36 or user_id.count('-') != 4:
        print("❌ Error: Invalid user_id format. Expected UUID format.")
        print("   Example: 12345678-1234-1234-1234-123456789abc")
        sys.exit(1)
    
    check_orders(user_id)
