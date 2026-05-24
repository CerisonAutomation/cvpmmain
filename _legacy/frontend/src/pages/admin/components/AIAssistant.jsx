import { useState, memo } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles, ChevronDown, ChevronRight, Loader2, Wand2 } from "lucide-react";

export const AIAssistant = memo(({ block, onApply, isGenerating }) => {
  const [prompt, setPrompt] = useState("");
  const [expanded, setExpanded] = useState(false);

  const runAI = async () => {
    if (!prompt.trim() || !block) return;
    onApply(prompt);
    setPrompt("");
  };

  return (
    <div className="border-b border-[#1e1e22]">
      <button onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 text-sm font-medium text-[#f0ede8] hover:text-[#D4AF37] transition-colors">
        <span className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-[#D4AF37]" />AI Assistant</span>
        {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>
      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          <Textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="e.g. Make the headline more urgent and action-oriented."
            className="bg-[#0a0a0b] border-[#1e1e22] text-[#f0ede8] text-xs min-h-[80px] resize-none focus:border-[#D4AF37]/50"
          />
          <div className="grid grid-cols-3 gap-2">
            {["Shorter", "More Luxury", "Action Words"].map(q => (
              <button key={q} onClick={() => setPrompt(p => p + (p ? ". " : "") + q)}
                className="px-2 py-1.5 text-[9px] bg-[#0e0e10] border border-[#1e1e22] rounded text-[#6a6a6e] hover:text-[#D4AF37] hover:border-[#D4AF37]/30">
                {q}
              </button>
            ))}
          </div>
          <Button onClick={runAI} disabled={isGenerating || !prompt.trim()}
            className="w-full bg-[#D4AF37] hover:bg-[#E5C158] text-[#0a0a0b] h-9 text-xs font-semibold">
            {isGenerating ? <><Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />Generating...</> : <><Wand2 className="w-3.5 h-3.5 mr-2" />Generate Draft</>}
          </Button>
        </div>
      )}
    </div>
  );
});
