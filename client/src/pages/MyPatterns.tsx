import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Download } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";

export default function MyPatterns() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { data: purchases, isLoading } = trpc.purchases.myPurchases.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    window.location.href = getLoginUrl();
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-12">My Patterns</h1>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-square bg-muted"></div>
                <CardContent className="p-4">
                  <div className="h-6 bg-muted rounded mb-2"></div>
                  <div className="h-10 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : purchases && purchases.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {purchases.map(({ purchase, pattern }) => (
              <Card key={purchase.id} className="overflow-hidden">
                <div className="aspect-square overflow-hidden bg-muted">
                  <img
                    src={pattern?.imageUrl}
                    alt={pattern?.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <h4 className="text-xl font-semibold mb-4">{pattern?.title}</h4>
                  <Button className="w-full" asChild>
                    <a href={pattern?.pdfUrl} target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </a>
                  </Button>
                  <p className="text-xs text-muted-foreground mt-3 text-center">
                    Purchased {new Date(purchase.purchasedAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-12">
            <p className="mb-4">You have not purchased any patterns yet.</p>
            <Button onClick={() => setLocation("/patterns")}>Browse Patterns</Button>
          </div>
        )}
      </div>
    </div>
  );
}
