import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Badge, Button } from '@/components/shared'
import { StatCard } from '@/components/vehicle'
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart as PieChartIcon,
  BarChart3,
  Calendar,
  Download,
  Lightbulb,
} from 'lucide-react'
import vehicleService from '@/services/vehicleService'
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

/**
 * CostAnalytics Page - Màn hình 23: Cost Analytics
 * Phân tích chi phí với charts: monthly trend, category breakdown, usage vs cost
 */
const CostAnalytics = () => {
  const { vehicleId } = useParams()
  const navigate = useNavigate()

  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('6months')
  const [groupBy, setGroupBy] = useState('month')

  useEffect(() => {
    if (vehicleId) {
      fetchCostAnalytics()
    }
  }, [vehicleId, dateRange, groupBy])

  const fetchCostAnalytics = async () => {
    try {
      setLoading(true)

      const now = new Date()
      let startDate

      switch (dateRange) {
        case '3months':
          startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1)
          break
        case '6months':
          startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1)
          break
        case '1year':
          startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1)
          break
        default:
          startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1)
      }

      const data = await vehicleService.getCostAnalysis(vehicleId, {
        startDate: startDate.toISOString(),
        endDate: now.toISOString(),
        groupBy,
      })

      setAnalytics(data)
    } catch (error) {
      console.error('Error fetching cost analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-neutral-200 rounded-lg" />
            <div className="grid grid-cols-2 gap-6">
              <div className="h-96 bg-neutral-200 rounded-lg" />
              <div className="h-96 bg-neutral-200 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Colors for charts
  const COLORS = ['#7a9aaf', '#7a9b76', '#d4a574', '#b87d6f', '#6b5a4d', '#8f7d70', '#b8a398', '#d5bdaf']

  // Prepare data for monthly trend chart
  const monthlyTrendData = analytics?.costTrends?.map((item) => ({
    month: item.period,
    cost: item.totalCost,
    average: analytics.costPerUnit?.averageMonthly || 0,
  })) || []

  // Prepare data for category breakdown pie chart
  const categoryData = Object.entries(analytics?.expenseBreakdown || {}).map(([category, amount]) => ({
    name: category === 'Charging' ? 'Sạc điện' :
          category === 'Maintenance' ? 'Bảo trì' :
          category === 'Insurance' ? 'Bảo hiểm' :
          category === 'Cleaning' ? 'Vệ sinh' :
          category === 'Parking' ? 'Đậu xe' :
          category === 'Registration' ? 'Đăng ký' :
          category,
    value: amount,
  }))

  // Prepare data for usage vs cost chart (mock data - requires member usage data)
  const usageVsCostData = [
    { name: 'Bạn', usage: 40, cost: 42, fairShare: 40 },
    { name: 'Thành viên 2', usage: 30, cost: 28, fairShare: 30 },
    { name: 'Thành viên 3', usage: 30, cost: 30, fairShare: 30 },
  ]

  const getTrendIcon = (trend) => {
    if (trend === 'up') return <TrendingUp className="w-5 h-5 text-error" />
    if (trend === 'down') return <TrendingDown className="w-5 h-5 text-success" />
    return <TrendingUp className="w-5 h-5 text-neutral-600" />
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <button
          onClick={() => navigate(`/vehicles/${vehicleId}`)}
          className="flex items-center gap-2 text-neutral-700 hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Quay lại chi tiết xe</span>
        </button>

        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-800 flex items-center gap-3">
                <PieChartIcon className="w-8 h-8 text-primary" />
                Phân tích chi phí
              </h1>
              <p className="text-neutral-600 mt-2">
                Theo dõi và phân tích chi phí vận hành xe
              </p>
            </div>
            <Button variant="ghost">
              <Download className="w-5 h-5 mr-2" />
              Xuất báo cáo
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="flex flex-wrap gap-4">
            {/* Date Range */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Khoảng thời gian
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-md text-neutral-700 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
              >
                <option value="3months">3 tháng qua</option>
                <option value="6months">6 tháng qua</option>
                <option value="1year">1 năm qua</option>
              </select>
            </div>

            {/* Group By */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Nhóm theo
              </label>
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-md text-neutral-700 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
              >
                <option value="month">Tháng</option>
                <option value="quarter">Quý</option>
                <option value="year">Năm</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <StatCard
            icon={DollarSign}
            label="Tổng chi phí"
            value={(analytics?.totalCosts?.thisMonth || 0).toLocaleString()}
            unit="đ"
            trend="up"
            trendValue="+12%"
            variant="primary"
          />
          <StatCard
            icon={Calendar}
            label="Trung bình/tháng"
            value={(analytics?.costPerUnit?.averageMonthly || 0).toLocaleString()}
            unit="đ"
            variant="default"
          />
          <StatCard
            icon={BarChart3}
            label="Chi phí/km"
            value={(analytics?.costPerUnit?.perKm || 0).toLocaleString()}
            unit="đ"
          />
          <StatCard
            icon={TrendingDown}
            label="Tiết kiệm so với sở hữu đơn"
            value={(analytics?.roi?.savingsVsSolo || 0).toLocaleString()}
            unit="đ"
            variant="success"
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Monthly Trend Chart */}
          <Card>
            <h3 className="text-lg font-semibold text-neutral-800 mb-6">
              Xu hướng chi phí theo tháng
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e3d5ca" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: '#6b5a4d', fontSize: 12 }}
                  axisLine={{ stroke: '#d6ccc2' }}
                />
                <YAxis
                  tick={{ fill: '#6b5a4d', fontSize: 12 }}
                  axisLine={{ stroke: '#d6ccc2' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#f5ebe0',
                    border: '1px solid #e3d5ca',
                    borderRadius: '8px',
                  }}
                  formatter={(value) => `${value.toLocaleString()} đ`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="cost"
                  name="Chi phí"
                  stroke="#7a9aaf"
                  strokeWidth={3}
                  dot={{ fill: '#7a9aaf', r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="average"
                  name="Trung bình"
                  stroke="#d4a574"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Category Breakdown Pie Chart */}
          <Card>
            <h3 className="text-lg font-semibold text-neutral-800 mb-6">
              Phân loại chi phí
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${((entry.value / analytics?.totalCosts?.allTime) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value.toLocaleString()} đ`} />
              </PieChart>
            </ResponsiveContainer>

            {/* Category Legend */}
            <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-neutral-200">
              {categoryData.map((cat, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm text-neutral-700">{cat.name}</span>
                  <span className="text-sm font-semibold text-neutral-800 ml-auto">
                    {cat.value.toLocaleString()} đ
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Usage vs Cost Bar Chart */}
          <Card>
            <h3 className="text-lg font-semibold text-neutral-800 mb-6">
              Sử dụng vs Chi phí (%)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={usageVsCostData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e3d5ca" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#6b5a4d', fontSize: 12 }}
                  axisLine={{ stroke: '#d6ccc2' }}
                />
                <YAxis
                  tick={{ fill: '#6b5a4d', fontSize: 12 }}
                  axisLine={{ stroke: '#d6ccc2' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#f5ebe0',
                    border: '1px solid #e3d5ca',
                    borderRadius: '8px',
                  }}
                  formatter={(value) => `${value}%`}
                />
                <Legend />
                <Bar dataKey="usage" name="% Sử dụng" fill="#7a9aaf" />
                <Bar dataKey="cost" name="% Chi phí" fill="#7a9b76" />
                <Bar dataKey="fairShare" name="% Công bằng" fill="#d4a574" />
              </BarChart>
            </ResponsiveContainer>

            {/* Fairness Indicator */}
            <div className="mt-6 pt-6 border-t border-neutral-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-700">Điểm công bằng của bạn</span>
                <Badge variant="success" size="lg">95/100</Badge>
              </div>
              <div className="w-full h-2 bg-neutral-200 rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-success" style={{ width: '95%' }} />
              </div>
            </div>
          </Card>

          {/* Savings Card */}
          <Card className="bg-gradient-to-br from-success/10 to-primary/10 border-success/30">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center flex-shrink-0">
                <TrendingDown className="w-8 h-8 text-success" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-neutral-800 mb-2">
                  Bạn đã tiết kiệm được!
                </h3>
                <p className="text-4xl font-bold text-success mb-4">
                  {(analytics?.roi?.savingsVsSolo || 0).toLocaleString()} đ
                </p>
                <p className="text-neutral-700 leading-relaxed">
                  So với việc sở hữu xe một mình, bạn đã tiết kiệm được{' '}
                  <span className="font-semibold text-success">
                    {analytics?.roi?.savingsPercentage || 0}%
                  </span>{' '}
                  chi phí vận hành trong{' '}
                  {dateRange === '3months' ? '3 tháng' : dateRange === '6months' ? '6 tháng' : '1 năm'} qua.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* AI Insights */}
        <Card>
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Lightbulb className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-neutral-800 mb-2">
                Gợi ý tối ưu chi phí
              </h3>
              <p className="text-neutral-600">
                Dựa trên phân tích dữ liệu của bạn
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analytics?.suggestions?.map((suggestion, index) => (
              <div
                key={index}
                className="p-4 bg-neutral-50 rounded-lg border border-neutral-200"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary font-semibold text-sm">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-neutral-800 font-medium mb-1">
                      {suggestion.title}
                    </p>
                    <p className="text-sm text-neutral-600">
                      {suggestion.description}
                    </p>
                    {suggestion.potentialSaving && (
                      <Badge variant="success" size="sm" className="mt-2">
                        Tiết kiệm: {suggestion.potentialSaving.toLocaleString()} đ/tháng
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            )) || (
              <>
                <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-primary font-semibold text-sm">1</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-neutral-800 font-medium mb-1">
                        Sạc điện vào giờ thấp điểm
                      </p>
                      <p className="text-sm text-neutral-600">
                        Sạc điện từ 22h-6h sáng để giảm 30% chi phí điện
                      </p>
                      <Badge variant="success" size="sm" className="mt-2">
                        Tiết kiệm: ~200,000 đ/tháng
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-primary font-semibold text-sm">2</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-neutral-800 font-medium mb-1">
                        Bảo trì định kỳ
                      </p>
                      <p className="text-sm text-neutral-600">
                        Lên lịch bảo trì định kỳ để tránh chi phí sửa chữa lớn
                      </p>
                      <Badge variant="success" size="sm" className="mt-2">
                        Tiết kiệm: ~500,000 đ/năm
                      </Badge>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

export default CostAnalytics
