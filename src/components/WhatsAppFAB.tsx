import { useStore } from '@/contexts/StoreContext';

const WhatsAppFAB = () => {
  const { selectedStore } = useStore();

  if (!selectedStore) return null;

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(`Hello! I'm interested in products from ${selectedStore.name}.`);
    const whatsappUrl = `https://wa.me/${selectedStore.whatsappNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <button
      onClick={handleWhatsAppClick}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
      title={`Chat with ${selectedStore.name} on WhatsApp`}
      aria-label="WhatsApp Chat"
    >
      <img 
        src="/assets/images/whatsapp-icon.png" 
        alt="WhatsApp" 
        className="w-8 h-8 object-contain"
      />
      <span className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center">
        <span className="w-2 h-2 bg-[#25D366] rounded-full animate-pulse"></span>
      </span>
    </button>
  );
};

export default WhatsAppFAB;

