import { createNodeRedisClient, WrappedNodeRedisClient } from "handy-redis";

export class RedisClient {
  _client: WrappedNodeRedisClient
  constructor(host: string, port: string) {
    this._client = createNodeRedisClient(Number(port), host)
  }

  async set(key: string, value: string, ttl: number = 86400): Promise<"OK" | string | null> {
    return this._client.set(key, value, ["EX", ttl])
  }

  async get(key: string): Promise<string | null> {
    return this._client.get(key)
  }
}
