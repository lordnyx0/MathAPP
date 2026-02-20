import React, { useMemo } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { Circle, Line, Text as SvgText, G, Path } from 'react-native-svg';
import { spacing, fontSize } from '../styles/theme';
import { useTheme } from '../contexts/ThemeContext';

interface QuadrantCircleProps {
    highlightedQuadrant?: number | null;
    showLabels?: boolean;
    showAxes?: boolean;
}

const QuadrantCircle: React.FC<QuadrantCircleProps> = ({
    highlightedQuadrant,
    showLabels = true,
    showAxes = true
}) => {
    const { colors } = useTheme();
    const { width } = useWindowDimensions();
    const SIZE = Math.min(width - 40, 300);
    const CENTER = SIZE / 2;
    const RADIUS = SIZE / 2 - 30;

    const quadrantColors: Record<number, string> = useMemo(() => ({
        1: colors.basico,
        2: colors.info,
        3: colors.warning,
        4: colors.error,
    }), [colors]);

    const getQuadrantPath = (quadrant: number): string => {
        const startAngle = (quadrant - 1) * 90 - 90;
        const endAngle = quadrant * 90 - 90;

        const startRad = (startAngle * Math.PI) / 180;
        const endRad = (endAngle * Math.PI) / 180;

        const x1 = CENTER + RADIUS * Math.cos(startRad);
        const y1 = CENTER + RADIUS * Math.sin(startRad);
        const x2 = CENTER + RADIUS * Math.cos(endRad);
        const y2 = CENTER + RADIUS * Math.sin(endRad);

        return `M ${CENTER} ${CENTER} L ${x1} ${y1} A ${RADIUS} ${RADIUS} 0 0 1 ${x2} ${y2} Z`;
    };

    return (
        <View style={styles.container} accessibilityLabel="Círculo trigonométrico mostrando os 4 quadrantes">
            <Svg width={SIZE} height={SIZE} accessibilityRole="image">
                {/* Background circle */}
                <Circle
                    cx={CENTER}
                    cy={CENTER}
                    r={RADIUS}
                    fill={colors.surfaceAlt}
                    stroke={colors.border}
                    strokeWidth={2}
                />

                {/* Quadrant fills */}
                {[1, 2, 3, 4].map((q) => (
                    <Path
                        key={q}
                        d={getQuadrantPath(q)}
                        fill={highlightedQuadrant === q ? quadrantColors[q] + '40' : 'transparent'}
                        stroke={highlightedQuadrant === q ? quadrantColors[q] : 'transparent'}
                        strokeWidth={3}
                    />
                ))}

                {/* Axes */}
                {showAxes && (
                    <G>
                        {/* X axis */}
                        <Line
                            x1={CENTER - RADIUS - 10}
                            y1={CENTER}
                            x2={CENTER + RADIUS + 10}
                            y2={CENTER}
                            stroke={colors.textTertiary}
                            strokeWidth={1.5}
                        />
                        {/* Y axis */}
                        <Line
                            x1={CENTER}
                            y1={CENTER - RADIUS - 10}
                            x2={CENTER}
                            y2={CENTER + RADIUS + 10}
                            stroke={colors.textTertiary}
                            strokeWidth={1.5}
                        />
                    </G>
                )}

                {/* Angle labels */}
                {showLabels && (
                    <G>
                        {/* 0 / 2π */}
                        <SvgText
                            x={CENTER + RADIUS + 15}
                            y={CENTER + 5}
                            fill={colors.textSecondary}
                            fontSize={12}
                            textAnchor="start"
                        >
                            0 / 2π
                        </SvgText>

                        {/* π/2 */}
                        <SvgText
                            x={CENTER}
                            y={CENTER - RADIUS - 10}
                            fill={colors.textSecondary}
                            fontSize={12}
                            textAnchor="middle"
                        >
                            π/2
                        </SvgText>

                        {/* π */}
                        <SvgText
                            x={CENTER - RADIUS - 15}
                            y={CENTER + 5}
                            fill={colors.textSecondary}
                            fontSize={12}
                            textAnchor="end"
                        >
                            π
                        </SvgText>

                        {/* 3π/2 */}
                        <SvgText
                            x={CENTER}
                            y={CENTER + RADIUS + 18}
                            fill={colors.textSecondary}
                            fontSize={12}
                            textAnchor="middle"
                        >
                            3π/2
                        </SvgText>

                        {/* Quadrant numbers */}
                        <SvgText
                            x={CENTER + RADIUS * 0.5}
                            y={CENTER - RADIUS * 0.5}
                            fill={highlightedQuadrant === 1 ? quadrantColors[1] : colors.textTertiary}
                            fontSize={16}
                            fontWeight="bold"
                            textAnchor="middle"
                        >
                            I
                        </SvgText>

                        <SvgText
                            x={CENTER - RADIUS * 0.5}
                            y={CENTER - RADIUS * 0.5}
                            fill={highlightedQuadrant === 2 ? quadrantColors[2] : colors.textTertiary}
                            fontSize={16}
                            fontWeight="bold"
                            textAnchor="middle"
                        >
                            II
                        </SvgText>

                        <SvgText
                            x={CENTER - RADIUS * 0.5}
                            y={CENTER + RADIUS * 0.5 + 10}
                            fill={highlightedQuadrant === 3 ? quadrantColors[3] : colors.textTertiary}
                            fontSize={16}
                            fontWeight="bold"
                            textAnchor="middle"
                        >
                            III
                        </SvgText>

                        <SvgText
                            x={CENTER + RADIUS * 0.5}
                            y={CENTER + RADIUS * 0.5 + 10}
                            fill={highlightedQuadrant === 4 ? quadrantColors[4] : colors.textTertiary}
                            fontSize={16}
                            fontWeight="bold"
                            textAnchor="middle"
                        >
                            IV
                        </SvgText>
                    </G>
                )}

                {/* Center point */}
                <Circle
                    cx={CENTER}
                    cy={CENTER}
                    r={4}
                    fill={colors.textPrimary}
                />
            </Svg>

            {/* Decimal reference below */}
            <View style={styles.referenceContainer}>
                <View style={[styles.referenceRow, { width: SIZE }]}>
                    <Text style={[styles.refLabel, { color: quadrantColors[1] }]}>{'< 0.5'}</Text>
                    <Text style={[styles.refLabel, { color: quadrantColors[2] }]}>0.5 - 1</Text>
                    <Text style={[styles.refLabel, { color: quadrantColors[3] }]}>1 - 1.5</Text>
                    <Text style={[styles.refLabel, { color: quadrantColors[4] }]}>1.5 - 2</Text>
                </View>
                <View style={[styles.referenceRow, { width: SIZE }]}>
                    <Text style={[styles.refQuad, { color: quadrantColors[1] }]}>1º Q</Text>
                    <Text style={[styles.refQuad, { color: quadrantColors[2] }]}>2º Q</Text>
                    <Text style={[styles.refQuad, { color: quadrantColors[3] }]}>3º Q</Text>
                    <Text style={[styles.refQuad, { color: quadrantColors[4] }]}>4º Q</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginVertical: spacing.lg,
    },
    referenceContainer: {
        marginTop: spacing.lg,
        paddingHorizontal: spacing.lg,
    },
    referenceRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: spacing.xs,
    },
    refLabel: {
        fontSize: fontSize.xs,
        fontWeight: '600',
    },
    refQuad: {
        fontSize: fontSize.xs,
        fontWeight: '700',
    },
});

export default QuadrantCircle;
