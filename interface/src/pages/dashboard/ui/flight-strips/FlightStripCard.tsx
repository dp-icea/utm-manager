import {
  type FlightStripUI,
  FLIGHT_AREA_COLORS,
  formatFlightArea,
} from "@/shared/model";
import { Box, IconButton, Typography, Chip } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface FlightStripCardProps {
  strip: FlightStripUI;
  onRemove: (id: string) => void;
}

const FlightStripCard = ({ strip, onRemove }: FlightStripCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: strip.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  console.log(FLIGHT_AREA_COLORS);

  return (
    <Box
      ref={setNodeRef}
      style={style}
      sx={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 0.5,
        border: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
        transition: "all 0.2s",
        opacity: isDragging ? 0.5 : 1,
        cursor: isDragging ? "grabbing" : "grab",
        "&:hover": {
          borderColor: "primary.main",
          boxShadow: 2,
          "& .remove-button": {
            opacity: 1,
          },
        },
      }}
    >
      {/* Color band */}
      <Box
        sx={{
          position: "absolute",
          left: 0,
          top: 0,
          height: "100%",
          width: 6,
          bgcolor: FLIGHT_AREA_COLORS[strip.flightArea],
        }}
      />

      <Box sx={{ p: 1.5, pl: 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "start",
            justifyContent: "space-between",
            mb: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              {...attributes}
              {...listeners}
              sx={{
                display: "flex",
                alignItems: "center",
                cursor: "grab",
                color: "text.secondary",
                "&:active": { cursor: "grabbing" },
                "&:hover": { color: "primary.main" },
                mr: 0.5,
              }}
            >
              <DragIndicatorIcon fontSize="small" />
            </Box>
            <Typography
              variant="h6"
              component="span"
              fontFamily="monospace"
              fontWeight="bold"
            >
              {strip.id}
            </Typography>
            <Chip
              label={formatFlightArea(strip.flightArea)}
              size="small"
              sx={{
                bgcolor: FLIGHT_AREA_COLORS[strip.flightArea],
                color: "background.default",
                fontWeight: 600,
                fontSize: "0.7rem",
              }}
            />
          </Box>
          <IconButton
            size="small"
            onClick={() => onRemove(strip.id)}
            className="remove-button"
            sx={{ opacity: 0, transition: "opacity 0.2s" }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 1,
            fontSize: "0.875rem",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <ArrowUpwardIcon sx={{ fontSize: 14, color: "primary.main" }} />
            <Typography variant="caption" color="text.secondary">
              Takeoff:
            </Typography>
            <Typography variant="caption" fontFamily="monospace">
              {strip.takeoffSpace}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <ArrowDownwardIcon sx={{ fontSize: 14, color: "primary.main" }} />
            <Typography variant="caption" color="text.secondary">
              Landing:
            </Typography>
            <Typography variant="caption" fontFamily="monospace">
              {strip.landingSpace}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <AccessTimeIcon sx={{ fontSize: 14, color: "primary.main" }} />
            <Typography variant="caption" color="text.secondary">
              Depart:
            </Typography>
            <Typography variant="caption" fontFamily="monospace">
              {strip.takeoffTime}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <AccessTimeIcon sx={{ fontSize: 14, color: "primary.main" }} />
            <Typography variant="caption" color="text.secondary">
              Arrive:
            </Typography>
            <Typography variant="caption" fontFamily="monospace">
              {strip.landingTime}
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              gridColumn: "span 2",
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Height:
            </Typography>
            <Typography
              variant="caption"
              fontFamily="monospace"
              fontWeight="bold"
            >
              {strip.height}m
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default FlightStripCard;
