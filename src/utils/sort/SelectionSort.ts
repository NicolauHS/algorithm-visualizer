import { BarChart } from "../BarChart";

const CURRENT_POSITION_COLOR = "#1E88E5"; // Blue
const COMPARING_COLOR = "#FFC107"; // Yellow
const MIN_ELEMENT_COLOR = "#4CAF50"; // Green
const SORTED_COLOR = "#9C27B0"; // Purple

export async function selectionSort(
  chart: BarChart,
  options: {
    skipAnimation?: boolean;
    delay?: number;
  } = {}
) {
  // Don't create a local copy - we'll always get fresh data
  const skipHighlights = options.skipAnimation || chart.getData().length > 500;

  // Selection Sort Algorithm
  for (let i = 0; i < chart.getData().length - 1; i++) {
    // Always get fresh data from the chart
    const currentData = chart.getData();

    if (!skipHighlights) {
      chart.highlightValue(currentData[i], CURRENT_POSITION_COLOR);
      await new Promise((resolve) => setTimeout(resolve, 20));
    }

    // Find minimum element in the unsorted part
    let minIndex = i;

    for (let j = i + 1; j < currentData.length; j++) {
      // Always get fresh data
      const comparisonData = chart.getData();

      // Highlight element being compared
      if (!skipHighlights) {
        chart.highlightValue(comparisonData[j], COMPARING_COLOR);
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      if (comparisonData[j] < comparisonData[minIndex]) {
        // Unhighlight previous minimum if there was one
        if (!skipHighlights && minIndex !== i) {
          chart.unhighlightValue(comparisonData[minIndex]);
        }

        minIndex = j;

        // Highlight new minimum
        if (!skipHighlights) {
          chart.highlightValue(comparisonData[minIndex], MIN_ELEMENT_COLOR);
        }
      } else if (!skipHighlights) {
        // Unhighlight compared element if it's not the minimum
        chart.unhighlightValue(comparisonData[j]);
      }

      // Small delay after comparison
      const comparisonDelay =
        comparisonData.length > 500 ? 0 : comparisonData.length > 200 ? 1 : 5;
      if (comparisonDelay > 0) {
        await new Promise((resolve) => setTimeout(resolve, comparisonDelay));
      }
    }

    // Get final data for this iteration before swapping
    const swapData = chart.getData();

    // Swap elements if needed
    if (minIndex !== i) {
      // Unhighlight before swapping to avoid issues with data-value attributes
      if (!skipHighlights) {
        chart.unhighlightValue(swapData[i]);
        chart.unhighlightValue(swapData[minIndex]);
      }

      // Swap and update the chart
      await chart.swap(i, minIndex);
    }

    // Get updated data after the swap
    const updatedData = chart.getData();

    // Highlight the element that's now in its final sorted position
    if (!skipHighlights) {
      chart.highlightValue(updatedData[i], SORTED_COLOR);
      await new Promise((resolve) => setTimeout(resolve, 20));
      chart.unhighlightValue(updatedData[i]);
    }

    // Delay between iterations
    const delay =
      options.delay ||
      (updatedData.length > 500 ? 0 : updatedData.length > 200 ? 1 : 20);
    if (delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    } else {
      await new Promise((resolve) => requestAnimationFrame(resolve));
    }
  }

  // Final element is automatically sorted
  const finalData = chart.getData();
  if (!skipHighlights && finalData.length > 0) {
    chart.highlightValue(finalData[finalData.length - 1], SORTED_COLOR);
    await new Promise((resolve) => setTimeout(resolve, 40));
    chart.unhighlightValue(finalData[finalData.length - 1]);
  }

  await chart.verifySorted();
}
