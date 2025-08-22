import React from "react";
import SEO from "@/components/SEO";
import { useAppState } from "@/context/AppState";
import { Pie, PieChart, Cell, ResponsiveContainer } from "recharts";

const COLORS = ["#4f46e5", "#06b6d4", "#f59e0b", "#ef4444", "#10b981"]; // used as inline chart colors only

const ProfilePage = () => {
  const { profile } = useAppState();

  const genreData = [
    { name: "Drama", value: 40 },
    { name: "Sci-Fi", value: 25 },
    { name: "Animation", value: 20 },
    { name: "Horror", value: 10 },
    { name: "Other", value: 5 },
  ];

  return (
    <main className="container mx-auto max-w-5xl px-4 py-8">
      <SEO title="Profile | CineMatch" description="Your film taste dashboard with Top 4 and recent activity." />
      <h1 className="mb-6 text-2xl font-semibold">Your Profile</h1>

      <section className="grid gap-8 md:grid-cols-3">
        <div className="border bg-card rounded-lg p-6">
          <div className="flex items-center gap-4">
            <img
              src={profile?.photoDataUrl || "/placeholder.svg"}
              alt="Profile avatar"
              className="h-16 w-16 rounded-full object-cover"
            />
            <div>
              <h2 className="text-lg font-medium">{profile?.name || "Your Name"}</h2>
              <p className="text-sm text-muted-foreground">{profile?.bio || "Add a short bio in onboarding."}</p>
            </div>
          </div>
        </div>

        <div className="border bg-card rounded-lg p-6 md:col-span-2">
          <h2 className="mb-4 text-base font-medium">Top Genres</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={genreData} dataKey="value" nameKey="name" outerRadius={80} label>
                  {genreData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-4 text-base font-medium">Top 4 Films</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {(profile?.top4?.length ? profile.top4 : [1,2,3,4].map(i => ({ id: String(i), title: "Pick a film" } as any))).map((m: any) => (
            <figure key={m.id} className="text-center border bg-card rounded-md overflow-hidden">
              <img src={m.poster || "/placeholder.svg"} alt={`${m.title} poster`} className="mx-auto h-40 w-full object-cover" />
              <figcaption className="p-2 text-sm">{m.title}</figcaption>
            </figure>
          ))}
        </div>
      </section>
    </main>
  );
};

export default ProfilePage;
