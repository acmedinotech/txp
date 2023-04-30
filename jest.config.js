/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
	roots: ['<rootDir>/src'],
	setupFilesAfterEnv: ['./jest.d.ts', './jest.extend.js'],
	preset: 'ts-jest',
	testEnvironment: 'node',
	verbose: true,
	testMatch: ['<rootDir>/src/**/*.spec.*ts'],
	moduleFileExtensions: ['mts', 'ts', 'js'],
	transform: {
		'^.+\\.m?ts$': [
			'ts-jest',
			{ tsconfig: '<rootDir>/tsconfig.jest.json' },
		],
	},
	moduleNameMapper: {
		'^txp/(.*)': '<rootDir>/src/$1',
	},
};
