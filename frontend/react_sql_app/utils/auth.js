export function loginUser(credentials) {
  // Pure JS logic, no JSX
  return fetch("/api/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}
