import React, { useState, useEffect } from "react";
import { Outlet, Navigate, NavLink } from "react-router";
import ApiService from "../../services/api_service";
import {
  Menu,
  Home,
  Users,
  Settings,
  FileText,
  BarChart2,
  Bell,
} from "lucide-react";

const DashboardLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [challengeGroup, setChallengeGroup] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [forceRenderKey, setForceRenderKey] = useState(0);

  const [remainingTime, setRemainingTime] = useState("");

  const triggerReRender = () => {
    setForceRenderKey((prevKey) => prevKey + 1);
  };

  useEffect(() => {
    // Trigger a re-fetch or state update that directly impacts sidebar content.
    if (ApiService.role === "USER") {
      ApiService.makeApiCall("team", "GET", {}, null).then((response) => {
        setChallengeGroup(response);
        // Handle expiry checks
        if (response?.endingTime) {
          const expiryTime = new Date(response.endingTime).getTime();

          const updateRemainingTime = () => {
            const currentTime = new Date().getTime();
            const timeDiff = expiryTime - currentTime;

            if (timeDiff <= 0) {
              setRemainingTime("Expired");
              ApiService.clearCredentials();
              return;
            }

            const hours = Math.floor((timeDiff / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((timeDiff / (1000 * 60)) % 60);
            const seconds = Math.floor((timeDiff / 1000) % 60);

            setRemainingTime(
              `${hours.toString().padStart(2, "0")}:${minutes
                .toString()
                .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
            );
          };

          updateRemainingTime();
          const intervalId = setInterval(updateRemainingTime, 1000);

          // Cleanup on component unmount
          return () => clearInterval(intervalId);
          // const checkExpiryInterval = setInterval(() => {
          //   const currentTime = new Date().getTime();
          //   if (currentTime > expiryTime) {
          //     clearInterval(checkExpiryInterval);
          //     ApiService.clearCredentials();
          //   }
          // }, 1000); // Check every second

          // return () => clearInterval(checkExpiryInterval);
        }
      });
    }
  }, [forceRenderKey]); // <-- Add this dependency to re-run logic.

  if (!ApiService.token) {
    return <Navigate to="/login" replace />;
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      const fullscreenElement =
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement;
      setIsFullscreen(!!fullscreenElement);
    };

    // Add event listeners for fullscreen changes
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    // Clean up event listeners
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "MSFullscreenChange",
        handleFullscreenChange
      );
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 992;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // Fetch challenge data if the role is USER
    if (ApiService.role === "USER") {
      ApiService.makeApiCall("team", "GET", {}, null).then((response) => {
        setChallengeGroup(response);
        // Start expiry check if expiry time exists
        if (response?.endingTime) {
          const expiryTime = new Date(response.endingTime).getTime();
          const checkExpiryInterval = setInterval(() => {
            const currentTime = new Date().getTime();
            if (currentTime > expiryTime) {
              clearInterval(checkExpiryInterval);
              ApiService.clearCredentials();
            }
          }, 1000); // Check every second

          return () => clearInterval(checkExpiryInterval); // Cleanup
        }
      });
    }
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const enterFullscreen = () => {
    document.documentElement.requestFullscreen();
  };

  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

  return (
    <div className="d-flex vh-100" key={forceRenderKey}>
      {/* Sidebar */}
      <div
        className={`sidebar bg-white shadow ${
          isMobile ? "position-fixed" : ""
        }`}
        style={{
          width: "250px",
          height: "100vh",
          transform: isSidebarOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s ease-in-out",
          // zIndex: 1000,
        }}
      >
        <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
          <h1 className="h4 mb-0">Dashboard</h1>
          {isMobile && (
            <button className="btn btn-light d-lg-none" onClick={toggleSidebar}>
              <Menu size={24} />
            </button>
          )}
        </div>
        <nav className="mt-3">
          <ul className="nav flex-column">
            {ApiService.role === "USER" && challengeGroup?.endingTime && (
              <li className="nav-item">
                <div className="card text-center bg-light shadow-sm border-0 mx-3 my-3">
                  <div className="card-body">
                    <h5 className="card-title text-primary">Time Remaining</h5>
                    <span className="badge bg-danger fs-4">
                      {remainingTime}
                    </span>
                  </div>
                </div>
              </li>
            )}

            {[{ icon: <Home size={20} />, text: "Home", url: "/" }]
              .concat(
                ApiService.role === "USER" && challengeGroup?.challengeUnitTasks
                  ? challengeGroup.challengeUnitTasks.map((task) => ({
                      icon: <FileText size={20} />,
                      text: task.name,
                      url: `/tasks?taskid=${task.id}`,
                      isSubmitted: task.submissionStatus,
                    }))
                  : []
              )
              .concat(
                ApiService.role === "SUPER_ADMIN" && [
                  { icon: <Users size={20} />, text: "Users", url: "/users" },
                ]
              )
              .concat(
                ApiService.role === "ADMIN" && [
                  {
                    icon: <Users size={20} />,
                    text: "Leaderboard",
                    url: "/leaderboard",
                  },
                  { icon: <Users size={20} />, text: "Users", url: "/users" },
                  {
                    icon: <Settings size={20} />,
                    text: "Challenge Groups",
                    url: "/challenge-groups",
                  },
                ]
              )
              .map((item, index) => (
                <li key={index} className="nav-item">
                  <NavLink
                    to={item.url}
                    className="nav-link text-dark d-flex align-items-center px-4 py-2 hover-bg-light"
                    end
                  >
                    {item.icon}
                    <span className="ms-3">{item.text}</span>
                    {item.isSubmitted && (
                      <span className="badge bg-success ms-auto">
                        Submitted
                      </span>
                    )}
                  </NavLink>
                </li>
              ))}
          </ul>
        </nav>
      </div>

      {/* Backdrop for mobile */}
      {isMobile && isSidebarOpen && (
        <div
          className="position-fixed vh-100 vw-100"
          style={{
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 999,
          }}
          onClick={toggleSidebar}
        />
      )}

      {/* Main Content */}
      <div className="flex-grow-1 d-flex flex-column overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white shadow-sm">
          <div className="d-flex align-items-center justify-content-between p-3">
            {/* Only show hamburger menu on mobile */}
            {ApiService.role == "USER" && (
              <>
                {!isFullscreen ? (
                  <button className="btn btn-light" onClick={enterFullscreen}>
                    Enter Fullscreen
                  </button>
                ) : (
                  <button className="btn btn-light" onClick={exitFullscreen}>
                    Exit Fullscreen
                  </button>
                )}
              </>
            )}
            {isMobile && (
              <button className="btn btn-light" onClick={toggleSidebar}>
                <Menu size={24} />
              </button>
            )}
            {/* Add a spacer div when hamburger menu is hidden */}
            {!isMobile && <div></div>}
            <div className="d-flex align-items-center gap-3">
              <button className="btn btn-light position-relative">
                {ApiService.username.toUpperCase()}
              </button>
              <button
                className="btn btn-danger position-relative"
                onClick={ApiService.clearCredentials}
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-grow-1 overflow-auto p-4">
          <Outlet context={{ triggerReRender }} />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
