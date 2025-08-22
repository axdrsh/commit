import React from "react";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Heart, X } from "lucide-react";

const MOCK_PROFILES = [
  {
    id: "p1",
    name: "Sarah",
    age: 28,
    location: "NYC",
    matchScore: 88,
    sharedReasons: ["You both love Studio Ghibli", "Both rated Parasite ★★★★★"],
    photoUrl: "/placeholder.svg",
  },
  {
    id: "p2",
    name: "Noah",
    age: 31,
    location: "Austin",
    matchScore: 73,
    sharedReasons: ["High overlap in sci‑fi", "You liked Arrival"],
    photoUrl: "/placeholder.svg",
  },
];

const Feed = () => {
  const [index, setIndex] = React.useState(0);
  const [matchOpen, setMatchOpen] = React.useState(false);
  const current = MOCK_PROFILES[index % MOCK_PROFILES.length];

  const pass = () => setIndex(i => i + 1);
  const like = () => {
    if (current.matchScore >= 85) setMatchOpen(true);
    else setIndex(i => i + 1);
  };

  return (
    <main className="container mx-auto max-w-xl px-4 py-8">
      <SEO title="Feed | CineMatch" description="Discover profiles ranked by your film taste match." />
      <h1 className="mb-4 text-2xl font-semibold">Match Feed</h1>

      <Card className="overflow-hidden">
        <img src={current.photoUrl} alt={`${current.name}'s profile photo`} className="h-80 w-full object-cover" />
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium">{current.name}, {current.age}</h2>
              <p className="text-sm text-muted-foreground">{current.location}</p>
            </div>
            <div className="rounded-full bg-secondary px-3 py-1 text-sm font-medium">{current.matchScore}% match</div>
          </div>
          <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
            {current.sharedReasons.map((r: string, i: number) => (
              <li key={i}>• {r}</li>
            ))}
          </ul>

          <div className="mt-4 flex items-center justify-center gap-4">
            <Button variant="secondary" size="lg" onClick={pass} aria-label="Pass">
              <X className="mr-2 h-4 w-4" /> Pass
            </Button>
            <Button size="lg" onClick={like} aria-label="Like">
              <Heart className="mr-2 h-4 w-4" /> Like
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={matchOpen} onOpenChange={setMatchOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New co‑star found!</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">You and {current.name} can now discuss your shared love for A24 horror.</p>
          <div className="flex justify-end">
            <Button onClick={() => { setMatchOpen(false); setIndex(i => i + 1); }}>Continue</Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default Feed;
