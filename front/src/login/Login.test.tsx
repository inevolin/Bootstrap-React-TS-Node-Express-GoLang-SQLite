import { render, screen } from "@testing-library/react";
import Login from "./Login";

jest.mock("react-router-dom");

test("renders input", () => {
  render(<Login />);
  expect(screen.getByText(/email/i)).toBeInTheDocument();
  expect(screen.getByText(/password/i)).toBeInTheDocument();
});

test("authenticated", () => {
  // TODO: mock fetch to check authentication behavior
  // expect(mockedUsedNavigate).toHaveBeenCalledTimes(1); // expect redirect because already authenticated
});

// TODO: unit tests for error handling (wrong email/passw combo)
