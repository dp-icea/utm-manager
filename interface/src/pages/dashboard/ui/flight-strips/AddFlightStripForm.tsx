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
import type { FlightArea, FlightStrip } from "@/shared/model";
import dayjs, { Dayjs } from "dayjs";

const FLIGHT_AREAS: FlightArea[] = [
  "Red",
  "Yellow",
  "Orange",
  "Green",
  "Blue",
  "Purple",
];

interface AddFlightStripFormProps {
  onAdd: (strip: FlightStrip) => void;
}

const AddFlightStripForm = ({ onAdd }: AddFlightStripFormProps) => {
  const [id, setId] = useState("");
  const [flightArea, setFlightArea] = useState<FlightArea>("Red");
  const [height, setHeight] = useState("");
  const [takeoffSpace, setTakeoffSpace] = useState("");
  const [landingSpace, setLandingSpace] = useState("");
  const [takeoffTime, setTakeoffTime] = useState<Dayjs | null>(null);
  const [landingTime, setLandingTime] = useState<Dayjs | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!takeoffTime || !landingTime) return;

    const newStrip: FlightStrip = {
      id,
      flightArea,
      height: Number(height),
      takeoffSpace,
      landingSpace,
      takeoffTime: takeoffTime.format("HH:mm"),
      landingTime: landingTime.format("HH:mm"),
    };

    onAdd(newStrip);

    // Reset form
    setId("");
    setFlightArea("Red");
    setHeight("");
    setTakeoffSpace("");
    setLandingSpace("");
    setTakeoffTime(null);
    setLandingTime(null);
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
              {area}
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
        slotProps={{
          textField: {
            size: "small",
            fullWidth: true,
            required: true,
          },
        }}
      />

      <Button type="submit" variant="contained" fullWidth>
        Add Strip
      </Button>
    </Box>
  );
};

export default AddFlightStripForm;
