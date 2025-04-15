"use client";

import { useEffect, useRef, useState } from "react";
import { BarChart } from "../../utils/BarChart";
import { selectionSort } from "../../utils/sort/SelectionSort";

type SortAlgorithm = {
  name: string;
  execute: (chart: BarChart, options?: any) => Promise<void>;
};

export default function Page() {
  const chartRef = useRef<BarChart | null>(null);

  // Available sorting algorithms - easy to add more in the future
  const sortAlgorithms: SortAlgorithm[] = [
    {
      name: "Selection Sort",
      execute: selectionSort,
    },
    // Future algorithms will be added here
    // { name: "Bubble Sort", execute: bubbleSort },
    // { name: "Quick Sort", execute: quickSort },
  ];

  // Track the selected algorithm (default to the first one)
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<SortAlgorithm>(
    sortAlgorithms[0]
  );

  useEffect(() => {
    const chart = new BarChart("#bar-chart", true);
    chart.render(50);
    chartRef.current = chart;

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);

  const handleShuffle = () => {
    if (chartRef.current) {
      chartRef.current.shuffle();
    }
  };

  const handleSort = () => {
    if (chartRef.current) {
      // Execute the currently selected algorithm
      selectedAlgorithm.execute(chartRef.current);
    }
  };

  // Handler for algorithm selection change
  const handleAlgorithmChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const algorithmName = e.target.value;
    const algorithm = sortAlgorithms.find(
      (algo) => algo.name === algorithmName
    );
    if (algorithm) {
      setSelectedAlgorithm(algorithm);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col justify-center items-center p-4">
      <div className="chart-wrap w-[80%] h-[60%] flex flex-col rounded-lg shadow-lg bg-blue-950">
        <div className="bar-menu p-2 flex justify-between items-center">
          {/* Algorithm selector (will be useful when we add more algorithms) */}
          <div className="algorithm-selector">
            <select
              className="bg-blue-950 text-white border border-blue-900 rounded px-2 py-1"
              value={selectedAlgorithm.name}
              onChange={handleAlgorithmChange}
            >
              {sortAlgorithms.map((algo) => (
                <option key={algo.name} value={algo.name}>
                  {algo.name}
                </option>
              ))}
            </select>
          </div>

          {/* Action buttons */}
          <div className="buttons flex">
            <button
              onClick={handleShuffle}
              className="px-4 py-2 bg-blue-950 text-white rounded-lg hover:bg-blue-900 border-blue-900 border-2 transition-all mr-1"
            >
              Shuffle
            </button>
            <button
              onClick={handleSort}
              className="px-4 py-2 bg-blue-950 text-white rounded-lg hover:bg-blue-900 border-blue-900 border-2 transition-all"
            >
              Sort
            </button>
          </div>
        </div>
        <div id="bar-chart" className="flex-1 rounded-lg shadow-lg p-2"></div>
      </div>
    </div>
  );
}
