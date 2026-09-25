import { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";

function MomGrowth({ refreshKey }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchMomGrowth = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await apiFetch("/api/mom-growth");

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(
                        result.error ||
                            "Failed to fetch month-over-month growth"
                    );
                }

                setData(result);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMomGrowth();
    }, [refreshKey]);

    const formatMonth = (month) => {
        const [year, monthNumber] = month.split("-");

        return new Intl.DateTimeFormat("en-IN", {
            month: "long",
            year: "numeric"
        }).format(
            new Date(Number(year), Number(monthNumber) - 1, 1)
        );
    };

    const formatCurrency = (value) => {
        return `₹${Number(value || 0).toFixed(2)}`;
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                    Month-over-Month Growth
                </h1>

                <p className="mt-1 text-gray-500">
                    Compare monthly spending with the previous month.
                </p>
            </div>

            <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                <div className="mb-5">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Monthly Spending Changes
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Calculated using monthly aggregation and the LAG()
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
                        No analytics data available.
                    </div>
                )}

                {!loading && !error && data.length > 0 && (
                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                        <table className="w-full min-w-[700px]">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Month
                                    </th>

                                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Total Spent
                                    </th>

                                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Previous Month
                                    </th>

                                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Change
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {data.map((item) => {
                                    const percentage =
                                        item.percentage_change;

                                    const hasPreviousMonth =
                                        item.previous_total !== null &&
                                        item.previous_total !== undefined;

                                    const isIncrease =
                                        percentage !== null &&
                                        percentage !== undefined &&
                                        Number(percentage) > 0;

                                    const isDecrease =
                                        percentage !== null &&
                                        percentage !== undefined &&
                                        Number(percentage) < 0;

                                    return (
                                        <tr
                                            key={item.month}
                                            className="border-t border-gray-100 transition hover:bg-gray-50"
                                        >
                                            <td className="px-4 py-4 text-sm font-medium text-gray-900">
                                                {formatMonth(item.month)}
                                            </td>

                                            <td className="px-4 py-4 text-right text-sm font-semibold text-gray-900">
                                                {formatCurrency(item.total)}
                                            </td>

                                            <td className="px-4 py-4 text-right text-sm text-gray-700">
                                                {hasPreviousMonth
                                                    ? formatCurrency(
                                                          item.previous_total
                                                      )
                                                    : "—"}
                                            </td>

                                            <td className="px-4 py-4 text-right">
                                                {!hasPreviousMonth ||
                                                percentage === null ||
                                                percentage === undefined ? (
                                                    <span className="text-sm text-gray-400">
                                                        —
                                                    </span>
                                                ) : (
                                                    <span
                                                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                                            isIncrease
                                                                ? "bg-red-50 text-red-700"
                                                                : isDecrease
                                                                  ? "bg-emerald-50 text-emerald-700"
                                                                  : "bg-gray-100 text-gray-600"
                                                        }`}
                                                    >
                                                        {isIncrease
                                                            ? "↑ "
                                                            : isDecrease
                                                              ? "↓ "
                                                              : ""}
                                                        {Number(
                                                            percentage
                                                        ).toFixed(2)}
                                                        %
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}

export default MomGrowth;