import React from "react";
import { Outlet, Navigate } from "react-router";

import ApiService from "../../services/api_service";

const AuthLayout = () => {
  if (ApiService.token) {
    return <Navigate to="/" replace />;
  }

  return (
    <div>
      <Outlet />
    </div>
  );
};

export default AuthLayout;
