import {
	BlockHandlerState,
	FormattedLineContext,
	LineContext,
} from 'txp/types';
import { AbstractBlockHandler } from './AbstractBlockHandler';

/**
 * Handles table syntax:
 *
 * ```markdown
 * |simple|table|
 * |table||
 *
 * |header - aligned center|row - right|default left
 * | :---: |---:| ---|
 * |col 1.1|col 2.2|col 3.3|
 * ```
 *
 * `<thead/>` and `<tbody/>` are part of output, and the rows and cells are decorated as follows:
 *
 * - `<tr className='table-row-$rowIndex'>` and `<td className='table-col-$colIndex'>`
 * - `<tr className='table-row-heading'>` and <th className='table-heading-$colIndex'>`
 */
export class TableHandler extends AbstractBlockHandler {
	_id = 'markdown.block.table';
	row = -1;
	rowData: { isHead?: boolean; cols: string[] }[] = [];
	colAlign: string[] = [];

	canHandle({ line, lineNum }: LineContext) {
		if (line.match(/^\s*\|/)) {
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
		if (!line.match(/^\s*\|/)) {
			return this.makeReject();
		}

		// remove empty col if line ends with '|' -- this puts its on user to ensure they denote an empty ending col as `||` and not `|`
		const tline = line.trim();
		const [, ...cols] = line.trim().split('|');
		if (tline.endsWith('|')) {
			cols.pop();
		}

		// set first row as header
		if (cols[0].trim().match(/^:?---/) && this.rowData.length === 1) {
			this.rowData[0].isHead = true;
			this.colAlign = cols.map((c) => {
				const nc = c.trim();
				if (nc[0] === ':' && nc[nc.length - 1] === ':') {
					return 'center';
				} else if (nc[nc.length - 1] === ':') {
					return 'right';
				}
				return 'left';
			});
		} else {
			const handler = makeInlineHandler();
			this.rowData.push({
				cols: cols.map((val) => {
					handler.processLine({
						line: val.trim(),
						lineNum,
						makeInlineHandler,
						makeParseHandler,
					});
					return handler.flushGetFormattedLines().lines.join('');
				}),
			});
		}

		return this.makeAccept();
	}

	flushGetFormattedLines(): FormattedLineContext {
		// @todo: backfill missing columns
		const head: string[] = [];
		const frow = this.rowData[0];
		if (frow?.isHead) {
			this.rowData.shift();
			head.push(
				[
					"<thead><tr className='table-row-heading'>",
					...frow.cols.map(
						(c, cidx) =>
							`<th className='table-heading-${cidx}' align='${this.colAlign[cidx]}'>${c}</th>`
					),
					'</tr></thead>',
				].join('')
			);
		}
		return {
			lines: [
				'<table>',
				...head,
				'<tbody>',
				...this.rowData.map(
					({ isHead, cols }, ridx) =>
						`<tr className='table-row-${ridx}'>${cols
							.map(
								(c, cidx) =>
									`<td className='table-col-${cidx}' align='${this.colAlign[cidx]}'>${c}</td>`
							)
							.join('')}</tr>`
				),
				'</tbody>',
				'</table>',
			],
		};
	}
}
