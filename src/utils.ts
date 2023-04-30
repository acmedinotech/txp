import { StringOrGenerator } from './types';

export const escapeHtml = (s: string, flags = 255) => {
	return s
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/&/g, '&amp;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&squot;');
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
