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
} from './handlers/index.mts';
import { InlineHandler, ParseHandler } from 'txp/types.mts';
import { GenericParseHandler } from 'txp/core.mts';
import { MarkdownDefaultInlineHandler } from './inlineHandlers/index.mts';

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
