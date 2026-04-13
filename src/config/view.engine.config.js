export const setupViewEngine = (app) => {
  app.set("view engine", "ejs");
  app.set("views", "src/views");
};
