"use client";
import { useEffect, useState } from "react";
import { auth } from "../lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);

  // Initialize reCAPTCHA once
  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
      });
    }
  }, []);

  // Send OTP
  const sendOtp = async () => {
    if (!phone) return alert("Enter phone number with country code");
    try {
      const result = await signInWithPhoneNumber(auth, phone, window.recaptchaVerifier);
      setConfirmation(result);
      window.confirmationResult = result;
      alert("OTP sent!");
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Verify OTP
  const verifyOtp = async () => {
    if (!otp) return alert("Enter OTP");
    try {
      const result = await confirmation?.confirm(otp);
      if (result?.user) {
        alert("Phone verified successfully!");
      }
    } catch (err: any) {
      alert("Invalid OTP");
    }
  };

  return (
    <div className="flex flex-col gap-4 max-w-sm mx-auto mt-10">
      <h1 className="text-xl font-bold">Login with Phone</h1>

      <input
        type="text"
        placeholder="+91XXXXXXXXXX"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="border p-2"
      />

      {!confirmation && (
        <button onClick={sendOtp} className="bg-blue-500 text-white p-2">
          Send OTP
        </button>
      )}

      {confirmation && (
        <>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="border p-2"
          />
          <button onClick={verifyOtp} className="bg-green-500 text-white p-2">
            Verify OTP
          </button>
        </>
      )}

      {/* Invisible reCAPTCHA container */}
      <div id="recaptcha-container"></div>
    </div>
  );
}
