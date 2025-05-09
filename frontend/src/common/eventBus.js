// Event bus for component communication
class EventBus {
    constructor() {
        this.events = {};
        this.debug = true; // Set to true to enable debug logs
    }

    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }

        if (this.debug) {
            console.log(`[EventBus] Adding listener for event: ${event}`);
            console.log(`[EventBus] Current listeners for ${event}: ${this.events[event].length}`);
        }

        this.events[event].push(callback);

        // Return a function to unsubscribe
        return () => this.off(event, callback);
    }

    off(event, callback) {
        if (!this.events[event]) return;

        if (this.debug) {
            console.log(`[EventBus] Removing listener for event: ${event}`);
        }

        this.events[event] = this.events[event].filter(cb => cb !== callback);

        if (this.debug) {
            console.log(`[EventBus] Remaining listeners for ${event}: ${this.events[event].length}`);
        }
    }

    emit(event, data) {
        if (!this.events[event]) {
            if (this.debug) {
                console.log(`[EventBus] No listeners for event: ${event}`);
            }
            return;
        }

        if (this.debug) {
            console.log(`[EventBus] Emitting event: ${event}`, data);
            console.log(`[EventBus] Listeners count: ${this.events[event].length}`);
        }

        // Use setTimeout to ensure event is processed asynchronously
        // This helps prevent issues with React rendering cycle
        setTimeout(() => {
            this.events[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`[EventBus] Error in event handler for ${event}:`, error);
                }
            });
        }, 0);
    }
}

const eventBus = new EventBus();
export default eventBus; 