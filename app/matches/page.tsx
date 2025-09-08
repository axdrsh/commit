"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@/app/supabase/client";

type Profile = {
  id: string;
  username: string | null;
  bio: string | null;
  tech_stack: string[] | null;
  avatar_url?: string | null;
};

export default function MatchesPage() {
  const supabase = createBrowserSupabaseClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [incoming, setIncoming] = useState<Profile[]>([]);
  const [outgoing, setOutgoing] = useState<Profile[]>([]);
  const [mutual, setMutual] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

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
      const incomingIds = Array.from(
        new Set((incomingRows ?? []).map((r) => r.user_id))
      );

      const { data: outgoingRows } = await supabase
        .from("likes")
        .select("target_id")
        .eq("user_id", uid);
      const outgoingIds = Array.from(
        new Set((outgoingRows ?? []).map((r) => r.target_id))
      );

      const mutualIds = incomingIds.filter((id) => outgoingIds.includes(id));
      const onlyIncoming = incomingIds.filter((id) => !mutualIds.includes(id));
      const onlyOutgoing = outgoingIds.filter((id) => !mutualIds.includes(id));

      const fetchProfiles = async (ids: string[]) => {
        if (ids.length === 0) return [] as Profile[];
        const { data } = await supabase
          .from("profiles")
          .select("id, username, bio, tech_stack, avatar_url")
          .in("id", ids);
        return (data ?? []) as Profile[];
      };

      const [incomingProfiles, outgoingProfiles, mutualProfiles] =
        await Promise.all([
          fetchProfiles(onlyIncoming),
          fetchProfiles(onlyOutgoing),
          fetchProfiles(mutualIds),
        ]);

      setIncoming(incomingProfiles);
      setOutgoing(outgoingProfiles);
      setMutual(mutualProfiles);
      setLoading(false);
    };
    load();
  }, [supabase]);

  const likeBack = async (targetId: string) => {
    if (!userId) return;
    try {
      setBusyId(targetId);
      const { error } = await supabase
        .from("likes")
        .insert({ user_id: userId, target_id: targetId });
      if (!error) {
        setIncoming((prev) => prev.filter((p) => p.id !== targetId));
        setMutual((prev) => {
          const found = incoming.find((p) => p.id === targetId);
          if (!found) return prev;
          if (prev.some((p) => p.id === targetId)) return prev;
          return [...prev, found];
        });
        setOutgoing((prev) => {
          // optional: add to outgoing for completeness
          const found = incoming.find((p) => p.id === targetId);
          if (!found) return prev;
          if (prev.some((p) => p.id === targetId)) return prev;
          return [...prev, found];
        });
      }
    } finally {
      setBusyId(null);
    }
  };

  const rejectIncoming = (targetId: string) => {
    setIncoming((prev) => prev.filter((p) => p.id !== targetId));
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 w-full">
      <h1 className="text-2xl font-semibold mb-4">matches</h1>
      {loading ? (
        <p>Loading...</p>
      ) : !userId ? (
        <p>Please log in to view matches.</p>
      ) : (
        <div className="flex flex-col gap-6">
          <section>
            <h2 className="font-medium mb-2">mutual</h2>
            {mutual.length === 0 ? (
              <p className="text-sm opacity-80">No mutual matches yet.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {mutual.map((p) => (
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
                      <div className="font-medium">
                        {p.username || p.id.slice(0, 8)}
                      </div>
                      {p.bio && <p className="text-sm mt-1">{p.bio}</p>}
                    </div>
                    <a
                      href={`/chat/${p.id}`}
                      className="text-sm rounded px-3 py-1 border hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a]"
                    >
                      chat
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="font-medium mb-2">incoming</h2>
            {incoming.length === 0 ? (
              <p className="text-sm opacity-80">No new likes.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {incoming.map((p) => (
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
                      <div className="font-medium">
                        {p.username || p.id.slice(0, 8)}
                      </div>
                      {p.bio && <p className="text-sm mt-1">{p.bio}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => rejectIncoming(p.id)}
                        className="text-sm rounded px-3 py-1 border hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a]"
                      >
                        reject
                      </button>
                      <button
                        onClick={() => likeBack(p.id)}
                        disabled={busyId === p.id}
                        className="text-sm rounded px-3 py-1 border hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] disabled:opacity-60"
                      >
                        {busyId === p.id ? "liking..." : "like back"}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="font-medium mb-2">outgoing</h2>
            {outgoing.length === 0 ? (
              <p className="text-sm opacity-80">
                you haven't liked anyone yet.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {outgoing.map((p) => (
                  <li
                    key={p.id}
                    className="border rounded p-3 flex items-center gap-3"
                  >
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
                      {p.bio && <p className="text-sm mt-1">{p.bio}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
