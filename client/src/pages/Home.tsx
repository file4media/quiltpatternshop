import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { ShoppingCart, MessageCircle, User, LogOut } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useState } from "react";
import { ChatDialog } from "@/components/ChatDialog";

export default function Home() {
  const { user, isAuthenticated, logout } = useAuth();
  const { data: featuredPatterns, isLoading } = trpc.patterns.featured.useQuery();
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <h1 className="text-3xl font-bold text-foreground cursor-pointer">QuiltPatternShop</h1>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/patterns">
              <span className="text-foreground hover:text-primary cursor-pointer transition-colors">Patterns</span>
            </Link>
            {isAuthenticated && user?.role === "admin" && (
              <Link href="/admin">
                <span className="text-foreground hover:text-primary cursor-pointer transition-colors">Admin</span>
              </Link>
            )}
            {isAuthenticated ? (
              <>
                <Link href="/my-patterns">
                  <span className="text-foreground hover:text-primary cursor-pointer transition-colors">My Patterns</span>
                </Link>
                <Button variant="ghost" size="sm" onClick={logout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <Button asChild variant="default" size="sm">
                <a href={getLoginUrl()}>Sign In</a>
              </Button>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative py-16 md:py-24 overflow-hidden bg-gradient-to-b from-[#f8f5f0] to-white">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{ backgroundImage: 'url(/hero-soft.jpg)' }}
          ></div>
          <div className="relative container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-5xl md:text-6xl font-bold text-foreground mb-4">
                Quilting Made Easy
              </h2>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
                Discover beautiful patterns for quilters who love timeless designs
              </p>
            </div>
            
            <div className="max-w-5xl mx-auto">
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden grid md:grid-cols-2 gap-0">
                <div className="aspect-square md:aspect-auto overflow-hidden">
                  <img 
                    src="/quilter-featured.jpg" 
                    alt="Quilter at work"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="bg-gradient-to-br from-[#8b7355] to-[#6d5d4b] p-8 md:p-12 flex flex-col justify-center text-white">
                  <h3 className="text-3xl md:text-4xl font-bold mb-4">
                    New Patterns
                    <span className="block text-[#f4e4c1] mt-2">Just Added</span>
                  </h3>
                  <p className="text-lg mb-6 text-white/90">
                    Explore our curated collection of classic and modern quilt patterns. Instant PDF download with every purchase.
                  </p>
                  <Button asChild size="lg" className="bg-white text-foreground hover:bg-gray-100 font-semibold w-fit">
                    <Link href="/patterns">SEE ALL PATTERNS</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gradient-to-br from-[#e8dcc8] to-[#d4c4b0] p-8 rounded-lg text-center border border-[#c4b5a0]">
                <div className="text-5xl mb-4">✨</div>
                <h3 className="text-2xl font-bold mb-3 text-[#5d4e3a]">Curated Collection</h3>
                <p className="text-lg text-[#6d5d4b]">Hand-picked patterns for every skill level</p>
              </div>
              <div className="bg-gradient-to-br from-[#d4b5a8] to-[#c4a595] p-8 rounded-lg text-center border border-[#b49585]">
                <div className="text-5xl mb-4">📥</div>
                <h3 className="text-2xl font-bold mb-3 text-[#5d4e3a]">Instant Download</h3>
                <p className="text-lg text-[#6d5d4b]">Get your PDF patterns immediately after purchase</p>
              </div>
              <div className="bg-gradient-to-br from-[#b8a89c] to-[#a89888] p-8 rounded-lg text-center border border-[#988878]">
                <div className="text-5xl mb-4">💬</div>
                <h3 className="text-2xl font-bold mb-3 text-[#5d4e3a]">Expert Help</h3>
                <p className="text-lg text-[#6d5d4b] mb-4">Chat with our quilting expert anytime</p>
                <Button 
                  variant="outline" 
                  className="border-[#6d5d4b] text-[#5d4e3a] hover:bg-[#6d5d4b] hover:text-white"
                  onClick={() => setChatOpen(true)}
                >
                  Ask a Question
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <h3 className="text-3xl font-bold text-center mb-12">Featured Patterns</h3>
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
                {featuredPatterns?.map((pattern) => (
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
            {!isLoading && featuredPatterns && featuredPatterns.length === 0 && (
              <div className="text-center text-muted-foreground py-12">
                <p>No featured patterns yet. Check back soon!</p>
              </div>
            )}
          </div>
        </section>

        <section className="py-16 bg-secondary/20">
          <div className="container mx-auto px-4 text-center">
            <h3 className="text-3xl font-bold mb-6">Why Choose QuiltPatternShop?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="p-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="h-8 w-8 text-primary" />
                </div>
                <h4 className="text-xl font-semibold mb-3">Instant Download</h4>
                <p className="text-muted-foreground">
                  Purchase and download your patterns immediately. Start quilting right away.
                </p>
              </div>
              <div className="p-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-8 w-8 text-primary" />
                </div>
                <h4 className="text-xl font-semibold mb-3">Expert Support</h4>
                <p className="text-muted-foreground">
                  Chat with our quilting expert AI assistant anytime for help and advice.
                </p>
              </div>
              <div className="p-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <h4 className="text-xl font-semibold mb-3">Curated Quality</h4>
                <p className="text-muted-foreground">
                  Every pattern is carefully selected for timeless beauty and clear instructions.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-card border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 QuiltPatternShop. All rights reserved.</p>
        </div>
      </footer>

      <ChatDialog open={chatOpen} onOpenChange={setChatOpen} />
    </div>
  );
}
