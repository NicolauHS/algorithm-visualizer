import React, {
  useEffect,
  useRef,
  useState,
  useId,
  forwardRef,
  useImperativeHandle,
} from "react";
import barChart from "./BarChart";

interface ChartCardProps {
  algorithm: {
    name: string;
    execute: (
      chart: ReturnType<typeof barChart>,
      options?: any
    ) => Promise<void>;
  };
  algorithms: Array<{
    name: string;
    execute: (
      chart: ReturnType<typeof barChart>,
      options?: any
    ) => Promise<void>;
  }>;
  onAlgorithmChange?: (algorithmName: string) => void;
  initialSize?: number;
  hideControls?: boolean;
}
const ChartCard = forwardRef<any, ChartCardProps>(
  (
    {
      algorithm,
      algorithms,
      onAlgorithmChange,
      initialSize = 50,
      hideControls = false,
    },
    ref
  ) => {
    const uniqueId = useId();
    const chartId = `chart-${uniqueId.replace(/:/g, "")}`;

    const chartRef = useRef<ReturnType<typeof barChart> | null>(null);
    const [isSorting, setIsSorting] = useState(false);
    const [arraySize, setArraySize] = useState(initialSize);
    const [comparisons, setComparisons] = useState<number>(0);

    useEffect(() => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }

      const chart = barChart(`#${chartId}`);
      chart.render(arraySize);

      chart.setComparisonUpdateCallback((count) => {
        setComparisons(count);
      });

      chartRef.current = chart;

      return () => {
        if (chartRef.current) {
          chartRef.current.setComparisonUpdateCallback(() => {});
          chartRef.current.destroy();
          chartRef.current = null;
        }
      };
    }, [arraySize, chartId]);

    useImperativeHandle(ref, () => ({
      shuffle: () => {
        if (chartRef.current) {
          chartRef.current.shuffle();
        }
      },
      resetComparisonCount: () => {
        if (chartRef.current) {
          chartRef.current.resetComparisonCount();
        }
      },
      getChart: () => chartRef.current,
    }));

    const handleShuffle = () => {
      if (chartRef.current) {
        chartRef.current.shuffle();
      }
    };

    const handleSort = async () => {
      if (chartRef.current && !isSorting) {
        setIsSorting(true);
        chartRef.current.resetComparisonCount();

        try {
          await algorithm.execute(chartRef.current);
        } finally {
          setIsSorting(false);
        }
      }
    };

    const handleAlgorithmChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const algorithmName = e.target.value;
      if (onAlgorithmChange) {
        onAlgorithmChange(algorithmName);
      }
    };

    const handleArraySizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setArraySize(Number(e.target.value));
    };

    return (
      <div className="flex-1 bg-gray-800 rounded-xl overflow-hidden shadow-2xl border border-gray-700">
        <div className="bg-gray-800 border-b border-gray-700 p-4 flex flex-wrap justify-between items-center gap-4">
          <div className="flex flex-wrap items-center gap-4">
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
                value={algorithm.name}
                onChange={handleAlgorithmChange}
                disabled={isSorting}
              >
                {algorithms.map((algo) => (
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

            <div className="flex items-center ml-4">
              <div className="text-sm font-medium">
                <span className="text-gray-400">Comparisons: </span>
                <span
                  className={`font-mono ${
                    isSorting ? "text-green-400" : "text-blue-400"
                  }`}
                >
                  {comparisons.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
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

        <div id={chartId} className="h-[300px] md:h-[400px] p-4 md:p-6"></div>
      </div>
    );
  }
);

export default ChartCard;
