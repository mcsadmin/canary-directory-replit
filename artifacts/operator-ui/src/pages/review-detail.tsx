import { useRoute, useLocation } from "wouter";
import { format } from "date-fns";
import { 
  useGetReviewQueueItem, 
  useAcceptReviewItem, 
  useRejectReviewItem, 
  useSkipReviewItem,
  BusinessNode
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle2, XCircle, SkipForward, ArrowRight, Building, FileText, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ReviewDetailPage() {
  const [, params] = useRoute("/review-queue/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const id = params?.id || "";

  const { data: item, isLoading } = useGetReviewQueueItem(id);
  
  const acceptMut = useAcceptReviewItem();
  const rejectMut = useRejectReviewItem();
  const skipMut = useSkipReviewItem();

  const handleAction = (action: 'accept' | 'reject' | 'skip') => {
    const mutation = action === 'accept' ? acceptMut : action === 'reject' ? rejectMut : skipMut;
    
    mutation.mutate({ reviewId: id }, {
      onSuccess: (res) => {
        toast({
          title: `Review ${action}ed`,
          description: res.message,
        });
        setLocation("/review-queue");
      },
      onError: (err) => {
        toast({
          title: "Action Failed",
          description: err.message || "An unknown error occurred.",
          variant: "destructive"
        });
      }
    });
  };

  const isPending = acceptMut.isPending || rejectMut.isPending || skipMut.isPending;

  if (isLoading) {
    return <div className="p-12 text-center text-muted-foreground animate-pulse">Loading review details...</div>;
  }

  if (!item) {
    return <div className="p-12 text-center text-destructive">Review item not found.</div>;
  }

  const NodeCard = ({ node, title, highlight }: { node: BusinessNode, title: string, highlight?: boolean }) => (
    <Card className={`h-full ${highlight ? 'border-primary ring-1 ring-primary/20 shadow-md' : 'border-border'}`}>
      <CardHeader className="bg-muted/30 border-b border-border py-4">
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{title}</CardTitle>
        <div className="mt-2 text-xl font-bold text-foreground break-words">{node.canonical_name || "Unnamed"}</div>
        <div className="flex gap-2 mt-2">
          <Badge variant="outline" className="font-mono text-[10px]">{node.node_id.split('-')[0]}</Badge>
          <Badge variant="secondary" className="text-xs">{node.participation_status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <dl className="divide-y divide-border text-sm">
          <div className="p-4 grid grid-cols-3 gap-4">
            <dt className="text-muted-foreground font-medium flex items-center col-span-1">
              <Building className="w-4 h-4 mr-2" /> Company No.
            </dt>
            <dd className="col-span-2 font-mono font-medium text-foreground">{node.company_number || <span className="text-muted-foreground/50">None</span>}</dd>
          </div>
          <div className="p-4 grid grid-cols-3 gap-4">
            <dt className="text-muted-foreground font-medium flex items-center col-span-1">
              <MapPin className="w-4 h-4 mr-2" /> Geography
            </dt>
            <dd className="col-span-2 capitalize text-foreground">{node.geographical_status}</dd>
          </div>
          <div className="p-4 grid grid-cols-3 gap-4 bg-muted/10">
            <dt className="text-muted-foreground font-medium col-span-1">Verification</dt>
            <dd className="col-span-2 capitalize text-foreground">{node.verification_status}</dd>
          </div>
          <div className="p-4 grid grid-cols-3 gap-4">
            <dt className="text-muted-foreground font-medium col-span-1">Created</dt>
            <dd className="col-span-2 text-foreground">{format(new Date(node.created_at), "PPpp")}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-24">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/review-queue")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <div className="flex items-center gap-3">
            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-none uppercase tracking-wider text-[10px] font-bold">
              {item.review_type.replace('_', ' ')}
            </Badge>
            <span className="text-sm text-muted-foreground font-mono">ID: {item.review_id.split('-')[0]}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground mt-1">Review Proposed Action</h1>
        </div>
      </div>

      <div className="grid md:grid-cols-[1fr_auto_1fr] gap-6 items-stretch">
        {/* Left Side: New Node */}
        <div className="flex-1">
          <NodeCard node={item.new_node} title="Newly Extracted Node" highlight={true} />
        </div>

        {/* Center: Indicator */}
        <div className="hidden md:flex flex-col items-center justify-center px-4">
          <div className="h-full w-px bg-border my-4"></div>
          <div className="bg-background border-2 border-border rounded-full p-3 shadow-sm z-10 flex flex-col items-center justify-center">
            {item.confidence_score !== null && (
              <span className="text-xs font-bold text-primary mb-1">{item.confidence_score}%</span>
            )}
            <ArrowRight className="w-6 h-6 text-muted-foreground" />
          </div>
          <div className="h-full w-px bg-border my-4"></div>
        </div>

        {/* Right Side: Candidate Node */}
        <div className="flex-1">
          {item.candidate_node ? (
            <NodeCard node={item.candidate_node} title="Existing Target Node" />
          ) : (
            <Card className="h-full border-dashed flex items-center justify-center p-8 bg-muted/20">
              <div className="text-center text-muted-foreground">
                <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No candidate node specified.</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Raw Data Context */}
      {item.raw_debtor_details && (
        <Card className="border-border">
          <CardHeader className="py-4 bg-muted/30">
            <CardTitle className="text-sm flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              Source Invoice Data
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <pre className="p-4 bg-slate-950 text-slate-50 text-sm overflow-x-auto rounded-b-lg font-mono">
              {JSON.stringify(item.raw_debtor_details, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/80 backdrop-blur-md p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="text-sm text-muted-foreground hidden sm:block">
            Take action to resolve this queue item.
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button 
              variant="outline" 
              onClick={() => handleAction('skip')}
              disabled={isPending}
              className="flex-1 sm:flex-none hover:bg-slate-100"
            >
              <SkipForward className="w-4 h-4 mr-2" /> Skip for Now
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => handleAction('reject')}
              disabled={isPending}
              className="flex-1 sm:flex-none shadow-md shadow-destructive/20"
            >
              <XCircle className="w-4 h-4 mr-2" /> Reject Match
            </Button>
            <Button 
              onClick={() => handleAction('accept')}
              disabled={isPending || !item.candidate_node}
              className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 text-white"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" /> Accept & Merge
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
