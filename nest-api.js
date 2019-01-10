/* eslint no-console: 0 */

const fs = require('fs');
const request = require('request-promise-native');
let configPath, config, session;


function login (path) {
	configPath = path;
	config = require(configPath);
	return request
		.post('https://home.nest.com:443/user/login', { form: config, json: true })
		.then(data => {
			if (data.error) console.error('Error authenticating: ' + data.error + ' (' + data.error_description + ')');
			else session = data;
		});
}


function read () {
	const headers = {
		'X-nl-user-id': session.userid,
		'X-nl-protocol-version': '1',
		Authorization: 'Basic ' + session.access_token,
	};
	return request
		.get(`${session.urls.transport_url}/v2/mobile/${session.user}`, { json: true, headers })
		.then(parseData);
}


function set (temp) {
	if (!config.deviceId) return console.error('Run without parameters first (at least once).');
	const headers = {
		'X-nl-user-id': session.userid,
		'X-nl-protocol-version': '1',
		Authorization: 'Basic ' + session.access_token,
	};
	const body = {target_change_pending:true, target_temperature: parseFloat(temp)};
	return request.post(`${session.urls.transport_url}/v2/put/shared.${config.deviceId}`, { json: true, headers, body });
}


function parseData (res) {
	// console.log(res);
	const deviceId = Object.keys(res.device)[0];
	config.deviceId = deviceId;
	fs.writeFileSync(configPath, JSON.stringify(config, null, '\t'), 'utf8');

	const device = res.device[deviceId];
	const unit = device.temperature_scale;
	const heatingWater = device.hot_water_active;
	const humidity = device.current_humidity;
	const ip = device.local_ip;

	const shared = res.shared[deviceId];
	const name = shared.name;
	const temp = shared.current_temperature;
	const target = shared.target_temperature;
	const isHeating = shared.hvac_heater_state;

	const structId = Object.keys(res.structure)[0];
	const struct = res.structure[structId];
	const home = struct.name;

	const diag = res.diagnostics[deviceId];
	const weather = diag.cycle_features.head_unit_intervals.pop().weather;

	return {
		deviceId,
		name,
		home,
		unit,
		heatingWater,
		humidity,
		ip,
		temp,
		target,
		isHeating,
		weather,
	};
}



module.exports = {
	login,
	read,
	set,
};


