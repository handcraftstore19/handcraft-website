import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const getBreadcrumbLabel = (path: string, index: number): string => {
    // Map common paths to readable labels
    const labelMap: Record<string, string> = {
      'best-sellers': 'Best Sellers',
      'new-arrivals': 'New Arrivals',
      'featured-products': 'Featured Products',
      'contact-us': 'Contact Us',
      'shipping-info': 'Shipping Info',
      'returns-exchanges': 'Returns & Exchanges',
      'track-order': 'Track Order',
      'forget-password': 'Forgot Password',
      'order-confirmation': 'Order Confirmation',
    };

    // If it's a dynamic route (number or ID), try to get the actual name
    if (index === pathnames.length - 1 && /^\d+$/.test(path)) {
      // This is likely a product/category ID - we'll show it as is
      // In a real app, you'd fetch the actual name from Firestore
      return `#${path}`;
    }

    return labelMap[path] || path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');
  };

  const buildPath = (index: number): string => {
    return '/' + pathnames.slice(0, index + 1).join('/');
  };

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', path: '/' },
    ...pathnames.map((path, index) => ({
      label: getBreadcrumbLabel(path, index),
      path: buildPath(index),
    })),
  ];

  // Don't show breadcrumb on home page
  if (location.pathname === '/') {
    return null;
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-4 px-4 py-2 bg-muted/30">
      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1;
        return (
          <div key={index} className="flex items-center space-x-2">
            {index === 0 ? (
              <Link
                to={crumb.path || '/'}
                className="hover:text-foreground transition-colors flex items-center gap-1"
              >
                <Home className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <ChevronRight className="h-4 w-4" />
                {isLast ? (
                  <span className="text-foreground font-medium">{crumb.label}</span>
                ) : (
                  <Link
                    to={crumb.path || '#'}
                    className="hover:text-foreground transition-colors"
                  >
                    {crumb.label}
                  </Link>
                )}
              </>
            )}
          </div>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;

