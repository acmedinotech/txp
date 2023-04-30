import {
	BlockHandlerState,
	FormattedLineContext,
	LineContext,
	REFERENCE_MAP_KEY,
} from 'txp/types.mts';
import { AbstractBlockHandler } from './AbstractBlockHandler.mts';

export const REFERENCE_HANDLER_ID = 'markdown.block.reference';

export class ReferenceHandler extends AbstractBlockHandler {
	_id = REFERENCE_HANDLER_ID;

	canHandle({ line, lineNum }: LineContext) {
		if (line.match(/^\[[\w-]+\]: </)) {
			return BlockHandlerState.ACCEPT;
		}
		return BlockHandlerState.REJECT;
	}

	processLine({ line, lineNum, makeInlineHandler }: LineContext) {
		const [, refId, url, title] =
			line.match(/^\[([\w-]+)\]: <([^>]+)>(.*)?/) ?? [];

		if (refId === undefined) {
			// @todo: return reject (currently causes infinite loop)
			return this.makeComplete();
		}

		let ntitle = title;
		if (title) {
			ntitle = title.trim();
			if (ntitle[0] === '"') {
				ntitle = ntitle.substring(1);
			}
			if (ntitle[ntitle.length - 1] === '"') {
				ntitle = ntitle.substring(0, ntitle.length - 1);
			}
		}

		this.meta[refId] = { url, title: ntitle };
		return this.makeAccept();
	}

	flushGetFormattedLines(): FormattedLineContext {
		const ret = {
			lines: [],
			metadata: { [REFERENCE_MAP_KEY]: { ...this.meta } },
		};
		this.meta = {};
		return ret;
	}
}
