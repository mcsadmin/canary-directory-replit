import { useState } from "react";
import { format } from "date-fns";
import { ArrowUpDown, Building, Search, SlidersHorizontal } from "lucide-react";
import { 
  useGetDirectory, 
  ParticipationStatus, 
  VerificationStatus, 
  GeographicalStatus,
  GetDirectorySortBy,
  GetDirectorySortOrder
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function DirectoryPage() {
  const [participation, setParticipation] = useState<ParticipationStatus | undefined>();
  const [verification, setVerification] = useState<VerificationStatus | undefined>();
  const [geography, setGeography] = useState<GeographicalStatus | undefined>();
  const [sortBy, setSortBy] = useState<GetDirectorySortBy>(GetDirectorySortBy.last_seen_date);
  const [sortOrder, setSortOrder] = useState<GetDirectorySortOrder>(GetDirectorySortOrder.desc);

  const { data, isLoading } = useGetDirectory({
    participation_status: participation,
    verification_status: verification,
    geographical_status: geography,
    sort_by: sortBy,
    sort_order: sortOrder
  });

  const handleSort = (field: GetDirectorySortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const getVerificationBadge = (status: VerificationStatus) => {
    switch (status) {
      case "resolved": return <Badge className="bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 border-emerald-200">Resolved</Badge>;
      case "unresolved": return <Badge className="bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 border-amber-200">Unresolved</Badge>;
    }
  };

  const getGeoBadge = (status: GeographicalStatus) => {
    switch (status) {
      case "local": return <Badge className="bg-blue-500/10 text-blue-700 border-blue-200">Local</Badge>;
      case "remote": return <Badge variant="outline" className="text-muted-foreground">Remote</Badge>;
      case "uncertain": return <Badge variant="secondary" className="text-slate-500">Uncertain</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Business Directory</h1>
        <p className="text-muted-foreground mt-1">Manage and verify the resolved entities in the local loop.</p>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader className="bg-muted/30 border-b border-border pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-lg flex items-center">
              <SlidersHorizontal className="w-5 h-5 mr-2 text-muted-foreground" />
              Filters
            </CardTitle>
            <div className="flex flex-wrap items-center gap-3">
              <Select value={participation || "all"} onValueChange={(v) => setParticipation(v === "all" ? undefined : v as ParticipationStatus)}>
                <SelectTrigger className="w-[160px] h-9 bg-background">
                  <SelectValue placeholder="Participation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Participation</SelectItem>
                  <SelectItem value="platform_user">Platform User</SelectItem>
                  <SelectItem value="third_party">Third Party</SelectItem>
                </SelectContent>
              </Select>

              <Select value={verification || "all"} onValueChange={(v) => setVerification(v === "all" ? undefined : v as VerificationStatus)}>
                <SelectTrigger className="w-[150px] h-9 bg-background">
                  <SelectValue placeholder="Verification" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Verification</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="unresolved">Unresolved</SelectItem>
                </SelectContent>
              </Select>

              <Select value={geography || "all"} onValueChange={(v) => setGeography(v === "all" ? undefined : v as GeographicalStatus)}>
                <SelectTrigger className="w-[140px] h-9 bg-background">
                  <SelectValue placeholder="Geography" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Geography</SelectItem>
                  <SelectItem value="local">Local</SelectItem>
                  <SelectItem value="remote">Remote</SelectItem>
                  <SelectItem value="uncertain">Uncertain</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-semibold cursor-pointer hover:bg-muted/80 transition-colors" onClick={() => handleSort("canonical_name")}>
                    <div className="flex items-center">
                      Canonical Name
                      {sortBy === "canonical_name" && <ArrowUpDown className="w-3 h-3 ml-1" />}
                    </div>
                  </th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Geography</th>
                  <th className="px-6 py-4 font-semibold">Company #</th>
                  <th className="px-6 py-4 font-semibold text-right cursor-pointer hover:bg-muted/80 transition-colors" onClick={() => handleSort("invoice_count")}>
                    <div className="flex items-center justify-end">
                      Invoices (Aliases)
                      {sortBy === "invoice_count" && <ArrowUpDown className="w-3 h-3 ml-1" />}
                    </div>
                  </th>
                  <th className="px-6 py-4 font-semibold cursor-pointer hover:bg-muted/80 transition-colors" onClick={() => handleSort("last_seen_date")}>
                    <div className="flex items-center">
                      Last Seen
                      {sortBy === "last_seen_date" && <ArrowUpDown className="w-3 h-3 ml-1" />}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
                        Loading directory...
                      </div>
                    </td>
                  </tr>
                ) : !data?.nodes?.length ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                      <Building className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      No businesses found matching filters.
                    </td>
                  </tr>
                ) : (
                  data.nodes.map((node) => (
                    <tr key={node.node_id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground">{node.canonical_name || <span className="text-muted-foreground italic">Unnamed Entity</span>}</div>
                        <div className="text-xs text-muted-foreground font-mono mt-0.5" title={node.node_id}>{node.node_id.split('-')[0]}...</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5 items-start">
                          {getVerificationBadge(node.verification_status)}
                          {node.participation_status === "platform_user" && (
                            <Badge variant="outline" className="text-[10px] uppercase px-1.5 bg-primary/5">Platform User</Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">{getGeoBadge(node.geographical_status)}</td>
                      <td className="px-6 py-4 font-mono text-xs">{node.company_number || '-'}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="font-medium">{node.invoice_count}</div>
                        <div className="text-xs text-muted-foreground">{node.invoice_alias_count} aliases</div>
                      </td>
                      <td className="px-6 py-4 text-xs whitespace-nowrap">
                        {node.last_seen_date ? format(new Date(node.last_seen_date), "MMM d, yyyy") : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
