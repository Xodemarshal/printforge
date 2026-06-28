import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Calculates and saves cost/profit for a specific order.
 * This takes a "snapshot" of product costs at the time of calculation.
 */
export async function calculateOrderProfitability(orderId: string) {
  const supabase = createAdminClient();

  // 1. Fetch the order and its items joined with product costs
  const { data: order, error: fetchError } = await supabase
    .from('orders')
    .select(`
      id,
      total_amount,
      order_items (
        quantity,
        product_id,
        products (
          estimated_total_cost
        )
      )
    `)
    .eq('id', orderId)
    .single();

  if (fetchError || !order) {
    console.error('Error fetching order for profit calculation:', fetchError);
    return { success: false, error: 'Order not found' };
  }

  // 2. Calculate Total Cost from Order Items
  const totalCost = (order.order_items as any[]).reduce((sum, item) => {
    const unitCost = Number(item.products?.estimated_total_cost || 0);
    return sum + (unitCost * item.quantity);
  }, 0);

  const revenue = Number(order.total_amount);
  const profit = revenue - totalCost;
  const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

  // 3. Update the Order table with the results
  const { error: updateError } = await supabase
    .from('orders')
    .update({
      total_cost: totalCost,
      profit_amount: profit,
      profit_margin: margin,
      updated_at: new Date().toISOString()
    })
    .eq('id', orderId);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  return { 
    success: true, 
    data: { totalCost, profit, margin } 
  };
}

/**
 * Updates a product's manufacturing cost metrics and 
 * recalculates the final estimated_total_cost.
 */
export async function updateProductCost(productId: string, data: {
  filamentWeightGrams: number;
  estimatedPrintHours: number;
  estimatedPowerCost: number;
  estimatedPackagingCost: number;
}) {
  const supabase = createAdminClient();

  // Assumption: Filament cost is roughly ₹1.5 per gram (Adjust based on your local price)
  const FILAMENT_COST_PER_GRAM = 1.5; 
  
  const materialCost = data.filamentWeightGrams * FILAMENT_COST_PER_GRAM;
  const totalEstimatedCost = materialCost + data.estimatedPowerCost + data.estimatedPackagingCost;

  const { error } = await supabase
    .from('products')
    .update({
      filament_weight_grams: data.filamentWeightGrams,
      estimated_print_hours: data.estimatedPrintHours,
      estimated_power_cost: data.estimatedPowerCost,
      estimated_packaging_cost: data.estimatedPackagingCost,
      estimated_total_cost: totalEstimatedCost,
      updated_at: new Date().toISOString()
    })
    .eq('id', productId);

  if (error) return { success: false, error: error.message };
  return { success: true, estimatedTotalCost: totalEstimatedCost };
}

/**
 * Aggregates profitability metrics for the dashboard
 */
export async function getProfitabilityReport(days: number = 30) {
  const supabase = createAdminClient();
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const { data: orders, error } = await supabase
    .from('orders')
    .select('total_amount, total_cost, profit_amount, profit_margin')
    .eq('payment_status', 'paid')
    .gte('created_at', startDate);

  if (error) return { success: false, error: error.message };

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
  const totalCost = orders.reduce((sum, o) => sum + Number(o.total_cost || 0), 0);
  const totalProfit = orders.reduce((sum, o) => sum + Number(o.profit_amount || 0), 0);
  const avgMargin = orders.length > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  return {
    success: true,
    report: {
      totalRevenue,
      totalCost,
      totalProfit,
      avgMargin,
      orderCount: orders.length
    }
  };
}