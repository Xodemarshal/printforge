import { createAdminClient } from '@/lib/supabase/admin';
import { sendAbandonedCartEmail } from './email';
import type { CartItem } from '@/types';

/**
 * Track cart session
 */
export async function trackCartSession(
  sessionId: string,
  cartItems: CartItem[],
  userId?: string | null
) {
  const supabase = createAdminClient();

  try {
    const cartValue = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    
    // Get customer if email available
    let customerId: string | null = null;
    if (userId) {
      const { data: user } = await supabase
        .from('users')
        .select('email')
        .eq('id', userId)
        .maybeSingle();

      if (user?.email) {
        const { data: customer } = await supabase
          .from('customers')
          .select('id')
          .eq('email', user.email)
          .maybeSingle();
        
        customerId = customer?.id || null;
      }
    }

    // Check if session exists
    const { data: existingSession } = await supabase
      .from('cart_sessions')
      .select('id')
      .eq('session_id', sessionId)
      .maybeSingle();

    if (existingSession) {
      // Update existing session
      const { error } = await supabase
        .from('cart_sessions')
        .update({
          cart_value: cartValue,
          cart_data: cartItems,
          last_activity: new Date().toISOString(),
          customer_id: customerId,
          user_id: userId || null
        })
        .eq('id', existingSession.id);

      if (error) throw error;
      return { success: true, sessionId: existingSession.id };
    }

    // Create new session
    const { data: newSession, error } = await supabase
      .from('cart_sessions')
      .insert({
        session_id: sessionId,
        customer_id: customerId,
        user_id: userId || null,
        cart_value: cartValue,
        cart_data: cartItems,
        last_activity: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, sessionId: newSession.id };
  } catch (error: any) {
    console.error('Track cart session error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Mark carts as abandoned (run this as a cron job)
 */
export async function markAbandonedCarts() {
  const supabase = createAdminClient();

  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    // Find carts that haven't been touched in 1 hour
    const { data: abandonedSessions, error } = await supabase
      .from('cart_sessions')
      .select('*, customers(email, name)')
      .eq('abandoned', false)
      .eq('recovered', false)
      .lt('last_activity', oneHourAgo)
      .gt('cart_value', 0);

    if (error) throw error;

    if (!abandonedSessions || abandonedSessions.length === 0) {
      return { success: true, marked: 0, emailsSent: 0 };
    }

    let marked = 0;
    let emailsSent = 0;

    for (const session of abandonedSessions) {
      // Mark as abandoned
      await supabase
        .from('cart_sessions')
        .update({ abandoned: true })
        .eq('id', session.id);

      marked++;

      // Send recovery email if customer has email
      const customer = session.customers as any;
      if (customer?.email && !session.recovery_email_sent) {
        const cartItems = (session.cart_data as CartItem[]) || [];
        const itemNames = cartItems.map(item => item.name);

        await sendAbandonedCartEmail({
          customerName: customer.name || 'Customer',
          customerEmail: customer.email,
          cartValue: session.cart_value,
          cartItems: itemNames
        });

        await supabase
          .from('cart_sessions')
          .update({ recovery_email_sent: true })
          .eq('id', session.id);

        emailsSent++;
      }
    }

    return { success: true, marked, emailsSent };
  } catch (error: any) {
    console.error('Mark abandoned carts error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Mark cart as recovered
 */
export async function markCartAsRecovered(sessionId: string) {
  const supabase = createAdminClient();

  try {
    const { error } = await supabase
      .from('cart_sessions')
      .update({
        recovered: true,
        recovered_at: new Date().toISOString()
      })
      .eq('session_id', sessionId)
      .eq('abandoned', true);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Mark cart recovered error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get abandoned cart stats
 */
export async function getAbandonedCartStats(days: number = 30) {
  const supabase = createAdminClient();

  try {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const { data: sessions } = await supabase
      .from('cart_sessions')
      .select('*')
      .eq('abandoned', true)
      .gte('created_at', startDate);

    if (!sessions) {
      return {
        totalAbandoned: 0,
        totalValue: 0,
        recovered: 0,
        recoveredValue: 0,
        recoveryRate: 0
      };
    }

    const totalAbandoned = sessions.length;
    const totalValue = sessions.reduce((sum, s) => sum + Number(s.cart_value), 0);
    const recovered = sessions.filter(s => s.recovered).length;
    const recoveredValue = sessions
      .filter(s => s.recovered)
      .reduce((sum, s) => sum + Number(s.cart_value), 0);
    const recoveryRate = totalAbandoned > 0 ? (recovered / totalAbandoned) * 100 : 0;

    return {
      totalAbandoned,
      totalValue,
      recovered,
      recoveredValue,
      recoveryRate
    };
  } catch (error: any) {
    console.error('Get abandoned cart stats error:', error);
    return null;
  }
}
