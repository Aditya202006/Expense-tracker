import { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";

function AddExpense({ onTransactionAdded }) {
    const [categories, setCategories] = useState([]);

    const [formData, setFormData] = useState({
        cat_id: "",
        amount: "",
        tran_date: ""
    });

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await apiFetch("/api/categories");

                if (!response.ok) {
                    throw new Error("Failed to fetch categories");
                }

                const data = await response.json();
                setCategories(data);
            } catch (error) {
                console.error(error);
                setError("Failed to load categories");
            }
        };

        fetchCategories();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));

        setMessage("");
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        if (!formData.cat_id || !formData.amount || !formData.tran_date) {
            setError("Please fill all fields.");
            return;
        }

        if (Number(formData.amount) <= 0) {
            setError("Amount must be greater than 0.");
            return;
        }

        try {
            setIsLoading(true);

            const response = await apiFetch("/api/transactions", {
                method: "POST",
                body: JSON.stringify({
                    cat_id: Number(formData.cat_id),
                    amount: Number(formData.amount),
                    tran_date: formData.tran_date
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to add transaction");
            }

            setMessage("Transaction added successfully.");

            setFormData({
                cat_id: "",
                amount: "",
                tran_date: ""
            });

            if (onTransactionAdded) {
                onTransactionAdded();
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <div className="mb-5">
                <h2 className="text-lg font-semibold text-gray-900">
                    Add Expense
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                    Add a new transaction to your account.
                </p>
            </div>

            {message && (
                <div className="mb-5 rounded-lg bg-green-50 px-4 py-3 text-sm font-medium text-green-600">
                    {message}
                </div>
            )}

            {error && (
                <div className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                    {error}
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 gap-4 md:grid-cols-3"
            >
                <div>
                    <label
                        htmlFor="cat_id"
                        className="mb-2 block text-sm font-medium text-gray-700"
                    >
                        Category
                    </label>

                    <select
                        id="cat_id"
                        name="cat_id"
                        value={formData.cat_id}
                        onChange={handleChange}
                        required
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                        <option value="">
                            Select category
                        </option>

                        {categories.map((category) => (
                            <option
                                key={category.cat_id}
                                value={category.cat_id}
                            >
                                {category.cat_name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label
                        htmlFor="amount"
                        className="mb-2 block text-sm font-medium text-gray-700"
                    >
                        Amount
                    </label>

                    <input
                        id="amount"
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        placeholder="Enter amount"
                        min="0.01"
                        step="0.01"
                        required
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                </div>

                <div>
                    <label
                        htmlFor="tran_date"
                        className="mb-2 block text-sm font-medium text-gray-700"
                    >
                        Date
                    </label>

                    <input
                        id="tran_date"
                        type="date"
                        name="tran_date"
                        value={formData.tran_date}
                        onChange={handleChange}
                        required
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                </div>

                <div className="md:col-span-3">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isLoading ? "Adding..." : "Add Expense"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default AddExpense;