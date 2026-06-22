import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Calculate order profitability
 */
export async function calculateOrderProfitability(orderId: string) {
  const supabase = createAdminClient();

  try {
    // Get order with items
    const { data: order } = await supabase
      .from('orders')
      .select('*, order_items(*, products(*))')
      .eq('id', orderId)
      .single();

    if (!order) return { success: false, error: 'Order not found' };

    let totalCost = 0;
    const orderItems = order.order_items as any[];

    // Calculate costs from products
    for (const item of orderItems) {
      const product = item.products;
      if (product) {
        const itemCost = Number(product.estimated_total_cost || 0) * item.quantity;
        totalCost += itemCost;
      }
    }

    // Add shipping cost (from order)
    const shippingCost = Number(order.shipping_cost || 0);
    totalCost += shippingCost;

    const totalRevenue = Number(order.total_amount);
    const profitAmount = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? (profitAmount / totalRevenue) * 100 : 0;

    // Update order
    const { error } = await supabase
      .from('orders')
      .update({
        total_cost: totalCost,
        profit_amount: profitAmount,
        profit_margin: profitMargin
      })
      .eq('id', orderId);

    if (error) throw error;

    return {
      success: true,
      totalCost,
      profitAmount,
      profitMargin
    };
  } catch (error: any) {
    console.error('Calculate profitability error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update product cost
 */
export async function updateProductCost(
  productId: string,
  costs: {
    filamentWeightGrams?: number;
    estimatedPrintHours?: number;
    estimatedPowerCost?: number;
    estimatedPackagingCost?: number;
  }
) {
  const supabase = createAdminClient();

  try {
    // Calculate total cost
    const materialCost = (costs.filamentWeightGrams || 0) * 0.05; // ₹0.05 per gram
    const powerCost = costs.estimatedPowerCost || 0;
    const packagingCost = costs.estimatedPackagingCost || 0;
    const totalCost = materialCost + powerCost + packagingCost;

    const { error } = await supabase
      .from('products')
      .update({
        filament_weight_grams: costs.filamentWeightGrams,
        estimated_print_hours: costs.estimatedPrintHours,
        estimated_power_cost: costs.estimatedPowerCost,
        estimated_packaging_cost: costs.estimatedPackagingCost,
        estimated_total_cost: totalCost
      })
      .eq('id', productId);

    if (error) throw error;

    return { success: true, totalCost };
  } catch (error: any) {
    console.error('Update product cost error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get profitability report
 */
export async function getProfitabilityReport(days: number = 30) {
  const supabase = createAdminClient();

  try {
    const { data, error } = await supabase
      .rpc('get_profitability_stats', { days });

    if (error) throw error;

    return { success: true, data: data[0] };
  } catch (error: any) {
    console.error('Get profitability report error:', error);
    return { success: false, error: error.message };
  }
}
