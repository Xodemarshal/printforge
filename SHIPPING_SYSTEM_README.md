# Dual Shipping Management System

A comprehensive shipping management system for the PrintForge e-commerce platform that supports both Automatic (Shiprocket) and Manual Shipping modes.

## Features

### 1. **Dual Shipping Modes**
- **Automatic (Shiprocket)**: Automated shipping via Shiprocket API
- **Manual**: Manually managed shipping (India Post, DTDC, Delhivery, etc.)

### 2. **Shipping Modes per Order**
- Every order has a `shipping_mode` field: `"AUTOMATIC"` | `"MANUAL"`
- Default value: `"AUTOMATIC"`
- Can be switched before shipment creation

### 3. **Automatic Mode (Shiprocket)**
- Uses existing Shiprocket integration
- Generates AWB automatically
- Fetches tracking updates via webhooks
- Displays live tracking on customer portal

### 4. **Manual Mode**
- Admin controlled shipping
- Custom status timeline with 10 supported statuses:
  - Order Placed
  - Payment Confirmed
  - Printing
  - Quality Check
  - Packed
  - Ready for Dispatch
  - Shipped
  - Out for Delivery
  - Delivered
  - Cancelled
- Admin can update: Courier Name, Tracking Number, Tracking URL, Dates, Notes

### 5. **Customer Tracking Portal**
- Professional tracking display regardless of shipping mode
- Visual timeline showing progress
- Track package button (if tracking URL exists)
- Shipping details display

### 6. **Admin Dashboard**
- Shipping mode selector per order
- Quick status updates
- Manual shipping detail management
- Professional shipment timeline

## Database Changes

New columns added to `orders` table:

```sql
shipping_mode TEXT DEFAULT 'AUTOMATIC' CHECK (shipping_mode IN ('AUTOMATIC', 'MANUAL'))
shipment_status TEXT CHECK (shipment_status IN (...statuses...))
courier_name TEXT
tracking_number TEXT
tracking_url TEXT
dispatch_date TIMESTAMPTZ
delivered_date TIMESTAMPTZ
shipment_notes TEXT
```

## Architecture

```
/src
├── /types
│   └── shipping.ts           # Core shipping types and interfaces
├── /lib/shipping
│   ├── provider.ts           # Provider factory
│   ├── shiprocket.ts         # Shiprocket provider implementation
│   ├── manual.ts             # Manual shipping provider
│   └── utils.ts              # Shipping utilities
├── /actions
│   └── shipping.ts           # Server actions for shipping management
├── /components/shipping
│   ├── AdminShippingPanel.tsx    # Admin shipping management
│   ├── CustomerTrackingPanel.tsx # Customer tracking display
│   └── ShipmentTimeline.tsx      # Visual timeline component
└── /services
    └── shiprocket.ts         # Existing Shiprocket service
```

## Provider Interface

All shipping providers implement this interface:

```typescript
interface ShippingProvider {
  createShipment(orderId: string): Promise<ShipmentResult>;
  cancelShipment(orderId: string): Promise<CancelResult>;
  trackShipment(orderId: string): Promise<TrackingResult>;
  generateLabel(orderId: string): Promise<LabelResult>;
}
```

## How to Use

### 1. **Running the Migration**
Run the SQL migration file in your Supabase database:
```bash
psql -h your-db-host -U your-username -d your-database -f supabase/migrations/database-migration-shipping.sql
```

### 2. **Admin Order Management**
- Navigate to `/admin/orders/[id]`
- View the new **Shipping Management** panel
- Switch between Automatic/Manual modes (before shipment)
- Update manual shipping details
- Change shipment status with one click

### 3. **Customer View**
- Customers see the professional tracking page at `/orders/[id]`
- Shows both Automatic (Shiprocket) and Manual shipments
- Visual timeline for order progress
- Track package button if tracking URL exists

### 4. **API/Server Actions**
```typescript
// Switch shipping mode
await switchShippingMode(orderId, "MANUAL");

// Create shipment (works for both modes)
await createShipment(orderId);

// Update manual shipment details
await updateManualShipment(orderId, {
  shipmentStatus: "shipped",
  courierName: "India Post",
  trackingNumber: "EM123456789IN"
});

// Get tracking information
await getShipmentTracking(orderId);
```

## Extending the System

### Adding a New Provider
1. Create a new provider class in `/lib/shipping/`
2. Implement the `ShippingProvider` interface
3. Update `provider.ts` factory function
4. Add provider to `listProviders()`

### Example New Provider
```typescript
export class CustomCourierProvider implements ShippingProvider {
  name = "Custom Courier";
  
  async createShipment(orderId: string): Promise<ShipmentResult> {
    // Implement custom courier logic
  }
  
  // ... other methods
}
```

## Status Mapping

### Automatic Mode (Shiprocket) → Manual Status
- `delivered` → `delivered`
- `out_for_delivery` → `out_for_delivery`
- `in_transit`, `shipped` → `shipped`
- `manifested`, `label_generated` → `ready_for_dispatch`
- Others → `order_placed`

### Manual Status Flow
```
order_placed → payment_confirmed → printing → quality_check → 
packed → ready_for_dispatch → shipped → out_for_delivery → delivered
```

## Error Handling

- Graceful error handling for all shipping operations
- User-friendly error messages
- Automatic retry logic for Shiprocket API failures
- Validation for tracking URLs and dates

## Testing

The system includes:
- TypeScript for type safety
- Input validation
- Error boundary components
- Loading states
- Success/error toasts

## Future Enhancements

1. **Additional Providers**: Add FedEx, DHL, UPS providers
2. **Bulk Operations**: Bulk shipping label generation
3. **Advanced Analytics**: Shipping cost analysis
4. **International Shipping**: Support for international couriers
5. **Shipping Rules**: Automatic courier selection based on weight, destination

## Support

For issues or questions:
1. Check the error logs in admin panel
2. Verify database migration completed successfully
3. Ensure Shiprocket credentials are configured
4. Review order data for completeness

---

**Note**: The existing Shiprocket functionality remains fully intact. All modifications are additive and backward compatible.
