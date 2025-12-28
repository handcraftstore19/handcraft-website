import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Store {
  id: string;
  name: string;
  city: string;
  icon: string;
  landmark: string;
  whatsappNumber: string;
}

export const stores: Store[] = [
  {
    id: 'hyderabad',
    name: 'Damodar Handicrafts Hyderabad',
    city: 'Hyderabad',
    icon: '🕌',
    landmark: 'Charminar',
    whatsappNumber: '+919876543210' // Replace with actual WhatsApp number
  },
  {
    id: 'warangal',
    name: 'Damodar Handicrafts Warangal',
    city: 'Warangal',
    icon: '🛕',
    landmark: 'Thousand Pillar Temple',
    whatsappNumber: '+919876543211' // Replace with actual WhatsApp number
  }, 
  {
    id: 'vizag',
    name: 'Damodar Handicrafts Vizag',
    city: 'Visakhapatnam',
    icon: '🏖️',
    landmark: 'RK Beach',
    whatsappNumber: '+919876543212' // Replace with actual WhatsApp number
  }
];

interface StoreContextType {
  selectedStore: Store | null;
  setSelectedStore: (store: Store) => void;
  isStoreSelected: boolean;
  showStoreSelector: boolean;
  setShowStoreSelector: (show: boolean) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Internal component that uses React Router hooks
const StoreProviderInternal = ({ children }: { children: ReactNode }) => {
  const [selectedStore, setSelectedStoreState] = useState<Store | null>(null);
  const [showStoreSelector, setShowStoreSelector] = useState(false);
  
  // Use window.location for URL sync (works outside Router)
  const updateURL = (storeId: string) => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('location', storeId);
      window.history.replaceState({}, '', url.toString());
    }
  };

  const getLocationFromURL = () => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('location');
    }
    return null;
  };

  // Sync store from URL query parameter or localStorage
  useEffect(() => {
    const locationParam = getLocationFromURL();
    
    if (locationParam) {
      const store = stores.find(s => s.id === locationParam);
      if (store) {
        setSelectedStoreState(store);
        localStorage.setItem('selectedStore', store.id);
        return;
      }
    }
    
    // If no location in URL, check localStorage
    const savedStore = localStorage.getItem('selectedStore');
    if (savedStore) {
      const store = stores.find(s => s.id === savedStore);
      if (store) {
        setSelectedStoreState(store);
        // Update URL with location if not present
        if (!locationParam) {
          updateURL(store.id);
        }
      } else {
        setShowStoreSelector(true);
      }
    } else {
      setShowStoreSelector(true);
    }
  }, []);

  // Listen for URL changes (e.g., browser back/forward)
  useEffect(() => {
    const handlePopState = () => {
      const locationParam = getLocationFromURL();
      if (locationParam) {
        const store = stores.find(s => s.id === locationParam);
        if (store) {
          setSelectedStoreState(store);
          localStorage.setItem('selectedStore', store.id);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const setSelectedStore = (store: Store) => {
    setSelectedStoreState(store);
    localStorage.setItem('selectedStore', store.id);
    setShowStoreSelector(false);
    
    // Update URL with location parameter
    updateURL(store.id);
  };

  return (
    <StoreContext.Provider
      value={{
        selectedStore,
        setSelectedStore,
        isStoreSelected: !!selectedStore,
        showStoreSelector,
        setShowStoreSelector
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

// Wrapper that works both inside and outside Router
export const StoreProvider = ({ children }: { children: ReactNode }) => {
  return <StoreProviderInternal>{children}</StoreProviderInternal>;
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
