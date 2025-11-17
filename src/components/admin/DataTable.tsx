import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Pagination,
  Typography,
  Skeleton,
} from "@mui/material";
import { useState } from "react";

interface Column<T> {
  id: keyof T | string;
  label: string;
  minWidth?: number;
  align?: "right" | "left" | "center";
  format?: (value: any, row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
}

const DataTable = <T extends { id?: string | number }>({
  columns,
  data,
  loading = false,
  page = 1,
  totalPages = 1,
  onPageChange,
  onRowClick,
  emptyMessage = "No data available",
}: DataTableProps<T>) => {
  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    onPageChange?.(value);
  };

  return (
    <Box>
      <TableContainer
        component={Paper}
        sx={{
          bgcolor: "var(--neutral-100)",
          border: "1px solid var(--neutral-200)",
          borderRadius: "var(--radius-md)",
          boxShadow: "var(--shadow-soft)",
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "var(--neutral-50)" }}>
              {columns.map((column) => (
                <TableCell
                  key={String(column.id)}
                  align={column.align || "left"}
                  sx={{
                    minWidth: column.minWidth,
                    fontWeight: 600,
                    color: "var(--neutral-800)",
                    borderBottom: "2px solid var(--neutral-200)",
                  }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {columns.map((column) => (
                    <TableCell key={String(column.id)}>
                      <Skeleton variant="text" width="100%" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  align="center"
                  sx={{ py: 4 }}
                >
                  <Typography
                    variant="body2"
                    sx={{ color: "var(--neutral-600)" }}
                  >
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, rowIndex) => (
                <TableRow
                  key={row.id || rowIndex}
                  hover
                  onClick={() => onRowClick?.(row)}
                  sx={{
                    cursor: onRowClick ? "pointer" : "default",
                    "&:hover": {
                      bgcolor: "var(--neutral-50)",
                    },
                    "&:last-child td": {
                      borderBottom: "none",
                    },
                  }}
                >
                  {columns.map((column) => {
                    const value = column.id.includes(".")
                      ? column.id
                          .split(".")
                          .reduce((obj: any, key) => obj?.[key], row)
                      : (row as any)[column.id];
                    return (
                      <TableCell
                        key={String(column.id)}
                        align={column.align || "left"}
                        sx={{
                          color: "var(--neutral-700)",
                          borderBottom: "1px solid var(--neutral-200)",
                        }}
                      >
                        {column.format ? column.format(value, row) : value}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPages > 1 && !loading && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            sx={{
              "& .MuiPaginationItem-root": {
                color: "var(--neutral-700)",
                "&.Mui-selected": {
                  bgcolor: "var(--accent-blue)",
                  color: "white",
                },
              },
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default DataTable;
