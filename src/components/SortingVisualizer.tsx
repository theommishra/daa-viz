"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCcw, Pause, Shuffle } from "lucide-react";
import RoughBar from "./RoughBar";
import RoughArrow from "./RoughArrow";
import {
    bubbleSort,
    selectionSort,
    insertionSort,
    mergeSort,
    quickSort,
    SortStep,
} from "../lib/sortingAlgorithms";

type AlgorithmType = "bubble" | "selection" | "insertion" | "merge" | "quick";

const ALGORITHMS: { label: string; value: AlgorithmType }[] = [
    { label: "Bubble Sort", value: "bubble" },
    { label: "Selection Sort", value: "selection" },
    { label: "Insertion Sort", value: "insertion" },
    { label: "Merge Sort", value: "merge" },
    { label: "Quick Sort", value: "quick" },
];

interface SortingItem {
    id: string;
    value: number;
}

export default function SortingVisualizer() {
    const [algorithm, setAlgorithm] = useState<AlgorithmType>("bubble");
    const [arraySize, setArraySize] = useState(20);
    const [speed, setSpeed] = useState(50);
    const [items, setItems] = useState<SortingItem[]>([]);
    const [isSorting, setIsSorting] = useState(false);
    const [isSorted, setIsSorted] = useState(false);
    const [highlightIndices, setHighlightIndices] = useState<number[]>([]);
    const [stats, setStats] = useState({ comparisons: 0, swaps: 0, steps: 0 });

    // Refs for loop control
    const sortingRef = useRef<boolean>(false);
    const speedRef = useRef(speed);
    const itemsRef = useRef(items); // Keep track of current items for the generator

    useEffect(() => {
        speedRef.current = speed;
    }, [speed]);

    useEffect(() => {
        generateArray();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [arraySize]); // Re-generate when size changes

    const generateArray = useCallback(() => {
        if (sortingRef.current) return;
        const newItems = Array.from({ length: arraySize }, (_, i) => ({
            id: `item-${Date.now()}-${i}`,
            value: Math.floor(Math.random() * 90) + 10,
        }));
        setItems(newItems);
        itemsRef.current = newItems;
        setIsSorted(false);
        setHighlightIndices([]);
        setStats({ comparisons: 0, swaps: 0, steps: 0 });
    }, [arraySize]);

    const handleStart = async () => {
        if (isSorted) {
            generateArray();
            await new Promise(r => setTimeout(r, 100)); // Small delay for state update
        }

        setIsSorting(true);
        sortingRef.current = true;
        setStats({ comparisons: 0, swaps: 0, steps: 0 });

        // Get values
        const values = itemsRef.current.map(item => item.value);

        let generator: Generator<SortStep>;
        switch (algorithm) {
            case "bubble": generator = bubbleSort(values); break;
            case "selection": generator = selectionSort(values); break;
            case "insertion": generator = insertionSort(values); break;
            case "merge": generator = mergeSort(values); break; // Merge sort is complex with overwrite
            case "quick": generator = quickSort(values); break;
            default: generator = bubbleSort(values);
        }

        for (const step of generator) {
            if (!sortingRef.current) break;

            if (step.type === "compare") {
                setHighlightIndices(step.indices);
                setStats(prev => ({ ...prev, comparisons: prev.comparisons + 1, steps: prev.steps + 1 }));
            } else if (step.type === "swap") {
                setItems(prev => {
                    const newItems = [...prev];
                    const [i, j] = step.indices;
                    if (newItems[i] && newItems[j]) {
                        [newItems[i], newItems[j]] = [newItems[j], newItems[i]];
                        itemsRef.current = newItems;
                    }
                    return newItems;
                });
                setStats(prev => ({ ...prev, swaps: prev.swaps + 1, steps: prev.steps + 1 }));
            } else if (step.type === "overwrite") {
                setItems(prev => {
                    const newItems = [...prev];
                    const [i] = step.indices;
                    if (step.value !== undefined && newItems[i]) {
                        // For overwrite, we might lose the original ID concept if we just replace value.
                        // But let's just update value to keep animation simple (height change)
                        newItems[i] = { ...newItems[i], value: step.value };
                    }
                    itemsRef.current = newItems;
                    return newItems;
                });
                setStats(prev => ({ ...prev, swaps: prev.swaps + 1, steps: prev.steps + 1 })); // Overwrite counts as "op"
            }

            // Dynamic delay based on speed (1-100)
            // Speed 100 -> 5ms, Speed 1 -> 500ms
            const delay = Math.max(5, 500 - (speedRef.current * 4.5));
            await new Promise(resolve => setTimeout(resolve, delay));
        }

        setHighlightIndices([]);
        setIsSorting(false);
        sortingRef.current = false;
        setIsSorted(true);
    };

    const handleStop = () => {
        sortingRef.current = false;
        setIsSorting(false);
    };

    const getBarColor = (value: number, isComparing: boolean, isSorted: boolean) => {
        if (isComparing) return "#f472b6"; // pink-400
        if (isSorted) return "#4ade80"; // green-400
        // Hue based on value (0-100) -> 200-280 (Blue to Purple range)
        const hue = 210 + (value / 100) * 60;
        return `hsl(${hue}, 90%, 60%)`;
    };

    return (
        <div className="w-full max-w-6xl mx-auto p-6 flex flex-col gap-8">
            {/* Header & Controls */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6 bg-gray-900/40 p-8 rounded-3xl border border-white/10 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                {/* Decorative Glow */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-70" />

                <div className="flex flex-col gap-2 z-10">
                    <h1 className="text-4xl font-extrabold font-outfit text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 tracking-tight">
                        Sketchy Sort
                    </h1>
                    <p className="text-gray-400 text-sm">Interactive Algorithm Visualizer</p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-6 z-10">
                    <div className="relative group">
                        <select
                            value={algorithm}
                            onChange={(e) => setAlgorithm(e.target.value as AlgorithmType)}
                            disabled={isSorting}
                            className="appearance-none bg-gray-800/80 text-white pl-4 pr-10 py-3 rounded-xl border border-gray-700 hover:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all cursor-pointer min-w-[180px]"
                        >
                            {ALGORITHMS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Size</span>
                        <input
                            type="range"
                            min="5"
                            max="50"
                            value={arraySize}
                            onChange={(e) => setArraySize(Number(e.target.value))}
                            disabled={isSorting}
                            className="w-32 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-all"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Speed</span>
                        <input
                            type="range"
                            min="1"
                            max="100"
                            value={speed}
                            onChange={(e) => setSpeed(Number(e.target.value))}
                            className="w-32 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500 hover:accent-purple-400 transition-all"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3 z-10">
                    <button
                        onClick={generateArray}
                        disabled={isSorting}
                        className="p-3 bg-gray-800/80 hover:bg-gray-700 text-gray-300 rounded-xl border border-gray-700 hover:border-gray-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                        title="Randomize"
                    >
                        <Shuffle size={20} className="group-hover:rotate-180 transition-transform duration-500" />
                    </button>
                    {!isSorting ? (
                        <button
                            onClick={handleStart}
                            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-900/30 hover:shadow-blue-900/50 hover:scale-105 active:scale-95"
                        >
                            <Play size={20} fill="currentColor" /> Run Sort
                        </button>
                    ) : (
                        <button
                            onClick={handleStop}
                            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-red-900/30 hover:scale-105 active:scale-95"
                        >
                            <Pause size={20} fill="currentColor" /> Stop
                        </button>
                    )}
                </div>
            </div>

            {/* Visualization Area */}
            <div className="relative h-[600px] w-full bg-gradient-to-b from-gray-900/80 to-black/80 rounded-3xl border border-white/5 p-8 lg:p-12 flex items-end justify-center gap-2 lg:gap-3 overflow-hidden shadow-2xl backdrop-blur-md">
                {/* Background Grid */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                    style={{
                        backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
                        backgroundSize: '40px 40px'
                    }}
                />

                {/* Ambient glow */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-1/2 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

                <AnimatePresence>
                    {items.map((item, idx) => (
                        <motion.div
                            key={item.id}
                            layout
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            className="flex-1 flex flex-col items-center justify-end relative z-10"
                            style={{ height: '100%' }}
                        >
                            <AnimatePresence>
                                {highlightIndices.includes(idx) && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -20, scale: 0.8 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -20, scale: 0.8 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                        className="mb-4 absolute bottom-[100%]"
                                    >
                                        {/* Dynamic Arrow Color */}
                                        <RoughArrow color={items[idx] && items[idx].value > 50 ? "#f472b6" : "#60a5fa"} width={28} height={36} />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <div className="relative w-full flex justify-center">
                                <RoughBar
                                    width={Math.min(60, 1000 / items.length)}
                                    height={(item.value / 100) * 450}
                                    color={getBarColor(item.value, highlightIndices.includes(idx), isSorted && !isSorting)}
                                    isComparing={highlightIndices.includes(idx)}
                                    isSorted={isSorted && !isSorting}
                                />
                            </div>
                            <span className={`mt-3 text-[10px] md:text-sm font-mono font-bold transition-colors duration-300 ${highlightIndices.includes(idx) ? 'text-white scale-110' : 'text-gray-500'}`}>
                                {item.value}
                            </span>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Info / Legend */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-gray-900/40 rounded-3xl border border-white/10 backdrop-blur-md">
                    <h3 className="text-lg font-bold mb-4 text-gray-200 flex items-center gap-2">
                        <span className="w-1 h-5 bg-blue-500 rounded-full"></span>
                        Live Statistics
                    </h3>
                    <div className="grid grid-cols-3 gap-8">
                        <div>
                            <span className="text-gray-500 text-xs uppercase tracking-wider block mb-1">Comparisons</span>
                            <span className="text-2xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                                {stats.comparisons}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-500 text-xs uppercase tracking-wider block mb-1">Swaps</span>
                            <span className="text-2xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                                {stats.swaps}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-500 text-xs uppercase tracking-wider block mb-1">Operations</span>
                            <span className="text-2xl font-mono font-bold text-gray-200">
                                {stats.steps}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-gray-900/40 rounded-3xl border border-white/10 backdrop-blur-md flex flex-col justify-center items-center">
                    <div className="flex flex-wrap gap-8 justify-center">
                        <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded bg-gradient-to-br from-blue-500 to-purple-500 border border-white/20"></div>
                            <span className="text-sm text-gray-300 font-medium">Value (Hue)</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded bg-pink-400 border border-pink-300/50 shadow-[0_0_10px_rgba(244,114,182,0.5)]"></div>
                            <span className="text-sm text-gray-300 font-medium">Comparing</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded bg-green-400 border border-green-300/50 shadow-[0_0_10px_rgba(74,222,128,0.5)]"></div>
                            <span className="text-sm text-gray-300 font-medium">Sorted</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
