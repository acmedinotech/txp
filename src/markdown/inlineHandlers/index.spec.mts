import { getHandler } from '../../testUtils.mts';

const sampleText = `this is a paragraph. **bold** and _italic_.
paragraph continues on another line.`;
describe('txp / markdown / inlineHandlers', () => {
	describe('class MarkdownDefaultInlineHandler', () => {
		it('handles various bold/italics (***, ___, **, __, *, _)', () => {
			const handler = getHandler(
				`this is a paragraph. **bold** and _italic_.\n***mega***`
			);
			const formatted = handler.flushGetFormattedLines().lines.join('');
			expect(formatted).toContain(
				'this is a paragraph. <strong>bold</strong> and <em>italic</em>. <em><strong>mega</strong></em>'
			);
		});

		it('handles link and image', () => {
			const handler = getHandler(
				`[Link](http://link) and ![Image](http://image)`
			);
			const formatted = handler.flushGetFormattedLines().lines.join('');
			expect(formatted).toContain(
				"<a href='http://link'>Link </a> and <img src='http://image' alt='Image' />"
			);
		});
	});
});
