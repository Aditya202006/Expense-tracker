import { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";

function TransactionList({
    refreshKey,
    onTransactionChanged,
    limit,
    title = "Transactions"
}) {
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);

    const [editingId, setEditingId] = useState(null);

    const [editForm, setEditForm] = useState({
        cat_id: "",
        amount: "",
        tran_date: ""
    });

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const fetchTransactions = async () => {
        try {
            const response = await apiFetch("/api/transactions");
            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Failed to fetch transactions"
                );
            }

            setTransactions(limit ? data.slice(0, limit) : data);
        } catch (error) {
            setError(error.message);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await apiFetch("/api/categories");
            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Failed to fetch categories"
                );
            }

            setCategories(data);
        } catch (error) {
            setError(error.message);
        }
    };

    useEffect(() => {
        fetchTransactions();
        fetchCategories();
    }, [refreshKey]);

    const handleEditClick = (transaction) => {
        setEditingId(transaction.tran_id);

        setEditForm({
            cat_id: String(transaction.cat_id),
            amount: String(transaction.amount),
            tran_date: transaction.tran_date.slice(0, 10)
        });

        setMessage("");
        setError("");
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;

        setEditForm((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCancelEdit = () => {
        setEditingId(null);

        setEditForm({
            cat_id: "",
            amount: "",
            tran_date: ""
        });
    };

    const handleUpdate = async (id) => {
        try {
            setMessage("");
            setError("");

            const response = await apiFetch(
                `/api/transactions/${id}`,
                {
                    method: "PUT",
                    body: JSON.stringify({
                        cat_id: Number(editForm.cat_id),
                        amount: Number(editForm.amount),
                        tran_date: editForm.tran_date
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Failed to update transaction"
                );
            }

            setMessage("Transaction updated successfully!");

            setEditingId(null);

            await fetchTransactions();

            if (onTransactionChanged) {
                onTransactionChanged();
            }
        } catch (error) {
            setError(error.message);
        }
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this transaction?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setMessage("");
            setError("");

            const response = await apiFetch(
                `/api/transactions/${id}`,
                {
                    method: "DELETE"
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Failed to delete transaction"
                );
            }

            setMessage("Transaction deleted successfully!");

            await fetchTransactions();

            if (onTransactionChanged) {
                onTransactionChanged();
            }
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <div className="mb-5">
                <h2 className="text-xl font-semibold text-gray-900">
                    {title}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                    View and manage your expense records.
                </p>
            </div>

            {message && (
                <p className="mb-4 text-green-600">
                    {message}
                </p>
            )}

            {error && (
                <p className="mb-4 text-red-600">
                    {error}
                </p>
            )}

            <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full min-w-[760px] border-collapse">
                    <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                ID
                            </th>

                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Category
                            </th>

                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Amount
                            </th>

                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Date
                            </th>

                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Actions
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {transactions.map((transaction) => (
                            <tr
                                key={transaction.tran_id}
                                className="border-b border-gray-100 transition hover:bg-gray-50"
                            >
                                <td className="px-4 py-3 text-sm text-gray-700">
                                    {transaction.tran_id}
                                </td>

                                {editingId === transaction.tran_id ? (
                                    <>
                                        <td className="px-4 py-3 text-sm text-gray-700">
                                            <select
                                                name="cat_id"
                                                value={editForm.cat_id}
                                                onChange={handleEditChange}
                                                className="rounded-lg border border-gray-300 bg-white p-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                            >
                                                {categories.map(
                                                    (category) => (
                                                        <option
                                                            key={
                                                                category.cat_id
                                                            }
                                                            value={
                                                                category.cat_id
                                                            }
                                                        >
                                                            {
                                                                category.cat_name
                                                            }
                                                        </option>
                                                    )
                                                )}
                                            </select>
                                        </td>

                                        <td className="px-4 py-3 text-sm text-gray-700">
                                            <input
                                                type="number"
                                                name="amount"
                                                value={editForm.amount}
                                                onChange={handleEditChange}
                                                min="0.01"
                                                step="0.01"
                                                className="w-28 rounded-lg border border-gray-300 p-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                            />
                                        </td>

                                        <td className="px-4 py-3 text-sm text-gray-700">
                                            <input
                                                type="date"
                                                name="tran_date"
                                                value={editForm.tran_date}
                                                onChange={handleEditChange}
                                                className="rounded-lg border border-gray-300 bg-white p-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                            />
                                        </td>

                                        <td className="px-4 py-3 text-sm text-gray-700">
                                            <button
                                                onClick={() =>
                                                    handleUpdate(
                                                        transaction.tran_id
                                                    )
                                                }
                                                className="mr-2 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-blue-700"
                                            >
                                                Save
                                            </button>

                                            <button
                                                onClick={handleCancelEdit}
                                                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                                            >
                                                Cancel
                                            </button>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td className="px-4 py-3 text-sm text-gray-700">
                                            {transaction.cat_name}
                                        </td>

                                        <td className="px-4 py-3 text-sm text-gray-700">
                                            <span className="font-medium text-gray-900">
                                                ₹
                                                {Number(
                                                    transaction.amount
                                                ).toFixed(2)}
                                            </span>
                                        </td>

                                        <td className="px-4 py-3 text-sm text-gray-700">
                                            {transaction.tran_date.slice(0, 10)}
                                        </td>

                                        <td className="px-4 py-3 text-sm text-gray-700">
                                            <button
                                                onClick={() =>
                                                    handleEditClick(
                                                        transaction
                                                    )
                                                }
                                                className="mr-2 rounded-lg bg-amber-500 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-amber-600"
                                            >
                                                Edit
                                            </button>

                                            <button
                                                onClick={() =>
                                                    handleDelete(
                                                        transaction.tran_id
                                                    )
                                                }
                                                className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-red-700"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

export default TransactionList;