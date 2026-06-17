"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
const FREE_SHIPPING_THRESHOLD = 150;

type PaymentMethod = "card" | "paypal" | "apple-pay" | "google-pay" | "upi" | "bank-transfer";

export function CheckoutClient() {
  const { items, getTotalPrice, clearCart } = useCart();
  const { success, error } = useToast();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>("card");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

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

  const paymentMethods = [
    {
      id: "card" as PaymentMethod,
      name: "Credit / Debit Card",
      icon: <CreditCard size={20} />,
      description: "Pay securely with your card"
    },
    {
      id: "upi" as PaymentMethod,
      name: "UPI",
      icon: <Smartphone size={20} />,
      description: "Pay via UPI (Google Pay, PhonePe, Paytm)"
    },
    {
      id: "paypal" as PaymentMethod,
      name: "PayPal",
      icon: <Wallet size={20} />,
      description: "Pay with your PayPal account"
    },
    {
      id: "apple-pay" as PaymentMethod,
      name: "Apple Pay",
      icon: <Smartphone size={20} />,
      description: "Quick checkout with Apple Pay"
    },
    {
      id: "google-pay" as PaymentMethod,
      name: "Google Pay",
      icon: <Smartphone size={20} />,
      description: "Quick checkout with Google Pay"
    },
    {
      id: "bank-transfer" as PaymentMethod,
      name: "Bank Transfer",
      icon: <CreditCard size={20} />,
      description: "Direct bank transfer"
    }
  ];

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsProcessing(true);

    try {
      const formData = new FormData(event.currentTarget);
      
      const shippingAddress = {
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
        couponId: appliedCoupon?.id
      });

      if (result.error) {
        error("Order Failed", result.error);
        setIsProcessing(false);
        return;
      }

      if (!["card", "upi", "bank-transfer"].includes(selectedPayment)) {
        const paymentMethodName = paymentMethods.find(m => m.id === selectedPayment)?.name;
        success("Order Placed Successfully!", `Your order #${result.orderId?.slice(0, 8)} has been placed using ${paymentMethodName}.`);
        clearCart();
        router.push(`/orders/${result.orderId}`);
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
                success("Payment Successful!", "Your order has been confirmed.");
                clearCart();
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
            name: formData.get("firstName") + " " + formData.get("lastName"),
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
                  <select name="country" className="w-full px-3 py-2 border border-forest/30 rounded-lg focus:border-forest focus:outline-none" required>
                    <option value="">Select Country</option>
                    <option value="IN">India</option>
                    <option value="US">United States</option>
                    <option value="UK">United Kingdom</option>
                  </select>
                </div>
              </div>

              <div className="bg-cream/30 border border-forest/20 rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-forest mb-4">Payment Method</h2>
                <div className="space-y-3">
                  {paymentMethods.map((method: any) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setSelectedPayment(method.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                        selectedPayment === method.id ? "border-forest bg-forest/5" : "border-forest/20 hover:border-forest/40"
                      }`}
                    >
                      <div className="p-2 rounded-lg bg-cream/50">{method.icon}</div>
                      <div className="flex-1 text-left">
                        <p className="font-semibold text-forest">{method.name}</p>
                        <p className="text-sm text-forest/60">{method.description}</p>
                      </div>
                    </button>
                  ))}
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
