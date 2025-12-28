import { stores, useStore } from '@/contexts/StoreContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MapPin } from 'lucide-react';

const StoreSelector = () => {
  const { showStoreSelector, setSelectedStore, setShowStoreSelector, selectedStore } = useStore();

  const storeIcons: Record<string, JSX.Element> = {
    hyderabad: (
      <img 
        src="/assets/icons/hyderabad.png" 
        alt="Hyderabad" 
        className="w-full h-full object-cover rounded-lg"
      />
    ),
    vizag: (
      <img 
        src="/assets/icons/vizag.png" 
        alt="Visakhapatnam" 
        className="w-full h-full object-cover rounded-lg"
      />
    ),
    warangal: (
      <img 
        src="/assets/icons/warangal.png" 
        alt="Warangal" 
        className="w-full h-full object-cover rounded-lg"
      />
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
          <DialogDescription className="text-center mt-2">
            Choose your nearest HandyCraft store location
          </DialogDescription>
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
              <div className="flex-shrink-0 w-20 h-20 overflow-hidden rounded-lg">
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
