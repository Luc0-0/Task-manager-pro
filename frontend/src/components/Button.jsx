const base = "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed";

const variants = {
  primary: "bg-blue-600 hover:bg-blue-700 text-white",
  secondary: "bg-gray-900 hover:bg-black text-white dark:bg-gray-700 dark:hover:bg-gray-600",
  outline: "border border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 text-gray-900 dark:text-white",
  ghost: "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700",
  danger: "bg-red-600 hover:bg-red-700 text-white",
};

const sizes = {
  sm: "px-3 py-1.5",
  md: "px-4 py-2",
  lg: "px-5 py-2.5",
};

const Button = ({ variant = 'primary', size = 'md', className = '', ...props }) => {
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props} />
  );
};

export default Button;


