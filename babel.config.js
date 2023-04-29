/**
 * next/babel doesn't play nice with jest! how lucky are we that we have to use different compilers
 * just for testing.
 */
module.exports = {
	env: {
		test: {
			presets: [
				['@babel/preset-env', { targets: { node: 'current' } }],
				'@babel/preset-typescript',
			],
			plugins: [
				[
					'@babel/plugin-transform-runtime',
					{
						regenerator: true,
					},
				],
				'@babel/plugin-proposal-class-properties',
				'@babel/plugin-proposal-export-default-from',
			],
		},
	},
};
