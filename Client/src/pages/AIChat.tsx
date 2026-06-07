import { useState } from "react";
import { Send, Sparkles, User } from "lucide-react";
import { motion } from "framer-motion";

interface Message {
  id: number;
  role: "user" | "ai";
  text: string;
}

const initialMessages: Message[] = [
  { id: 1, role: "ai", text: "Hello! I'm your Cliento AI assistant. I can help you with lead insights, deal suggestions, and CRM analytics. What would you like to know?" },
];

const aiResponses = [
  "Based on your pipeline data, 3 deals in the 'Contacted' stage haven't been updated in 5+ days. I recommend scheduling follow-ups with Wipro Ltd, Bajaj Auto, and Tech Mahindra.",
  "Your conversion rate this month is 24.8%, which is 3.1% higher than last month. The LinkedIn campaign is your top-performing lead source with a 32% conversion rate.",
  "I noticed Reliance Digital's deal (₹45L) has been in the 'Qualified' stage for 12 days. Based on similar deals, the optimal time to close is within 15 days. I suggest scheduling a demo this week.",
  "Your top 3 leads by potential value are: Vikram Singh (₹20L, Reliance Digital), Karan Mehta (₹18L, Bharti Airtel), and Priya Sharma (₹15L, HCL Tech). All are rated 'Hot' and should be prioritized.",
  "This quarter's revenue is ₹28.4L, tracking 15% above target. Your best-performing sales rep is Priya Sharma with 8 deals closed worth ₹42L total.",
];

const AIChat = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");

  const send = () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: Date.now(), role: "user", text: input };
    const aiMsg: Message = { id: Date.now() + 1, role: "ai", text: aiResponses[Math.floor(Math.random() * aiResponses.length)] };
    setMessages((prev) => [...prev, userMsg, aiMsg]);
    setInput("");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)]">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Sparkles size={24} className="text-primary" /> AI Assistant
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Get intelligent CRM insights and suggestions</p>
      </div>

      <div className="flex-1 overflow-auto space-y-4 pr-2">
        {messages.map((m) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}
          >
            {m.role === "ai" && (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-cyan flex items-center justify-center flex-shrink-0">
                <Sparkles size={14} className="text-primary-foreground" />
              </div>
            )}
            <div className={`max-w-[70%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              m.role === "user"
                ? "bg-primary text-primary-foreground"
                : "glass"
            }`}>
              {m.text}
            </div>
            {m.role === "user" && (
              <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                <User size={14} className="text-foreground" />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ask about leads, deals, or analytics..."
          className="flex-1 bg-secondary/50 border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
        />
        <button
          onClick={send}
          className="w-11 h-11 rounded-xl bg-gradient-to-r from-primary to-cyan flex items-center justify-center hover:opacity-90 transition-opacity"
        >
          <Send size={16} className="text-primary-foreground" />
        </button>
      </div>
    </div>
  );
};

export default AIChat;
