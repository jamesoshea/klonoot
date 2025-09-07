import { useContext, useState } from "react";
import { SessionContext } from "../contexts/SessionContext";
import { queryClient } from "../queries/queryClient";

type MODE = "LOGIN" | "VERIFY";

export const Auth = () => {
  // TODO: loading states
  // TODO: error handling
  const [email, setEmail] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [step, setStep] = useState<MODE>("LOGIN");
  const { supabase, session } = useContext(SessionContext);

  const handleSocialLogin = async () => {
    const { error } = await supabase.auth.signInWithOtp({ email });

    setStep("VERIFY");

    if (error) throw error;
  };

  const handleSocialConfirm = async () => {
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "magiclink",
    });

    if (error) throw error;
    setEmail("");
    setOtp("");
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    queryClient.clear();
    setStep("LOGIN");
  };

  return (
    <div className="modal-box p-3 rounded-md">
      <form method="dialog">
        {/* if there is a button in form, it will close the modal */}
        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
          ✕
        </button>
      </form>
      <h3 className="font-bold text-lg mb-3">Hello!</h3>
      {session ? (
        <>
          <div className="mb-2">Signed in as {session.user.email}</div>
          <button className="btn" onClick={handleSignOut}>
            Sign out
          </button>
        </>
      ) : (
        <>
          <p className="text-content">
            {step === "LOGIN"
              ? "To sign in, enter your email. We will email you a code to verify your email address."
              : step === "VERIFY"
              ? "Please enter the code we sent to your email"
              : ""}
          </p>
          <p className="py-4">
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
              <button className="btn" onClick={handleSocialLogin}>
                Sign in
              </button>
            ) : step === "VERIFY" ? (
              <button className="btn" onClick={handleSocialConfirm}>
                Verify
              </button>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
};
