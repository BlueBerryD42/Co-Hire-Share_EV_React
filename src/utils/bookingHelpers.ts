export const parseServerIso = (iso?: string): Date => {
  if (!iso) return new Date(NaN);
  // If string already has timezone info (Z or ±HH:MM), parse directly
  if (iso.includes("Z") || /[+-]\d{2}:\d{2}$/.test(iso)) return new Date(iso);
  // Otherwise assume it's a UTC instant without zone and append 'Z'
  return new Date(iso + "Z");
};

export const localIso = (d: Date) => {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const isInactiveStatus = (status?: number | string) => {
  if (status === undefined || status === null) return false;
  if (typeof status === "number") return status === 4 || status === 5;
  // cover string forms like "4" or enum names like "Completed"
  if (/^\d+$/.test(status)) return Number(status) === 4 || Number(status) === 5;
  return (
    status.toLowerCase() === "completed" || status.toLowerCase() === "cancelled"
  );
};

export const formatDateTimeVN = (d?: Date | null) => {
  if (!d) return "--";
  try {
    return d.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch (e) {
    return d.toLocaleString();
  }
};

export const formatDateVN = (d?: Date | null) => {
  if (!d) return "--";
  try {
    return d.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch (e) {
    return d.toLocaleDateString();
  }
};

export default {
  parseServerIso,
  localIso,
  isInactiveStatus,
  formatDateTimeVN,
  formatDateVN,
};
