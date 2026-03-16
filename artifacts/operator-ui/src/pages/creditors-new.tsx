import { useState } from "react";
import { useLocation } from "wouter";
import { Building2, PlusCircle, CheckCircle2 } from "lucide-react";
import { useRegisterCreditor } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function CreditorsNewPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [name, setName] = useState("");
  
  const mutation = useRegisterCreditor();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    mutation.mutate({ data: { canonical_name: name.trim() } }, {
      onSuccess: (data) => {
        toast({
          title: "Creditor Registered",
          description: `${data.canonical_name} is now a resolved platform user.`,
        });
        setLocation("/");
      },
      onError: (err) => {
        toast({
          title: "Registration Failed",
          description: err.message || "Failed to create creditor.",
          variant: "destructive"
        });
      }
    });
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 pt-10">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
          <UserPlusIcon className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Register Platform User</h1>
        <p className="text-muted-foreground mt-2">
          Create a trusted, resolved creditor entity capable of ingesting active invoices into the graph.
        </p>
      </div>

      <Card className="border-border shadow-lg shadow-black/5">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Creditor Details</CardTitle>
            <CardDescription>Enter the official legal or trading name of the business.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground font-semibold">Canonical Name</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input 
                  id="name" 
                  placeholder="e.g. Acme Corporation Ltd" 
                  className="pl-10 h-12 text-base transition-all focus:ring-2 focus:ring-primary/20"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={mutation.isPending}
                  autoFocus
                />
              </div>
              <p className="text-xs text-muted-foreground">This exact name will be used as the internal system identifier.</p>
            </div>
            
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mt-6 flex items-start">
              <CheckCircle2 className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-800">
                Registering a business here automatically grants it <span className="font-bold">platform_user</span> status and bypasses verification, marking it as <span className="font-bold">resolved</span>.
              </p>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/30 border-t border-border py-4 px-6 flex justify-end gap-3">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => setLocation("/")}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!name.trim() || mutation.isPending}
              className="px-8 shadow-md"
            >
              {mutation.isPending ? "Creating..." : (
                <>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Create Creditor
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

// Quick fallback icon since UserPlus wasn't imported at top to avoid conflict
function UserPlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <line x1="19" y1="8" x2="19" y2="14"/>
      <line x1="22" y1="11" x2="16" y2="11"/>
    </svg>
  );
}
