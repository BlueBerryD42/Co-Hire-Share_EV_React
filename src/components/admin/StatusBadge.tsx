import { Chip } from "@mui/material";

interface StatusBadgeProps {
  status: string;
  variant?: "default" | "success" | "warning" | "error" | "info";
  size?: "small" | "medium";
}

const StatusBadge = ({ status, variant, size = "small" }: StatusBadgeProps) => {
  const getVariant = (
    status: string
  ): "default" | "success" | "warning" | "error" | "info" => {
    if (variant) return variant;

    const statusLower = status.toLowerCase();
    if (
      statusLower.includes("active") ||
      statusLower.includes("approved") ||
      statusLower.includes("completed") ||
      statusLower.includes("success")
    ) {
      return "success";
    }
    if (
      statusLower.includes("pending") ||
      statusLower.includes("warning") ||
      statusLower.includes("inactive")
    ) {
      return "warning";
    }
    if (
      statusLower.includes("error") ||
      statusLower.includes("failed") ||
      statusLower.includes("rejected") ||
      statusLower.includes("suspended")
    ) {
      return "error";
    }
    if (statusLower.includes("info") || statusLower.includes("new")) {
      return "info";
    }
    return "default";
  };

  const getColor = (variant: string) => {
    switch (variant) {
      case "success":
        return { bgcolor: "var(--accent-green)", color: "white" };
      case "warning":
        return { bgcolor: "var(--accent-gold)", color: "white" };
      case "error":
        return { bgcolor: "var(--accent-terracotta)", color: "white" };
      case "info":
        return { bgcolor: "var(--accent-blue)", color: "white" };
      default:
        return { bgcolor: "var(--neutral-200)", color: "var(--neutral-700)" };
    }
  };

  const chipVariant = getVariant(status);
  const colors = getColor(chipVariant);

  return (
    <Chip
      label={status}
      size={size}
      sx={{
        ...colors,
        fontWeight: 500,
        fontSize: "0.75rem",
        height: size === "small" ? 24 : 32,
      }}
    />
  );
};

export default StatusBadge;
