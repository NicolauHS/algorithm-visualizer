import barChart from "../../app/components/BarChart";

const CURRENT_POSITION_COLOR = "#1E88E5"; // Blue
const COMPARING_COLOR = "#FFC107"; // Yellow
const SORTED_COLOR = "#9C27B0"; // Purple

export async function bubbleSort(
  chart: ReturnType<typeof barChart>,
  options: {
    skipAnimation?: boolean;
    delay?: number;
  } = {}
) {
  const skipHighlights = options.skipAnimation || chart.getData().length > 500;
  const skipSounds = chart.getData().length > 500; // Skip sounds for very large arrays

  chart.resetComparisonCount();

  const initialData = chart.getData();
  const minValue = Math.min(...initialData);
  const maxValue = Math.max(...initialData);

  let swapped;

  for (let i = 0; i < initialData.length; i++) {
    swapped = false;

    for (let j = 0; j < initialData.length - i - 1; j++) {
      let currentData = chart.getData();

      chart.incrementComparisonCount();

      if (!skipHighlights) {
        chart.highlightValue(currentData[j], COMPARING_COLOR);
        chart.highlightValue(currentData[j + 1], CURRENT_POSITION_COLOR);

        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      if (currentData[j] > currentData[j + 1]) {
        await chart.swap(j, j + 1);
        swapped = true;
      }

      if (!skipHighlights) {
        chart.unhighlightValue(currentData[j]);
        chart.unhighlightValue(currentData[j + 1]);
      }

      const comparisonDelay =
        currentData.length > 500 ? 0 : currentData.length > 200 ? 1 : 5;
      if (comparisonDelay > 0) {
        await new Promise((resolve) => setTimeout(resolve, comparisonDelay));
      }
    }

    const sortedData = chart.getData();
    if (!skipHighlights) {
      chart.highlightValue(sortedData[sortedData.length - i - 1], SORTED_COLOR);
      await new Promise((resolve) => setTimeout(resolve, 20));
      chart.unhighlightValue(sortedData[sortedData.length - i - 1]);
    }

    if (!swapped) {
      break;
    }

    const delay =
      options.delay ||
      (initialData.length > 500 ? 0 : initialData.length > 200 ? 1 : 25);
    if (delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    } else {
      await new Promise((resolve) => requestAnimationFrame(resolve));
    }
  }

  await chart.verifySorted();
}
