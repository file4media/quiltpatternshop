import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";

export default function Patterns() {
  const { data: patterns, isLoading } = trpc.patterns.list.useQuery();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-12">All Patterns</h1>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-square bg-muted"></div>
                <CardContent className="p-4">
                  <div className="h-6 bg-muted rounded mb-2"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {patterns?.map((pattern) => (
              <Link key={pattern.id} href={`/pattern/${pattern.slug}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <div className="aspect-square overflow-hidden bg-muted">
                    <img
                      src={pattern.imageUrl}
                      alt={pattern.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-6">
                    <h4 className="text-xl font-semibold mb-2">{pattern.title}</h4>
                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                      {pattern.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">{pattern.difficulty}</Badge>
                      <span className="text-lg font-semibold">
                        ${(pattern.price / 100).toFixed(2)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {!isLoading && patterns && patterns.length === 0 && (
          <div className="text-center text-muted-foreground py-12">
            <p>No patterns available yet. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
}
