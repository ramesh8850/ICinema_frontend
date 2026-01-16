import { Injectable } from '@angular/core';
import { RxStomp } from '@stomp/rx-stomp';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class WebSocketService extends RxStomp {
    constructor() {
        super();
    }
}

import * as SockJS from 'sockjs-client';

export function rxStompServiceFactory() {
    const rxStomp = new WebSocketService();
    rxStomp.configure({
        // brokerURL: environment.apiUrl.replace('http', 'ws') + '/ws', // Raw WebSocket
        // Remove '/api' from the end of apiUrl if present, then append '/ws'
        webSocketFactory: () => new SockJS(environment.apiUrl.replace(/\/api$/, '') + '/ws'),

        // heartbeatIncoming: 0,
        // heartbeatOutgoing: 20000, 
        reconnectDelay: 200,
        debug: (msg: string) => {
            console.log(new Date(), msg); // Keep debug on for now
        },
    });
    rxStomp.activate();
    return rxStomp;
}
