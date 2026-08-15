export const getStressColor = (score: number) => {
  if (score <= 3) return '#22c55e'; // calm
  if (score <= 6) return '#f59e0b'; // getting stressed
  return '#ef4444'; // critical
};
