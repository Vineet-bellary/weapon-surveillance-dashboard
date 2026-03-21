import { Card } from "@mui/material";
import colors from "../../theme/colors";

export default function AppCard({ children, sx = {}, onClick }) {
  return (
    <Card
      onClick={onClick}
      sx={{
        cursor: onClick ? "pointer" : "default",
        borderRadius: 3,
        backgroundColor: colors.card,
        color: colors.text,
        boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
        transition: "0.3s",
        "&:hover": onClick
          ? {
              transform: "translateY(-5px)",
              boxShadow: "0 6px 25px rgba(0,0,0,0.7)",
            }
          : {},
        ...sx,
      }}
    >
      {children}
    </Card>
  );
}
