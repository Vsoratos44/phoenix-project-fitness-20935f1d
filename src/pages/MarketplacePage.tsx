import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Star, Package, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function MarketplacePage() {
  const products = [
    {
      id: 1,
      name: "Phoenix Fitness Protein",
      description: "Premium whey protein isolate for muscle recovery",
      price: 2500,
      rating: 4.8,
      category: "Supplements",
      image: "🥤",
      inStock: true
    },
    {
      id: 2,
      name: "Phoenix Training Gear",
      description: "Official Phoenix Fitness workout apparel",
      price: 1500,
      rating: 4.6,
      category: "Apparel",
      image: "👕",
      inStock: true
    },
    {
      id: 3,
      name: "Resistance Band Set",
      description: "Complete set of resistance bands for home workouts",
      price: 800,
      rating: 4.9,
      category: "Equipment",
      image: "🏋️",
      inStock: false
    },
    {
      id: 4,
      name: "Premium Meal Plan",
      description: "Personalized nutrition plan with recipes",
      price: 3000,
      rating: 4.7,
      category: "Nutrition",
      image: "🥗",
      inStock: true
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <ShoppingCart className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Marketplace</h1>
          <p className="text-muted-foreground">Redeem your SEP points for fitness products and services</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your SEP Balance</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4,250</div>
            <p className="text-xs text-muted-foreground">points available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
            <p className="text-xs text-muted-foreground">items available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Redeemed</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">items purchased</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Points Spent</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6,750</div>
            <p className="text-xs text-muted-foreground">total redeemed</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Featured Products</h2>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Card key={product.id} className={!product.inStock ? 'opacity-60' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="text-4xl">{product.image}</div>
                  <Badge variant={product.inStock ? "default" : "secondary"}>
                    {product.inStock ? "In Stock" : "Out of Stock"}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{product.name}</CardTitle>
                <CardDescription>{product.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{product.rating}</span>
                  </div>
                  <Badge variant="outline">{product.category}</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-primary">{product.price.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">SEP Points</div>
                  </div>
                  <Button 
                    disabled={!product.inStock}
                    variant={product.inStock ? "default" : "secondary"}
                  >
                    {product.inStock ? "Redeem" : "Sold Out"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Marketplace Features</CardTitle>
          <CardDescription>
            The full marketplace with product categories, search, and detailed product pages is coming soon!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Features include: Product search and filtering, detailed product reviews, order tracking, 
            wishlists, and integration with fitness tracking for personalized recommendations.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}