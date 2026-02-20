// FunctionGraph - SVG component for visualizing mathematical functions
import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Line, Text as SvgText, Circle, G } from 'react-native-svg';
import { useTheme } from '../contexts/ThemeContext';
import { GraphPoint } from '../data/functionQuestions';

// ============================================================
// TYPES
// ============================================================

interface FunctionGraphProps {
    points: GraphPoint[];
    domainRange: [number, number];  // [xMin, xMax]
    imageRange: [number, number];   // [yMin, yMax]
    width?: number;
    height?: number;
    showGrid?: boolean;
    highlightDomain?: boolean;
    highlightImage?: boolean;
    domainColor?: string;
    imageColor?: string;
    curveColor?: string;
}

// ============================================================
// COMPONENT
// ============================================================

const FunctionGraph: React.FC<FunctionGraphProps> = ({
    points,
    domainRange,
    imageRange,
    width = 280,
    height = 200,
    showGrid = true,
    highlightDomain = false,
    highlightImage = false,
    domainColor = '#10B981',
    imageColor = '#8B5CF6',
    curveColor,
}) => {
    const { colors } = useTheme();
    const actualCurveColor = curveColor || colors.primary;

    // Padding for axes labels
    const padding = { top: 15, right: 15, bottom: 25, left: 30 };
    const graphWidth = width - padding.left - padding.right;
    const graphHeight = height - padding.top - padding.bottom;

    // Scale functions
    const xScale = useMemo(() => {
        const [xMin, xMax] = domainRange;
        return (x: number) => padding.left + ((x - xMin) / (xMax - xMin)) * graphWidth;
    }, [domainRange, graphWidth, padding.left]);

    const yScale = useMemo(() => {
        const [yMin, yMax] = imageRange;
        return (y: number) => padding.top + graphHeight - ((y - yMin) / (yMax - yMin)) * graphHeight;
    }, [imageRange, graphHeight, padding.top]);

    // Generate SVG path from points
    const pathData = useMemo(() => {
        if (points.length === 0) return '';

        const validPoints = points.filter(p => {
            const [xMin, xMax] = domainRange;
            const [yMin, yMax] = imageRange;
            return p.x >= xMin && p.x <= xMax && p.y >= yMin && p.y <= yMax;
        });

        if (validPoints.length === 0) return '';

        let d = `M ${xScale(validPoints[0].x)} ${yScale(validPoints[0].y)}`;

        for (let i = 1; i < validPoints.length; i++) {
            const prev = validPoints[i - 1];
            const curr = validPoints[i];

            // Break line if there's a big gap (discontinuity)
            const gap = Math.abs(curr.y - prev.y);
            if (gap > (imageRange[1] - imageRange[0]) * 0.5) {
                d += ` M ${xScale(curr.x)} ${yScale(curr.y)}`;
            } else {
                d += ` L ${xScale(curr.x)} ${yScale(curr.y)}`;
            }
        }

        return d;
    }, [points, domainRange, imageRange, xScale, yScale]);

    // Grid lines
    const gridLines = useMemo(() => {
        const lines: { x1: number; y1: number; x2: number; y2: number; label?: string; isVertical: boolean }[] = [];

        const [xMin, xMax] = domainRange;
        const [yMin, yMax] = imageRange;

        // Vertical grid lines
        const xStep = (xMax - xMin) / 4;
        for (let x = xMin; x <= xMax; x += xStep) {
            lines.push({
                x1: xScale(x),
                y1: padding.top,
                x2: xScale(x),
                y2: padding.top + graphHeight,
                label: x === 0 ? '0' : x.toFixed(1),
                isVertical: true,
            });
        }

        // Horizontal grid lines
        const yStep = (yMax - yMin) / 4;
        for (let y = yMin; y <= yMax; y += yStep) {
            lines.push({
                x1: padding.left,
                y1: yScale(y),
                x2: padding.left + graphWidth,
                y2: yScale(y),
                label: y === 0 ? '' : y.toFixed(1),
                isVertical: false,
            });
        }

        return lines;
    }, [domainRange, imageRange, xScale, yScale, graphWidth, graphHeight, padding]);

    // Origin position
    const originX = xScale(0);
    const originY = yScale(0);
    const showOriginInGraph = originX >= padding.left && originX <= padding.left + graphWidth &&
        originY >= padding.top && originY <= padding.top + graphHeight;

    return (
        <View style={styles.container}>
            <Svg width={width} height={height}>
                {/* Background */}
                <G>
                    {/* Grid */}
                    {showGrid && gridLines.map((line, i) => (
                        <G key={i}>
                            <Line
                                x1={line.x1}
                                y1={line.y1}
                                x2={line.x2}
                                y2={line.y2}
                                stroke={colors.border}
                                strokeWidth={0.5}
                                strokeDasharray="3,3"
                            />
                        </G>
                    ))}

                    {/* Highlight Domain (x-axis area) */}
                    {highlightDomain && (
                        <Line
                            x1={padding.left}
                            y1={showOriginInGraph ? originY : padding.top + graphHeight}
                            x2={padding.left + graphWidth}
                            y2={showOriginInGraph ? originY : padding.top + graphHeight}
                            stroke={domainColor}
                            strokeWidth={4}
                            strokeLinecap="round"
                            opacity={0.6}
                        />
                    )}

                    {/* Highlight Image (y-axis area) */}
                    {highlightImage && (
                        <Line
                            x1={showOriginInGraph ? originX : padding.left}
                            y1={padding.top}
                            x2={showOriginInGraph ? originX : padding.left}
                            y2={padding.top + graphHeight}
                            stroke={imageColor}
                            strokeWidth={4}
                            strokeLinecap="round"
                            opacity={0.6}
                        />
                    )}

                    {/* X Axis */}
                    <Line
                        x1={padding.left}
                        y1={showOriginInGraph ? originY : padding.top + graphHeight}
                        x2={padding.left + graphWidth}
                        y2={showOriginInGraph ? originY : padding.top + graphHeight}
                        stroke={colors.textSecondary}
                        strokeWidth={1.5}
                    />

                    {/* Y Axis */}
                    <Line
                        x1={showOriginInGraph ? originX : padding.left}
                        y1={padding.top}
                        x2={showOriginInGraph ? originX : padding.left}
                        y2={padding.top + graphHeight}
                        stroke={colors.textSecondary}
                        strokeWidth={1.5}
                    />

                    {/* Axis Labels */}
                    <SvgText
                        x={padding.left + graphWidth - 5}
                        y={(showOriginInGraph ? originY : padding.top + graphHeight) - 5}
                        fill={colors.textSecondary}
                        fontSize={10}
                        textAnchor="end"
                    >
                        x
                    </SvgText>
                    <SvgText
                        x={(showOriginInGraph ? originX : padding.left) + 8}
                        y={padding.top + 10}
                        fill={colors.textSecondary}
                        fontSize={10}
                    >
                        y
                    </SvgText>

                    {/* Origin dot */}
                    {showOriginInGraph && (
                        <Circle
                            cx={originX}
                            cy={originY}
                            r={3}
                            fill={colors.textSecondary}
                        />
                    )}

                    {/* Function curve */}
                    <Path
                        d={pathData}
                        stroke={actualCurveColor}
                        strokeWidth={2.5}
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </G>
            </Svg>
        </View>
    );
};

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default FunctionGraph;
