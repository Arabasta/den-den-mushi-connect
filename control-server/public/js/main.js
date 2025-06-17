import {toggleSettingsMenu} from "./settings/settingsMenu.js";
import socketManager from './websocket.js';
import {registerHandlers} from './handlers.js';
import showAsciiArt from "./welcome.js";
import { terminal } from './terminal.js';

const { term, fitAddon } = terminal;

document.addEventListener('DOMContentLoaded', () => {
    const terminalElement = document.getElementById('terminal');

    if (!terminalElement) {
        console.error('Terminal container not found!');
        return;
    }

    term.open(terminalElement);
    fitAddon.fit();

    showAsciiArt(term);

    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('sessionId');
    const token = params.get('token');
    if (!sessionId || !token) {
        term.write('\r\n\x1b[31mMissing sessionId or token in URL\x1b[0m\r\n');
    } else {
        socketManager.connect(sessionId, token);
    }

    registerHandlers();

    // handle window resize
    window.addEventListener('resize', () => {
        try {
            fitAddon.fit();
        } catch (e) {
            console.error('Fit error:', e);
        }
    });
});
