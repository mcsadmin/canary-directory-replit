import { format } from "date-fns";
import { Activity, Database, GitMerge, FileText, UserPlus, AlertCircle } from "lucide-react";
import { useGetActivityFeed, AuditEvent } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ActivityPage() {
  const { data, isLoading } = useGetActivityFeed({ limit: 100 });

  const getEventStyle = (type: string) => {
    switch (type) {
      case "NODE_CREATED": return { icon: <Database className="w-4 h-4 text-emerald-600" />, bg: "bg-emerald-100", border: "border-emerald-200" };
      case "NODE_MERGED": return { icon: <GitMerge className="w-4 h-4 text-blue-600" />, bg: "bg-blue-100", border: "border-blue-200" };
      case "INVOICE_INGESTED": return { icon: <FileText className="w-4 h-4 text-indigo-600" />, bg: "bg-indigo-100", border: "border-indigo-200" };
      case "CREDITOR_REGISTERED": return { icon: <UserPlus className="w-4 h-4 text-purple-600" />, bg: "bg-purple-100", border: "border-purple-200" };
      case "REVIEW_REJECTED": return { icon: <AlertCircle className="w-4 h-4 text-amber-600" />, bg: "bg-amber-100", border: "border-amber-200" };
      default: return { icon: <Activity className="w-4 h-4 text-slate-600" />, bg: "bg-slate-100", border: "border-slate-200" };
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Audit Trail</h1>
        <p className="text-muted-foreground mt-1">Chronological record of system operations and operator decisions.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : !data?.events.length ? (
        <Card className="border-dashed bg-transparent">
          <CardContent className="flex flex-col items-center py-16 text-muted-foreground">
            <Activity className="w-12 h-12 mb-4 opacity-20" />
            <p>No activity recorded yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="relative border-l-2 border-border ml-4 pl-6 space-y-6">
          {data.events.map((event: AuditEvent) => {
            const style = getEventStyle(event.event_type);
            return (
              <div key={event.event_id} className="relative">
                {/* Timeline Dot */}
                <div className={`absolute -left-[35px] mt-1.5 w-6 h-6 rounded-full border flex items-center justify-center shadow-sm z-10 ${style.bg} ${style.border}`}>
                  {style.icon}
                </div>
                
                <Card className="border-border shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                      <div>
                        <Badge variant="outline" className="font-mono text-[10px] mb-2 border-primary/20 text-primary">
                          {event.event_type}
                        </Badge>
                        <h3 className="text-sm font-semibold text-foreground">
                          {event.entity_type === 'business_node' && "Node updated"}
                          {event.entity_type === 'invoice' && "Invoice processed"}
                          {event.entity_type === 'review_item' && "Operator decision recorded"}
                          {!event.entity_type && "System event"}
                        </h3>
                      </div>
                      <time className="text-xs font-mono text-muted-foreground whitespace-nowrap">
                        {format(new Date(event.created_at), "MMM d, yyyy HH:mm:ss")}
                      </time>
                    </div>
                    
                    <div className="bg-slate-50 border border-slate-100 rounded-md p-3 font-mono text-xs overflow-x-auto text-slate-700">
                      {event.payload ? JSON.stringify(event.payload, null, 2) : "No payload details available."}
                    </div>

                    <div className="mt-3 flex gap-4 text-[10px] text-muted-foreground font-mono uppercase tracking-wider">
                      {event.entity_id && <span>Entity ID: {event.entity_id.split('-')[0]}</span>}
                      {event.operator_id && <span className="text-primary font-semibold">Operator: {event.operator_id.split('-')[0]}</span>}
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
