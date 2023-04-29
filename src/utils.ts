import { StringOrGenerator } from './types';

export const escapeHtml = (s: string, flags = 255) => {
	return s
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('&', '&amp;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&squot;');
};

export const convertFmtListToString = (
	lines: StringOrGenerator[],
	meta: any = {},
	join = '\n'
): string => {
	return lines
		.map((v) => {
			if (typeof v === 'function') {
				return v(meta);
			}
			return v;
		})
		.join(join);
};
