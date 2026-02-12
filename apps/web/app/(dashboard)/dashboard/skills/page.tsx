"use client";

import { useState } from "react";
import { 
  Bot, 
  Sparkles, 
  Mail, 
  MessageSquare, 
  Calendar, 
  FileText, 
  Search,
  CheckCircle2,
  Plus,
  Minus,
  Settings,
  ChevronDown,
  ChevronUp,
  Play,
  Square,
  Trash2,
  RefreshCw,
  Zap,
  Globe,
  Github,
  Linkedin,
  Twitter,
  Instagram,
  Youtube,
  Copy,
  Check
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

// Skill definitions with configurations
const SKILL_PACKS = {
  personal: {
    name: "Personal Assistant",
    description: "Your everyday AI helper for personal tasks",
    icon: User,
    price: 27,
    skills: [
      { id: "email", name: "Email Management", icon: Mail, description: "Read, send, and organize emails" },
      { id: "calendar", name: "Calendar", icon: Calendar, description: "Schedule meetings and events" },
      { id: "notes", name: "Notes", icon: FileText, description: "Take and organize notes" },
      { id: "reminders", name: "Reminders", icon: Bell, description: "Set and manage reminders" },
    ]
  },
  marketing: {
    name: "Marketing",
    description: "Automate your marketing workflow",
    icon: Sparkles,
    price: 47,
    skills: [
      { id: "blog", name: "Blog Writing", icon: FileText, description: "Write and publish blog posts" },
      { id: "social", name: "Social Media", icon: MessageSquare, description: "Schedule and post to social media" },
      { id: "seo", name: "SEO", icon: Search, description: "Optimize content for search" },
      { id: "email-campaigns", name: "Email Campaigns", icon: Mail, description: "Create and send email campaigns" },
    ]
  },
  sales: {
    name: "Sales",
    description: "Close more deals faster",
    icon: Zap,
    price: 47,
    skills: [
      { id: "lead-research", name: "Lead Research", icon: Search, description: "Research and qualify leads" },
      { id: "outreach", name: "Cold Outreach", icon: MessageSquare, description: "Automate outreach campaigns" },
      { id: "crm", name: "CRM", icon: Database, description: "Manage customer relationships" },
      { id: "followups", name: "Follow-ups", icon: Calendar, description: "Automated follow-up reminders" },
    ]
  },
  "real-estate": {
    name: "Real Estate",
    description: "AI agent for real estate professionals",
    icon: Globe,
    price: 47,
    skills: [
      { id: "listings", name: "Listing Copy", icon: FileText, description: "Write property descriptions" },
      { id: "leads", name: "Lead Response", icon: MessageSquare, description: "Respond to leads automatically" },
      { id: "calendars", name: "Showing Scheduler", icon: Calendar, description: "Schedule property showings" },
      { id: "comparables", name: "Comparables", icon: Search, description: "Research property values" },
    ]
  }
};

// Tool integrations
const TOOLS = [
  { id: "gmail", name: "Gmail", icon: Mail, description: "Connect Gmail account" },
  { id: "discord", name: "Discord", icon: MessageSquare, description: "Connect Discord server" },
  { id: "telegram", name: "Telegram", icon: MessageSquare, description: "Connect Telegram bot" },
  { id: "slack", name: "Slack", icon: MessageSquare, description: "Connect Slack workspace" },
  { id: "github", name: "GitHub", icon: Github, description: "Connect GitHub repositories" },
  { id: "calendly", name: "Calendly", icon: Calendar, description: "Connect Calendly" },
  { id: "notion", name: "Notion", icon: FileText, description: "Connect Notion workspace" },
  { id: "linear", name: "Linear", icon: CheckCircle2, description: "Connect Linear" },
];

// Social platforms
const SOCIAL_PLATFORMS = [
  { id: "twitter", name: "Twitter/X", icon: Twitter, enabled: false },
  { id: "linkedin", name: "LinkedIn", icon: Linkedin, enabled: false },
  { id: "instagram", name: "Instagram", icon: Instagram, enabled: false },
  { id: "youtube", name: "YouTube", icon: Youtube, enabled: false },
];

interface InstalledSkill {
  packId: string;
  skillId: string;
  enabled: boolean;
  config: Record<string, any>;
}

export default function SkillsPage() {
  const [installedSkills, setInstalledSkills] = useState<InstalledSkill[]>([
    { packId: "personal", skillId: "email", enabled: true, config: {} },
    { packId: "personal", skillId: "calendar", enabled: true, config: {} },
  ]);
  const [agentConfig, setAgentConfig] = useState({
    name: "My Agent",
    personality: "You are a helpful, concise AI assistant.",
    model: "minimax-m2.1",
    temperature: 0.7,
    maxTokens: 4096,
  });
  const [connectedTools, setConnectedTools] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [expandedPack, setExpandedPack] = useState<string | null>(null);

  const isSkillInstalled = (packId: string, skillId: string) => {
    return installedSkills.some(s => s.packId === packId && s.skillId === skillId);
  };

  const toggleSkill = (packId: string, skillId: string) => {
    setInstalledSkills(prev => {
      const exists = prev.some(s => s.packId === packId && s.skillId === skillId);
      if (exists) {
        return prev.filter(s => !(s.packId === packId && s.skillId === skillId));
      } else {
        return [...prev, { packId, skillId, enabled: true, config: {} }];
      }
    });
  };

  const isToolConnected = (toolId: string) => connectedTools.includes(toolId);

  const toggleTool = (toolId: string) => {
    setConnectedTools(prev => 
      prev.includes(toolId) 
        ? prev.filter(t => t !== toolId)
        : [...prev, toolId]
    );
  };

  const copyConfig = () => {
    const config = {
      agent: agentConfig,
      skills: installedSkills,
      tools: connectedTools,
    };
    navigator.clipboard.writeText(JSON.stringify(config, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Skills & Configuration</h1>
        <p className="text-muted-foreground">
          Configure your OpenClaw agent's skills and behavior
        </p>
      </div>

      <Tabs defaultValue="skills" className="space-y-6">
        <TabsList>
          <TabsTrigger value="skills">Skill Packs</TabsTrigger>
          <TabsTrigger value="agent">Agent Config</TabsTrigger>
          <TabsTrigger value="tools">Tools</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
        </TabsList>

        {/* Skill Packs Tab */}
        <TabsContent value="skills" className="space-y-6">
          {/* Installed Skills Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Installed Skills
              </CardTitle>
              <CardDescription>
                Skills currently active in your agent
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {installedSkills.map(skill => {
                  const pack = SKILL_PACKS[skill.packId as keyof typeof SKILL_PACKS];
                  const skillInfo = pack?.skills.find(sk => sk.id === skill.skillId);
                  if (!skillInfo) return null;
                  const Icon = skillInfo.icon;
                  return (
                    <Badge key={`${skill.packId}-${skill.skillId}`} variant="secondary" className="gap-1">
                      <Icon className="h-3 w-3" />
                      {skillInfo.name}
                    </Badge>
                  );
                })}
                {installedSkills.length === 0 && (
                  <p className="text-muted-foreground text-sm">No skills installed</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Skill Packs Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {Object.entries(SKILL_PACKS).map(([packId, pack]) => {
              const Icon = pack.icon;
              const isExpanded = expandedPack === packId;
              
              return (
                <Card key={packId} className="overflow-hidden">
                  <CardHeader 
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setExpandedPack(isExpanded ? null : packId)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{pack.name}</CardTitle>
                          <CardDescription>${pack.price}/mo</CardDescription>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {pack.description}
                    </p>
                  </CardHeader>

                  {isExpanded && (
                    <CardContent className="pt-0 border-t">
                      <div className="space-y-3 pt-4">
                        {pack.skills.map(skill => {
                          const installed = isSkillInstalled(packId, skill.id);
                          const Icon = skill.icon;
                          return (
                            <div 
                              key={skill.id}
                              className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                                installed ? "bg-primary/5 border-primary/20" : "hover:bg-muted/50"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <Icon className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="font-medium text-sm">{skill.name}</p>
                                  <p className="text-xs text-muted-foreground">{skill.description}</p>
                                </div>
                              </div>
                              <Button
                                variant={installed ? "destructive" : "outline"}
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleSkill(packId, skill.id);
                                }}
                              >
                                {installed ? (
                                  <>
                                    <Minus className="h-4 w-4 mr-1" />
                                    Remove
                                  </>
                                ) : (
                                  <>
                                    <Plus className="h-4 w-4 mr-1" />
                                    Add
                                  </>
                                )}
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Agent Configuration Tab */}
        <TabsContent value="agent" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Agent Configuration
              </CardTitle>
              <CardDescription>
                Customize your AI agent's personality and behavior
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Agent Name */}
              <div className="space-y-2">
                <Label htmlFor="agentName">Agent Name</Label>
                <Input
                  id="agentName"
                  value={agentConfig.name}
                  onChange={(e) => setAgentConfig(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="My AI Assistant"
                />
              </div>

              {/* Personality / System Prompt */}
              <div className="space-y-2">
                <Label htmlFor="personality">Personality & Instructions</Label>
                <Textarea
                  id="personality"
                  value={agentConfig.personality}
                  onChange={(e) => setAgentConfig(prev => ({ ...prev, personality: e.target.value }))}
                  placeholder="You are a helpful, concise AI assistant..."
                  rows={6}
                />
                <p className="text-xs text-muted-foreground">
                  This defines how your agent behaves. Be specific about its role, tone, and capabilities.
                </p>
              </div>

              {/* Model Selection */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Model</Label>
                  <Select 
                    value={agentConfig.model}
                    onValueChange={(value) => setAgentConfig(prev => ({ ...prev, model: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minimax-m2.1">MiniMax M2.1 (Default)</SelectItem>
                      <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                      <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                      <SelectItem value="claude-sonnet-4-20250514">Claude Sonnet 4</SelectItem>
                      <SelectItem value="claude-opus-4-20250514">Claude Opus 4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Temperature</Label>
                  <Select 
                    value={agentConfig.temperature.toString()}
                    onValueChange={(value) => setAgentConfig(prev => ({ ...prev, temperature: parseFloat(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.1">0.1 - Focused</SelectItem>
                      <SelectItem value="0.5">0.5 - Balanced</SelectItem>
                      <SelectItem value="0.7">0.7 - Creative</SelectItem>
                      <SelectItem value="1.0">1.0 - Creative</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Max Tokens</Label>
                  <Select 
                    value={agentConfig.maxTokens.toString()}
                    onValueChange={(value) => setAgentConfig(prev => ({ ...prev, maxTokens: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1024">1,024</SelectItem>
                      <SelectItem value="2048">2,048</SelectItem>
                      <SelectItem value="4096">4,096</SelectItem>
                      <SelectItem value="8192">8,192</SelectItem>
                      <SelectItem value="16384">16,384</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex gap-2">
                <Button>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Save Configuration
                </Button>
                <Button variant="outline" onClick={copyConfig}>
                  {copied ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Config
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* SOUL.md Preview */}
          <Card>
            <CardHeader>
              <CardTitle>SOUL.md Preview</CardTitle>
              <CardDescription>
                This is how your agent's personality will be configured
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] rounded-md border bg-muted p-4">
                <pre className="text-sm">
{`# SOUL.md - ${agentConfig.name}

${agentConfig.personality}

## Model Configuration
- Model: ${agentConfig.model}
- Temperature: ${agentConfig.temperature}
- Max Tokens: ${agentConfig.maxTokens}

## Active Skills
${installedSkills.map(s => {
  const pack = SKILL_PACKS[s.packId as keyof typeof SKILL_PACKS];
  return `- ${pack?.name}: ${s.skillId}`;
}).join("\n") || "- No skills configured"}

## Connected Tools
${connectedTools.length > 0 ? connectedTools.map(t => `- ${t}`).join("\n") : "- No tools connected"}`}
                </pre>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tools Tab */}
        <TabsContent value="tools" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Connected Tools</CardTitle>
              <CardDescription>
                Connect your accounts to enable agent capabilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {TOOLS.map(tool => {
                  const Icon = tool.icon;
                  const connected = isToolConnected(tool.id);
                  return (
                    <div 
                      key={tool.id}
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        connected ? "bg-primary/5 border-primary/20" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{tool.name}</p>
                          <p className="text-sm text-muted-foreground">{tool.description}</p>
                        </div>
                      </div>
                      <Button
                        variant={connected ? "destructive" : "outline"}
                        size="sm"
                        onClick={() => toggleTool(tool.id)}
                      >
                        {connected ? "Disconnect" : "Connect"}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Tab */}
        <TabsContent value="social" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Social Media Connections</CardTitle>
              <CardDescription>
                Connect social platforms for automated posting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {SOCIAL_PLATFORMS.map(platform => {
                  const Icon = platform.icon;
                  return (
                    <div 
                      key={platform.id}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{platform.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {platform.enabled ? "Connected" : "Not connected"}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        {platform.enabled ? "Disconnect" : "Connect"}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper components/functions
function User(props: any) { return <Bot {...props} />; }
function Bell(props: any) { return <span {...props}>🔔</span>; }
function Database(props: any) { return <span {...props}>🗄️</span>; }
