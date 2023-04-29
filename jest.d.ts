import { Matchers } from 'expect';

declare global {
	namespace jest {
		interface Matchers<R, T = {}> {
			toHaveStartOfLinesMatching(expected: any, matchLength?: boolean): R;
		}
	}
}
