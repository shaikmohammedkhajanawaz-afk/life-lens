import { useEffect, useMemo, useState } from 'react'
import {
  ArrowDownLeft, ArrowUpRight, BarChart3, Bell, CalendarDays, ChevronDown,
  ChevronRight, CircleDollarSign, Film, Gift, Headphones, Image, Laptop,
  LayoutDashboard, Lightbulb, Map, MapPin, Menu, MoreHorizontal, Play, Receipt,
  Search, Settings, ShoppingBag, Sparkles, Ticket, TrendingUp, Utensils, WalletCards, X, Zap,
} from 'lucide-react'
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { datasetCategories, receipts } from './data'
import { aggregateByPeriod, buildInsight, calculateCategoryTotals, calculateTotals, filterRecords, sortRecords } from './utils/calculations'
import { validateDateRange } from './utils/validation'

const legacyReceipts = [
  { id: 1, label: 'Music', title: 'Night Drive', merchant: 'Chromatics · Kill For Love', date: '2024-10-14', time: '23:48', category: 'Entertainment', amount: 12, flow: 'expense', color: '#7c68ed', icon: Headphones, chapter: 'After hours', location: 'Koregaon Park', note: 'The city looked different through the windshield.', tags: ['late nights', 'drive'], connected: [2, 3] },
  { id: 2, label: 'Place', title: 'Koregaon Park', merchant: 'Pune, Maharashtra', date: '2024-10-14', time: '00:16', category: 'Travel', amount: 0, flow: 'expense', color: '#39c6d8', icon: MapPin, chapter: 'After hours', location: 'Pune', note: 'A detour that turned into a very good idea.', tags: ['wander', 'pune'], connected: [1, 3, 4] },
  { id: 3, label: 'Photo', title: 'orange streetlight', merchant: 'IMG_4821.JPG · 2.8 MB', date: '2024-10-14', time: '00:34', category: 'Entertainment', amount: 0, flow: 'expense', color: '#f5a54a', icon: Image, chapter: 'After hours', location: 'Koregaon Park', note: 'Proof that ordinary nights can glow.', tags: ['night', 'found'], connected: [1, 2] },
  { id: 4, label: 'Purchase', title: 'Two masala chai', merchant: 'Irani Cafe', date: '2024-10-14', time: '00:51', category: 'Food & Dining', amount: 160, flow: 'expense', color: '#f5a54a', icon: Utensils, chapter: 'After hours', location: 'Pune', note: 'One for the road. One for the story.', tags: ['small joys'], connected: [2] },
  { id: 5, label: 'Search', title: 'how to start over', merchant: 'Google · 3 results saved', date: '2024-11-02', time: '02:07', category: 'Others', amount: 0, flow: 'expense', color: '#39c6d8', icon: Search, chapter: 'The in-between', location: 'Home', note: 'A question asked quietly is still a question.', tags: ['turning point'], connected: [6, 7] },
  { id: 6, label: 'Note', title: 'leave room for the unknown', merchant: 'Personal note · 18 words', date: '2024-11-02', time: '02:13', category: 'Others', amount: 0, flow: 'expense', color: '#a58bff', icon: Lightbulb, chapter: 'The in-between', location: 'Home', note: 'The sentence you wrote before falling asleep.', tags: ['becoming'], connected: [5, 7] },
  { id: 7, label: 'Message', title: '“come outside”', merchant: 'From Mira · 02:19 AM', date: '2024-11-02', time: '02:19', category: 'Others', amount: 0, flow: 'expense', color: '#39c6d8', icon: Zap, chapter: 'The in-between', location: 'Home', note: 'Some answers arrive as invitations.', tags: ['people', 'turning point'], connected: [5, 6, 8] },
  { id: 8, label: 'Place', title: 'Aundh hill', merchant: 'Pune, Maharashtra', date: '2024-11-02', time: '02:46', category: 'Travel', amount: 0, flow: 'expense', color: '#39c6d8', icon: MapPin, chapter: 'The in-between', location: 'Pune', note: 'The whole city, held at a distance.', tags: ['wander', 'pune'], connected: [7, 9] },
  { id: 9, label: 'Event', title: 'Sunrise Club', merchant: 'A small gathering · 12 people', date: '2024-11-02', time: '05:51', category: 'Entertainment', amount: 850, flow: 'expense', color: '#f5a54a', icon: Ticket, chapter: 'The in-between', location: 'Pune', note: 'The night did not end. It changed shape.', tags: ['people', 'new'], connected: [8, 10] },
  { id: 10, label: 'Film', title: 'Perfect Days', merchant: 'Watched on MUBI', date: '2024-12-18', time: '21:12', category: 'Entertainment', amount: 399, flow: 'expense', color: '#a58bff', icon: Film, chapter: 'Soft focus', location: 'Home', note: 'A reminder that a quiet life can still be full.', tags: ['slow', 'home'], connected: [11] },
  { id: 11, label: 'Purchase', title: 'one yellow lamp', merchant: 'The Wicker Store', date: '2024-12-20', time: '16:28', category: 'Shopping', amount: 2400, flow: 'expense', color: '#f5a54a', icon: ShoppingBag, chapter: 'Soft focus', location: 'Home', note: 'You made a corner feel like a beginning.', tags: ['home', 'new'], connected: [10, 12] },
  { id: 12, label: 'Photo', title: 'the reading corner', merchant: 'IMG_5102.JPG · 4.1 MB', date: '2024-12-31', time: '18:03', category: 'Housing', amount: 0, flow: 'expense', color: '#39c6d8', icon: Image, chapter: 'Soft focus', location: 'Home', note: 'Light, books, and nowhere else to be.', tags: ['home', 'slow'], connected: [11, 13] },
  { id: 13, label: 'Music', title: 'My Kind of Woman', merchant: 'Mac DeMarco · Salad Days', date: '2025-01-01', time: '00:01', category: 'Entertainment', amount: 149, flow: 'expense', color: '#7c68ed', icon: Headphones, chapter: 'Soft focus', location: 'Home', note: 'A new year, with the volume low.', tags: ['slow', 'new'], connected: [12] },
  { id: 14, label: 'Search', title: 'best train to goa', merchant: 'Google · 14 tabs opened', date: '2025-01-08', time: '22:39', category: 'Travel', amount: 0, flow: 'expense', color: '#39c6d8', icon: Search, chapter: 'Next stop', location: 'Home', note: 'The first spark of a plan.', tags: ['escape', 'next'], connected: [15] },
  { id: 15, label: 'Event', title: 'Konkan Express', merchant: 'Booking confirmed · Coach S4', date: '2025-01-12', time: '08:30', category: 'Travel', amount: 1800, flow: 'expense', color: '#f5a54a', icon: CalendarDays, chapter: 'Next stop', location: 'Pune Junction', note: 'You stopped waiting for the perfect time.', tags: ['escape', 'next'], connected: [14, 16] },
  { id: 16, label: 'Photo', title: 'first light / 6:12', merchant: 'IMG_5220.JPG · 3.5 MB', date: '2025-01-14', time: '06:12', category: 'Travel', amount: 0, flow: 'expense', color: '#39c6d8', icon: Image, chapter: 'Next stop', location: 'Alibaug', note: 'Somewhere new, still recognisably you.', tags: ['escape', 'found'], connected: [15] },
  { id: 17, label: 'Income', title: 'January salary', merchant: 'Orbit Systems · credited', date: '2025-01-01', time: '09:00', category: 'Income', amount: 85000, flow: 'income', color: '#46d39a', icon: CircleDollarSign, chapter: 'New chapter', location: 'Pune', note: 'The steady current beneath the small moments.', tags: ['work', 'steady'], connected: [11, 15] },
  { id: 18, label: 'Purchase', title: 'birthday dinner', merchant: 'The Table · 4 guests', date: '2025-01-19', time: '20:45', category: 'Food & Dining', amount: 3200, flow: 'expense', color: '#f5a54a', icon: Gift, chapter: 'New chapter', location: 'Pune', note: 'A table full of people who make the year brighter.', tags: ['people', 'celebrate'], connected: [17] },
]

