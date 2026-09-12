import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Send, MessageSquare, ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Textarea } from "@/components/ui/textarea";

function initials(name) {
  if (!name) return "U";
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

export default function Messages() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [activeConvo, setActiveConvo] = useState(null);
  const scrollRef = useRef(null);

  const loadConvos = useCallback(async () => {
    try {
      const r = await api.get("/conversations");
      setConversations(r.data);
      if (id) setActiveConvo(r.data.find((c) => c.conversation_id === id) || null);
    } catch (e) {}
  }, [id]);

  useEffect(() => { loadConvos(); }, [loadConvos]);

  const loadMessages = useCallback(async () => {
    if (!id) return;
    try {
      const r = await api.get(`/conversations/${id}/messages`);
      setMessages(r.data);
    } catch (e) {}
  }, [id]);

  useEffect(() => {
    loadMessages();
    if (!id) return;
    const t = setInterval(loadMessages, 4000);
    return () => clearInterval(t);
  }, [id, loadMessages]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || !id) return;
    setInput("");
    setMessages((m) => [...m, { message_id: `tmp_${Date.now()}`, sender_id: user.user_id, content: text, timestamp: new Date().toISOString() }]);
    try {
      await api.post(`/conversations/${id}/messages`, { content: text });
      loadMessages();
      loadConvos();
    } catch (e) {}
  };

  return (
    <div className="h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)]">
      <div className="grid md:grid-cols-3 gap-4 h-full">
        {/* Conversation list */}
        <div className={`glass rounded-2xl p-3 md:col-span-1 overflow-y-auto no-scrollbar ${id ? "hidden md:block" : "block"}`} data-testid="messages-conversation-list">
          <p className="font-semibold px-2 py-2">Messages</p>
          {conversations.length === 0 ? (
            <div data-testid="empty-state" className="text-center py-10">
              <MessageSquare size={26} className="mx-auto text-[#8B949E] mb-2" />
              <p className="text-sm text-[#8B949E]">No conversations yet</p>
              <p className="text-xs text-[#8B949E] mt-1">Message a provider from a service page.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {conversations.map((c) => (
                <button
                  key={c.conversation_id}
                  data-testid="conversation-item"
                  onClick={() => navigate(`/messages/${c.conversation_id}`)}
                  className={`w-full text-left rounded-xl p-3 flex items-center gap-3 transition-colors ${id === c.conversation_id ? "bg-white/[0.08]" : "hover:bg-white/[0.05]"}`}
                >
                  <div className="h-10 w-10 rounded-full bg-white/[0.08] flex items-center justify-center text-xs font-semibold shrink-0">{initials(c.other?.name)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{c.other?.name || "Provider"}</p>
                    <p className="text-xs text-[#8B949E] truncate">{c.last_message || c.service_title || "Start chatting"}</p>
                  </div>
                  {c.unread > 0 && <span className="h-5 min-w-5 px-1 rounded-full bg-[#00E5FF] text-[#0D1117] text-[10px] font-bold flex items-center justify-center">{c.unread}</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Thread */}
        <div className={`glass rounded-2xl md:col-span-2 flex flex-col ${id ? "flex" : "hidden md:flex"}`} data-testid="messages-thread">
          {!id ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
              <MessageSquare size={30} className="text-[#8B949E] mb-3" />
              <p className="font-medium">Select a conversation</p>
              <p className="text-sm text-[#8B949E] mt-1">Choose a chat to view messages.</p>
            </div>
          ) : (
            <>
              <div className="px-4 py-3 border-b border-white/[0.08] flex items-center gap-3">
                <button onClick={() => navigate("/messages")} className="md:hidden text-[#8B949E]"><ArrowLeft size={18} /></button>
                <div className="h-9 w-9 rounded-full bg-white/[0.08] flex items-center justify-center text-xs font-semibold">{initials(activeConvo?.other?.name)}</div>
                <div>
                  <p className="text-sm font-medium">{activeConvo?.other?.name || "Provider"}</p>
                  {activeConvo?.service_title && <p className="text-xs text-[#8B949E]">{activeConvo.service_title}</p>}
                </div>
              </div>
              <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-3">
                {messages.map((m) => {
                  const mine = m.sender_id === user.user_id;
                  return (
                    <div key={m.message_id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm ${mine ? "bg-[#00E5FF] text-[#0D1117]" : "bg-white/[0.08] text-white"}`}>{m.content}</div>
                    </div>
                  );
                })}
                {messages.length === 0 && <p className="text-center text-sm text-[#8B949E] py-8">Say hello to start the conversation.</p>}
              </div>
              <div className="p-3 border-t border-white/[0.08] flex items-end gap-2">
                <Textarea
                  data-testid="message-input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                  placeholder="Type a message…"
                  className="flex-1 min-h-[44px] max-h-28 resize-none rounded-xl bg-white/[0.04] border-white/[0.10] text-white placeholder:text-[#8B949E] py-3"
                />
                <button data-testid="send-message-button" onClick={send} disabled={!input.trim()} className="h-11 w-11 rounded-xl bg-[#00E5FF] text-[#0D1117] flex items-center justify-center hover:brightness-110 glow-cyan disabled:opacity-40 transition-[filter] duration-200 shrink-0"><Send size={18} /></button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
