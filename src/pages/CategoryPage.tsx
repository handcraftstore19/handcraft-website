import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Category, StoreAvailability } from "@/data/categories";
import { useStore } from "@/contexts/StoreContext";
import { categoryService } from "@/services/firestoreService";
import * as Icons from "lucide-react";

const getIcon = (iconName: string) => {
  const IconComponent = (Icons as any)[iconName] || Icons.Award;
  return IconComponent;
};

const CategoryPage = () => {
  const { categoryId } = useParams();
  const { selectedStore } = useStore();
  const storeId = selectedStore?.id || null;
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategory = async () => {
      if (!categoryId) return;
      setLoading(true);
      try {
        const cat = await categoryService.getById(Number(categoryId));
        setCategory(cat);
      } catch (error) {
        console.error('Error fetching category:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [categoryId]);

  // Helper function to check availability
  const isAvailable = (item: { availableAt?: StoreAvailability }) => {
    if (!storeId) return true;
    const defaultAvailability: StoreAvailability = {
      hyderabad: true,
      vizag: false,
      warangal: false
    };
    const availability = item.availableAt || defaultAvailability;
    return availability[storeId as keyof StoreAvailability] ?? false;
  };

  // Filter subcategories by store availability
  const availableSubcategories = category?.subcategories.filter(sub => isAvailable(sub)) || [];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">Loading category...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-foreground mb-4">Category Not Found</h1>
            <Link to="/" className="text-primary hover:underline">Return to Home</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="bg-card border-b border-border">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex items-center gap-2 text-sm">
              <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
                Home
              </Link>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground font-medium">{category.name}</span>
            </nav>
          </div>
        </div>

        {/* Hero Section */}
        <section className="relative h-64 md:h-80 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${category.image})` }}
          >
            <div className="absolute inset-0 bg-foreground/50" />
          </div>
          <div className="relative h-full container mx-auto px-4 flex items-center">
            <div className="backdrop-blur-md bg-foreground/20 rounded-2xl p-6 border border-card/20 shadow-lg max-w-2xl">
              <div className="flex items-center gap-4 mb-3">
                <div className="p-3 rounded-xl bg-card/30 backdrop-blur-sm">
                  {(() => {
                    const IconComponent = getIcon(category.iconName);
                    return <IconComponent className="h-8 w-8 text-card" />;
                  })()}
                </div>
                <h1 className="font-display text-4xl md:text-5xl font-semibold text-card drop-shadow-lg">
                  {category.name}
                </h1>
              </div>
              <p className="text-lg text-card/90 max-w-xl drop-shadow-md font-medium">
                {category.description}
              </p>
            </div>
          </div>
        </section>

        {/* Subcategories Grid */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-8">
              Browse Subcategories
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableSubcategories.map((subcategory, index) => (
                <Link
                  key={subcategory.id}
                  to={`/category/${category.id}/subcategory/${subcategory.id}`}
                  className="group relative overflow-hidden rounded-2xl bg-card shadow-soft hover:shadow-hover transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={subcategory.image}
                      alt={subcategory.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="backdrop-blur-md bg-foreground/20 rounded-xl p-4 border border-card/20 shadow-lg">
                      <h3 className="font-display text-xl md:text-2xl font-semibold text-card mb-1 drop-shadow-lg">
                        {subcategory.name}
                      </h3>
                      <p className="text-card/90 text-sm font-medium drop-shadow-md">
                        {subcategory.productCount} products
                      </p>
                    </div>
                  </div>
                  
                  <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-300" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default CategoryPage;
