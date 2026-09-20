import {
  CalendarDays, CircleDollarSign, Film, Gift, Headphones, Image, Lightbulb,
  MapPin, Search, ShoppingBag, Ticket, Utensils, Zap,
} from 'lucide-react'
import csvText from './data/lifeReceipts.csv?raw'
import { parseCsv, parseList } from './utils/csvParser'
import { isValidDate } from './utils/validation'

const icons = { music: Headphones, place: MapPin, photo: Image, purchase: ShoppingBag, search: Search, note: Lightbulb, message: Zap, event: Ticket, movie: Film, income: CircleDollarSign }
const fallbackColor = '#7c68ed'

export function normalizeReceipt(record, index) {
  const amount = Number(record.amount)
  return {
    id: Number(record.id) || index + 1,
    label: record.label || 'Receipt',
    title: record.title || 'Untitled moment',
    merchant: record.merchant || 'Unknown source',
    date: isValidDate(record.date) ? record.date : '',
    time: /^\d{2}:\d{2}$/.test(record.time) ? record.time : '00:00',
    category: record.category || 'Others',
    amount: Number.isFinite(amount) && amount >= 0 ? amount : 0,
    flow: record.flow === 'income' ? 'income' : 'expense',
    color: record.color || fallbackColor,
    type: record.type || 'receipt',
    icon: icons[record.type] || ReceiptIcon,
    chapter: record.chapter || 'Unsorted moments',
    location: record.location || 'Unknown place',
    note: record.note || 'A small moment in the archive.',
    tags: parseList(record.tags),
    connected: parseList(record.connected).map(Number).filter(Number.isFinite),
  }
}

function ReceiptIcon() { return null }

export const receipts = parseCsv(csvText).map(normalizeReceipt)
export const datasetCategories = ['All', ...new Set(receipts.map((receipt) => receipt.category))]
export const datasetDateBounds = receipts.reduce((bounds, receipt) => {
  if (!receipt.date) return bounds
  return { start: bounds.start && bounds.start < receipt.date ? bounds.start : receipt.date, end: bounds.end > receipt.date ? bounds.end : receipt.date }
}, { start: '', end: '' })
