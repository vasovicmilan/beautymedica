import mongoSanitize from "mongo-sanitize";
import methodOverride from "method-override";

export const setupSanitize = (app) => {
  app.use(methodOverride("_method"));

  app.use((req, res, next) => {
    if (req.body) req.body = mongoSanitize(req.body);
    if (req.params) req.params = mongoSanitize(req.params);
    if (req.headers) req.headers = mongoSanitize(req.headers);
    next();
  });
};
