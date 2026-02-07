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
            while (svg.lastChild) {
                svg.removeChild(svg.lastChild);
            }

            const rc = rough.svg(svg);
            const fillColor = isComparing
                ? "#ef4444"
                : isSorted
                    ? "#22c55e"
                    : color;

            const node = rc.rectangle(2, 2, width - 4, height - 4, {
                fill: fillColor,
                stroke: fillColor,
                fillStyle: "hachure",
                fillWeight: 3,
                hachureGap: 4,
                roughness: 2.5,
                bowing: 1.5,
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
