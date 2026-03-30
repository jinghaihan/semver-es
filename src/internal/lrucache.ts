export class LRUCache<K = unknown, V = unknown> {
  private max: number
  private map: Map<K, V>

  constructor() {
    this.max = 1000
    this.map = new Map()
  }

  get(key: K): V | undefined {
    const value = this.map.get(key)
    if (value === undefined) {
      return undefined
    }

    else {
      // Remove the key from the map and add it to the end
      this.map.delete(key)
      this.map.set(key, value)
      return value
    }
  }

  delete(key: K): boolean {
    return this.map.delete(key)
  }

  set(key: K, value: V): this {
    const deleted = this.delete(key)

    if (!deleted && value !== undefined) {
      // If cache is full, delete the least recently used item
      if (this.map.size >= this.max) {
        const firstKey = this.map.keys().next().value
        if (firstKey !== undefined)
          this.delete(firstKey)
      }

      this.map.set(key, value)
    }

    return this
  }
}
