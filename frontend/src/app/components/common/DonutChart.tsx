import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from "recharts";
import { motion, AnimatePresence } from "motion/react";

export interface DonutSegment {
  id: string;
  label: string;
  value: number;
  color: string;
  emoji?: string;
  count?: number;
  percentage?: number;
  additionalInfo?: string;
}

interface DonutChartProps {
  data: DonutSegment[];
  title: string;
  centerLabel?: string;
  centerValue?: string | number;
  onSegmentClick?: (segment: DonutSegment) => void;
  selectedSegmentId?: string | null;
  size?: number;
  innerRadius?: number;
  outerRadius?: number;
  showLegend?: boolean;
  className?: string;
}

const renderActiveShape = (props: any) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 4) * cos;
  const sy = cy + (outerRadius + 4) * sin;
  const mx = cx + (outerRadius + 14) * cos;
  const my = cy + (outerRadius + 14) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 12;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g filter="drop-shadow(0px 0px 10px currentColor)" style={{ color: fill }}>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={1}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 8}
        outerRadius={outerRadius + 10}
        fill={fill}
        opacity={0.3}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" strokeWidth={1.5} />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 8}
        y={ey - 3}
        textAnchor={textAnchor}
        fill="#FFFFFF"
        fontSize={10}
        fontWeight={600}
      >
        {payload.label}
      </text>
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 8}
        y={ey + 11}
        textAnchor={textAnchor}
        fill="#B0B0C0"
        fontSize={9}
      >
        {payload.count ? `${payload.count} customers` : `${(percent * 100).toFixed(0)}%`}
      </text>
    </g>
  );
};

export function DonutChart({
  data,
  title,
  centerLabel = "TOTAL",
  centerValue,
  onSegmentClick,
  selectedSegmentId,
  size = 260,
  innerRadius = 70,
  outerRadius = 95,
  showLegend = true,
  className = ""
}: DonutChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const totalValue = data.reduce((sum, item) => sum + item.value, 0);
  const displayValue = centerValue || totalValue.toLocaleString();

  const handleClick = (entry: DonutSegment, index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
    if (onSegmentClick) onSegmentClick(entry);
  };

  const handleMouseEnter = (_: any, index: number) => setHoveredIndex(index);
  const handleMouseLeave = () => setHoveredIndex(null);

  const displayActiveIndex = activeIndex !== null ? activeIndex : hoveredIndex;

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="mb-3">
        <h3 className="text-[13px] font-semibold text-white uppercase tracking-wider mb-1">
          {title}
        </h3>
        <p className="text-[10px] font-medium text-[#B0B0C0] uppercase tracking-wider">
          Click any segment to filter
        </p>
      </div>

      {/* Extra horizontal padding so labels never clip */}
      <div className="relative flex justify-center items-center mb-4">
        <div style={{ width: size + 200, height: size + 100 }} className="relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 50, right: 100, bottom: 50, left: 100 }}>
              <Pie
                activeIndex={displayActiveIndex !== null ? displayActiveIndex : undefined}
                activeShape={renderActiveShape}
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={innerRadius}
                outerRadius={outerRadius}
                paddingAngle={2}
                dataKey="value"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onClick={(entry, index) => handleClick(entry.payload, index)}
                className="cursor-pointer focus:outline-none"
                stroke="none"
              >
                {data.map((entry, index) => {
                  const isActive = activeIndex === index || selectedSegmentId === entry.id;
                  const isHovered = hoveredIndex === index;

                  let opacity = 1;
                  if (activeIndex !== null) opacity = isActive ? 1 : 0.3;
                  else if (hoveredIndex !== null) opacity = isHovered ? 1 : 0.4;

                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      opacity={opacity}
                      style={{
                        color: entry.color,
                        transformOrigin: 'center',
                        transform: isActive ? 'scale(1.06)' : isHovered ? 'scale(1.03)' : 'scale(1)',
                      }}
                    />
                  );
                })}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Center label */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <motion.div
                key={String(displayValue)}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-[24px] font-bold text-white leading-none mb-1"
              >
                {hoveredIndex !== null
                  ? (data[hoveredIndex].count || data[hoveredIndex].value).toLocaleString()
                  : displayValue}
              </motion.div>
              <p className="text-[10px] font-medium text-[#E6E6E6] uppercase tracking-wider">
                {hoveredIndex !== null ? "SELECTED" : centerLabel}
              </p>
            </div>
          </div>

          <AnimatePresence>
            {activeIndex !== null && (
              <motion.div
                className="absolute inset-0 pointer-events-none z-[-1]"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: [0.1, 0.3, 0.1], scale: [1, 1.1, 1] }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <div
                  className="w-full h-full rounded-full"
                  style={{
                    boxShadow: `inset 0 0 30px ${data[activeIndex].color}, 0 0 50px ${data[activeIndex].color}`,
                    filter: `blur(20px)`
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {showLegend && (
        <div className="space-y-1.5">
          <p className="text-[10px] font-medium text-[#B0B0C0] uppercase tracking-wider mb-2">
            LEGEND (CLICK TO FILTER)
          </p>
          {data.map((segment, index) => {
            const isActive = activeIndex === index;
            const isHovered = hoveredIndex === index;

            return (
              <motion.button
                key={segment.id}
                onClick={() => handleClick(segment, index)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`w-full flex items-center justify-between p-2 rounded-lg transition-all border ${isActive
                  ? 'bg-[#6A0DAD]/20 border-[#6A0DAD]/50'
                  : 'border-white/5 bg-white/5 hover:bg-white/10 hover:border-[#6A0DAD]/30'
                  }`}
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: segment.color }}
                  />
                  <span className="text-[10px] font-medium text-[#E6E6E6] text-left leading-tight">
                    {segment.emoji ? `${segment.emoji} ` : ""}
                    {segment.label}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className="text-[10px] text-[#E6E6E6]">
                    {segment.count ?? segment.value}
                  </span>
                  <span className="text-[9px] text-[#B0B0C0] bg-black/30 px-1.5 py-0.5 rounded-full">
                    {((segment.value / totalValue) * 100).toFixed(0)}%
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
}