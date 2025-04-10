interface EventMap {
  pullImage: string  // The string is the image-name
  showError: any  // The any can be any error type
  openUrl: string // Open an url in the web-browser
}


class EventBus<TEvents extends EventMap> {
  private listeners: { [K in keyof TEvents]?: Array<(data: TEvents[K]) => void | Promise<void>> } = {}

  // Subscribe to an event
  on<K extends keyof TEvents>(event: K, listener: (data: TEvents[K]) => void | Promise<void>): void {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event]!.push(listener)
  }


  // Unsubscribe from an event
  off<K extends keyof TEvents>(event: K, listener: (data: TEvents[K]) => void | Promise<void>): void {
    const eventListeners = this.listeners[event]
    if (!eventListeners) return

    this.listeners[event] = eventListeners.filter(fn => fn !== listener)
  }

  async emit<K extends keyof TEvents>(event: K, data: TEvents[K]): Promise<void> {
    const eventListeners = this.listeners[event]
    if (!eventListeners || eventListeners.length === 0) return

    // Wait for all listeners to complete
    const listenerPromises = eventListeners.map(listener => {
      try {
        const result = listener(data)
        // Check if the listener returns a promise
        if (result instanceof Promise) {
          return result
        }
        // If synchronous, return a resolved promise
        return Promise.resolve()
      } catch (error) {
        return Promise.reject(error)
      }
    })

    // Wait for all listener promises to resolve
    await Promise.all(listenerPromises)
  }

  // Remove all listeners for a specific event
  removeAllListeners<K extends keyof TEvents>(event: K): void {
    delete this.listeners[event]
  }
}

export default new EventBus()
