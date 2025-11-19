import { useEffect, useState, useRef } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  LabelList,
} from 'recharts'
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent'
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


function App() {
  const [report, setReport] = useState<ReportData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedSection, setSelectedSection] = useState<string | null>(null)
  const [selectedIndicator, setSelectedIndicator] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const contentRef = useRef<HTMLElement>(null)
  const activeIndicatorRef = useRef<HTMLLIElement>(null)

  useEffect(() => {
    // Use import.meta.env.BASE_URL to handle the base path correctly
    const baseUrl = import.meta.env.BASE_URL || '/'
    const dataUrl = `${baseUrl}data/report-data.json`.replace(/\/+/g, '/') // Remove duplicate slashes
    
    fetch(dataUrl)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Kunde inte läsa report-data.json (${res.status} ${res.statusText})`)
        }
        return res.json()
      })
      .then((payload: ReportData) => {
        setReport(payload)
        const firstSection = payload.sections[0]
        const firstIndicator = firstSection?.indicators[0]
        setSelectedSection(firstSection?.slug ?? null)
        setSelectedIndicator(firstIndicator?.slug ?? null)
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
    activeSection?.indicators.find((indicator) => indicator.slug === selectedIndicator) ??
    activeSection?.indicators[0]

  useEffect(() => {
    if (activeSection && !selectedSection) {
      setSelectedSection(activeSection.slug)
    }
    if (activeIndicator && !selectedIndicator) {
      setSelectedIndicator(activeIndicator.slug)
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

  // Filter indicators by search
  const filteredSections = sections.map((section) => {
    if (!searchQuery.trim()) return section
    const query = searchQuery.toLowerCase()
    const filtered = section.indicators.filter(
      (ind) => ind.title.toLowerCase().includes(query) || section.title.toLowerCase().includes(query)
    )
    return { ...section, indicators: filtered }
  }).filter((section) => section.indicators.length > 0)

  const handleIndicatorClick = (sectionSlug: string, indicatorSlug: string) => {
    setSelectedSection(sectionSlug)
    setSelectedIndicator(indicatorSlug)
    setIsMobileMenuOpen(false)
  }

  return (
    <div className="app-shell">
      <header className="top-header">
        <img 
          src="/SOM_Huvud_CMYK_GUright.jpg" 
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
      {isMobileMenuOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
      <button
        className="mobile-menu-toggle"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
      <aside className={`sidebar ${isMobileMenuOpen ? 'is-open' : ''}`}>
        <div className="sidebar__header">
          <p className="sidebar__eyebrow">Svenska Trender 1986–2024</p>
          <h1>Samhällsrapport</h1>
          {report && (
            <p className="sidebar__meta">
              Uppdaterad {new Date(report.generated_at).toLocaleDateString('sv-SE')}
            </p>
          )}
        </div>
        <div className="sidebar__search">
          <input
            type="text"
            placeholder="Sök indikator..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        <nav className="sidebar__nav">
          {filteredSections.length === 0 && searchQuery ? (
            <p className="no-results">Inga resultat hittades</p>
          ) : (
            filteredSections.map((section) => (
              <div key={section.slug} className="nav-section">
                <button
                  className={`nav-section__title ${
                    section.slug === activeSection?.slug ? 'is-active' : ''
                  }`}
                  onClick={() => {
                    setSelectedSection(section.slug)
                    setSelectedIndicator(section.indicators[0]?.slug ?? null)
                  }}
                >
                  {section.title}
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
            ))
          )}
        </nav>
      </aside>
      <main className="content" ref={contentRef}>
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
        {report && activeIndicator && (
          <>
            <header className="content__header">
              <p className="content__eyebrow">{activeSection?.title}</p>
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
                  return activeIndicator.title
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
                              
                              // For "Oro: Samtliga områden" table, round numeric values (skip header and year column)
                              if (isOroSamtliga && !isHeader && cellIdx > 0 && cell) {
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
                    {activeIndicator.fraga && (
                      <div className="metadata-box">
                        <h4 className="metadata-box__label">Fråga</h4>
                        <p className="metadata-box__content">{activeIndicator.fraga}</p>
                      </div>
                    )}
                    {activeIndicator.kommentar && (
                      <div className="metadata-box">
                        <h4 className="metadata-box__label">Kommentar</h4>
                        <p className="metadata-box__content">{activeIndicator.kommentar}</p>
                      </div>
                    )}
                  </div>
                )}
              </section>
            )}
            {activeIndicator.charts.map((chart) => {
              let chartRows = formatChartData(chart)
              // For "Oro: Samtliga områden", round all values to remove decimals
              const isOroSamtliga = activeIndicator.underrubrik && 
                                   activeIndicator.underrubrik.toLowerCase().trim() === "samtliga områden"
              if (isOroSamtliga) {
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
                    <ResponsiveContainer width="100%" height={420}>
                      <LineChart data={chartRows} margin={{ top: 16, right: 80, left: 12, bottom: 8 }}>
                        <CartesianGrid stroke="#E5E7EB" vertical={false} />
                        <XAxis
                          dataKey="category"
                          tick={{ fontSize: 12, fill: '#6B7280' }}
                          tickLine={false}
                          axisLine={{ stroke: '#D1D5DB' }}
                        />
                        <YAxis
                          tick={{ fontSize: 12, fill: '#6B7280' }}
                          tickLine={false}
                          axisLine={{ stroke: '#D1D5DB' }}
                          domain={yAxisDomain}
                        />
                        <Tooltip
                          contentStyle={{ borderRadius: 12, borderColor: '#E5E7EB' }}
                          formatter={(value: ValueType, name: NameType) => {
                            const numericValue =
                              typeof value === 'number'
                                ? value
                                : typeof value === 'string'
                                  ? Number(value)
                                  : null
                            const label = typeof name === 'string' ? name : String(name ?? '')
                            const display =
                              typeof numericValue === 'number' && Number.isFinite(numericValue)
                                ? `${Math.round(numericValue)}%`
                                : '–'
                            return [display, label]
                          }}
                          labelFormatter={(label) => `År ${label}`}
                        />
                        <Legend 
                          wrapperStyle={{ paddingTop: 12 }} 
                          formatter={(value: string) => {
                            // For Partiledarpopularitet, add underrubrik to each series name
                            const isPartiledare = activeIndicator.title.toLowerCase().includes('partiledarpopularitet')
                            if (isPartiledare && activeIndicator.underrubrik) {
                              return `${value}: ${activeIndicator.underrubrik}`
                            }
                            return value
                          }}
                        />
                        {chart.series.map((serie, index) => {
                          const color = palette[index % palette.length]
                          // Find the last valid data point index for this series
                          let lastValidIndex = -1
                          for (let i = chartRows.length - 1; i >= 0; i--) {
                            const value = chartRows[i][serie.name]
                            if (value !== null && value !== undefined && !isNaN(Number(value))) {
                              lastValidIndex = i
                              break
                            }
                          }
                          
                          // Check if this is partiledarpopularitet (no % sign)
                          const isPartiledare = activeIndicator.title.toLowerCase().includes('partiledarpopularitet')
                          
                          // Collect all last values to calculate vertical offsets and prevent overlap
                          const lastValues: number[] = []
                          chart.series.forEach((s, idx) => {
                            for (let i = chartRows.length - 1; i >= 0; i--) {
                              const val = chartRows[i][s.name]
                              if (val !== null && val !== undefined && !isNaN(Number(val))) {
                                lastValues[idx] = Number(val)
                                break
                              }
                            }
                          })
                          
                          return (
                            <Line
                              key={serie.name}
                              type="monotone"
                              dataKey={serie.name}
                              stroke={color}
                              strokeWidth={2.5}
                              dot={{ r: 4, fill: color, strokeWidth: 2, stroke: '#fff' }}
                              activeDot={{ r: 6, fill: color, strokeWidth: 2, stroke: '#fff' }}
                              isAnimationActive={true}
                              animationDuration={600}
                              connectNulls={true}
                            >
                              <LabelList
                                dataKey={serie.name}
                                content={({ x, y, value, index: pointIndex }: any) => {
                                  // Only show label for the last valid data point
                                  if (pointIndex === lastValidIndex && lastValidIndex >= 0) {
                                    if (value !== null && value !== undefined && !isNaN(Number(value))) {
                                      // Calculate vertical offset to prevent overlap
                                      // Use a small offset based on series index to naturally spread labels
                                      // This prevents exact overlap when lines are close together
                                      const verticalOffset = (index - (chart.series.length - 1) / 2) * 6
                                      
                                      // Format value - no % for partiledarpopularitet
                                      const displayValue = Math.round(Number(value))
                                      const labelText = isPartiledare ? `${displayValue}` : `${displayValue}%`
                                      
                                      return (
                                        <text
                                          x={x + 8}
                                          y={y + verticalOffset}
                                          fill={color}
                                          fontSize={12}
                                          fontWeight={500}
                                          textAnchor="start"
                                        >
                                          {labelText}
                                        </text>
                                      )
                                    }
                                  }
                                  return null
                                }}
                              />
                            </Line>
                          )
                        })}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  {(activeIndicator.fraga || activeIndicator.kommentar) && (
                    <div className="chart-card__metadata">
                      {activeIndicator.fraga && (
                        <div className="metadata-box">
                          <h4 className="metadata-box__label">Fråga</h4>
                          <p className="metadata-box__content">{activeIndicator.fraga}</p>
                        </div>
                      )}
                      {activeIndicator.kommentar && (
                        <div className="metadata-box">
                          <h4 className="metadata-box__label">Kommentar</h4>
                          <p className="metadata-box__content">{activeIndicator.kommentar}</p>
                        </div>
                      )}
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
            <img src="/footer.jpg" alt="SOM-institutet och Göteborgs Universitet" className="footer-logo-image" />
          </div>
          <div className="footer-column">
            <h3 className="footer-heading">Kontakt</h3>
            <p>Telefon</p>
            <p className="footer-link">031 786 3300</p>
            <p>E-post</p>
            <p className="footer-link">info@som.gu.se</p>
            <p>Sociala medier</p>
            <div className="footer-social">
              <a href="https://twitter.com/sominstitutet" target="_blank" rel="noopener noreferrer" aria-label="Twitter">X</a>
              <a href="https://www.facebook.com/sominstitutet" target="_blank" rel="noopener noreferrer" aria-label="Facebook">FB</a>
              <a href="https://www.linkedin.com/company/som-institutet" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">LI</a>
            </div>
          </div>
          <div className="footer-column">
            <h3 className="footer-heading">Besöksadress</h3>
            <p>Seminariegatan 1B</p>
            <p>413 13 Göteborg</p>
            <h3 className="footer-heading">Postadress</h3>
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

