/**
 * Docker Client - Manages OpenClaw containers per user
 */

import Dockerode from "dockerode";

const docker = new Dockerode({
  socketPath: process.env.DOCKER_SOCKET || "/var/run/docker.sock",
});

export interface UserContainerConfig {
  userId: string;
  email: string;
  skillPacks: string[];
  environment: Record<string, string>;
  memoryLimit?: string;
  cpuLimit?: string;
}

export interface ContainerInfo {
  id: string;
  name: string;
  status: "running" | "stopped" | "error";
  image: string;
  createdAt: Date;
  lastActivity: Date;
  ports: Record<string, number>;
}

export class DockerClient {
  private readonly imageName = "openclaw:latest";
  private readonly networkName = "openclaw-network";

  /**
   * Initialize Docker network
   */
  async init(): Promise<void> {
    try {
      await this.ensureNetwork();
      await this.ensureImage();
    } catch (error) {
      console.warn("Docker init warning:", error);
    }
  }

  /**
   * Ensure Docker network exists
   */
  private async ensureNetwork(): Promise<void> {
    try {
      await docker.getNetwork(this.networkName).inspect();
    } catch {
      try {
        await docker.createNetwork({
          Name: this.networkName,
          Driver: "bridge",
          CheckDuplicate: true,
          IPAM: {
            Driver: "default",
            Config: [{ Subnet: "172.20.0.0/16" }],
          },
        });
      } catch (error) {
        if (this.isOverlappingPoolError(error)) {
          await docker.createNetwork({
            Name: this.networkName,
            Driver: "bridge",
            CheckDuplicate: true,
          });
          return;
        }
        throw error;
      }
    }
  }

  private isOverlappingPoolError(error: unknown): boolean {
    if (typeof error !== "object" || error === null) return false;
    const dockerError = error as {
      statusCode?: number;
      message?: string;
      json?: { message?: string };
    };
    const message = dockerError.json?.message || dockerError.message || "";
    return dockerError.statusCode === 403 && message.includes("Pool overlaps");
  }

  /**
   * Ensure OpenClaw image exists
   */
  private async ensureImage(): Promise<void> {
    try {
      await docker.getImage(this.imageName).inspect();
    } catch {
      console.log(`OpenClaw image '${this.imageName}' not found. Run 'docker build' first.`);
    }
  }

  /**
   * Create a container for a user
   */
  async createContainer(config: UserContainerConfig): Promise<ContainerInfo> {
    const containerName = `openclaw-${config.userId}`;

    const container = await docker.createContainer({
      name: containerName,
      Image: this.imageName,
      Env: [
        `USER_ID=${config.userId}`,
        `USER_EMAIL=${config.email}`,
        `SKILL_PACKS=${config.skillPacks.join(",")}`,
        ...Object.entries(config.environment).map(([k, v]) => `${k}=${v}`),
      ],
      HostConfig: {
        Memory: config.memoryLimit ? this.parseMemory(config.memoryLimit) : 512 * 1024 * 1024,
        CpuPeriod: 100000,
        CpuQuota: config.cpuLimit ? parseFloat(config.cpuLimit) * 100000 : 50000,
        NetworkMode: this.networkName,
      },
      Labels: {
        userId: config.userId,
        type: "openclaw",
      },
    });

    await container.start();

    const info = await container.inspect();
    
    return {
      id: info.Id,
      name: containerName,
      status: info.State.Running ? "running" : "stopped",
      image: this.imageName,
      createdAt: new Date(info.Created),
      lastActivity: new Date(info.State.FinishedAt || info.Created),
      ports: info.NetworkSettings?.Ports || {},
    };
  }

  /**
   * Get container info
   */
  async getContainer(userId: string): Promise<ContainerInfo | null> {
    const containerName = `openclaw-${userId}`;
    try {
      const container = docker.getContainer(containerName);
      const info = await container.inspect();
      
      return {
        id: info.Id,
        name: containerName,
        status: info.State.Running ? "running" : "stopped",
        image: info.Config.Image,
        createdAt: new Date(info.Created),
        lastActivity: new Date(info.State.FinishedAt || info.Created),
        ports: info.NetworkSettings?.Ports || {},
      };
    } catch {
      return null;
    }
  }

  /**
   * List all user containers
   */
  async listContainers(): Promise<ContainerInfo[]> {
    const containers = await docker.listContainers({
      filters: { label: ["type=openclaw"] },
    });

    return containers.map((c) => ({
      id: c.Id,
      name: c.Names[0].replace("/", ""),
      status: c.State === "running" ? "running" : "stopped",
      image: c.Image,
      createdAt: new Date(c.Created),
      lastActivity: new Date(c.Status),
      ports: c.Ports.reduce((acc, p) => {
        if (p.PublicPort) acc[p.PrivatePort] = p.PublicPort;
        return acc;
      }, {} as Record<string, number>),
    }));
  }

  /**
   * Send message to user's agent
   */
  async sendMessage(userId: string, message: string): Promise<string> {
    const containerName = `openclaw-${userId}`;
    const container = docker.getContainer(containerName);

    const exec = await container.exec({
      AttachStdout: true,
      AttachStderr: true,
      Cmd: ["sh", "-c", `echo '${message.replace(/'/g, "'\\''")}' | openclaw --send`],
    });

    const result = await exec.start({ detach: false });
    return result.toString();
  }

  /**
   * Stop container
   */
  async stopContainer(userId: string): Promise<boolean> {
    const containerName = `openclaw-${userId}`;
    try {
      const container = docker.getContainer(containerName);
      await container.stop({ t: 30 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Delete container
   */
  async deleteContainer(userId: string): Promise<boolean> {
    const containerName = `openclaw-${userId}`;
    try {
      const container = docker.getContainer(containerName);
      try {
        await container.stop({ t: 10 });
      } catch { /* ignore if already stopped */ }
      await container.remove({ v: true, force: true });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get container logs
   */
  async getLogs(userId: string, tail: number = 100): Promise<string> {
    const containerName = `openclaw-${userId}`;
    const container = docker.getContainer(containerName);
    const logs = await container.logs({ stdout: true, stderr: true, tail });
    return logs.toString();
  }

  /**
   * Parse memory string to bytes
   */
  private parseMemory(str: string): number {
    const units: Record<string, number> = {
      b: 1, k: 1024, m: 1024 ** 2, g: 1024 ** 3, t: 1024 ** 4,
    };
    const match = str.toLowerCase().match(/^(\d+)([kmgt]?)$/);
    if (!match) return 512 * 1024 * 1024;
    return parseInt(match[1]) * (units[match[2]] || 1);
  }
}

export const dockerClient = new DockerClient();
