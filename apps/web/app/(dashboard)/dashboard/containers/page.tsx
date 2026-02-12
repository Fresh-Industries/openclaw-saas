"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Plus, 
  Bot, 
  Play, 
  Square, 
  Trash2, 
  Terminal, 
  RefreshCw,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Clock
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Container {
  id: string;
  name: string;
  status: "running" | "stopped" | "error";
  skillPacks: string[];
  createdAt: string;
  lastActivity: string;
}

const SKILL_PACKS = [
  { id: "personal", name: "Personal", price: "$27/mo" },
  { id: "marketing", name: "Marketing", price: "$47/mo" },
  { id: "sales", name: "Sales", price: "$47/mo" },
  { id: "real-estate", name: "Real Estate", price: "$47/mo" },
];

export default function ContainersPage() {
  const [containers, setContainers] = useState<Container[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedPacks, setSelectedPacks] = useState<string[]>([]);
  const [logs, setLogs] = useState<string>("");
  const [showLogs, setShowLogs] = useState(false);

  useEffect(() => {
    fetchContainers();
  }, []);

  const fetchContainers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/containers");
      const data = await response.json();
      setContainers(data);
    } catch (error) {
      console.error("Failed to fetch containers:", error);
      // Demo data for development
      setContainers([
        {
          id: "demo-1",
          name: "openclaw-demo-user-1",
          status: "running",
          skillPacks: ["personal", "marketing"],
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          lastActivity: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const createContainer = async () => {
    if (selectedPacks.length === 0) return;
    
    setIsCreating(true);
    try {
      const response = await fetch("/api/containers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skillPacks: selectedPacks }),
      });

      if (response.ok) {
        await fetchContainers();
        setSelectedPacks([]);
      }
    } catch (error) {
      console.error("Failed to create container:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const stopContainer = async (id: string) => {
    try {
      await fetch(`/api/containers/${id}/stop`, { method: "POST" });
      await fetchContainers();
    } catch (error) {
      console.error("Failed to stop container:", error);
    }
  };

  const startContainer = async (id: string) => {
    try {
      await fetch(`/api/containers/${id}`, { method: "POST" });
      await fetchContainers();
    } catch (error) {
      console.error("Failed to start container:", error);
    }
  };

  const deleteContainer = async (id: string) => {
    if (!confirm("Are you sure you want to delete this container?")) return;
    
    try {
      await fetch(`/api/containers/${id}`, { method: "DELETE" });
      await fetchContainers();
    } catch (error) {
      console.error("Failed to delete container:", error);
    }
  };

  const viewLogs = async (id: string) => {
    try {
      const response = await fetch(`/api/containers/${id}/logs?tail=100`);
      const data = await response.json();
      setLogs(data.logs || "No logs available");
      setShowLogs(true);
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running": return "text-green-500";
      case "stopped": return "text-yellow-500";
      case "error": return "text-red-500";
      default: return "text-gray-500";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Containers</h1>
          <p className="text-muted-foreground">
            Manage your OpenClaw agent containers
          </p>
        </div>
        
        {/* Create Dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Container
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Container</DialogTitle>
              <DialogDescription>
                Choose skill packs for your OpenClaw agent
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              {SKILL_PACKS.map((pack) => (
                <div
                  key={pack.id}
                  className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedPacks.includes(pack.id)
                      ? "border-primary bg-primary/5"
                      : "hover:border-primary/50"
                  }`}
                  onClick={() => {
                    setSelectedPacks((prev) =>
                      prev.includes(pack.id)
                        ? prev.filter((id) => id !== pack.id)
                        : [...prev, pack.id]
                    );
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-5 w-5 rounded border flex items-center justify-center ${
                        selectedPacks.includes(pack.id)
                          ? "bg-primary border-primary"
                          : "border-muted-foreground"
                      }`}
                    >
                      {selectedPacks.includes(pack.id) && (
                        <CheckCircle2 className="h-4 w-4 text-primary-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{pack.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {pack.price}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <DialogFooter>
              <Button
                onClick={createContainer}
                disabled={selectedPacks.length === 0 || isCreating}
              >
                {isCreating ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>Create Container</>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Containers Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : containers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bot className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No containers yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first OpenClaw agent container
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Container
                </Button>
              </DialogTrigger>
            </Dialog>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {containers.map((container) => (
            <Card key={container.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Bot className="h-5 w-5" />
                    <CardTitle className="text-lg">
                      {container.name}
                    </CardTitle>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => viewLogs(container.id)}>
                        <Terminal className="mr-2 h-4 w-4" />
                        View Logs
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {container.status === "running" ? (
                        <DropdownMenuItem onClick={() => stopContainer(container.id)}>
                          <Square className="mr-2 h-4 w-4" />
                          Stop
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => startContainer(container.id)}>
                          <Play className="mr-2 h-4 w-4" />
                          Start
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => deleteContainer(container.id)}
                        className="text-red-500"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Status */}
                <div className="flex items-center gap-2">
                  {container.status === "running" ? (
                    <CheckCircle2 className={`h-4 w-4 ${getStatusColor(container.status)}`} />
                  ) : container.status === "error" ? (
                    <XCircle className={`h-4 w-4 ${getStatusColor(container.status)}`} />
                  ) : (
                    <Clock className={`h-4 w-4 ${getStatusColor(container.status)}`} />
                  )}
                  <span className={`text-sm font-medium capitalize ${getStatusColor(container.status)}`}>
                    {container.status}
                  </span>
                </div>

                {/* Skill Packs */}
                <div className="flex flex-wrap gap-1">
                  {container.skillPacks.map((pack) => (
                    <Badge key={pack} variant="secondary">
                      {pack}
                    </Badge>
                  ))}
                </div>

                {/* Timestamps */}
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Created: {formatDate(container.createdAt)}</p>
                  <p>Last activity: {formatDate(container.lastActivity)}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {container.status === "running" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => stopContainer(container.id)}
                    >
                      <Square className="mr-1 h-3 w-3" />
                      Stop
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => startContainer(container.id)}
                    >
                      <Play className="mr-1 h-3 w-3" />
                      Start
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => viewLogs(container.id)}
                  >
                    <Terminal className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Logs Dialog */}
      <Dialog open={showLogs} onOpenChange={setShowLogs}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Container Logs</DialogTitle>
            <DialogDescription>
              Real-time logs from your container
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[400px] rounded-md border bg-muted p-4">
            <pre className="text-sm font-mono whitespace-pre-wrap">
              {logs || "No logs available"}
            </pre>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLogs(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
