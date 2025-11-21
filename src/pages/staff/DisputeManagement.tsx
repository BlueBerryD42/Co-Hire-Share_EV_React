import { useEffect, useState } from "react";
import { adminApi } from "@/utils/api";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/Loading";

const DisputeManagement = () => {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState("kanban"); // 'kanban' or 'list'
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchDisputes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      const params = {
        status: statusFilter || undefined,
      };
      const response = await adminApi.getDisputes(params);
      setDisputes(response.data.disputes || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching disputes:", err);
      setError("Failed to load disputes");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      New: { variant: "primary", label: "New" },
      InReview: { variant: "warning", label: "In Review" },
      UnderInvestigation: { variant: "warning", label: "Under Investigation" },
      Resolved: { variant: "success", label: "Resolved" },
      Escalated: { variant: "error", label: "Escalated" },
    };
    const statusInfo = statusMap[status] || {
      variant: "default",
      label: status,
    };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const getPriorityBadge = (priority) => {
    const priorityMap = {
      Low: { variant: "default", label: "Low" },
      Medium: { variant: "warning", label: "Medium" },
      High: { variant: "error", label: "High" },
      Critical: { variant: "error", label: "Critical" },
    };
    const priorityInfo = priorityMap[priority] || {
      variant: "default",
      label: priority,
    };
    return <Badge variant={priorityInfo.variant}>{priorityInfo.label}</Badge>;
  };

  if (loading && disputes.length === 0) {
    return <LoadingSpinner />;
  }

  const kanbanColumns = [
    {
      id: "New",
      title: "New",
      disputes: disputes.filter((d) => d.status === "New"),
    },
    {
      id: "InReview",
      title: "In Review",
      disputes: disputes.filter((d) => d.status === "InReview"),
    },
    {
      id: "UnderInvestigation",
      title: "Under Investigation",
      disputes: disputes.filter((d) => d.status === "UnderInvestigation"),
    },
    {
      id: "Resolved",
      title: "Resolved",
      disputes: disputes.filter((d) => d.status === "Resolved"),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-neutral-800">
            Dispute Management
          </h1>
          <div className="flex gap-2">
            <Button
              variant={view === "kanban" ? "primary" : "secondary"}
              onClick={() => setView("kanban")}
            >
              Kanban
            </Button>
            <Button
              variant={view === "list" ? "primary" : "secondary"}
              onClick={() => setView("list")}
            >
              List
            </Button>
          </div>
        </div>
        <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Filter by status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-neutral-50 border-2 border-neutral-200 rounded-md px-4 py-2 text-neutral-700 focus:outline-none focus:border-accent-blue"
            >
              <option value="">All</option>
              <option value="New">New</option>
              <option value="InReview">In Review</option>
              <option value="UnderInvestigation">Under Investigation</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-accent-terracotta/20 border border-accent-terracotta rounded-md p-4">
          <p className="text-accent-terracotta">{error}</p>
        </div>
      )}

      {view === "kanban" ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {kanbanColumns.map((column) => (
            <Card key={column.id}>
              <h3 className="font-semibold text-neutral-800 mb-4">
                {column.title} ({column.disputes.length})
              </h3>
              <div className="space-y-3">
                {column.disputes.map((dispute) => (
                  <div
                    key={dispute.id}
                    className="border border-neutral-200 rounded-md p-3 bg-neutral-50 hover:bg-neutral-100 cursor-pointer"
                    onClick={() => {
                      // View dispute details
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-neutral-600">
                        #{dispute.id.slice(0, 8)}
                      </span>
                      {getPriorityBadge(dispute.priority)}
                    </div>
                    <h4 className="font-medium text-neutral-800 mb-1">
                      {dispute.title}
                    </h4>
                    <p className="text-xs text-neutral-600 mb-2">
                      {dispute.type}
                    </p>
                    <p className="text-xs text-neutral-600">
                      {new Date(dispute.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left py-3 px-4 font-semibold text-neutral-800">
                    ID
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-800">
                    Title
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-800">
                    Type
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-800">
                    Priority
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-800">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-800">
                    Created
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-800">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {disputes.map((dispute) => (
                  <tr
                    key={dispute.id}
                    className="border-b border-neutral-200 hover:bg-neutral-50"
                  >
                    <td className="py-3 px-4">
                      <span className="text-sm text-neutral-600">
                        #{dispute.id.slice(0, 8)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-neutral-800">
                        {dispute.title}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-neutral-700">
                        {dispute.type}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {getPriorityBadge(dispute.priority)}
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(dispute.status)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-neutral-600">
                        {new Date(dispute.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          // View dispute details
                        }}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!loading && disputes.length === 0 && (
            <div className="text-center py-12">
              <p className="text-neutral-600">No disputes found</p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default DisputeManagement;
