import React from "react";
import { NavLink } from "react-router-dom";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";

import PeopleIcon from "@mui/icons-material/People";
import AssignmentIcon from "@mui/icons-material/Assignment";
import InsertChartIcon from "@mui/icons-material/InsertChart";
import SchoolIcon from "@mui/icons-material/School";

import Role from "../../../policies/Role";
import PoliciesHelper from "../../../policies/PoliciesHelper";
import { AuthContext } from "../../../context/AuthContext";

import "./AdminSidebar.css";

/**
 * Sidebar pour l'enseignant/l'admin (inclut dans AdminLayout et Home).
 *
 * Zacharie Nolet - 2026-03-16
 */
class AdminSidebar extends React.Component {
  static contextType = AuthContext;

  getSections = (role) => {
    const policiesHelper = new PoliciesHelper(role);
    return [
      {
        title: "Utilisateurs",
        items: policiesHelper.getvisibleRoutes([
          {
            label: "Utilisateurs",
            icon: <PeopleIcon />,
            path: "/admin/users",
            minimumRole: Role.Teacher,
          },
          {
            label: "Administrateurs",
            icon: <PeopleIcon />,
            path: "/admin/admin_users",
            minimumRole: Role.Admin,
          },
          {
            label: "Codes enseignants",
            icon: <SchoolIcon />,
            path: "/admin/teacher_codes",
            minimumRole: Role.Admin,
          },
        ]),
      },
      {
        title: "Badges",
        items: policiesHelper.getvisibleRoutes([
          {
            label: "Liste des badges",
            icon: <AssignmentIcon />,
            path: "/admin/badges",
            minimumRole: Role.Teacher,
          },
          {
            label: "Catégories",
            icon: <AssignmentIcon />,
            path: "/admin/categories",
            minimumRole: Role.Teacher,
          },
        ]),
      },
      {
        title: "Statistiques",
        items: policiesHelper.getvisibleRoutes([
          {
            label: "Top 10 collectionneurs",
            icon: <InsertChartIcon />,
            path: "/admin/top-collectors",
            minimumRole: Role.Teacher,
          },
          {
            label: "Top 5 par catégorie",
            icon: <InsertChartIcon />,
            path: "/admin/top-by-category",
            minimumRole: Role.Teacher,
          },
        ]),
      },
    ];
  };

  render() {
    const sections = this.getSections(this.context?.user?.role);

    return (
      <Box className="admin-sidebar">
        {sections.map((section) => (
          <div key={section.title} className="admin-sidebar-section">
            <div className="admin-sidebar-section-title">
              {section.title}
            </div>

            <List>
              {section.items.map((item) => (
                <ListItem key={item.path} disablePadding>
                  <ListItemButton
                    component={NavLink}
                    to={item.path}
                    className="admin-sidebar-link"
                  >
                    <ListItemIcon className="admin-sidebar-icon">
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.label} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </div>
        ))}
      </Box>
    );
  }
}

export default AdminSidebar;
