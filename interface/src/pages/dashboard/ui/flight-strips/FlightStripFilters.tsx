import { Box, Autocomplete, TextField, Chip } from "@mui/material";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import type { FlightArea } from "@/shared/model";
import dayjs, { Dayjs } from "dayjs";

interface FlightStripFiltersProps {
  selectedColors: FlightArea[];
  onColorsChange: (colors: FlightArea[]) => void;
  startTime: string;
  onStartTimeChange: (time: string) => void;
  endTime: string;
  onEndTimeChange: (time: string) => void;
}

const parseTimeString = (timeStr: string): Dayjs | null => {
  if (!timeStr) return null;
  return dayjs(timeStr, "HH:mm");
};

const FLIGHT_AREAS: FlightArea[] = [
  "Red",
  "Yellow",
  "Orange",
  "Green",
  "Blue",
  "Purple",
];

const FlightStripFilters = ({
  selectedColors,
  onColorsChange,
  startTime,
  onStartTimeChange,
  endTime,
  onEndTimeChange,
}: FlightStripFiltersProps) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
      <Autocomplete
        multiple={true}
        options={FLIGHT_AREAS}
        value={selectedColors}
        onChange={(_, newValue) => onColorsChange(newValue)}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip
              variant="outlined"
              label={option}
              {...getTagProps({ index })}
              key={option}
            />
          ))
        }
        renderInput={(params) => (
          <TextField
            {...params}
            label="Flight Areas"
            placeholder="Select flight areas"
            size="small"
          />
        )}
      />

      <TimePicker
        label="Start Time"
        value={parseTimeString(startTime)}
        onChange={(newValue) =>
          onStartTimeChange(newValue ? newValue.format("HH:mm") : "")
        }
        slotProps={{
          textField: {
            size: "small",
            fullWidth: true,
          },
        }}
      />

      <TimePicker
        label="End Time"
        value={parseTimeString(endTime)}
        onChange={(newValue) =>
          onEndTimeChange(newValue ? newValue.format("HH:mm") : "")
        }
        slotProps={{
          textField: {
            size: "small",
            fullWidth: true,
          },
        }}
      />
    </Box>
  );
};

export default FlightStripFilters;
