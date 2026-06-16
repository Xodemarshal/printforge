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
import Image from "next/image";

const SHIPPING_COST = 15;
const FREE_SHIPPING_THRESHOLD = 150;

type PaymentMethod = "card" | "paypal" | "apple-pay" | "google-pay" | "upi" | "bank-transfer";

export function CheckoutClient() {
  const { items, getTotalPrice, clearCart } = useCart();
  const { success } = useToast();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>("card");

  const subtotal = getTotalPrice();
  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = subtotal + shippingCost;

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

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    success("Order Placed", `Your order has been placed successfully using ${paymentMethods.find(m => m.id === selectedPayment)?.name}!`);
    clearCart();
    router.push("/orders");
    
    setIsProcessing(false);
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
        {/* Header */}
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
          {/* Order Form */}
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-forest mb-2">Checkout</h1>
              <p className="text-forest/70">Complete your order details below</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Contact Information */}
              <div className="bg-cream/30 border border-forest/20 rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-forest mb-4">Contact Information</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <Input 
                    name="firstName"
                    placeholder="First Name"
                    className="border-forest/30 focus:border-forest"
                    required
                  />
                  <Input 
                    name="lastName"
                    placeholder="Last Name"
                    className="border-forest/30 focus:border-forest"
                    required
                  />
                </div>
                <Input 
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  className="border-forest/30 focus:border-forest mt-4"
                  required
                />
                <Input 
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  className="border-forest/30 focus:border-forest mt-4"
                  required
                />
              </div>

              {/* Shipping Address */}
              <div className="bg-cream/30 border border-forest/20 rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-forest mb-4">Shipping Address</h2>
                <div className="space-y-4">
                  <Input 
                    name="address"
                    placeholder="Street Address"
                    className="border-forest/30 focus:border-forest"
                    required
                  />
                  <div className="grid md:grid-cols-3 gap-4">
                    <Input 
                      name="city"
                      placeholder="City"
                      className="border-forest/30 focus:border-forest"
                      required
                    />
                    <Input 
                      name="state"
                      placeholder="State"
                      className="border-forest/30 focus:border-forest"
                      required
                    />
                    <Input 
                      name="zipCode"
                      placeholder="ZIP Code"
                      className="border-forest/30 focus:border-forest"
                      required
                    />
                  </div>
                  <select 
                    name="country"
                    className="w-full px-3 py-2 border border-forest/30 rounded-lg focus:border-forest focus:outline-none"
                    required
                  >
                    <option value="">Select Country</option>
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="UK">United Kingdom</option>
                    <option value="AU">Australia</option>
                    <option value="DE">Germany</option>
                    <option value="FR">France</option>
                    <option value="JP">Japan</option>
                    <option value="IN">India</option>
                  </select>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="bg-cream/30 border border-forest/20 rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-forest mb-4">Payment Method</h2>
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setSelectedPayment(method.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                        selectedPayment === method.id
                          ? "border-forest bg-forest/5"
                          : "border-forest/20 hover:border-forest/40"
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${
                        selectedPayment === method.id ? "bg-forest/10" : "bg-cream/50"
                      }`}>
                        {method.icon}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-semibold text-forest">{method.name}</p>
                        <p className="text-sm text-forest/60">{method.description}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 ${
                        selectedPayment === method.id
                          ? "border-forest bg-forest"
                          : "border-forest/30"
                      }`}>
                        {selectedPayment === method.id && (
                          <div className="w-full h-full rounded-full bg-white scale-50"></div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Details - Show based on selected method */}
              {selectedPayment === "card" && (
                <div className="bg-cream/30 border border-forest/20 rounded-2xl p-6">
                  <h2 className="text-xl font-semibold text-forest mb-4 flex items-center gap-2">
                    <CreditCard size={20} />
                    Card Information
                  </h2>
                  <div className="space-y-4">
                    <Input 
                      name="cardNumber"
                      placeholder="Card Number"
                      className="border-forest/30 focus:border-forest"
                      required={selectedPayment === "card"}
                    />
                    <Input 
                      name="cardName"
                      placeholder="Name on Card"
                      className="border-forest/30 focus:border-forest"
                      required={selectedPayment === "card"}
                    />
                    <div className="grid grid-cols-3 gap-4">
                      <Input 
                        name="expiryMonth"
                        placeholder="MM"
                        className="border-forest/30 focus:border-forest"
                        required={selectedPayment === "card"}
                        maxLength={2}
                      />
                      <Input 
                        name="expiryYear"
                        placeholder="YY"
                        className="border-forest/30 focus:border-forest"
                        required={selectedPayment === "card"}
                        maxLength={2}
                      />
                      <Input 
                        name="cvv"
                        placeholder="CVV"
                        className="border-forest/30 focus:border-forest"
                        required={selectedPayment === "card"}
                        maxLength={4}
                      />
                    </div>
                  </div>
                </div>
              )}

              {selectedPayment === "bank-transfer" && (
                <div className="bg-cream/30 border border-forest/20 rounded-2xl p-6">
                  <h2 className="text-xl font-semibold text-forest mb-4">Bank Transfer Details</h2>
                  <div className="space-y-3 text-sm text-forest/70">
                    <p>Please transfer the total amount to the following account:</p>
                    <div className="bg-white/50 p-4 rounded-lg space-y-2">
                      <p><span className="font-semibold">Bank Name:</span> PrintForge Bank</p>
                      <p><span className="font-semibold">Account Number:</span> 1234567890</p>
                      <p><span className="font-semibold">Routing Number:</span> 987654321</p>
                      <p><span className="font-semibold">Reference:</span> Use your email as reference</p>
                    </div>
                    <p className="text-xs">Your order will be processed once payment is confirmed (usually 1-2 business days).</p>
                  </div>
                </div>
              )}

              {selectedPayment === "upi" && (
                <div className="bg-cream/30 border border-forest/20 rounded-2xl p-6">
                  <h2 className="text-xl font-semibold text-forest mb-4 flex items-center gap-2">
                    <Smartphone size={20} />
                    UPI Payment
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-forest mb-2">
                        Enter your UPI ID
                      </label>
                      <Input 
                        name="upiId"
                        placeholder="yourname@paytm / yourname@okaxis"
                        className="border-forest/30 focus:border-forest"
                        required={selectedPayment === "upi"}
                      />
                      <p className="text-xs text-forest/60 mt-2">
                        You can use any UPI app (Google Pay, PhonePe, Paytm, BHIM, etc.)
                      </p>
                    </div>

                    <div className="bg-white/50 p-4 rounded-lg">
                      <p className="text-sm font-semibold text-forest mb-3">Or scan this QR Code:</p>
                      <div className="bg-white p-4 rounded-lg border-2 border-forest/20 inline-block">
                        <div className="w-48 h-48 bg-gradient-to-br from-forest/10 to-moss/10 flex items-center justify-center rounded">
                          <div className="text-center">
                            <Smartphone size={48} className="text-forest/40 mx-auto mb-2" />
                            <p className="text-xs text-forest/60">UPI QR Code</p>
                            <p className="text-xs text-forest/40 mt-1">Scan to pay</p>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-forest/60 mt-3">
                        Open any UPI app and scan this QR code to pay {formatCurrency(total)}
                      </p>
                    </div>

                    <div className="flex items-center justify-center gap-3 pt-2">
                      <div className="text-xs text-forest/60 font-semibold">Supported Apps:</div>
                      <div className="flex gap-2">
                        <span className="bg-white px-2 py-1 rounded text-xs border border-forest/20">GPay</span>
                        <span className="bg-white px-2 py-1 rounded text-xs border border-forest/20">PhonePe</span>
                        <span className="bg-white px-2 py-1 rounded text-xs border border-forest/20">Paytm</span>
                        <span className="bg-white px-2 py-1 rounded text-xs border border-forest/20">BHIM</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {(selectedPayment === "paypal" || selectedPayment === "apple-pay" || selectedPayment === "google-pay") && (
                <div className="bg-cream/30 border border-forest/20 rounded-2xl p-6">
                  <div className="text-center py-4">
                    <p className="text-forest/70 mb-4">
                      You will be redirected to {paymentMethods.find(m => m.id === selectedPayment)?.name} to complete your payment.
                    </p>
                    <div className="inline-flex items-center gap-2 text-sm text-forest/60">
                      <Shield size={16} />
                      <span>Secure payment powered by {paymentMethods.find(m => m.id === selectedPayment)?.name}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Special Instructions */}
              <div className="bg-cream/30 border border-forest/20 rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-forest mb-4">Order Notes (Optional)</h2>
                <Textarea 
                  name="instructions"
                  placeholder="Any special delivery instructions or notes..."
                  rows={3}
                  className="border-forest/30 focus:border-forest resize-none"
                />
              </div>

              {/* Submit Button */}
              <Button 
                type="submit"
                disabled={isProcessing}
                className="w-full bg-forest hover:bg-forest-dark text-white py-4 text-lg font-semibold"
              >
                {isProcessing ? "Processing..." : `Place Order - ${formatCurrency(total)}`}
              </Button>

              {/* Payment Badges */}
              <div className="flex items-center justify-center gap-4 pt-4 border-t border-forest/20">
                <div className="flex items-center gap-2 text-xs text-forest/60">
                  <Shield size={14} />
                  <span>256-bit SSL Encrypted</span>
                </div>
                <div className="text-xs text-forest/40">•</div>
                <div className="text-xs text-forest/60">PCI DSS Compliant</div>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <div className="bg-cream/50 border border-forest/20 rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-forest mb-6">Order Summary</h2>
              
              {/* Items */}
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.productId} className="flex items-center gap-3 p-3 bg-white/50 border border-forest/10 rounded-lg">
                    <img 
                      src={item.imageUrl || `https://picsum.photos/seed/${encodeURIComponent(item.slug)}/80/80`}
                      alt={item.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-forest truncate">{item.name}</p>
                      <p className="text-sm text-forest/60">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-forest">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
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
                <div className="flex justify-between text-lg font-semibold text-forest border-t border-forest/20 pt-2">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>

              {/* Shipping Info */}
              <div className="mt-6 p-4 bg-white/50 border border-forest/10 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-forest/70">
                  <Truck size={16} />
                  <span>
                    {shippingCost === 0 
                      ? "Free shipping on this order!" 
                      : "Standard shipping 5-7 business days"
                    }
                  </span>
                </div>
              </div>

              {/* We Accept */}
              <div className="mt-6 pt-6 border-t border-forest/20">
                <p className="text-xs text-forest/60 mb-3 text-center">We Accept</p>
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  <div className="bg-white/70 px-3 py-2 rounded border border-forest/10 text-xs font-semibold text-forest/70">
                    VISA
                  </div>
                  <div className="bg-white/70 px-3 py-2 rounded border border-forest/10 text-xs font-semibold text-forest/70">
                    Mastercard
                  </div>
                  <div className="bg-white/70 px-3 py-2 rounded border border-forest/10 text-xs font-semibold text-forest/70">
                    PayPal
                  </div>
                  <div className="bg-white/70 px-3 py-2 rounded border border-forest/10 text-xs font-semibold text-forest/70">
                    Apple Pay
                  </div>
                  <div className="bg-white/70 px-3 py-2 rounded border border-forest/10 text-xs font-semibold text-forest/70">
                    Google Pay
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}