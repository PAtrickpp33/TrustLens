import { Button } from "antd";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Shield, Globe, Mail, Phone, Search, Info } from "lucide-react";
import { useState, useCallback, useMemo } from "react";
import RiskCard from "./riskCard";
import { checkUrl, checkEmail, checkMobile } from "@/lib/api";
import type { UrlRiskData, EmailRiskData, MobileRiskData } from "@/lib/api";
import { parseAuPhone } from "@/lib/phone";

type Tab = "url" | "email" | "mobile"

export function Hero() {
  // const [inputValue, setInputValue] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("url");

  // inputs
  const [urlInput, setUrlInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [mobileInput, setMobileInput] = useState("");

  // status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // results
  const [urlRes, setUrlRes] = useState<UrlRiskData | null>(null);
  const [emailRes, setEmailRes] = useState<EmailRiskData | null>(null);
  const [mobileRes, setMobileRes] = useState<MobileRiskData | null>(null);

  const canSubmit = useMemo(() => {
    if (activeTab === "url") return !!urlInput.trim();
    if (activeTab === "email") return !!emailInput.trim();
    if (activeTab === "mobile") return !!mobileInput.trim();
  }, [activeTab, urlInput, emailInput, mobileInput]);

  const handleCheck = useCallback(async () => {
    setError(null);
    setLoading(true);

    try {
      if (activeTab === "url") {
        setEmailRes(null); setMobileRes(null);
        const data = await checkUrl(urlInput.trim());
        setUrlRes(data);
      } else if (activeTab === "email") {
        setUrlRes(null); setMobileRes(null);
        const data = await checkEmail(emailInput.trim());
        setEmailRes(data);
      } else {
        setUrlRes(null); setEmailRes(null);
        const parsed = parseAuPhone(mobileInput);
        if (!parsed) throw new Error("Due to the limited functionality of the prototype, please only enter an AU number like (+61)412345678, +61412345678, or 61412345678");
        const data = await checkMobile({
          e164: parsed.e164,
          country_code: parsed.country_code,
          national_number: parsed.national_number,
        });
        setMobileRes(data);
      }
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [activeTab, urlInput, emailInput, mobileInput]);

  const onEnter = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && canSubmit && !loading) handleCheck();
    },
    [canSubmit, loading, handleCheck]
  );

  return (
    <section id="home" className="py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-6 mb-16">
          <div className="inline-flex items-center space-x-2 bg-primary/10 px-4 py-2 rounded-full">
            <Shield className="h-5 w-5 text-primary" />
            <span className="text-primary font-medium">Security First</span>
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">
            Check for
            <span className="text-primary"> Malicious</span>
            <br />Content Instantly
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Protect yourself online by checking URLs, email addresses, and phone numbers 
            for potential threats. Get instant security analysis with detailed explanations.
          </p>
        </div>

        <div className="max-w-2xl mx-auto mb-16">
          <Card className="border-2">
            <CardHeader className="text-center pb-4">
              <CardTitle className="flex items-center justify-center space-x-2">
                <Search className="h-5 w-5" />
                <span>Security Scanner</span>
              </CardTitle>
              <CardDescription>
                Enter a URL, email address, or phone number to check for security threats
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as Tab)} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="url" className="flex items-center space-x-2">
                    <Globe className="h-4 w-4" />
                    <span>Website URL</span>
                  </TabsTrigger>
                  <TabsTrigger value="email" className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>Email</span>
                  </TabsTrigger>
                  <TabsTrigger value="phone" className="flex items-center space-x-2">
                    <Phone className="h-4 w-4" />
                    <span>Phone</span>
                  </TabsTrigger>
                </TabsList>

                {/* URL */}
                <TabsContent value="url" className="space-y-4 mt-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Website URL</label>
                    <Input
                      placeholder="https://example.com"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      onKeyDown={onEnter}
                      className="text-lg h-12"
                    />
                  </div>

                  <Button 
                    type="primary" 
                    size="large" 
                    onClick={handleCheck} 
                    disabled={!canSubmit || loading}
                    aria-busy={loading}
                    style={{ width: '100%', height: '48px' }}
                    icon={<Shield className="h-5 w-5" />}
                  >
                    Check Website Security
                  </Button>

                  {error && (
                      <div className="mt-4 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-red-900">
                        <div className="flex items-center gap-2"><Info className="h-4 w-4"/><span>{error}</span></div>
                      </div>
                    )}

                  {urlRes && <RiskCard kind="url" data={urlRes} />}
                </TabsContent>

                {/* EMAIL */}
                <TabsContent value="email" className="space-y-4 mt-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email Address</label>
                    <Input
                      placeholder="user@example.com"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      onKeyDown={onEnter}
                      className="text-lg h-12"
                    />
                  </div>

                  <Button 
                    type="primary" 
                    size="large" 
                    onClick={handleCheck} 
                    disabled={!canSubmit || loading}
                    aria-busy={loading}
                    style={{ width: '100%', height: '48px' }}
                    icon={<Mail className="h-5 w-5" />}
                  >
                    Check Email Safety
                  </Button>

                  {error && activeTab === "email" && (
                    <div className="mt-4 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-red-900">
                      <div className="flex items-center gap-2"><Info className="h-4 w-4"/><span>{error}</span></div>
                    </div>
                  )}

                  {emailRes && <RiskCard kind="email" data={emailRes} />}
                </TabsContent>

                {/* MOBILE NUMBER */}
                <TabsContent value="phone" className="space-y-4 mt-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone Number</label>
                    <Input
                      placeholder="+61 412 345 678 or (+61) 412 345 678 or 61412345678"
                      value={mobileInput}
                      onChange={(e) => setMobileInput(e.target.value)}
                      onKeyDown={onEnter}
                      className="text-lg h-12"
                    />
                  </div>

                  <Button 
                    type="primary" 
                    size="large" 
                    onClick={handleCheck} 
                    disabled={!canSubmit || loading}
                    aria-busy={loading}
                    style={{ width: '100%', height: '48px' }}
                    icon={<Phone className="h-5 w-5" />}
                  >
                    Check Phone Number
                  </Button>

                  {error && activeTab === "mobile" && (
                    <div className="mt-4 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-red-900">
                      <div className="flex items-center gap-2"><Info className="h-4 w-4"/><span>{error}</span></div>
                    </div>
                  )}

                  {mobileRes && <RiskCard kind="mobile" data={mobileRes} />}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}


