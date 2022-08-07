import webpack from 'webpack';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import Static from 'node-static';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default class DIP {
  Server = function(path, opts = {}) {
    var server = new Static.Server(...arguments);

    return server;
  }

	constructor(folder) {
    
		this.webpack = webpack({
			mode: 'none',
			entry: {
				worker: join(__dirname, 'dip.worker', 'index.ts'),
				client: join(__dirname, 'dip.client', 'index.ts'),
				page: join(__dirname, 'dip.page', 'index.ts'),
        handler: join(__dirname, 'dip.handler', 'index.ts'),
			},
      resolve: {
        extensions: ['.ts', '.js'],
      },
      module: {
        rules: [
          {
            test: /\.ts?/,
            use: 'ts-loader',
            exclude: /node_modules/,
          }
        ]
      },
			output: {
				filename: 'dip.[name].js',
				path: folder,
			},
		});
	}
	watch() {
		this.webpack.watch({}, error => {
			if (error) {
				console.error(error);
			} else {
				console.log('Bundled code');
			}
		});
	}
	bundle() {
		this.webpack.run(error => {
			if (error) {
				console.error(error);
			} else {
				console.log('Bundled code');
			}
		});
	}
};