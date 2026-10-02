import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, Tooltip as PieTooltip
} from 'recharts'
import { getStockByCategory, getStatusDistribution } from '../utils/kpi'

const formatRupiah = (v) => `${v.toLocaleString('id-ID')}`

function StockBarChart({ items }) {
  const data = getStockByCategory(items)
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Stok vs Terjual per Kategori</h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="kategori" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip formatter={(v) => formatRupiah(v)} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="stok" name="Stok" fill="#3B82F6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="terjual" name="Terjual/Bulan" fill="#10B981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

const RADIAN = Math.PI / 180
const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null
  const r = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + r * Math.cos(-midAngle * RADIAN)
  const y = cy + r * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

function StatusDonutChart({ items }) {
  const data = getStatusDistribution(items).filter(d => d.value > 0)
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Distribusi Status Produk</h3>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={100}
            paddingAngle={3}
            dataKey="value"
            labelLine={false}
            label={renderLabel}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <PieTooltip formatter={(v, name) => [`${v} produk`, name]} />
          <Legend
            formatter={(value, entry) => (
              <span style={{ color: entry.color, fontSize: 12 }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export default function StockCharts({ items }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <StockBarChart items={items} />
      <StatusDonutChart items={items} />
    </div>
  )
}
