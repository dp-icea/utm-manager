import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  IconButton,
  AppBar,
  Toolbar,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { toast } from "sonner";
import { ROUTES } from "@/shared/config";
import { useLanguage } from "@/shared/lib/lang";
import { DroneMappingsService } from "@/shared/api/drone-mappings";
import { type DroneMappingUI } from "@/shared/model";

// Use DroneMappingUI from shared model
type DroneMapping = DroneMappingUI;

export const DroneMappingPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [mappings, setMappings] = useState<DroneMapping[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load from backend API on mount
    const loadMappings = async () => {
      try {
        setLoading(true);
        const backendMappings = await DroneMappingsService.listAll();

        if (backendMappings.length > 0) {
          setMappings(backendMappings);
        } else {
          // Start with one empty row if no mappings exist
          setMappings([{ id: "", serialNumber: "", sisant: "" }]);
        }
      } catch (error) {
        console.error("Failed to load drone mappings:", error);
        toast.error(t("droneMapping.loadError"));
        // Start with one empty row on error
        setMappings([{ id: "", serialNumber: "", sisant: "" }]);
      } finally {
        setLoading(false);
      }
    };

    loadMappings();
  }, [t]);

  const handleAddRow = () => {
    setMappings([...mappings, { id: "", serialNumber: "", sisant: "" }]);
  };

  const handleDeleteRow = (index: number) => {
    const newMappings = mappings.filter((_, i) => i !== index);
    setMappings(newMappings);
  };

  const handleFieldChange = (
    index: number,
    field: keyof DroneMapping,
    value: string,
  ) => {
    const newMappings = [...mappings];
    newMappings[index][field] = value;
    setMappings(newMappings);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split("\n").filter((line) => line.trim());

        // Skip header row if it exists
        const startIndex = lines[0].toLowerCase().includes("id") ? 1 : 0;

        const newMappings: DroneMapping[] = lines
          .slice(startIndex)
          .map((line) => {
            const [id, serialNumber, sisant] = line
              .split(",")
              .map((val) => val.trim());
            return {
              id: id || "",
              serialNumber: serialNumber || "",
              sisant: sisant || "",
            };
          });

        if (newMappings.length > 0) {
          setMappings(newMappings);
          toast.success(
            t("droneMapping.loadedFromCSV", { count: newMappings.length }),
          );
        } else {
          toast.error(t("droneMapping.noValidData"));
        }
      } catch (error) {
        toast.error(t("droneMapping.csvParseError"));
        console.error("CSV parse error:", error);
      }
    };
    reader.readAsText(file);

    // Reset input so the same file can be uploaded again
    event.target.value = "";
  };

  const handleSend = async () => {
    // Validate that at least one row has data
    const validMappings = mappings.filter(
      (m) => m.id && (m.serialNumber || m.sisant),
    );

    if (validMappings.length === 0) {
      toast.error(t("droneMapping.addAtLeastOne"));
      return;
    }

    try {
      setLoading(true);

      // Use the service to bulk create mappings
      await DroneMappingsService.bulkCreate(
        validMappings,
        "user", // You can get this from auth context if available
      );

      toast.success(t("droneMapping.saved"));
      navigate(ROUTES.DASHBOARD);
    } catch (error: any) {
      console.error("Failed to save drone mappings:", error);
      const errorMessage =
        error.response?.data?.detail || error.message || "Unknown error";
      toast.error(t("droneMapping.saveError") + ": " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(ROUTES.DASHBOARD);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        bgcolor: "background.default",
      }}
    >
      <AppBar
        position="static"
        elevation={0}
        sx={{ borderBottom: 1, borderColor: "divider" }}
      >
        <Toolbar sx={{ px: 3 }}>
          <IconButton
            edge="start"
            color="inherit"
            onClick={handleCancel}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography
            variant="h6"
            component="h1"
            fontWeight="bold"
            sx={{ flex: 1 }}
          >
            {t("droneMapping.configuration")}
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ flex: 1, p: 3, overflow: "auto" }}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography variant="h6">{t("droneMapping.mappings")}</Typography>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<UploadFileIcon />}
                component="label"
              >
                {t("droneMapping.uploadCSV")}
                <input
                  type="file"
                  accept=".csv"
                  hidden
                  onChange={handleFileUpload}
                />
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddRow}
              >
                {t("droneMapping.addRow")}
              </Button>
            </Box>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t("droneMapping.csvFormat")}
          </Typography>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t("droneMapping.idName")}</TableCell>
                  <TableCell>{t("droneMapping.serialNumberSN")}</TableCell>
                  <TableCell>{t("droneMapping.sisantNumber")}</TableCell>
                  <TableCell width={80}>{t("droneMapping.actions")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mappings.map((mapping, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        value={mapping.id}
                        onChange={(e) =>
                          handleFieldChange(index, "id", e.target.value)
                        }
                        placeholder={t("droneMapping.enterIdName")}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        value={mapping.serialNumber}
                        onChange={(e) =>
                          handleFieldChange(
                            index,
                            "serialNumber",
                            e.target.value,
                          )
                        }
                        placeholder={t("droneMapping.enterSerialNumber")}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        value={mapping.sisant}
                        onChange={(e) =>
                          handleFieldChange(index, "sisant", e.target.value)
                        }
                        placeholder={t("droneMapping.enterSisant")}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteRow(index)}
                        disabled={mappings.length === 1}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
          <Button variant="outlined" size="large" onClick={handleCancel}>
            {t("droneMapping.cancel")}
          </Button>
          <Button variant="contained" size="large" onClick={handleSend}>
            {t("droneMapping.save")}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};
