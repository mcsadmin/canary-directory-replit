import { Link } from "wouter";
import { format } from "date-fns";
import { useGetReviewQueue, ReviewType } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GitMerge, AlertTriangle, UserCog, ArrowRight, Inbox } from "lucide-react";

export default function ReviewQueuePage() {
  const { data, isLoading } = useGetReviewQueue();

  const getReviewIcon = (type: ReviewType) => {
    switch (type) {
      case "proposed_match": return <GitMerge className="w-5 h-5 text-blue-500" />;
      case "data_conflict": return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case "contact_classification": return <UserCog className="w-5 h-5 text-purple-500" />;
    }
  };

  const getReviewLabel = (type: ReviewType) => {
    switch (type) {
      case "proposed_match": return "Proposed Match";
      case "data_conflict": return "Data Conflict";
      case "contact_classification": return "Contact Classification";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
            Review Queue
            {data?.pending_count ? (
              <Badge className="ml-3 bg-primary text-primary-foreground text-sm px-2 py-0.5 rounded-full">
                {data.pending_count}
              </Badge>
            ) : null}
          </h1>
          <p className="text-muted-foreground mt-1">Process ambiguous entity resolutions and data conflicts.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          Loading queue...
        </div>
      ) : !data?.items.length ? (
        <Card className="border-dashed border-2 bg-transparent shadow-none">
          <CardContent className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Inbox className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Queue is empty</h3>
            <p className="text-muted-foreground mt-1 max-w-sm">
              There are currently no pending items requiring operator review. All automated resolutions were high confidence.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {data.items.map((item) => (
            <Link key={item.review_id} href={`/review-queue/${item.review_id}`}>
              <Card className="hover:shadow-md transition-all duration-200 cursor-pointer border-border group">
                <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  
                  <div className="flex items-start gap-4">
                    <div className="mt-1 p-2 rounded-md bg-muted/50 border border-border">
                      {getReviewIcon(item.review_type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-semibold">
                          {getReviewLabel(item.review_type)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(item.created_at), "MMM d, HH:mm")}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3 mt-2">
                        <span className="font-semibold text-foreground">{item.new_node_canonical_name}</span>
                        {item.candidate_node_canonical_name && (
                          <>
                            <ArrowRight className="w-4 h-4 text-muted-foreground" />
                            <span className="font-semibold text-foreground">{item.candidate_node_canonical_name}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center w-full sm:w-auto justify-between sm:justify-end gap-6 border-t sm:border-t-0 border-border pt-3 sm:pt-0">
                    {item.confidence_score !== null && item.confidence_score !== undefined && (
                      <div className="text-right">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground">Confidence</p>
                        <p className="text-lg font-mono font-bold text-primary">{item.confidence_score}%</p>
                      </div>
                    )}
                    <div className="bg-primary/5 text-primary group-hover:bg-primary group-hover:text-primary-foreground px-4 py-2 rounded-md text-sm font-medium transition-colors">
                      Review
                    </div>
                  </div>

                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
