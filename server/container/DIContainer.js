/**
 * Dependency Injection Container
 * Implements Dependency Inversion Principle
 */
class DIContainer {
  constructor() {
    this.services = new Map()
    this.singletons = new Map()
  }

  /**
   * Register a service with its dependencies
   */
  register(name, factory, dependencies = [], singleton = false) {
    this.services.set(name, {
      factory,
      dependencies,
      singleton
    })
  }

  /**
   * Register a singleton service
   */
  registerSingleton(name, factory, dependencies = []) {
    this.register(name, factory, dependencies, true)
  }

  /**
   * Resolve a service and its dependencies
   */
  resolve(name) {
    const serviceConfig = this.services.get(name)
    
    if (!serviceConfig) {
      throw new Error(`Service '${name}' not found`)
    }

    // Return singleton instance if exists
    if (serviceConfig.singleton && this.singletons.has(name)) {
      return this.singletons.get(name)
    }

    // Resolve dependencies
    const dependencies = serviceConfig.dependencies.map(dep => this.resolve(dep))
    
    // Create instance
    const instance = serviceConfig.factory(...dependencies)

    // Store singleton
    if (serviceConfig.singleton) {
      this.singletons.set(name, instance)
    }

    return instance
  }

  /**
   * Check if service is registered
   */
  has(name) {
    return this.services.has(name)
  }

  /**
   * Get all registered service names
   */
  getServiceNames() {
    return Array.from(this.services.keys())
  }

  /**
   * Clear all services (for testing)
   */
  clear() {
    this.services.clear()
    this.singletons.clear()
  }
}

module.exports = DIContainer
