import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import type { FlightArea, FlightStripUI } from "@/shared/model";
import dayjs, { Dayjs } from "dayjs";
import { FLIGHT_AREAS } from "@/shared/model";
import { useStrips } from "@/shared/lib/strips";
import { formatFlightArea } from "@/shared/model";
import { FlightStripsService } from "@/shared/api";

interface AddFlightStripFormProps {
  onAdd: (strip: FlightStripUI) => Promise<void>;
  editStrip?: FlightStripUI;
  onEdit?: (strip: FlightStripUI) => Promise<void>;
}

const AddFlightStripForm = ({
  onAdd,
  editStrip,
  onEdit,
}: AddFlightStripFormProps) => {
  const { activeStripIds } = useStrips();

  const [id, setId] = useState(editStrip?.name || "");
  const [flightArea, setFlightArea] = useState<FlightArea>(
    editStrip?.flightArea || activeStripIds[0] || "red",
  );
  const [height, setHeight] = useState(editStrip?.height.toString() || "");
  const [takeoffSpace, setTakeoffSpace] = useState(
    editStrip?.takeoffSpace || "",
  );
  const [landingSpace, setLandingSpace] = useState(
    editStrip?.landingSpace || "",
  );
  const [takeoffTime, setTakeoffTime] = useState<Dayjs | null>(
    editStrip?.takeoffTime ? dayjs(editStrip.takeoffTime, "HH:mm") : null,
  );
  const [landingTime, setLandingTime] = useState<Dayjs | null>(
    editStrip?.landingTime ? dayjs(editStrip.landingTime, "HH:mm") : null,
  );

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!takeoffTime || !landingTime) return;

    const strip: FlightStripUI = {
      name: id,
      flightArea,
      height: Number(height),
      takeoffSpace,
      landingSpace,
      takeoffTime: takeoffTime.format("HH:mm"),
      landingTime: landingTime.format("HH:mm"),
    };

    try {
      setLoading(true);

      if (editStrip && onEdit) {
        await onEdit(strip);
      } else {
        await onAdd(strip);
      }

      // Reset form
      setId("");
      setFlightArea("red");
      setHeight("");
      setTakeoffSpace("");
      setLandingSpace("");
      setTakeoffTime(null);
      setLandingTime(null);
    } catch (error) {
      console.error("Failed to create flight strip:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}
    >
      <TextField
        label="ID"
        size="small"
        fullWidth
        value={id}
        onChange={(e) => setId(e.target.value)}
        required
      />

      <FormControl size="small" fullWidth required>
        <InputLabel>Flight Area</InputLabel>
        <Select
          value={flightArea}
          label="Flight Area"
          onChange={(e) => setFlightArea(e.target.value as FlightArea)}
        >
          {FLIGHT_AREAS.map((area) => (
            <MenuItem key={area} value={area}>
              {formatFlightArea(area)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        label="Height (m)"
        size="small"
        type="number"
        fullWidth
        value={height}
        onChange={(e) => setHeight(e.target.value)}
        required
      />

      <TextField
        label="Takeoff Space"
        size="small"
        fullWidth
        value={takeoffSpace}
        onChange={(e) => setTakeoffSpace(e.target.value)}
        required
      />

      <TextField
        label="Landing Space"
        size="small"
        fullWidth
        value={landingSpace}
        onChange={(e) => setLandingSpace(e.target.value)}
        required
      />

      <TimePicker
        label="Takeoff Time"
        value={takeoffTime}
        onChange={(newValue) => setTakeoffTime(newValue)}
        ampm={false}
        slotProps={{
          textField: {
            size: "small",
            fullWidth: true,
            required: true,
          },
        }}
      />

      <TimePicker
        label="Landing Time"
        value={landingTime}
        onChange={(newValue) => setLandingTime(newValue)}
        ampm={false}
        slotProps={{
          textField: {
            size: "small",
            fullWidth: true,
            required: true,
          },
        }}
      />

      <Button type="submit" variant="contained" fullWidth>
        {editStrip ? "Save Changes" : "Add Flight Strip"}
      </Button>
    </Box>
  );
};

export default AddFlightStripForm;
