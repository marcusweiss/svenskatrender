import { useEffect, useState, useRef } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
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
          <h1>Svenska Trender 1986–2025</h1>
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
                  {section.title === "POL SAKFRÅGOR" ? "POLITISKA SAKFRÅGOR" : section.title}
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
                    <ResponsiveContainer width="100%" height={480}>
                      <LineChart data={chartRows} margin={{ top: 16, right: 180, left: 12, bottom: 16 }}>
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
                          
                          return (
                            <Line
                              key={serie.name}
                              type="linear"
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
                                      // Simple small offset based on index to prevent exact overlap
                                      // This keeps labels close to their data points
                                      const verticalOffset = (index - (chart.series.length - 1) / 2) * 3
                                      
                                      // Format value - no % for partiledarpopularitet
                                      const displayValue = Math.round(Number(value))
                                      const percentageText = isPartiledare ? `${displayValue}` : `${displayValue}%`
                                      // Add series name (label) to the value
                                      const fullLabel = `${percentageText} ${serie.name}`
                                      
                                      // Split long labels into two lines if needed (max 28 chars per line)
                                      const maxLength = 28
                                      if (fullLabel.length > maxLength) {
                                        const spaceIndex = fullLabel.lastIndexOf(' ', maxLength)
                                        if (spaceIndex > 0 && spaceIndex < fullLabel.length - 1) {
                                          const line1 = fullLabel.substring(0, spaceIndex)
                                          const line2 = fullLabel.substring(spaceIndex + 1)
                                          
                                          return (
                                            <g>
                                              <text
                                                x={x + 8}
                                                y={y + verticalOffset}
                                                fill={color}
                                                fontSize={14}
                                                fontWeight={500}
                                                textAnchor="start"
                                              >
                                                {line1}
                                              </text>
                                              <text
                                                x={x + 8}
                                                y={y + verticalOffset + 14}
                                                fill={color}
                                                fontSize={14}
                                                fontWeight={500}
                                                textAnchor="start"
                                              >
                                                {line2}
                                              </text>
                                            </g>
                                          )
                                        }
                                      }
                                      
                                      return (
                                        <text
                                          x={x + 8}
                                          y={y + verticalOffset}
                                          fill={color}
                                          fontSize={14}
                                          fontWeight={500}
                                          textAnchor="start"
                                        >
                                          {fullLabel}
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

