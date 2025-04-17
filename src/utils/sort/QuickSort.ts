import barChart from "../../app/components/BarChart";

const CURRENT_POSITION_COLOR = "#1E88E5"; // Blue
const COMPARING_COLOR = "#FFC107"; // Yellow
const SORTED_COLOR = "#9C27B0"; // Purple

// Takes first element as the pivot, places it at its correct position and
// places smaller elements to left and greater to right
async function partition(chart, low, high, options) {
  const data = chart.getData();
  const pivot = data[low]; // Use FIRST element as pivot

  if (!options.skipHighlights) {
    chart.highlightValue(pivot, CURRENT_POSITION_COLOR);
  }

  let i = low;

  for (let j = low + 1; j <= high; j++) {
    chart.incrementComparisonCount();

    if (!options.skipHighlights) {
      chart.highlightValue(chart.getData()[j], COMPARING_COLOR);
    }

    if (chart.getData()[j] < pivot) {
      i++;
      await chart.swap(i, j);
    }

    if (!options.skipHighlights) {
      chart.unhighlightValue(chart.getData()[j]);
    }

    await new Promise((resolve) => setTimeout(resolve, options.delay || 10));
  }

  await chart.swap(low, i);

  return i;
}

async function quickSortHelper(chart, low, high, options) {
  if (low < high) {
    const pivotIndex = await partition(chart, low, high, options);

    // Optional, lets see how it looks
    if (!options.skipHighlights) {
      chart.highlightValue(chart.getData()[pivotIndex], SORTED_COLOR);

      await new Promise((resolve) => setTimeout(resolve, 20));
      chart.unhighlightValue(chart.getData()[pivotIndex]);
    }

    await quickSortHelper(chart, low, pivotIndex - 1, options);
    await quickSortHelper(chart, pivotIndex + 1, high, options);
  }
}

export async function quickSort(
  chart: ReturnType<typeof barChart>,
  options: {
    skipAnimation?: boolean;
    delay?: number;
  } = {}
) {
  const skipHighlights = options.skipAnimation || chart.getData().length > 500;
  const skipSounds = chart.getData().length > 500; // Skip sounds for very large arrays

  chart.resetComparisonCount();

  const data = chart.getData();
  const minValue = Math.min(...data);
  const maxValue = Math.max(...data);

  await quickSortHelper(chart, 0, data.length - 1, {
    skipHighlights,
    skipSounds,
    minValue,
    maxValue,
    ...options,
  });

  await chart.verifySorted();

  return;
}
