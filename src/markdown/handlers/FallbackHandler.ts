import { convertFmtListToString } from '../../utils';
import {
	BlockHandlerState,
	FormattedLineContext,
	LineContext,
	ProcessResult,
	StringOrGenerator,
} from '../../types';
import { AbstractBlockHandler } from './AbstractBlockHandler';

/**
 * Standard handler for generic block of text. Applies 1 special rule:
 *
 * - if there are only two lines and the 2nd line is `===+` or `---+`, convert to <h1 /> or <h2 />
 */
export class FallbackHandler extends AbstractBlockHandler {
	_id = 'markdown.block.default';
	canHandle({ line, lineNum }: LineContext) {
		if (line.match(/[^\s]/)) {
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
		if (line.trim() === '') {
			return this.makeComplete();
		}

		this._lines.push(line);
		return this.makeAccept();
	}

	flushGetFormattedLines(meta?: any): FormattedLineContext {
		const ret: StringOrGenerator[] = [];
		if (this._lines.length === 2) {
			if (this._lines[1].match(/^(==+|--+)$/)) {
				const tag = this._lines[1][1] === '=' ? 'h1' : 'h2';
				this.inline.processLine({
					line: this._lines[0],
					lineNum: -1,
				} as any);
				const fmtLines = this.inline.flushGetFormattedLines().lines;
				ret.push(
					(meta) =>
						`<${tag}>${convertFmtListToString(
							fmtLines,
							meta,
							''
						)}</${tag}>`
				);
				return { lines: ret };
			}
		}

		this.inline.processLine({
			line: this._lines.join(' ').trim(),
			lineNum: -1,
		} as any);
		const fmtLines = this.inline.flushGetFormattedLines().lines;
		ret.push(
			(meta) => `<p>${convertFmtListToString(fmtLines, meta, '')}</p>`
		);

		this._lines = [];
		return {
			lines: ret,
		};
	}
}
