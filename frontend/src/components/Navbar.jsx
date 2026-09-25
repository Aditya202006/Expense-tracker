import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

function Navbar() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");

        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const token = localStorage.getItem("token");

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setUser(null);

        navigate("/login");
    };

    const navLinkClass = ({ isActive }) =>
        `text-sm font-medium transition ${
            isActive
                ? "text-blue-600"
                : "text-gray-600 hover:text-gray-900"
        }`;

    return (
        <nav className="border-b border-gray-200 bg-white">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">

                {/* Logo */}
                <Link
                    to="/"
                    className="text-lg font-bold text-gray-900"
                >
                    Expense Tracker
                </Link>

                {/* Navigation */}
                {token ? (
                    <div className="flex items-center gap-6">

                        <NavLink
                            to="/"
                            className={navLinkClass}
                        >
                            Dashboard
                        </NavLink>

                        <NavLink
                            to="/transactions"
                            className={navLinkClass}
                        >
                            Transactions
                        </NavLink>

                        <NavLink
                            to="/top-categories"
                            className={navLinkClass}
                        >
                            Top Categories
                        </NavLink>

                        <NavLink
                            to="/running-total"
                            className={navLinkClass}
                        >
                            Running Total
                        </NavLink>

                        <NavLink
                            to="/mom-growth"
                            className={navLinkClass}
                        >
                            MoM Growth
                        </NavLink>

                        <NavLink
                            to="/top-transactions"
                            className={navLinkClass}
                        >
                            Top Transactions
                        </NavLink>

                        {/* User + Logout */}
                        <div className="flex items-center gap-3 border-l border-gray-200 pl-6">
                            {user && (
                                <span className="text-sm font-medium text-gray-700">
                                    {user.name}
                                </span>
                            )}

                            <button
                                onClick={handleLogout}
                                className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-4">
                        <Link
                            to="/login"
                            className="text-sm font-medium text-gray-600 hover:text-gray-900"
                        >
                            Login
                        </Link>

                        <Link
                            to="/register"
                            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700"
                        >
                            Register
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
}

export default Navbar;