"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@/app/supabase/client";

type Profile = {
  id: string;
  username: string | null;
  bio: string | null;
  avatar_url?: string | null;
};

export default function ChatListPage() {
  const supabase = createBrowserSupabaseClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [mutuals, setMutuals] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: session } = await supabase.auth.getSession();
      const uid = session.session?.user.id;
      setUserId(uid ?? null);
      if (!uid) {
        setLoading(false);
        return;
      }
      const { data: incomingRows } = await supabase
        .from("likes")
        .select("user_id")
        .eq("target_id", uid);
      const { data: outgoingRows } = await supabase
        .from("likes")
        .select("target_id")
        .eq("user_id", uid);
      const incomingIds = new Set((incomingRows ?? []).map((r) => r.user_id));
      const outgoingIds = new Set((outgoingRows ?? []).map((r) => r.target_id));
      const mutualIds = [...incomingIds].filter((id) => outgoingIds.has(id));

      if (mutualIds.length === 0) {
        setMutuals([]);
        setLoading(false);
        return;
      }
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username, bio, avatar_url")
        .in("id", mutualIds);
      setMutuals(profiles ?? []);
      setLoading(false);
    };
    load();
  }, [supabase]);

  return (
    <div className="max-w-2xl mx-auto mt-8 w-full">
      <h1 className="text-2xl font-semibold mb-4">chats</h1>
      {loading ? (
        <p>Loading...</p>
      ) : !userId ? (
        <p>please log in to view chats.</p>
      ) : mutuals.length === 0 ? (
        <p>no chats yet. find matches in discover.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {mutuals.map((p) => (
            <li
              key={p.id}
              className="border rounded p-3 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border">
                  {p.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.avatar_url}
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : null}
                </div>
                <div>
                  <div className="font-medium">
                    {p.username || p.id.slice(0, 8)}
                  </div>
                  {p.bio && <p className="text-sm opacity-80">{p.bio}</p>}
                </div>
              </div>
              <Link
                className="text-sm rounded px-3 py-1 border hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a]"
                href={`/chat/${p.id}`}
              >
                open
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
