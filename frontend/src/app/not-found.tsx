import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-6rem)] w-full text-center px-4">
      <div className="p-4 bg-red-500/10 rounded-full mb-6 border border-red-500/20">
        <ShieldAlert className="w-12 h-12 text-red-500" />
      </div>
      
      <h1 className="text-4xl font-bold tracking-tight mb-2">404 - Node Offline</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        The requested command center module could not be located. It may be offline, restricted, or actively undergoing maintenance.
      </p>
      
      <Link 
        href="/"
        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 gap-2"
      >
        <ArrowLeft className="w-4 h-4" /> Return to Command Dashboard
      </Link>
    </div>
  );
}
