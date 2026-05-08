const authToken = {
  setToken: (accessToken = null) => {
    if (accessToken) {
      localStorage.setItem("accessToken", accessToken);
    }
  },
  getToken: () => {
    return {
      accessToken: localStorage.getItem("accessToken"),
    };
  },
  removeToken: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("role");
  }
};
export default authToken;
