exports.modinfo = {
	name: "custommaploader",
	version: "1.2.1",
	dependencies: [],
	modauthor: "Electric131",
};

exports.patches = [];

const assert = (_) => {
	if (!_) throw new Error(`[custommaploader] Value was expected to be truthy but failed`);
};

var defaultConfig = {
	map: "default",
};
let config = defaultConfig;
const mapsFolder = "./mods/maps";

let lastRequest = 0;
let firstLoad = true;
let reloadConfig = false;
let loadReady = false;
let mapFolder = null;
async function load(ignoreFirstLoad) {
	if (!reloadConfig) return;
	if (!ignoreFirstLoad && !firstLoad) {
		const diff = performance.now() - lastRequest;
		// Resets image loading if the delay since the last request is high enough
		if (diff > 1000) {
			logDebug("[custommaploader] Resetting load data to prep for next request");
			lastRequest = performance.now();
			firstLoad = true;
			loadReady = false;
		}
	}
	return new Promise(async (res, rej) => {
		if (ignoreFirstLoad || firstLoad) {
			log(`[custommaploader] Loading config..`);
			if (!ignoreFirstLoad) firstLoad = false;
			config = await modConfig.get("custommaploader");
			if (Object.keys(config).length == 0) {
				config = defaultConfig;
				log(`[custommaploader] No config found, default config loaded`);
				modConfig.set("custommaploader", config);
			}
			if (!config.map) {
				throw new Error(`[custommaploader] Config key missing, try resetting your config file`);
			}
			if (!fs.existsSync(mapsFolder)) {
				log(`[custommaploader] Creating directory: ${mapsFolder}`);
				fs.mkdirSync(mapsFolder, { recursive: true });
			}
			log(`[custommaploader] Loading map '${config.map}'`);
			mapFolder = `${mapsFolder}/${config.map}`;
			logDebug(`[custommaploader] Current map folder is ${mapFolder}`);
			if (!fs.existsSync(mapFolder) && config.map != "default") {
				config.map = "default";
				mapFolder = `${mapsFolder}/default`; // Shouldn't change anything, but just in case
				logError(
					`[custommaploader] Custom map folder '${mapFolder}' does not exist. Please make sure the map name is correct and the folder exists in ${mapsFolder}. (map has been changed to default)`
				);
			}
			logDebug("[custommaploader] Map folder exists, ready to serve files");
			if (!ignoreFirstLoad) loadReady = true;
			res();
		} else {
			// Wait for the config to be loaded
			const interval = setInterval(() => {
				if (loadReady) {
					clearInterval(interval);
					res();
				}
			}, 10);
		}
	});
}

function mapFileExists(name) {
	if (!mapFolder) return false;
	logDebug(`[custommaploader] Checking if file '${mapFolder}/${name}' exists..`);
	return globalThis.fs.existsSync(globalThis.resolvePathRelativeToExecutable(`${mapFolder}/${name}`));
}

function checkMapsValid() {
	if (globalThis.customMapsValid) return true;
	let valid = true;
	if (config.map != "default") {
		assert(mapFolder);
		valid &= mapFileExists("map_blueprint_playtest.png");
		valid &= mapFileExists("map_blueprint_playtest_authorization.png");
		valid &= mapFileExists("map_blueprint_playtest_lights.png");
		valid &= mapFileExists("map_blueprint_playtest_sensors.png");
		valid &= mapFileExists("fog_playtest.png");
		if (!valid) throw new Error(`[custommaploader] Custom map files are missing from ${mapFolder}. Please make sure to place the custom map files in the correct location.`);
	}
	globalThis.customMapsValid = valid;
}

async function catchFile({ request, baseResponse }) {
	let file;
	try {
		file = request.url.match("/([^/]+).png$")[1]; // Finds only the file name at the end
	} catch {
		throw new Error(`[custommaploader] Error when parsing file name from ${request.url}`);
	}
	reloadConfig = true;
	await load();
	checkMapsValid();
	if (config.map == "default") {
		return {
			body: baseResponse.body,
			contentType: "image/png",
		};
	} else {
		assert(mapFolder);
		logDebug(`[custommaploader] Resolving path for '${mapFolder}/${file}.png'..`);
		const newPath = globalThis.resolvePathRelativeToExecutable(`${mapFolder}/${file}.png`);
		logDebug(`[custommaploader] Path resolved to '${newPath}'`);
		return {
			body: globalThis.fs.readFileSync(newPath).toString("base64"),
			contentType: "image/png",
		};
	}
}

