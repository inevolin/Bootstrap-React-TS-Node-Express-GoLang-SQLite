import { render, screen } from "@testing-library/react";
import User from "./User";

const mockedUsedNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedUsedNavigate,
}));

afterEach(() => {
  jest.restoreAllMocks();
});

test("renders table", () => {
  render(<User />);
  expect(screen.getByText(/Id/i)).toBeInTheDocument();
  expect(screen.getByText(/Name/i)).toBeInTheDocument();
  expect(screen.getByText(/Email/i)).toBeInTheDocument();
  expect(screen.getByText(/Website/i)).toBeInTheDocument();
  expect(screen.getByText(/Add User/i)).toBeInTheDocument();
});

test("unauthenticated", () => {
  // TODO: mock fetch to check authentication behavior
  // expect(mockedUsedNavigate).toHaveBeenCalledTimes(1);
});

test("load users", () => {
  // TODO mock fetch + trigger event
});
test("add user", () => {
  // TODO mock fetch + trigger event
});
test("delete user", () => {
  // TODO mock fetch + trigger event
});
test("update user", () => {
  // TODO mock fetch + trigger event
});
