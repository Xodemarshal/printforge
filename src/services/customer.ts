import { createAdminClient } from '@/lib/supabase/admin';

export interface CustomerData {
  email?: string;
  phone?: string;
  name?: string;
  userId?: string;
  source?: string;
}

/**
 * Upsert customer data (create or update)
 * GDPR-compliant: only collects data from legitimate sources
 */
export async function upsertCustomer(data: CustomerData) {
  const supabase = createAdminClient();

  try {
    if (!data.email && !data.phone) {
      return { success: false, error: 'Email or phone required' };
    }

    // Check if customer exists
    let query = supabase.from('customers').select('*');

    if (data.email) {
      query = query.eq('email', data.email);
    } else if (data.phone) {
      query = query.eq('phone', data.phone);
    }

    const { data: existingCustomer } = await query.maybeSingle();

    if (existingCustomer) {
      // Update existing customer
      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      if (data.name && !existingCustomer.name) {
        updateData.name = data.name;
      }
      if (data.phone && !existingCustomer.phone) {
        updateData.phone = data.phone;
      }
      if (data.email && !existingCustomer.email) {
        updateData.email = data.email;
      }
      if (data.userId && !existingCustomer.user_id) {
        updateData.user_id = data.userId;
      }

      const { error } = await supabase
        .from('customers')
        .update(updateData)
        .eq('id', existingCustomer.id);

      if (error) throw error;

      return { success: true, customerId: existingCustomer.id, isNew: false };
    }

    // Create new customer
    const { data: newCustomer, error } = await supabase
      .from('customers')
      .insert({
        email: data.email || null,
        phone: data.phone || null,
        name: data.name || null,
        user_id: data.userId || null,
        source: data.source || 'website'
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, customerId: newCustomer.id, isNew: true };
  } catch (error: any) {
    console.error('Customer upsert error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Link customer to order after payment
 */
export async function linkCustomerToOrder(
  orderId: string,
  customerData: {
    email: string;
    phone?: string;
    name: string;
  }
) {
  const supabase = createAdminClient();

  try {
    // Get order details
    const { data: order } = await supabase
      .from('orders')
      .select('user_id, total_amount, created_at')
      .eq('id', orderId)
      .single();

    if (!order) {
      return { success: false, error: 'Order not found' };
    }

    // Upsert customer
    const result = await upsertCustomer({
      email: customerData.email,
      phone: customerData.phone,
      name: customerData.name,
      userId: order.user_id,
      source: 'order'
    });

    if (!result.success) {
      return result;
    }

    // Update customer stats
    const { data: customer } = await supabase
      .from('customers')
      .select('*')
      .eq('id', result.customerId)
      .single();

    if (customer) {
      const updateData: any = {
        total_orders: (customer.total_orders || 0) + 1,
        total_spent: (customer.total_spent || 0) + order.total_amount,
        last_order_date: order.created_at,
        updated_at: new Date().toISOString()
      };

      if (!customer.first_order_date) {
        updateData.first_order_date = order.created_at;
      }

      await supabase
        .from('customers')
        .update(updateData)
        .eq('id', result.customerId);
    }

    return { success: true, customerId: result.customerId };
  } catch (error: any) {
    console.error('Link customer to order error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get customer by email
 */
export async function getCustomerByEmail(email: string) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('email', email)
    .maybeSingle();

  if (error) {
    console.error('Get customer error:', error);
    return null;
  }

  return data;
}

/**
 * Get customer segments
 */
export async function getCustomerSegments() {
  const supabase = createAdminClient();

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  try {
    const { data: customers } = await supabase
      .from('customers')
      .select('*')
      .order('total_spent', { ascending: false });

    if (!customers) return null;

    const segments = {
      new: customers.filter(c => 
        c.total_orders === 1 && 
        new Date(c.first_order_date || 0) >= thirtyDaysAgo
      ),
      active: customers.filter(c => 
        c.total_orders >= 2 && 
        c.total_orders < 5 && 
        new Date(c.last_order_date || 0) >= thirtyDaysAgo
      ),
      loyal: customers.filter(c => 
        c.total_orders >= 5 && 
        new Date(c.last_order_date || 0) >= thirtyDaysAgo
      ),
      vip: customers.filter(c => 
        c.total_spent >= 10000
      ),
      atRisk: customers.filter(c => 
        c.total_orders >= 2 && 
        new Date(c.last_order_date || 0) < ninetyDaysAgo
      )
    };

    return segments;
  } catch (error) {
    console.error('Get customer segments error:', error);
    return null;
  }
}

/**
 * Get top customers
 */
export async function getTopCustomers(limit: number = 10) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('total_spent', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Get top customers error:', error);
    return [];
  }

  return data || [];
}
