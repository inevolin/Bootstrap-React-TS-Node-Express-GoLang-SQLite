/* eslint-disable @typescript-eslint/no-explicit-any */
import express, { Application, NextFunction, Request, Response } from "express";
import { Database } from "sqlite3";
import fs from "fs";
import { KeyPair, createKeyPair, createVC, verifyVC } from "./certs"; // helper functions, JWT based
import { v4 as uuidv4 } from "uuid";

// INIT SQLite Database
const db = new Database("db.sqlite");
db.run(fs.readFileSync("./db/0000_init.sql", "utf8")); // init database (no-op if already)

const PORT: string = process.env.PORT || "3000"; // SERVER PORT
const app: Application = express();

app.use(express.static("../front/build/")); // Serving static front-end code (if has been built)

// fix CORS for OPTIONS HTTP
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, OPTIONS");
  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create in-memory keypair for creating/signing JWTs (auth flow)
let SERVER_KEYPAIR: KeyPair;
createKeyPair().then((kp) => (SERVER_KEYPAIR = kp)); // warning: restarting server will invalidate auth tokens (TODO: persist in DB)

// auth middleware
async function doAuth(req: Request, res: Response, next: NextFunction) {
  const verif = await verifyVC(
    req.headers.authorization as string,
    SERVER_KEYPAIR.publicKeyPEM
  );
  if (verif.verified) next();
  else res.status(401).send(false);
}

// auth endpoint
app.get("/api/auth", doAuth, (_, res) => {
  res.status(200).send(true);
});

// login screen
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body; // hint hint !
  if (email === password && email === "admin") {
    const jwt = await createVC({
      privateKeyPEM: SERVER_KEYPAIR.privateKeyPEM,
      toDID: email,
      id: uuidv4(),
      type: ["VerifiableCredential", "Auth"],
      claims: { email },
    });
    res.send({ jwt: jwt.encoded });
  } else {
    res.status(401).send({ err: "incorrect email/password" }); // error handling
  }
});

// get users
app.get("/api/users", doAuth, (_, res) => {
  db.all("SELECT * FROM user", (err, rows) => {
    if (err) return res.status(500).send(false); // error handling
    res.send(rows || []);
  });
});

// add user
app.post("/api/users", doAuth, (req, res) => {
  const { name, email, website } = req.body;
  db.run(
    "INSERT INTO user (name, email, website) VALUES (?,?,?)",
    [name, email, website],
    (result: any, err: any) => {
      if (err) return res.status(500).send(false); // error handling
      res.send({ ...req.body }); // return input back as success
      // NOTE: getting inserted ID does not seem to work well in SQLite !!! this needs a workaround
    }
  );
});

// update user
app.put("/api/users/:id", doAuth, (req, res) => {
  const id = req.params.id;
  const { name, email, website } = req.body;
  db.run(
    "UPDATE user SET name=?, email=?, website=? WHERE id=?",
    [name, email, website, id],
    (err: any) => {
      if (err) return res.status(500).send(false); // error handling
      res.send(true);
    }
  );
});

// delete user
app.delete("/api/users/:id", doAuth, (req, res) => {
  const id = req.params.id;
  db.run("DELETE FROM user WHERE id = ?", [id], (err: any) => {
    if (err) return res.status(500).send(false);
    res.send(true);
  });
});

// TODO: general error handler (catch-all)
// TODO: hide error stacktrace for production

app.listen(PORT, () => {
  console.log(`Server has started running at http://localhost:${PORT}/`);
});

export default app;
