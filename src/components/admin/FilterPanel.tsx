import {
  Drawer,
  Box,
  Typography,
  TextField,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Checkbox,
  FormControlLabel,
  Divider,
} from "@mui/material";
import { FilterList, Clear } from "@mui/icons-material";
import { useState } from "react";

interface FilterOption {
  label: string;
  value: string;
}

interface FilterConfig {
  type: "text" | "select" | "multiselect" | "date" | "range" | "checkbox";
  label: string;
  key: string;
  options?: FilterOption[];
  min?: number;
  max?: number;
  step?: number;
}

interface FilterPanelProps {
  open: boolean;
  onClose: () => void;
  filters: FilterConfig[];
  appliedFilters: Record<string, any>;
  onApplyFilters: (filters: Record<string, any>) => void;
  onClearFilters: () => void;
}

const FilterPanel = ({
  open,
  onClose,
  filters,
  appliedFilters,
  onApplyFilters,
  onClearFilters,
}: FilterPanelProps) => {
  const [localFilters, setLocalFilters] =
    useState<Record<string, any>>(appliedFilters);

  const handleFilterChange = (key: string, value: any) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleClear = () => {
    setLocalFilters({});
    onClearFilters();
  };

  const renderFilter = (filter: FilterConfig) => {
    switch (filter.type) {
      case "text":
        return (
          <TextField
            key={filter.key}
            fullWidth
            label={filter.label}
            value={localFilters[filter.key] || ""}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            sx={{ mb: 2 }}
          />
        );

      case "select":
        return (
          <FormControl key={filter.key} fullWidth sx={{ mb: 2 }}>
            <InputLabel>{filter.label}</InputLabel>
            <Select
              value={localFilters[filter.key] || ""}
              onChange={(e) => handleFilterChange(filter.key, e.target.value)}
              label={filter.label}
            >
              <MenuItem value="">All</MenuItem>
              {filter.options?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case "multiselect":
        return (
          <FormControl key={filter.key} fullWidth sx={{ mb: 2 }}>
            <InputLabel>{filter.label}</InputLabel>
            <Select
              multiple
              value={localFilters[filter.key] || []}
              onChange={(e) => handleFilterChange(filter.key, e.target.value)}
              label={filter.label}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((value: string) => {
                    const option = filter.options?.find(
                      (opt) => opt.value === value
                    );
                    return (
                      <Chip
                        key={value}
                        label={option?.label || value}
                        size="small"
                      />
                    );
                  })}
                </Box>
              )}
            >
              {filter.options?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  <Checkbox
                    checked={(localFilters[filter.key] || []).includes(
                      option.value
                    )}
                  />
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case "range":
        return (
          <Box key={filter.key} sx={{ mb: 2 }}>
            <Typography
              variant="body2"
              sx={{ mb: 1, color: "var(--neutral-700)" }}
            >
              {filter.label}
            </Typography>
            <Slider
              value={
                localFilters[filter.key] || [filter.min || 0, filter.max || 100]
              }
              onChange={(_, value) => handleFilterChange(filter.key, value)}
              min={filter.min || 0}
              max={filter.max || 100}
              step={filter.step || 1}
              valueLabelDisplay="auto"
            />
            <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
              <TextField
                type="number"
                size="small"
                value={
                  Array.isArray(localFilters[filter.key])
                    ? localFilters[filter.key][0]
                    : filter.min || 0
                }
                onChange={(e) => {
                  const newValue = Array.isArray(localFilters[filter.key])
                    ? [Number(e.target.value), localFilters[filter.key][1]]
                    : [Number(e.target.value), filter.max || 100];
                  handleFilterChange(filter.key, newValue);
                }}
                sx={{ flex: 1 }}
              />
              <TextField
                type="number"
                size="small"
                value={
                  Array.isArray(localFilters[filter.key])
                    ? localFilters[filter.key][1]
                    : filter.max || 100
                }
                onChange={(e) => {
                  const newValue = Array.isArray(localFilters[filter.key])
                    ? [localFilters[filter.key][0], Number(e.target.value)]
                    : [filter.min || 0, Number(e.target.value)];
                  handleFilterChange(filter.key, newValue);
                }}
                sx={{ flex: 1 }}
              />
            </Box>
          </Box>
        );

      case "checkbox":
        return (
          <FormControlLabel
            key={filter.key}
            control={
              <Checkbox
                checked={localFilters[filter.key] || false}
                onChange={(e) =>
                  handleFilterChange(filter.key, e.target.checked)
                }
              />
            }
            label={filter.label}
            sx={{ mb: 1 }}
          />
        );

      default:
        return null;
    }
  };

  const appliedCount = Object.keys(appliedFilters).filter(
    (key) =>
      appliedFilters[key] !== undefined &&
      appliedFilters[key] !== "" &&
      appliedFilters[key] !== null
  ).length;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 400 },
          bgcolor: "var(--neutral-100)",
          p: 3,
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <FilterList sx={{ color: "var(--accent-blue)" }} />
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, color: "var(--neutral-800)" }}
          >
            Filters
          </Typography>
        </Box>
        {appliedCount > 0 && (
          <Chip
            label={appliedCount}
            size="small"
            sx={{
              bgcolor: "var(--accent-blue)",
              color: "white",
            }}
          />
        )}
      </Box>

      <Box sx={{ flex: 1, overflowY: "auto" }}>{filters.map(renderFilter)}</Box>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ display: "flex", gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<Clear />}
          onClick={handleClear}
          fullWidth
          sx={{
            borderColor: "var(--neutral-300)",
            color: "var(--neutral-700)",
            "&:hover": {
              borderColor: "var(--neutral-400)",
              bgcolor: "var(--neutral-50)",
            },
          }}
        >
          Clear All
        </Button>
        <Button
          variant="contained"
          onClick={handleApply}
          fullWidth
          sx={{
            bgcolor: "var(--accent-blue)",
            color: "white",
            "&:hover": {
              bgcolor: "var(--accent-blue)",
              opacity: 0.9,
            },
          }}
        >
          Apply ({appliedCount})
        </Button>
      </Box>
    </Drawer>
  );
};

export default FilterPanel;
