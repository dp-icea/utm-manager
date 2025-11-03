import { useState } from "react";
import {
  type FlightStripUI,
  FLIGHT_AREA_COLORS,
  formatFlightArea,
} from "@/shared/model";
import {
  Box,
  IconButton,
  Typography,
  Chip,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useLanguage } from "@/shared/lib/lang";

interface FlightStripCardProps {
  strip: FlightStripUI;
  onRemove: (name: string) => void;
  onEdit: (strip: FlightStripUI) => void;
  onToggle: (strip: FlightStripUI, active: boolean) => void;
}

const FlightStripCard = ({
  strip,
  onRemove,
  onEdit,
  onToggle,
}: FlightStripCardProps) => {
  const { t } = useLanguage();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: strip.name });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Box
      ref={setNodeRef}
      style={style}
      onClick={() => onEdit(strip)}
      sx={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 0.5,
        border: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
        transition: "all 0.2s",
        opacity: isDragging ? 0.5 : strip.active ? 1 : 0.6,
        cursor: isDragging ? "grabbing" : "pointer",
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
              {strip.name}
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
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Switch
              checked={strip.active}
              onChange={(e) => {
                e.stopPropagation();
                onToggle(strip, e.target.checked);
              }}
              onClick={(e) => e.stopPropagation()}
            />
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(strip.name);
              }}
              className="remove-button"
              sx={{ opacity: 0, transition: "opacity 0.2s" }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 1,
            fontSize: "0.875rem",
          }}
        >
          {strip.takeoffSpace && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <ArrowUpwardIcon sx={{ fontSize: 14, color: "primary.main" }} />
              <Typography variant="caption" color="text.secondary">
                {t("flightStrip.takeoff")}:
              </Typography>
              <Typography variant="caption" fontFamily="monospace">
                {strip.takeoffSpace}
              </Typography>
            </Box>
          )}

          {strip.landingSpace && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <ArrowDownwardIcon sx={{ fontSize: 14, color: "primary.main" }} />
              <Typography variant="caption" color="text.secondary">
                {t("flightStrip.landing")}:
              </Typography>
              <Typography variant="caption" fontFamily="monospace">
                {strip.landingSpace}
              </Typography>
            </Box>
          )}

          {strip.takeoffTime && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <AccessTimeIcon sx={{ fontSize: 14, color: "primary.main" }} />
              <Typography variant="caption" color="text.secondary">
                {t("flightStrip.depart")}:
              </Typography>
              <Typography variant="caption" fontFamily="monospace">
                {strip.takeoffTime}
              </Typography>
            </Box>
          )}

          {strip.landingTime && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <AccessTimeIcon sx={{ fontSize: 14, color: "primary.main" }} />
              <Typography variant="caption" color="text.secondary">
                {t("flightStrip.arrive")}:
              </Typography>
              <Typography variant="caption" fontFamily="monospace">
                {strip.landingTime}
              </Typography>
            </Box>
          )}

          {strip.height && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                gridColumn: "span 2",
              }}
            >
              <Typography variant="caption" color="text.secondary">
                {t("flightStrip.height")}:
              </Typography>
              <Typography
                variant="caption"
                fontFamily="monospace"
                fontWeight="bold"
              >
                {strip.height}m
              </Typography>
            </Box>
          )}

          {strip.description && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 0.25,
                gridColumn: "span 2",
                mt: 0.5,
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight="bold"
              >
                Description:
              </Typography>
              <Typography variant="caption" sx={{ fontStyle: "italic" }}>
                {strip.description}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default FlightStripCard;
