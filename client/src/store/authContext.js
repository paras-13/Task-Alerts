import { createContext } from "react";

export const AuthContext = createContext({
  currentUser: {},
  login: () => {},
  logout: () => {},
  loading: null,
});
