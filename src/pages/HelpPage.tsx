import React from "react";

import React, { useEffect, useRef, useState } from "react";
import Navigation from "@/components/Navigation";

type Message = {
  id: string;
  sender: "bot" | "user";
  text: string;
};

const FAQS: { question: string; answer: string }[] = [
  {
    question: "How do I create a new post?",
    answer: "Go to the Post page, fill in product details, select a location on the map, and submit. Make sure you're signed in.",
  },
  {
    question: "How do I join a request?",
    answer: "Open the request on the Live Map or in the request list and click 'Join Request'. This will notify the requester so you can coordinate pickup.",
  },
  {
    question: "What if my product photo is missing?",
    answer: "You can add a product image when creating a post. If none is provided, we show a default image in the map pin and preview.",
  },
  {
    question: "How is distance calculated?",
    answer: "Distances are approximate and calculated in miles using the Haversine formula between your location and the request location.",
  },
  {
    question: "How do I report an issue?",
    answer: "Use the Contact page to send us a message or email support@example.com with details and screenshots.",
  },
];

const generateId = () => Math.random().toString(36).slice(2, 9);

const HelpPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([{
    id: generateId(),
    sender: "bot",
    text: "Hi! I'm HelpBot. Ask me anything or choose a suggested question below.",
  }]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const replyFromBot = (userText: string) => {
    setIsTyping(true);
    // simple FAQ matching
    const found = FAQS.find((f) => f.question.toLowerCase() === userText.toLowerCase());
    const answer = found
      ? found.answer
      : "I didn't find an exact match. Try one of the suggested questions or rephrase — I can help with posting, joining, reporting issues, and account settings.";

    setTimeout(() => {
      setMessages((prev) => [...prev, { id: generateId(), sender: "bot", text: answer }]);
      setIsTyping(false);
    }, 600);
  };

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const t = text.trim();
    setMessages((prev) => [...prev, { id: generateId(), sender: "user", text: t }]);
    setInput("");
    replyFromBot(t);
  };

  const onSuggestionClick = (q: string) => {
    setMessages((prev) => [...prev, { id: generateId(), sender: "user", text: q }]);
    replyFromBot(q);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto bg-card/90 shadow-card rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border/30 bg-gradient-to-r from-gray-900 to-gray-800">
            <h1 className="text-xl font-semibold">HelpBot</h1>
            <p className="text-sm text-muted-foreground">Chat with our FAQ bot to get quick answers.</p>
          </div>

          <div className="flex">
            {/* Chat area */}
            <div className="flex-1 p-4">
              <div className="h-[60vh] overflow-y-auto pr-2" aria-live="polite">
                {messages.map((m) => (
                  <div key={m.id} className={`flex items-start gap-3 my-3 ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
                    {m.sender === "bot" && (
                      <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-bold">B</div>
                    )}

                    <div className={`${m.sender === "user" ? "bg-primary/90 text-white rounded-xl px-4 py-2 max-w-[72%] ml-auto" : "bg-gray-900/80 text-gray-100 rounded-xl px-4 py-2 max-w-[72%]"}`}>
                      <div style={{ whiteSpace: "pre-wrap" }}>{m.text}</div>
                    </div>

                    {m.sender === "user" && (
                      <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-foreground">U</div>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-start gap-3 my-3">
                    <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-bold">B</div>
                    <div className="bg-gray-900/80 text-gray-100 rounded-xl px-4 py-2 max-w-[60%]">
                      <div className="animate-pulse">Typing...</div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              <div className="mt-4">
                <div className="flex gap-2 flex-wrap">
                  {FAQS.map((f) => (
                    <button
                      key={f.question}
                      onClick={() => onSuggestionClick(f.question)}
                      className="text-sm px-3 py-1 rounded-full bg-muted/70 hover:bg-muted transition"
                    >
                      {f.question}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 border-t border-border/30 pt-3 flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") sendMessage(input); }}
                  placeholder="Type your question..."
                  className="flex-1 p-2 rounded-lg bg-background/80 border border-border text-foreground focus:outline-none"
                />
                <button onClick={() => sendMessage(input)} className="px-4 py-2 rounded-lg bg-primary text-white font-semibold">Send</button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
