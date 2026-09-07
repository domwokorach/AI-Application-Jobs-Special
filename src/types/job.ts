export type Job = {
  id: string;
  title: string;
  location: string;
  employmentType: "full-time" | "part-time" | "temporary" | "permanent";
  description: string;
};
