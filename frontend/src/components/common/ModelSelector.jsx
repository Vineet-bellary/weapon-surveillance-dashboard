import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import colors from "../../theme/colors";

function ModelSelector({ models, activeModel, onChange }) {
  return (
    <FormControl size="small" sx={{ minWidth: 180 }}>
      <InputLabel sx={{ color: colors.muted }}>Model</InputLabel>
      <Select
        value={activeModel}
        label="Model"
        onChange={(event) => onChange(event.target.value)}
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
