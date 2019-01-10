#!/usr/bin/env node
/* eslint no-console: 0 */
const Args = require('arg-parser');
const chalk = require('chalk');
const nest = require('./nest-api');

function write (res) {
	const current = Math.round(res.temp * 100) / 100;
	const target = Math.round(res.target * 100) / 100;
	const ip = chalk.grey(`(${res.ip})`);
	const tempArrow = res.temp < res.target ? chalk.yellow('↗') : chalk.green('↘');
	const temp = `${current}°${res.unit} ${tempArrow} ${target}°${res.unit}`;

	const heating = res.isHeating ? chalk.yellow('on') : chalk.green('off');
	const water = res.heatingWater ? chalk.yellow('on') : chalk.green('off');

	console.log(`\n${chalk.cyan(res.home)}, ${chalk.cyan(res.name)} ${ip}`);
	console.log(' ' + temp);
	console.log(' 🌡  ' + heating);
	console.log(' 💧 ' + water);
}


function run (params) {
	let client = nest.login(__dirname + '/config.json');
	if (params.temp) client = client.then(() => nest.set(params.temp));
	client
		.then(nest.read)
		.then(write)
		.catch(e => console.error(chalk.red(e)));
}



const args = new Args('Nest cli-ent', '1.0', 'Read & write Nest temperature');
args.add({ name: 'temp', desc: 'Temperature in degrees C' });

if (args.parse()) run(args.params);
