import ws from 'k6/ws';
import { check, sleep } from 'k6';
export let options = {
    duration: '5m',
    VUs: 100,
};


const params = {
    headers: {
        // Accept: 'application/json, text/plain, */*',
        // Connection: 'keep-alive',
        'X-XSRF-TOKEN': '',
    },

    cookies: {
        session: '',
    }
}


export default function () {
    const url = 'wss://url/socket.io/?EIO=3&transport=websocket';
    const response = ws.connect(url, params, function (socket) {
        socket.on('open', function open () {
            console.log('connected')

            socket.setInterval(function timeout () {
                socket.send('3')
            }, 1000)
        })

        socket.on('message', function incoming (msg) {
            console.log("message received: ", msg)
            if (msg && msg.startsWith('0{"sid')) {
                socket.send(
                    '40/echo-app-key,{"headers":{}}'
                )
            }

            if (msg && msg.startsWith('40')) {
                socket.send(
                    '42/echo-app-key,["subscribe",{"channel":"twitter","auth":{"headers":{}}}]'
                )
            }
        })

        socket.on('close', function close () {
            console.log('disconnected')
        })

        socket.on('error', function (e) {
            console.log('error', e)
            if (e.error() !== 'websocket: close sent') {
                console.log('An unexpected error occured: ', e.error())
            }
        })

        socket.setTimeout(function () {
            console.log('100 seconds passed, closing the socket');
            socket.close();
        }, 100000)
    })

    check(response, { 'status is 101': (r) => r && r.status === 101 })
}
