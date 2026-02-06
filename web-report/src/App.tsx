import { useEffect, useState, useRef, type ReactNode } from 'react'
import { toPng } from 'html-to-image'
import {
  CartesianGrid,
  Customized,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  LabelList,
} from 'recharts'
import './App.css'

type ChartSeries = {
  name: string
  values: (number | null)[]
}

type ChartDefinition = {
  id: string
  title?: string
  sheet: string
  type: string
  categories: (number | string | null)[]
  series: ChartSeries[]
}

type Indicator = {
  title: string
  slug: string
  sheet: string
  charts: ChartDefinition[]
  table?: (string | null)[][] | null
  typ?: string | null
  fraga?: string | null
  kommentar?: string | null
  underrubrik?: string | null
  rubrik?: string | null
  kalla?: string | null
}

type Section = {
  title: string
  slug: string
  indicators: Indicator[]
}

type ReportData = {
  generated_at: string
  source_workbook: string
  section_count: number
  sections: Section[]
}

const palette = ['#111827', '#A44E07', '#2563EB', '#059669', '#9333EA', '#DC2626']

/** Section icon for sidebar – line chart, shield, media, etc. */
function SectionIcon({ slug, title }: { slug: string; title: string }) {
  const t = title.toUpperCase()
  const s = slug.toLowerCase()
  if (s.includes('fortr') || t.includes('FÖRTROENDE')) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    )
  }
  if (s.includes('medie') || t.includes('MEDIER') || t.includes('MEDIETRENDER')) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    )
  }
  if (s.includes('sakfragor') || t.includes('SAKFRÅGOR')) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    )
  }
  if (s.includes('polit') || t.includes('POLITISK')) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M12 2v4" /><path d="M12 18v4" /><path d="M4.93 4.93l2.83 2.83" /><path d="M16.24 16.24l2.83 2.83" />
        <path d="M2 12h4" /><path d="M18 12h4" /><path d="M4.93 19.07l2.83-2.83" /><path d="M16.24 7.76l2.83-2.83" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    )
  }
  if (s.includes('sverige') || t.includes('OMVÄRLDEN')) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    )
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  )
}

type Run = { start: number; end: number }
type Gap = { from: number; to: number }

/** Splits series values into contiguous runs (consecutive non-null) and gaps (from end of run to start of next). */
const getSegments = (values: (number | string | null)[]): { runs: Run[]; gaps: Gap[] } => {
  const runs: Run[] = []
  const gaps: Gap[] = []
  let start: number | null = null
  let last: number | null = null
  const n = values.length
  for (let i = 0; i < n; i++) {
    const v = values[i]
    const num = v !== null && v !== undefined ? Number(v) : NaN
    const valid = !Number.isNaN(num)
    if (valid) {
      if (start === null) start = i
      last = i
    } else {
      if (start !== null && last !== null) {
        runs.push({ start, end: last })
        start = null
        last = null
      }
    }
  }
  if (start !== null && last !== null) runs.push({ start, end: last })

  for (let r = 0; r < runs.length - 1; r++) {
    gaps.push({ from: runs[r].end, to: runs[r + 1].start })
  }
  return { runs, gaps }
}

/** Last-point pixel coords and metadata for leader-line labels */
type LastPointInfo = { x: number; y: number; value: number; name: string; color: string }

type LineChartWithLeaderLabelsProps = {
  chart: ChartDefinition
  chartData: Record<string, string | number | null>[]
  chartRows: Record<string, string | number | null>[]
  activeIndicator: Indicator
  yAxisDomain: [number, number]
  marginRight: number
  marginLeft: number
}

