import { parser } from './index.mts';

const sampleMarkdown = `---
data block
---
h1. Headline 1
## Headline 2
###### Headline 6

---

this is a paragraph. **bold** and _italic_.
paragraph continues on another line.
`;

describe('txp / markdown', () => {
	it('handles escaping characters', () => {
		const formatted = parser.parseString(`\\<http://\\>`);
		// console.log(formatted.trim());
		expect(formatted).toHaveStartOfLinesMatching(`<p><http://> </p>`);
	});
	it('invokes HeadingHandler, HorizontalRuleHandler, DefaultHandler', () => {
		const formatted = parser.parseString(sampleMarkdown);
		// console.log(formatted.trim());
		expect(formatted).toHaveStartOfLinesMatching(`<h1>Headline 1 </h1>
<h2>Headline 2 </h2>
<h6>Headline 6 </h6>

<hr />

<p>this is a paragraph. <strong>bold</strong> and <em>italic</em>. paragraph continues on another line. </p>`);
	});

	it('invokes CodeHandler', () => {
		const formatted = parser.parseString(`\`\`\`html
<html></html>
\`\`\`

    spaced
\t
    spaced:2

\t\ttabbed
\t\t
\t\ttabbed:3`);
		// console.log(formatted);
		expect(formatted)
			.toHaveStartOfLinesMatching(`<pre><code class='language-html'>&lt;html&gt;&lt;/html&gt;</code></pre>

<pre><code class='language-text'>spaced</code></pre>

<pre><code class='language-text'>spaced:2</code></pre>

<pre><code class='language-text'>tabbed

tabbed:3</code></pre>`);
	});

	it('invokes ReferenceHandler and inserts references', () => {
		const formatted = parser.parseString(`
this is a paragraph [link 1][ref-1]. [link 2][ref-2] <http://bracket>

[ref-1]: <http://link1>
[ref-2]: <http://link2> "title"`);
		// console.log(formatted);
		expect(formatted.trim()).toEqual(
			`<p>this is a paragraph <a href='http://link1'></a>. <a href='http://link2' title='title'></a> <a href='http://bracket'>http://bracket</a> </p>`
		);
	});

	it('handles list with continuations', () => {
		// indent continuations with 4 spaces
		const formatted = parser.parseString(`- combo 1
   
   | dumbbell press | 2 x 15 x 15lb
   | dumbbell lateral raise | 2 x 15 x 5lb
   | dumbbell twists, sitting | 2 x 15 x 15lb
- combo 2
    
    > block quote

- misc crunches
- wrist curls`);
		// console.log(formatted, '\n', JSON.stringify(formatted));
		expect(formatted.trim()).toHaveStartOfLinesMatching(`<ul>
<li><p>combo 1 </p>
<table>
<tbody>
<tr className='table-row-0'><td className='table-col-0' align='undefined'>dumbbell press </td><td className='table-col-1' align='undefined'>2 x 15 x 15lb </td></tr>
<tr className='table-row-1'><td className='table-col-0' align='undefined'>dumbbell lateral raise </td><td className='table-col-1' align='undefined'>2 x 15 x 5lb </td></tr>
<tr className='table-row-2'><td className='table-col-0' align='undefined'>dumbbell twists, sitting </td><td className='table-col-1' align='undefined'>2 x 15 x 15lb </td></tr>
</tbody>
</table></li>
<li><p>combo 2 </p>
<blockquote>
<p>block quote </p>
</blockquote></li>
</ul>

<ul>
<li><p>misc crunches </p></li>
<li><p>wrist curls </p></li>
</ul>`);
	});
});
