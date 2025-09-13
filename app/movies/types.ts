export type Movie = {
  id: string;
  title: string;
  year: number;
  rating: number;
  description: string;
  whereToWatch: string;
  poster: string; // full URL
};

export type SwipeTrigger = {
  count: number;
  direction: "left" | "right";
  index: number;
};
