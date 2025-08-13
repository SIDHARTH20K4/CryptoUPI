"use client";
import { useEffect, useState } from "react";
import { auth } from "../lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";
import { createUser } from "../lib/firebase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // Initialize reCAPTCHA
  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
      });
    }
  }, []);

  const sendOtp = async () => {
    if (!phone) {
      setError("Please enter phone number with country code");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await signInWithPhoneNumber(auth, phone, window.recaptchaVerifier);
      setConfirmation(result);
      window.confirmationResult = result;
    } catch (err: any) {
      setError(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

const verifyOtp = async () => {
  if (!otp) {
    setError("Please enter the OTP");
    return;
  }
  setLoading(true);
  setError("");
  try {
    const result = await confirmation?.confirm(otp);
    if (result?.user) {
      const phoneNumber = result.user.phoneNumber!;
      const walletAddress = "GENERATE_WALLET_ADDRESS_HERE"; // use Web3Auth/ZeroDev SDK

      // Save user to Firestore
      await createUser({
        phoneNumber,
        walletAddress,
        displayName: "", // optional
        email: "",       // optional
      });

      // Redirect to dashboard or next page
      router.push("/dashboard");
    }
  } catch (err: any) {
    setError("Invalid OTP. Please try again.");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Phone Number Verification
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          We'll send you a verification code via SMS
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">+</span>
                </div>
                <input
                  type="tel"
                  id="phone"
                  placeholder="91XXXXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(`+${e.target.value.replace(/\D/g, '')}`)}
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 py-3 border-gray-300 rounded-md"
                  disabled={!!confirmation}
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Include country code (e.g. +91 for India)
              </p>
            </div>

            {!confirmation ? (
              <div>
                <button
                  onClick={sendOtp}
                  disabled={loading}
                  className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending OTP...
                    </>
                  ) : 'Send OTP'}
                </button>
              </div>
            ) : (
              <>
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                    Verification Code
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="otp"
                      placeholder="Enter 6-digit code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      maxLength={6}
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <button
                    onClick={verifyOtp}
                    disabled={loading}
                    className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Verifying...
                      </>
                    ) : 'Verify OTP'}
                  </button>
                </div>

                <div className="text-center">
                  <button
                    onClick={() => {
                      setConfirmation(null);
                      setOtp("");
                    }}
                    className="text-sm font-medium text-blue-600 hover:text-blue-500"
                  >
                    Resend OTP
                  </button>
                </div>
              </>
            )}

            {/* Hidden reCAPTCHA container */}
            <div id="recaptcha-container"></div>
          </div>
        </div>
      </div>
    </div>
  );
}