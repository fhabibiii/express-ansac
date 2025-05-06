/**
 * Circuit Breaker Utility
 * Implements circuit breaker pattern to prevent cascading failures
 */

const { logger } = require('./logger.utils');

// Circuit breaker states
const STATES = {
  CLOSED: 'CLOSED',    // Normal operation, requests pass through
  OPEN: 'OPEN',        // Failure threshold exceeded, requests are rejected
  HALF_OPEN: 'HALF_OPEN'  // Testing if service is back online
};

/**
 * Circuit Breaker implementation
 */
class CircuitBreaker {
  /**
   * Create a new circuit breaker
   * @param {Object} options - Configuration options
   * @param {number} options.failureThreshold - Number of failures before opening circuit
   * @param {number} options.resetTimeout - Time in ms before attempting to close circuit again
   * @param {number} options.halfOpenSuccessThreshold - Number of successes in half-open state to close circuit
   */
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 30000; // 30 seconds
    this.halfOpenSuccessThreshold = options.halfOpenSuccessThreshold || 2;
    
    this.state = STATES.CLOSED;
    this.failures = 0;
    this.successes = 0;
    this.nextAttempt = Date.now();
    this.name = options.name || 'default';
    
    logger.info(`Circuit breaker "${this.name}" initialized with failureThreshold=${this.failureThreshold}, resetTimeout=${this.resetTimeout}ms`);
  }

  /**
   * Execute a function with circuit breaker protection
   * @param {Function} fn - Function to execute
   * @returns {Promise<any>} - Result of the function or rejection if circuit is open
   */
  async execute(fn) {
    if (this.isOpen()) {
      // Check if it's time to try again (half-open state)
      if (Date.now() >= this.nextAttempt) {
        this.toHalfOpen();
      } else {
        // Circuit is open and not ready to try again
        const err = new Error(`Circuit "${this.name}" is open, request rejected`);
        err.circuitBreaker = {
          state: this.state,
          failures: this.failures,
          nextAttempt: new Date(this.nextAttempt)
        };
        throw err;
      }
    }

    try {
      // Execute the function
      const result = await fn();
      
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure(error);
      throw error;
    }
  }

  /**
   * Handle successful execution
   */
  onSuccess() {
    if (this.state === STATES.HALF_OPEN) {
      this.successes++;
      
      if (this.successes >= this.halfOpenSuccessThreshold) {
        this.toClosed();
      }
    } else if (this.state === STATES.CLOSED) {
      // Reset failures in closed state on success
      this.failures = 0;
    }
  }

  /**
   * Handle failed execution
   * @param {Error} error - Error from the executed function
   */
  onFailure(error) {
    if (this.state === STATES.HALF_OPEN) {
      // Any failure in half-open state returns us to open state
      this.toOpen(error);
    } else if (this.state === STATES.CLOSED) {
      this.failures++;
      
      if (this.failures >= this.failureThreshold) {
        this.toOpen(error);
      }
    }
  }

  /**
   * Transition to open state
   * @param {Error} error - Error that caused transition
   */
  toOpen(error) {
    if (this.state !== STATES.OPEN) {
      logger.warn(`Circuit breaker "${this.name}" tripped to OPEN state: ${error?.message || 'Unknown error'}`);
      
      this.state = STATES.OPEN;
      this.nextAttempt = Date.now() + this.resetTimeout;
    }
  }

  /**
   * Transition to half-open state
   */
  toHalfOpen() {
    if (this.state !== STATES.HALF_OPEN) {
      logger.info(`Circuit breaker "${this.name}" state changed to HALF_OPEN, testing service availability`);
      
      this.state = STATES.HALF_OPEN;
      this.successes = 0;
    }
  }

  /**
   * Transition to closed state
   */
  toClosed() {
    if (this.state !== STATES.CLOSED) {
      logger.info(`Circuit breaker "${this.name}" state changed to CLOSED, service is operational again`);
      
      this.state = STATES.CLOSED;
      this.failures = 0;
      this.successes = 0;
    }
  }

  /**
   * Check if circuit is open (or half-open)
   * @returns {boolean} True if circuit is open or half-open
   */
  isOpen() {
    return this.state === STATES.OPEN;
  }

  /**
   * Reset the circuit breaker to closed state
   */
  reset() {
    this.toClosed();
  }

  /**
   * Get current circuit breaker state
   * @returns {Object} Current state information
   */
  getState() {
    return {
      name: this.name,
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      nextAttempt: this.state === STATES.OPEN ? new Date(this.nextAttempt) : null
    };
  }
}

// Create database circuit breaker instance
const databaseCircuitBreaker = new CircuitBreaker({
  name: 'database',
  failureThreshold: 3,
  resetTimeout: 10000, // 10 seconds
  halfOpenSuccessThreshold: 2
});

// Export both the class and the database instance
module.exports = {
  CircuitBreaker,
  databaseCircuitBreaker,
  STATES
};