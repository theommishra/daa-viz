"use client";

import { useEffect, useRef } from "react";
import rough from "roughjs/bin/rough";

interface RoughBarProps {
    width: number;
    height: number;
    color: string;
    isComparing: boolean;
    isSorted: boolean;
}

export default function RoughBar({
    width,
    height,
    color,
    isComparing,
    isSorted,
}: RoughBarProps) {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (svgRef.current && width > 0 && height > 0) {
            const svg = svgRef.current;
            // Clear previous content
            while (svg.lastChild) {
                svg.removeChild(svg.lastChild);
            }

            const rc = rough.svg(svg);
            const fillColor = isComparing
                ? "#ef4444" // red-500
                : isSorted
                    ? "#22c55e" // green-500
                    : color;

            const node = rc.rectangle(2, 2, width - 4, height - 4, {
                fill: fillColor,
                stroke: fillColor, // border color same as fill
                fillStyle: "hachure", // sketchy fill
                fillWeight: 3, // thicker scanlines
                hachureGap: 4, // gap between lines
                roughness: 2.5, // make it sketchy
                bowing: 1.5, // curve lines
            });

            svg.appendChild(node);
        }
    }, [width, height, color, isComparing, isSorted]);

    return (
        <svg
            ref={svgRef}
            width={width}
            height={height}
            className={`block overflow-visible`}
            viewBox={`0 0 ${width} ${height}`}
        />
    );
}
