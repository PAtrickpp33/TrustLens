import { Button } from "antd";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Shield, Globe, Mail, Phone, Search } from "lucide-react";
import { useState } from "react";

export function Hero() {
  const [inputValue, setInputValue] = useState("");
  const [activeTab, setActiveTab] = useState("url");

  const handleCheck = () => {
    if (inputValue.trim()) {
      console.log(`Checking ${activeTab}: ${inputValue}`);
    }
  };

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
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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

                <TabsContent value="url" className="space-y-4 mt-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Website URL</label>
                    <Input
                      placeholder="https://example.com"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      className="text-lg h-12"
                    />
                  </div>
                  <Button 
                    type="primary" 
                    size="large" 
                    onClick={handleCheck} 
                    style={{ width: '100%', height: '48px' }}
                    icon={<Shield className="h-5 w-5" />}
                  >
                    Check Website Security
                  </Button>
                </TabsContent>

                <TabsContent value="email" className="space-y-4 mt-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email Address</label>
                    <Input
                      placeholder="user@example.com"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      className="text-lg h-12"
                    />
                  </div>
                  <Button 
                    type="primary" 
                    size="large" 
                    onClick={handleCheck} 
                    style={{ width: '100%', height: '48px' }}
                    icon={<Mail className="h-5 w-5" />}
                  >
                    Check Email Safety
                  </Button>
                </TabsContent>

                <TabsContent value="phone" className="space-y-4 mt-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone Number</label>
                    <Input
                      placeholder="+1 (555) 123-4567"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      className="text-lg h-12"
                    />
                  </div>
                  <Button 
                    type="primary" 
                    size="large" 
                    onClick={handleCheck} 
                    style={{ width: '100%', height: '48px' }}
                    icon={<Phone className="h-5 w-5" />}
                  >
                    Check Phone Number
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}


