/**
 * Semi-automated git tagging & publish to npm. Run this from *`main`* AFTER release
 * PR is merged (i.e. version number changes)
 */
const readline = require('readline');
const { exec } = require('child_process');

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

const prompt = async (prompt, defaultVal = '') => {
	return new Promise((ok, err) => {
		rl.question(`❓ ${prompt} `, (cmd) => {
			ok(cmd == '' ? defaultVal : cmd);
		});
	});
};

const package = require('./package.json');

(async () => {
	console.log(`🔍 package version: ${package['version']})`);
	const desc = await prompt(`release note (REQUIRED):`);
	if (desc.trim() === '') {
		console.error('❌ release note is required');
		process.exit(1);
	}

	console.log(`⚠️  tag         : v${package['version']}`);
	console.log(`⚠️  release note: ${desc}`);

	const confirm = await prompt(`ready to tag and release? (y/N)`);
	if (confirm.toLowerCase() != 'y') {
		return;
	}

	exec(
		`git tag -a v${package['version']} -m "${desc}" && git push --tags origin && npm publish --access public`,
		(err, stdout, stderr) => {
			console.log(`📺  ${stdout}`);
			console.log(`🪵  ${stderr}`);
			if (err) {
				console.error(`❌`, err);
				process.exit(1);
			}

			console.log(`✅  tagged and pushed!`);
			process.exit(0);
		}
	);
})();
