import * as d3 from "d3";
import { SoundPlayer } from "./SoundPlayer";

export class BarChart {
  private svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
  private container: d3.Selection<HTMLElement, unknown, HTMLElement, any>;
  private width: number;
  private height: number;
  private xScale: d3.ScaleBand<number>;
  private yScale: d3.ScaleLinear<number, number>;
  private bars: d3.Selection<SVGRectElement, number, SVGElement, unknown>;
  private data: number[] = [];
  private soundPlayer: SoundPlayer = new SoundPlayer();
  private resizeObserver: ResizeObserver;
  private highlightedBars: Set<number> = new Set();

  // Color constants
  private readonly DEFAULT_COLOR = "#4A90E2"; // Original bar color
  private readonly HIGHLIGHT_COLOR = "#FF5733"; // Highlighted bar color (orange-red)

  // Add margin property
  private margin = { top: 20, right: 20, bottom: 20, left: 20 };

  constructor(selector: string, enableSound: boolean = false) {
    // Select the container element
    this.container = d3.select<HTMLElement, unknown>(selector);

    // Get initial dimensions from the container
    const containerNode = this.container.node() as HTMLElement;
    this.width =
      containerNode.clientWidth - this.margin.left - this.margin.right;
    this.height =
      containerNode.clientHeight - this.margin.top - this.margin.bottom;

    // Initialize sound player if enabled
    if (enableSound) {
      this.soundPlayer = new SoundPlayer();
    }

    // SVG container with proper dimensions
    this.svg = this.container
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("class", "bg-blue-950")
      .append("g") // Add a group element for proper transformation
      .attr("transform", `translate(${this.margin.left},${this.margin.top})`);

    // Scales - adjusted to account for margins
    this.xScale = d3
      .scaleBand<number>()
      .domain([])
      .range([0, this.width])
      .padding(0.1);
    this.yScale = d3.scaleLinear<number, number>().range([this.height, 0]);

    // Empty bars
    this.bars = this.svg.selectAll("rect");

    // Create resize observer
    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === containerNode) {
          this.resize();
        }
      }
    });

    // Start observing the container for size changes
    this.resizeObserver.observe(containerNode);
  }

  resize() {
    const containerNode = this.container.node() as HTMLElement;
    const newWidth =
      containerNode.clientWidth - this.margin.left - this.margin.right;
    const newHeight =
      containerNode.clientHeight - this.margin.top - this.margin.bottom;

    // Update dimensions
    this.width = newWidth;
    this.height = newHeight;

    // Update scales
    this.xScale.range([0, this.width]);
    this.yScale.range([this.height, 0]);

    // Re-render with current data
    if (this.data.length > 0) {
      this.updateChart();
    }
  }

  private updateChart() {
    this.bars = this.svg
      .selectAll<SVGRectElement, number>("rect")
      .data(this.data, (d) => d.toString());

    this.bars
      .enter()
      .append("rect")
      .attr("data-value", (d) => d)
      .merge(this.bars)
      .attr("x", (d) => this.xScale(d)!)
      .attr("y", (d) => this.yScale(d))
      .attr("width", this.xScale.bandwidth())
      .attr("height", (d) => this.height - this.yScale(d))
      .attr("fill", this.DEFAULT_COLOR);

    this.bars.exit().remove();
  }

  // Method that renders the chart.
  render(n: number) {
    if (!Number.isInteger(n) || n <= 0) {
      throw new Error("The input must be a positive integer.");
    }

    this.data = d3.range(1, n + 1);

    this.xScale.domain(this.data);
    this.yScale.domain([0, n]);

    this.updateChart();
  }

  async shuffle() {
    const minValue = Math.min(...this.data);
    const maxValue = Math.max(...this.data);

    const barsSelection = this.svg.selectAll<SVGRectElement, number>("rect");

    const skipHighlights = this.data.length > 500;

    // Fisher-Yates Shuffle Algorithm
    for (let i = this.data.length - 1; i >= 0; i--) {
      const currentValue = this.data[i];

      if (!skipHighlights) {
        this.highlightValue(currentValue);
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      // Generate random index and swap
      const j = Math.floor(Math.random() * (i + 1));
      [this.data[i], this.data[j]] = [this.data[j], this.data[i]];

      this.xScale.domain(this.data);

      barsSelection
        .data(this.data, (d) => d.toString())
        .attr("data-value", (d) => d)
        .attr("x", (d) => this.xScale(d)!)
        .attr("y", (d) => this.yScale(d))
        .attr("height", (d) => this.height - this.yScale(d));

      if (this.soundPlayer && this.data.length <= 200) {
        const frequency = this.soundPlayer.valueToFrequency(
          currentValue,
          minValue,
          maxValue
        );
        this.soundPlayer.play(frequency);
      }

      if (!skipHighlights) {
        this.unhighlightValue(currentValue);
      }

      const delay =
        this.data.length > 500 ? 0 : this.data.length > 200 ? 1 : 25;

      if (delay > 0) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        // For very large datasets, use requestAnimationFrame to yield to browser
        await new Promise((resolve) => requestAnimationFrame(resolve));
      }
    }
  }

  destroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  getData(): number[] {
    return [...this.data];
  }

  async swap(i: number, j: number) {
    if (i < 0 || i >= this.data.length || j < 0 || j >= this.data.length) {
      return;
    }

    const minValue = Math.min(...this.data);
    const maxValue = Math.max(...this.data);
    const valueBeingMoved = this.data[j];

    [this.data[i], this.data[j]] = [this.data[j], this.data[i]];

    this.xScale.domain(this.data);

    const barsSelection = this.svg.selectAll<SVGRectElement, number>("rect");

    barsSelection
      .data(this.data, (d) => d.toString())
      .attr("data-value", (d) => d)
      .attr("x", (d) => this.xScale(d)!)
      .attr("y", (d) => this.yScale(d))
      .attr("height", (d) => this.height - this.yScale(d));

    if (this.soundPlayer && this.data.length <= 200) {
      const frequency = this.soundPlayer.valueToFrequency(
        valueBeingMoved,
        minValue,
        maxValue
      );
      this.soundPlayer.play(frequency);
    }
  }

  highlightValue(value: number, color: string = this.HIGHLIGHT_COLOR) {
    this.highlightedBars.add(value);

    const bar = this.svg.select(`rect[data-value="${value}"]`);
    if (!bar.empty()) {
      bar.attr("fill", this.HIGHLIGHT_COLOR);
    }
  }

  unhighlightValue(value: number) {
    this.highlightedBars.delete(value);

    const bar = this.svg.select(`rect[data-value="${value}"]`);
    if (!bar.empty()) {
      bar.attr("fill", this.DEFAULT_COLOR);
    }
  }

  async verifySorted() {
    const isSorted = this.data.every((val, i, arr) => !i || arr[i - 1] <= val);

    const SUCCESS_COLOR = "#00FF00";

    for (let i = 0; i < this.data.length; i++) {
      this.highlightValue(this.data[i], SUCCESS_COLOR);

      if (this.soundPlayer) {
        const minValue = Math.min(...this.data);
        const maxValue = Math.max(...this.data);
        const frequency = this.soundPlayer.valueToFrequency(
          this.data[i],
          minValue,
          maxValue
        );
        this.soundPlayer.play(frequency);
      }

      const delay =
        this.data.length > 500 ? 2 : this.data.length > 200 ? 10 : 20;
      await new Promise((resolve) => setTimeout(resolve, delay));

      this.unhighlightValue(this.data[i]);
    }

    return isSorted;
  }
}
