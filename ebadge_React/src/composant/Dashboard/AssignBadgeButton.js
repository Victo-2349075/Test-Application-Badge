import React from "react";
import { Button } from "@mui/material";
import Role from "../../policies/Role";
import PoliciesHelper from "../../policies/PoliciesHelper";
import BadgeAssignationPopup from "./Popups/BadgeAssignationPopup/BadgeAssignationPopup";
import { AuthContext } from "../../context/AuthContext";

class AssignBadgeButton extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isBadgeAssignationOpen: false,
    };
  }

  canAssignBadges = () => {
    const role = this.context?.user?.role;
    const policiesHelper = new PoliciesHelper(role);
    if (policiesHelper.hasRole(Role.Teacher)) return true;
    if (policiesHelper.hasRole(Role.Admin)) return true;
    if (policiesHelper.hasRole(Role.AdminContact)) return true;
    return false;
  };

  static contextType = AuthContext;

  render() {
    const {
      sx = {},
      variant = "contained",
      color = "secondary",
      fullWidth = false,
      children = "Assigner",
    } = this.props;

    if (!this.canAssignBadges()) {
      return null;
    }

    return (
      <>
        <Button
          fullWidth={fullWidth}
          variant={variant}
          color={color}
          sx={sx}
          onClick={() => this.setState({ isBadgeAssignationOpen: true })}
        >
          {children}
        </Button>

        <BadgeAssignationPopup
          isOpen={this.state.isBadgeAssignationOpen}
          onClose={() => this.setState({ isBadgeAssignationOpen: false })}
        />
      </>
    );
  }
}

export default AssignBadgeButton;
