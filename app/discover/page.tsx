"use client";

import { useEffect, useMemo, useState } from "react";
import { createBrowserSupabaseClient } from "@/app/supabase/client";

type Profile = {
  id: string;
  username: string | null;
  bio: string | null;
  tech_stack: string[] | null;
  avatar_url?: string | null;
};

export default function DiscoverPage() {
  const supabase = createBrowserSupabaseClient();
  const [me, setMe] = useState<Profile | null>(null);
  const [others, setOthers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [likedBy, setLikedBy] = useState<Set<string>>(new Set());
  const [likeBusy, setLikeBusy] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    const load = async () => {
      const { data: session } = await supabase.auth.getSession();
      const uid = session.session?.user.id;
      setUserId(uid ?? null);
      if (!uid) {
        setLoading(false);
        return;
      }
      const { data: myProfile } = await supabase
        .from("profiles")
        .select("id, username, bio, tech_stack")
        .eq("id", uid)
        .maybeSingle();
      const { data: otherProfiles } = await supabase
        .from("profiles")
        .select("id, username, bio, tech_stack, avatar_url")
        .neq("id", uid);
      const { data: likeRows } = await supabase
        .from("likes")
        .select("user_id, target_id")
        .or(`user_id.eq.${uid},target_id.eq.${uid}`);
      const likedSet = new Set<string>();
      const likedBySet = new Set<string>();
      for (const row of likeRows ?? []) {
        if (row.user_id === uid) likedSet.add(row.target_id);
        if (row.target_id === uid) likedBySet.add(row.user_id);
      }
      setLiked(likedSet);
      setLikedBy(likedBySet);

      setMe(myProfile ?? null);
      setOthers(otherProfiles ?? []);
      setLoading(false);
    };
    load();
  }, [supabase]);

  const scored = useMemo(() => {
    if (!me) return [] as Array<Profile & { score: number; overlap: string[] }>;
    const myTech = new Set(me.tech_stack ?? []);
    return others
      .map((p) => {
        const t = new Set(p.tech_stack ?? []);
        const overlap = [...t].filter((x) => myTech.has(x));
        const union = new Set([
          ...(p.tech_stack ?? []),
          ...(me.tech_stack ?? []),
        ]);
        const score = union.size ? overlap.length / union.size : 0;
        return { ...p, score, overlap };
      })
      .sort((a, b) => b.score - a.score);
  }, [me, others]);

  const candidates = useMemo(() => {
    // Hide already liked and dismissed
    return scored.filter((p) => !liked.has(p.id) && !dismissed.has(p.id));
  }, [scored, liked, dismissed]);

  useEffect(() => {
    // Reset index if candidates list changes
    if (currentIdx >= candidates.length) setCurrentIdx(0);
  }, [candidates, currentIdx]);

  const handleLike = async (targetId: string) => {
    if (!userId) return;
    try {
      setLikeBusy(targetId);
      const { error } = await supabase
        .from("likes")
        .insert({ user_id: userId, target_id: targetId });
      if (!error) {
        setLiked((prev) => new Set(prev).add(targetId));
        setCurrentIdx((i) => i + 1);
      }
    } finally {
      setLikeBusy(null);
    }
  };

  const handleReject = (targetId: string) => {
    setDismissed((prev) => new Set(prev).add(targetId));
    setCurrentIdx((i) => i + 1);
  };

  const current = candidates[currentIdx];

  return (
    <div className="mx-auto mt-8 w-full max-w-md">
      <h1 className="text-2xl font-semibold mb-6 text-center">discover</h1>
      {loading ? (
        <p className="text-center">Loading...</p>
      ) : !me ? (
        <p className="text-center">Please log in and complete your profile.</p>
      ) : !current ? (
        <p className="text-center">You're all caught up.</p>
      ) : (
        <div className="flex flex-col items-center gap-4 select-none">
          <div className="border rounded-xl w-80 h-80 p-4 bg-background shadow-sm relative">
            <div className="absolute top-2 right-2 text-xs px-2 py-0.5 rounded border">
              {Math.round(current.score * 100)}% match
            </div>
            <div className="h-full w-full flex flex-col justify-between">
              <div>
                <div className="w-20 h-20 rounded-full overflow-hidden border mb-3">
                  {current.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={current.avatar_url}
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="text-xl font-semibold">
                  {current.username || current.id.slice(0, 8)}
                </div>
                {current.bio && (
                  <p className="mt-2 text-sm opacity-90">{current.bio}</p>
                )}
                {current.overlap.length > 0 && (
                  <div className="text-xs opacity-80 mt-2">
                    Overlap: {current.overlap.join(", ")}
                  </div>
                )}
              </div>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => handleReject(current.id)}
                  className="rounded px-4 py-2 border"
                >
                  Pass
                </button>
                {liked.has(current.id) ? (
                  <span className="text-xs px-3 py-2 rounded border">
                    Liked
                  </span>
                ) : (
                  <button
                    onClick={() => handleLike(current.id)}
                    disabled={likeBusy === current.id}
                    className="rounded px-4 py-2 border font-medium disabled:opacity-60"
                  >
                    {likeBusy === current.id ? "Liking..." : "Like"}
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="text-xs opacity-70">Use buttons to pass or like</div>
        </div>
      )}
    </div>
  );
}
