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
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useStrips } from "@/shared/lib/strips";
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";
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

export const SidebarPanel = () => {
  const [strips, setStrips] = useState<FlightStripUI[]>([
    // {
    //   id: "FL001",
    //   flightArea: "red",
    //   height: 100,
    //   takeoffSpace: "A1",
    //   landingSpace: "B2",
    //   takeoffTime: "08:30",
    //   landingTime: "10:15",
    // },
    // {
    //   id: "FL002",
    //   flightArea: "blue",
    //   height: 150,
    //   takeoffSpace: "A2",
    //   landingSpace: "B3",
    //   takeoffTime: "09:45",
    //   landingTime: "11:30",
    // },
    // {
    //   id: "FL003",
    //   flightArea: "green",
    //   height: 120,
    //   takeoffSpace: "A3",
    //   landingSpace: "B1",
    //   takeoffTime: "10:20",
    //   landingTime: "12:45",
    // },
    // {
    //   id: "FL004",
    //   flightArea: "yellow",
    //   height: 180,
    //   takeoffSpace: "A4",
    //   landingSpace: "B4",
    //   takeoffTime: "11:15",
    //   landingTime: "13:20",
    // },
    // {
    //   id: "FL005",
    //   flightArea: "purple",
    //   height: 90,
    //   takeoffSpace: "A5",
    //   landingSpace: "B5",
    //   takeoffTime: "12:30",
    //   landingTime: "14:45",
    // },
    // {
    //   id: "FL006",
    //   flightArea: "orange",
    //   height: 160,
    //   takeoffSpace: "A6",
    //   landingSpace: "B6",
    //   takeoffTime: "13:45",
    //   landingTime: "15:30",
    // },
  ]);
  const [loading, setLoading] = useState(false);
  const [selectedColors, setSelectedColors] = useState<FlightArea[]>([]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingStrip, setEditingStrip] = useState<FlightStripUI | null>(null);

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

  const handleRemoveStrip = async (name: string) => {
    try {
      await FlightStripsService.delete(name);
      setStrips(strips.filter((s) => s.name !== name));
      setSnackbar({ open: true, message: `Strip ${name} has been removed` });
    } catch (error) {
      console.error("Failed to remove flight strip:", error);
      setSnackbar({ open: true, message: `Failed to remove strip ${name}` });
    }
  };

  const handleEditStrip = async (strip: FlightStripUI) => {
    setEditingStrip(strip);
    setEditDialogOpen(true);
  };

  const handleUpdateStrip = (updatedStrip: FlightStripUI) => {
    setStrips(
      strips.map((s) => (s.name === editingStrip?.name ? updatedStrip : s)),
    );
    setSnackbar({
      open: true,
      message: `Strip ${updatedStrip.name} updated successfully`,
    });
    setEditDialogOpen(false);
    setEditingStrip(null);
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

  const filteredStrips = strips.filter((strip) => {
    if (
      selectedColors.length > 0 &&
      !selectedColors.includes(strip.flightArea)
    ) {
      return false;
    }
    if (startTime && strip.takeoffTime < startTime) {
      return false;
    }
    if (endTime && strip.landingTime > endTime) {
      return false;
    }
    return true;
  });

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
            startIcon={<FilterListIcon />}
            onClick={() => setFilterDialogOpen(true)}
          >
            Filter
          </Button>
        </Box>

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
        open={filterDialogOpen}
        onClose={() => setFilterDialogOpen(false)}
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
          Filter Flight Strips
          <IconButton onClick={() => setFilterDialogOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <FlightStripFilters
            selectedColors={selectedColors}
            onColorsChange={setSelectedColors}
            startTime={startTime}
            onStartTimeChange={setStartTime}
            endTime={endTime}
            onEndTimeChange={setEndTime}
          />
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
