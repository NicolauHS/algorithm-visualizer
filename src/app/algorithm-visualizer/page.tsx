"use client";

import { useEffect, useRef } from "react";
import { BarChart } from "../../utils/BarChart";

export default function Page() {
  const chartRef = useRef<BarChart | null>(null);

  useEffect(() => {
    const chart = new BarChart("#bar-chart", true);
    chart.render(100);
    chartRef.current = chart;

    // Cleanup on unmount
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

  // const handleSort = () => {
  //   if (chartRef.current) {
  //     chartRef.current.sort();
  //   }
  // }

  return (
    <div className="h-screen w-screen flex flex-col justify-center items-center p-4">
      <div className="chart-wrap w-[80%] h-[60%]  flex flex-col border-red-500 border-2 rounded-lg shadow-lg bg-blue-950">
        <div className="bar-menu p-2 flex justify-end">
          <button
            onClick={handleShuffle}
            className="mt-4 px-4 py-2 bg-blue-950 text-white rounded-lg hover:bg-blue-900 border-blue-900 border-2 transition-all mr-1"
          >
            Shuffle
          </button>
          <button
            // onClick={handleShuffle}
            className="mt-4 px-4 py-2 bg-blue-950 text-white rounded-lg hover:bg-blue-900 border-blue-900 border-2 transition-all"
          >
            Sort
          </button>
        </div>
        <div id="bar-chart" className="flex-1 rounded-lg shadow-lg p-2"></div>
      </div>

      {/* <button
        onClick={handleSort}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600"
      >
        Shuffle
      </button> */}
    </div>
  );
}
