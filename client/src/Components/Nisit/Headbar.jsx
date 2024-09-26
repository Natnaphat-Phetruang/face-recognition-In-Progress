import { AppBar, Toolbar, Typography, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

function Headbar({ handleDrawerToggle }) {
  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: "#212121",
        color: "#ffffff",
        width: { sm: `calc(100% )` },
        ml: { sm: `200px` },
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ mr: 2, display: { sm: "none" } }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" noWrap component="div">
          <h4>STUDENT WEBSITE</h4>
        </Typography>
      </Toolbar>
    </AppBar>
  );
}

export default Headbar;
