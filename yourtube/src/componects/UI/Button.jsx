import clsx from "clsx";

function Button({ children, variant = "primary", size = "md", more = "", ...props }) {
    const base = "rounded-lg font-medium transition-colors";

    const variants = {
        default:
            "bg-gray-900 text-primary-foreground shadow-xs hover:bg-primary/90 text-white",
        primary: "bg-blue-600 text-white hover:bg-blue-700",
        secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300",
        danger: "bg-red-600 text-white hover:bg-red-700",
    };

    const sizes = {
        sm: "px-2 py-1 text-sm",
        md: "px-4 py-2 text-base",
        lg: "px-6 py-3 text-lg",
    };

    return (
        <button className={clsx(base, variants[variant], sizes[size], more)} {...props}>
            {children}
        </button>
    );
}


export default Button;