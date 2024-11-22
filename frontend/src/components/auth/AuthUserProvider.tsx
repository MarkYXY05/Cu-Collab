import React, { createContext, useContext, FC, Children } from "react";
import { WrappedComponentProps } from "react-with-firebase-auth";
import { createComponentWithAuth } from "../../firebase";
import { User } from "firebase/auth";
import { ReactNode } from "react";

type AuthData = Omit<WrappedComponentProps, "user"> & {
  user?: User | null;
};

const AuthUserContext = createContext<AuthData | undefined>(undefined);

type authuser = WrappedComponentProps & {children : ReactNode}

const AuthUserProvider: FC<authuser> = ({ children, ...auth }) => (
  <AuthUserContext.Provider value={auth}>{children}</AuthUserContext.Provider>
);

export default createComponentWithAuth(AuthUserProvider);

export const useAuth = () => {
  const context = useContext(AuthUserContext);
  if (!context) throw new Error("AuthUserContext has no value");
  return context;
};
