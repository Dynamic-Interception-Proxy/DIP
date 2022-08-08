import webpack from 'webpack';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import Static from 'node-static';
import TerserPlugin from 'terser-webpack-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default class Webpack {

	constructor(folder) {
    
		this.webpack = webpack({
			mode: 'none',
			entry: {
				worker: join(__dirname, 'worker', 'index.ts'),
				client: join(__dirname, 'client', 'index.ts'),
        handler: join(__dirname, 'handler', 'index.ts'),
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
          },
        ]
      },
			output: {
				filename: 'dynamic.[name].js',
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