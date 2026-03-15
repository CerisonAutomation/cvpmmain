import { useState, useRef, useEffect, useCallback, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { MessageCircle, X, Send, Loader2, Bot, User } from 'lucide-react';
import { streamAiChat } from '@/lib/dal';
import { cn } from '@/lib/utils';

type Msg = { role: 'user' | 'assistant'; content: string; id: string };

// Max messages kept in context window sent to the AI edge function.
// Older messages are trimmed from the payload (not from UI history).
const MAX_CONTEXT_MESSAGES = 12;
const SESSION_KEY = 'cv_ai_chat_history';

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

const WELCOME_MSG: Msg = {
  id: 'welcome',
  role: 'assistant',
  content: "Welcome! I'm your Malta property concierge. Ask me anything about our luxury collection, local areas, or booking.",
};

function loadHistory(): Msg[] {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return [WELCOME_MSG];
    const parsed: Msg[] = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [WELCOME_MSG];
  } catch {
    return [WELCOME_MSG];
  }
}

function saveHistory(msgs: Msg[]) {
  try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(msgs)); } catch {}
}

export default function AiConcierge() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>(loadHistory);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const liveRegionId = useId();

  // Persist chat across page navigations
  useEffect(() => { saveHistory(messages); }, [messages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150);
  }, [open]);

  // Abort stream on unmount
  useEffect(() => {
    return () => { abortRef.current?.abort(); };
  }, []);

  const handleClose = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setStreaming(false);
    setOpen(false);
  }, []);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || streaming) return;

    const userMsg: Msg = { id: makeId(), role: 'user', content: text };
    const assistantId = makeId();
    const nextMessages = [...messages, userMsg];

    setMessages([...nextMessages, { id: assistantId, role: 'assistant', content: '' }]);
    setInput('');
    setStreaming(true);

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    // Trim context: send only the last MAX_CONTEXT_MESSAGES to the edge function
    // to prevent token limit errors and runaway billing
    const contextWindow = nextMessages.slice(-MAX_CONTEXT_MESSAGES);

    await streamAiChat({
      messages: contextWindow.map(({ role, content }) => ({ role, content })),
      onDelta: (chunk) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: m.content + chunk } : m
          )
        );
      },
      onDone: () => setStreaming(false),
      onError: (err) => {
        setStreaming(false);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: `Sorry, something went wrong: ${err.message}` }
              : m
          )
        );
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
            aria-label="Open AI concierge chat"
          >
            <MessageCircle size={24} aria-hidden />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="AI Concierge chat"
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
                  <Bot size={16} className="text-primary" aria-hidden />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">AI Concierge</p>
                  <p className="text-[10px] text-muted-foreground">Malta Property Expert</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                aria-label="Close chat"
              >
                <X size={16} className="text-muted-foreground" aria-hidden />
              </button>
            </div>

            {/* Live region for screen readers */}
            <div
              id={liveRegionId}
              aria-live="polite"
              aria-atomic="false"
              className="sr-only"
            >
              {streaming ? 'Assistant is typing…' : messages[messages.length - 1]?.role === 'assistant'
                ? messages[messages.length - 1].content
                : ''}
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className={cn('flex gap-2', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                  {msg.role === 'assistant' && (
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center mt-0.5" aria-hidden>
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
                    {msg.role === 'assistant' ? (
                      <div className="prose prose-sm dark:prose-invert prose-p:my-1 prose-headings:my-2 max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      msg.content
                    )}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-6 h-6 rounded-full bg-secondary flex-shrink-0 flex items-center justify-center mt-0.5" aria-hidden>
                      <User size={12} className="text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}
              {streaming && messages[messages.length - 1]?.content === '' && (
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center" aria-hidden>
                    <Loader2 size={12} className="text-primary animate-spin" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-bl-md px-3.5 py-2.5">
                    <div className="flex gap-1" aria-hidden>
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
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about properties, areas…"
                  aria-label="Chat message"
                  className="flex-1 bg-muted rounded-xl px-3.5 py-2.5 text-sm outline-none placeholder:text-muted-foreground/60 focus:ring-1 focus:ring-primary/30"
                  autoComplete="off"
                  disabled={streaming}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || streaming}
                  aria-label="Send message"
                  className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40 transition-opacity"
                >
                  <Send size={14} aria-hidden />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
