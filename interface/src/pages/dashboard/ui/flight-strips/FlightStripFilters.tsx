import {
  Box,
  Autocomplete,
  Select,
  MenuItem,
  TextField,
  Chip,
} from "@mui/material";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { FLIGHT_AREA_LABELS, FLIGHT_AREAS } from "@/shared/model";
import { useLanguage } from "@/shared/lib/lang";

import type { FlightArea } from "@/shared/model";
import dayjs, { Dayjs } from "dayjs";

type ActiveFilter = "all" | "active" | "inactive";

interface FlightStripFiltersProps {
  selectedColors: FlightArea[];
  onColorsChange: (colors: FlightArea[]) => void;
  startTime: string;
  onStartTimeChange: (time: string) => void;
  endTime: string;
  onEndTimeChange: (time: string) => void;
  activeFilter: ActiveFilter;
  onActiveFilterChange: (filter: ActiveFilter) => void;
}

const parseTimeString = (timeStr: string): Dayjs | null => {
  if (!timeStr) return null;
  return dayjs(timeStr, "HH:mm");
};

const FlightStripFilters = ({
  selectedColors,
  onColorsChange,
  startTime,
  onStartTimeChange,
  endTime,
  onEndTimeChange,
  activeFilter,
  onActiveFilterChange,
}: FlightStripFiltersProps) => {
  const { t } = useLanguage();

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
              label={FLIGHT_AREA_LABELS[option]}
              {...getTagProps({ index })}
              key={option}
            />
          ))
        }
        renderOption={(props, option) => (
          <li {...props} key={option}>
            {FLIGHT_AREA_LABELS[option]}
          </li>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            label={t("filters.flightArea")}
            placeholder="{t('filters.flightAreaPlaceholder')}"
            size="small"
          />
        )}
      />

      <Select
        value={activeFilter}
        label={t("filters.status")}
        size="small"
        onChange={(e) => onActiveFilterChange(e.target.value as ActiveFilter)}
      >
        <MenuItem value="all">{t("filters.all")}</MenuItem>
        <MenuItem value="active">{t("filters.activeOnly")}</MenuItem>
        <MenuItem value="inactive">{t("filters.inactiveOnly")}</MenuItem>
      </Select>

      <TimePicker
        label={t("filters.startTime")}
        value={parseTimeString(startTime)}
        onChange={(newValue) =>
          onStartTimeChange(newValue ? newValue.format("HH:mm") : "")
        }
        ampm={false}
        slotProps={{
          textField: {
            size: "small",
            fullWidth: true,
          },
        }}
      />

      <TimePicker
        label={t("filters.endTime")}
        value={parseTimeString(endTime)}
        onChange={(newValue) =>
          onEndTimeChange(newValue ? newValue.format("HH:mm") : "")
        }
        ampm={false}
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
