import React from "react";
import { Button } from "@mui/material";
import Role from "../../policies/Role";
import PoliciesHelper from "../../policies/PoliciesHelper";
import BadgeAssignationPopup from "./Popups/BadgeAssignationPopup/BadgeAssignationPopup";

class AssignBadgeButton extends React.Component {
  constructor(props) {
    super(props);

    this.policiesHelper = new PoliciesHelper();

    this.state = {
      isBadgeAssignationOpen: false,
    };
  }

  canAssignBadges = () => {
    if (this.policiesHelper.hasRole(Role.Teacher)) return true;
    if (this.policiesHelper.hasRole(Role.Admin)) return true;
    if (this.policiesHelper.hasRole(Role.AdminContact)) return true;
    return false;
  };

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