"use client";

import { useState, useRef, useEffect } from "react";
import ChartCard from "./components/ChartCard";
import { selectionSort, quickSort, bubbleSort } from "../utils/sort";

export default function Page() {
  const sortAlgorithms = [
    {
      name: "Selection Sort",
      execute: selectionSort,
    },
    {
      name: "Quicksort",
      execute: quickSort,
    },
    {
      name: "Bubble Sort",
      execute: bubbleSort,
    },
  ];

  const [selectedAlgorithms, setSelectedAlgorithms] = useState<
    Array<(typeof sortAlgorithms)[0]>
  >(Array(4).fill(sortAlgorithms[0]));

  const [isSorting, setIsSorting] = useState(false);

  const [chartCount, setChartCount] = useState(1);

  const chartRefs = useRef<Array<any>>([]);

  useEffect(() => {
    chartRefs.current = chartRefs.current.slice(0, chartCount);

    while (chartRefs.current.length < chartCount) {
      chartRefs.current.push(null);
    }
  }, [chartCount]);

  const handleAlgorithmChange = (algorithmName: string, chartIndex: number) => {
    const algorithm = sortAlgorithms.find(
      (algo) => algo.name === algorithmName
    );
    if (algorithm) {
      setSelectedAlgorithms((prev) => {
        const updated = [...prev];
        updated[chartIndex] = algorithm;
        return updated;
      });
    }
  };

  const addChart = () => {
    if (chartCount < 4) {
      setChartCount(chartCount + 1);
    }
  };

  const removeChart = () => {
    if (chartCount > 1) {
      setChartCount(chartCount - 1);
    }
  };

  const handleGlobalShuffle = () => {
    chartRefs.current.forEach((ref) => {
      if (ref) {
        ref.shuffle();
      }
    });
  };

  const handleGlobalSort = async () => {
    if (isSorting) return;

    setIsSorting(true);

    try {
      await Promise.all(
        chartRefs.current.map((ref, index) => {
          if (ref) {
            ref.resetComparisonCount();
            return selectedAlgorithms[index].execute(ref.getChart());
          }
          return Promise.resolve();
        })
      );
    } finally {
      setIsSorting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col justify-center items-center p-6 text-gray-100 font-sans">
      <div className="w-full max-w-7xl">
        <div className="bg-gray-800 rounded-xl mb-6 p-4 border border-gray-700 shadow-lg flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="flex items-center gap-2">
                <button
                  onClick={removeChart}
                  disabled={chartCount <= 1 || isSorting}
                  className="p-2 text-2xl w-[45px] font-bold bg-gray-700 rounded  hover:bg-gray-600 disabled:opacity-50"
                  title="Remove chart"
                >
                  -
                </button>
                <span className="mx-2 text-lg font-semibold text-gray-300">
                  {chartCount} charts
                </span>
                <button
                  onClick={addChart}
                  disabled={chartCount >= 4 || isSorting}
                  className="p-2 text-2xl w-[45px] font-bold bg-gray-700 rounded  hover:bg-gray-600 disabled:opacity-50"
                  title="Add chart"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleGlobalShuffle}
                disabled={isSorting}
                className="p-3 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50"
              >
                Shuffle All
              </button>
              <button
                onClick={handleGlobalSort}
                disabled={isSorting}
                className="p-3 bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {isSorting ? "Sorting..." : "Sort All"}
              </button>
            </div>
          </div>
        </div>
        <div
          className={`grid grid-cols-1 ${
            chartCount > 1 ? "md:grid-cols-2" : ""
          } gap-6`}
        >
          {Array.from({ length: chartCount }).map((_, index) => (
            <ChartCard
              key={index}
              algorithm={selectedAlgorithms[index]}
              algorithms={sortAlgorithms}
              onAlgorithmChange={(algorithmName) =>
                handleAlgorithmChange(algorithmName, index)
              }
              initialSize={50}
              ref={(el) => (chartRefs.current[index] = el)}
              hideControls={true}
            />
          ))}
        </div>

        <div className="text-center text-gray-500 text-sm"></div>
      </div>
    </div>
  );
}
