import { NavLink } from "react-router-dom";

export default function ResponsiveNavLink({ to, className = "", children, ...props }) {
  return (
    <NavLink
      to={to}
      {...props}
      className={({ isActive }) =>
        `flex w-full items-start border-l-4 py-2 pe-4 ps-3 text-base font-medium transition duration-150 ease-in-out focus:outline-none ${
          isActive
            ? "border-indigo-400 bg-indigo-50 text-indigo-700 focus:border-indigo-700 focus:bg-indigo-100 focus:text-indigo-800"
            : "border-transparent text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800 focus:border-gray-300 focus:bg-gray-50 focus:text-gray-800"
        } ${className}`
      }
    >
      {children}
    </NavLink>
  );
}
