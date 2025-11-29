import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { getLoginUrl } from "@/const";
import { storagePut } from "@/lib/storage";

export default function Admin() {
  const { user, isAuthenticated } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    price: "",
    difficulty: "beginner" as "beginner" | "intermediate" | "advanced",
    finishedSize: "",
    imageFile: null as File | null,
    pdfFile: null as File | null,
    featured: false,
  });

  const { data: patterns, isLoading, refetch } = trpc.admin.patterns.list.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  const createPattern = trpc.admin.patterns.create.useMutation({
    onSuccess: () => {
      toast.success("Pattern created successfully");
      setFormData({
        title: "",
        slug: "",
        description: "",
        price: "",
        difficulty: "beginner",
        finishedSize: "",
        imageFile: null,
        pdfFile: null,
        featured: false,
      });
      setIsCreating(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create pattern");
    },
  });

  const deletePattern = trpc.admin.patterns.delete.useMutation({
    onSuccess: () => {
      toast.success("Pattern deleted");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete pattern");
    },
  });

  if (!isAuthenticated || user?.role !== "admin") {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
    }
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Access denied. Admin only.</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.imageFile || !formData.pdfFile) {
      toast.error("Please upload both image and PDF files");
      return;
    }

    setUploading(true);
    try {
      const imageResult = await storagePut(formData.imageFile, `patterns/${formData.slug}-image`);
      const pdfResult = await storagePut(formData.pdfFile, `patterns/${formData.slug}-pdf`);
      const imageUrl = imageResult.url;
      const pdfUrl = pdfResult.url;
      const pdfFileKey = pdfResult.key;

      createPattern.mutate({
        title: formData.title,
        slug: formData.slug,
        description: formData.description,
        price: Math.round(parseFloat(formData.price) * 100),
        difficulty: formData.difficulty,
        finishedSize: formData.finishedSize || undefined,
        imageUrl,
        pdfUrl,
        pdfFileKey,
        featured: formData.featured ? 1 : 0,
        active: 1,
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to upload files");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Admin Panel</h1>
          <Button onClick={() => setIsCreating(!isCreating)}>
            <Plus className="h-4 w-4 mr-2" />
            {isCreating ? "Cancel" : "Add Pattern"}
          </Button>
        </div>

        {isCreating && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Create New Pattern</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="slug">Slug (URL-friendly)</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    required
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="price">Price (USD)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <Select
                      value={formData.difficulty}
                      onValueChange={(value: any) => setFormData({ ...formData, difficulty: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="finishedSize">Finished Size</Label>
                    <Input
                      id="finishedSize"
                      value={formData.finishedSize}
                      onChange={(e) => setFormData({ ...formData, finishedSize: e.target.value })}
                      placeholder="e.g., 60x80 inches"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="image">Pattern Image</Label>
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setFormData({ ...formData, imageFile: e.target.files?.[0] || null })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="pdf">PDF File</Label>
                    <Input
                      id="pdf"
                      type="file"
                      accept=".pdf"
                      onChange={(e) =>
                        setFormData({ ...formData, pdfFile: e.target.files?.[0] || null })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  />
                  <Label htmlFor="featured" className="cursor-pointer">
                    Feature on homepage
                  </Label>
                </div>

                <Button type="submit" disabled={uploading || createPattern.isPending}>
                  {uploading || createPattern.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Pattern"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>All Patterns</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : patterns && patterns.length > 0 ? (
              <div className="space-y-4">
                {patterns.map((pattern) => (
                  <div
                    key={pattern.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={pattern.imageUrl}
                        alt={pattern.title}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div>
                        <h4 className="font-semibold">{pattern.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          ${(pattern.price / 100).toFixed(2)} • {pattern.difficulty}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this pattern?")) {
                          deletePattern.mutate(pattern.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No patterns yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
