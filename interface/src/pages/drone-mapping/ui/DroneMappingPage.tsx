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

interface DroneMapping {
	id: string;
	serialNumber: string;
	sisant: string;
}

export const DroneMappingPage = () => {
	const navigate = useNavigate();
	const [mappings, setMappings] = useState<DroneMapping[]>([]);

	useEffect(() => {
		// Load from localStorage on mount
		const saved = localStorage.getItem("droneMappings");
		if (saved) {
			try {
				setMappings(JSON.parse(saved));
			} catch (e) {
				console.error("Failed to load drone mappings:", e);
			}
		} else {
			// Start with one empty row
			setMappings([{ id: "", serialNumber: "", sisant: "" }]);
		}
	}, []);

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
					toast.success(`Loaded ${newMappings.length} drone mappings from CSV`);
				} else {
					toast.error("No valid data found in CSV file");
				}
			} catch (error) {
				toast.error("Failed to parse CSV file");
				console.error("CSV parse error:", error);
			}
		};
		reader.readAsText(file);

		// Reset input so the same file can be uploaded again
		event.target.value = "";
	};

	const handleSend = () => {
		// Validate that at least one row has data
		const validMappings = mappings.filter(
			(m) => m.id || m.serialNumber || m.sisant,
		);

		if (validMappings.length === 0) {
			toast.error("Please add at least one drone mapping");
			return;
		}

		// Save to localStorage
		localStorage.setItem("droneMappings", JSON.stringify(mappings));
		toast.success("Drone mappings saved successfully");
		navigate(ROUTES.DASHBOARD);
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
						Drone Mapping Configuration
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
						<Typography variant="h6">Drone Mappings</Typography>
						<Box sx={{ display: "flex", gap: 2 }}>
							<Button
								variant="outlined"
								startIcon={<UploadFileIcon />}
								component="label"
							>
								Upload CSV
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
								Add Row
							</Button>
						</Box>
					</Box>

					<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
						CSV format: Id, Serial Number, SISANT (with or without header row)
					</Typography>

					<TableContainer>
						<Table>
							<TableHead>
								<TableRow>
									<TableCell>ID / Name</TableCell>
									<TableCell>Serial Number (SN)</TableCell>
									<TableCell>SISANT Number</TableCell>
									<TableCell width={80}>Actions</TableCell>
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
												placeholder="Enter ID or Name"
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
												placeholder="Enter Serial Number"
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
												placeholder="Enter SISANT"
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
						Cancel
					</Button>
					<Button variant="contained" size="large" onClick={handleSend}>
						Save
					</Button>
				</Box>
			</Box>
		</Box>
	);
};
