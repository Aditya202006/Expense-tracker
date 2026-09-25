import { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";

function TopCategories() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchTopCategories = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await apiFetch("/api/top-categories");

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(
                        result.error || "Failed to fetch top categories"
                    );
                }

                setData(result);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTopCategories();
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                    Top Categories
                </h1>

                <p className="mt-1 text-gray-500">
                    The highest-spending category for each month.
                </p>
            </div>

            <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                <div className="mb-5">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Monthly Spending Leader
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Calculated using SQL aggregation and the RANK() window
                        function.
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
                        No analytics data available.
                    </div>
                )}

                {!loading && !error && data.length > 0 && (
                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                        <table className="w-full min-w-[600px]">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Month
                                    </th>

                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Category
                                    </th>

                                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Total Spent
                                    </th>

                                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Rank
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {data.map((item) => (
                                    <tr
                                        key={`${item.month}-${item.cat_name}`}
                                        className="border-t border-gray-100 transition hover:bg-gray-50"
                                    >
                                        <td className="px-4 py-4 text-sm font-medium text-gray-900">
                                            {item.month}
                                        </td>

                                        <td className="px-4 py-4 text-sm text-gray-700">
                                            {item.cat_name}
                                        </td>

                                        <td className="px-4 py-4 text-right text-sm font-semibold text-gray-900">
                                            ₹{Number(item.total).toFixed(2)}
                                        </td>

                                        <td className="px-4 py-4 text-center">
                                            <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                                                #{item.rnk}
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

export default TopCategories;