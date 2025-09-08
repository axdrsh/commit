"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { createBrowserSupabaseClient } from "@/app/supabase/client";

type Message = {
  id: number;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
};

export default function ChatThreadPage() {
  const supabase = createBrowserSupabaseClient();
  const params = useParams<{ peerId: string }>();
  const peerId = params.peerId as string;
  const [userId, setUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data: session } = await supabase.auth.getSession();
      const uid = session.session?.user.id;
      setUserId(uid ?? null);
      if (!uid) {
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("messages")
        .select("id, sender_id, recipient_id, content, created_at")
        .or(
          `and(sender_id.eq.${uid},recipient_id.eq.${peerId}),and(sender_id.eq.${peerId},recipient_id.eq.${uid})`
        )
        .order("created_at", { ascending: true });
      setMessages((data ?? []) as Message[]);
      setLoading(false);

      const channel = supabase.channel(`messages_${uid}_${peerId}`);
      const handleInsert = (payload: any) => {
        const msg = payload.new as Message;
        setMessages((prev) =>
          prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]
        );
      };
      channel
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `sender_id=eq.${uid},recipient_id=eq.${peerId}`,
          },
          handleInsert
        )
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `sender_id=eq.${peerId},recipient_id=eq.${uid}`,
          },
          handleInsert
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };
    load();
  }, [supabase, peerId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !input.trim()) return;
    const content = input.trim();
    setInput("");
    const { data } = await supabase
      .from("messages")
      .insert({
        sender_id: userId,
        recipient_id: peerId,
        content,
      })
      .select("id, sender_id, recipient_id, content, created_at")
      .single();
    if (data) {
      setMessages((prev) =>
        prev.some((m) => m.id === (data as any).id)
          ? prev
          : [...prev, data as unknown as Message]
      );
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 w-full">
      <h1 className="text-2xl font-semibold mb-4">chat</h1>
      {loading ? (
        <p>Loading...</p>
      ) : !userId ? (
        <p>please log in to chat.</p>
      ) : (
        <div className="flex flex-col h-[70vh] border rounded">
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`max-w-[80%] px-3 py-2 rounded ${
                  m.sender_id === userId
                    ? "self-end bg-foreground text-background"
                    : "self-start border"
                }`}
              >
                {m.content}
                <div className="text-[10px] opacity-70 mt-1">
                  {new Date(m.created_at).toLocaleTimeString()}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
          <form onSubmit={sendMessage} className="p-3 border-t flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 border rounded px-3 py-2 bg-transparent"
              placeholder="Type a message"
            />
            <button className="rounded px-3 py-2 border font-medium">
              send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
