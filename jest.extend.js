expect.extend({
	/**
	 * Does line-by comparison of actual and expected, trimming the end of line before
	 * comparing. By default:
	 *
	 * - all lines in expected must match corresponding lines in actual
	 * - line lengths must be equal
	 *   - if `matchLengths` is false, asserts expected.length <= actual.length
	 *
	 * @param {string} actual
	 * @param {string} expected
	 * @param {boolean} matchLengths If false, expected.length < actual.length will not trigger error
	 */
	toHaveStartOfLinesMatching: (actual, expected, matchLengths = true) => {
		if (typeof actual !== 'string') {
			throw new Error('actual value not string');
		}
		if (typeof expected !== 'string') {
			throw new Error('expected value not string');
		}
		const a = actual.split('\n').map((l) => l.trimEnd()),
			e = expected.split('\n').map((l) => l.trimEnd());
		for (let i = 0; i < a.length; i++) {
			if (a[i] != e[i]) {
				throw new Error(
					`actual[${i}]<${JSON.stringify(
						a[i]
					)}> does not match expected[${i}]<${JSON.stringify(e[i])}>`
				);
			}
		}

		if (a.length != e.length) {
			if (e.length > a.length) {
				throw new Error(
					`actual is missing ${e.length - a.length} lines`
				);
			} else if (matchLengths) {
				throw new Error(
					`expected is missing ${a.length - e.length} lines`
				);
			}
		}

		return { pass: true };
	},
});
