"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/ui/Header";
import {
  CreditCard, Shield, Zap, CheckCircle,
  Loader2, AlertCircle, ArrowLeft,
  Smartphone, IndianRupee
} from "lucide-react";

declare global {
  interface Window { Razorpay: any; }
}

const formatAmount = (paise: number) =>
  `₹${(paise / 100).toLocaleString("en-IN")}`;

type PaymentState = "form" | "processing" | "success" | "failed";

export default function PayPage() {
  const router = useRouter();

  const [amount,      setAmount]      = useState("");
  const [description, setDescription] = useState("");
  const [upiId,       setUpiId]       = useState("");
  const [state,       setState]       = useState<PaymentState>("form");
  const [error,       setError]       = useState("");
  const [successData, setSuccessData] = useState<any>(null);
  const [loading,     setLoading]     = useState(false);

  const amountInPaise = Math.round(parseFloat(amount || "0") * 100);

  const loadRazorpay = (): Promise<boolean> => {
    return new Promise(resolve => {
      if (window.Razorpay) { resolve(true); return; }
      const script  = document.createElement("script");
      script.src    = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Load Razorpay SDK
      const loaded = await loadRazorpay();
      if (!loaded) {
        setError("Failed to load Razorpay. Check internet connection.");
        setLoading(false);
        return;
      }

      // Create order on our backend
      const orderRes  = await fetch("/api/payments/create-order", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          amount:      amountInPaise,
          description: description || "FlowDesk Payment",
          upiId,
        }),
      });

      const orderData = await orderRes.json();

      if (!orderData.success) {
        setError(orderData.error || "Failed to create order");
        setLoading(false);
        return;
      }

      setLoading(false);
      setState("processing");

      // Open Razorpay checkout
      const options = {
        key:         process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount:      orderData.amount,
        currency:    orderData.currency,
        name:        "FlowDesk",
        description: description || "FlowDesk Payment",
        order_id:    orderData.orderId,
        prefill: {
          name:    "",
          email:   "",
          contact: "",
          vpa:     upiId || "",
        },
        theme: { color: "#6366f1" },
        modal: {
          ondismiss: () => {
            setState("form");
            setError("Payment cancelled.");
          },
        },
        handler: async (response: any) => {
          setState("processing");

          // Verify payment
          const verifyRes = await fetch("/api/payments/verify", {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
            }),
          });

          const verifyData = await verifyRes.json();

          if (verifyData.success) {
            setSuccessData({
              paymentId: response.razorpay_payment_id,
              orderId:   response.razorpay_order_id,
              amount:    formatAmount(amountInPaise),
            });
            setState("success");
          } else {
            setError("Payment verification failed. Contact support.");
            setState("failed");
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response: any) => {
        setError(response.error?.description || "Payment failed");
        setState("failed");
      });
      rzp.open();

    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setLoading(false);
      setState("form");
    }
  };

  // ── Success Screen ──
  if (state === "success") {
    return (
      <div style={{ flex: 1, overflowY: "auto", backgroundColor: "#0f1117" }}>
        <Header title="Payment Successful" subtitle="" />
        <div style={{
          padding: "64px 32px", display: "flex",
          flexDirection: "column", alignItems: "center",
          justifyContent: "center", gap: "24px", textAlign: "center"
        }}>
          <div style={{
            width: "80px", height: "80px", borderRadius: "50%",
            backgroundColor: "#10b98120", border: "2px solid #10b981",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 40px #10b98140"
          }}>
            <CheckCircle size={40} color="#10b981" />
          </div>

          <div>
            <h2 style={{
              fontSize: "28px", fontWeight: 800,
              color: "#ffffff", marginBottom: "8px"
            }}>
              Payment Successful! 🎉
            </h2>
            <p style={{ fontSize: "15px", color: "#8b8fa8" }}>
              Your payment has been processed and verified
            </p>
          </div>

          <div style={{
            backgroundColor: "#1a1d27", borderRadius: "12px",
            border: "1px solid #10b98130", padding: "24px",
            display: "flex", flexDirection: "column", gap: "12px",
            minWidth: "320px"
          }}>
            {[
              { label: "Amount",     value: successData?.amount,    color: "#10b981" },
              { label: "Payment ID", value: successData?.paymentId, mono: true       },
              { label: "Order ID",   value: successData?.orderId,   mono: true       },
              { label: "Status",     value: "CAPTURED ✓",           color: "#10b981" },
            ].map(item => (
              <div key={item.label} style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "center"
              }}>
                <span style={{ fontSize: "13px", color: "#8b8fa8" }}>
                  {item.label}
                </span>
                <span style={{
                  fontSize: "13px",
                  fontWeight: item.color ? 700 : 500,
                  color: item.color || "#ffffff",
                  fontFamily: item.mono ? "monospace" : "inherit",
                  maxWidth: "200px", overflow: "hidden",
                  textOverflow: "ellipsis", textAlign: "right"
                }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={() => {
                setState("form");
                setAmount("");
                setDescription("");
                setUpiId("");
                setSuccessData(null);
              }}
              style={{
                padding: "12px 24px", borderRadius: "10px",
                backgroundColor: "#10b981", border: "none",
                color: "#ffffff", fontSize: "14px",
                fontWeight: 700, cursor: "pointer"
              }}>
              Make Another Payment
            </button>
            <button
              onClick={() => router.push("/app/history")}
              style={{
                padding: "12px 24px", borderRadius: "10px",
                backgroundColor: "#1a1d27",
                border: "1px solid #2a2d3e",
                color: "#ffffff", fontSize: "14px",
                fontWeight: 600, cursor: "pointer"
              }}>
              View History
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Failed Screen ──
  if (state === "failed") {
    return (
      <div style={{ flex: 1, overflowY: "auto", backgroundColor: "#0f1117" }}>
        <Header title="Payment Failed" subtitle="" />
        <div style={{
          padding: "64px 32px", display: "flex",
          flexDirection: "column", alignItems: "center",
          gap: "24px", textAlign: "center"
        }}>
          <div style={{
            width: "80px", height: "80px", borderRadius: "50%",
            backgroundColor: "#ef444420", border: "2px solid #ef4444",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <AlertCircle size={40} color="#ef4444" />
          </div>
          <div>
            <h2 style={{ fontSize: "24px", fontWeight: 800, color: "#ffffff" }}>
              Payment Failed
            </h2>
            <p style={{ fontSize: "14px", color: "#8b8fa8", marginTop: "8px" }}>
              {error || "Something went wrong with your payment"}
            </p>
          </div>
          <button
            onClick={() => { setState("form"); setError(""); }}
            style={{
              padding: "12px 28px", borderRadius: "10px",
              backgroundColor: "#6366f1", border: "none",
              color: "#ffffff", fontSize: "14px",
              fontWeight: 700, cursor: "pointer"
            }}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ── Processing Screen ──
  if (state === "processing") {
    return (
      <div style={{ flex: 1, overflowY: "auto", backgroundColor: "#0f1117" }}>
        <Header title="Processing Payment" subtitle="" />
        <div style={{
          padding: "64px 32px", display: "flex",
          flexDirection: "column", alignItems: "center",
          gap: "24px", textAlign: "center"
        }}>
          <Loader2 size={48} color="#6366f1"
            style={{ animation: "spin 1s linear infinite" }} />
          <div>
            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#ffffff" }}>
              Verifying Payment...
            </h2>
            <p style={{ fontSize: "14px", color: "#8b8fa8", marginTop: "8px" }}>
              Please wait while we confirm with Razorpay
            </p>
          </div>
          <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
        </div>
      </div>
    );
  }

  // ── Payment Form ──
  return (
    <div style={{ flex: 1, overflowY: "auto", backgroundColor: "#0f1117" }}>
      <Header
        title="Make a Payment"
        subtitle="Secure UPI payment powered by Razorpay"
      />

      <div style={{ padding: "32px", maxWidth: "520px" }}>

        {/* Error */}
        {error && (
          <div style={{
            backgroundColor: "#ef444415",
            border: "1px solid #ef444440",
            borderRadius: "8px", padding: "12px",
            fontSize: "13px", color: "#ef4444",
            marginBottom: "20px",
            display: "flex", alignItems: "center", gap: "8px"
          }}>
            <AlertCircle size={14} /> {error}
          </div>
        )}

        {/* Form Card */}
        <div style={{
          backgroundColor: "#1a1d27", borderRadius: "16px",
          border: "1px solid #2a2d3e", overflow: "hidden"
        }}>

          {/* Header */}
          <div style={{
            padding: "20px 24px", borderBottom: "1px solid #2a2d3e",
            background: "linear-gradient(90deg, #6366f110, transparent)",
            display: "flex", alignItems: "center", gap: "12px"
          }}>
            <div style={{
              width: "40px", height: "40px", borderRadius: "10px",
              backgroundColor: "#6366f1",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <CreditCard size={18} color="white" />
            </div>
            <div>
              <p style={{
                fontSize: "15px", fontWeight: 700, color: "#ffffff"
              }}>
                UPI Payment
              </p>
              <p style={{ fontSize: "12px", color: "#8b8fa8", marginTop: "2px" }}>
                Secured by Razorpay • Test Mode
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handlePayment}
            style={{
              padding: "24px",
              display: "flex", flexDirection: "column", gap: "20px"
            }}>

            {/* Amount */}
            <div>
              <label style={{
                fontSize: "12px", fontWeight: 600, color: "#8b8fa8",
                marginBottom: "8px", display: "block",
                textTransform: "uppercase", letterSpacing: "0.05em"
              }}>
                Amount (₹)
              </label>
              <div style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "14px 16px", borderRadius: "10px",
                backgroundColor: "#0f1117",
                border: `1px solid ${amount ? "#6366f1" : "#2a2d3e"}`,
                transition: "border-color 0.15s"
              }}>
                <IndianRupee size={18} color="#8b8fa8" />
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00"
                  min="1"
                  step="0.01"
                  required
                  style={{
                    background: "none", border: "none", outline: "none",
                    color: "#ffffff", fontSize: "20px",
                    fontWeight: 700, width: "100%"
                  }}
                />
              </div>
              {amountInPaise > 0 && (
                <p style={{
                  fontSize: "12px", color: "#8b8fa8", marginTop: "6px"
                }}>
                  = {amountInPaise.toLocaleString()} paise
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label style={{
                fontSize: "12px", fontWeight: 600, color: "#8b8fa8",
                marginBottom: "8px", display: "block",
                textTransform: "uppercase", letterSpacing: "0.05em"
              }}>
                Description (optional)
              </label>
              <input
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="e.g. Invoice #1234, Monthly subscription"
                style={{
                  width: "100%", padding: "12px 16px",
                  borderRadius: "10px", backgroundColor: "#0f1117",
                  border: "1px solid #2a2d3e", color: "#ffffff",
                  fontSize: "14px", outline: "none",
                  boxSizing: "border-box"
                }}
              />
            </div>

            {/* UPI ID */}
            <div>
              <label style={{
                fontSize: "12px", fontWeight: 600, color: "#8b8fa8",
                marginBottom: "8px", display: "block",
                textTransform: "uppercase", letterSpacing: "0.05em"
              }}>
                UPI ID (optional — prefill)
              </label>
              <input
                type="text"
                value={upiId}
                onChange={e => setUpiId(e.target.value)}
                placeholder="yourname@upi"
                style={{
                  width: "100%", padding: "12px 16px",
                  borderRadius: "10px", backgroundColor: "#0f1117",
                  border: "1px solid #2a2d3e", color: "#ffffff",
                  fontSize: "14px", outline: "none",
                  boxSizing: "border-box"
                }}
              />
            </div>

            {/* Amount Preview */}
            {amountInPaise >= 100 && (
              <div style={{
                padding: "16px", borderRadius: "10px",
                backgroundColor: "#6366f110",
                border: "1px solid #6366f130",
                display: "flex", alignItems: "center",
                justifyContent: "space-between"
              }}>
                <span style={{ fontSize: "14px", color: "#8b8fa8" }}>
                  You will pay
                </span>
                <span style={{
                  fontSize: "22px", fontWeight: 800, color: "#6366f1"
                }}>
                  {formatAmount(amountInPaise)}
                </span>
              </div>
            )}

            {/* Pay Button */}
            <button
              type="submit"
              disabled={loading || amountInPaise < 100}
              style={{
                width: "100%", padding: "16px",
                borderRadius: "12px", backgroundColor: "#6366f1",
                border: "none", color: "#ffffff",
                fontSize: "16px", fontWeight: 700,
                cursor: amountInPaise < 100 ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center",
                justifyContent: "center", gap: "10px",
                opacity: amountInPaise < 100 ? 0.5 : 1,
                transition: "opacity 0.2s ease"
              }}>
              {loading ? (
                <>
                  <Loader2 size={18}
                    style={{ animation: "spin 1s linear infinite" }} />
                  Creating Order...
                </>
              ) : (
                <>
                  <Zap size={18} fill="white" />
                  Pay {amountInPaise >= 100 ? formatAmount(amountInPaise) : "Now"}
                </>
              )}
            </button>
          </form>
        </div>

        {/* Security Note */}
        <div style={{
          marginTop: "16px", padding: "14px 16px",
          borderRadius: "10px", backgroundColor: "#1a1d27",
          border: "1px solid #2a2d3e",
          display: "flex", gap: "10px", alignItems: "flex-start"
        }}>
          <Shield size={15} color="#10b981" style={{ flexShrink: 0, marginTop: "1px" }} />
          <div>
            <p style={{
              fontSize: "12px", fontWeight: 600,
              color: "#10b981", marginBottom: "4px"
            }}>
              Secure Payment
            </p>
            <p style={{ fontSize: "12px", color: "#8b8fa8", lineHeight: 1.5 }}>
              Payments are processed by Razorpay and verified using
              HMAC-SHA256 signature. Running in test mode —
              use Razorpay test UPI ID: <code style={{ color: "#6366f1" }}>success@razorpay</code>
            </p>
          </div>
        </div>

        {/* Back */}
        <button
          onClick={() => router.push("/app")}
          style={{
            marginTop: "16px",
            display: "flex", alignItems: "center", gap: "6px",
            background: "none", border: "none",
            color: "#8b8fa8", fontSize: "13px", cursor: "pointer"
          }}>
          <ArrowLeft size={14} /> Back to Dashboard
        </button>

      </div>
    </div>
  );
}