import { useState, useEffect } from "react";
import type { FlightArea, FlightStripUI } from "@/shared/model";
import {
  Box,
  Typography,
  Snackbar,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useStrips } from "@/shared/lib/strips";
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/ui";
import SortIcon from "@mui/icons-material/Sort";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import FlightStripCard from "./flight-strips/FlightStripCard";
import AddFlightStripForm from "./flight-strips/AddFlightStripForm";
import FlightStripFilters from "./flight-strips/FlightStripFilters";
import { areArraysEqual } from "@/shared/lib";
import { FlightStripsService } from "@/shared/api";

type SortMode = "normal" | "byId" | "activeFirst";
type ActiveFilter = "all" | "active" | "inactive";

export const SidebarPanel = () => {
  const [strips, setStrips] = useState<FlightStripUI[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedColors, setSelectedColors] = useState<FlightArea[]>([]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("all");
  const [sortMode, setSortMode] = useState<SortMode>("normal");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingStrip, setEditingStrip] = useState<FlightStripUI | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [stripToDelete, setStripToDelete] = useState<string | null>(null);

  const [toggleDialogOpen, setActiveDialogOpen] = useState(false);
  const [pendingActiveState, setPendingActiveState] = useState<boolean>(false);
  const [stripToToggle, setStripToToggle] = useState<FlightStripUI | null>(
    null,
  );

  const { activeStripIds, setActiveStripIds } = useStrips();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleAddStrip = async (strip: FlightStripUI) => {
    try {
      await FlightStripsService.create(strip);
      setStrips([...strips, strip]);
      setSnackbar({
        open: true,
        message: `Flight strip added: ${strip.name} - ${strip.flightArea} area`,
      });
      setAddDialogOpen(false);
    } catch (error) {
      console.error("Failed to add flight strip:", error);
      setSnackbar({ open: true, message: "Failed to add flight strip" });
    }
  };

  const handleRemoveStrip = (name: string) => {
    setStripToDelete(name);
    setDeleteDialogOpen(true);
  };

  const handleToggleStrip = (strip: FlightStripUI) => {
    setStripToToggle(strip);
    setPendingActiveState(!strip.active);
    setActiveDialogOpen(true);
  };

  const handleConfirmToggle = async () => {
    try {
      if (stripToToggle) {
        const updatedStrip = { ...stripToToggle, active: pendingActiveState };
        await FlightStripsService.update(updatedStrip);
        setStrips(
          strips.map((s) => (s.name === updatedStrip.name ? updatedStrip : s)),
        );
        setSnackbar({
          open: true,
          message: `Strip ${updatedStrip.name} marked as ${updatedStrip.active ? "active" : "inactive"
            }`,
        });
        setActiveDialogOpen(false);
        setStripToToggle(null);
      }
    } catch (error) {
      console.error("Failed to update flight strip status:", error);
      setSnackbar({ open: true, message: "Failed to update flight strip" });
    }
  };

  const handleConfirmDelete = async (name: string) => {
    try {
      if (name) {
        await FlightStripsService.delete(name);
        setStrips(strips.filter((s) => s.name !== name));
        setSnackbar({ open: true, message: `Strip ${name} has been removed` });
        setDeleteDialogOpen(false);
        setStripToDelete(null);
      }
    } catch (error) {
      console.error("Failed to remove flight strip:", error);
      setSnackbar({ open: true, message: `Failed to remove strip ${name}` });
    }
  };

  const handleEditStrip = async (strip: FlightStripUI) => {
    setEditingStrip(strip);
    setEditDialogOpen(true);
  };

  const handleUpdateStrip = async (updatedStrip: FlightStripUI) => {
    try {
      await FlightStripsService.update(updatedStrip);
      setStrips(
        strips.map((s) => (s.name === editingStrip?.name ? updatedStrip : s)),
      );
      setSnackbar({
        open: true,
        message: `Strip ${updatedStrip.name} updated successfully`,
      });
      setEditDialogOpen(false);
      setEditingStrip(null);
    } catch (error) {
      console.error("Failed to update flight strip:", error);
      setSnackbar({ open: true, message: "Failed to update flight strip" });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setStrips((items) => {
        const oldIndex = items.findIndex((item) => item.name === active.id);
        const newIndex = items.findIndex((item) => item.name === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // const filteredStrips = strips.filter((strip) => {
  //   if (
  //     selectedColors.length > 0 &&
  //     !selectedColors.includes(strip.flightArea)
  //   ) {
  //     return false;
  //   }
  //   if (startTime && strip.takeoffTime && strip.takeoffTime < startTime) {
  //     return false;
  //   }
  //   if (endTime && strip.landingTime && strip.landingTime > endTime) {
  //     return false;
  //   }
  //   return true;
  // });

  const handleCycleSorting = () => {
    setSortMode((prev) => {
      if (prev === "normal") return "byId";
      if (prev === "byId") return "activeFirst";
      return "normal";
    });
  };

  const getSortLabel = () => {
    if (sortMode === "byId") return "Sorted by ID";
    if (sortMode === "activeFirst") return "Active First";
    return "Sort";
  };

  const filteredStrips = (() => {
    let result = strips.filter((strip) => {
      if (
        selectedColors.length > 0 &&
        !selectedColors.includes(strip.flightArea)
      ) {
        return false;
      }
      if (startTime && strip.takeoffTime && strip.takeoffTime < startTime) {
        return false;
      }
      if (endTime && strip.landingTime && strip.landingTime > endTime) {
        return false;
      }
      if (activeFilter === "active" && !strip.active) {
        return false;
      }
      if (activeFilter === "inactive" && strip.active) {
        return false;
      }
      return true;
    });

    // Apply sorting
    if (sortMode === "byId") {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortMode === "activeFirst") {
      result = [...result].sort((a, b) => {
        if (a.active === b.active) return 0;
        return a.active ? -1 : 1;
      });
    }

    return result;
  })();

  const onRegionSelectOnViewer = () => {
    console.log("On Region Select On Viewer");
    console.log("Active Regions in the Map", activeStripIds);
    console.log("Selected Colors in Filter", selectedColors);
    if (!areArraysEqual(activeStripIds, selectedColors)) {
      setSelectedColors(activeStripIds as FlightArea[]);
    }
  };

  const onRegionSelectOnFilter = () => {
    console.log("On Region Select On Filter");
    console.log("Active Regions in the Map", activeStripIds);
    console.log("Selected Colors in Filter", selectedColors);
    if (!areArraysEqual(activeStripIds, selectedColors)) {
      setActiveStripIds(selectedColors);
    }
  };

  useEffect(() => {
    const fetchStrips = async () => {
      try {
        setLoading(true);
        const strips = await FlightStripsService.listAll();
        console.log("+++ There it is the strips +++");
        setStrips(strips);
      } catch (error) {
        console.error("Failed to fetch flight strips:", error);
        setSnackbar({ open: true, message: "Failed to load flight strips" });
      } finally {
        setLoading(false);
      }
    };

    fetchStrips();
  }, []);

  useEffect(onRegionSelectOnViewer, [activeStripIds]);
  useEffect(onRegionSelectOnFilter, [selectedColors]);

  return (
    <>
      <Box
        sx={{
          width: "100%",
          height: "100%",
          borderRight: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            p: 2,
            display: "flex",
            gap: 1,
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAddDialogOpen(true)}
            fullWidth
          >
            Add Strip
          </Button>
          <Button
            variant="outlined"
            startIcon={<SortIcon />}
            onClick={handleCycleSorting}
            sx={{ minWidth: "fit-content" }}
          >
            {getSortLabel()}
          </Button>
        </Box>

        <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
          <Box sx={{ px: 2, py: 2, borderBottom: 1, borderColor: "divider" }}>
            <CollapsibleTrigger asChild>
              <Button
                variant="text"
                startIcon={<FilterListIcon />}
                endIcon={
                  filtersOpen ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )
                }
                fullWidth
                sx={{ justifyContent: "space-between" }}
              >
                Filters
              </Button>
            </CollapsibleTrigger>
          </Box>
          <CollapsibleContent>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
              <FlightStripFilters
                selectedColors={selectedColors}
                onColorsChange={setSelectedColors}
                startTime={startTime}
                onStartTimeChange={setStartTime}
                endTime={endTime}
                onEndTimeChange={setEndTime}
                activeFilter={activeFilter}
                onActiveFilterChange={setActiveFilter}
              />
            </Box>
          </CollapsibleContent>
        </Collapsible>

        <Box sx={{ flex: 1, overflowY: "auto", p: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Flight Strips ({filteredStrips.length})
          </Typography>
          {filteredStrips.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No flight strips to display
            </Typography>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={filteredStrips.map((s) => s.name)}
                strategy={verticalListSortingStrategy}
              >
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
                >
                  {filteredStrips.map((strip) => (
                    <FlightStripCard
                      key={strip.name}
                      strip={strip}
                      onRemove={handleRemoveStrip}
                      onEdit={handleEditStrip}
                      onToggle={handleToggleStrip}
                    />
                  ))}
                </Box>
              </SortableContext>
            </DndContext>
          )}
        </Box>
      </Box>

      <Dialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          Add Flight Strip
          <IconButton onClick={() => setAddDialogOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <AddFlightStripForm onAdd={handleAddStrip} />
        </DialogContent>
      </Dialog>

      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          Edit Flight Strip
          <IconButton onClick={() => setEditDialogOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {editingStrip && (
            <AddFlightStripForm
              onAdd={handleAddStrip}
              editStrip={editingStrip}
              onEdit={handleUpdateStrip}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete flight strip {stripToDelete}? This
            action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogContent
          sx={{ display: "flex", justifyContent: "flex-end", gap: 1, pt: 0 }}
        >
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => handleConfirmDelete(stripToDelete!)}
            variant="contained"
            color="error"
          >
            Delete
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog
        open={toggleDialogOpen}
        onClose={() => setActiveDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirm Status Change</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to mark this flight strip as{" "}
            {pendingActiveState ? "active" : "inactive"}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActiveDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmToggle}
            variant="contained"
            color="primary"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity="success"
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};
