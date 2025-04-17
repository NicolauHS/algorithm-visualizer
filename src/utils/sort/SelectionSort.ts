import barChart from "../../app/components/BarChart";

const CURRENT_POSITION_COLOR = "#1E88E5"; // Blue
const COMPARING_COLOR = "#FFC107"; // Yellow
const SORTED_COLOR = "#9C27B0"; // Purple

export async function selectionSort(
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

  for (let i = 0; i < chart.getData().length - 1; i++) {
    const currentData = chart.getData();

    const currentPosition = currentData.length - 1 - i;

    if (!skipHighlights) {
      chart.highlightValue(
        currentData[currentPosition],
        CURRENT_POSITION_COLOR
      );

      // Play sound for current position
      if (!skipSounds) {
        const frequency = chart.playSound(
          currentData[currentPosition],
          minValue,
          maxValue
        );
      }

      await new Promise((resolve) => setTimeout(resolve, 20));
    }

    // Find maximum element in the unsorted part
    let maxIndex = currentPosition;

    // Loop from beginning up to currentPosition (inclusive)
    for (let j = 0; j <= currentPosition; j++) {
      // Always get fresh data
      const comparisonData = chart.getData();

      chart.incrementComparisonCount();

      if (!skipHighlights) {
        chart.highlightValue(comparisonData[j], COMPARING_COLOR);

        // Play sound for comparison element
        if (!skipSounds) {
          const frequency = chart.playSound(
            comparisonData[j],
            minValue,
            maxValue
          );
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 10));

      if (comparisonData[j] > comparisonData[maxIndex]) {
        if (!skipHighlights && maxIndex !== currentPosition) {
          chart.unhighlightValue(comparisonData[maxIndex]);
        }

        maxIndex = j;

        if (!skipSounds) {
          const frequency = chart.playSound(
            comparisonData[maxIndex],
            minValue,
            maxValue
          );
        }
      } else if (!skipHighlights) {
        chart.unhighlightValue(comparisonData[j]);
      }

      // Small delay after comparison
      const comparisonDelay =
        comparisonData.length > 500 ? 0 : comparisonData.length > 200 ? 1 : 5;
      if (comparisonDelay > 0) {
        await new Promise((resolve) => setTimeout(resolve, comparisonDelay));
      }
    }

    const swapData = chart.getData();

    if (maxIndex !== currentPosition) {
      if (!skipHighlights) {
        chart.unhighlightValue(swapData[currentPosition]);
        chart.unhighlightValue(swapData[maxIndex]);
      }

      if (!skipSounds) {
        const frequency = chart.playSound(
          swapData[maxIndex],
          minValue,
          maxValue
        );
      }

      // Swap elements
      await chart.swap(maxIndex, currentPosition);
    }

    // Get updated data after the swap
    const updatedData = chart.getData();

    if (!skipHighlights) {
      chart.highlightValue(updatedData[currentPosition], SORTED_COLOR);
      await new Promise((resolve) => setTimeout(resolve, 20));
      chart.unhighlightValue(updatedData[currentPosition]);
    }

    // Delay between iterations
    const delay =
      options.delay ||
      (updatedData.length > 500 ? 0 : updatedData.length > 200 ? 1 : 25);
    if (delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    } else {
      await new Promise((resolve) => requestAnimationFrame(resolve));
    }
  }

  const finalData = chart.getData();
  if (!skipHighlights && finalData.length > 0) {
    chart.highlightValue(finalData[0], SORTED_COLOR);

    if (!skipSounds) {
      const frequency = chart.playSound(finalData[0], minValue, maxValue);
    }

    await new Promise((resolve) => setTimeout(resolve, 40));
    chart.unhighlightValue(finalData[0]);
  }

  await chart.verifySorted();

  // return { comparisons };
  return;
}
