import { Link, useLocation } from "wouter";
import { 
  Building2, 
  UploadCloud, 
  ListChecks, 
  UserPlus, 
  Activity,
  Box
} from "lucide-react";
import { useGetReviewQueue } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";

const navigation = [
  { name: "Directory", href: "/", icon: Building2 },
  { name: "Upload Invoices", href: "/upload", icon: UploadCloud },
  { name: "Review Queue", href: "/review-queue", icon: ListChecks },
  { name: "Register Creditor", href: "/creditors/new", icon: UserPlus },
  { name: "Activity Feed", href: "/activity", icon: Activity },
];

export function Sidebar({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { data: queueData } = useGetReviewQueue();
  const pendingCount = queueData?.pending_count || 0;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-border bg-card flex flex-col shadow-sm z-10">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Box className="w-6 h-6 text-primary mr-3" />
          <span className="font-bold text-lg tracking-tight text-foreground">Local Loop Canary</span>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2">
            Operator Tools
          </div>
          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
              
              return (
                <Link key={item.name} href={item.href} className={`
                  flex items-center justify-between px-3 py-2.5 rounded-md transition-all duration-200 group
                  ${isActive 
                    ? "bg-primary/10 text-primary font-medium" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }
                `}>
                  <div className="flex items-center">
                    <item.icon className={`w-5 h-5 mr-3 ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground transition-colors"}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.name === "Review Queue" && pendingCount > 0 && (
                    <Badge variant={isActive ? "default" : "secondary"} className="ml-auto text-xs px-1.5 py-0">
                      {pendingCount}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="p-4 border-t border-border">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
              OP
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-foreground">System Operator</p>
              <p className="text-xs text-muted-foreground">Admin Session</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background/50">
        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
