"use client";

import { useEffect, useRef } from "react";
import { BarChart } from "../../utils/BarChart";

export default function Page() {
  const chartRef = useRef<BarChart | null>(null);

  useEffect(() => {
    // Create chart instance (we no longer pass fixed dimensions)
    const chart = new BarChart("#bar-chart", true);
    chart.render(50); // Start with fewer bars for better performance
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

  return (
    <div className="h-screen w-screen flex flex-col justify-center items-center p-4">
      <div
        id="bar-chart"
        className="w-[80%] h-[60%] bg-gray-200 rounded-lg shadow-lg"
      ></div>
      <button
        onClick={handleShuffle}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600"
      >
        Shuffle
      </button>
    </div>
  );
}
