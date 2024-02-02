import request from "supertest";
import app from "../index";

it("unauthenticated getting users", async () => {
  const res = await request(app)
    .get("/api/users")
    .send([{ id: 1, name: "a", email: "b", website: "c" }]);

  expect(res.statusCode).toBe(401);
});

// TODO: test authentication flow
// TODO: test authenticated /api/ calls
// NIT: mock database (or wrap database in a class to mock easier)
