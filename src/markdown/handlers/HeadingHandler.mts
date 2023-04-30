import {
	BlockHandlerState,
	FormattedLineContext,
	LineContext,
} from 'txp/types.mts';
import { AbstractBlockHandler } from './AbstractBlockHandler.mts';

/**
 * Handles block headings:
 *
 * ```markdown
 * h1. Headline 1 thru
 * h6. Headline 6
 * # Headline 1 thru
 * ###### Headline 6
 * ```
 */
export class HeadingHandler extends AbstractBlockHandler {
	_id = 'markdown.block.heading';
	canHandle({ line, lineNum }: LineContext) {
		if (line.match(/^h[1-6]\.\s/) || line.match(/^#{1,6} (.+)/)) {
			return BlockHandlerState.ACCEPT;
		}
		return BlockHandlerState.REJECT;
	}

	processLine({
		line,
		lineNum,
		makeInlineHandler,
		makeParseHandler,
	}: LineContext) {
		let hlevel = '',
			htext = '';
		if (line[0] === '#') {
			const [, ast, txt] = line.match(/^(#+) (.+)/) ?? [];
			hlevel = ast.length + '';
			htext = txt;
		} else {
			[, hlevel, htext] = line.match(/^h([1-6])\. (.+)$/) ?? [];
		}

		this.inline.processLine({
			line: htext,
			lineNum,
			makeInlineHandler,
			makeParseHandler,
		});
		this._lines.push(
			`<h${hlevel}>${this.inline.flushGetString()}</h${hlevel}>`
		);

		return this.makeComplete();
	}

	flushGetFormattedLines(): FormattedLineContext {
		const ret = this._lines;
		this._lines = [];
		return {
			lines: ret,
		};
	}
}
