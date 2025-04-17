import barChart from "../../app/components/BarChart";

const CURRENT_POSITION_COLOR = "#1E88E5"; // Blue
const COMPARING_COLOR = "#FFC107"; // Yellow
const SORTED_COLOR = "#9C27B0"; // Purple

export async function quickSort(
  chart: ReturnType<typeof barChart>,
  options: {
    skipAnimation?: boolean;
    delay?: number;
  } = {}
) {
  const skipHighlights = options.skipAnimation || chart.getData().length > 500;
  const skipSounds = chart.getData().length > 500; // Skip sounds for very large arrays

  const initialData = chart.getData();
  const minValue = Math.min(...initialData);
  const maxValue = Math.max(...initialData);

  chart.resetComparisonCount();
}
