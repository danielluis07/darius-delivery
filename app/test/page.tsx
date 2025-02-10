export default function TestPage() {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-900">
      <div className="relative h-[600px] w-[450px] overflow-hidden rounded-[40px] border-[12px] border-gray-800 bg-black shadow-2xl">
        {/* Top notch */}
        <div className="absolute left-1/2 top-0 h-6 w-24 -translate-x-1/2 rounded-b-lg bg-gray-800"></div>

        {/* Scrollable content */}
        <div className="h-full overflow-y-auto px-4 pb-4 pt-7 text-white no-scrollbar">
          <p className="mb-4 text-center text-lg font-semibold">
            Phone Content
          </p>
          {[...Array(20)].map((_, i) => (
            <p key={i} className="mb-2 text-sm">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
