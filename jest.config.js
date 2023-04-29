/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
	roots: ['<rootDir>/src'],
	setupFilesAfterEnv: ['./jest.d.ts', './jest.extend.js'],
	preset: 'ts-jest',
	testEnvironment: 'node',
	verbose: true,
	transform: {
		'^.+\\.ts$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.jest.json' }],
	},
	moduleNameMapper: {
		'^src/(.*)': '<rootDir>/src/$1',
	},
};
