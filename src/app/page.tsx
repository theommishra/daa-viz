import SortingVisualizer from '@/components/SortingVisualizer';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-4 selection:bg-purple-500/30">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/20 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-7xl relative z-10">
        <SortingVisualizer />
      </div>
    </main>
  );
}
