import { jwtDecode } from "jwt-decode";
import { useState } from "react";

import { useSessionContext } from "../contexts/SessionContext";
import { queryClient } from "../queries/queryClient";
import { faSignOut } from "@fortawesome/free-solid-svg-icons";

import { SquareButton } from "./shared/SquareButton";
import axios from "axios";
import type { User } from "../types";

export const Auth = () => {
  const { user, token, setUser, setToken } = useSessionContext();
  // TODO: error handling
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");

  const handleEmailSignin = async () => {
    setLoading(true);
    const {
      data: { token },
    } = await axios.post(
      "http://localhost/api/rpc/login",
      { email, pass: password },
      { headers: { "Content-type": "application/json" } },
    );

    setToken(token);
    localStorage.setItem("token", token);

    const user = jwtDecode<User>(token);
    setUser(user);
    localStorage.setItem("user", JSON.stringify(user));

    setLoading(false);
  };

  const handleSignOut = async () => {
    setToken(null);
    window.localStorage.removeItem("token");

    setUser(null);
    window.localStorage.removeItem("user");
    queryClient.clear();
  };

  return (
    <div>
      {token && user ? (
        <div className="join join-vertical w-full">
          <p className="text-content text-center text-sm">Signed in as {user.email}</p>
          <SquareButton icon={faSignOut} text="Sign out" onClick={handleSignOut} />
        </div>
      ) : (
        <>
          <p className="text-content text-center text-sm">
            Please sign up or log in with an email and password
          </p>
          <div className="flex flex-col gap-1 items-center">
            <p className="py-2">
              <label className="input validator w-full">
                <svg
                  className="h-[1em] opacity-50"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  <g
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    strokeWidth="2.5"
                    fill="none"
                    stroke="currentColor"
                  >
                    <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                  </g>
                </svg>
                <input
                  className="w-full"
                  placeholder="mail@example.com"
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.currentTarget.value)}
                />
              </label>

              <label className="input validator mt-1 w-full">
                <input
                  className="w-full"
                  placeholder="password"
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.currentTarget.value)}
                />
              </label>
            </p>

            <button className="btn" onClick={handleEmailSignin}>
              {loading && <span className="loading loading-spinner" />}
              Sign in
            </button>
          </div>
        </>
      )}
    </div>
  );
};
