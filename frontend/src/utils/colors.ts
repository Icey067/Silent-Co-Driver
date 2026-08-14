export const getStressColor = (score: number) => {
  if (score <= 3) return '#22c55e'; // Calm
  if (score <= 6) return '#f59e0b'; // Elevated
  return '#ef4444'; // Critical
};
