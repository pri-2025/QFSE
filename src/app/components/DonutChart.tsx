import React, { useState } from "react";
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

interface ActiveShape {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  startAngle: number;
  endAngle: number;
  fill: string;
  payload: DonutSegment;
  percent: number;
  value: number;
}

const renderActiveShape = (props: ActiveShape) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g filter="drop-shadow(0px 0px 12px currentColor)" style={{ color: fill }}>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
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
        innerRadius={outerRadius + 10}
        outerRadius={outerRadius + 12}
        fill={fill}
        opacity={0.3}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" strokeWidth={2} />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text 
        x={ex + (cos >= 0 ? 1 : -1) * 12} 
        y={ey} 
        textAnchor={textAnchor} 
        fill="#FFFFFF"
        className="text-sm font-semibold"
      >
        {payload.emoji ? `${payload.emoji} ` : ""}{payload.label}
      </text>
      <text 
        x={ex + (cos >= 0 ? 1 : -1) * 12} 
        y={ey} 
        dy={18} 
        textAnchor={textAnchor} 
        fill="#E6E6E6"
        className="text-xs"
      >
        {payload.count ? `${payload.count} customers` : `${value} (${(percent * 100).toFixed(0)}%)`}
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
  size = 280,
  innerRadius = 85,
  outerRadius = 120,
  showLegend = true,
  className = ""
}: DonutChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const totalValue = data.reduce((sum, item) => sum + item.value, 0);
  const displayValue = centerValue || totalValue.toLocaleString();

  const handleClick = (entry: DonutSegment, index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
    if (onSegmentClick) {
      onSegmentClick(entry);
    }
  };

  const handleMouseEnter = (_: any, index: number) => {
    setHoveredIndex(index);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  // Determine which segment should be shown as active
  const displayActiveIndex = activeIndex !== null ? activeIndex : hoveredIndex;

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Title */}
      <div className="mb-6">
        <h3 className="text-[14px] font-semibold text-white uppercase tracking-wider mb-2">
          {title}
        </h3>
        <p className="text-[12px] font-medium leading-[16px] text-[#E6E6E6] uppercase tracking-wider">
          Click any segment to filter customers
        </p>
      </div>

      {/* Chart Container */}
      <div className="relative flex justify-center items-center mb-8">
        <div style={{ width: size, height: size }} className="relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
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
                  
                  // Specific opacity logic from prompt:
                  // Hover: others dim to 40%
                  // Selected: others dim to 30%
                  let opacity = 1;
                  if (activeIndex !== null) {
                    opacity = isActive ? 1 : 0.3;
                  } else if (hoveredIndex !== null) {
                    opacity = isHovered ? 1 : 0.4;
                  }
                  
                  return (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      opacity={opacity}
                      className={`transition-all duration-300 ${isHovered || isActive ? 'filter drop-shadow-[0_0_20px_currentColor]' : ''}`}
                      style={{ 
                        color: entry.color,
                        transformOrigin: 'center',
                        transform: isActive ? 'scale(1.08)' : isHovered ? 'scale(1.05)' : 'scale(1)',
                      }}
                    />
                  );
                })}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Center Label */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <motion.div
                key={displayValue}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-[24px] font-bold text-white leading-none mb-1"
              >
                {hoveredIndex !== null 
                  ? (data[hoveredIndex].count || data[hoveredIndex].value).toLocaleString()
                  : displayValue}
              </motion.div>
              <p className="text-[12px] font-medium leading-[16px] text-[#E6E6E6] uppercase tracking-wider">
                {hoveredIndex !== null ? "SELECTED" : centerLabel}
              </p>
            </div>
          </div>

          {/* Pulsing Animation for Selected Segment */}
          <AnimatePresence>
            {activeIndex !== null && (
              <motion.div
                className="absolute inset-0 pointer-events-none z-[-1]"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: [0.1, 0.4, 0.1],
                  scale: [1, 1.1, 1]
                }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <div 
                  className="w-full h-full rounded-full"
                  style={{ 
                    boxShadow: `inset 0 0 40px ${data[activeIndex].color}, 0 0 60px ${data[activeIndex].color}`,
                    filter: `blur(20px)`
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="space-y-3">
          <p className="text-[12px] font-medium leading-[16px] text-[#E6E6E6] uppercase tracking-wider mb-4">
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
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all border ${
                  isActive
                    ? 'bg-[#6A0DAD]/20 border-[#6A0DAD]/50 shadow-[0_0_15px_rgba(106,13,173,0.2)]'
                    : 'border-white/5 bg-white/5 hover:bg-white/10 hover:border-[#6A0DAD]/30'
                }`}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-3">
                  <motion.div 
                    className="w-3 h-3 rounded-full shadow-[0_0_8px_currentColor]"
                    style={{ backgroundColor: segment.color, color: segment.color }}
                    animate={isHovered || isActive ? { scale: [1, 1.2, 1], filter: ['brightness(1)', 'brightness(1.5)', 'brightness(1)'] } : {}}
                    transition={{ duration: 0.5, repeat: isActive ? Infinity : 0 }}
                  />
                  <span className="text-[12px] font-medium leading-[16px] text-[#E6E6E6]">
                    {segment.emoji ? `${segment.emoji} ` : ""}
                    {segment.label}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[12px] font-medium leading-[16px] text-[#E6E6E6] font-['JetBrains_Mono']">
                    {segment.count ? `${segment.count}` : segment.value}
                  </span>
                  <span className="text-[10px] text-[#B0B0C0] font-bold bg-black/30 px-2 py-0.5 rounded-full">
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
