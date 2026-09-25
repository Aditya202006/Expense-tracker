import { useEffect, useState } from "react";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip
} from "recharts";
import { apiFetch } from "../utils/api";

function RunningTotal({ refreshKey }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchRunningTotal = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await apiFetch("/api/running-total");

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(
                        result.error || "Failed to fetch running total"
                    );
                }

                setData(result);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRunningTotal();
    }, [refreshKey]);

    const chartData = data.map((item) => ({
        date: item.tran_date.slice(0, 10),
        runningTotal: Number(item.running_total)
    }));

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                    Running Total
                </h1>

                <p className="mt-1 text-gray-500">
                    Track how your cumulative spending changes over time.
                </p>
            </div>

            {loading && (
                <div className="rounded-xl bg-white p-10 text-center text-sm text-gray-500 shadow-sm ring-1 ring-gray-100">
                    Loading data...
                </div>
            )}

            {error && (
                <div className="rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600 ring-1 ring-red-100">
                    {error}
                </div>
            )}

            {!loading && !error && (
                <>
                    <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                        <div className="mb-5">
                            <h2 className="text-xl font-semibold text-gray-900">
                                Spending Trend
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Cumulative amount spent for each transaction date.
                            </p>
                        </div>

                        {chartData.length === 0 ? (
                            <div className="py-10 text-center text-sm text-gray-500">
                                No analytics data available.
                            </div>
                        ) : (
                            <div className="h-[360px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart
                                        data={chartData}
                                        margin={{
                                            top: 10,
                                            right: 20,
                                            left: 10,
                                            bottom: 10
                                        }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />

                                        <XAxis dataKey="date" />

                                        <YAxis />

                                        <Tooltip
                                            formatter={(value) => [
                                                `₹${Number(value).toFixed(2)}`,
                                                "Running Total"
                                            ]}
                                        />

                                        <Line
                                            type="monotone"
                                            dataKey="runningTotal"
                                            strokeWidth={2}
                                            dot={{ r: 3 }}
                                            activeDot={{ r: 5 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </section>

                    <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                        <div className="mb-5">
                            <h2 className="text-xl font-semibold text-gray-900">
                                Running Total Details
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Transaction-by-transaction cumulative spending.
                            </p>
                        </div>

                        {data.length === 0 ? (
                            <div className="py-10 text-center text-sm text-gray-500">
                                No transactions available.
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-lg border border-gray-200">
                                <table className="w-full min-w-[650px]">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                ID
                                            </th>

                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Date
                                            </th>

                                            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Amount
                                            </th>

                                            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Running Total
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {data.map((item) => (
                                            <tr
                                                key={item.tran_id}
                                                className="border-t border-gray-100 transition hover:bg-gray-50"
                                            >
                                                <td className="px-4 py-4 text-sm font-medium text-gray-900">
                                                    {item.tran_id}
                                                </td>

                                                <td className="px-4 py-4 text-sm text-gray-700">
                                                    {item.tran_date.slice(0, 10)}
                                                </td>

                                                <td className="px-4 py-4 text-right text-sm text-gray-700">
                                                    ₹
                                                    {Number(
                                                        item.amount
                                                    ).toFixed(2)}
                                                </td>

                                                <td className="px-4 py-4 text-right text-sm font-semibold text-gray-900">
                                                    ₹
                                                    {Number(
                                                        item.running_total
                                                    ).toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </>
            )}
        </div>
    );
}

export default RunningTotal;