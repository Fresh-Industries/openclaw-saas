"use client";

import { useState } from "react";
import { useSession } from "better-auth/react";
import { signIn, signOut } from "better-auth/react";
import { 
  Loader2, 
  CheckCircle2, 
  XCircle,
  ExternalLink,
  Github,
  Mail,
  Lock
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Connection {
  id: string;
  name: string;
  provider: string;
  connected: boolean;
  icon: React.ReactNode;
}

export default function ConnectionsPage() {
  const { data: session } = useSession();
  const [isConnecting, setIsConnecting] = useState<string | null>(null);

  const connections: Connection[] = [
    {
      id: "github",
      name: "GitHub",
      provider: "github",
      connected: false, // Would check actual session
      icon: <Github className="h-5 w-5" />,
    },
    {
      id: "google",
      name: "Google",
      provider: "google",
      connected: false,
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
      ),
    },
    {
      id: "email",
      name: "Email",
      provider: "email-password",
      connected: true,
      icon: <Mail className="h-5 w-5" />,
    },
  ];

  const handleConnect = async (provider: string) => {
    setIsConnecting(provider);
    try {
      await signIn.social({
        provider: provider as any,
      });
    } catch (error) {
      console.error("Failed to connect:", error);
    } finally {
      setIsConnecting(null);
    }
  };

  const handleDisconnect = async (provider: string) => {
    // Would implement disconnect logic
    console.log("Disconnect:", provider);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Connections</h1>
        <p className="text-muted-foreground">
          Manage your connected accounts
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Connected Accounts</CardTitle>
          <CardDescription>
            Connect your accounts for easier sign-in and additional features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {connections.map((connection) => (
            <div
              key={connection.id}
              className="flex items-center justify-between p-4 rounded-lg border"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  {connection.icon}
                </div>
                <div>
                  <p className="font-medium">{connection.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {connection.connected
                      ? "Connected"
                      : "Not connected"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {connection.connected ? (
                  <>
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-sm">Connected</span>
                    </div>
                    {connection.provider !== "email-password" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDisconnect(connection.provider)}
                      >
                        Disconnect
                      </Button>
                    )}
                  </>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleConnect(connection.provider)}
                    disabled={isConnecting === connection.id}
                  >
                    {isConnecting === connection.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        Connect
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
          <CardDescription>
            Manage API keys for programmatic access
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div>
              <p className="font-medium">API Keys</p>
              <p className="text-sm text-muted-foreground">
                Create and manage API keys for your account
              </p>
            </div>
            <Button variant="outline" size="sm">
              Create Key
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Webhooks</CardTitle>
          <CardDescription>
            Configure webhooks for real-time events
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div>
              <p className="font-medium">Webhook URL</p>
              <p className="text-sm text-muted-foreground">
                Receive real-time updates when events occur
              </p>
            </div>
            <Button variant="outline" size="sm">
              Configure
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
