import React from "react";
import { BrowserRouter, Routes, Route } from "react-router";
import {
  Login,
  Home,
  Users,
  ChallengeGroups,
  ChallengeUnitTasks,
  Task,
  Leaderboard,
} from "./pages/index.jsx";
import { DashboardLayout, AuthLayout } from "./layouts/index.jsx";
import SecureWrapper from "./secure.jsx";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route index element={<Home />} />
          <Route path="users" element={<Users />} />
          <Route path="challenge-groups" element={<ChallengeGroups />} />
          <Route path="challenge-unit" element={<ChallengeUnitTasks />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route
            path="tasks"
            element={
              // <SecureWrapper>
              // </SecureWrapper>
                <Task />
            }
          />
        </Route>

        <Route element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
