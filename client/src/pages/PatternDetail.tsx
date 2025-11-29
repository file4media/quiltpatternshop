import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { Download, ArrowLeft } from "lucide-react";

export default function PatternDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();

  const { data: pattern, isLoading } = trpc.patterns.getBySlug.useQuery(slug!);
  const { data: hasPurchased } = trpc.purchases.hasPurchased.useQuery(pattern?.id || 0, {
    enabled: isAuthenticated && !!pattern,
  });

  const createCheckout = trpc.checkout.createSession.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        toast.success("Redirecting to checkout...");
        window.open(data.url, "_blank");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create checkout session");
    },
  });

  const handlePurchase = () => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    if (pattern) {
      createCheckout.mutate({ patternId: pattern.id });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mb-8"></div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="aspect-square bg-muted rounded"></div>
              <div className="space-y-4">
                <div className="h-10 bg-muted rounded"></div>
                <div className="h-6 bg-muted rounded w-1/2"></div>
                <div className="h-32 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!pattern) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Pattern not found</h2>
          <Button onClick={() => setLocation("/patterns")}>Browse Patterns</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <Button variant="ghost" onClick={() => setLocation("/patterns")} className="mb-8">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Patterns
        </Button>

        <div className="grid md:grid-cols-2 gap-12">
          <div className="aspect-square overflow-hidden rounded-lg bg-muted">
            <img
              src={pattern.imageUrl}
              alt={pattern.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold mb-4">{pattern.title}</h1>
              <div className="flex items-center gap-4 mb-6">
                <Badge variant="secondary" className="text-base px-4 py-1">
                  {pattern.difficulty}
                </Badge>
                {pattern.finishedSize && (
                  <span className="text-muted-foreground">Size: {pattern.finishedSize}</span>
                )}
              </div>
              <p className="text-2xl font-bold text-primary mb-6">
                ${(pattern.price / 100).toFixed(2)}
              </p>
            </div>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3">Description</h3>
                <p className="text-muted-foreground whitespace-pre-line">{pattern.description}</p>
              </CardContent>
            </Card>

            {hasPurchased ? (
              <Button size="lg" className="w-full" asChild>
                <a href={pattern.pdfUrl} target="_blank" rel="noopener noreferrer">
                  <Download className="h-5 w-5 mr-2" />
                  Download PDF
                </a>
              </Button>
            ) : (
              <Button
                size="lg"
                className="w-full"
                onClick={handlePurchase}
                disabled={createCheckout.isPending}
              >
                {createCheckout.isPending ? "Processing..." : "Purchase Pattern"}
              </Button>
            )}

            {!isAuthenticated && (
              <p className="text-sm text-muted-foreground text-center">
                Please sign in to purchase this pattern
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
