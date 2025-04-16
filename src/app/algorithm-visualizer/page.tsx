"use client";

import { useEffect, useRef, useState } from "react";
import barChart from "../../utils/BarChart";
import { selectionSort } from "../../utils/sort/SelectionSort";

type SortAlgorithm = {
  name: string;
  execute: (chart: ReturnType<typeof barChart>, options?: any) => Promise<void>;
};

export default function Page() {
  const chartRef = useRef<ReturnType<typeof barChart> | null>(null);
  const soundPlayerRef = useRef<any>(null); // Added soundPlayerRef
  const [isSorting, setIsSorting] = useState(false);
  const [arraySize, setArraySize] = useState(50);
  const [comparisons, setComparisons] = useState<number>(0);

  const sortAlgorithms: SortAlgorithm[] = [
    {
      name: "Selection Sort",
      execute: selectionSort,
    },
  ];

  const [selectedAlgorithm, setSelectedAlgorithm] = useState<SortAlgorithm>(
    sortAlgorithms[0]
  );

  useEffect(() => {
    const chart = barChart("#bar-chart");
    chart.render(arraySize);
    chartRef.current = chart;

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [arraySize]);

  const handleShuffle = () => {
    if (chartRef.current) {
      chartRef.current.shuffle();
    }
  };

  const handleSort = async () => {
    if (chartRef.current && !isSorting) {
      setIsSorting(true);
      setComparisons(0);

      try {
        await selectedAlgorithm.execute(chartRef.current, {
          soundPlayer: soundPlayerRef.current,
        });
      } finally {
        setIsSorting(false);
      }
    }
  };

  const handleAlgorithmChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const algorithmName = e.target.value;
    const algorithm = sortAlgorithms.find(
      (algo) => algo.name === algorithmName
    );
    if (algorithm) {
      setSelectedAlgorithm(algorithm);
    }
  };

  const handleArraySizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setArraySize(Number(e.target.value));
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col justify-center items-center p-6 text-gray-100 font-sans">
      <div className="w-full max-w-5xl flex flex-col space-y-4">
        {/* Main visualization card */}
        <div className="flex-1 bg-gray-800 rounded-xl overflow-hidden shadow-2xl border border-gray-700">
          {/* Controls bar */}
          <div className="bg-gray-800 border-b border-gray-700 p-4 flex flex-wrap justify-between items-center gap-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* Algorithm selector */}
              <div className="relative">
                <label
                  htmlFor="algorithm"
                  className="block text-sm font-medium text-gray-400 mb-1"
                >
                  Algorithm
                </label>
                <select
                  id="algorithm"
                  className="bg-gray-900 text-white border border-gray-700 rounded-lg p-2 pl-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                  value={selectedAlgorithm.name}
                  onChange={handleAlgorithmChange}
                  disabled={isSorting}
                >
                  {sortAlgorithms.map((algo) => (
                    <option key={algo.name} value={algo.name}>
                      {algo.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400 mt-6">
                  <svg
                    className="fill-current h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>

              {/* Array size slider */}
              {/* <div className="min-w-[150px]">Operations: <span></span></div> */}
            </div>

            <div className="flex items-center gap-2">
              {/* Shuffle button */}
              <button
                onClick={handleShuffle}
                className="group p-3 bg-gray-900 text-white rounded-lg hover:bg-gray-700 border border-gray-700 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-md"
                title="Shuffle"
                disabled={isSorting}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="group-hover:text-blue-400 transition-colors"
                >
                  <polyline points="16 3 21 3 21 8"></polyline>
                  <line x1="4" y1="20" x2="21" y2="3"></line>
                  <polyline points="21 16 21 21 16 21"></polyline>
                  <line x1="15" y1="15" x2="21" y2="21"></line>
                  <line x1="4" y1="4" x2="9" y2="9"></line>
                </svg>
              </button>

              {/* Sort button */}
              <button
                onClick={handleSort}
                className="group p-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-md"
                title={isSorting ? "Sorting..." : "Sort"}
                disabled={isSorting}
              >
                {isSorting ? (
                  <svg
                    className="animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="group-hover:text-white transition-colors"
                  >
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Visualization area */}
          <div id="bar-chart" className="h-[400px] p-6"></div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm"></div>
      </div>
    </div>
  );
}
