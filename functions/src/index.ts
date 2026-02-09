import * as admin from "firebase-admin";
import { onRequest } from "firebase-functions/v2/https";
import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
admin.initializeApp();

// CORS handler (allows localhost during dev, and also works for deployed domains)
const corsHandler = cors({ origin: true });

function requireEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

const razorpay = new Razorpay({
  key_id: requireEnv("RAZORPAY_KEY_ID"),
  key_secret: requireEnv("RAZORPAY_KEY_SECRET"),
});

export const createRazorpayOrder = onRequest(async (req, res) => {
  corsHandler(req as any, res as any, async () => {
    try {
      if (req.method !== "POST") {
        res.status(405).send("Method not allowed");
        return;
      }

      const { orderId } = req.body ?? {};
      if (!orderId) {
        res.status(400).send("Missing orderId");
        return;
      }

      const snap = await admin.firestore().collection("orders").doc(orderId).get();
      if (!snap.exists) {
        res.status(404).send("Order not found");
        return;
      }

      const order = snap.data() as any;

      // MVP amount: ₹100 (Razorpay uses paise)
      const amountPaise = 10000;

      const rpOrder = await razorpay.orders.create({
        amount: amountPaise,
        currency: "INR",
        receipt: `hb_${orderId}`,
        notes: {
          firestoreOrderId: orderId,
          email: order?.email ?? "",
        },
      });

      // Save Razorpay order id on Firestore order
      await admin.firestore().collection("orders").doc(orderId).set(
        {
          payment: {
            provider: "razorpay",
            razorpayOrderId: rpOrder.id,
            amountPaise,
            currency: "INR",
            status: "created",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          },
        },
        { merge: true }
      );

      res.json({
        keyId: requireEnv("RAZORPAY_KEY_ID"),
        razorpayOrderId: rpOrder.id,
        amount: amountPaise,
        currency: "INR",
        orderId,
      });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e?.message ?? "Failed" });
    }
  });
});

export const verifyRazorpayPayment = onRequest(async (req, res) => {
  corsHandler(req as any, res as any, async () => {
    try {
      if (req.method !== "POST") {
        res.status(405).send("Method not allowed");
        return;
      }

      const {
        orderId,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      } = req.body ?? {};

      if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        res.status(400).send("Missing payment fields");
        return;
      }

      // Verify signature: HMAC_SHA256(order_id + "|" + payment_id, key_secret)
      const secret = requireEnv("RAZORPAY_KEY_SECRET");
      const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
      const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");

      if (expected !== razorpay_signature) {
        res.status(400).json({ ok: false, error: "Invalid signature" });
        return;
      }

      // Mark order as paid
      await admin.firestore().collection("orders").doc(orderId).set(
        {
          status: "paid",
          paidAt: admin.firestore.FieldValue.serverTimestamp(),
          payment: {
            provider: "razorpay",
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature,
            status: "paid",
          },
        },
        { merge: true }
      );

      res.json({ ok: true });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e?.message ?? "Failed" });
    }
  });
});
