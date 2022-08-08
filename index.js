import http from 'http';
import DIP from './lib/DIP.js';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';
import BareServer from '@tomphttp/bare-server-node';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

var a = new DIP(join(__dirname, 'public', 'dip'));
a.watch();

const bare = new BareServer('/bare/', {
	logErrors: false,
	localAddress: undefined,
	maintainer: {
		email: 'tomphttp@sys32.dev',
		website: 'https://github.com/tomphttp/',
	},
});

const serve = new a.Server(join(__dirname, 'public'), {headers: {"Service-Worker-Allowed": '/'}});

const server = http.createServer();

server.on('request', (request, response) => {
  
	request.url = request.url.replace('https://', 'https:/').replace('https:/', 'https://');

	if (bare.shouldRoute(request)) return bare.routeRequest(request, response);

	if (request.url.startsWith('/service/')) {
		if (0) response.end(`<script>
if ('serviceWorker' in navigator) {
var worker = navigator.serviceWorker.register('/sw.js?${Math.round(Math.random()*(899999)+100000)}', {
scope: '/service',
}).then(() => {
location.reload();
});
}
</script>`);
	} else {
		serve.serve(request, response);
	}
});

server.on('upgrade', (req, socket, head) => {
	if (bare.shouldRoute(req)) return bare.routeUpgrade(req, socket, head);
	socket.end();
});

server.listen(process.env.PORT || 80);