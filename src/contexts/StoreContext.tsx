import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Store {
  id: string;
  name: string;
  city: string;
  icon: string;
  landmark: string;
}

export const stores: Store[] = [
  {
    id: 'hyderabad',
    name: 'HandyCraft Hyderabad',
    city: 'Hyderabad',
    icon: '🕌',
    landmark: 'Charminar'
  },
  {
    id: 'vizag',
    name: 'HandyCraft Vizag',
    city: 'Visakhapatnam',
    icon: '🏖️',
    landmark: 'RK Beach'
  },
  {
    id: 'warangal',
    name: 'HandyCraft Warangal',
    city: 'Warangal',
    icon: '🛕',
    landmark: 'Thousand Pillar Temple'
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

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [selectedStore, setSelectedStoreState] = useState<Store | null>(null);
  const [showStoreSelector, setShowStoreSelector] = useState(false);

  useEffect(() => {
    const savedStore = localStorage.getItem('selectedStore');
    if (savedStore) {
      const store = stores.find(s => s.id === savedStore);
      if (store) {
        setSelectedStoreState(store);
      } else {
        setShowStoreSelector(true);
      }
    } else {
      setShowStoreSelector(true);
    }
  }, []);

  const setSelectedStore = (store: Store) => {
    setSelectedStoreState(store);
    localStorage.setItem('selectedStore', store.id);
    setShowStoreSelector(false);
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

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
