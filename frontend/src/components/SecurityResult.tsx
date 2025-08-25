import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { AlertTriangle, CheckCircle, XCircle, Info, Share2 } from "lucide-react";

interface SecurityResultProps {
  type: "url" | "email" | "phone";
  input: string;
  isSafe: boolean;
  riskLevel: "low" | "medium" | "high";
  threats: string[];
  explanation: string;
  onNewScan: () => void;
}

export function SecurityResult({
  type,
  input,
  isSafe,
  riskLevel,
  threats,
  explanation,
  onNewScan
}: SecurityResultProps) {
  const getRiskBadgeVariant = () => {
    if (isSafe) return "default" as const;
    switch (riskLevel) {
      case "low": return "secondary" as const;
      case "medium": return "destructive" as const;
      case "high": return "destructive" as const;
      default: return "secondary" as const;
    }
  };

  const getStatusIcon = () => {
    if (isSafe) return <CheckCircle className="h-6 w-6 text-green-500" />;
    return <XCircle className="h-6 w-6 text-red-500" />;
  };

  const getTypeLabel = () => {
    switch (type) {
      case "url": return "Website";
      case "email": return "Email Address";
      case "phone": return "Phone Number";
      default: return "Input";
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="border-2">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-2">
            {getStatusIcon()}
            <CardTitle className="text-2xl">
              {isSafe ? "Safe" : "Threat Detected"}
            </CardTitle>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <Badge variant={getRiskBadgeVariant()}>
              {isSafe ? "Secure" : `${riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} Risk`}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">{getTypeLabel()}</div>
            <div className="font-mono text-sm break-all">{input}</div>
          </div>

          {!isSafe && threats.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span>Detected Threats</span>
              </h4>
              <ul className="space-y-1">
                {threats.map((threat, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                    <span>{threat}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-2">
            <h4 className="font-semibold flex items-center space-x-2">
              <Info className="h-4 w-4 text-blue-500" />
              <span>Analysis Explanation</span>
            </h4>
            <CardDescription className="text-sm text-muted-foreground">{explanation}</CardDescription>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button onClick={onNewScan} className="flex-1">
          Scan Another Item
        </Button>
        <Button variant="outline" className="flex-1">
          <Share2 className="mr-2 h-4 w-4" />
          Share Result
        </Button>
      </div>

      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-blue-500 mt-0.5" />
            <div className="space-y-1">
              <h5 className="font-medium">Security Tip</h5>
              <p className="text-sm text-muted-foreground">
                {isSafe 
                  ? "This item appears safe, but always stay vigilant online. Threats can evolve quickly."
                  : "Avoid interacting with this item. If you've already engaged, consider changing passwords and monitoring accounts."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


