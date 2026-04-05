import React, { useEffect } from "react";

const SecureWrapper = ({ children }) => {
  useEffect(() => {
    // Disable right-click
    const handleRightClick = (e) => {
      e.preventDefault();
      alert("Right-click is disabled on this page!");
    };

    // Disable inspect element shortcuts
    const handleKeyDown = (e) => {
      if (
        e.key === "F12" || // F12
        (e.ctrlKey && e.shiftKey && e.key === "I") || // Ctrl+Shift+I
        (e.ctrlKey && e.shiftKey && e.key === "J") || // Ctrl+Shift+J
        (e.ctrlKey && e.key === "U") // Ctrl+U
      ) {
        e.preventDefault();
        alert("Inspect element is disabled on this page!");
      }
    };

    // Disable copy, cut, and paste
    const handleCopyCutPaste = (e) => {
      e.preventDefault();
      alert("Copy-pasting is disabled on this page!");
    };

    // Add event listeners
    document.addEventListener("contextmenu", handleRightClick);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("copy", handleCopyCutPaste);
    document.addEventListener("cut", handleCopyCutPaste);
    document.addEventListener("paste", handleCopyCutPaste);

    // Cleanup event listeners when the component unmounts
    return () => {
      document.removeEventListener("contextmenu", handleRightClick);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("copy", handleCopyCutPaste);
      document.removeEventListener("cut", handleCopyCutPaste);
      document.removeEventListener("paste", handleCopyCutPaste);
    };
  }, []);

  return <div>{children}</div>;
};

export default SecureWrapper;
