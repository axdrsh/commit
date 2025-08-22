import React from "react";
import { useNavigate } from "react-router-dom";
import SEO from "@/components/SEO";
import MovieSearch, { MovieOption } from "@/components/MovieSearch";
import { Button } from "@/components/ui/button";
import { useAppState } from "@/context/AppState";
import { toast } from "@/hooks/use-toast";

const Onboarding = () => {
  const navigate = useNavigate();
  const { setProfile } = useAppState();
  const [step, setStep] = React.useState(1);
  const [name, setName] = React.useState("");
  const [bio, setBio] = React.useState("");
  const [photo, setPhoto] = React.useState<string | undefined>(undefined);
  const [top4, setTop4] = React.useState<MovieOption[]>([]);

  const next = () => setStep((s) => s + 1);
  const prev = () => setStep((s) => s - 1);

  const onPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(String(reader.result));
    reader.readAsDataURL(file);
  };

  const finish = () => {
    if (top4.length !== 4) return;
    setProfile({ name: name || "You", bio, photoDataUrl: photo, top4 });
    toast({
      title: "Welcome aboard!",
      description: "Profile created. You can refine it anytime.",
    });
    navigate("/feed");
  };

  return (
    <main className="container mx-auto max-w-3xl px-4 py-8">
      <SEO
        title="Onboarding | CineMatch"
        description="Create your cinephile profile and pick your Top 4 films."
      />
      <h1 className="mb-6 text-2xl font-semibold">Quick Onboarding</h1>

      {step === 1 && (
        <section className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Your name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="e.g. Alex"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Profile photo</label>
            <input type="file" accept="image/*" onChange={onPhoto} />
            {photo && (
              <img
                src={photo}
                alt="Profile preview"
                className="h-28 w-28 rounded-full object-cover"
              />
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Short bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full rounded-md border bg-background p-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Film obsessions, favorite genres, recent watches..."
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button onClick={next}>Continue</Button>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="space-y-6">
          <h2 className="text-lg font-medium">Pick your Top 4 films</h2>
          <MovieSearch selected={top4} onChange={setTop4} />
          <div className="flex items-center justify-between">
            <Button variant="secondary" onClick={prev}>
              Back
            </Button>
            <Button onClick={next} disabled={top4.length !== 4}>
              Review
            </Button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="space-y-6">
          <h2 className="text-lg font-medium">Review</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {top4.map((m) => (
              <figure key={m.id} className="text-center">
                <img
                  src={m.poster || "/placeholder.svg"}
                  alt={`${m.title} poster`}
                  className="mx-auto h-32 w-full max-w-[120px] rounded-md object-cover"
                />
                <figcaption className="mt-2 text-sm">{m.title}</figcaption>
              </figure>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <Button variant="secondary" onClick={prev}>
              Back
            </Button>
            <Button onClick={finish} disabled={top4.length !== 4}>
              Finish
            </Button>
          </div>
        </section>
      )}
    </main>
  );
};

export default Onboarding;
