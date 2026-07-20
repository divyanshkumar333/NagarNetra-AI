export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-6rem)] w-full">
      <div className="relative w-24 h-24 mb-8">
        {/* Core eye / loader */}
        <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin" />
        <div className="absolute inset-2 rounded-full border-r-2 border-blue-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
        <div className="absolute inset-4 rounded-full border-b-2 border-teal-500 animate-spin" style={{ animationDuration: '2s' }} />
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
        </div>
      </div>
      
      <h2 className="text-xl font-semibold tracking-widest uppercase text-foreground mb-2">
        NagarNetra AI
      </h2>
      <p className="text-sm text-muted-foreground font-mono tracking-widest uppercase animate-pulse">
        Initializing Command Center...
      </p>
    </div>
  );
}
