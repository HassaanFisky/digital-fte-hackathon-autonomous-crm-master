import asyncio, random
from typing import Dict, Any, Optional

async def get_order_status(order_id: str) -> Dict[str, Any]:
    """
    Mock ERP Integration for ARIA.
    In a real scenario, this would call SAP, Shopify, or a custom Order DB.
    """
    # Simulate API latency
    await asyncio.sleep(0.8)
    
    # Deterministic mock data for demo consistency
    statuses = ["processing", "shipped", "delivered", "exception", "delayed"]
    carriers = ["FedEx", "UPS", "DHL", "SF Express"]
    
    # Basic validation
    if not order_id.startswith("ORD-"):
        return {"error": "Invalid Order ID format. Expected ORD-XXXXX"}
    
    return {
        "order_id": order_id,
        "status": random.choice(statuses),
        "last_updated": "2026-03-19T10:45:00Z",
        "tracking_number": f"{random.randint(1000000000, 9999999999)}",
        "carrier": random.choice(carriers),
        "estimated_arrival": "2026-03-22",
        "items": [
            {"sku": "SKU-90210", "name": "Enterprise SaaS Seat", "qty": 5},
            {"sku": "SKU-11223", "name": "Priority Support Add-on", "qty": 1}
        ]
    }

async def trigger_fulfillment_recheck(order_id: str) -> str:
    """Manual trigger to push a stuck order through the pipeline."""
    await asyncio.sleep(1.2)
    return f"Fulfillment signal re-sent to warehouse for {order_id}. Priority changed to 'Critical'."
