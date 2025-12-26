import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Eye, EyeOff } from 'lucide-react';
import { useReview } from '@/contexts/ReviewContext';
import { getProductById } from '@/data/categories';

const AdminReviews = () => {
  const { reviews, toggleReviewVisibility } = useReview();
  const [filterVisible, setFilterVisible] = useState<'all' | 'visible' | 'hidden'>('all');

  const filteredReviews = reviews.filter(review => {
    if (filterVisible === 'visible') return review.isVisible;
    if (filterVisible === 'hidden') return !review.isVisible;
    return true;
  });

  const getProductName = (productId: number) => {
    const result = getProductById(productId);
    return result?.product.name || `Product #${productId}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold text-foreground">Reviews</h2>
          <p className="text-muted-foreground">View and manage customer reviews</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterVisible === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterVisible('all')}
          >
            All ({reviews.length})
          </Button>
          <Button
            variant={filterVisible === 'visible' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterVisible('visible')}
          >
            Visible ({reviews.filter(r => r.isVisible).length})
          </Button>
          <Button
            variant={filterVisible === 'hidden' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterVisible('hidden')}
          >
            Hidden ({reviews.filter(r => !r.isVisible).length})
          </Button>
        </div>
      </div>
      
      {filteredReviews.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <p className="text-muted-foreground">No reviews found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredReviews.map(review => (
            <Card key={review.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium text-lg">{getProductName(review.productId)}</p>
                    <p className="text-sm text-muted-foreground">
                      {review.userName} • {new Date(review.date).toLocaleDateString()}
                    </p>
                    <div className="flex gap-1 my-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-foreground mt-2">{review.comment}</p>
                    {review.orderId && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Order: {review.orderId}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <Badge variant={review.isVisible ? 'default' : 'secondary'}>
                      {review.isVisible ? 'Visible' : 'Hidden'}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleReviewVisibility(review.id, !review.isVisible)}
                    >
                      {review.isVisible ? (
                        <>
                          <EyeOff className="h-4 w-4 mr-2" />
                          Hide
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-2" />
                          Show
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminReviews;
