import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import {
  Dashboard,
  Groups,
  DirectionsCar,
  Build,
  CheckCircle,
  Warning,
  Assessment,
  People,
  Description,
  Article,
  Analytics,
  History,
  Settings,
  SmartToy,
  Psychology,
  Lightbulb,
  Gavel,
  Search as SearchIcon,
  PendingActions,
} from "@mui/icons-material";
import GlobalSearch from "@/components/shared/GlobalSearch";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";
import { UserRole, isSystemAdmin } from "@/utils/roles";

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);

  const ACTIVE_CLASSES = "bg-neutral-900 text-neutral-50 shadow-sm";
  const INACTIVE_CLASSES =
    "text-neutral-700 hover:bg-neutral-200 bg-neutral-50";

  // All menu items
  const allMenuItems = [
    {
      path: "/admin/dashboard",
      label: "Dashboard",
      icon: Dashboard,
      roles: [UserRole.SystemAdmin, UserRole.Staff],
    },
    {
      path: "/admin/groups/pending",
      label: "Pending Groups",
      icon: PendingActions,
      roles: [UserRole.SystemAdmin, UserRole.Staff],
    },
    {
      path: "/admin/groups",
      label: "Manage Groups",
      icon: Groups,
      roles: [UserRole.SystemAdmin, UserRole.Staff],
    },
    {
      path: "/admin/vehicles/pending",
      label: "Pending Vehicles",
      icon: PendingActions,
      roles: [UserRole.SystemAdmin, UserRole.Staff],
    },
    {
      path: "/admin/vehicles",
      label: "Manage Vehicles",
      icon: DirectionsCar,
      roles: [UserRole.SystemAdmin, UserRole.Staff],
    },
    {
      path: "/admin/maintenance",
      label: "Maintenance",
      icon: Build,
      roles: [UserRole.SystemAdmin, UserRole.Staff],
    },
    {
      path: "/admin/checkins",
      label: "Check-In/Out",
      icon: CheckCircle,
      roles: [UserRole.SystemAdmin, UserRole.Staff],
    },
    {
      path: "/admin/disputes",
      label: "Disputes",
      icon: Gavel,
      roles: [UserRole.SystemAdmin, UserRole.Staff],
    },
    {
      path: "/admin/financial-reports",
      label: "Financial Reports",
      icon: Assessment,
      roles: [UserRole.SystemAdmin, UserRole.Staff],
    },
    {
      path: "/admin/contracts",
      label: "E-Contracts",
      icon: Article,
      roles: [UserRole.SystemAdmin, UserRole.Staff],
    },
    // System Admin only items
    {
      path: "/admin/users",
      label: "User Management",
      icon: People,
      roles: [UserRole.SystemAdmin],
    },
    {
      path: "/admin/kyc",
      label: "KYC Review",
      icon: Description,
      roles: [UserRole.SystemAdmin],
    },
    {
      path: "/admin/analytics",
      label: "Analytics",
      icon: Analytics,
      roles: [UserRole.SystemAdmin],
    },
    {
      path: "/admin/audit",
      label: "Audit Log",
      icon: History,
      roles: [UserRole.SystemAdmin],
    },
    {
      path: "/admin/settings",
      label: "Settings",
      icon: Settings,
      roles: [UserRole.SystemAdmin],
    },
  ];

  // Filter menu items based on user role
  const menuItems = allMenuItems.filter((item) => {
    if (!user) return false;
    return item.roles.includes(user.role);
  });

  const aiMenuItems = [
    {
      path: "/admin/ai/booking-recommendations",
      label: "Booking Recommendations",
      icon: SmartToy,
    },
    {
      path: "/admin/ai/fairness-score",
      label: "Fairness Score",
      icon: Psychology,
      requiresParam: true,
    },
    {
      path: "/admin/ai/predictive-maintenance",
      label: "Predictive Maintenance",
      icon: Psychology,
      requiresParam: true,
    },
    {
      path: "/admin/ai/cost-optimization",
      label: "Cost Optimization",
      icon: Lightbulb,
      requiresParam: true,
    },
  ];

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const isActive = (path: string) => {
    if (location.pathname === path) return true;
    if (location.pathname.startsWith(path + "/")) return true;
    return false;
  };

  return (
    <div className="h-screen bg-neutral-50 flex overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-neutral-100 border-r border-neutral-200 transition-all duration-300 flex flex-col`}
      >
        <div
          className={`${
            sidebarOpen ? "p-4" : "p-2"
          } border-b border-neutral-200 flex-shrink-0`}
        >
          <div
            className={`flex items-center ${
              sidebarOpen ? "justify-between" : "justify-center"
            }`}
          >
            {sidebarOpen && (
              <h1 className="text-xl font-bold text-neutral-800">
                Admin Panel
              </h1>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-md hover:bg-neutral-200 transition-colors"
              title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              {sidebarOpen ? "←" : "→"}
            </button>
          </div>
        </div>

        <nav
          className={`flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide ${
            sidebarOpen ? "p-4" : "p-2"
          }`}
        >
          <div className={sidebarOpen ? "mb-6" : "mb-4"}>
            <h2
              className={`text-xs font-semibold text-neutral-500 uppercase mb-2 ${
                !sidebarOpen && "hidden"
              }`}
            >
              {isSystemAdmin(user) ? "Main" : "Operations"}
            </h2>
            <ul className="space-y-1">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center rounded-md transition-all duration-200 ${
                      sidebarOpen
                        ? "gap-3 px-4 py-3"
                        : "justify-center w-full py-3"
                    } ${
                      isActive(item.path) ? ACTIVE_CLASSES : INACTIVE_CLASSES
                    }`}
                    title={!sidebarOpen ? item.label : ""}
                  >
                    <span
                      className={`flex-shrink-0 flex items-center justify-center ${
                        !sidebarOpen ? "w-8 h-8" : ""
                      }`}
                    >
                      {sidebarOpen ? (
                        <item.icon sx={{ fontSize: 20, color: "inherit" }} />
                      ) : (
                        <item.icon sx={{ fontSize: 24, color: "inherit" }} />
                      )}
                    </span>
                    {sidebarOpen && (
                      <span className="font-medium text-sm leading-tight">
                        {item.label}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2
              className={`text-xs font-semibold text-neutral-500 uppercase mb-2 ${
                !sidebarOpen && "hidden"
              }`}
            >
              AI Features
            </h2>
            <ul className="space-y-1">
              {aiMenuItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center rounded-md transition-all duration-200 ${
                      sidebarOpen
                        ? "gap-3 px-4 py-3"
                        : "justify-center w-full py-3"
                    } ${
                      isActive(item.path) ? ACTIVE_CLASSES : INACTIVE_CLASSES
                    }`}
                    title={!sidebarOpen ? item.label : ""}
                  >
                    <span
                      className={`flex-shrink-0 flex items-center justify-center ${
                        !sidebarOpen ? "w-8 h-8" : ""
                      }`}
                    >
                      {sidebarOpen ? (
                        <item.icon sx={{ fontSize: 20, color: "inherit" }} />
                      ) : (
                        <item.icon sx={{ fontSize: 24, color: "inherit" }} />
                      )}
                    </span>
                    {sidebarOpen && (
                      <span className="font-medium text-sm leading-tight">
                        {item.label}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-neutral-100 border-b border-neutral-200 px-4 md:px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between gap-2 md:gap-4 flex-wrap">
            <h2 className="text-xl md:text-2xl font-bold text-neutral-800 flex-shrink-0 min-w-0 truncate">
              {menuItems.find((item) => isActive(item.path))?.label ||
                aiMenuItems.find((item) => isActive(item.path))?.label ||
                "Admin Panel"}
            </h2>

            {/* Search Bar */}
            <div className="flex-1 min-w-0 max-w-md relative">
              <button
                onClick={() => setSearchOpen(true)}
                className="w-full bg-neutral-50 border-2 border-neutral-200 rounded-md px-4 py-2 pl-10 pr-4 text-sm md:text-base text-neutral-700 placeholder-neutral-400 transition-all duration-200 hover:border-neutral-300 focus:outline-none focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 flex items-center gap-2"
              >
                <SearchIcon
                  sx={{ fontSize: 20, color: "var(--neutral-400)" }}
                />
                <span className="flex-1 text-left">Search...</span>
                <span className="text-xs text-neutral-500 hidden md:inline">
                  Ctrl+K
                </span>
              </button>
            </div>

            <div className="flex items-center gap-4 flex-shrink-0">
              {user && (
                <span className="text-sm text-neutral-700 whitespace-nowrap">
                  {user.firstName
                    ? `${user.firstName} ${user.lastName}`
                    : user.email}
                </span>
              )}
              <button
                onClick={async () => {
                  await dispatch(logout());
                  navigate("/");
                }}
                className="px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-200 rounded-md transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6">
          <Outlet />
        </main>
      </div>

      {/* Global Search */}
      <GlobalSearch
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onNavigate={(path) => navigate(path)}
      />
    </div>
  );
};

export default AdminLayout;