const sourceReceipts = receipts

const storyMoments = [
  { title: 'Weekend Getaway', date: '14 JAN 2025', text: 'A new coastline, a first light photo, and the decision to go.', icon: MapPin, color: '#39c6d8', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=240&q=80' },
  { title: 'Birthday Celebration', date: '19 JAN 2025', text: 'Four chairs, one long table, and a year worth raising a glass to.', icon: Gift, color: '#f5a54a' },
  { title: 'New Laptop', date: '03 DEC 2024', text: 'A practical purchase that quietly opened a new chapter at work.', icon: Laptop, color: '#a58bff' },
  { title: 'Movie Night', date: '18 DEC 2024', text: 'Perfect Days, a yellow lamp, and a home that started feeling like yours.', icon: Film, color: '#7c68ed' },
  { title: 'Fitness Journey', date: '02 NOV 2024', text: 'The first step was simply leaving the house after midnight.', icon: Zap, color: '#46d39a' },
]

const money = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
const formatDate = (date) => new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${date}T12:00:00`))
const validateSearch = (value) => {
  if (value.length > 80) return 'Search must be 80 characters or fewer.'
  if (/[\u0000-\u001F\u007F]/.test(value)) return 'Search contains unsupported characters.'
  return ''
}

function App() {
  const [activeNav, setActiveNav] = useState('Home')
  const [query, setQuery] = useState('')
  const [queryError, setQueryError] = useState('')
  const [filter, setFilter] = useState('All')
  const [category, setCategory] = useState('All')
  const [sort, setSort] = useState('date')
  const [startDate, setStartDate] = useState('2024-10-01')
  const [endDate, setEndDate] = useState('2025-01-20')
  const [dateError, setDateError] = useState('')
  const [page, setPage] = useState(1)
  const [pulseMode, setPulseMode] = useState('Monthly')
  const [selected, setSelected] = useState(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showConnections, setShowConnections] = useState(false)
  useEffect(() => {
    const closeOnEscape = (event) => { if (event.key === 'Escape') setSelected(null) }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [])
  const updateQuery = (value) => {
    const error = validateSearch(value)
    setQueryError(error)
    if (!error) setQuery(value.trimStart())
    setPage(1)
  }
  const totals = useMemo(() => calculateTotals(receipts), [])
  const savings = totals.income - totals.expense
  const filtered = useMemo(() => sortRecords(filterRecords(receipts, { query, category, flow: filter, start: dateError ? '' : startDate, end: dateError ? '' : endDate }), sort), [category, dateError, endDate, filter, query, sort, startDate])
  const categoryData = useMemo(() => calculateCategoryTotals(receipts), [])
  const categoryColors = ['#39c6d8', '#a58bff', '#f5a54a', '#7c68ed', '#e66c98', '#46d39a', '#6a7df7']
  const pulseData = useMemo(() => aggregateByPeriod(filtered, pulseMode.toLowerCase()), [filtered, pulseMode])
  const storyInsight = useMemo(() => buildInsight(filtered), [filtered])
  const pageSize = 7
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const visibleTransactions = filtered.slice((page - 1) * pageSize, page * pageSize)
  const updateDateRange = (nextStart, nextEnd) => {
    const error = validateDateRange(nextStart, nextEnd)
    setDateError(error)
    setStartDate(nextStart)
    setEndDate(nextEnd)
    setPage(1)
  }
  const resetFilters = () => {
    setQuery('')
    setQueryError('')
    setFilter('All')
    setCategory('All')
    setSort('date')
    setDateError('')
    setStartDate('2024-10-01')
    setEndDate('2025-01-20')
    setPage(1)
  }

  return <div className="dashboard-shell">
    <aside className={`dashboard-sidebar ${mobileOpen ? 'open' : ''}`}>
      <div className="logo-lockup"><div className="logo-orbit"><Sparkles size={17} /></div><div><strong>LifeLens</strong><span>Your Life, In Receipts</span></div></div><div className="sidebar-kicker">PERSONAL INTELLIGENCE</div>
      <nav className="main-nav" aria-label="Main navigation">{[['Home', LayoutDashboard], ['Transactions', Receipt], ['Insights', BarChart3], ['Story', Sparkles], ['Map', Map], ['Search', Search], ['Settings', Settings]].map(([label, Icon]) => <button key={label} className={activeNav === label ? 'active' : ''} onClick={() => { setActiveNav(label); setMobileOpen(false) }}><Icon size={17} /><span>{label}</span>{label === 'Insights' && <span className="nav-pip" />}</button>)}</nav>
      <div className="sidebar-bottom-card"><div className="mini-glow"><TrendingUp size={15} /></div><strong>Story signal</strong><p>Your life is trending toward new places.</p><button onClick={() => setShowConnections(true)}>View insight <ArrowUpRight size={14} /></button></div><div className="profile-row"><div className="profile-avatar">SM</div><div><strong>Shaik Mohammed</strong><span>Personal archive</span></div><MoreHorizontal size={17} /></div>
    </aside>
    <main className="dashboard-main">
      <header className="dashboard-header"><button className="mobile-menu" onClick={() => setMobileOpen(true)}><Menu size={21} /></button><div className="header-context"><span>Good evening, Shaik</span><strong>Monday, 20 January 2025</strong></div><div className="header-tools"><button className="icon-button" aria-label="Download report"><ArrowDownLeft size={17} /></button><button className="icon-button" aria-label="Notifications"><Bell size={17} /><i /></button><button className="header-avatar">SM</button></div></header>
      <div className="dashboard-content" data-insight={storyInsight}>
        <FilterBar query={query} queryError={queryError} category={category} setCategory={(value) => { setCategory(value); setPage(1) }} categories={datasetCategories} filter={filter} setFilter={(value) => { setFilter(value); setPage(1) }} sort={sort} setSort={(value) => { setSort(value); setPage(1) }} startDate={startDate} endDate={endDate} dateError={dateError} onDateChange={updateDateRange} onReset={resetFilters} />
        <section className="hero-dashboard"><div className="hero-image" /><div className="hero-network"><span /><span /><span /><span /><span /></div><div className="hero-copy-dashboard"><div className="hero-eyebrow"><span className="live-pulse" /> YOUR DIGITAL LIFE · 2024—25</div><h1>Your Digital<br /><em>Story</em> <span>✦</span></h1><p>Every receipt is a tiny signal. Together,<br />they reveal the shape of your life.</p><div className="hero-controls"><button className="date-select">01 Oct 2024 — 20 Jan 2025 <ChevronDown size={15} /></button><div className={`global-search ${queryError ? 'invalid' : ''}`}><Search size={15} /><input aria-label="Search your story" aria-invalid={Boolean(queryError)} aria-describedby={queryError ? 'search-error' : undefined} placeholder="Search your story..." value={query} onChange={(event) => updateQuery(event.target.value)} /></div>{queryError && <span className="search-error" id="search-error" role="alert">{queryError}</span>}</div></div><div className="hero-stat"><span>STORY SIGNAL</span><strong>82</strong><small>/ 100</small><div className="signal-bar"><i /></div><p>More intentional<br />than last season</p></div></section>
        <section className="summary-grid"><MetricCard title="Total Income" value={totals.income} change="12.4%" label="vs. previous period" icon={ArrowDownLeft} className="green" /><MetricCard title="Total Expenses" value={totals.expense} change="8.2%" label="vs. previous period" icon={ArrowUpRight} className="pink" /><MetricCard title="Savings" value={savings} change="16.8%" label="of your income" icon={WalletCards} className="violet" /><MetricCard title="Total Transactions" value={receipts.length} change="24.5%" label="vs. previous period" icon={Receipt} className="blue" isCount /></section>
        <div className="dashboard-columns"><div className="dashboard-left">
          <section className="glass-panel pulse-panel"><PanelHeader eyebrow="BEHAVIOUR OVER TIME" title="Spending Pulse" action={<div className="segmented">{['Monthly', 'Weekly'].map((mode) => <button key={mode} className={pulseMode === mode ? 'active' : ''} onClick={() => setPulseMode(mode)}>{mode}</button>)}</div>} /><div className="pulse-legend"><span><i className="legend-income" /> Income</span><span><i className="legend-expense" /> Expenses</span><span className="pulse-total">{money(totals.expense)} spent</span></div><div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={pulseData} margin={{ top: 12, right: 8, left: -15, bottom: 0 }}><defs><linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#46d39a" stopOpacity={.28} /><stop offset="100%" stopColor="#46d39a" stopOpacity={0} /></linearGradient><linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7c68ed" stopOpacity={.35} /><stop offset="100%" stopColor="#7c68ed" stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="#263652" strokeDasharray="3 6" vertical={false} /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#7887a2', fontSize: 10 }} /><YAxis axisLine={false} tickLine={false} tick={{ fill: '#7887a2', fontSize: 10 }} tickFormatter={(value) => value >= 1000 ? `${value / 1000}k` : value} /><Tooltip content={<ChartTooltip />} /><Area type="monotone" dataKey="income" stroke="#46d39a" strokeWidth={2} fill="url(#incomeFill)" animationDuration={900} /><Area type="monotone" dataKey="expense" stroke="#7c68ed" strokeWidth={2} fill="url(#expenseFill)" animationDuration={900} /></AreaChart></ResponsiveContainer></div></section>
          <section className="glass-panel categories-panel"><PanelHeader eyebrow="WHERE IT GOES" title="Spending by Category" action={<button className="text-action">View details <ChevronRight size={14} /></button>} /><div className="category-chart"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={categoryData} dataKey="value" nameKey="name" innerRadius="62%" outerRadius="82%" paddingAngle={3} stroke="none" animationDuration={700}>{categoryData.map((entry, index) => <Cell key={entry.name} fill={categoryColors[index % categoryColors.length]} />)}</Pie><Tooltip content={<ChartTooltip />} /></PieChart></ResponsiveContainer><div className="donut-center"><strong>{money(totals.expense)}</strong><span>total spend</span></div></div><div className="category-legend">{categoryData.map((item, index) => <div key={item.name}><span className="legend-swatch" style={{ background: categoryColors[index % categoryColors.length] }} /><span>{item.name}</span><strong>{Math.round(item.value / totals.expense * 100)}%</strong></div>)}</div></section>
          <section className="glass-panel transactions-panel"><PanelHeader eyebrow="YOUR DIGITAL TRAIL" title="Recent Transactions" action={<button className="text-action">View all <ChevronRight size={14} /></button>} /><div className="transaction-toolbar"><div className={`transaction-search ${queryError ? 'invalid' : ''}`}><Search size={14} /><input aria-label="Search transactions" aria-invalid={Boolean(queryError)} placeholder="Search transactions" value={query} onChange={(event) => updateQuery(event.target.value)} /></div><div className="transaction-filters">{['All', 'Income', 'Expense'].map((item) => <button key={item} className={filter === item ? 'active' : ''} onClick={() => setFilter(item)}>{item}</button>)}</div><button className="sort-button">Newest <ChevronDown size={13} /></button></div><div className="transaction-list">{filtered.slice(0, 7).map((item) => <TransactionRow key={item.id} item={item} onClick={() => setSelected(item)} />)}</div>{filtered.length === 0 && <EmptyState />}</section>
        </div>
        <aside className="story-column"><section className="story-panel"><PanelHeader eyebrow="THE THREAD" title="Your Story" action={<button className="story-more"><MoreHorizontal size={18} /></button>} /><p className="story-intro">The moments that made this season feel like yours.</p><div className="story-timeline">{storyMoments.map((moment) => <StoryItem key={moment.title} moment={moment} />)}</div><button className="full-story-button" onClick={() => { setShowConnections(true); document.querySelector('.transactions-panel')?.scrollIntoView({ behavior: 'smooth' }) }}>Explore full story <ArrowUpRight size={15} /></button></section><section className="top-categories"><PanelHeader eyebrow="A LITTLE MORE CONTEXT" title="Top Categories" /><div className="top-category-grid">{categoryData.slice(0, 4).map((item, index) => <div className="top-category" key={item.name}><div className="top-category-icon" style={{ color: categoryColors[index], background: `${categoryColors[index]}18` }}>{index === 0 ? <Utensils size={17} /> : index === 1 ? <ShoppingBag size={17} /> : index === 2 ? <MapPin size={17} /> : <Film size={17} />}</div><span>{item.name}</span><strong>{money(item.value)}</strong></div>)}</div></section></aside></div>
        <section className="cinematic-banner"><div className="banner-image" /><div><span className="hero-eyebrow">THE NEXT CHAPTER</span><h2>Small moments.<br /><em>Big stories.</em></h2></div><button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}><Play size={14} fill="currentColor" /> Explore your journey</button></section>
      </div>
    </main>
    {selected && <ReceiptModal receipt={selected} onClose={() => setSelected(null)} />}
  </div>
}

function MetricCard({ title, value, change, label, icon: Icon, className, isCount }) { return <article className={`metric-card ${className}`}><div className="metric-icon"><Icon size={17} /></div><span>{title}</span><strong>{isCount ? value : money(value)}</strong><div className="metric-foot"><b><ArrowUpRight size={12} /> {change}</b><small>{label}</small></div><div className="metric-spark"><i /><i /><i /><i /><i /><i /></div></article> }
function FilterBar({ category, setCategory, categories, filter, setFilter, sort, setSort, startDate, endDate, dateError, onDateChange, onReset }) {
  return <section className="filter-bar" aria-label="Receipt filters">
    <div className="filter-heading"><span>EXPLORE THE ARCHIVE</span><strong>Find your thread</strong></div>
    <label className="filter-field">From<input type="date" value={startDate} aria-invalid={Boolean(dateError)} onChange={(event) => onDateChange(event.target.value, endDate)} /></label>
    <label className="filter-field">To<input type="date" value={endDate} aria-invalid={Boolean(dateError)} onChange={(event) => onDateChange(startDate, event.target.value)} /></label>
    <label className="filter-select">Category<select value={category} onChange={(event) => setCategory(event.target.value)}>{['All', ...categories.filter((item) => item !== 'All')].map((item) => <option key={item}>{item}</option>)}</select></label>
    <label className="filter-select">Flow<select value={filter} onChange={(event) => setFilter(event.target.value)}><option>All</option><option>Income</option><option>Expense</option></select></label>
    <label className="filter-select">Sort<select value={sort} onChange={(event) => setSort(event.target.value)}><option value="date">Newest</option><option value="amount">Largest amount</option></select></label>
    <button className="reset-button" onClick={onReset}>Reset filters</button>
    {dateError && <span className="date-error" role="alert">{dateError}</span>}
  </section>
}
function PanelHeader({ eyebrow, title, action }) { return <div className="panel-header"><div><span>{eyebrow}</span><h2>{title}</h2></div>{action}</div> }
function ChartTooltip({ active, payload, label }) { if (!active || !payload?.length) return null; return <div className="chart-tooltip"><span>{label}</span>{payload.map((item) => <strong key={item.dataKey} style={{ color: item.color }}>{item.name}: {money(item.value)}</strong>)}</div> }
function TransactionRow({ item, onClick }) { const Icon = item.icon; return <button className="transaction-row" onClick={onClick}><span className="transaction-icon" style={{ color: item.color }}><Icon size={16} /></span><span className="transaction-name"><strong>{item.title}</strong><small>{item.merchant}</small></span><span className="transaction-category">{item.category}</span><span className="transaction-date">{formatDate(item.date)}</span><strong className={`transaction-amount ${item.flow}`}>{item.flow === 'income' ? '+' : '-'}{money(item.amount)}</strong><ChevronRight className="row-chevron" size={15} /></button> }
function StoryItem({ moment }) { const Icon = moment.icon; return <div className="story-item"><div className="story-connector" style={{ background: moment.color }}><Icon size={15} /></div><div className="story-item-content">{moment.image && <img src={moment.image} alt="" /> }<span>{moment.date}</span><h3>{moment.title}</h3><p>{moment.text}</p></div></div> }
function EmptyState() { return <div className="empty-state"><Search size={20} /><span>No receipts match this story thread.</span></div> }
function ReceiptModal({ receipt, onClose }) { const Icon = receipt.icon; const related = receipt.connected.map((id) => receipts.find((item) => item.id === id)).filter(Boolean); return <div className="modal-backdrop" onClick={onClose}><aside className="detail-drawer dark-drawer" onClick={(event) => event.stopPropagation()}><button className="close-button" onClick={onClose}><X size={17} /></button><div className="detail-art" style={{ '--accent': receipt.color }}><Icon size={30} /><span>{receipt.label}</span></div><span className="detail-label">{receipt.chapter} · {formatDate(receipt.date)}</span><h2>{receipt.title}</h2><p className="detail-description">{receipt.note}</p><div className="detail-meta"><span><MapPin size={14} /> {receipt.location}</span><span><WalletCards size={14} /> {receipt.amount ? money(receipt.amount) : 'Life moment'}</span></div><div className="related-block"><div className="mini-label">CONNECTED MOMENTS</div>{related.map((item) => { const RelatedIcon = item.icon; return <div className="related-item" key={item.id}><span className="related-icon" style={{ color: item.color }}><RelatedIcon size={14} /></span><span><strong>{item.title}</strong><small>{item.label} · {formatDate(item.date)}</small></span></div> })}</div><div className="detail-tags">{receipt.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div></aside></div> }

export default App
