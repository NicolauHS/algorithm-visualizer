import * as d3 from "d3";
import soundPlayer from "../../utils/SoundPlayer";

export default function barChart(selector: string) {
  let svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
  let container: d3.Selection<HTMLElement, unknown, HTMLElement, any>;
  let width: number;
  let height: number;
  let xScale: d3.ScaleBand<number>;
  let yScale: d3.ScaleLinear<number, number>;
  let bars: d3.Selection<SVGRectElement, number, SVGElement, unknown>;
  let data: number[] = [];
  let resizeObserver: ResizeObserver;
  let highlightedBars: Set<number> = new Set();
  let comparisonCount = 0;
  let onComparisonUpdate: ((count: number) => void) | null = null;

  const setComparisonUpdateCallback = (callback: (count: number) => void) => {
    onComparisonUpdate = callback;
  };

  const sound = soundPlayer();

  function playSound(value: number, minValue: number, maxValue: number) {
    const frequency = sound.valueToFrequency(value, minValue, maxValue);
    sound.play(frequency);
  }

  const DEFAULT_COLOR = "#4A90E2"; // Original bar color
  const HIGHLIGHT_COLOR = "#FF5733"; // Highlighted bar color (orange-red)

  const margin = { top: 10, right: 20, bottom: 10, left: 20 };

  function initialize() {
    const containerSelection = d3.select(selector);
    containerSelection.selectAll("svg").remove();

    container = containerSelection as unknown as d3.Selection<
      HTMLElement,
      unknown,
      HTMLElement,
      any
    >;

    if (!container.node()) {
      console.error(`Container not found: ${selector}`);
      return;
    }

    const containerNode = container.node() as HTMLElement;

    width = containerNode.clientWidth - margin.left - margin.right;
    height = containerNode.clientHeight - margin.top - margin.bottom;

    svg = container
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr(
        "viewBox",
        `0 0 ${containerNode.clientWidth} ${containerNode.clientHeight}`
      )
      .attr("preserveAspectRatio", "xMidYMid meet")
      .attr("class", "bg-blue-950")
      .append("g") // Add a group element for proper transformation
      .attr("transform", `translate(${margin.left},${margin.top})`);

    xScale = d3.scaleBand<number>().domain([]).range([0, width]).padding(0.1);

    yScale = d3.scaleLinear<number, number>().range([height, 0]);

    bars = svg.selectAll("rect");

    resizeObserver = new ResizeObserver(() => {
      resize();
    });

    resizeObserver.observe(containerNode);
  }

  function resize() {
    const containerNode = container.node() as HTMLElement;

    const newWidth = containerNode.clientWidth - margin.left - margin.right;
    const newHeight = containerNode.clientHeight - margin.top - margin.bottom;

    width = newWidth;
    height = newHeight;

    container
      .select("svg")
      .attr(
        "viewBox",
        `0 0 ${containerNode.clientWidth} ${containerNode.clientHeight}`
      );

    xScale.range([0, width]);
    yScale.range([height, 0]);

    if (data && data.length > 0) {
      updateChart();
    }
  }

  function updateChart() {
    bars = svg
      .selectAll<SVGRectElement, number>("rect")
      .data(data, (d) => d.toString());

    bars
      .enter()
      .append("rect")
      .attr("data-value", (d) => d)
      .merge(bars)
      .attr("x", (d) => xScale(d)!)
      .attr("y", (d) => yScale(d))
      .attr("width", xScale.bandwidth())
      .attr("height", (d) => height - yScale(d))
      .attr("fill", DEFAULT_COLOR);

    bars.exit().remove();
  }

  // Public API methods
  const render = (n: number) => {
    if (!Number.isInteger(n) || n <= 0) {
      throw new Error("The input must be a positive integer.");
    }

    data = d3.range(1, n + 1);

    xScale.domain(data);
    yScale.domain([0, n]);

    updateChart();
  };

  const shuffle = async () => {
    const minValue = Math.min(...data);
    const maxValue = Math.max(...data);

    const barsSelection = svg.selectAll<SVGRectElement, number>("rect");

    const skipHighlights = data.length > 500;

    // Fisher-Yates Shuffle Algorithm
    for (let i = data.length - 1; i >= 0; i--) {
      const currentValue = data[i];

      if (!skipHighlights) {
        highlightValue(currentValue);
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      // Generate random index and swap
      const j = Math.floor(Math.random() * (i + 1));
      [data[i], data[j]] = [data[j], data[i]];

      xScale.domain(data);

      barsSelection
        .data(data, (d) => d.toString())
        .attr("data-value", (d) => d)
        .attr("x", (d) => xScale(d)!)
        .attr("y", (d) => yScale(d))
        .attr("height", (d) => height - yScale(d));

      if (data.length <= 200) {
        try {
          playSound(currentValue, minValue, maxValue);
        } catch {
          console.log("Tried to play audio but failed");
        }
      }

      if (!skipHighlights) {
        unhighlightValue(currentValue);
      }

      const delay = data.length > 500 ? 0 : data.length > 200 ? 1 : 25;

      if (delay > 0) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        await new Promise((resolve) => requestAnimationFrame(resolve));
      }
    }
  };

  const destroy = () => {
    if (resizeObserver) {
      resizeObserver.disconnect();
    }

    if (container) {
      container.selectAll("svg").remove();
    }
  };

  const getData = (): number[] => {
    return [...data];
  };

  const swap = async (i: number, j: number) => {
    if (i < 0 || i >= data.length || j < 0 || j >= data.length) {
      return;
    }

    const minValue = Math.min(...data);
    const maxValue = Math.max(...data);
    const valueBeingMoved = data[j];

    [data[i], data[j]] = [data[j], data[i]];

    xScale.domain(data);

    const barsSelection = svg.selectAll<SVGRectElement, number>("rect");

    barsSelection
      .data(data, (d) => d.toString())
      .attr("data-value", (d) => d)
      .attr("x", (d) => xScale(d)!)
      .attr("y", (d) => yScale(d))
      .attr("height", (d) => height - yScale(d));

    if (sound && data.length <= 200) {
      const frequency = sound.valueToFrequency(
        valueBeingMoved,
        minValue,
        maxValue
      );
      sound.play(frequency);
    }
  };

  const highlightValue = (value: number, color: string = HIGHLIGHT_COLOR) => {
    highlightedBars.add(value);

    const bar = svg.select(`rect[data-value="${value}"]`);
    if (!bar.empty()) {
      bar.attr("fill", color);
    }
  };

  const unhighlightValue = (value: number) => {
    highlightedBars.delete(value);

    const bar = svg.select(`rect[data-value="${value}"]`);
    if (!bar.empty()) {
      bar.attr("fill", DEFAULT_COLOR);
    }
  };

  const resetComparisonCount = () => {
    comparisonCount = 0;
    return comparisonCount;
  };

  const incrementComparisonCount = (amount = 1) => {
    comparisonCount += amount;
    if (onComparisonUpdate) {
      onComparisonUpdate(comparisonCount);
    }

    return comparisonCount;
  };

  const getComparisonCount = () => {
    return comparisonCount;
  };

  const verifySorted = async () => {
    const isSorted = data.every((val, i, arr) => !i || arr[i - 1] <= val);

    const SUCCESS_COLOR = "#00FF00";

    for (let i = 0; i < data.length; i++) {
      highlightValue(data[i], SUCCESS_COLOR);

      if (sound) {
        try {
          const minValue = Math.min(...data);
          const maxValue = Math.max(...data);
          playSound(data[i], minValue, maxValue);
        } catch {
          console.log("Tried to play audio but failed");
        }
      }

      const delay = data.length > 500 ? 2 : data.length > 200 ? 10 : 20;
      await new Promise((resolve) => setTimeout(resolve, delay));

      unhighlightValue(data[i]);
    }

    return isSorted;
  };

  // Initialize the chart
  initialize();

  // Return public API
  return {
    render,
    shuffle,
    destroy,
    getData,
    swap,
    highlightValue,
    unhighlightValue,
    verifySorted,
    playSound,
    resetComparisonCount,
    incrementComparisonCount,
    getComparisonCount,
    setComparisonUpdateCallback,
  };
}
