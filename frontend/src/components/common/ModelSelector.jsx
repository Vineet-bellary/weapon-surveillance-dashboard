import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import colors from "../../theme/colors";

function ModelSelector({ models, activeModel, onChange }) {
  const controlSx = {
    minWidth: 180,
    color: colors.text,
    backgroundColor: colors.primary,
    borderRadius: 1.5,
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: colors.border,
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: colors.accent,
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: colors.accent,
    },
    "& .MuiSvgIcon-root": {
      color: colors.muted,
    },
  };

  return (
    <FormControl size="small" sx={{ minWidth: 180 }}>
      <InputLabel
        sx={{
          color: colors.muted,
          "&.Mui-focused": {
            color: colors.accent,
          },
        }}
      >
        Model
      </InputLabel>
      <Select
        value={activeModel}
        label="Model"
        onChange={(event) => onChange(event.target.value)}
        sx={controlSx}
        MenuProps={{
          PaperProps: {
            sx: {
              backgroundColor: colors.primary,
              color: colors.text,
              border: `1px solid ${colors.border}`,
            },
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
