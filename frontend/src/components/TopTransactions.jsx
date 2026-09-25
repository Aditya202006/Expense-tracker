import { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";

function TopTransactions({ refreshKey }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchTopTransactions = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await apiFetch(
                    "/api/top-transactions"
                );

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(
                        result.error || "Failed to fetch top transactions"
                    );
                }

                setData(result);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTopTransactions();
    }, [refreshKey]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                    Top Transactions
                </h1>

                <p className="mt-1 text-gray-500">
                    View the five highest individual expenses and their
                    percentile ranking.
                </p>
            </div>

            <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                <div className="mb-5">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Highest Expenses
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Percentile is calculated using the PERCENT_RANK()
                        window function.
                    </p>
                </div>

                {loading && (
                    <div className="py-10 text-center text-sm text-gray-500">
                        Loading data...
                    </div>
                )}

                {error && (
                    <div className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                        {error}
                    </div>
                )}

                {!loading && !error && data.length === 0 && (
                    <div className="py-10 text-center text-sm text-gray-500">
                        No transactions available.
                    </div>
                )}

                {!loading && !error && data.length > 0 && (
                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                        <table className="w-full min-w-[600px]">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Rank
                                    </th>

                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Transaction ID
                                    </th>

                                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Amount
                                    </th>

                                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Percentile
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {data.map((item, index) => (
                                    <tr
                                        key={item.tran_id}
                                        className="border-t border-gray-100 transition hover:bg-gray-50"
                                    >
                                        <td className="px-4 py-4">
                                            <span
                                                className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                                                    index === 0
                                                        ? "bg-amber-50 text-amber-700"
                                                        : "bg-gray-100 text-gray-600"
                                                }`}
                                            >
                                                {index + 1}
                                            </span>
                                        </td>

                                        <td className="px-4 py-4 text-sm font-medium text-gray-900">
                                            #{item.tran_id}
                                        </td>

                                        <td className="px-4 py-4 text-right text-sm font-semibold text-gray-900">
                                            ₹{Number(item.amount).toFixed(2)}
                                        </td>

                                        <td className="px-4 py-4 text-right">
                                            <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                                                {Number(item.percentile).toFixed(
                                                    2
                                                )}
                                                %
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}

export default TopTransactions;