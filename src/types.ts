export type StringGenerator = (meta: any) => string;
export type StringOrGenerator = string | StringGenerator;

export enum BlockHandlerState {
	/** Indicates that a line can be handled by the handler OR that the handler will accept another line. */
	ACCEPT = 1,
	/** Indicates that a line cannot be handled by the handler. */
	REJECT = 2,
	/** Indicates that the line was successfully consumed and the handler is done. */
	COMPLETE = 3,
	/** Indicates that the line was partially consumed and the handler is done. Any unprocessed bytes are returned. */
	BRANCH = 4,
}

/**
 * Signals the state of the handler after it processes a line.
 */
export type ProcessResult = {
	nextState: BlockHandlerState;
	/**
	 * If `BRANCH` is signaled, this holds the remaining part of line that
	 * goes to the next handler.
	 */
	branchLine?: string;
};

/**
 * Contains the current line being handled along with other metadata.
 * Future uses will include direct access to other handlers and services.
 */
export type LineContext = {
	line: string;
	lineNum: number;
	makeInlineHandler: () => InlineHandler;
	makeParseHandler: () => ParseHandler;
};

/**
 * The transformed text after processing 1+ lines.
 */
export type FormattedLineContext = {
	lines: StringOrGenerator[];
	/**
	 * Optional. Can communicate with parser about related data extracted/generated from block data.
	 * The primary key, by default, should be the handlerId -- the values from this then overwrite
	 * the associated keys for that handlerId:
	 *
	 * ```
	 * {
	 *   'markdown.block.reference': {
	 *     'refId1': {url: '', title: ''}.
	 *     'refId2': {url: '', title: ''}
	 *   }
	 * }
	 * ```
	 *
	 * Other top-level keys and semantics TBD.
	 */
	metadata?: any;
};

/**
 * Text processing handler that runs within a block and is used to process embedded markup.
 */
export interface InlineHandler {
	processLine(ctx: LineContext): ProcessResult;
	flushGetFormattedLines(meta?: any): FormattedLineContext;
	flushGetString(meta?: any): string;
}

export const ISM_MODE_START = 1;
export const ISM_MODE_CONTINUE = 2;
export const ISM_MODE_FLUSH = 9;

/**
 * A stateful function that consumes all tokens from the parent inlineHandler
 * when activated. When a terminating token is reached, the handler must return `false`.
 */
export type InlineStateMachine = (
	token: string,
	/** The inline handler's text buffer. */
	buffer: StringOrGenerator[],
	/** `mode:1` signals opening token. */
	opts: { mode: 1 | 2 | 9 } & Pick<LineContext, 'makeInlineHandler'>
) => boolean;

/**
 * Text processing handler that consumes 1+ related lines to generate a block of text.
 * This includes things like tables, lists, blockquotes, etc.
 */
export interface BlockHandler {
	id(): string;
	/**
	 * Examines start of line to determine if it can handle it.
	 */
	canHandle(ctx: LineContext): BlockHandlerState;
	/**
	 * Consumes 0 or more bytes from the line and signals to the parser what to do next.
	 * @param ctx
	 */
	processLine(ctx: LineContext): ProcessResult;
	/**
	 * Called when current block handler is finished. The handler should reset its state
	 * at this point.
	 * @return The transformed text output.
	 */
	flushGetFormattedLines(meta?: any): FormattedLineContext;
}

export interface ParseHandler {
	parseString(source: string): string;
	getLastParsedMetadata(): any;
}

export const REFERENCE_MAP_KEY = 'markdown.reference';

export type ReferenceValue = { url: string; title?: string };
