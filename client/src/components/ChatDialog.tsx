import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { trpc } from "@/lib/trpc";
import { Loader2, Send } from "lucide-react";
import { Streamdown } from "streamdown";
import { nanoid } from "nanoid";

interface ChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChatDialog({ open, onOpenChange }: ChatDialogProps) {
  const [sessionId] = useState(() => nanoid());
  const [message, setMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: history, refetch } = trpc.chat.getHistory.useQuery(sessionId, {
    enabled: open,
  });

  const sendMessage = trpc.chat.sendMessage.useMutation({
    onSuccess: () => {
      refetch();
      setMessage("");
    },
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleSend = () => {
    if (!message.trim() || sendMessage.isPending) return;
    sendMessage.mutate({ sessionId, message: message.trim() });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle>Quilting Expert Assistant</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
          <div className="space-y-4">
            {!history || history.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <p className="mb-2">Hello! I am your quilting expert assistant.</p>
                <p className="text-sm">
                  Ask me anything about quilting techniques, pattern recommendations, fabric choices, or general quilting advice.
                </p>
              </div>
            ) : (
              history.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <Streamdown>{msg.content}</Streamdown>
                    ) : (
                      <p>{msg.content}</p>
                    )}
                  </div>
                </div>
              ))
            )}
            {sendMessage.isPending && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-4">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex gap-2 pt-4 border-t">
          <Input
            placeholder="Ask about quilting..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={sendMessage.isPending}
          />
          <Button onClick={handleSend} disabled={sendMessage.isPending || !message.trim()}>
            {sendMessage.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
