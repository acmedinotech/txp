import { CodeHandler } from './CodeHandler.mts';
import { getFormattedStringWithHandler } from '../../testUtils.mts';

describe('txp / markdown / handlers / class CodeHandler', () => {
	it('it parses backticks', () => {
		const handler = new CodeHandler();
		const formatted = getFormattedStringWithHandler(
			'```html\n<html></html>\n```',
			handler
		);
		expect(formatted).toEqual(
			`<pre><code class='language-html'>&lt;html&gt;&lt;/html&gt;</code></pre>`
		);
	});
	it('it parses indent with space (followed by mix)', () => {
		const handler = new CodeHandler();
		const formatted = getFormattedStringWithHandler(
			'    \n    <html></html>\n\t\tmore',
			handler
		);
		expect(formatted).toEqual(
			`<pre><code class='language-text'>\n&lt;html&gt;&lt;/html&gt;\nmore</code></pre>`
		);
	});
	it('it parses indent with tab (followed by mix)', () => {
		const handler = new CodeHandler();
		const formatted = getFormattedStringWithHandler(
			'\t\t\n\t\t<html></html>\n    more',
			handler
		);
		expect(formatted).toEqual(
			`<pre><code class='language-text'>\n&lt;html&gt;&lt;/html&gt;\nmore</code></pre>`
		);
	});
});
