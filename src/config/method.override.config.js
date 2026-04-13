import methodOverride from "method-override";

export function setupMethodOverride(app) {
  // ?_method=DELETE
  app.use(methodOverride("_method"));

  // ili preko hidden inputa:
  // <input type="hidden" name="_method" value="DELETE">
  app.use(
    methodOverride((req) => {
      if (req.body && typeof req.body === "object" && "_method" in req.body) {
        const method = req.body._method;
        delete req.body._method;
        return method;
      }
    })
  );
}
