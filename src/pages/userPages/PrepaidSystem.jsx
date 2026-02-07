import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { Wallet, TrendingUp, History, FileText, IndianRupee, Zap, ArrowUpRight, ArrowDownRight, CreditCard, AlertCircle, Loader2 } from "lucide-react";
import api from "../../api/connection";

export default function PrepaidPage() {
  const { deviceId } = useParams();
  
  const [wallet, setWallet] = useState(null);
  const [payments, setPayments] = useState([]);
  const [ledgers, setLedgers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMorePayments, setHasMorePayments] = useState(true);
  const [hasMoreLedgers, setHasMoreLedgers] = useState(true);
  const [paymentsPage, setPaymentsPage] = useState(0);
  const [ledgersPage, setLedgersPage] = useState(0);
  const [totalPayments, setTotalPayments] = useState(0);
  const [totalLedgers, setTotalLedgers] = useState(0);
  const [rechargeAmount, setRechargeAmount] = useState("");
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState(null);

  const observerTarget = useRef(null);
  const LIMIT = 10;

  // ===============================
  // INITIAL LOAD - Only wallet + stats
  // ===============================
  useEffect(() => {
    loadInitialData();
  }, [deviceId]);

  // ===============================
  // LOAD DATA WHEN TAB CHANGES
  // ===============================
  useEffect(() => {
    if (activeTab === "payments" && payments.length === 0) {
      loadInitialPayments();
    } else if (activeTab === "ledger" && ledgers.length === 0) {
      loadInitialLedgers();
    }
  }, [activeTab]);

  // ===============================
  // INFINITE SCROLL OBSERVER
  // ===============================
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore && !loading) {
          if (activeTab === "payments" && hasMorePayments) {
            loadMorePayments();
          } else if (activeTab === "ledger" && hasMoreLedgers) {
            loadMoreLedgers();
          }
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [activeTab, hasMorePayments, hasMoreLedgers, loadingMore, loading, paymentsPage, ledgersPage]);

  // ===============================
  // LOAD INITIAL DATA (WALLET + STATS ONLY)
  // ===============================
  async function loadInitialData() {
    setLoading(true);
    try {
      const [walletRes, statsRes] = await Promise.all([
        api.get(`/user/payment/wallet/${deviceId}`),
        api.get(`/user/payment/stats/${deviceId}`)
      ]);

      setWallet(walletRes.data.wallet);
      setStats(statsRes.data.stats);
    } catch (err) {
      console.error("Load initial data error:", err);
    }
    setLoading(false);
  }

  // ===============================
  // LOAD INITIAL PAYMENTS
  // ===============================
  async function loadInitialPayments() {
    try {
      const res = await api.get(`/user/payment/history/${deviceId}?limit=${LIMIT}&skip=0`);
      setPayments(res.data.payments || []);
      setTotalPayments(res.data.total || 0);
      setHasMorePayments((res.data.payments || []).length >= LIMIT);
      setPaymentsPage(1);
    } catch (err) {
      console.error("Load payments error:", err);
      setPayments([]);
    }
  }

  // ===============================
  // LOAD MORE PAYMENTS
  // ===============================
  async function loadMorePayments() {
    if (loadingMore || !hasMorePayments) return;
    
    setLoadingMore(true);
    try {
      const res = await api.get(`/user/payment/history/${deviceId}?limit=${LIMIT}&skip=${paymentsPage * LIMIT}`);
      const newPayments = res.data.payments || [];
      
      setPayments(prev => [...prev, ...newPayments]);
      setHasMorePayments(newPayments.length >= LIMIT);
      setPaymentsPage(prev => prev + 1);
    } catch (err) {
      console.error("Load more payments error:", err);
      setHasMorePayments(false);
    }
    setLoadingMore(false);
  }

  // ===============================
  // LOAD INITIAL LEDGERS
  // ===============================
  async function loadInitialLedgers() {
    try {
      const res = await api.get(`/user/payment/ledger/${deviceId}?limit=${LIMIT}&skip=0`);
      setLedgers(res.data.entries || []);
      setTotalLedgers(res.data.total || 0);
      setHasMoreLedgers((res.data.entries || []).length >= LIMIT);
      setLedgersPage(1);
    } catch (err) {
      console.error("Load ledgers error:", err);
      setLedgers([]);
    }
  }

  // ===============================
  // LOAD MORE LEDGERS
  // ===============================
  async function loadMoreLedgers() {
    if (loadingMore || !hasMoreLedgers) return;
    
    setLoadingMore(true);
    try {
      const res = await api.get(`/user/payment/ledger/${deviceId}?limit=${LIMIT}&skip=${ledgersPage * LIMIT}`);
      const newLedgers = res.data.entries || [];
      
      setLedgers(prev => [...prev, ...newLedgers]);
      setHasMoreLedgers(newLedgers.length >= LIMIT);
      setLedgersPage(prev => prev + 1);
    } catch (err) {
      console.error("Load more ledgers error:", err);
      setHasMoreLedgers(false);
    }
    setLoadingMore(false);
  }

  // ===============================
  // RECHARGE HANDLER
  // ===============================
  async function handleRecharge() {
    if (!rechargeAmount || parseFloat(rechargeAmount) < 1) {
      alert("Please enter a valid amount (minimum ₹1)");
      return;
    }

    setProcessing(true);

    try {
      const orderRes = await api.post("/user/payment/create-order", {
        deviceId,
        amount: parseFloat(rechargeAmount)
      });

      const { order, key } = orderRes.data;

      const options = {
        key,
        amount: order.amount,
        currency: order.currency,
        name: "Energy Meter Recharge",
        description: `Recharge for Device ${deviceId}`,
        order_id: order.orderId,
        handler: async (response) => {
          try {
            await api.post("/user/payment/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            alert("✅ Recharge successful!");
            setRechargeAmount("");
            
            // Refresh wallet and stats
            loadInitialData();
            
            // If on payments tab, refresh the list
            if (activeTab === "payments") {
              setPayments([]);
              setPaymentsPage(0);
              setHasMorePayments(true);
              loadInitialPayments();
            }
          } catch (err) {
            alert("Payment verification failed: " + err.response?.data?.error);
          }
        },
        prefill: {
          name: "User",
          email: "user@example.com"
        },
        theme: {
          color: "#3b82f6"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      alert("Failed to create order: " + err.response?.data?.error);
    }

    setProcessing(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Loading wallet...</p>
        </div>
      </div>
    );
  }

  const balanceInRupees = wallet ? parseFloat(wallet.balanceInRupees) : 0;
  const quickAmounts = [50, 100, 200, 500, 1000];
  const isLowBalance = balanceInRupees < (wallet?.lowBalanceThreshold ? wallet.lowBalanceThreshold / 100 : 50);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-4">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:px-8">
        
        {/* Header - Mobile Optimized */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Prepaid Wallet</h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">Device ID: {deviceId}</p>
        </div>

        {/* Balance Card - Mobile Optimized */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-4 sm:mb-6 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Available Balance</span>
            </div>
            <span className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium ${
              wallet?.status === 'ACTIVE' 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
            }`}>
              {wallet?.status || 'ACTIVE'}
            </span>
          </div>
          
          <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
            ₹{balanceInRupees.toFixed(2)}
          </div>

          {isLowBalance && (
            <div className="flex items-start gap-2 text-xs sm:text-sm text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-2.5 sm:px-3 py-2 rounded-md">
              <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5" />
              <span>Low balance alert at ₹{wallet?.lowBalanceThreshold ? (wallet.lowBalanceThreshold / 100).toFixed(2) : '50.00'}</span>
            </div>
          )}
        </div>

        {/* Recharge Section - Mobile Optimized */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-4 sm:mb-6 p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700 dark:text-gray-300" />
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Recharge Wallet</h2>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {/* Quick Amount Buttons - Mobile Grid */}
            <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-2">
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  onClick={() => setRechargeAmount(amt.toString())}
                  className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 active:scale-95 transition-all"
                >
                  ₹{amt}
                </button>
              ))}
            </div>

            {/* Recharge Input - Mobile Stack */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <div className="flex-1 relative">
                <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <input
                  type="number"
                  value={rechargeAmount}
                  onChange={(e) => setRechargeAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
                />
              </div>
              <button
                onClick={handleRecharge}
                disabled={processing}
                className="w-full sm:w-auto px-6 py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-md font-medium text-sm sm:text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {processing ? "Processing..." : "Recharge Now"}
              </button>
            </div>
          </div>
        </div>

        {/* Tabs - Mobile Optimized */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex -mb-px overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setActiveTab("overview")}
                className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "overview"
                    ? "border-blue-600 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Overview
              </button>
              <button
                onClick={() => setActiveTab("payments")}
                className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "payments"
                    ? "border-blue-600 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
                }`}
              >
                <History className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Payments {totalPayments > 0 && <span className="hidden sm:inline">({totalPayments})</span>}
              </button>
              <button
                onClick={() => setActiveTab("ledger")}
                className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "ledger"
                    ? "border-blue-600 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
                }`}
              >
                <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Ledger {totalLedgers > 0 && <span className="hidden sm:inline">({totalLedgers})</span>}
              </button>
            </nav>
          </div>

          <div className="p-4 sm:p-6">
            {/* Overview Tab - Mobile Optimized */}
            {activeTab === "overview" && (
              <div className="space-y-4 sm:space-y-6">
                {stats ? (
                  <>
                    {/* Stats Grid - Mobile Optimized */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                      <div className="p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1.5 sm:mb-2">
                          <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" />
                          Total Recharged
                        </div>
                        <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                          ₹{(stats.totalRecharged / 100).toFixed(2)}
                        </div>
                      </div>

                      <div className="p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1.5 sm:mb-2">
                          <ArrowDownRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600" />
                          Total Consumed
                        </div>
                        <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                          ₹{(stats.totalConsumed / 100).toFixed(2)}
                        </div>
                      </div>

                      <div className="p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1.5 sm:mb-2">
                          <History className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          Transactions
                        </div>
                        <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                          {stats.totalTransactions}
                        </div>
                      </div>
                    </div>

                    {/* Recent Activity - Mobile Optimized */}
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Recent Activity</h3>
                      <div className="space-y-2 sm:space-y-3">
                        {stats.recentActivity && stats.recentActivity.length > 0 ? (
                          stats.recentActivity.map((entry, idx) => (
                            <div key={idx} className="flex items-start gap-2.5 sm:gap-3 p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                              <div className={`p-1.5 sm:p-2 rounded-lg flex-shrink-0 ${
                                entry.entryType === 'CREDIT' 
                                  ? 'bg-green-100 dark:bg-green-900/30' 
                                  : 'bg-red-100 dark:bg-red-900/30'
                              }`}>
                                {entry.entryType === 'CREDIT' ? (
                                  <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 dark:text-green-400" />
                                ) : (
                                  <ArrowDownRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600 dark:text-red-400" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white truncate">{entry.description}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                  {new Date(entry.createdAt).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                              <div className={`text-base sm:text-lg font-semibold flex-shrink-0 ${
                                entry.entryType === 'CREDIT' 
                                  ? 'text-green-600 dark:text-green-400' 
                                  : 'text-red-600 dark:text-red-400'
                              }`}>
                                {entry.entryType === 'CREDIT' ? '+' : '-'}₹{(entry.amount / 100).toFixed(2)}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                            No recent activity
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Loading stats...</p>
                  </div>
                )}
              </div>
            )}

            {/* Payments Tab - Mobile Optimized */}
            {activeTab === "payments" && (
              <div className="space-y-2.5 sm:space-y-3">
                {payments.length === 0 && !loadingMore ? (
                  <div className="text-center py-12">
                    <CreditCard className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No payment history yet</p>
                  </div>
                ) : (
                  <>
                    {payments.map((payment) => (
                      <div key={payment._id} className="p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                        <div className="flex justify-between items-start mb-2.5 sm:mb-3 gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 sm:gap-2 mb-1 flex-wrap">
                              <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                {payment.status}
                              </span>
                              {payment.method && (
                                <span className="text-xs text-gray-600 dark:text-gray-400">{payment.method.toUpperCase()}</span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(payment.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          <div className="text-lg sm:text-xl font-bold text-green-600 dark:text-green-400 flex-shrink-0">
                            +₹{(payment.amount / 100).toFixed(2)}
                          </div>
                        </div>
                        <div className="pt-2.5 sm:pt-3 border-t border-gray-200 dark:border-gray-700 space-y-0.5">
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            Order: {payment.razorpayOrderId}
                          </p>
                          {payment.razorpayPaymentId && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              Payment: {payment.razorpayPaymentId}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Loading More Indicator */}
                    {loadingMore && (
                      <div className="flex justify-center py-4 sm:py-6">
                        <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-blue-600" />
                      </div>
                    )}

                    {/* Intersection Observer Target */}
                    {hasMorePayments && !loadingMore && (
                      <div ref={observerTarget} className="h-4" />
                    )}

                    {/* End of List */}
                    {!hasMorePayments && payments.length > 0 && (
                      <div className="text-center py-4 sm:py-6 text-gray-500 dark:text-gray-400">
                        <p className="text-xs sm:text-sm">You've reached the end of the list</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Ledger Tab - Mobile Optimized */}
            {activeTab === "ledger" && (
              <div className="space-y-2.5 sm:space-y-3">
                {ledgers.length === 0 && !loadingMore ? (
                  <div className="text-center py-12">
                    <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No ledger entries yet</p>
                  </div>
                ) : (
                  <>
                    {ledgers.map((entry, idx) => (
                      <div key={entry._id || idx} className="p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                        <div className="flex justify-between items-start mb-2.5 sm:mb-3 gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2 flex-wrap">
                              <span className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                entry.entryType === 'CREDIT'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                              }`}>
                                {entry.entryType}
                              </span>
                              <span className="text-xs text-gray-600 dark:text-gray-400">
                                {entry.referenceType}
                              </span>
                            </div>
                            <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white mb-1">
                              {entry.description}
                            </p>
                            {entry.energy && (
                              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                <Zap className="w-3 h-3" />
                                {entry.energy.unitConsumed} kWh @ ₹{entry.energy.tariffRate}/kWh
                              </p>
                            )}
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 sm:mt-2">
                              {new Date(entry.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className={`text-lg sm:text-xl font-bold mb-0.5 sm:mb-1 ${
                              entry.entryType === 'CREDIT'
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-red-600 dark:text-red-400'
                            }`}>
                              {entry.entryType === 'CREDIT' ? '+' : '-'}₹{(entry.amount / 100).toFixed(2)}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Bal: ₹{(entry.balanceAfter / 100).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Loading More Indicator */}
                    {loadingMore && (
                      <div className="flex justify-center py-4 sm:py-6">
                        <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-blue-600" />
                      </div>
                    )}

                    {/* Intersection Observer Target */}
                    {hasMoreLedgers && !loadingMore && (
                      <div ref={observerTarget} className="h-4" />
                    )}

                    {/* End of List */}
                    {!hasMoreLedgers && ledgers.length > 0 && (
                      <div className="text-center py-4 sm:py-6 text-gray-500 dark:text-gray-400">
                        <p className="text-xs sm:text-sm">You've reached the end of the list</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    </div>
  );
}