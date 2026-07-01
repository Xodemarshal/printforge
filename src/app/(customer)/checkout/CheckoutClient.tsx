"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Loader2 } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { formatCurrency } from "@/lib/utils";
import { CreditCard, Truck, Shield, ArrowLeft, Smartphone, Wallet } from "lucide-react";
import Link from "next/link";
import { createOrderAction, verifyPaymentAction } from "@/actions/checkout";
import { validateCouponAction } from "@/actions/coupons";

const SHIPPING_COST = 15;
const FREE_SHIPPING_THRESHOLD = 299;

type PaymentMethod = "razorpay";

export function CheckoutClient() {
  const { items, getTotalPrice, clearCart } = useCart();
  const { success, error } = useToast();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPreparing, setOrderPreparing] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>("razorpay");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [checkoutKey] = useState(() => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`);

  const subtotal = getTotalPrice();
  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const totalBeforeDiscount = subtotal + shippingCost;
  const total = Math.max(0, totalBeforeDiscount - discountAmount);

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setIsValidatingCoupon(true);
    try {
      const result = await validateCouponAction(couponCode, subtotal);
      if (result.valid) {
        setAppliedCoupon(result.coupon);
        setDiscountAmount(result.discountAmount || 0);
        success("Coupon Applied", `You saved ₹${result.discountAmount?.toLocaleString()}!`);
      } else {
        error("Invalid Coupon", result.error || "Could not validate coupon");
        setAppliedCoupon(null);
        setDiscountAmount(0);
      }
    } catch (err) {
      error("Error", "Failed to apply coupon");
    } finally {
      setIsValidatingCoupon(false);
    }
  };



  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsProcessing(true);

    try {
      const formData = new FormData(event.currentTarget);
      
      const shippingAddress = {
        fullName: `${formData.get("firstName") as string} ${formData.get("lastName") as string}`.trim(),
        phone: formData.get("phone") as string,
        email: formData.get("email") as string,
        street: formData.get("address") as string,
        city: formData.get("city") as string,
        state: formData.get("state") as string,
        zipCode: formData.get("zipCode") as string,
        country: formData.get("country") as string
      };

      const result = await createOrderAction({
        items: items.map(item => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        shippingAddress,
        paymentMethod: selectedPayment,
        subtotal,
        shippingCost,
        total,
        discountAmount,
        couponId: appliedCoupon?.id,
        idempotencyKey: checkoutKey
      });

      if (result.error) {
        error("Order Failed", result.error);
        setIsProcessing(false);
        return;
      }



      if (result.razorpayOrderId && result.razorpayKeyId) {
        const options = {
          key: result.razorpayKeyId,
          amount: Math.round(total * 100),
          currency: "INR",
          name: "PrintForge",
          description: `Order #${result.orderId?.slice(0, 8)}`,
          order_id: result.razorpayOrderId,
          handler: async function (response: any) {
            try {
              const verifyResult = await verifyPaymentAction(
                result.orderId!,
                response.razorpay_payment_id,
                response.razorpay_signature
              );
              
              if (verifyResult.success) {
                clearCart();
                setOrderPreparing(true);
                // Small delay to let the order record propagate
                await new Promise(resolve => setTimeout(resolve, 1800));
                router.push(`/orders/${result.orderId}`);
              } else {
                error("Payment Verification Failed", verifyResult.error || "Please contact support.");
              }
            } catch (err: any) {
              error("Verification Error", err.message || "Failed to verify payment.");
            } finally {
              setIsProcessing(false);
            }
          },
          prefill: {
            name: shippingAddress.fullName,
            email: formData.get("email"),
            contact: formData.get("phone")
          },
          theme: {
            color: "#2C5F2D"
          },
          modal: {
            ondismiss: function() {
              setIsProcessing(false);
              error("Payment Cancelled", "You cancelled the payment. Your order is saved and awaiting payment.");
            }
          }
        };

        const razorpay = new (window as any).Razorpay(options);
        razorpay.open();
      } else {
        success("Order Placed!", `Your order #${result.orderId?.slice(0, 8)} has been placed.`);
        clearCart();
        router.push(`/orders/${result.orderId}`);
        setIsProcessing(false);
      }
    } catch (err: any) {
      error("Order Failed", err.message || "Something went wrong. Please try again.");
      setIsProcessing(false);
    }
  };

  if (orderPreparing) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FAF8F5]" style={{ fontFamily: "Inter, sans-serif" }}>
        <div className="text-center max-w-sm px-6">
          <div className="relative mb-8">
            <div className="w-24 h-24 mx-auto rounded-full bg-[#2C5F2D]/10 flex items-center justify-center">
              <CheckCircle size={48} className="text-[#2C5F2D]" />
            </div>
            <span className="absolute bottom-0 right-1/2 translate-x-12 translate-y-1">
              <Loader2 size={22} className="text-[#D4A017] animate-spin" />
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#2C5F2D] mb-2">Payment Successful!</h1>
          <p className="text-lg font-semibold text-[#4a3728] mb-1">Your order is being prepared</p>
          <p className="text-sm text-[#7a6a5a] mb-6">Please wait a moment while we confirm your order details and get everything ready...</p>
          <div className="flex justify-center gap-1.5 mt-2">
            {[0, 1, 2].map(i => (
              <span
                key={i}
                className="w-2 h-2 rounded-full bg-[#2C5F2D] animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="page-shell py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-forest mb-4">Your cart is empty</h1>
          <p className="text-forest/70 mb-8">Add some products to your cart before checking out.</p>
          <Link 
            href="/shop"
            className="inline-block bg-forest text-white px-6 py-3 rounded-lg font-semibold hover:bg-forest-dark transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link 
            href="/shop"
            className="flex items-center gap-2 text-forest/60 hover:text-forest transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Shop
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-forest mb-2">Checkout</h1>
              <p className="text-forest/70">Complete your order details below</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="bg-cream/30 border border-forest/20 rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-forest mb-4">Contact Information</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <Input name="firstName" placeholder="First Name" required />
                  <Input name="lastName" placeholder="Last Name" required />
                </div>
                <Input type="email" name="email" placeholder="Email Address" className="mt-4" required />
                <Input type="tel" name="phone" placeholder="Phone Number" className="mt-4" required />
              </div>

              <div className="bg-cream/30 border border-forest/20 rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-forest mb-4">Shipping Address</h2>
                <div className="space-y-4">
                  <Input name="address" placeholder="Street Address" required />
                <div className="grid md:grid-cols-3 gap-4">
                  <Input name="city" placeholder="City" required />
                  <Input name="state" placeholder="State" required />
                  <Input name="zipCode" placeholder="ZIP Code" required />
                </div>
                  <select name="country" defaultValue="IN" className="w-full px-3 py-2 border border-forest/30 rounded-lg focus:border-forest focus:outline-none" required>
                    <option value="IN">India</option>
                  </select>
                  <p className="text-xs text-forest/60">Shiprocket shipping is enabled for Indian delivery addresses.</p>
                </div>
              </div>

              <div className="bg-cream/30 border border-forest/20 rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-forest mb-4">Payment Method</h2>
                <div className="flex items-center gap-4 p-4 rounded-xl border border-forest/10 bg-white/50">
                  <div className="p-2 rounded-lg bg-cream/50"><CreditCard size={20} className="text-forest" /></div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-forest">Pay Online</p>
                    <p className="text-sm text-forest/60">Pay securely via Razorpay (UPI, Cards, Netbanking, Wallets)</p>
                  </div>
                </div>
              </div>

              <div className="bg-cream/30 border border-forest/20 rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-forest mb-4">Order Notes (Optional)</h2>
                <Textarea name="instructions" placeholder="Any special delivery instructions..." rows={3} />
              </div>

              <Button type="submit" disabled={isProcessing} className="w-full bg-forest hover:bg-forest-dark text-white py-4 text-lg font-semibold">
                {isProcessing ? "Processing..." : `Place Order - ${formatCurrency(total)}`}
              </Button>
            </form>
          </div>

          <div className="lg:sticky lg:top-8 lg:self-start">
            <div className="bg-cream/50 border border-forest/20 rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-forest mb-6">Order Summary</h2>
              <div className="space-y-4 mb-6">
                {items.map((item: any) => (
                  <div key={item.productId} className="flex items-center gap-3 p-3 bg-white/50 border border-forest/10 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-forest truncate">{item.name}</p>
                      <p className="text-sm text-forest/60">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-forest">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
              {/* Totals */}
              <div className="border-t border-forest/20 pt-4 space-y-2">
                <div className="flex justify-between text-forest/70">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-forest/70">
                  <span>Shipping</span>
                  <span>{shippingCost === 0 ? 'Free' : formatCurrency(shippingCost)}</span>
                </div>
                
                {discountAmount > 0 && (
                  <div className="flex justify-between text-red-600 font-medium">
                    <span>Discount {appliedCoupon && `(${appliedCoupon.code})`}</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}

                <div className="pt-4 pb-2">
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Coupon Code" 
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="h-10 border-forest/20"
                      disabled={appliedCoupon || isValidatingCoupon}
                    />
                    {appliedCoupon ? (
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setAppliedCoupon(null);
                          setDiscountAmount(0);
                          setCouponCode("");
                        }}
                        className="h-10 border-red-200 text-red-600 hover:bg-red-50"
                      >
                        Remove
                      </Button>
                    ) : (
                      <Button 
                        type="button" 
                        onClick={handleApplyCoupon}
                        disabled={!couponCode || isValidatingCoupon}
                        className="h-10 bg-forest text-white"
                      >
                        {isValidatingCoupon ? "..." : "Apply"}
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex justify-between text-lg font-semibold text-forest border-t border-forest/20 pt-2">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
