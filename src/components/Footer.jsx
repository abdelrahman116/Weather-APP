export default function Footer() {
  return (
    <footer className="w-full text-center text-gray-400 text-sm mt-8 py-4 border-t border-gray-700 bg-[#1B1B1D]">
      <div className="max-w-5xl mx-auto px-4  sm:flex-row items-center">
        <p className="text-xs sm:text-sm">
          © {new Date().getFullYear()} Abdelrahman Dawoud. Built with ❤️ using
          React & Tailwind.
        </p>
      </div>
    </footer>
  );
}
