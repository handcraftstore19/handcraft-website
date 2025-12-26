export interface Product {
  id: number;
  name: string;
  price: number;
  discountPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  description: string;
  features: string[];
  tags?: ('best-seller' | 'new-arrival' | 'trending' | 'limited-edition')[];
  stock: number;
  categoryId: number;
  subcategoryId: number;
}

export interface Subcategory {
  id: number;
  name: string;
  image: string;
  productCount: number;
  products: Product[];
}

export interface Category {
  id: number;
  name: string;
  iconName: string;
  image: string;
  description: string;
  subcategories: Subcategory[];
}

export const categories: Category[] = [
  {
    id: 1,
    name: "Trophies",
    iconName: "Award",
    image: "/assets/images/trophies_cat.png",
    description: "Premium trophies for every achievement and occasion",
    subcategories: [
      {
        id: 101,
        name: "Sports Trophies",
        image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600&q=80",
        productCount: 24,
        products: [
          {
            id: 1001,
            name: "Golden Champion Trophy",
            price: 7499,
            discountPrice: 5999,
            image: "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=600&q=80",
            rating: 4.8,
            reviews: 124,
            description: "A stunning golden trophy perfect for championship events. Features intricate detailing and a solid marble base.",
            features: ["24K gold plating", "Marble base", "Customizable nameplate", "Height: 14 inches"],
            tags: ['best-seller'],
            stock: 45,
            categoryId: 1,
            subcategoryId: 101
          },
          {
            id: 1002,
            name: "Silver Star Trophy",
            price: 5499,
            image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&q=80",
            rating: 4.6,
            reviews: 89,
            description: "Elegant silver trophy with star design, ideal for sports achievements.",
            features: ["Silver finish", "Crystal accents", "Wooden base", "Height: 12 inches"],
            tags: ['new-arrival'],
            stock: 32,
            categoryId: 1,
            subcategoryId: 101
          },
          {
            id: 1003,
            name: "Bronze Victory Cup",
            price: 3799,
            image: "https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=600&q=80",
            rating: 4.5,
            reviews: 67,
            description: "Classic bronze cup trophy for various sporting events.",
            features: ["Bronze finish", "Traditional design", "Plastic base", "Height: 10 inches"],
            stock: 58,
            categoryId: 1,
            subcategoryId: 101
          }
        ]
      },
      {
        id: 102,
        name: "Academic Trophies",
        image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&q=80",
        productCount: 18,
        products: [
          {
            id: 1004,
            name: "Scholar Excellence Award",
            price: 4599,
            image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&q=80",
            rating: 4.7,
            reviews: 45,
            description: "Distinguished trophy for academic excellence and scholarly achievements.",
            features: ["Book and torch design", "Gold accents", "Engraving included", "Height: 11 inches"],
            tags: ['trending'],
            stock: 28,
            categoryId: 1,
            subcategoryId: 102
          }
        ]
      },
      {
        id: 103,
        name: "Corporate Awards",
        image: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=600&q=80",
        productCount: 32,
        products: [
          {
            id: 1005,
            name: "Crystal Achievement Award",
            price: 10499,
            discountPrice: 8999,
            image: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=600&q=80",
            rating: 4.9,
            reviews: 156,
            description: "Premium crystal award for corporate recognition and excellence.",
            features: ["Optical crystal", "3D laser engraving", "Velvet gift box", "Height: 9 inches"],
            tags: ['best-seller', 'trending'],
            stock: 22,
            categoryId: 1,
            subcategoryId: 103
          }
        ]
      }
    ]
  },
  {
    id: 2,
    name: "Medals",
    iconName: "Medal",
    image: "/assets/images/medals_cat.png",
    description: "High-quality medals for recognition and celebration",
    subcategories: [
      {
        id: 201,
        name: "Gold Medals",
        image: "https://images.unsplash.com/photo-1569517282132-25d22f4573e6?w=600&q=80",
        productCount: 15,
        products: [
          {
            id: 2001,
            name: "Premium Gold Medal Set",
            price: 2499,
            discountPrice: 1999,
            image: "https://images.unsplash.com/photo-1569517282132-25d22f4573e6?w=600&q=80",
            rating: 4.8,
            reviews: 234,
            description: "Set of 10 premium gold medals with ribbons, perfect for events.",
            features: ["Set of 10", "2.5 inch diameter", "Red ribbon included", "Custom engraving available"],
            tags: ['best-seller'],
            stock: 120,
            categoryId: 2,
            subcategoryId: 201
          }
        ]
      },
      {
        id: 202,
        name: "Silver Medals",
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
        productCount: 12,
        products: [
          {
            id: 2002,
            name: "Silver Achievement Medal",
            price: 1999,
            image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
            rating: 4.6,
            reviews: 178,
            description: "Classic silver medal for second place achievements.",
            features: ["Set of 10", "Silver plated", "Blue ribbon", "Diameter: 2 inches"],
            stock: 95,
            categoryId: 2,
            subcategoryId: 202
          }
        ]
      },
      {
        id: 203,
        name: "Bronze Medals",
        image: "https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=600&q=80",
        productCount: 10,
        products: [
          {
            id: 2003,
            name: "Bronze Honor Medal",
            price: 1599,
            image: "https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=600&q=80",
            rating: 4.5,
            reviews: 145,
            description: "Quality bronze medals for third place recognition.",
            features: ["Set of 10", "Bronze finish", "Green ribbon", "Diameter: 2 inches"],
            stock: 88,
            categoryId: 2,
            subcategoryId: 203
          }
        ]
      },
      {
        id: 204,
        name: "Custom Medals",
        image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&q=80",
        productCount: 8,
        products: [
          {
            id: 2004,
            name: "Custom Designed Medal",
            price: 4199,
            image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&q=80",
            rating: 4.9,
            reviews: 89,
            description: "Fully customizable medals with your design and logo.",
            features: ["Custom design", "Choice of metal", "Custom ribbon colors", "Minimum order: 25"],
            tags: ['new-arrival', 'trending'],
            stock: 200,
            categoryId: 2,
            subcategoryId: 204
          }
        ]
      }
    ]
  },
  {
    id: 3,
    name: "Momentos",
    iconName: "Gift",
    image: "/assets/images/momentos_cat.png",
    description: "Memorable keepsakes and commemorative items",
    subcategories: [
      {
        id: 301,
        name: "Crystal Momentos",
        image: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=600&q=80",
        productCount: 20,
        products: [
          {
            id: 3001,
            name: "Crystal Photo Frame",
            price: 6599,
            discountPrice: 5499,
            image: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=600&q=80",
            rating: 4.7,
            reviews: 67,
            description: "Beautiful crystal frame with 3D laser engraved photo.",
            features: ["Optical crystal", "LED base included", "3D engraving", "Size: 6x4 inches"],
            tags: ['best-seller'],
            stock: 35,
            categoryId: 3,
            subcategoryId: 301
          }
        ]
      },
      {
        id: 302,
        name: "Wooden Plaques",
        image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&q=80",
        productCount: 25,
        products: [
          {
            id: 3002,
            name: "Executive Wooden Plaque",
            price: 4999,
            image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&q=80",
            rating: 4.8,
            reviews: 92,
            description: "Premium walnut plaque with brass plate for engraving.",
            features: ["Walnut wood", "Brass nameplate", "Wall mount included", "Size: 10x8 inches"],
            tags: ['trending'],
            stock: 42,
            categoryId: 3,
            subcategoryId: 302
          }
        ]
      },
      {
        id: 303,
        name: "Personalized Gifts",
        image: "https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=600&q=80",
        productCount: 30,
        products: [
          {
            id: 3003,
            name: "Engraved Glass Award",
            price: 3799,
            image: "https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=600&q=80",
            rating: 4.6,
            reviews: 78,
            description: "Elegant glass award with custom engraving.",
            features: ["Premium glass", "Custom text", "Gift box included", "Height: 8 inches"],
            tags: ['new-arrival'],
            stock: 55,
            categoryId: 3,
            subcategoryId: 303
          }
        ]
      }
    ]
  },
  {
    id: 4,
    name: "Home Decor",
    iconName: "Home",
    image: "/assets/images/home_decors_cat.png",
    description: "Elegant pieces to beautify your living spaces",
    subcategories: [
      {
        id: 401,
        name: "Vases & Planters",
        image: "https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=600&q=80",
        productCount: 35,
        products: [
          {
            id: 4001,
            name: "Ceramic Artisan Vase",
            price: 7499,
            discountPrice: 5999,
            image: "https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=600&q=80",
            rating: 4.8,
            reviews: 156,
            description: "Handcrafted ceramic vase with unique glazed finish.",
            features: ["Handmade", "Glazed ceramic", "Waterproof", "Height: 12 inches"],
            tags: ['best-seller', 'trending'],
            stock: 28,
            categoryId: 4,
            subcategoryId: 401
          }
        ]
      },
      {
        id: 402,
        name: "Candles & Holders",
        image: "https://images.unsplash.com/photo-1602178506874-71f67a64f677?w=600&q=80",
        productCount: 28,
        products: [
          {
            id: 4002,
            name: "Brass Candle Holder Set",
            price: 5499,
            image: "https://images.unsplash.com/photo-1602178506874-71f67a64f677?w=600&q=80",
            rating: 4.7,
            reviews: 89,
            description: "Elegant brass candle holders, set of 3 varying heights.",
            features: ["Set of 3", "Solid brass", "Tarnish resistant", "Heights: 6, 8, 10 inches"],
            stock: 38,
            categoryId: 4,
            subcategoryId: 402
          }
        ]
      },
      {
        id: 403,
        name: "Sculptures & Figurines",
        image: "https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=600&q=80",
        productCount: 22,
        products: [
          {
            id: 4003,
            name: "Modern Abstract Sculpture",
            price: 12499,
            image: "https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=600&q=80",
            rating: 4.9,
            reviews: 45,
            description: "Contemporary abstract sculpture in brushed metal.",
            features: ["Brushed aluminum", "Modern design", "Weighted base", "Height: 16 inches"],
            tags: ['limited-edition'],
            stock: 12,
            categoryId: 4,
            subcategoryId: 403
          }
        ]
      }
    ]
  },
  {
    id: 5,
    name: "Wall Art & Decor",
    iconName: "Image",
    image: "/assets/images/wall_decors_cat.png",
    description: "Transform your walls with stunning artwork",
    subcategories: [
      {
        id: 501,
        name: "Canvas Prints",
        image: "https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=600&q=80",
        productCount: 40,
        products: [
          {
            id: 5001,
            name: "Abstract Canvas Art",
            price: 10799,
            discountPrice: 8499,
            image: "https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=600&q=80",
            rating: 4.8,
            reviews: 234,
            description: "Large abstract canvas print on premium gallery wrap.",
            features: ["Gallery wrapped", "Fade resistant", "Ready to hang", "Size: 36x24 inches"],
            tags: ['best-seller'],
            stock: 25,
            categoryId: 5,
            subcategoryId: 501
          }
        ]
      },
      {
        id: 502,
        name: "Metal Wall Art",
        image: "https://images.unsplash.com/photo-1507643179773-3e975d7ac515?w=600&q=80",
        productCount: 25,
        products: [
          {
            id: 5002,
            name: "Geometric Metal Art",
            price: 15799,
            image: "https://images.unsplash.com/photo-1507643179773-3e975d7ac515?w=600&q=80",
            rating: 4.7,
            reviews: 78,
            description: "Modern geometric metal wall sculpture.",
            features: ["Powder coated steel", "3D design", "Mounting hardware included", "Size: 30x30 inches"],
            tags: ['new-arrival', 'trending'],
            stock: 18,
            categoryId: 5,
            subcategoryId: 502
          }
        ]
      },
      {
        id: 503,
        name: "Mirrors",
        image: "https://images.unsplash.com/photo-1618220179428-22790b461013?w=600&q=80",
        productCount: 18,
        products: [
          {
            id: 5003,
            name: "Sunburst Wall Mirror",
            price: 13299,
            image: "https://images.unsplash.com/photo-1618220179428-22790b461013?w=600&q=80",
            rating: 4.9,
            reviews: 112,
            description: "Stunning sunburst mirror with gold metal frame.",
            features: ["Gold metal frame", "Beveled glass", "Wall mounted", "Diameter: 32 inches"],
            tags: ['limited-edition'],
            stock: 15,
            categoryId: 5,
            subcategoryId: 503
          }
        ]
      }
    ]
  },
  {
    id: 6,
    name: "Decorative Crafts",
    iconName: "Sparkles",
    image: "/assets/images/decorative_crafts_cat.png",
    description: "Handcrafted decorative pieces and artisan crafts",
    subcategories: [
      {
        id: 601,
        name: "Handmade Crafts",
        image: "https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?w=600&q=80",
        productCount: 45,
        products: [
          {
            id: 6001,
            name: "Macrame Wall Hanging",
            price: 5799,
            discountPrice: 4499,
            image: "https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?w=600&q=80",
            rating: 4.8,
            reviews: 167,
            description: "Bohemian macrame wall hanging, handwoven from cotton.",
            features: ["100% cotton", "Handwoven", "Wooden dowel", "Size: 24x36 inches"],
            tags: ['best-seller', 'trending'],
            stock: 62,
            categoryId: 6,
            subcategoryId: 601
          }
        ]
      },
      {
        id: 602,
        name: "Decorative Bowls",
        image: "https://images.unsplash.com/photo-1584589167171-541ce45f1eea?w=600&q=80",
        productCount: 20,
        products: [
          {
            id: 6002,
            name: "Carved Wooden Bowl",
            price: 4199,
            image: "https://images.unsplash.com/photo-1584589167171-541ce45f1eea?w=600&q=80",
            rating: 4.6,
            reviews: 89,
            description: "Hand-carved decorative bowl from sustainable mango wood.",
            features: ["Mango wood", "Hand carved", "Food safe finish", "Diameter: 10 inches"],
            stock: 48,
            categoryId: 6,
            subcategoryId: 602
          }
        ]
      },
      {
        id: 603,
        name: "Textile Art",
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
        productCount: 30,
        products: [
          {
            id: 6003,
            name: "Woven Tapestry",
            price: 9999,
            image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
            rating: 4.7,
            reviews: 56,
            description: "Artisan woven tapestry with geometric patterns.",
            features: ["Cotton & wool blend", "Handwoven", "Rod pocket hanging", "Size: 40x30 inches"],
            tags: ['new-arrival'],
            stock: 22,
            categoryId: 6,
            subcategoryId: 603
          }
        ]
      }
    ]
  }
];

export const getCategoryById = (id: number): Category | undefined => {
  return categories.find(cat => cat.id === id);
};

export const getSubcategoryById = (categoryId: number, subcategoryId: number): Subcategory | undefined => {
  const category = getCategoryById(categoryId);
  return category?.subcategories.find(sub => sub.id === subcategoryId);
};

export const getProductById = (productId: number): { product: Product; category: Category; subcategory: Subcategory } | undefined => {
  for (const category of categories) {
    for (const subcategory of category.subcategories) {
      const product = subcategory.products.find(p => p.id === productId);
      if (product) {
        return { product, category, subcategory };
      }
    }
  }
  return undefined;
};

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};
