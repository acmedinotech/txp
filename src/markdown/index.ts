import {
	CodeHandler,
	DataHandler,
	FallbackHandler,
	HeadingHandler,
	ListHandler,
	BlockquoteHandler,
	TableHandler,
	HorizontalRuleHandler,
	ReferenceHandler,
} from './handlers/index';
import { InlineHandler, ParseHandler } from 'txp/types';
import { GenericParseHandler } from 'txp/core';
import { MarkdownDefaultInlineHandler } from './inlineHandlers/index';

export class MarkdownParseHandler extends GenericParseHandler {
	/**
	 * @todo add optional handler injection (maybe as top, middle, and bottom functions returning BlockHandler[])
	 */
	constructor() {
		super();
		this.defaultHandlers = [
			new DataHandler(),
			new CodeHandler(),
			new HeadingHandler(),
			new ListHandler(),
			new BlockquoteHandler(),
			new TableHandler(),
			new HorizontalRuleHandler(),
			new ReferenceHandler(),
			new FallbackHandler(),
		];
	}

	makeInlineHandler(): InlineHandler {
		return new MarkdownDefaultInlineHandler();
	}

	makeParseHandler(): ParseHandler {
		return new MarkdownParseHandler();
	}
}

/**
 * Singleton with core parsing abilities loaded.
 */
export const parser = new MarkdownParseHandler();