const fileHandler = {
	requiresBaseResponse: true,
	getFinalResponse: catchFile,
};

const defaultMeta = {
	spawn: {
		x: 363,
		y: 200,
	},
	unstuck: {
		x: 161,
		y: 616,
	},
	introSequence: {
		1726: "boostup",
		5000: "endboost",
		5146: "end",
	},
};
exports.api = {
	map_blueprint_playtest: fileHandler,
	fog_playtest: fileHandler,
	map_blueprint_playtest: fileHandler,
	fog_playtest: fileHandler,
	"custommaploader/maps": {
		requiresBaseResponse: false,
		getFinalResponse: async () => {
			logDebug(`[custommaploader] Map list requested from '${mapsFolder}'`);
			const maps = (
				await globalThis.fs.readdirSync(globalThis.resolvePathRelativeToExecutable(mapsFolder), {
					withFileTypes: true,
				})
			)
				.filter((dirent) => dirent.isDirectory())
				.map((dirent) => dirent.name);
			maps.unshift("default");
			logDebug(`[custommaploader] Map list: '${maps.join(", ")}'`);
			const body = Buffer.from(JSON.stringify(maps)).toString("base64");
			return { body, contentType: "application/json" };
		},
	},
	"custommaploader/mapdata": {
		requiresBaseResponse: false,
		getFinalResponse: async () => {
			const tempDefaults = Object.assign({}, defaultMeta);
			let data = tempDefaults;
			await load();
			reloadConfig = false;
			if (config.map != "default") {
				logDebug(`[custommaploader] Map data requested for '${mapFolder}'`);
				if (config.map && mapFolder && mapFileExists("meta.json")) {
					const path = globalThis.resolvePathRelativeToExecutable(`${mapFolder}/meta.json`);
					data = JSON.parse((await globalThis.fs.promises.readFile(path)).toString());
					data = Object.assign(tempDefaults, data);
				}
			}
			const body = Buffer.from(JSON.stringify(data)).toString("base64");
			return { body, contentType: "application/json" };
		},
	},
	"custommaploader/map": {
		requiresBaseResponse: false,
		getFinalResponse: async () => {
			if (!(config && config.map)) throw new Error("Config or map was undefined!");
			let data = config.map || "null";
			logDebug(`[custommaploader] Current map requested; responding: '${data}'`);
			const body = Buffer.from(data).toString("base64");
			return { body, contentType: "application/text" };
		},
	},
};

exports.onMenuLoaded = async function () {
	const maps = await (await fetch("custommaploader/maps")).json();
	const selected = (await modConfig.get("custommaploader")).map;
	if (!selected) {
		await modConfig.set("custommaploader", { map: "default" });
		selected = "default";
	}
	const options = maps.map((name) => {
		if (name == selected) return `<option value="${name}" selected>${name}</option>`;
		return `<option value="${name}">${name}</option>`;
	});

	const selector = document.createElement("div");
	selector.style.position = "absolute";
	selector.style.pointerEvents = "auto";
	selector.style.transform = "translate(-12em, -4em)";
	selector.style.color = "rgb(0,0,0)";
	selector.innerHTML = `
<form class="max-w-sm mx-auto">
	<label for="mapSelector" class="block mb-2 text-base font-medium text-gray-900 dark:text-white">Select Map</label>
	<select id="mapSelector" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" style="max-width: 7rem; width: 7rem">
	${options}
	</select>
</form>`;
	setTimeout(() => {
		const ui = document.querySelector(
			"#ui > div.fixed.inset-0.flex.items-center.justify-center.pointer-events-none.mt-40 > div > div.bg-opacity-25.text-white.flex.flex-col.items-center.justify-center.relative"
		);
		ui.appendChild(selector);
		document.getElementById("mapSelector").addEventListener("change", function () {
			modConfig.set("custommaploader", { map: this.value });
		});
	}, 1000);
};

exports.onGameLoaded = async function () {
	globalThis.CML_map = await (await fetch("custommaploader/map")).text();
};

