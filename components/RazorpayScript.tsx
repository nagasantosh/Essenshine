"use client";

import { useEffect } from "react";

export function RazorpayScript() {
  useEffect(() => {
    if (document.getElementById("razorpay-checkout-js")) return;
    const s = document.createElement("script");
    s.id = "razorpay-checkout-js";
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.async = true;
    document.body.appendChild(s);
  }, []);
  return null;
}
