import React from "react";
import SEO from "@/components/SEO";
import { useAppState } from "@/context/AppState";
import { Button } from "@/components/ui/button";

const ChatPage = () => {
  const { matches, conversations, sendMessage } = useAppState();
  const [activeId, setActiveId] = React.useState(matches[0]?.id || "");
  const convo = activeId ? conversations[activeId] : undefined;
  const [input, setInput] = React.useState("");

  const icebreakers = [
    "What did you think of the ending of Arrival?",
    "Favorite Wes Anderson film?",
    "Ghibli marathon pick?",
  ];

  const onSend = () => {
    if (!activeId || !input.trim()) return;
    sendMessage(activeId, input.trim());
    setInput("");
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <SEO title="Chat | CineMatch" description="Chat with your matches using film‑based icebreakers." />
      <h1 className="mb-4 text-2xl font-semibold">Chat</h1>

      <section className="grid gap-4 md:grid-cols-[260px_1fr]">
        <aside className="border bg-card rounded-lg p-3">
          <h2 className="mb-2 text-sm font-medium">Matches</h2>
          <ul className="space-y-1">
            {matches.map((m) => (
              <li key={m.id}>
                <button
                  className={`w-full rounded-md px-3 py-2 text-left text-sm ${activeId === m.id ? "bg-muted" : "hover:bg-muted/50"}`}
                  onClick={() => setActiveId(m.id)}
                >
                  {m.name} <span className="text-muted-foreground">• {m.matchScore}%</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <section className="border bg-card flex min-h-[420px] flex-col rounded-lg">
          {activeId ? (
            <>
              <div className="border-b p-3 text-sm text-muted-foreground">
                Try an icebreaker:
                <div className="mt-2 flex flex-wrap gap-2">
                  {icebreakers.map((q, i) => (
                    <button key={i} className="rounded-full border px-3 py-1 text-xs hover:bg-muted" onClick={() => setInput(q)}>
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 space-y-2 overflow-y-auto p-3">
                {convo?.messages.map((m) => (
                  <div key={m.id} className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${m.fromMe ? "ml-auto bg-primary text-primary-foreground" : "bg-secondary"}`}>
                    {m.text}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 border-t p-3">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && onSend()}
                  placeholder="Type a message"
                  className="flex-1 h-10 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <Button onClick={onSend}>Send</Button>
              </div>
            </>
          ) : (
            <div className="grid flex-1 place-items-center p-6 text-sm text-muted-foreground">Select a match to start chatting.</div>
          )}
        </section>
      </section>
    </main>
  );
};

export default ChatPage;
