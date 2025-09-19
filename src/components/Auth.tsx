import { useContext, useState } from "react";
import { SessionContext } from "../contexts/SessionContext";
import { queryClient } from "../queries/queryClient";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faSignOut } from "@fortawesome/free-solid-svg-icons";

import { useCreateRoute } from "../queries/useCreateRoute";
import { BROUTER_PROFILES } from "../types";

type MODE = "LOGIN" | "VERIFY";

export const Auth = () => {
  // TODO: error handling
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [otp, setOtp] = useState<string>("");
  const [step, setStep] = useState<MODE>("LOGIN");

  const { supabase, session } = useContext(SessionContext);

  const { mutateAsync: createUserRoute } = useCreateRoute();

  const handleEmailLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email });
    setLoading(false);
    if (error) throw error;
    setStep("VERIFY");
  };

  const handleEmailConfirm = async () => {
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "magiclink",
    });
    setLoading(false);

    if (error) throw error;
    setEmail("");
    setOtp("");
  };

  const handleCreateRoute = () => {
    createUserRoute({
      brouterProfile: BROUTER_PROFILES.TREKKING,
      points: [],
    });
  };

  const handleSignOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setLoading(false);
    queryClient.clear();
    setStep("LOGIN");
  };

  return (
    <div>
      {session ? (
        <div className="join join-vertical w-full">
          <button
            className="btn btn-ghost btn-block"
            onClick={handleCreateRoute}
          >
            <FontAwesomeIcon icon={faPlus} size="lg" />
            Create new route
          </button>
          <button className="btn btn-ghost btn-block" onClick={handleSignOut}>
            <FontAwesomeIcon icon={faSignOut} size="lg" />
            Sign out
          </button>
        </div>
      ) : (
        <>
          <p className="text-content text-center">
            {step === "LOGIN"
              ? "To sign in, enter your email. We will email you a code to verify your email address."
              : step === "VERIFY"
                ? "Please enter the code we sent to your email"
                : ""}
          </p>
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
              {step === "LOGIN" ? (
                <input
                  className="w-full"
                  placeholder="mail@example.com"
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.currentTarget.value)}
                />
              ) : step === "VERIFY" ? (
                <input
                  className="w-full"
                  placeholder="000000"
                  required
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.currentTarget.value)}
                />
              ) : null}
            </label>
          </p>
          <div className="flex justify-center">
            {step === "LOGIN" ? (
              <button className="btn" onClick={handleEmailLogin}>
                {loading && <span className="loading loading-spinner" />}
                Sign in
              </button>
            ) : step === "VERIFY" ? (
              <>
                <button
                  className="btn btn-outline"
                  onClick={() => setStep("LOGIN")}
                >
                  Back
                </button>
                <button className="btn ml-2" onClick={handleEmailConfirm}>
                  {loading && <span className="loading loading-spinner" />}
                  Verify
                </button>
              </>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
};
