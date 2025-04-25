import { Box } from "@mui/material";

const SpinningLogo = ({ size = 60 }) => (
  <Box
    component="img"
    src="./LottoTryLogo.png"
    alt="LottoTry Logo"
    sx={{
      //width: size,
      height: size,
      animation: "spin 10s linear infinite",
      "@keyframes spin": {
        "0%": { transform: "rotate(0deg)" },
        "100%": { transform: "rotate(360deg)" },
      },
    }}
  />
);

export default SpinningLogo;
