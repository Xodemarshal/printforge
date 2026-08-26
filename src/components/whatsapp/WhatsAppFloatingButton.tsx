'use client';

import { MessageCircle } from 'lucide-react';
import { trackWhatsAppClick } from '@/services/analytics';

export default function WhatsAppFloatingButton() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '';
  const defaultMessage = process.env.NEXT_PUBLIC_WHATSAPP_DEFAULT_MESSAGE || 
    'Hello, I would like to know more about your 3D printing services.';

  if (!whatsappNumber) return null;

  const handleClick = async () => {
    await trackWhatsAppClick(null, null, { source: 'floating_button' });
    
    const encodedMessage = encodeURIComponent(defaultMessage);
    const url = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodedMessage}`;
    window.open(url, '_blank');
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-4 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all hover:scale-110 active:scale-95 sm:bottom-6 sm:right-6"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="w-6 h-6" />
    </button>
  );
}
