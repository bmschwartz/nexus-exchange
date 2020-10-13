import { createNodeRedisClient, WrappedNodeRedisClient } from "handy-redis";

export class RedisClient {
  _client: WrappedNodeRedisClient
  constructor(host: string, port: string) {
    this._client = createNodeRedisClient(Number(port), host)
  }

  async set(key: string, value: string) {
    return this._client.set(key, value)
  }
}
