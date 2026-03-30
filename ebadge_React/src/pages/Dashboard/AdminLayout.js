import { Outlet, Link } from "react-router-dom";
import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Button } from "@mui/material";

import AdminSidebar from "../../composant/layout/AdminSidebar/AdminSidebar";
import AssignBadgeButton from "../../composant/Dashboard/AssignBadgeButton";

const drawerWidth = 240;

class AdminLayout extends React.Component {
  constructor(props) {
    super(props);

    this.container =
      typeof window !== "undefined" ? () => window.document.body : undefined;

    this.state = {
      mobileOpen: false,
    };
  }

  handleDrawerToggle = () => {
    this.setState((prevState) => ({
      mobileOpen: !prevState.mobileOpen,
    }));
  };

  render() {
    return (
      <Box sx={{ display: "flex" }}>
        <CssBaseline />

        <AppBar
          position="fixed"
          sx={{
            width: "100%",
            ml: 0,
            zIndex: (theme) => theme.zIndex.drawer + 1,
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={this.handleDrawerToggle}
              sx={{ mr: 2, display: { sm: "none" } }}
            >
              <MenuIcon />
            </IconButton>

            <Button
              variant="outlined"
              color="secondary"
              component={Link}
              to="/"
              sx={{ mr: 3 }}
              startIcon={<ArrowBackIcon />}
            >
              Retour au site
            </Button>

            <Typography variant="h6" noWrap component="div">
              E-Badge | Administration
            </Typography>

            <AssignBadgeButton
              sx={{ ml: "auto" }}
            />
          </Toolbar>
        </AppBar>

        <Box
          component="nav"
          sx={{
            width: { sm: drawerWidth },
            flexShrink: { sm: 0 },
          }}
          aria-label="admin sidebar"
        >
          <Drawer
            container={this.container}
            variant="temporary"
            open={this.state.mobileOpen}
            onClose={this.handleDrawerToggle}
            ModalProps={{
              keepMounted: true,
            }}
            sx={{
              display: { xs: "block", sm: "none" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: drawerWidth,
                top: "64px",
                height: "calc(100% - 64px)",
              },
            }}
          >
            <AdminSidebar />
          </Drawer>

          <Drawer
            variant="permanent"
            open
            sx={{
              display: { xs: "none", sm: "block" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: drawerWidth,
                top: "64px",
                height: "calc(100% - 64px)",
              },
            }}
          >
            <AdminSidebar />
          </Drawer>
        </Box>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { sm: `calc(100% - ${drawerWidth}px)` },
          }}
        >
          <Toolbar />
          <div className="dashboard">
            <Outlet />
          </div>
        </Box>
      </Box>
    );
  }
}

export default AdminLayout;