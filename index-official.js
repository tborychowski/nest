#!/usr/bin/env node

const fs = require('fs');
const request = require('request-promise-native');
const cfg = require('./config.json');


function saveConfig () {
	fs.writeFileSync('config.json', JSON.stringify(cfg, null, '\t'));
}

function req ({ url, method = 'get', body }) {
	const opts = { json: true, followAllRedirects: true, headers: { Authorization: cfg.token } };
	if (body) opts.body = body;
	return request[method](url, opts);
}

function login () {
	if (cfg.token) return Promise.resolve();
	const form = cfg.auth;
	return request.post('https://api.home.nest.com/oauth2/access_token', {form, json: true })
		.then(res => {
			cfg.token = 'Bearer ' + res.access_token;
			saveConfig();
		});
}



function get () {
	return req({ url: 'https://developer-api.nest.com' })
		.then(res => {
			// console.log(res);
			const id = Object.keys(res.devices.thermostats)[0];
			const data = res.devices.thermostats[id];
			cfg.id = id;
			saveConfig();
			return {
				humidity: data.humidity,
				temp: data.ambient_temperature_c,
				target: data.target_temperature_c,
				state: data.hvac_state,
			};
		});
}


function set (temp = 19) {
	const url = `https://developer-api.nest.com/devices/thermostats/${cfg.id}`;
	return req({ method: 'put', url, body: {target_temperature_c: temp} });
}


function log (res) {
	console.log(res);
}


// login().then(get).then(log);
login().then(set).then(get).then(log).catch(e => console.error(e));
