import {terminal} from "./terminal.js";
import {config} from './config.js';

const { term, fitAddon } = terminal;

const socketManager = {
    socket: null,
    reconnectAttempts: 0,

    connect(sessionId, token) {
        if (this.socket?.readyState === WebSocket.OPEN) return;

        const url = `ws://localhost:45005/?sessionId=${encodeURIComponent(sessionId)}&token=${encodeURIComponent(token)}`;
        this.socket = new WebSocket(url);

        this.socket.onmessage = (event) => {
            console.log('Received from server:', event.data);
            term.write(event.data);
        };

        this.socket.onopen = () => {
            this.reconnectAttempts = 0;
            term.write('\r\n\x1b[32mConnected to terminal session\x1b[0m\r\n');
            term.focus();
        };

        this.socket.onclose = ({code, reason}) => {
            // if (code === 1003) { // Unsupported platform
            //     term.write(`\r\x1b[31m${reason}\x1b[0m\r\n`);
            //     return;
            // }

            // if (this.reconnectAttempts < config.maxReconnectAttempts) {
            //     this.reconnectAttempts++;
            //     term.write(`\r\x1b[33mReconnecting (${this.reconnectAttempts}/${config.maxReconnectAttempts})...\x1b[0m\r\n`);
            //     setTimeout(() => this.connect(), config.reconnectDelay);
            // } else {
            //     term.write('\r\n\x1b[31mMax reconnection attempts reached\x1b[0m\r\n');
            // }
        };

        this.socket.onerror = (error) => {
            term.write(`\r\n\x1b[31mError: ${error.message}\x1b[0m\r\n`);
        };
    },

    getSocket() {
        return this.socket;
    }
};

export default socketManager;