/** Chart that draws end labels in a right column with leader lines to each series' last point. */
function LineChartWithLeaderLabels({
  chart,
  chartData,
  chartRows,
  activeIndicator,
  yAxisDomain,
  marginRight,
  marginLeft,
}: LineChartWithLeaderLabelsProps) {
  const lastPointsRef = useRef<Record<number, LastPointInfo>>({})
  const [lastPointsSnapshot, setLastPointsSnapshot] = useState<Array<{ index: number } & LastPointInfo>>([])

  const isPartiledare = activeIndicator.title.toLowerCase().includes('partiledarpopularitet')

  useEffect(() => {
    const id = setTimeout(() => {
      const entries = Object.entries(lastPointsRef.current)
        .filter(([, pt]) => pt != null)
        .map(([index, pt]) => ({ ...pt, index: Number(index) })) as ({ index: number } & LastPointInfo)[]
      setLastPointsSnapshot(entries)
    }, 0)
    return () => clearTimeout(id)
  }, [chartData, chart.series.length])

  const renderLeaderLabels = (props: unknown) => {
    const p = props as { offset?: { top?: number; left?: number; bottom?: number }; height?: number }
    const points = lastPointsSnapshot
    if (points.length === 0) return null
    const sorted = [...points].sort((a, b) => b.value - a.value)
    const maxX = Math.max(...sorted.map((pt) => pt.x))
    const labelX = maxX + 24
    const n = sorted.length
    const minY = Math.min(...sorted.map((pt) => pt.y))
    const maxY = Math.max(...sorted.map((pt) => pt.y))
    const top = p?.offset?.top ?? minY
    const plotHeight = p?.height ?? Math.max(maxY - minY + 40, 200)
    const bottomMargin = p?.offset?.bottom ?? 28
    const plotBottom = top + plotHeight - bottomMargin
    const padding = 10
    const availableHeight = Math.max(0, plotBottom - top - 2 * padding)
    const rowHeight = n > 0 ? availableHeight / n : 20

    return (
      <g>
        {sorted.map((point, j) => {
          const displayValue = Math.round(point.value)
          const percentageText = isPartiledare ? `${displayValue}` : `${displayValue}%`
          const fullLabel = `${percentageText} ${point.name}`
          const maxLength = n > 4 ? 22 : 28
          let line1 = fullLabel
          let line2: string | null = null
          if (fullLabel.length > maxLength) {
            const spaceIndex = fullLabel.lastIndexOf(' ', maxLength)
            if (spaceIndex > 0 && spaceIndex < fullLabel.length - 1) {
              line1 = fullLabel.substring(0, spaceIndex)
              line2 = fullLabel.substring(spaceIndex + 1)
            }
          }
          const fontSize = n > 4 ? 12 : 14
          const lineHeight = fontSize + 2
          const labelBottomOffset = line2 ? lineHeight + fontSize : 4 + fontSize
          const assignedY = top + padding + (j + 0.5) * rowHeight
          const labelY = Math.min(plotBottom - padding - labelBottomOffset, assignedY)
          const midX = point.x + 12
          return (
            <g key={point.index}>
              <path
                d={`M ${labelX} ${labelY} L ${midX} ${labelY} L ${point.x} ${point.y}`}
                stroke="#94a3b8"
                strokeWidth={1}
                fill="none"
              />
              {line2 ? (
                <>
                  <text x={labelX + 4} y={labelY} fill={point.color} fontSize={fontSize} fontWeight={500} textAnchor="start">{line1}</text>
                  <text x={labelX + 4} y={labelY + lineHeight} fill={point.color} fontSize={fontSize} fontWeight={500} textAnchor="start">{line2}</text>
                </>
              ) : (
                <text x={labelX + 4} y={labelY + 4} fill={point.color} fontSize={fontSize} fontWeight={500} textAnchor="start">{line1}</text>
              )}
            </g>
          )
        })}
      </g>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData} margin={{ top: 16, right: marginRight, left: marginLeft, bottom: 16 }}>
        <CartesianGrid stroke="#E5E7EB" vertical={false} />
        <XAxis
          dataKey="category"
          tick={{ fontSize: 14, fill: '#6B7280' }}
          tickLine={false}
          axisLine={{ stroke: '#D1D5DB' }}
        />
        <YAxis
          tick={{ fontSize: 14, fill: '#6B7280' }}
          tickLine={false}
          axisLine={{ stroke: '#D1D5DB' }}
          domain={yAxisDomain}
        />
        <Tooltip
          contentStyle={{ borderRadius: 8, borderColor: '#E5E7EB', backgroundColor: '#ffffff', padding: '6px 10px', boxShadow: '0 2px 6px rgba(0,0,0,0.08)' }}
          content={({ active, payload, label, ...rest }) => {
            if (!active || label == null) return null
            const payloadByKey = new Map(
              (payload ?? [])
                .filter((p) => !String(p.dataKey ?? '').startsWith('__'))
                .map((p) => [String(p.dataKey ?? p.name ?? ''), p])
            )
            const rowIndex = chartData.findIndex((row) => String(row.category) === String(label))
            const items =
              rowIndex >= 0
                ? chart.series.map((serie, i) => {
                    const p = payloadByKey.get(serie.name)
                    const value = p?.value != null ? p.value : chartData[rowIndex]?.[serie.name]
                    const name = serie.name
                    const color = palette[i % palette.length]
                    const numericValue = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : null
                    const display = typeof numericValue === 'number' && Number.isFinite(numericValue) ? `${Math.round(numericValue)}%` : '–'
                    return { name, display, color }
                  })
                : Array.from(payloadByKey.values()).map((p) => {
                    const value = p.value
                    const name = String(p.name ?? p.dataKey ?? '')
                    const numericValue = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : null
                    const display = typeof numericValue === 'number' && Number.isFinite(numericValue) ? `${Math.round(numericValue)}%` : '–'
                    return { name, display, color: p.color }
                  })
            if (items.length === 0) return null
            return (
              <div className="recharts-default-tooltip" style={{ ...rest.contentStyle, backgroundColor: '#ffffff', padding: '6px 10px', borderRadius: 8, border: '1px solid #E5E7EB', boxShadow: '0 2px 6px rgba(0,0,0,0.08)' }}>
                <p className="recharts-tooltip-label" style={{ margin: '0 0 4px 0', fontSize: 13, fontWeight: 600 }}>{typeof rest.labelFormatter === 'function' ? (rest.labelFormatter as (label: unknown) => string)(label) : `År ${label}`}</p>
                <ul className="recharts-tooltip-item-list" style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                  {items.map((item, i) => (
                    <li key={i} className="recharts-tooltip-item" style={{ color: item.color, margin: 0, padding: '1px 0', fontSize: 13 }}>
                      <span className="recharts-tooltip-item-name">{item.name}</span>
                      <span className="recharts-tooltip-item-separator">: </span>
                      <span className="recharts-tooltip-item-value">{item.display}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          }}
          labelFormatter={(label) => `År ${label}`}
        />
        {chart.series.map((serie, index) => {
          const color = palette[index % palette.length]
          const values = chartRows.map((row) => row[serie.name]) as (number | string | null)[]
          const { runs, gaps } = getSegments(values)
          let lastValidIndex = -1
          for (let i = chartRows.length - 1; i >= 0; i--) {
            const value = chartRows[i][serie.name]
            if (value !== null && value !== undefined && !isNaN(Number(value))) {
              lastValidIndex = i
              break
            }
          }
          const lastRunIndex = runs.findIndex((r) => r.start <= lastValidIndex && lastValidIndex <= r.end)

          const labelContent = ({ x, y, value, index: pointIndex }: any) => {
            if (pointIndex !== lastValidIndex || lastValidIndex < 0) return null
            if (value === null || value === undefined || isNaN(Number(value))) return null
            lastPointsRef.current[index] = { x, y, value: Number(value), name: serie.name, color }
            return null
          }

          return (
            <>
              <Line
                key={`${serie.name}-tooltip`}
                type="linear"
                dataKey={serie.name}
                stroke={color}
                strokeOpacity={0}
                strokeWidth={2}
                dot={false}
                activeDot={false}
                connectNulls={true}
                name={serie.name}
                isAnimationActive={false}
              />
              {runs.map((_run, ri) => {
                const runKey = `__run_${serie.name}_${ri}`
                const isLastRun = lastRunIndex >= 0 && ri === lastRunIndex
                return (
                  <Line
                    key={`${serie.name}-run-${ri}`}
                    type="linear"
                    dataKey={runKey}
                    stroke={color}
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: color, strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6, fill: color, strokeWidth: 2, stroke: '#fff' }}
                    connectNulls={true}
                    isAnimationActive={true}
                    animationDuration={600}
                  >
                    {isLastRun ? <LabelList dataKey={runKey} content={labelContent} /> : null}
                  </Line>
                )
              })}
              {gaps.map((_gap, gi) => {
                const gapKey = `__gap_${serie.name}_${gi}`
                return (
                  <Line
                    key={`${serie.name}-gap-${gi}`}
                    type="linear"
                    dataKey={gapKey}
                    stroke={color}
                    strokeWidth={2.5}
                    strokeDasharray="6 4"
                    dot={false}
                    activeDot={false}
                    connectNulls={true}
                    isAnimationActive={true}
                    animationDuration={600}
                  />
                )
              })}
            </>
          )
        })}
        <Customized component={renderLeaderLabels} />
      </LineChart>
    </ResponsiveContainer>
  )
}

/** Wraps the chart and measures width so we can use responsive margins (smaller right margin on narrow screens). */
function ChartWrap({ children }: { children: (width: number) => ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(400)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(() => setWidth(el.offsetWidth))
    ro.observe(el)
    setWidth(el.offsetWidth)
    return () => ro.disconnect()
  }, [])
  return (
    <div ref={ref} className="chart-card__chart-wrap">
      {children(width)}
    </div>
  )
}

const formatChartData = (chart?: ChartDefinition) => {
  if (!chart) return []
  return chart.categories.map((category, idx) => {
    const point: Record<string, string | number | null> = {
      category: category ?? '',
    }
    chart.series.forEach((serie) => {
      point[serie.name] = serie.values[idx] ?? null
    })
    return point
  })
}

const getYearRange = (indicator: Indicator): string | null => {
  // Try to get years from chart categories
  if (indicator.charts && indicator.charts.length > 0) {
    const firstChart = indicator.charts[0]
    if (firstChart.categories && firstChart.categories.length > 0) {
      const years = firstChart.categories
        .map(cat => {
          if (typeof cat === 'number') return cat
          if (typeof cat === 'string') {
            const num = parseInt(cat, 10)
            if (!isNaN(num) && num > 1900 && num < 2100) return num
          }
          return null
        })
        .filter((year): year is number => year !== null)
      
      if (years.length > 0) {
        const firstYear = Math.min(...years)
        const lastYear = Math.max(...years)
        return `Den Nationella SOM-undersökningen ${firstYear}-${lastYear}`
      }
    }
  }
  
  // Try to get years from table data (first column after header)
  if (indicator.table && indicator.table.length > 1) {
    const years: number[] = []
    for (let i = 1; i < indicator.table.length; i++) {
      const firstCell = indicator.table[i][0]
      if (firstCell) {
        const year = typeof firstCell === 'number' 
          ? firstCell 
          : parseInt(String(firstCell), 10)
        if (!isNaN(year) && year > 1900 && year < 2100) {
          years.push(year)
        }
      }
    }
    if (years.length > 0) {
      const firstYear = Math.min(...years)
      const lastYear = Math.max(...years)
      return `Den Nationella SOM-undersökningen ${firstYear}-${lastYear}`
    }
  }
  
  return null
}


function App() {
  const [report, setReport] = useState<ReportData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedSection, setSelectedSection] = useState<string | null>(null)
  const [selectedIndicator, setSelectedIndicator] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const contentRef = useRef<HTMLElement>(null)
  const activeIndicatorRef = useRef<HTMLLIElement>(null)
  const chartExportRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const handleExportChart = (chartId: string, title?: string) => {
    const el = chartExportRefs.current[chartId]
    if (!el) return
    toPng(el, { pixelRatio: 2, backgroundColor: '#ffffff' })
      .then((dataUrl) => {
        const a = document.createElement('a')
        a.href = dataUrl
        a.download = title ? `diagram-${title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.png` : `diagram-${chartId}.png`
        a.click()
      })
      .catch((err) => console.error('Export failed:', err))
  }

  useEffect(() => {
    // Use import.meta.env.BASE_URL to handle the base path correctly
    const baseUrl = import.meta.env.BASE_URL || '/'
    // Add cache-busting query parameter to force reload of updated data
    const dataUrl = `${baseUrl}data/report-data.json?v=${Date.now()}`.replace(/\/+/g, '/') // Remove duplicate slashes
    
    fetch(dataUrl)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Kunde inte läsa report-data.json (${res.status} ${res.statusText})`)
        }
        return res.json()
      })
      .then((payload: ReportData) => {
        setReport(payload)
        const basePath = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')
        const pathname = window.location.pathname
        const indicatorSlugFromPath = pathname.slice(basePath.length).replace(/^\//, '').split('/')[0]?.trim() || ''
        let sectionForIndicator: (typeof payload.sections)[0] | null = null
        let indicatorFromPath: (typeof payload.sections)[0]['indicators'][0] | null = null
        if (indicatorSlugFromPath) {
          for (const section of payload.sections) {
            const ind = section.indicators.find((i) => i.slug === indicatorSlugFromPath)
            if (ind) {
              sectionForIndicator = section
              indicatorFromPath = ind
              break
            }
          }
        }
        if (sectionForIndicator && indicatorFromPath) {
          setSelectedSection(sectionForIndicator.slug)
          setSelectedIndicator(indicatorFromPath.slug)
        } else {
          setSelectedSection(null)
          setSelectedIndicator(null)
        }
      })
      .catch((err: Error) => {
        console.error('Error loading report data:', err)
        console.error('Attempted URL:', dataUrl)
        setError('Kunde inte ladda rapportdatan. Kontrollera att exporten har körts.')
      })
  }, [])

  const sections = report?.sections ?? []

  const activeSection = sections.find((section) => section.slug === selectedSection) ?? sections[0]
  const activeIndicator =
    selectedIndicator != null
      ? (activeSection?.indicators.find((indicator) => indicator.slug === selectedIndicator) ?? activeSection?.indicators[0])
      : null

  const showSidebar = !!activeIndicator

  useEffect(() => {
    if (activeIndicator && !selectedIndicator) {
      setSelectedIndicator(activeIndicator.slug)
    }
    if (activeIndicator && activeSection && !selectedSection) {
      setSelectedSection(activeSection.slug)
    }
  }, [activeIndicator, activeSection, selectedIndicator, selectedSection])

  // Scroll to top when indicator changes
  useEffect(() => {
    if (contentRef.current && selectedIndicator) {
      contentRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [selectedIndicator])

  // Scroll active indicator into view in sidebar
  useEffect(() => {
    if (activeIndicatorRef.current) {
      activeIndicatorRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [selectedIndicator])

  // Collapsible sidebar sections (set of section slugs that are collapsed)
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set())
  const toggleSection = (sectionSlug: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev)
      if (next.has(sectionSlug)) next.delete(sectionSlug)
      else next.add(sectionSlug)
      return next
    })
  }

  // Filter indicators by search
  const filteredSections = sections.map((section) => {
    if (!searchQuery.trim()) return section
    const query = searchQuery.toLowerCase()
    const filtered = section.indicators.filter(
      (ind) => ind.title.toLowerCase().includes(query) || section.title.toLowerCase().includes(query)
    )
    return { ...section, indicators: filtered }
  }).filter((section) => section.indicators.length > 0)

  const basePath = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')

  const handleIndicatorClick = (sectionSlug: string, indicatorSlug: string) => {
    setSelectedSection(sectionSlug)
    setSelectedIndicator(indicatorSlug)
    setIsMobileMenuOpen(false)
    const newPath = indicatorSlug ? `${basePath}/${indicatorSlug}` : basePath
    window.history.replaceState({}, '', newPath)
  }

  useEffect(() => {
    const onPopState = () => {
      if (!report) return
      const pathname = window.location.pathname
      const indicatorSlugFromPath = pathname.slice(basePath.length).replace(/^\//, '').split('/')[0]?.trim() || ''
      if (!indicatorSlugFromPath) {
        setSelectedSection(null)
        setSelectedIndicator(null)
        return
      }
      for (const section of report.sections) {
        const ind = section.indicators.find((i) => i.slug === indicatorSlugFromPath)
        if (ind) {
          setSelectedSection(section.slug)
          setSelectedIndicator(ind.slug)
          return
        }
      }
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [report, basePath])

  return (
    <div className={`app-shell ${!showSidebar ? 'app-shell--no-sidebar' : ''}`}>
      <header className="top-header">
        <img 
          src={`${import.meta.env.BASE_URL}SOM_Huvud_CMYK_GUright.jpg`} 
          alt="SOM-institutet och Göteborgs Universitet" 
          className="header-logo-combined" 
          onError={(e) => {
            console.error('Header logo not found')
            e.currentTarget.style.display = 'none'
          }} 
          onLoad={() => {
            console.log('Header logo loaded successfully')
          }}
        />
      </header>
      {showSidebar && isMobileMenuOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
      {showSidebar && (
        <button
          className="mobile-menu-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      )}
      {showSidebar && (
      <aside className={`sidebar ${isMobileMenuOpen ? 'is-open' : ''}`}>
        <div className="sidebar__header">
          <button
            type="button"
            className="sidebar__title-link"
            onClick={() => {
              setSelectedSection(null)
              setSelectedIndicator(null)
              window.history.replaceState({}, '', basePath)
            }}
          >
            <h1>Svenska Trender 1986–2025</h1>
          </button>
          {report && (
            <p className="sidebar__meta">
              Uppdaterad {new Date(report.generated_at).toLocaleDateString('sv-SE')}
            </p>
          )}
        </div>
        <div className="sidebar__search">
          <input
            type="text"
            placeholder="Sök fråga..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        <nav className="sidebar__nav">
          {filteredSections.length === 0 && searchQuery ? (
            <p className="no-results">Inga resultat hittades</p>
          ) : (
            filteredSections.map((section) => {
              const isCollapsed = collapsedSections.has(section.slug)
              return (
              <div
                key={section.slug}
                className={`nav-section ${isCollapsed ? 'is-collapsed' : ''}`}
              >
                <button
                  type="button"
                  className={`nav-section__title ${
                    section.slug === activeSection?.slug ? 'is-active' : ''
                  }`}
                  onClick={() => toggleSection(section.slug)}
                  aria-expanded={!isCollapsed}
                >
                  <span className="nav-section__icon">
                    <SectionIcon slug={section.slug} title={section.title} />
                  </span>
                  <span className="nav-section__label">
                    {section.title === "POL SAKFRÅGOR" ? "POLITISKA SAKFRÅGOR" : section.title}
                  </span>
                  <span className="nav-section__chevron" aria-hidden>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </span>
                </button>
                <ul className="nav-section__list">
                  {section.indicators.map((indicator) => (
                    <li
                      key={indicator.slug}
                      ref={indicator.slug === activeIndicator?.slug ? activeIndicatorRef : null}
                    >
                      <button
                        className={`nav-link ${
                          indicator.slug === activeIndicator?.slug ? 'is-active' : ''
                        }`}
                        onClick={() => handleIndicatorClick(section.slug, indicator.slug)}
                      >
                        {(() => {
                          const titleLower = indicator.title.toLowerCase()
                          // Partiledarpopularitet: extract party name from rubrik
                          if (titleLower.includes('partiledarpopularitet') && indicator.rubrik) {
                            const match = indicator.rubrik.match(/\(([^)]+)\)/)
                            if (match) {
                              const partyName = match[1]
                              return `Partiledarpopularitet: ${partyName}`
                            }
                          }
                          // Vad svenskar oroar sig för: change to "Oro" with underrubrik
                          if (titleLower.includes('vad svenskar oroar sig') && indicator.underrubrik) {
                            return `Oro: ${indicator.underrubrik}`
                          }
                          // Fritidsaktiviteter: add underrubrik
                          if (titleLower.includes('fritidsaktiviteter') && indicator.underrubrik) {
                            return `${indicator.title}: ${indicator.underrubrik}`
                          }
                          // Förtroende: add underrubrik
                          if (titleLower.includes('förtroende') && indicator.underrubrik) {
                            return `${indicator.title}: ${indicator.underrubrik}`
                          }
                          return indicator.title
                        })()}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )
            })
          )}
        </nav>
      </aside>
      )}
      <main className={`content ${report && !activeIndicator ? 'content--landing' : ''}`} ref={contentRef}>
        {error && (
          <div className="state-card error">
            <p>{error}</p>
          </div>
        )}
        {!report && !error && (
          <div className="state-card">
            <p>Laddar rapportdata…</p>
          </div>
        )}
        {report && !activeIndicator && (
          <div className="landing">
            <header className="landing__header">
              <h1 className="landing__title">Svenska Trender 1986–2025</h1>
              <p className="landing__meta">Välj en kategori och ämne nedan.</p>
            </header>
            <nav className="landing-toc" aria-label="Innehåll">
              {sections.map((section) => (
                <section key={section.slug} className="landing-toc__section">
                  <h2 className="landing-toc__section-title">
                    <span className="landing-toc__section-icon" aria-hidden>
                      <SectionIcon slug={section.slug} title={section.title} />
                    </span>
                    <span className="landing-toc__section-label">
                      {section.title === "POL SAKFRÅGOR" ? "POLITISKA SAKFRÅGOR" : section.title}
                    </span>
                  </h2>
                  <ul className="landing-toc__list">
                    {section.indicators.map((indicator) => {
                      const titleLower = indicator.title.toLowerCase()
                      let displayTitle = indicator.title
                      if (titleLower.includes('partiledarpopularitet') && indicator.rubrik) {
                        const match = indicator.rubrik.match(/\(([^)]+)\)/)
                        if (match) displayTitle = `Partiledarpopularitet: ${match[1]}`
                      } else if (titleLower.includes('vad svenskar oroar sig') && indicator.underrubrik) {
                        displayTitle = `Oro: ${indicator.underrubrik}`
                      } else if (titleLower.includes('fritidsaktiviteter') && indicator.underrubrik) {
                        displayTitle = `${indicator.title}: ${indicator.underrubrik}`
                      } else if (titleLower.includes('förtroende') && indicator.underrubrik) {
                        displayTitle = `${indicator.title}: ${indicator.underrubrik}`
                      }
                      if (displayTitle.includes("POL SAKFRÅGOR")) {
                        displayTitle = displayTitle.replace(/POL SAKFRÅGOR/g, "POLITISKA SAKFRÅGOR")
                      }
                      return (
                        <li key={indicator.slug} className="landing-toc__item">
                          <button
                            type="button"
                            className="landing-toc__link"
                            onClick={() => handleIndicatorClick(section.slug, indicator.slug)}
                          >
                            {displayTitle}
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </section>
              ))}
            </nav>
          </div>
        )}
        {report && activeIndicator && (
          <>
            <header className="content__header">
              <p className="content__eyebrow">{activeSection?.title === "POL SAKFRÅGOR" ? "POLITISKA SAKFRÅGOR" : activeSection?.title}</p>
              <h2>
                {(() => {
                  const titleLower = activeIndicator.title.toLowerCase()
                  // Partiledarpopularitet: extract party name from rubrik
                  if (titleLower.includes('partiledarpopularitet') && activeIndicator.rubrik) {
                    const match = activeIndicator.rubrik.match(/\(([^)]+)\)/)
                    if (match) {
                      const partyName = match[1]
                      return `Partiledarpopularitet: ${partyName}`
                    }
                  }
                  // Vad svenskar oroar sig för: change to "Oro" with underrubrik
                  if (titleLower.includes('vad svenskar oroar sig') && activeIndicator.underrubrik) {
                    return `Oro: ${activeIndicator.underrubrik}`
                  }
                  // Fritidsaktiviteter: add underrubrik
                  if (titleLower.includes('fritidsaktiviteter') && activeIndicator.underrubrik) {
                    return `${activeIndicator.title}: ${activeIndicator.underrubrik}`
                  }
                  // Förtroende: add underrubrik
                  if (titleLower.includes('förtroende') && activeIndicator.underrubrik) {
                    return `${activeIndicator.title}: ${activeIndicator.underrubrik}`
                  }
                  // Partisympati: add (procent) to title
                  if (titleLower.includes('partisympati')) {
                    return `${activeIndicator.title} (procent)`
                  }
                  let displayTitle = activeIndicator.title
                  // Replace POL SAKFRÅGOR with POLITISKA SAKFRÅGOR in indicator titles
                  if (displayTitle.includes("POL SAKFRÅGOR")) {
                    displayTitle = displayTitle.replace(/POL SAKFRÅGOR/g, "POLITISKA SAKFRÅGOR")
                  }
                  return displayTitle
                })()}
              </h2>
            </header>
            {activeIndicator.typ && activeIndicator.typ.toLowerCase().trim() === "tabell" && activeIndicator.table && (
              <section className="chart-card">
                <div className="table-container">
                  <table className="data-table">
                    <tbody>
                      {activeIndicator.table.map((row, rowIdx) => {
                        const isOroSamtliga = activeIndicator.underrubrik && 
                                             activeIndicator.underrubrik.toLowerCase().trim() === "samtliga områden"
                        return (
                          <tr key={rowIdx}>
                            {row.map((cell, cellIdx) => {
                              const isHeader = rowIdx === 0
                              const CellTag = isHeader ? 'th' : 'td'
                              let displayValue = cell ?? ''
                              
                              // For "Oro: Samtliga områden" and "Partisympati" tables, round numeric values (skip header and year column)
                              const isPartisympati = activeIndicator.title.toLowerCase().includes('partisympati')
                              if ((isOroSamtliga || isPartisympati) && !isHeader && cellIdx > 0 && cell) {
                                const numValue = typeof cell === 'string' ? parseFloat(cell) : (typeof cell === 'number' ? cell : null)
                                if (numValue !== null && !isNaN(numValue)) {
                                  displayValue = Math.round(numValue).toString()
                                }
                              }
                              
                              return (
                                <CellTag key={cellIdx} className={isHeader ? 'table-header' : ''}>
                                  {displayValue}
                                </CellTag>
                              )
                            })}
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                  {(activeIndicator.fraga || activeIndicator.kommentar) && (
                    <div className="chart-card__metadata">
                      <div className="metadata-layout">
                        {activeIndicator.kommentar && (
                          <div className="metadata-box metadata-box--left">
                            <h4 className="metadata-box__label">Kommentar</h4>
                            <p className="metadata-box__content">{activeIndicator.kommentar}</p>
                          </div>
                        )}
                        <div className="metadata-box metadata-box--right">
                          {activeIndicator.fraga && (
                            <div className="metadata-item">
                              <h4 className="metadata-box__label">Frågeformulering</h4>
                              <p className="metadata-box__content">{activeIndicator.fraga}</p>
                            </div>
                          )}
                          {(() => {
                            const kallaText = getYearRange(activeIndicator)
                            return kallaText ? (
                              <div className="metadata-item">
                                <h4 className="metadata-box__label">Källa</h4>
                                <p className="metadata-box__content">{kallaText}</p>
                              </div>
                            ) : null
                          })()}
                        </div>
                      </div>
                    </div>
                  )}
              </section>
            )}
            {activeIndicator.charts.map((chart) => {
              let chartRows = formatChartData(chart)
              // For "Oro: Samtliga områden", round all values to remove decimals
              const isOroSamtliga = activeIndicator.underrubrik && 
                                   activeIndicator.underrubrik.toLowerCase().trim() === "samtliga områden"
              // For "Partisympati", round all values to remove decimals
              const isPartisympati = activeIndicator.title.toLowerCase().includes('partisympati')
              if (isOroSamtliga || isPartisympati) {
                chartRows = chartRows.map((row) => {
                  const roundedRow: any = { category: row.category }
                  Object.keys(row).forEach((key) => {
                    if (key !== 'category') {
                      const value = row[key]
                      if (value !== null && value !== undefined) {
                        if (typeof value === 'number' && !isNaN(value)) {
                          roundedRow[key] = Math.round(value)
                        } else if (typeof value === 'string') {
                          const numValue = parseFloat(value)
                          if (!isNaN(numValue)) {
                            roundedRow[key] = Math.round(numValue)
                          } else {
                            roundedRow[key] = value
                          }
                        } else {
                          roundedRow[key] = value
                        }
                      } else {
                        roundedRow[key] = value
                      }
                    }
                  })
                  return roundedRow
                })
              }
              // Build extended chart data with segment keys for solid/dashed lines (runs = solid, gaps = dashed)
              type Row = Record<string, string | number | null>
              const extendedRows: Row[] = chartRows.map((row) => ({ ...row }))
              chart.series.forEach((serie) => {
                const values = chartRows.map((row) => row[serie.name]) as (number | string | null)[]
                const { runs, gaps } = getSegments(values)
                runs.forEach((run, ri) => {
                  const key = `__run_${serie.name}_${ri}`
                  extendedRows.forEach((row, rowIndex) => {
                    ;(row as Row)[key] = rowIndex >= run.start && rowIndex <= run.end ? chartRows[rowIndex][serie.name] : null
                  })
                })
                gaps.forEach((gap, gi) => {
                  const key = `__gap_${serie.name}_${gi}`
                  extendedRows.forEach((row, rowIndex) => {
                    ;(row as Row)[key] = rowIndex === gap.from ? chartRows[gap.from][serie.name] : rowIndex === gap.to ? chartRows[gap.to][serie.name] : null
                  })
                })
              })
              const chartData = extendedRows

              // Check if any values are negative
              const hasNegativeValues = chartRows.some((row) =>
                chart.series.some((serie) => {
                  const value = row[serie.name]
                  return typeof value === 'number' && value < 0
                })
              )
              // Set domain: [-50, 50] if negative values exist, otherwise [0, 100]
              const yAxisDomain = hasNegativeValues ? [-50, 50] : [0, 100]
              
              return (
                <section key={chart.id} className="chart-card">
                  <div className="chart-card__body">
                    <div
                      ref={(el) => {
                        if (el) chartExportRefs.current[chart.id] = el
                        else delete chartExportRefs.current[chart.id]
                      }}
                      className="chart-export-wrap"
                    >
                      <ChartWrap>
                        {(chartWidth) => {
                          const marginRight = chartWidth < 360 ? 60 : chartWidth < 420 ? 75 : chartWidth < 520 ? 95 : chartWidth < 640 ? 120 : 180
                          const marginLeft = chartWidth < 400 ? 6 : 12
                          return (
                            <LineChartWithLeaderLabels
                              chart={chart}
                              chartData={chartData}
                              chartRows={chartRows}
                              activeIndicator={activeIndicator}
                              yAxisDomain={yAxisDomain as [number, number]}
                              marginRight={marginRight}
                              marginLeft={marginLeft}
                            />
                          )
                        }}
                      </ChartWrap>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleExportChart(chart.id, activeIndicator?.title)}
                      className="chart-export-btn"
                    >
                      Ladda ner diagram
                    </button>
                  </div>
                  {(activeIndicator.fraga || activeIndicator.kommentar) && (
                    <div className="chart-card__metadata">
                      <div className="metadata-layout">
                        {activeIndicator.kommentar && (
                          <div className="metadata-box metadata-box--left">
                            <h4 className="metadata-box__label">Kommentar</h4>
                            <p className="metadata-box__content">{activeIndicator.kommentar}</p>
                          </div>
                        )}
                        <div className="metadata-box metadata-box--right">
                          {activeIndicator.fraga && (
                            <div className="metadata-item">
                              <h4 className="metadata-box__label">Frågeformulering</h4>
                              <p className="metadata-box__content">{activeIndicator.fraga}</p>
                            </div>
                          )}
                          {(() => {
                            const kallaText = getYearRange(activeIndicator)
                            return kallaText ? (
                              <div className="metadata-item">
                                <h4 className="metadata-box__label">Källa</h4>
                                <p className="metadata-box__content">{kallaText}</p>
                              </div>
                            ) : null
                          })()}
                        </div>
                      </div>
                    </div>
                  )}
                </section>
              )
            })}
          </>
        )}
      </main>
      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-column footer-logos">
            <img src={`${import.meta.env.BASE_URL}footer.png`} alt="SOM-institutet och Göteborgs Universitet" className="footer-logo-image" />
          </div>
          <div className="footer-column">
            <h3 className="footer-heading">Kontakt</h3>
            <p>Telefon</p>
            <p className="footer-link">031 786 3300</p>
            <p>E-post</p>
            <p className="footer-link">info@som.gu.se</p>
            <h3 className="footer-heading" style={{ marginTop: '1.5rem' }}>SOCIALA MEDIER</h3>
            <div className="footer-social">
              <a href="https://twitter.com/sominstitutet" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)" className="social-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="https://www.facebook.com/sominstitutet" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="social-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="https://www.linkedin.com/company/som-institutet" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="social-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>
          <div className="footer-column">
            <h3 className="footer-heading">Besöksadress</h3>
            <p>Seminariegatan 1B</p>
            <p>413 13 Göteborg</p>
            <h3 className="footer-heading" style={{ marginTop: '1.5rem' }}>Postadress</h3>
            <p>SOM-institutet</p>
            <p>Göteborgs universitet</p>
            <p>Box 710</p>
            <p>405 30 Göteborg</p>
          </div>
          <div className="footer-column">
            <h3 className="footer-heading">Genvägar</h3>
            <a href="https://som-institutet.se" target="_blank" rel="noopener noreferrer" className="footer-link">SOM-institutets startsida</a>
            <a href="https://www.gu.se/som-institutet/resultat-och-publikationer" target="_blank" rel="noopener noreferrer" className="footer-link">Resultat och publikationer</a>
            <a href="https://www.gu.se" target="_blank" rel="noopener noreferrer" className="footer-link">Göteborgs universitets startsida</a>
            <a href="https://som-institutet.se/dataanalys" target="_blank" rel="noopener noreferrer" className="footer-link">Arbeta med data från SOM-undersökningen</a>
            <a href="https://som-institutet.se/publikationssok" target="_blank" rel="noopener noreferrer" className="footer-link">Sök bland SOM-institutets publikationer</a>
            <a href="http://www.snd.gu.se/" target="_blank" rel="noopener noreferrer" className="footer-link">Beställ dataset från SOM-undersökningen</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App

