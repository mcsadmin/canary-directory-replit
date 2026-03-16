import { useState, useRef } from "react";
import { Link } from "wouter";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";
import { useGetCreditors, useIngestInvoices, IngestionSummary } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function UploadPage() {
  const [creditorId, setCreditorId] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [summary, setSummary] = useState<IngestionSummary | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: creditorsData, isLoading: isLoadingCreditors } = useGetCreditors();
  const ingestMutation = useIngestInvoices();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!creditorId || !file) return;

    ingestMutation.mutate({
      data: { creditor_id: creditorId, file: file }
    }, {
      onSuccess: (data) => {
        setSummary(data);
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    });
  };

  const closeSummary = () => {
    setSummary(null);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Upload Invoices</h1>
        <p className="text-muted-foreground mt-1">Ingest CSV invoice data to build and verify the local loop graph.</p>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle>Ingestion Configuration</CardTitle>
          <CardDescription>Select the source creditor and upload a valid CSV file.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">1. Select Creditor</label>
            <Select value={creditorId} onValueChange={setCreditorId} disabled={isLoadingCreditors || ingestMutation.isPending}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={isLoadingCreditors ? "Loading creditors..." : "Select a verified platform user"} />
              </SelectTrigger>
              <SelectContent>
                {creditorsData?.creditors.map((c) => (
                  <SelectItem key={c.node_id} value={c.node_id}>{c.canonical_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Only resolved platform users can ingest active invoices.</p>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">2. Select CSV File</label>
            <div 
              className={`border-2 border-dashed rounded-lg p-8 transition-colors text-center ${
                file ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 bg-muted/30'
              }`}
            >
              <input 
                type="file" 
                accept=".csv" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleFileChange}
                disabled={ingestMutation.isPending}
              />
              
              {!file ? (
                <div className="flex flex-col items-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <div className="w-12 h-12 rounded-full bg-background border border-border flex items-center justify-center mb-3 shadow-sm">
                    <Upload className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">Click to browse or drag file here</h3>
                  <p className="text-xs text-muted-foreground mt-1">Must be a standard CSV file with headers.</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <FileSpreadsheet className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">{file.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mt-4 text-xs h-7" 
                    onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                    disabled={ingestMutation.isPending}
                  >
                    Remove File
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 flex justify-end border-t border-border">
            <Button 
              onClick={handleUpload} 
              disabled={!creditorId || !file || ingestMutation.isPending}
              className="w-full sm:w-auto h-11 px-8"
            >
              {ingestMutation.isPending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Processing File...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Start Ingestion
                </>
              )}
            </Button>
          </div>

          {ingestMutation.isError && (
            <div className="p-4 rounded-md bg-destructive/10 border border-destructive/20 flex items-start">
              <AlertCircle className="w-5 h-5 text-destructive mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-destructive">Ingestion Failed</h4>
                <p className="text-xs text-destructive/80 mt-1">{ingestMutation.error?.message || "An unknown error occurred during processing."}</p>
              </div>
            </div>
          )}

        </CardContent>
      </Card>

      <Dialog open={!!summary} onOpenChange={(open) => !open && closeSummary()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
            <DialogTitle className="text-xl">Ingestion Complete</DialogTitle>
            <DialogDescription>
              File <span className="font-semibold text-foreground">{summary?.filename}</span> has been processed successfully.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="p-4 rounded-lg border border-border bg-muted/30">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Rows</p>
              <p className="text-2xl font-bold mt-1 text-foreground">{summary?.total_rows}</p>
            </div>
            <div className="p-4 rounded-lg border border-border bg-muted/30">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">New Invoices</p>
              <p className="text-2xl font-bold mt-1 text-foreground">{summary?.new_invoices}</p>
            </div>
            <div className="p-4 rounded-lg border border-border bg-muted/30">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">New Nodes</p>
              <p className="text-2xl font-bold mt-1 text-foreground">{summary?.new_nodes}</p>
            </div>
            <div className={`p-4 rounded-lg border ${summary?.new_review_items ? 'border-amber-200 bg-amber-50' : 'border-border bg-muted/30'}`}>
              <p className={`text-xs font-medium uppercase tracking-wider ${summary?.new_review_items ? 'text-amber-700' : 'text-muted-foreground'}`}>Review Items</p>
              <p className={`text-2xl font-bold mt-1 ${summary?.new_review_items ? 'text-amber-700' : 'text-foreground'}`}>{summary?.new_review_items}</p>
            </div>
            {summary?.pending_invoices ? (
              <div className="col-span-2 p-4 rounded-lg border border-blue-200 bg-blue-50">
                <p className="text-xs text-blue-700 font-medium uppercase tracking-wider">Pending Invoices</p>
                <p className="text-lg font-bold mt-1 text-blue-800">{summary.pending_invoices} held (Creditor Unresolved)</p>
              </div>
            ) : null}
          </div>

          <DialogFooter className="sm:justify-between mt-2">
            <Button variant="outline" onClick={closeSummary}>Dismiss</Button>
            {summary?.new_review_items ? (
              <Link href="/review-queue">
                <Button>Go to Review Queue</Button>
              </Link>
            ) : (
              <Link href="/">
                <Button>View Directory</Button>
              </Link>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
