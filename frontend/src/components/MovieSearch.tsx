import React from "react";
import MovieCard from "./MovieCard";
import { Button } from "@/components/ui/button";

export type MovieOption = { id: string; title: string; year?: number; poster?: string };

const SAMPLE_MOVIES: MovieOption[] = [
  { id: "tt6751668", title: "Parasite", year: 2019, poster: "/placeholder.svg" },
  { id: "tt4633694", title: "Spider-Verse", year: 2018, poster: "/placeholder.svg" },
  { id: "tt0111161", title: "Shawshank Redemption", year: 1994, poster: "/placeholder.svg" },
  { id: "tt4154796", title: "Avengers: Endgame", year: 2019, poster: "/placeholder.svg" },
  { id: "tt1375666", title: "Inception", year: 2010, poster: "/placeholder.svg" },
  { id: "tt0095327", title: "Grave of the Fireflies", year: 1988, poster: "/placeholder.svg" },
];

interface Props {
  selected: MovieOption[];
  onChange: (next: MovieOption[]) => void;
}

const MovieSearch: React.FC<Props> = ({ selected, onChange }) => {
  const [query, setQuery] = React.useState("");
  const results = React.useMemo(() => {
    if (!query) return SAMPLE_MOVIES;
    return SAMPLE_MOVIES.filter(m => m.title.toLowerCase().includes(query.toLowerCase()));
  }, [query]);

  const toggle = (movie: MovieOption) => {
    const exists = selected.find(m => m.id === movie.id);
    if (exists) onChange(selected.filter(m => m.id !== movie.id));
    else if (selected.length < 4) onChange([...selected, movie]);
  };

  const clear = () => onChange([]);

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <input
          type="search"
          placeholder="Search movies (TMDB to be connected)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 h-10 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Search movies"
        />
        <Button variant="secondary" onClick={clear} disabled={!selected.length}>Clear</Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {results.map((m) => {
          const active = selected.some(s => s.id === m.id);
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => toggle(m)}
              className={`text-left ${active ? "ring-2 ring-ring rounded-lg" : ""}`}
              aria-pressed={active}
            >
              <MovieCard title={m.title} year={m.year} poster={m.poster} />
            </button>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground">Pick exactly four. These will be your Top 4 and the centerpiece of your profile.</p>
    </section>
  );
};

export default MovieSearch;