globalThis.CML_playerSpawnPos = function (constants) {
	console.log(`[custommaploader] Player spawn requested at ${performance.now()}! Is map data ready? ${globalThis.CML_mapData != undefined}`);
	pos = globalThis.CML_mapData.spawn;
	return {
		x: pos.x * constants.cellSize,
		y: pos.y * constants.cellSize,
	};
};

globalThis.CML_playerUnstuck = function (constants) {
	gameInstance.state.store.player.x = globalThis.CML_mapData.unstuck.x * constants.cellSize;
	gameInstance.state.store.player.y = globalThis.CML_mapData.unstuck.y * constants.cellSize;
};

globalThis.CML_landingHelper = function (_) {
	const input = gameInstance.state.session.input;
	const soundEngine = gameInstance.state.session.soundEngine;
	switch (_.instruction) {
		case "boostup":
			if (input.action.boost == false) {
				_.playSound(soundEngine, "boost");
				_.playSound(soundEngine, "boost_overlay");
			}
			input.action.boost = "up";
			break;
		case "boostslow":
			if (input.action.boost == false) {
				_.playSound(soundEngine, "boost");
				_.playSound(soundEngine, "boost_overlay");
			}
			input.action.boost = true;
			break;
		case "endboost":
			_.stopSound(soundEngine, "boost");
			_.stopSound(soundEngine, "boost_overlay");
			input.action.boost = false;
			break;
		case "end":
			_.endCallback();
			break;
	}
};

globalThis.CML_playerLanding = function (playSound, stopSound, endCallback) {
	const elapsedTime = gameInstance.state.store.scene.start + gameInstance.state.store.meta.time;
	if (elapsedTime >= 8000) return endCallback(); // Cut off sequence at 8 seconds as a fallback
	if (!globalThis.CML_mapData) return; // Wait for data to load (hopefully it does..)
	if (!globalThis.CML_landingIndex) globalThis.CML_landingIndex = 0;
	const sequenceLength = Object.keys(globalThis.CML_mapData.introSequence).length;
	if (globalThis.CML_mapData.introSequence && sequenceLength > 0) {
		if (globalThis.CML_landingIndex >= sequenceLength) return endCallback();
		let entry = Object.entries(globalThis.CML_mapData.introSequence)[globalThis.CML_landingIndex];
		if (elapsedTime >= entry[0]) {
			globalThis.CML_landingHelper({
				instruction: entry[1],
				playSound,
				stopSound,
				endCallback,
			});
			globalThis.CML_landingIndex++;
		}
	}
};

exports.patches = [
	{
		type: "regex",
		pattern:
			'case x\\.Intro:.*?if\\((.+?),!e\\.store\\.scene\\.triggers\\[0\\].+?(\\w+)\\(e\\.session\\.soundEngine,"boost"\\).+?(\\w+)\\(e\\.session\\.soundEngine,"boost"\\).+(e\\.store\\.scene\\.active=x\\.Game.+?)}break;case', // Intro timing sequence
		replace: "case x.Intro:$1;globalThis.CML_playerLanding($2, $3, function(){$4});break;case",
		expectedMatches: 1,
	},
	{
		type: "regex",
		pattern: "\\(\\(\\)=>{var e,t,n={8916:", // Very start of bundle.js
		replace: `(fetch("custommaploader/mapdata").then((response)=>response.json().then((data)=>{globalThis.CML_mapData=data;console.log(\`[custommaploader] Map data ready at \$\{performance.now()}\`);})));$&`,
		expectedMatches: 1,
	},
	{
		type: "regex",
		pattern: "\\{x:363\\*e.cellSize,y:200\\*e.cellSize\\}", // World creation - player spawn
		replace: `(globalThis.CML_playerSpawnPos(e))`,
		expectedMatches: 1,
	},
	{
		type: "regex",
		pattern: "t.state.store.player.x=161\\*e.cellSize,t.state.store.player.y=616\\*e.cellSize", // Unstuck button
		replace: `globalThis.CML_playerUnstuck(e)`,
		expectedMatches: 1,
	},
	{
		type: "replace",
		from: '"+"".concat(y,", ").concat(v,", ").concat(x)', // Show x, y of invalid colors during world creation
		to: '"+"".concat(y,", ").concat(v,", ").concat(x) + ` at {x: ${m}, y: ${p}}`',
		expectedMatches: 2,
	},
];
