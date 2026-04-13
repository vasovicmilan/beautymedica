import session from "express-session";
import connectMongoDBSession from "connect-mongodb-session";

const MongoDBStore = connectMongoDBSession(session);

export function setupSession(app) {
  const store = new MongoDBStore({
    uri: process.env.MONGO_URI,
    collection: "sessions",
  });

  store.on("error", (err) => console.error("Session store error:", err));

  // Ako je aplikacija iza reverse proxy (Heroku, Render, NGINX)
  if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
  }

  app.use(
    session({
      name: "sid_salon", // naziv kolačića
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      store,
      cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production", // HTTPS samo u produkciji
        maxAge: 1000 * 60 * 60 * 24, // 1 dan
      },
    })
  );
}