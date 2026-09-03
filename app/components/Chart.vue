<template>
  <div class="chart-card">
    <div class="chart-header">
      <div class="chart-title-group">
        <svg class="chart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 3v18h18"></path>
          <path d="M18 9l-5 5-4-4-5 5"></path>
        </svg>
        <h3>Last 10 Plays</h3>
      </div>
      <div v-if="last10.length > 0" class="chart-stat">
        Avg: <span class="stat-value">{{ averagePercent }}%</span>
      </div>
    </div>

    <div v-if="last10.length === 0" class="empty-chart">
      <p>No games played yet.</p>
    </div>

    <div v-else class="chart-wrapper">
      <svg 
        class="chart-svg" 
        viewBox="0 0 500 200" 
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.35" />
            <stop offset="100%" stop-color="#ffffff" stop-opacity="0.0" />
          </linearGradient>
        </defs>

        <!-- Grid Horizontal Lines -->
        <line x1="45" y1="20" x2="480" y2="20" stroke="rgba(255, 255, 255, 0.2)" stroke-dasharray="4 4" stroke-width="1" />
        <text x="35" y="24" text-anchor="end" class="axis-label">100%</text>

        <line x1="45" y1="87.5" x2="480" y2="87.5" stroke="rgba(255, 255, 255, 0.2)" stroke-dasharray="4 4" stroke-width="1" />
        <text x="35" y="91.5" text-anchor="end" class="axis-label">50%</text>

        <line x1="45" y1="155" x2="480" y2="155" stroke="rgba(255, 255, 255, 0.4)" stroke-width="1" />
        <text x="35" y="159" text-anchor="end" class="axis-label">0%</text>

        <!-- Filled Gradient Area -->
        <path :d="areaPath" fill="url(#chartGradient)" />

        <!-- Line Path -->
        <path :d="linePath" fill="none" stroke="#fb9c4a" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" />

        <!-- X-axis Labels & Data Points -->
        <g v-for="(pt, index) in points" :key="pt.id">
          <!-- X-Axis Tick Label -->
          <text 
            :x="pt.x" 
            y="178" 
            text-anchor="middle" 
            class="axis-label x-label"
          >
            #{{ index + 1 }}
          </text>

          <!-- Interactive Circle Dot -->
          <circle 
            :cx="pt.x" 
            :cy="pt.y" 
            r="6" 
            class="chart-dot" 
            :class="{ 'selected': hoveredIndex === index }"
            @mouseenter="hoveredIndex = index"
            @mouseleave="hoveredIndex = null"
          />
          <circle 
            :cx="pt.x" 
            :cy="pt.y" 
            r="2.5" 
            fill="#4b9a76" 
            pointer-events="none"
          />

          <!-- Hover Tooltip -->
          <g v-if="hoveredIndex === index" pointer-events="none">
            <rect 
              :x="getTooltipX(pt.x)" 
              :y="pt.y - 38 < 10 ? pt.y + 12 : pt.y - 38" 
              width="90" 
              height="28" 
              rx="6" 
              fill="#1e293b" 
              opacity="0.95" 
            />
            <text 
              :x="getTooltipX(pt.x) + 45" 
              :y="pt.y - 38 < 10 ? pt.y + 30 : pt.y - 20" 
              text-anchor="middle" 
              fill="#ffffff" 
              font-size="11" 
              font-weight="bold"
            >
              {{ pt.percent }}% ({{ pt.score }}/{{ pt.targetCount }})
            </text>
          </g>
        </g>
      </svg>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { usePlayHistory } from '../composables/usePlayHistory'

const { history } = usePlayHistory()

const hoveredIndex = ref(null)

const last10 = computed(() => {
  return (history.value || []).slice(-10)
})

const averagePercent = computed(() => {
  if (!last10.value.length) return 0
  const sum = last10.value.reduce((acc, item) => acc + item.percent, 0)
  return Math.round(sum / last10.value.length)
})

const svgConfig = {
  paddingLeft: 45,
  paddingRight: 20,
  paddingTop: 20,
  paddingBottom: 45,
  width: 500,
  height: 200
}

const plotWidth = svgConfig.width - svgConfig.paddingLeft - svgConfig.paddingRight
const plotHeight = svgConfig.height - svgConfig.paddingTop - svgConfig.paddingBottom

const points = computed(() => {
  const list = last10.value
  if (!list.length) return []
  
  const count = list.length
  return list.map((item, i) => {
    const x = count === 1 
      ? svgConfig.paddingLeft + plotWidth / 2
      : svgConfig.paddingLeft + (i / (count - 1)) * plotWidth
      
    const y = svgConfig.paddingTop + (1 - item.percent / 100) * plotHeight
    
    return {
      id: item.id || i,
      x,
      y,
      percent: item.percent,
      score: item.score,
      targetCount: item.targetCount
    }
  })
})

const linePath = computed(() => {
  const pts = points.value
  if (!pts.length) return ''
  if (pts.length === 1) {
    return `M ${pts[0].x - 10} ${pts[0].y} L ${pts[0].x + 10} ${pts[0].y}`
  }
  return pts.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
})

const areaPath = computed(() => {
  const pts = points.value
  if (!pts.length) return ''
  const baselineY = svgConfig.paddingTop + plotHeight
  if (pts.length === 1) {
    const startX = pts[0].x - 10
    const endX = pts[0].x + 10
    return `M ${startX} ${baselineY} L ${startX} ${pts[0].y} L ${endX} ${pts[0].y} L ${endX} ${baselineY} Z`
  }
  
  const linePoints = pts.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const lastPoint = pts[pts.length - 1]
  const firstPoint = pts[0]
  
  return `${linePoints} L ${lastPoint.x} ${baselineY} L ${firstPoint.x} ${baselineY} Z`
})

function getTooltipX(x) {
  let tipX = x - 45
  if (tipX < 5) tipX = 5
  if (tipX + 90 > svgConfig.width - 5) tipX = svgConfig.width - 95
  return tipX
}
</script>

<style scoped>
.chart-card {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 6px;
  padding: 1.25rem 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  width: 100%;
  box-sizing: border-box;
  margin-top: 1.5rem;
}

@media (min-width: 600px) {
  .chart-card {
    border-radius: 8px;
  }
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  padding: 0 0.5rem;
}

.chart-title-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #ffffff;
}

.chart-icon {
  width: 20px;
  height: 20px;
  color: #fb9c4a;
}

.chart-title-group h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
}

.chart-stat {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.85);
  font-weight: 600;
}

.stat-value {
  color: #fb9c4a;
  font-size: 1rem;
  font-weight: 800;
}

.empty-chart {
  padding: 2rem 1rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.95rem;
  background-color: rgba(0, 0, 0, 0.12);
  border-radius: 6px;
  border: 1px dashed rgba(255, 255, 255, 0.25);
}

.chart-wrapper {
  width: 100%;
  overflow: hidden;
}

.chart-svg {
  width: 100%;
  height: auto;
  display: block;
}

.axis-label {
  font-size: 11px;
  fill: rgba(255, 255, 255, 0.85);
  font-family: inherit;
}

.x-label {
  font-size: 10px;
  fill: rgba(255, 255, 255, 0.75);
  font-weight: 600;
}

.chart-dot {
  fill: #ffffff;
  cursor: pointer;
  transition: r 0.15s ease, fill 0.15s ease;
}

.chart-dot:hover,
.chart-dot.selected {
  r: 8;
  fill: #fb9c4a;
}
</style>
