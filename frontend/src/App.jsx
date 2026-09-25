import { useEffect, useState } from "react";
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
    Link
} from "react-router-dom";

import Navbar from "./components/Navbar";
import AddExpense from "./components/AddExpense";
import TransactionList from "./components/TransactionList";
import TopCategories from "./components/TopCategories";
import RunningTotal from "./components/RunningTotal";
import MomGrowth from "./components/MomGrowth";
import TopTransactions from "./components/TopTransactions";

import Login from "./pages/Login";
import Register from "./pages/Register";

import { apiFetch } from "./utils/api";


function ProtectedRoute({ children }) {
    const token = localStorage.getItem("token");

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return children;
}


function Dashboard() {
    const [summary, setSummary] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const fetchSummary = async () => {
        try {
            const response = await apiFetch("/api/summary");

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Failed to fetch summary"
                );
            }

            setSummary(data);
        } catch (error) {
            console.error("Error fetching summary:", error);
        }
    };

    useEffect(() => {
        fetchSummary();
    }, [refreshKey]);


    const handleTransactionChanged = () => {
        setRefreshKey((prev) => prev + 1);
    };


    return (
        <div className="space-y-6">

            {/* Dashboard Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">
                    Dashboard
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                    Overview of your expenses and spending analytics.
                </p>
            </div>


            {/* Summary Cards */}
            {summary && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">

                    {/* Current Month */}
                    <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
                        <p className="text-sm text-gray-500">
                            Current Month
                        </p>

                        <p className="mt-2 text-2xl font-bold text-gray-900">
                            ₹
                            {Number(
                                summary.current_month_expenses || 0
                            ).toFixed(2)}
                        </p>
                    </div>


                    {/* Highest Transaction */}
                    <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
                        <p className="text-sm text-gray-500">
                            Highest Transaction
                        </p>

                        <p className="mt-2 text-2xl font-bold text-gray-900">
                            ₹
                            {Number(
                                summary.highest_expense_this_month || 0
                            ).toFixed(2)}
                        </p>
                    </div>


                    {/* Total Transactions */}
                    <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
                        <p className="text-sm text-gray-500">
                            Total Transactions
                        </p>

                        <p className="mt-2 text-2xl font-bold text-gray-900">
                            {summary.total_transactions || 0}
                        </p>
                    </div>


                    {/* Total Spending */}
                    <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
                        <p className="text-sm text-gray-500">
                            Total Spending
                        </p>

                        <p className="mt-2 text-2xl font-bold text-gray-900">
                            ₹
                            {Number(
                                summary.total_amount || 0
                            ).toFixed(2)}
                        </p>
                    </div>

                </div>
            )}


            {/* Latest Transactions */}
            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">

                <div className="mb-4 flex items-center justify-between">

                    <h2 className="text-lg font-semibold text-gray-900">
                        Latest Transactions
                    </h2>

                    <Link
                        to="/transactions"
                        className="text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                        View All
                    </Link>

                </div>


                <TransactionList
                    limit={5}
                    refreshKey={refreshKey}
                    onTransactionChanged={handleTransactionChanged}
                />

            </div>


            {/* Running Total Chart */}
            <RunningTotal refreshKey={refreshKey} />

        </div>
    );
}


function TransactionsPage() {
    const [refreshKey, setRefreshKey] = useState(0);

    const handleTransactionChanged = () => {
        setRefreshKey((prev) => prev + 1);
    };


    return (
        <div className="space-y-6">

            <div>
                <h1 className="text-2xl font-bold text-gray-900">
                    Transactions
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                    Add, edit and delete your transactions.
                </p>
            </div>


            <AddExpense
                onTransactionAdded={handleTransactionChanged}
            />


            <TransactionList
                refreshKey={refreshKey}
                onTransactionChanged={handleTransactionChanged}
            />

        </div>
    );
}


function App() {
    return (
        <BrowserRouter>

            <Navbar />

            <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

                <Routes>

                    {/* ================= PUBLIC ROUTES ================= */}

                    <Route
                        path="/login"
                        element={<Login />}
                    />

                    <Route
                        path="/register"
                        element={<Register />}
                    />


                    {/* ================= PROTECTED ROUTES ================= */}

                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />


                    <Route
                        path="/transactions"
                        element={
                            <ProtectedRoute>
                                <TransactionsPage />
                            </ProtectedRoute>
                        }
                    />


                    <Route
                        path="/top-categories"
                        element={
                            <ProtectedRoute>
                                <TopCategories />
                            </ProtectedRoute>
                        }
                    />


                    <Route
                        path="/running-total"
                        element={
                            <ProtectedRoute>
                                <RunningTotal />
                            </ProtectedRoute>
                        }
                    />


                    <Route
                        path="/mom-growth"
                        element={
                            <ProtectedRoute>
                                <MomGrowth />
                            </ProtectedRoute>
                        }
                    />


                    <Route
                        path="/top-transactions"
                        element={
                            <ProtectedRoute>
                                <TopTransactions />
                            </ProtectedRoute>
                        }
                    />


                    {/* ================= UNKNOWN ROUTE ================= */}

                    <Route
                        path="*"
                        element={
                            <Navigate to="/" replace />
                        }
                    />

                </Routes>

            </main>

        </BrowserRouter>
    );
}


export default App;