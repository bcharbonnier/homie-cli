exports.setup = function setup(app) {
  app.post("/api/login", (req, res) => {
    res.send("Should login");
  });

  app.post("/api/logout", (req, res) => {
    res.send("should logout");
  });
};
