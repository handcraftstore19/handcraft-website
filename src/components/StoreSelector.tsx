import { stores, useStore } from '@/contexts/StoreContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MapPin } from 'lucide-react';

const StoreSelector = () => {
  const { showStoreSelector, setSelectedStore, setShowStoreSelector, selectedStore } = useStore();

  const storeIcons: Record<string, JSX.Element> = {
    hyderabad: (
      <svg viewBox="0 0 100 100" className="w-16 h-16">
        <path d="M50 10 L30 40 L30 80 L70 80 L70 40 Z" fill="currentColor" opacity="0.3"/>
        <path d="M35 50 L35 75 M65 50 L65 75" stroke="currentColor" strokeWidth="3" fill="none"/>
        <circle cx="50" cy="25" r="8" fill="currentColor"/>
        <path d="M20 80 L80 80" stroke="currentColor" strokeWidth="4"/>
        <path d="M25 40 L25 80 M75 40 L75 80" stroke="currentColor" strokeWidth="3"/>
        <path d="M40 40 L40 55 M60 40 L60 55" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
    vizag: (
      <svg viewBox="0 0 100 100" className="w-16 h-16">
        <path d="M0 70 Q25 55 50 70 Q75 85 100 70 L100 100 L0 100 Z" fill="currentColor" opacity="0.3"/>
        <circle cx="75" cy="25" r="12" fill="currentColor" opacity="0.8"/>
        <path d="M10 85 L15 75 L20 85 M30 80 L35 70 L40 80" stroke="currentColor" strokeWidth="2" fill="none"/>
        <ellipse cx="60" cy="60" rx="8" ry="4" fill="currentColor" opacity="0.5"/>
      </svg>
    ),
    warangal: (
      <svg viewBox="0 0 100 100" className="w-16 h-16">
        <rect x="25" y="40" width="50" height="50" fill="currentColor" opacity="0.3"/>
        <rect x="30" y="45" width="15" height="20" fill="currentColor" opacity="0.5"/>
        <rect x="55" y="45" width="15" height="20" fill="currentColor" opacity="0.5"/>
        <rect x="40" y="70" width="20" height="20" fill="currentColor" opacity="0.6"/>
        <path d="M25 40 L50 15 L75 40" fill="currentColor" opacity="0.4"/>
        <circle cx="50" cy="30" r="5" fill="currentColor"/>
        <rect x="35" y="5" width="30" height="5" fill="currentColor" opacity="0.7"/>
      </svg>
    )
  };

  return (
    <Dialog open={showStoreSelector} onOpenChange={setShowStoreSelector}>
      <DialogContent className="sm:max-w-lg bg-background">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif text-center text-foreground">
            <MapPin className="inline-block w-6 h-6 mr-2 text-accent" />
            Select Your Store
          </DialogTitle>
          <p className="text-center text-muted-foreground mt-2">
            Choose your nearest HandyCraft store location
          </p>
        </DialogHeader>
        
        <div className="grid gap-4 mt-6">
          {stores.map((store) => (
            <button
              key={store.id}
              onClick={() => setSelectedStore(store)}
              className={`
                group relative flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-300
                ${selectedStore?.id === store.id 
                  ? 'border-accent bg-accent/10' 
                  : 'border-border hover:border-accent/50 hover:bg-muted/50'
                }
              `}
            >
              <div className="flex-shrink-0 w-20 h-20 flex items-center justify-center rounded-lg bg-accent/10 text-accent group-hover:bg-accent/20 transition-colors">
                {storeIcons[store.id]}
              </div>
              
              <div className="flex-1 text-left">
                <h3 className="text-lg font-semibold text-foreground group-hover:text-accent transition-colors">
                  {store.city}
                </h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="w-4 h-4" />
                  {store.landmark}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {store.name}
                </p>
              </div>

              <div className={`
                w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                ${selectedStore?.id === store.id 
                  ? 'border-accent bg-accent' 
                  : 'border-muted-foreground/30'
                }
              `}>
                {selectedStore?.id === store.id && (
                  <svg className="w-4 h-4 text-accent-foreground" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>

        <p className="text-xs text-center text-muted-foreground mt-4">
          You can change your store anytime from the header
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default StoreSelector;
