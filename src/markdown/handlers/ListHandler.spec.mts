import { getFormattedStringWithHandler } from '../../testUtils.mts';
import { ListHandler } from './ListHandler.mts';

const listBasic = `* **one**
- _two_
+ three
1.  order-1
    - order-1.unordered-2`;

const s = '  ';
const listContinuation = `- list item
- list item 2
${s}paragraph continues
${s}
${s}new paragraph under 'list item'
${s}
${s}\t\tcode
- list item 3`;
describe('txp / markdown / handlers / class ListHandler', () => {
	it('it parses unordered list items, including nesting and inline formatting', () => {
		const handler = new ListHandler();
		const formatted = getFormattedStringWithHandler(listBasic, handler);
		// console.log(formatted, '\n', JSON.stringify(formatted));
		expect(formatted).toHaveStartOfLinesMatching(`<ul>
<li><p><strong>one</strong> </p></li>
<li><p><em>two</em> </p></li>
<li><p>three </p></li>
  <ol>
  <li><p>order-1 </p></li>
    <ul>
    <li><p>order-1.unordered-2 </p></li>
    </ul>
  </ol>
</ul>`);
	});

	it('it parses continued lines as a subdoc', () => {
		const handler = new ListHandler();
		const formatted = getFormattedStringWithHandler(
			listContinuation,
			handler
		);
		// console.log(formatted, '\n', JSON.stringify(formatted));
		expect(formatted).toHaveStartOfLinesMatching(`<ul>
<li><p>list item </p></li>
<li><p>list item 2 paragraph continues </p>
<p>new paragraph under 'list item' </p>
<pre><code class='language-text'>code</code></pre></li>
<li><p>list item 3 </p></li>
</ul>`);
	});
});
