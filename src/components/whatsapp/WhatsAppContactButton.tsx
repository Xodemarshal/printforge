'use client';

import { MessageCircle } from 'lucide-react';
import { trackWhatsAppClick } from '@/services/analytics';

interface WhatsAppContactButtonProps {
  productName?: string;
  orderId?: string;
  customMessage?: string;
  productId?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function WhatsAppContactButton({
  productName,
  orderId,
  customMessage,
  productId,
  variant = 'primary',
  size = 'md',
  className = ''
}: WhatsAppContactButtonProps) {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '';

  if (!whatsappNumber) return null;

  const getMessage = () => {
    if (customMessage) return customMessage;
    if (productName) return `Hello, I am interested in ${productName}.`;
    if (orderId) return `Hello, I would like an update regarding Order #${orderId}.`;
    return 'Hello, I need a custom 3D printed model.';
  };

  const handleClick = async () => {
    await trackWhatsAppClick(productId || null, null, {
      productName,
      orderId,
      source: 'contact_button'
    });

    const encodedMessage = encodeURIComponent(getMessage());
    const url = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodedMessage}`;
    window.open(url, '_blank');
  };

  const variantClasses = {
    primary: 'bg-green-500 hover:bg-green-600 text-white',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900',
    outline: 'border-2 border-green-500 text-green-500 hover:bg-green-50'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      <MessageCircle className={size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'} />
      <span>Chat on WhatsApp</span>
    </button>
  );
}
