// frontend/src/pages/OrderStatus.js
import React, { useState, useEffect, useMemo } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";

const API_URL = import.meta.env.REACT_APP_API_URL || "http://localhost:3000/api";

function OrderStatus() {
  const { orderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const steps = ["pending", "placed", "preparing", "ready", "served"];

  const summary = useMemo(() => {
    if (!order || !order.items) return { subtotal: 0, gst: 0, total: 0 };

    const subtotal = order.items.reduce((sum, item) => {
      const price = item.price || 0;
      const qty = item.qty || 0;
      return sum + price * qty;
    }, 0);

    const gst = +(subtotal * 0.05).toFixed(2);
    const total = subtotal + gst;

    return { subtotal, gst, total };
  }, [order]);

  useEffect(() => {
    loadOrder();
    const interval = setInterval(loadOrder, 5000);
    return () => clearInterval(interval);
  }, [orderId]);

  const loadOrder = async () => {
    try {
      const searchParams = new URLSearchParams(location.search);
      const guestToken = searchParams.get("guestToken");
      const token = localStorage.getItem("token");

      const headers = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const url = guestToken
        ? `${API_URL}/orders/${orderId}?guestToken=${guestToken}`
        : `${API_URL}/orders/${orderId}`;

      const response = await fetch(url, { headers });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load order");
      }

      setOrder(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      pending: {
        icon: "⏳",
      text: "Pending",
      color: "#bdbdbd",
      message: "Your order is waiting to be placed",
},
      placed: {
        icon: "📝",
        text: "Order Placed",
        color: "#ff9800",
        message: "Your order has been received!",
      },
      preparing: {
        icon: "👨‍🍳",
        text: "Preparing",
        color: "#2196F3",
        message: "Our chef is preparing your delicious meal",
      },
      ready: {
        icon: "✅",
        text: "Ready",
        color: "#4CAF50",
        message: "Your order is ready to be served!",
      },
      served: {
        icon: "🍽️",
        text: "Served",
        color: "#9E9E9E",
        message: "Enjoy your meal!",
      },
      canceled: {
        icon: "❌",
        text: "Canceled",
        color: "#f44336",
        message: "This order has been canceled",
      },
    };
    return statusMap[status] || statusMap.placed;
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={styles.loader}></div>
          <p style={styles.loadingText}>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={styles.container}>
        <div style={styles.errorContainer}>
          <span style={styles.errorIcon}>😕</span>
          <p style={styles.errorText}>{error || "Order not found"}</p>
          <button style={styles.backButton} onClick={() => navigate("/")}>
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(order.status);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Order Status</h1>
        <button style={styles.closeButton} onClick={() => navigate("/")}>
          ← Back to Menu
        </button>
      </div>

      {/* Status Card */}
      <div style={{ ...styles.statusCard, borderColor: statusInfo.color }}>
        <div style={styles.statusIcon}>{statusInfo.icon}</div>
        <h2 style={{ ...styles.statusTitle, color: statusInfo.color }}>
          {statusInfo.text}
        </h2>
        <p style={styles.statusMessage}>{statusInfo.message}</p>
      </div>

      {/* Order Details */}
      <div style={styles.orderCard}>
        <div style={styles.orderHeader}>
          <h3 style={styles.orderTitle}>Order Details</h3>
          <span style={styles.orderTime}>
            {new Date(order.createdAt).toLocaleString()}
          </span>
        </div>

        <div style={styles.infoRow}>
          <span style={styles.infoLabel}>🪑 Table:</span>
          <span style={styles.infoValue}>
            Table {order.table?.tableNumber || "N/A"}
          </span>
        </div>

        <div style={styles.itemsSection}>
          <h4 style={styles.sectionTitle}>Items Ordered</h4>
          {order.items.map((item, idx) => (
            <div key={idx} style={styles.orderItem}>
              <div style={styles.itemLeft}>
                <span style={styles.itemQty}>{item.qty}x</span>
                <div>
                  <p style={styles.itemName}>{item.name}</p>
                  {item.note && (
                    <p style={styles.itemNote}>Note: {item.note}</p>
                  )}
                </div>
              </div>
              <span style={styles.itemPrice}>₹{item.price * item.qty}</span>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div style={styles.summary}>
          <div style={styles.summaryRow}>
            <span>Subtotal:</span>
            <span>₹{summary.subtotal}</span>
          </div>
          <div style={styles.summaryRow}>
            <span>GST (5%):</span>
            <span>₹{summary.gst}</span>
          </div>
          <div style={{ ...styles.summaryRow, ...styles.totalRow }}>
            <strong>Total:</strong>
            <strong style={styles.totalAmount}>₹{summary.total}</strong>
          </div>
        </div>

        {/* Progress Steps */}
        <div style={styles.progressCard}>
          <h3 style={styles.progressTitle}>Order Progress</h3>
          <div style={styles.steps}>
{steps.map((step, idx) => {
  const stepStatus = getStatusInfo(step);
  const isActive = order.status === step;
  const isPassed = steps.indexOf(order.status) > idx;

  return (
    <React.Fragment key={step}>
      <div style={styles.step}>
        <div
          style={{
            ...styles.stepCircle,
            backgroundColor: isActive || isPassed ? stepStatus.color : "#e0e0e0",
            transform: isActive ? "scale(1.2)" : "scale(1)",
          }}
        >
          {stepStatus.icon}
        </div>
        <p
          style={{
            ...styles.stepLabel,
            color: isActive || isPassed ? "#333" : "#999",
            fontWeight: isActive ? "700" : "500",
          }}
        >
          {stepStatus.text}
        </p>
      </div>
      {idx < steps.length - 1 && (
        <div
          style={{
            ...styles.stepConnector,
            backgroundColor: isPassed ? stepStatus.color : "#ccc",
          }}
        />
      )}
    </React.Fragment>
  );
})}
          </div>
        </div>

        {/* Action Button */}
        {order.status === "served" && (
          <button style={styles.newOrderButton} onClick={() => navigate("/")}>
            🍽️ Order Again
          </button>
        )}
      </div>
    </div>
  );
}


const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f8f9fa",
    padding: "20px",
    paddingBottom: "40px",
  },
  header: {
    maxWidth: "800px",
    margin: "0 auto 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    margin: 0,
    fontSize: "28px",
    color: "#333",
    fontWeight: "800",
  },
  closeButton: {
    backgroundColor: "transparent",
    border: "none",
    fontSize: "16px",
    cursor: "pointer",
    color: "#666",
    fontWeight: "500",
  },
  loadingContainer: {
    textAlign: "center",
    padding: "80px 20px",
  },
  loader: {
    width: "50px",
    height: "50px",
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #667eea",
    borderRadius: "50%",
    margin: "0 auto 20px",
    animation: "spin 1s linear infinite",
  },
  loadingText: {
    color: "#666",
    fontSize: "16px",
  },
  errorContainer: {
    textAlign: "center",
    padding: "80px 20px",
  },
  errorIcon: {
    fontSize: "64px",
    display: "block",
    marginBottom: "16px",
  },
  errorText: {
    color: "#666",
    fontSize: "18px",
    marginBottom: "24px",
  },
  backButton: {
    padding: "12px 32px",
    backgroundColor: "#667eea",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "600",
  },
  statusCard: {
    maxWidth: "800px",
    margin: "0 auto 24px",
    backgroundColor: "white",
    borderRadius: "20px",
    padding: "40px",
    textAlign: "center",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    borderLeft: "6px solid",
  },
  statusIcon: {
    fontSize: "80px",
    marginBottom: "16px",
  },
  statusTitle: {
    margin: "0 0 12px 0",
    fontSize: "32px",
    fontWeight: "800",
  },
  statusMessage: {
    margin: 0,
    fontSize: "16px",
    color: "#666",
  },
  orderCard: {
    maxWidth: "800px",
    margin: "0 auto 24px",
    backgroundColor: "white",
    borderRadius: "16px",
    padding: "28px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
  },
  orderHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    paddingBottom: "16px",
    borderBottom: "2px solid #f0f0f0",
  },
  orderTitle: {
    margin: 0,
    fontSize: "20px",
    fontWeight: "700",
    color: "#333",
  },
  orderTime: {
    fontSize: "14px",
    color: "#666",
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "12px 0",
    fontSize: "16px",
  },
  infoLabel: {
    color: "#666",
    fontWeight: "500",
  },
  infoValue: {
    color: "#333",
    fontWeight: "600",
  },
  itemsSection: {
    marginTop: "24px",
  },
  sectionTitle: {
    margin: "0 0 16px 0",
    fontSize: "18px",
    fontWeight: "700",
    color: "#333",
  },
  orderItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: "16px 0",
    borderBottom: "1px solid #f0f0f0",
  },
  itemLeft: {
    display: "flex",
    gap: "12px",
    flex: 1,
  },
  itemQty: {
    backgroundColor: "#f0f0f0",
    padding: "4px 10px",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: "700",
    color: "#666",
  },
  itemName: {
    margin: "0 0 4px 0",
    fontSize: "16px",
    fontWeight: "600",
    color: "#333",
  },
  itemNote: {
    margin: 0,
    fontSize: "13px",
    color: "#666",
    fontStyle: "italic",
  },
  itemPrice: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#ff6b6b",
  },
  summary: {
    marginTop: "24px",
    paddingTop: "20px",
    borderTop: "2px solid #f0f0f0",
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "12px",
    fontSize: "16px",
    color: "#666",
  },
  totalRow: {
    paddingTop: "12px",
    borderTop: "2px solid #f0f0f0",
    marginTop: "8px",
    fontSize: "18px",
  },
  totalAmount: {
    fontSize: "24px",
    color: "#4CAF50",
  },
  progressCard: {
    maxWidth: "800px",
    margin: "0 auto 24px",
    backgroundColor: "white",
    borderRadius: "16px",
    padding: "28px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
  },
  progressTitle: {
    margin: "0 0 24px 0",
    fontSize: "20px",
    fontWeight: "700",
    color: "#333",
    textAlign: "center",
  },
  steps: {
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
  },
  step: {
    textAlign: "center",
    flex: 1,
  },
  stepCircle: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "28px",
    margin: "0 auto 12px",
    transition: "all 0.3s",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  stepLabel: {
    margin: 0,
    fontSize: "14px",
    transition: "all 0.3s",
  },
  stepConnector: {
    height: 4,
    flex: 1,
    margin: "0 4px",
    borderRadius: 2,
    transition: "background-color 0.3s ease",
  },
  newOrderButton: {
    maxWidth: "800px",
    width: "100%",
    margin: "0 auto",
    display: "block",
    padding: "18px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontSize: "18px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 4px 16px rgba(76, 175, 80, 0.3)",
  },
};

export default OrderStatus;
