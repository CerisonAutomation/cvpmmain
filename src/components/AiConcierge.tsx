import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { MessageCircle, X, Send, Loader2, Bot, User } from 'lucide-react';
import { streamAiChat } from '@/lib/dal';
import { cn } from '@/lib/utils';

type Msg = { role: 'user' | 'assistant'; content: string };

export default function AiConcierge() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'assistant', content: "Welcome! I'm your Malta property concierge. Ask me anything about our luxury collection, local areas, or booking." },
  ]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController>();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || streaming) return;

    const userMsg: Msg = { role: 'user', content: text };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput('');
    setStreaming(true);

    let assistantText = '';
    abortRef.current = new AbortController();

    const upsert = (chunk: string) => {
      assistantText += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant' && prev.length === history.length + 1) {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantText } : m));
        }
        return [...prev, { role: 'assistant', content: assistantText }];
      });
    };

    await streamAiChat({
      messages: history,
      onDelta: upsert,
      onDone: () => setStreaming(false),
      onError: (err) => {
        setStreaming(false);
        setMessages((prev) => [...prev, { role: 'assistant', content: `Sorry, something went wrong: ${err.message}` }]);
      },
      signal: abortRef.current.signal,
    });
  }, [input, messages, streaming]);

  return (
    <>
      {/* FAB */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:opacity-90 transition-opacity"
            aria-label="Open AI concierge"
          >
            <MessageCircle size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-4rem)] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-muted/30">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot size={16} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">AI Concierge</p>
                  <p className="text-[10px] text-muted-foreground">Malta Property Expert</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                <X size={16} className="text-muted-foreground" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className={cn('flex gap-2', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                  {msg.role === 'assistant' && (
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center mt-0.5">
                      <Bot size={12} className="text-primary" />
                    </div>
                  )}
                  <div
                    className={cn(
                      'max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-md'
                        : 'bg-muted text-foreground rounded-bl-md'
                    )}
                  >
                    {msg.content}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-6 h-6 rounded-full bg-secondary flex-shrink-0 flex items-center justify-center mt-0.5">
                      <User size={12} className="text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}
              {streaming && messages[messages.length - 1]?.role !== 'assistant' && (
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <Loader2 size={12} className="text-primary animate-spin" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-bl-md px-3.5 py-2.5">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border/50">
              <form
                onSubmit={(e) => { e.preventDefault(); send(); }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about properties, areas..."
                  className="flex-1 bg-muted rounded-xl px-3.5 py-2.5 text-sm outline-none placeholder:text-muted-foreground/60 focus:ring-1 focus:ring-primary/30"
                  autoComplete="off"
                  disabled={streaming}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || streaming}
                  className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40 transition-opacity"
                >
                  <Send size={14} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
