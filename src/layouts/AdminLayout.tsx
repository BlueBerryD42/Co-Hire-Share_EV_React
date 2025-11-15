import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);

  const ACTIVE_CLASSES = "bg-neutral-900 text-neutral-50 shadow-sm";
  const INACTIVE_CLASSES = "text-neutral-700 hover:bg-neutral-200";

  const menuItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/admin/groups", label: "Manage Groups", icon: "👥" },
    { path: "/admin/vehicles", label: "Manage Vehicles", icon: "🚗" },
    { path: "/admin/maintenance", label: "Maintenance", icon: "🔧" },
    { path: "/admin/checkins", label: "Check-In/Out", icon: "✅" },
    { path: "/admin/disputes", label: "Disputes", icon: "⚠️" },
    {
      path: "/admin/financial-reports",
      label: "Financial Reports",
      icon: "💰",
    },
    { path: "/admin/users", label: "User Management", icon: "👤" },
    { path: "/admin/kyc", label: "KYC Review", icon: "📄" },
    { path: "/admin/contracts", label: "E-Contracts", icon: "📝" },
    { path: "/admin/analytics", label: "Analytics", icon: "📈" },
    { path: "/admin/audit", label: "Audit Log", icon: "📋" },
    { path: "/admin/settings", label: "Settings", icon: "⚙️" },
  ];

  const aiMenuItems = [
    {
      path: "/admin/ai/booking-recommendations",
      label: "Booking Recommendations",
      icon: "🤖",
    },
    {
      path: "/admin/ai/fairness-score",
      label: "Fairness Score",
      icon: "⚖️",
      requiresParam: true,
    },
    {
      path: "/admin/ai/predictive-maintenance",
      label: "Predictive Maintenance",
      icon: "🔮",
      requiresParam: true,
    },
    {
      path: "/admin/ai/cost-optimization",
      label: "Cost Optimization",
      icon: "💡",
      requiresParam: true,
    },
  ];

  const isActive = (path) => {
    // Check if the current path matches or starts with the menu item path
    // Handle routes with parameters (e.g., /admin/ai/fairness-score/123 should match /admin/ai/fairness-score)
    if (location.pathname === path) return true;
    if (location.pathname.startsWith(path + "/")) return true;
    // Also check if it's an exact match for routes without trailing slashes
    return false;
  };

  // Handle search
  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    try {
      setLoading(true);
      // TODO: Call search API when available
      // const response = await searchApi.search(query);
      // setSearchResults(response.data);

      // Temporary: Search through menu items
      const menuItemsWithType = menuItems.map((item) => ({
        ...item,
        type: "Menu",
      }));
      const aiItemsWithType = aiMenuItems.map((item) => ({
        ...item,
        type: "AI Feature",
      }));
      const allItems = [...menuItemsWithType, ...aiItemsWithType];
      const filtered = allItems.filter(
        (item) =>
          item.label.toLowerCase().includes(query.toLowerCase()) ||
          item.path.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filtered);
      setShowSearchResults(true);
      setLoading(false);
    } catch (err) {
      console.error("Error searching:", err);
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    handleSearch(value);
  };

  const handleSearchResultClick = (path) => {
    setSearchQuery("");
    setSearchResults([]);
    setShowSearchResults(false);
    navigate(path);
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
              Main
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
                      className={`${
                        sidebarOpen ? "text-xl" : "text-2xl"
                      } flex-shrink-0 flex items-center justify-center ${
                        !sidebarOpen ? "w-8 h-8" : ""
                      }`}
                    >
                      {item.icon}
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
                      className={`${
                        sidebarOpen ? "text-xl" : "text-2xl"
                      } flex-shrink-0 flex items-center justify-center ${
                        !sidebarOpen ? "w-8 h-8" : ""
                      }`}
                    >
                      {item.icon}
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
            <div className="flex-1 min-w-0 max-w-md relative" ref={searchRef}>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => searchQuery && setShowSearchResults(true)}
                  placeholder="Search..."
                  className="w-full bg-neutral-50 border-2 border-neutral-200 rounded-md px-4 py-2 pl-10 pr-4 text-sm md:text-base text-neutral-700 placeholder-neutral-400 transition-all duration-200 focus:outline-none focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20"
                />
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400">
                  🔍
                </span>
                {loading && (
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-neutral-300 border-t-accent-blue rounded-full animate-spin" />
                  </span>
                )}
              </div>

              {/* Search Results Dropdown */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-neutral-200 rounded-md shadow-lg z-50 max-h-96 overflow-y-auto scrollbar-hide">
                  {searchResults.map((result, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearchResultClick(result.path)}
                      className="w-full text-left px-4 py-3 hover:bg-neutral-100 transition-colors border-b border-neutral-100 last:border-b-0"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{result.icon}</span>
                          <div>
                            <p className="font-medium text-neutral-800">
                              {result.label}
                            </p>
                            <p className="text-xs text-neutral-500 mt-1">
                              {result.path}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs px-2 py-1 bg-neutral-200 text-neutral-700 rounded-full">
                          {result.type}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* No Results */}
              {showSearchResults &&
                searchQuery &&
                !loading &&
                searchResults.length === 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-neutral-200 rounded-md shadow-lg z-50 p-4">
                    <p className="text-sm text-neutral-600 text-center">
                      No results found
                    </p>
                    <p className="text-xs text-neutral-500 text-center mt-1">
                      Try different keywords
                    </p>
                  </div>
                )}
            </div>

            <div className="flex items-center gap-4 flex-shrink-0">
              <button
                onClick={() => {
                  localStorage.removeItem("authToken");
                  window.location.href = "/";
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
    </div>
  );
};

export default AdminLayout;
