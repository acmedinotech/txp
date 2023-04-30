import { getFormattedStringWithHandler } from '../../testUtils';
import { BlockquoteHandler } from './BlockquoteHandler';

describe('txp / markdown / handlers / class BlockquoteHandler', () => {
	it('it parses basic blockquote', () => {
		const handler = new BlockquoteHandler();
		const formatted = getFormattedStringWithHandler(
			`> blockquote here\n> goes to second line`,
			handler
		);
		// console.log(formatted);
		expect(formatted).toHaveStartOfLinesMatching(
			`<blockquote>
<p> blockquote here  goes to second line </p>
</blockquote>`
		);
	});

	it.only('it parses nested blockquote', () => {
		const handler = new BlockquoteHandler();
		const formatted = getFormattedStringWithHandler(
			`> blockquote here\n>\n> > goes to second line`,
			handler
		);
		// console.log(formatted);
		expect(formatted).toHaveStartOfLinesMatching(
			`<blockquote>
<p>blockquote here </p>
<blockquote>
<p>goes to second line </p>
</blockquote>
</blockquote>`
		);
	});
});
