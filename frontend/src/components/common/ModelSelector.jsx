import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { useEffect, useState } from "react";
import { getModels, switchModel } from "../../api/models";
import colors from "../../theme/colors";

function ModelSelector() {
  const [models, setModels] = useState([]);
  const [activeModel, setActiveModel] = useState("");

  const fetchModels = async () => {
    try {
      const data = await getModels();
      setModels(data.models || []);
      setActiveModel(data.active_model || "");
    } catch (error) {
      console.error("Failed to fetch models", error);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  const handleChange = async (event) => {
    const selected = event.target.value;
    setActiveModel(selected);

    try {
      await switchModel(selected);
      await fetchModels();
    } catch (error) {
      console.error("Failed to switch model", error);
    }
  };

  return (
    <FormControl size="small" sx={{ minWidth: 180 }}>
      <InputLabel sx={{ color: colors.muted }}>Model</InputLabel>
      <Select
        value={activeModel}
        label="Model"
        onChange={handleChange}
        sx={{
          color: colors.text,
          ".MuiOutlinedInput-notchedOutline": {
            borderColor: colors.border,
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: colors.accent,
          },
          ".MuiSvgIcon-root": {
            color: colors.text,
          },
        }}
      >
        {models.map((model) => (
          <MenuItem key={model.key} value={model.key}>
            {model.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default ModelSelector;
