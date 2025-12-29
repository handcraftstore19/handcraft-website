import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Category, StoreAvailability } from "@/data/categories";
import * as Icons from "lucide-react";
import { useStore } from "@/contexts/StoreContext";
import { categoryService } from "@/services/firestoreService";

const getIcon = (iconName: string) => {
  const IconComponent = (Icons as any)[iconName] || Icons.Award;
  return IconComponent;
};

const CategoriesSection = () => {
  const { selectedStore } = useStore();
  const storeId = selectedStore?.id || null;
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const allCategories = await categoryService.getAll();
        setCategories(allCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Helper function to check if category is available at store
  const isCategoryAvailable = (category: { availableAt?: StoreAvailability }) => {
    if (!storeId) return true;
    const defaultAvailability: StoreAvailability = {
      hyderabad: true,
      vizag: false,
      warangal: false
    };
    const availability = category.availableAt || defaultAvailability;
    return availability[storeId as keyof StoreAvailability] ?? false;
  };

  // Filter categories by store availability
  const availableCategories = categories.filter(isCategoryAvailable);

  if (loading) {
    return (
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-muted-foreground">Loading categories...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-4">
            Shop by Category
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Explore our curated collections for every room and activity
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {availableCategories.map((category, index) => {
            const IconComponent = getIcon(category.iconName);
            return (
              <Link
                key={category.id}
                to={`/category/${category.id}`}
                className="group relative overflow-hidden rounded-2xl bg-card shadow-soft hover:shadow-hover transition-all duration-300 cursor-pointer animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Image */}
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>

                {/* Content with Glassy Effect */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="backdrop-blur-md bg-foreground/20 rounded-2xl p-4 border border-card/20 shadow-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-card/30 backdrop-blur-sm">
                        <IconComponent className="h-5 w-5 text-card" />
                      </div>
                      <h3 className="font-display text-xl md:text-2xl font-semibold text-card drop-shadow-lg">
                        {category.name}
                      </h3>
                    </div>
                    <p className="text-card/90 text-sm font-medium drop-shadow-md">
                      {category.subcategories.reduce((acc, sub) => acc + sub.productCount, 0)} products
                    </p>
                  </div>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-300" />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;