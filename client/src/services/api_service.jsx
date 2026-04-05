import { format } from "date-fns";

// Generic API call function
const apiCall = async (url, method = "GET", headers = {}, body = null) => {
  const response = await fetch(`${ApiService.base_uri}/${url}`, {
    method,
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : null,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  return response.json();
};

class ApiService {
  static username = "";
  static password = "";
  static token = null;
  static tokenExpiryTime = null;
  static role = "";
  // static base_uri = "";
  static base_uri = "https://localhost:7116/api/v1";

  static async login() {
    const loginUrl = `authorize`;
    try {
      // Making login API call to the /authorize route to get a new token
      const loginResponse = await apiCall(
        loginUrl,
        "POST",
        {},
        {
          username: this.username,
          password: this.password,
        }
      );

      this.token = loginResponse.token;
      this.tokenExpiryTime = loginResponse.expires;
      this.role = loginResponse.role;
      console.log("Login successful. Token received.");
      ApiService.saveCredentials();
      return loginResponse;
    } catch (error) {
      this.token = null;
      console.error("Login failed:", error);
      return null;
    }
  }

  static saveCredentials() {
    localStorage.setItem("username", this.username);
    localStorage.setItem("password", this.password);
  }

  static clearCredentials = () => {
    this.token = null;
    this.tokenExpiryTime = null;
    this.role = "";
    this.username = "";
    this.password = "";
    // Clear saved credentials from local storage

    localStorage.removeItem("username");
    localStorage.removeItem("password");

    window.location.reload();
  };

  static checkCredentials = async () => {
    const _username = localStorage.getItem("username");
    const _password = localStorage.getItem("password");

    if (_username && _password) {
      this.username = _username;
      this.password = _password;
      await ApiService.login();
    } else {
      console.log("No saved credentials found.");
    }
  };

  static async makeApiCall(url, method = "GET", headers = {}, body = null) {
    if (url !== "/authorize") {
      const now = format(new Date(Date.now()), "yyyy-MM-dd HH:mm:ss");
      // If the token exists and expiry time hasn't passed, use the existing token
      if (this.token && now < this.tokenExpiryTime) {
        headers = {
          ...headers,
          Authorization: `Bearer ${this.token}`,
        };
      } else {
        // Token is either not present or expired, perform login to refresh the token
        console.log("Token expired or not available. Logging in...");
        await this.login();
        headers = {
          ...headers,
          Authorization: `Bearer ${this.token}`,
        };
      }
    }

    // Make the actual API call
    const response = await apiCall(url, method, headers, body);
    return response;
  }
}

export default ApiService;
