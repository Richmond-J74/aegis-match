import React, { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Sparkles, X, Plus, Bot, User as UserIcon, FileText, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { API, getToken } from "@/lib/api";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

const PROMPT_PILLS = [
  "I need a logo for my coffee shop, budget $200",
  "Help me write a brief for a SaaS marketing website",
  "Match me with a mobile app developer",
  "What can AEGIS help me with?",
];

function MessageBubble({ role, content }) {
  const isUser = role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""} animate-fade-up`}>
      <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${isUser ? "bg-white/[0.10]" : "bg-[#00E5FF]/15"}`}>
        {isUser ? <UserIcon size={16} className="text-white" /> : <Bot size={16} className="text-[#00E5FF]" />}
      </div>
      <div className={`max-w-[85%] rounded-2xl p-3.5 whitespace-pre-wrap text-sm leading-relaxed ${isUser ? "bg-white/[0.10] border border-white/[0.10]" : "glass"}`}>
        {content || <span className="inline-flex gap-1 items-center"><span className="h-2 w-2 rounded-full bg-[#8B949E] animate-pulse" /><span className="h-2 w-2 rounded-full bg-[#8B949E] animate-pulse" style={{ animationDelay: "0.2s" }} /><span className="h-2 w-2 rounded-full bg-[#8B949E] animate-pulse" style={{ animationDelay: "0.4s" }} /></span>}
      </div>
    </div>
  );
}

export default function AIAssistant() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [provider, setProvider] = useState("openai");
  const [files, setFiles] = useState([]);
  const [streaming, setStreaming] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const sendMessage = async (textOverride) => {
    const text = (textOverride ?? input).trim();
    if (!text || streaming) return;
    const displayText = text + (files.length ? `\n\n📎 ${files.map((f) => f.name).join(", ")}` : "");
    setMessages((m) => [...m, { role: "user", content: displayText }, { role: "assistant", content: "" }]);
    setInput("");
    const sendFiles = files;
    setFiles([]);
    setStreaming(true);

    try {
      const fd = new FormData();
      fd.append("message", text);
      fd.append("provider", provider);
      if (conversationId) fd.append("conversation_id", conversationId);
      sendFiles.forEach((f) => fd.append("files", f));

      const res = await fetch(`${API}/ai/chat`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        credentials: "include",
        body: fd,
      });
      if (!res.ok || !res.body) throw new Error("stream failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";
        for (const part of parts) {
          const lines = part.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const payload = JSON.parse(line.slice(6));
                if (payload.conversation_id) setConversationId(payload.conversation_id);
                if (payload.delta) {
                  setMessages((m) => {
                    const copy = [...m];
                    copy[copy.length - 1] = { role: "assistant", content: copy[copy.length - 1].content + payload.delta };
                    return copy;
                  });
                }
                if (payload.error) toast.error("AI error: " + payload.error);
              } catch (e) {}
            }
          }
        }
      }
    } catch (e) {
      toast.error("Could not reach AEGIS AI");
      setMessages((m) => {
        const copy = [...m];
        if (copy.length && copy[copy.length - 1].role === "assistant" && !copy[copy.length - 1].content) {
          copy[copy.length - 1] = { role: "assistant", content: "Sorry, I couldn't respond just now. Please try again." };
        }
        return copy;
      });
    } finally {
      setStreaming(false);
    }
  };

  const onPickFiles = (e) => {
    const picked = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...picked].slice(0, 4));
    e.target.value = "";
  };

  const newChat = () => {
    setMessages([]);
    setConversationId(null);
    setFiles([]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)]">
      {/* Header */}
      <div className="glass rounded-2xl px-4 py-3 flex items-center gap-3 mb-4">
        <div className="h-9 w-9 rounded-xl bg-[#00E5FF]/15 flex items-center justify-center"><Sparkles size={18} className="text-[#00E5FF]" /></div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold leading-none">AEGIS Core AI</p>
          <p className="text-xs text-[#8B949E] mt-1">Your matching & brief assistant</p>
        </div>
        <Select value={provider} onValueChange={setProvider}>
          <SelectTrigger data-testid="chat-provider-selector" className="h-9 w-[120px] rounded-xl bg-white/[0.04] border-white/[0.10] text-white text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#161B22] border-white/[0.1] text-white">
            <SelectItem value="openai">OpenAI GPT</SelectItem>
            <SelectItem value="claude">Claude</SelectItem>
          </SelectContent>
        </Select>
        <button data-testid="new-chat-button" onClick={newChat} className="h-9 w-9 rounded-xl bg-white/[0.04] border border-white/[0.10] flex items-center justify-center hover:bg-white/[0.08] transition-colors" aria-label="New chat">
          <Plus size={16} />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar space-y-4 pb-4" data-testid="chat-messages">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-6">
            <div className="h-14 w-14 rounded-2xl bg-[#00E5FF]/15 flex items-center justify-center mb-4 glow-cyan"><Sparkles size={26} className="text-[#00E5FF]" /></div>
            <h2 className="text-xl font-bold">How can AEGIS help today?</h2>
            <p className="text-sm text-[#8B949E] mt-2 max-w-sm">Describe your need and I'll shape a clear service brief and match you with the right category.</p>
            <div className="flex flex-wrap gap-2 justify-center mt-6 max-w-lg">
              {PROMPT_PILLS.map((p) => (
                <button key={p} data-testid="chat-prompt-pill" onClick={() => sendMessage(p)} className="rounded-full px-3 py-1.5 text-xs bg-white/[0.06] border border-white/[0.10] hover:bg-white/[0.09] transition-colors text-left">
                  {p}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) => <MessageBubble key={i} role={m.role} content={m.content} />)
        )}
      </div>

      {/* Composer */}
      <div className="glass rounded-2xl p-3">
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {files.map((f, i) => (
              <span key={i} className="rounded-lg px-2 py-1 bg-white/[0.06] border border-white/[0.10] text-xs flex items-center gap-1.5">
                <FileText size={12} className="text-[#00E5FF]" /> {f.name.slice(0, 20)}
                <button onClick={() => setFiles(files.filter((_, x) => x !== i))} className="text-[#8B949E] hover:text-white"><X size={12} /></button>
              </span>
            ))}
          </div>
        )}
        <div className="flex items-end gap-2">
          <input ref={fileInputRef} type="file" multiple hidden onChange={onPickFiles} accept=".txt,.pdf,.docx,.csv,.md,.json" data-testid="chat-file-input" />
          <button data-testid="chat-file-upload-button" onClick={() => fileInputRef.current?.click()} className="h-11 w-11 rounded-xl bg-white/[0.04] border border-white/[0.10] flex items-center justify-center hover:bg-white/[0.08] transition-colors shrink-0" aria-label="Attach file">
            <Paperclip size={18} className="text-[#8B949E]" />
          </button>
          <Textarea
            data-testid="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="Message AEGIS…"
            className="flex-1 min-h-[44px] max-h-32 resize-none rounded-xl bg-white/[0.04] border-white/[0.10] text-white placeholder:text-[#8B949E] py-3"
          />
          <button
            data-testid="chat-send-button"
            onClick={() => sendMessage()}
            disabled={streaming || !input.trim()}
            className="h-11 w-11 rounded-xl bg-[#00E5FF] text-[#0D1117] flex items-center justify-center hover:brightness-110 glow-cyan disabled:opacity-40 transition-[filter] duration-200 shrink-0"
            aria-label="Send"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
