import { useState } from "react";
import { LANGUAGE_VERSIONS } from "../../constants/constants";

const languages = Object.entries(LANGUAGE_VERSIONS);
const ACTIVE_COLOR = "#3182ce"; // Blue color code for active state

const LanguageSelector = ({ language, onSelect }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <div style={{ marginLeft: "8px", marginBottom: "4px" }}>
      <label
        style={{ display: "block", marginBottom: "2px", fontSize: "18px" }}
      >
        Language:
      </label>
      <div style={{ position: "relative" }}>
        <button
          style={{
            padding: "8px 16px",
            backgroundColor: "#2d3748",
            color: "white",
            borderRadius: "4px",
            border: "none",
            cursor: "pointer",
          }}
          onClick={toggleMenu}
        >
          {language}
        </button>
        {isMenuOpen && (
          <ul
            style={{
              position: "absolute",
              backgroundColor: "#110c1b",
              borderRadius: "4px",
              marginTop: "8px",
              padding: "8px 0",
              listStyle: "none",
              width: "200px",
              zIndex: 1000,
            }}
          >
            {languages.map(([lang, version]) => (
              <li
                key={lang}
                style={{
                  padding: "8px 16px",
                  backgroundColor:
                    lang === language ? "#1a202c" : "transparent",
                  color: lang === language ? ACTIVE_COLOR : "white",
                  cursor: "pointer",
                }}
                onClick={() => {
                  onSelect(lang);
                  setIsMenuOpen(false);
                }}
                onMouseEnter={(e) =>
                  (e.target.style.backgroundColor = "#1a202c")
                }
                onMouseLeave={(e) =>
                  (e.target.style.backgroundColor =
                    lang === language ? "#1a202c" : "transparent")
                }
              >
                {lang}{" "}
                <span style={{ color: "#718096", fontSize: "14px" }}>
                  ({version})
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default LanguageSelector;
