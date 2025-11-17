import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  TextField,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Typography,
  Box,
  Divider,
} from "@mui/material";
import {
  Search as SearchIcon,
  DirectionsCar,
  CalendarToday,
  Receipt,
  Description,
  People,
  Help,
} from "@mui/icons-material";

interface SearchResult {
  id: string;
  type: "vehicle" | "booking" | "expense" | "document" | "member" | "help";
  title: string;
  subtitle?: string;
  path: string;
}

interface GlobalSearchProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

const GlobalSearch = ({ open, onClose, onNavigate }: GlobalSearchProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const search = async () => {
      setLoading(true);
      try {
        // TODO: Replace with actual API call
        // const response = await searchApi.search(query);
        // setResults(response.data);

        // Mock results for now
        const mockResults: SearchResult[] = [];
        setResults(mockResults);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(search, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.type]) {
      acc[result.type] = [];
    }
    acc[result.type].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  const typeLabels = {
    vehicle: "Vehicles",
    booking: "Bookings",
    expense: "Expenses",
    document: "Documents",
    member: "Members",
    help: "Help Articles",
  };

  const typeIcons = {
    vehicle: DirectionsCar,
    booking: CalendarToday,
    expense: Receipt,
    document: Description,
    member: People,
    help: Help,
  };

  const handleResultClick = (path: string) => {
    onNavigate(path);
    onClose();
    setQuery("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: "var(--neutral-100)",
          borderRadius: "var(--radius-lg)",
          maxHeight: "80vh",
        },
      }}
    >
      <Box sx={{ p: 3 }}>
        <TextField
          inputRef={inputRef}
          fullWidth
          placeholder="Search for bookings, vehicles, expenses..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          InputProps={{
            startAdornment: (
              <SearchIcon sx={{ mr: 1, color: "var(--neutral-600)" }} />
            ),
            sx: {
              bgcolor: "var(--neutral-50)",
              borderRadius: "var(--radius-md)",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "var(--neutral-200)",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "var(--neutral-300)",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "var(--accent-blue)",
              },
            },
          }}
        />

        {query && (
          <Box sx={{ mt: 2, maxHeight: "60vh", overflowY: "auto" }}>
            {loading ? (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  Searching...
                </Typography>
              </Box>
            ) : Object.keys(groupedResults).length > 0 ? (
              Object.entries(groupedResults).map(
                ([type, items], typeIndex, allTypes) => {
                  const Icon = typeIcons[type as keyof typeof typeIcons];
                  return (
                    <Box key={type} sx={{ mb: 2 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          mb: 1,
                          px: 2,
                        }}
                      >
                        <Icon
                          sx={{
                            fontSize: 18,
                            mr: 1,
                            color: "var(--neutral-600)",
                          }}
                        />
                        <Typography
                          variant="subtitle2"
                          sx={{ color: "var(--neutral-600)" }}
                        >
                          {typeLabels[type as keyof typeof typeLabels]}
                        </Typography>
                      </Box>
                      <List sx={{ p: 0 }}>
                        {items.map((item) => (
                          <ListItem key={item.id} disablePadding>
                            <ListItemButton
                              onClick={() => handleResultClick(item.path)}
                            >
                              <ListItemIcon>
                                <Icon sx={{ color: "var(--neutral-600)" }} />
                              </ListItemIcon>
                              <ListItemText
                                primary={item.title}
                                secondary={item.subtitle}
                                primaryTypographyProps={{
                                  sx: {
                                    color: "var(--neutral-800)",
                                    fontWeight: 500,
                                  },
                                }}
                                secondaryTypographyProps={{
                                  sx: {
                                    color: "var(--neutral-600)",
                                    fontSize: "0.875rem",
                                  },
                                }}
                              />
                            </ListItemButton>
                          </ListItem>
                        ))}
                      </List>
                      {typeIndex < allTypes.length - 1 && (
                        <Divider sx={{ mt: 1 }} />
                      )}
                    </Box>
                  );
                }
              )
            ) : (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  No results found
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Try different keywords
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {!query && (
          <Box sx={{ mt: 3 }}>
            <Typography
              variant="caption"
              sx={{ color: "var(--neutral-600)", display: "block", mb: 2 }}
            >
              Recent searches
            </Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {/* Recent searches would go here */}
            </Box>
          </Box>
        )}

        <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid var(--neutral-200)" }}>
          <Typography variant="caption" sx={{ color: "var(--neutral-500)" }}>
            Press ESC to close
          </Typography>
        </Box>
      </Box>
    </Dialog>
  );
};

export default GlobalSearch;
