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
import { useLanguage } from "@/shared/lib/lang";

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
  const { t } = useLanguage();

  const [id, setId] = useState(editStrip?.name || "");
  const [flightArea, setFlightArea] = useState<FlightArea>(
    editStrip?.flightArea || activeStripIds[0] || "red",
  );
  const [height, setHeight] = useState(editStrip?.height?.toString() || "");
  const [takeoffSpace, setTakeoffSpace] = useState(
    editStrip?.takeoffSpace || "",
  );
  const [landingSpace, setLandingSpace] = useState(
    editStrip?.landingSpace || "",
  );
  const [description, setDescription] = useState(editStrip?.description || "");
  const [takeoffTime, setTakeoffTime] = useState<Dayjs | null>(
    editStrip?.takeoffTime ? dayjs(editStrip.takeoffTime, "HH:mm") : null,
  );
  const [landingTime, setLandingTime] = useState<Dayjs | null>(
    editStrip?.landingTime ? dayjs(editStrip.landingTime, "HH:mm") : null,
  );

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const strip: FlightStripUI = {
      name: id,
      flightArea,
      ...(height && { height: Number(height) }),
      ...(takeoffSpace && { takeoffSpace }),
      ...(landingSpace && { landingSpace }),
      ...(takeoffTime && { takeoffTime: takeoffTime.format("HH:mm") }),
      ...(landingTime && { landingTime: landingTime.format("HH:mm") }),
      ...(description && { description }),
      active: editStrip?.active ?? false,
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
      setDescription("");
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
        label={t("common.id")}
        size="small"
        fullWidth
        value={id}
        onChange={(e) => setId(e.target.value)}
        required
        disabled={!!editStrip}
      />

      <FormControl size="small" fullWidth required>
        <InputLabel>{t("common.flightArea")}</InputLabel>
        <Select
          value={flightArea}
          label={t("common.flightArea")}
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
        label={t("addStrip.height")}
        size="small"
        type="number"
        fullWidth
        value={height}
        onChange={(e) => setHeight(e.target.value)}
      />

      <TextField
        label={t("addStrip.takeoffSpace")}
        size="small"
        fullWidth
        value={takeoffSpace}
        onChange={(e) => setTakeoffSpace(e.target.value)}
      />

      <TextField
        label={t("addStrip.landingSpace")}
        size="small"
        fullWidth
        value={landingSpace}
        onChange={(e) => setLandingSpace(e.target.value)}
      />

      <TextField
        label={t("addStrip.description")}
        size="small"
        fullWidth
        multiline
        rows={2}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder={t("addStrip.descriptionPlaceholder")}
      />

      <TimePicker
        label={t("addStrip.takeoffTime")}
        value={takeoffTime}
        onChange={(newValue) => setTakeoffTime(newValue)}
        ampm={false}
        slotProps={{
          textField: {
            size: "small",
            fullWidth: true,
          },
        }}
      />

      <TimePicker
        label={t("addStrip.landingTime")}
        value={landingTime}
        onChange={(newValue) => setLandingTime(newValue)}
        ampm={false}
        slotProps={{
          textField: {
            size: "small",
            fullWidth: true,
          },
        }}
      />

      <Button type="submit" variant="contained" fullWidth>
        {editStrip ? t("addStrip.saveChanges") : t("addStrip.addFlightStrip")}
      </Button>
    </Box>
  );
};

export default AddFlightStripForm;
