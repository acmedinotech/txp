import {
	InlineStateMachine,
	ISM_MODE_FLUSH,
	ISM_MODE_START,
	LineContext,
	ReferenceValue,
	REFERENCE_MAP_KEY,
	StringOrGenerator,
} from '../../types';
import { escapeHtml } from '../../utils';

const label_open = 0;
const label_get = 1;
const label_closed = 2;
const link_get = 3;
const title_space = 4;
const title_get = 5;
const title_closed = 6;
const link_closed = 7;
const ref_get = 8;
const ref_closed = 9;

/**
 * Handles inline links and images in the following format:
 *
 * - `[label][ref-id]`
 * - `[label](url)`, `[label](url "title")`
 * - `![alt](url)`, `![alt](url "alt2")` (note that "alt2" is redudant but still supported)
 *
 * All attributes are HTML-encoded -- it is up to use to provide properly encoded URLs.
 *
 * @todo support `[label][refId]` (requires collecting/passing metadata)
 */
export const getLinkImageStateMachine = (): InlineStateMachine => {
	let type = 'l'; // l: link, i: image
	let depth = 0; // if 1, signals embedded image
	let state = 0;
	let label = '';
	let link = '';
	let title = '';
	let embeddedImageBuff = '';
	// helps with single char token and embedding if we encounter `!` immediately after `[`
	let mightBeImage = false;

	let _makeInlineHandler: LineContext['makeInlineHandler'] | undefined;

	/**
	 * Resets values to go back to link processing.
	 */
	const popToLink = () => {
		type = 'l';
		state = label_get;
		label = '';
		link = '';
		title = '';
	};

	const reset = () => {
		depth = 0;
		type = 'l';
		state = link_closed;
		label = '';
		title = '';
		link = '';
	};

	const closeOut = (buff: StringOrGenerator[], endToken = '') => {
		if (type == 'l') {
			if (state === ref_closed) {
				const refId = link;
				buff.push((meta) => {
					const ref = meta[REFERENCE_MAP_KEY]?.[
						refId
					] as ReferenceValue;
					if (!ref) {
						return `<a href='#${escapeHtml(refId)}'>${label}</a>`;
					}
					let _titleAtt = '';
					if (ref.title) {
						_titleAtt = ` title='${escapeHtml(ref.title)}'`;
					}
					return `<a href='${escapeHtml(
						ref.url
					)}'${_titleAtt}>${label}</a>`;
				});
				reset();
				return false;
			}

			let fmtText = label;
			if (embeddedImageBuff) {
				// we ignore text formatting completely since we received an embedded image
				fmtText = embeddedImageBuff;
				embeddedImageBuff = '';
			} else if (_makeInlineHandler) {
				// we apply formatting if the inline handler generator is set
				const handler = _makeInlineHandler();
				handler.processLine({
					line: label,
					lineNum: 0,
					makeInlineHandler: _makeInlineHandler,
				} as any);
				fmtText = handler.flushGetString();
			}
			buff.push(
				`<a href='${escapeHtml(link)}'`,
				title ? ` title='${escapeHtml(title)}'>` : '>',
				fmtText,
				'</a>',
				endToken
			);
		} else {
			const _img = `<img src='${escapeHtml(link)}' alt='${escapeHtml(
				title || label
			)}' />${endToken}`;
			if (depth === 1) {
				// embedded image -- go back to link processing
				embeddedImageBuff = _img;
				depth--;
				popToLink();
				return true;
			} else {
				buff.push(_img);
			}
		}

		_makeInlineHandler = undefined;
		reset();
		return false;
	};

	const errOut = (buff: StringOrGenerator[], t: string) => {
		closeOut(buff, t);
	};

	return (t, buff, { mode, makeInlineHandler }) => {
		if (mode === ISM_MODE_START) {
			_makeInlineHandler = makeInlineHandler;
			if (t == '![') {
				type = 'i';
			}
			state = label_get;
			return true;
		}

		if (mode === ISM_MODE_FLUSH) {
			if (state != link_closed) {
				closeOut(buff);
			}
			return false;
		}

		if (state == label_get) {
			// we either expect `![` (which moves us into image proc) or anything up to `]`
			if (t === '!' && !label) {
				mightBeImage = true;
			} else if (mightBeImage) {
				if (t === '[') {
					depth++;
					type = 'i';
				} else {
					label += '!' + t;
				}
				mightBeImage = false;
			} else if (t === '![') {
				depth++;
				type = 'i';
			} else if (t === ']') {
				state = label_closed;
			} else {
				label += t;
			}
		} else if (state == label_closed) {
			if (type === 'l' && t === '[') {
				state = ref_get;
			} else if (t === '(') {
				state = link_get;
			}
		} else if (state == ref_get) {
			if (t === ']') {
				state = ref_closed;
				return closeOut(buff);
			} else {
				link += t;
			}
		} else if (state == link_get) {
			if (t === ')') {
				return closeOut(buff);
			} else {
				if (t == ' ' && link) {
					state = title_space;
				} else if (t == '"') {
					return false;
				} else if (t != ' ') {
					link += t;
				}
			}
		} else if (state == title_space) {
			if (t == ' ') {
			} else if (t == '"') {
				state = title_get;
			} else if (t == ')') {
				return closeOut(buff);
			} else {
				errOut(buff, t);
				return false;
			}
		} else if (state == title_get) {
			if (t == '"') {
				state = title_closed;
			} else {
				title += t;
			}
		} else if (title_closed) {
			if (t == ' ') {
				return true;
			} else if (t == ')') {
				return closeOut(buff);
			} else {
				errOut(buff, t);
				return false;
			}
		}

		return true;
	};
};

/**
 * Handles inline links in the following format:
 *
 * - `<anything except end bracket>` (e.g. `<http://...>`, `<mailto:...>`)
 *
 * All attributes are HTML-encoded -- it is up to use to provide properly encoded URLs.
 */
export const getLinkBracketHandler = (): InlineStateMachine => {
	let url = '';
	let _makeInlineHandler: LineContext['makeInlineHandler'] | undefined;

	const closeOut = (buff: StringOrGenerator[], endToken = '') => {
		if (url) {
			buff.push(`<a href='${escapeHtml(url)}'>${url}</a>`);
			_makeInlineHandler = undefined;
			url = '';
		}
	};

	return (t, buff, { mode, makeInlineHandler }) => {
		if (mode === ISM_MODE_START) {
			if (t === '<') {
				_makeInlineHandler = makeInlineHandler;
				return true;
			}
			return false;
		} else if (mode === ISM_MODE_FLUSH) {
			closeOut(buff);
			return false;
		} else if (t === '>') {
			closeOut(buff);
			return false;
		}

		url += t;
		return true;
	};
};
