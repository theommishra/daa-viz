"use client";

import { useEffect, useRef } from "react";
import rough from "roughjs/bin/rough";

interface RoughArrowProps {
    width?: number;
    height?: number;
    color: string;
}

export default function RoughArrow({
    width = 30,
    height = 40,
    color,
}: RoughArrowProps) {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (svgRef.current) {
            const svg = svgRef.current;
            while (svg.lastChild) {
                svg.removeChild(svg.lastChild);
            }

            const rc = rough.svg(svg);

            // Arrow Line
            // Centered X
            const x = width / 2;
            const lineStart = 0;
            const lineEnd = height - 10;

            const line = rc.line(x, lineStart, x, lineEnd, {
                stroke: color,
                strokeWidth: 2,
                roughness: 2,
                bowing: 1.5
            });

            // Arrow Head
            const head = rc.polygon([
                [x - 8, lineEnd - 2],
                [x, height],
                [x + 8, lineEnd - 2]
            ], {
                fill: color,
                stroke: color,
                fillStyle: 'solid', // solid fill for better visibility
                roughness: 2,
                bowing: 1.5
            });

            svg.appendChild(line);
            svg.appendChild(head);
        }
    }, [width, height, color]);

    return (
        <svg
            ref={svgRef}
            width={width}
            height={height}
            className="block overflow-visible"
        />
    );
}
