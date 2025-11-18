import { Outlet, useParams, Link, useLocation, useNavigate } from 'react-router-dom'
import { useMemo, useEffect } from 'react'
import {
  Groups,
  Message,
  SavingsOutlined,
  HowToVote,
  Storefront,
  Add,
  PeopleAlt,
} from '@mui/icons-material'
import { useGroups } from '@/hooks/useGroups'

const GroupLayout = () => {
  const params = useParams<{ groupId: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const { data: groups, loading: groupsLoading } = useGroups()

  // Extract groupId from params - check both direct access and from location pathname as fallback
  const urlGroupId = params.groupId || location.pathname.match(/\/groups\/([^/]+)/)?.[1]
  
  // Use URL groupId if available, otherwise use first group, otherwise null
  const activeGroupId = useMemo(() => {
    if (urlGroupId) return urlGroupId
    if (groups && groups.length > 0) return groups[0].id
    return null
  }, [urlGroupId, groups])

  const currentGroup = groups?.find((g) => g.id === activeGroupId)

  // Debug: Log groups when they change
  useEffect(() => {
    if (groups) {
      console.log('[GroupLayout] Groups loaded:', groups.length, groups.map(g => ({ id: g.id, name: g.name })))
    }
  }, [groups])

  const groupNavItems = activeGroupId
    ? [
        {
          label: 'Tổng quan',
          icon: Groups,
          to: `/groups/${activeGroupId}`,
          exact: true,
        },
        {
          label: 'Tin nhắn',
          icon: Message,
          to: `/groups/${activeGroupId}/messages`,
        },
        {
          label: 'Quỹ chung',
          icon: SavingsOutlined,
          to: `/groups/${activeGroupId}/fund`,
        },
        {
          label: 'Đề xuất',
          icon: HowToVote,
          to: `/groups/${activeGroupId}/proposals`,
        },
        {
          label: 'Thành viên',
          icon: PeopleAlt,
          to: `/groups/${activeGroupId}/members/${currentGroup?.members[0]?.id || ''}`,
          disabled: !currentGroup?.members.length,
        },
      ]
    : []

  const globalNavItems = [
    {
      label: 'Marketplace',
      icon: Storefront,
      to: '/groups/marketplace',
    },
    {
      label: 'Tạo nhóm mới',
      icon: Add,
      to: '/groups/create',
    },
  ]

  const isActive = (to: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === to
    }
    return location.pathname.startsWith(to)
  }

  return (
    <div className="mx-auto flex max-w-7xl gap-6">
      {/* Sidebar Navigation */}
      <aside className="hidden w-64 shrink-0 lg:block pt-6">
        <nav className="sticky top-6 space-y-2 rounded-2xl bg-white border border-neutral-200 p-4 overflow-y-auto max-h-[calc(100vh-3rem)]">
          {/* Global Group Navigation */}
          <div className="mb-6">
            <h3 className="mb-3 px-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Quản lý nhóm
            </h3>
            <div className="space-y-1">
              {globalNavItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.to)
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                      active
                        ? 'text-white shadow-sm'
                        : 'text-neutral-700 hover:bg-neutral-100'
                    }`}
                    style={active ? { backgroundColor: 'var(--accent-blue)' } : undefined}
                  >
                    <Icon fontSize="small" className={active ? 'text-white' : 'text-current'} />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Group Selector - Show when groups exist */}
          {!groupsLoading && groups && groups.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-3 px-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Chọn nhóm ({groups.length})
              </h3>
              <div className="space-y-1 max-h-96 overflow-y-auto">
                {groups.map((group) => {
                  const isSelected = group.id === activeGroupId
                  return (
                    <button
                      key={group.id}
                      type="button"
                      onClick={() => {
                        // Navigate to group overview when selecting a group
                        navigate(`/groups/${group.id}`)
                      }}
                      className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition text-left ${
                        isSelected
                          ? 'text-white shadow-sm'
                          : 'text-neutral-700 hover:bg-neutral-100'
                      }`}
                      style={isSelected ? { backgroundColor: 'var(--accent-blue)' } : undefined}
                    >
                      <Groups fontSize="small" className={isSelected ? 'text-white' : 'text-current'} />
                      <span className="flex-1 truncate">{group.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Current Group Navigation - Show when a group is selected */}
          {activeGroupId && groupNavItems.length > 0 && (
            <div>
              <h3 className="mb-3 px-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                {currentGroup?.name || 'Nhóm hiện tại'}
              </h3>
              <div className="space-y-1">
                {groupNavItems.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.to, item.exact)
                  if (item.disabled) return null
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                        active
                          ? 'text-white shadow-sm'
                          : 'text-neutral-700 hover:bg-neutral-100'
                      }`}
                      style={active ? { backgroundColor: 'var(--accent-blue)' } : undefined}
                    >
                      <Icon fontSize="small" className={active ? 'text-white' : 'text-current'} />
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="min-w-0 flex-1 p-6">
        <Outlet />
      </main>
    </div>
  )
}

export default GroupLayout

