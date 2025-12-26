import { Search, User, Heart, ShoppingBag, ChevronDown, Award, MapPin, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { categories } from "@/data/categories";
import { useStore } from "@/contexts/StoreContext";
import { useAuth } from "@/contexts/AuthContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { getSearchSuggestions } from "@/lib/searchUtils";
import * as Icons from "lucide-react";

const getIcon = (iconName: string) => {
  const IconComponent = (Icons as any)[iconName] || Award;
  return IconComponent;
};

const Header = () => {
  const [cartCount] = useState(3);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<{ type: 'product' | 'category'; name: string; id: number; image?: string }[]>([]);
  const { selectedStore, setShowStoreSelector } = useStore();
  const { user, logout, isAdmin } = useAuth();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  // Sync search query with URL when on search page
  useEffect(() => {
    if (location.pathname === '/search') {
      const params = new URLSearchParams(location.search);
      const query = params.get('q') || '';
      setSearchQuery(query);
    }
  }, [location]);

  // Update suggestions as user types (only if dropdown is open)
  useEffect(() => {
    if (showSuggestions) {
      const newSuggestions = getSearchSuggestions(searchQuery);
      setSuggestions(newSuggestions);
    }
  }, [searchQuery, showSuggestions]);

  const handleSearchClick = () => {
    // Show trending products when clicking on search bar
    const newSuggestions = getSearchSuggestions('');
    setSuggestions(newSuggestions);
    setShowSuggestions(true);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/search');
    }
  };

  const handleSuggestionClick = (suggestion: { type: 'product' | 'category'; name: string; id: number }) => {
    setShowSuggestions(false);
    setSearchQuery('');
    if (suggestion.type === 'product') {
      navigate(`/product/${suggestion.id}`);
    } else {
      navigate(`/category/${suggestion.id}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-card shadow-soft">
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between gap-8">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
              HandyCraft
            </h1>
          </Link>

          {/* Store Location */}
          <button
            onClick={() => setShowStoreSelector(true)}
            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-secondary transition-colors text-foreground group"
            title="Change store location"
          >
            <MapPin className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">
              {selectedStore ? selectedStore.city : "Select Store"}
            </span>
            <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </button>

          {/* Categories Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-secondary transition-colors text-foreground font-medium">
              Categories
              <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              {categories.map((category) => {
                const IconComponent = getIcon(category.iconName);
                return (
                  <DropdownMenuSub key={category.id}>
                    <DropdownMenuSubTrigger>
                      <IconComponent className="h-4 w-4 mr-2" />
                      {category.name}
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      {category.subcategories.map((subcategory) => (
                        <DropdownMenuItem key={subcategory.id} asChild>
                          <Link
                            to={`/category/${category.id}/subcategory/${subcategory.id}`}
                            className="cursor-pointer"
                          >
                            {subcategory.name}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuItem asChild>
                        <Link
                          to={`/category/${category.id}`}
                          className="cursor-pointer font-semibold"
                        >
                          View All {category.name}
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden flex-1 max-w-xl md:flex">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
              <Input
                type="search"
                placeholder="Search for products, categories... (try 'decarative' for typo tolerance)"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (!showSuggestions) {
                    setShowSuggestions(true);
                  }
                }}
                onClick={handleSearchClick}
                onFocus={handleSearchClick}
                onBlur={(e) => {
                  // Delay hiding to allow clicks on suggestions
                  setTimeout(() => {
                    if (!e.currentTarget.contains(document.activeElement)) {
                      setShowSuggestions(false);
                    }
                  }, 200);
                }}
                className="w-full pl-11 pr-4 h-11 bg-secondary border-0 rounded-full focus-visible:ring-1 focus-visible:ring-primary"
              />
              
              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div 
                  className="absolute top-full left-0 right-0 mt-2 bg-card border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
                  onMouseDown={(e) => e.preventDefault()} // Prevent blur when clicking inside
                >
                  {!searchQuery.trim() && (
                    <div className="px-4 py-2 text-sm font-semibold text-muted-foreground border-b">
                      Trending Products
                    </div>
                  )}
                  {suggestions.map((suggestion, idx) => (
                    <Link
                      key={`${suggestion.type}-${suggestion.id}-${idx}`}
                      to={suggestion.type === 'product' ? `/product/${suggestion.id}` : `/category/${suggestion.id}`}
                      onClick={() => {
                        setShowSuggestions(false);
                        setSearchQuery('');
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary transition-colors"
                    >
                      {suggestion.image && (
                        <img
                          src={suggestion.image}
                          alt={suggestion.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{suggestion.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {suggestion.type}
                        </p>
                      </div>
                      <Search className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </form>

          {/* User Actions */}
          <div className="flex items-center gap-2">
            {/* Store Location - Mobile */}
            <button
              onClick={() => setShowStoreSelector(true)}
              className="p-2.5 rounded-full hover:bg-secondary transition-colors duration-200 md:hidden"
              title="Change store location"
            >
              <MapPin className="h-5 w-5 text-foreground" />
            </button>
            
            {/* Mobile Search */}
            <button
              onClick={() => navigate("/search")}
              className="p-2.5 rounded-full hover:bg-secondary transition-colors duration-200 md:hidden"
            >
              <Search className="h-5 w-5 text-foreground" />
            </button>

            {/* Wishlist */}
            <Link
              to="/profile?tab=wishlist"
              className="relative p-2.5 rounded-full hover:bg-secondary transition-colors duration-200"
              title="Wishlist"
            >
              <Heart className="h-5 w-5 text-foreground" />
              {wishlist.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs font-medium flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <button className="relative p-2.5 rounded-full hover:bg-secondary transition-colors duration-200">
              <ShoppingBag className="h-5 w-5 text-foreground" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs font-medium flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="p-2.5 rounded-full hover:bg-secondary transition-colors duration-200">
                  <User className="h-5 w-5 text-foreground" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/profile">My Profile</Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin">Admin Dashboard</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                to="/login"
                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-secondary transition-colors text-foreground font-medium"
              >
                <User className="h-4 w-4" />
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;