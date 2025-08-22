import React from "react";

type Props = {
  title: string;
  year?: number;
  poster?: string;
};

const MovieCard: React.FC<Props> = ({ title, year, poster = "/placeholder.svg" }) => {
  return (
    <article className="border bg-card group overflow-hidden rounded-lg">
      <img
        src={poster}
        alt={`${title} movie poster`}
        loading="lazy"
        className="h-44 w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
      />
      <div className="p-3">
        <h3 className="text-sm font-medium leading-tight">{title}</h3>
        {year && <p className="text-xs text-muted-foreground">{year}</p>}
      </div>
    </article>
  );
};

export default MovieCard;
