import { useEffect, useState } from "react";
import { adminApi } from "@/utils/api";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/Loading";

const FinancialReports = () => {
  const [financialOverview, setFinancialOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportType, setReportType] = useState("overview"); // 'overview', 'groups', 'payments', 'expenses'

  useEffect(() => {
    fetchFinancialOverview();
  }, [reportType]);

  const fetchFinancialOverview = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getFinancialOverview();
      setFinancialOverview(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching financial overview:", err);
      setError("Failed to load financial data");
    } finally {
      setLoading(false);
    }
  };

  const handleExportPdf = async () => {
    try {
      const response = await adminApi.generateFinancialPdf({
        type: reportType,
      });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `financial_report_${new Date().toISOString()}.pdf`;
      a.click();
    } catch (err) {
      console.error("Error exporting PDF:", err);
      alert("Failed to export PDF");
    }
  };

  const handleExportExcel = async () => {
    try {
      const response = await adminApi.generateFinancialExcel({
        type: reportType,
      });
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `financial_report_${new Date().toISOString()}.xlsx`;
      a.click();
    } catch (err) {
      console.error("Error exporting Excel:", err);
      alert("Failed to export Excel");
    }
  };

  if (loading && !financialOverview) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-800">
          Financial Reports
        </h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleExportPdf}>
            Export PDF
          </Button>
          <Button variant="secondary" onClick={handleExportExcel}>
            Export Excel
          </Button>
        </div>
      </div>

      <div className="flex gap-2 border-b border-neutral-200">
        {["overview", "groups", "payments", "expenses"].map((type) => (
          <button
            key={type}
            onClick={() => setReportType(type)}
            className={`px-4 py-2 font-medium capitalize ${
              reportType === type
                ? "text-accent-blue border-b-2 border-accent-blue"
                : "text-neutral-600 hover:text-neutral-800"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-accent-terracotta/20 border border-accent-terracotta rounded-md p-4">
          <p className="text-accent-terracotta">{error}</p>
        </div>
      )}

      {financialOverview && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <h3 className="text-lg font-bold text-neutral-800 mb-4">
              Total Revenue
            </h3>
            <p className="text-3xl font-bold text-accent-green">
              ${financialOverview.totalRevenue?.toFixed(2) || "0.00"}
            </p>
            <p className="text-sm text-neutral-600 mt-2">
              {financialOverview.revenueGrowthPercentage >= 0 ? "+" : ""}
              {financialOverview.revenueGrowthPercentage?.toFixed(1)}% growth
            </p>
          </Card>

          <Card>
            <h3 className="text-lg font-bold text-neutral-800 mb-4">
              Total Expenses
            </h3>
            <p className="text-3xl font-bold text-accent-terracotta">
              ${financialOverview.totalExpenses?.toFixed(2) || "0.00"}
            </p>
            <p className="text-sm text-neutral-600 mt-2">
              {financialOverview.expenseGrowthPercentage >= 0 ? "+" : ""}
              {financialOverview.expenseGrowthPercentage?.toFixed(1)}% change
            </p>
          </Card>

          <Card>
            <h3 className="text-lg font-bold text-neutral-800 mb-4">
              Net Profit
            </h3>
            <p className="text-3xl font-bold text-neutral-800">
              ${financialOverview.netProfit?.toFixed(2) || "0.00"}
            </p>
            <p className="text-sm text-neutral-600 mt-2">
              Profit margin: {financialOverview.profitMargin?.toFixed(1)}%
            </p>
          </Card>
        </div>
      )}

      <Card>
        <h3 className="text-lg font-bold text-neutral-800 mb-4">
          Financial Breakdown
        </h3>
        <div className="space-y-4">
          {/* Add charts and detailed breakdown here */}
          <p className="text-neutral-600">
            Detailed financial breakdown will be displayed here
          </p>
        </div>
      </Card>
    </div>
  );
};

export default FinancialReports;
