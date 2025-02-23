exports.modinfo = {
	name: "custommaploader",
	version: "2.0.0",
	dependencies: [],
	modauthor: "Electric131",
};

const mapsFolder = "./mods/maps";

// The base map data for every map
const mapDataTemplate = {
	valid: true,
	name: "default",
	folderRelative: null,
	folder: null,
	scale: 1,
	rawScale: 1,
	width: 1280,
	images: {},
	meta: {
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
		parallaxOffset: 0,
		yLimit: {
			hard: 550,
			soft: 600,
		},
		fog: {
			startY: 2400,
			endY: 4200,
			max: 1200,
			min: 200,
		},
	},
};

let mapData;
let inMenu = true;
// Returns true if loading succeeded, falsey if not (If no map is provided)
// Otherwise, returns temp data
async function loadMap(mapName) {
	const mapNameProvided = mapName != undefined;
	function loadingError(message) {
		logError(`[custommaploader] ${message}`);
		if (!mapNameProvided) {
			mapData = {
				valid: false,
				error: message,
			};
			return false;
		}
		return {
			valid: false,
			error: message,
		};
	}

	if (!mapName) {
		log(`[custommaploader] Loading config..`);
		let config = await modConfig.get("custommaploader");
		if (!config.map) {
			config = { map: "default" };
			log(`[custommaploader] Config map missing, default config loaded`);
			modConfig.set("custommaploader", config);
		}
		if (!fs.existsSync(mapsFolder)) {
			log(`[custommaploader] Creating directory: ${mapsFolder}`);
			fs.mkdirSync(mapsFolder, { recursive: true });
		}
		mapName = config.map;
	}
	log(`[custommaploader] Loading map '${mapName}'`);
	let mapFolder = `${mapsFolder}/${mapName}`;
	logDebug(`[custommaploader] Current map folder is ${mapFolder}`);
	if (!fs.existsSync(mapFolder) && mapName != "default") {
		return loadingError(`Custom map folder '${mapFolder}' does not exist. Please make sure the map name is correct and the folder exists in ${mapsFolder}.`);
	}
	logDebug("[custommaploader] Setting up temporary map data..");
	tempData = JSON.parse(JSON.stringify(mapDataTemplate));
	Object.assign(tempData, {
		name: mapName,
		folderRelative: mapFolder,
		folder: globalThis.resolvePathRelativeToExecutable(mapFolder),
		meta: {},
	});
	if (mapName != "default") {
		let fileError;
		const mapFiles = [
			"map_blueprint_playtest.png",
			"map_blueprint_playtest_authorization.png",
			"map_blueprint_playtest_lights.png",
			"map_blueprint_playtest_sensors.png",
			"fog_playtest.png",
			"meta.json",
		];
		for (const file of mapFiles) {
			logDebug(`[custommaploader] Checking if file '${tempData.folderRelative}/${file}' exists..`);
			const exists = globalThis.fs.existsSync(`${tempData.folder}/${file}`);
			if (!exists) {
				if (file == "meta.json") continue;
				return loadingError(`Custom map files are missing from ${mapFolder}. Please make sure to place the custom map files in the correct location.`);
			}
			let data = globalThis.fs.readFileSync(`${tempData.folderRelative}/${file}`);
			switch (file) {
				case "meta.json":
					data = JSON.parse(data.toString());
					// List of paths that must be entirely defined if present (no sub-property can use the defaults)
					const skipDefaults = ["meta.introSequence"];
					const fail = recursiveMetaCheck(tempData.meta, data, mapDataTemplate.meta);
					if (fail) {
						fileError = loadingError(fail);
					}
					function recursiveMetaCheck(modified, data, defaults, path = ["meta"]) {
						for (const key of Object.keys(defaults)) {
							if (data[key]) {
								let localPath = path.concat(key);
								const pathString = localPath.join(".");
								if (typeof data[key] != typeof defaults[key]) {
									return `Value at meta path '${pathString}' does not match the expected type.`;
								}
								if (typeof data[key] == "object") {
									if (skipDefaults.includes(pathString)) {
										modified[key] = data[key];
										continue;
									}
									modified[key] = {};
									let fail = recursiveMetaCheck(modified[key], data[key], defaults[key], localPath);
									if (fail) return fail;
								} else {
									modified[key] = data[key];
								}
							} else {
								modified[key] = JSON.parse(JSON.stringify(defaults[key]));
							}
						}
						return;
					}
					break;
				default: // Default case is for images
					const width = data.readUInt32BE(16);
					const height = data.readUInt32BE(20);
					if (width != height) {
						return loadingError(`Width and height are not the same for custom map image '${tempData.folderRelative}/${file}'`);
					}
					tempData.images[file] = {
						width,
						height,
					};
					break;
			}
			if (fileError != undefined) return fileError;
		}
		if (fileError != undefined) return fileError;
	} else {
		log("[custommaploader] Using default map data..");
		// Yes, I'm forcing meta settings for specifically the default map.. I'm bad :(
		// I wanted to avoid this, but I prefer custom maps have different defaults while keeping the default map the same
		tempData.meta = JSON.parse(JSON.stringify(mapDataTemplate.meta));
		tempData.meta = Object.assign(tempData.meta, {
			fog: {
				startY: 3400,
				endY: 4200,
				max: 700,
				min: 200,
			},
		});
		tempData.folder = null;
		tempData.folderRelative = null;
	}
	if (tempData.images["map_blueprint_playtest.png"]) {
		tempData.width = tempData.images["map_blueprint_playtest.png"].width;
		for (const image of Object.keys(tempData.images)) {
			if (tempData.images[image].width != tempData.width && image != "fog_playtest.png") {
				return loadingError(`Image dimension mismatch: '${mapFolder}' is not the same width or height as main image.`);
			}
		}
		tempData.rawScale = tempData.width / 1280; // Map width divided by default map width
		tempData.scale = Math.round(tempData.rawScale * 10) / 10;
	}
	log("[custommaploader] Map loading completed; ready to serve files");
	if (!mapNameProvided) {
		mapData = tempData;
		return true;
	}
	return tempData;
}

function catchFile({ request }) {
	if (inMenu) return false;
	if (!mapData) throw new Error("[custommaploader] Map data was not ready when image was requested.");
	if (!mapData.valid) return false;
	let file;
	logDebug(`[custommaploader] Parsing image url '${request.url}'`);
	try {
		file = request.url.match("/([^/]+).png$")[1]; // Finds only the file name at the end
	} catch {
		throw new Error(`[custommaploader] Error when parsing file name from '${request.url}'`);
	}
	if (mapData.name == "default") {
		return false;
	} else {
		logDebug(`[custommaploader] Resolving path for '${mapData.folderRelative}/${file}.png'..`);
		const newPath = `${mapData.folder}/${file}.png`;
		logDebug(`[custommaploader] Path resolved to '${newPath}'`);
		const data = globalThis.fs.readFileSync(newPath);
		return {
			body: data.toString("base64"),
			contentType: "image/png",
		};
	}
}

const fileHandler = {
	requiresBaseResponse: true,
	getFinalResponse: catchFile,
};

exports.api = {
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
			logDebug(`[custommaploader] Map list: [${maps.join(", ")}]`);
			logDebug(`[custommaploader] Grabbing data for each map..`);
			const mapResponses = {};
			log(`[custommaploader] ## BEGIN MASS MAP LOADING`);
			for (const map of maps) {
				mapResponses[map] = await loadMap(map);
			}
			log(`[custommaploader] ## END MASS MAP LOADING`);
			const body = Buffer.from(JSON.stringify(mapResponses)).toString("base64");
			return { body, contentType: "application/json" };
		},
	},
	"custommaploader/mapdata": {
		requiresBaseResponse: false,
		getFinalResponse: async () => {
			await loadMap();
			if (!mapData) throw new Error("[custommaploader] FATAL: Map data was not ready after loading.");
			const body = Buffer.from(JSON.stringify(mapData)).toString("base64");
			return { body, contentType: "application/json" };
		},
	},
	"custommaploader/inmenu": {
		requiresBaseResponse: false,
		getFinalResponse: async () => {
			inMenu = true;
			const body = Buffer.from("").toString("base64");
			return { body, contentType: "application/text" };
		},
	},
	"custommaploader/lasterror": {
		requiresBaseResponse: false,
		getFinalResponse: async () => {
			let data = "";
			if (mapData && mapData.error) {
				data = mapData.error;
			}
			const body = Buffer.from(data).toString("base64");
			return { body, contentType: "application/text" };
		},
	},
	"/bundle.js": {
		requiresBaseResponse: true,
		getFinalResponse: async () => {
			inMenu = false;
			return false;
		},
	},
};

globalThis.CML_newGame = function (originalFunction) {
	if (globalThis.CML_mapWarn) {
		const popup = document.createElement("div");
		popup.innerHTML = `
		<div style="
			position: fixed; inset: 0; display: flex;
			justify-content: center; align-items: center;
			background: rgba(0, 0, 0, 0.5); z-index: 9999;">
			<div style="
			background: rgba(0, 0, 0, 0.8); padding: 20px; padding-top: 0;
			border-radius: 10px; box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
			text-align: center;">
			<p style="color: red; font-size: 25pt">Map Warning</h2>
			<p style="color: white; max-width: 500px">${globalThis.CML_mapWarn}</p>
			<p style="color: white; margin-top: 10px">Are you sure you want to proceed?</p>
			<div style="margin-top: 15px; display: flex; justify-content: center; gap: 10px;">
				<button id="CML_cancel" style="
				padding: 8px 15px; background: red;
				color: white; border: none; border-radius: 5px; cursor: pointer;">Cancel</button>
				<button id="CML_confirm" style="
				padding: 8px 15px; background: green;
				color: white; border: none; border-radius: 5px; cursor: pointer;">Confirm</button>
			</div>
			</div>
		</div>`;

		document.body.appendChild(popup);

		document.getElementById("CML_confirm").addEventListener("click", () => {
			originalFunction();
			popup.remove();
		});

		document.getElementById("CML_cancel").addEventListener("click", () => {
			popup.remove();
		});
	} else {
		originalFunction();
	}
};

globalThis.CML_playerSpawnPos = function (constants) {
	if (!globalThis.CML_mapData) throw new Error("[custommaploader] Map data was not ready when player spawn was requested.");
	return {
		x: globalThis.CML_mapData.meta.spawn.x * constants.cellSize,
		y: globalThis.CML_mapData.meta.spawn.y * constants.cellSize,
	};
};

globalThis.CML_playerUnstuck = function (constants) {
	// Ok genuinely how at this point? How would map data not be ready?
	if (!globalThis.CML_mapData) throw new Error("[custommaploader] Map data was not ready when player unstuck was requested.");
	gameInstance.state.store.player.x = globalThis.CML_mapData.meta.unstuck.x * constants.cellSize;
	gameInstance.state.store.player.y = globalThis.CML_mapData.meta.unstuck.y * constants.cellSize;
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
	if (!globalThis.CML_mapData) throw new Error("[custommaploader] Map data was not ready when player landing was requested.");
	const elapsedTime = gameInstance.state.store.scene.start + gameInstance.state.store.meta.time;
	if (elapsedTime >= 8000) return endCallback(); // Cut off sequence at 8 seconds as a fallback
	if (!globalThis.CML_landingIndex) globalThis.CML_landingIndex = 0;
	const sequenceLength = Object.keys(globalThis.CML_mapData.meta.introSequence).length;
	if (globalThis.CML_mapData.meta.introSequence && sequenceLength > 0) {
		if (globalThis.CML_landingIndex >= sequenceLength) return endCallback();
		let entry = Object.entries(globalThis.CML_mapData.meta.introSequence)[globalThis.CML_landingIndex];
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

globalThis.CML_playerFog = function (y) {
	// These are defined by the game
	const data = globalThis.CML_tryGetData().meta;
	const [start, end, max, min] = [data.fog.startY, data.fog.endY, data.fog.max, data.fog.min];
	if (min > max || min < 0 || start > end) throw new Error("[custommaploader] Invalid fog settings.");
	if (y <= start) return max;
	if (y >= end) return min;
	return max - (y - start) * ((max - min) / (end - start));
};

// Allows requesting data, but resorts to defaults if not ready
globalThis.CML_tryGetData = function () {
	if (!globalThis.CML_mapData) return JSON.parse(JSON.stringify(mapDataTemplate));
	return globalThis.CML_mapData;
};

exports.patches = [
	{
		// Very start of bundle.js - loads map data as long as path is not the main menu
		type: "replace",
		from: "(()=>{var e,t,n={8916:",
		to: 'if (!window.location.href.endsWith("index.html")) { fetch("custommaploader/mapdata").then((response)=>response.json().then((data)=>{if(!data.valid){window.location.href=window.location.pathname};globalThis.CML_mapData=data;console.log(`[custommaploader] Map data ready at ${performance.now()}`);}))}else{fetch("custommaploader/inmenu")};(()=>{var e,t,n={8916:',
		expectedMatches: 1,
	},
	{
		// Show x, y of invalid colors during world creation - helps debug map creation
		type: "replace",
		from: '"+"".concat(y,", ").concat(v,", ").concat(x)',
		to: '"+"".concat(y,", ").concat(v,", ").concat(x) + ` at {x: ${m}, y: ${p}}`',
		expectedMatches: 2,
	},
	{
		// Main menu 'Continue', 'New', and 'Load' button intercept
		type: "regex",
		pattern: 'text:"(Continue|New|Load)",hint:"([^"]*?)",onClick:function\\(\\){(.+?)}',
		replace: 'text:"$1",hint:"$2",onClick:function(){globalThis.CML_newGame(()=>{$3})}',
		expectedMatches: 3,
	},
	{
		// World creation - player spawn
		type: "replace",
		from: "{x:363*e.cellSize,y:200*e.cellSize}",
		to: `globalThis.CML_playerSpawnPos(e)`,
		expectedMatches: 1,
	},
	{
		// Unstuck button
		type: "replace",
		from: "t.state.store.player.x=161*e.cellSize,t.state.store.player.y=616*e.cellSize",
		to: `globalThis.CML_playerUnstuck(e)`,
		expectedMatches: 1,
	},
	{
		// Intro timing sequence
		type: "regex",
		pattern:
			'case x\\.Intro:.*?if\\((.+?),!e\\.store\\.scene\\.triggers\\[0\\].+?(\\w+)\\(e\\.session\\.soundEngine,"boost"\\).+?(\\w+)\\(e\\.session\\.soundEngine,"boost"\\).+(e\\.store\\.scene\\.active=x\\.Game.+?)}break;case',
		replace: "case x.Intro:$1;globalThis.CML_playerLanding($2, $3, function(){$4});break;case",
		expectedMatches: 1,
	},
	{
		// Player fog change
		type: "replace",
		from: "(l=i.y)<=3400?700:l>=4200?200:700-(l-3400)/800*500",
		to: "globalThis.CML_playerFog(l=i.y)",
		expectedMatches: 1,
	},
	{
		// Parallax scale adjustment
		type: "regex",
		pattern: "n\\.session\\.camera\\.(x|y)\\/((?:1\\.5)|2)\\)",
		replace: `n.session.camera.$1/($2*globalThis.CML_tryGetData().scale))`,
		expectedMatches: 4,
	},
	{
		// Parallax vertical adjustment
		type: "replace",
		from: "Math.round(-n.session.camera.y",
		to: `Math.round(-(n.session.camera.y+globalThis.CML_tryGetData().meta.parallaxOffset)`,
		expectedMatches: 2,
	},
	{
		// Soft y limit
		type: "replace",
		from: "n.y<600",
		to: "n.y<globalThis.CML_tryGetData().meta.yLimit.soft",
		expectedMatches: 1,
	},
	{
		// Hard y limit
		type: "replace",
		from: "s<550?(s=550",
		to: "s<globalThis.CML_tryGetData().meta.yLimit.hard?(s=globalThis.CML_tryGetData().meta.yLimit.hard",
		expectedMatches: 1,
	},
];

exports.onMenuLoaded = async function () {
	// Exposes maps in case other mods want to use them without refetching
	globalThis.CML_maps = await (await fetch("custommaploader/maps")).json();
	const selected = (await modConfig.get("custommaploader")).map;
	const options = Object.keys(globalThis.CML_maps).map((name) => {
		if (name == selected) return `<option value="${name}" selected>${name}</option>`;
		return `<option value="${name}">${name}</option>`;
	});

	const lastError = await (await fetch("custommaploader/lasterror")).text();
	if (lastError) {
		const mapError = document.createElement("div");
		mapError.id = "CML_mapError";
		mapError.style.position = "absolute";
		mapError.style.top = "0";
		mapError.style.left = "0";
		mapError.style.pointerEvents = "auto";
		mapError.style.color = "rgb(255, 0, 0)";
		mapError.style.maxWidth = "calc(100% - 20vh)";
		mapError.style.fontSize = "2vh";

		mapError.textContent = `ERROR: ${lastError}`;

		document.body.appendChild(mapError);
	}

	function selectionChanged(newSelection) {
		globalThis.CML_mapWarn = undefined;
		const map = globalThis.CML_maps[newSelection];
		// Warnings are not for errors, those can be handled after.
		if (map.valid) {
			if (map.scale > 3) {
				return (globalThis.CML_mapWarn = `This map is ${map.scale}x scale (${map.width}x${map.width}). This map may not load on your machine or may cause other unexpected issues since it is bigger than 3x.`);
			}
		}
	}

	const selector = document.createElement("div");
	selector.style.position = "absolute";
	selector.style.pointerEvents = "auto";
	selector.style.transform = "translate(-12em, -4em)";
	selector.style.color = "rgb(0,0,0)";
	selector.innerHTML = `
<form class="max-w-sm mx-auto">
	<label for="CML_mapSelector" class="block mb-2 text-base font-medium text-gray-900 dark:text-white">Select Map</label>
	<select id="CML_mapSelector" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" style="max-width: 7rem; width: 7rem">
	${options}
	</select>
</form>`;
	let interval = setInterval(() => {
		const ui = document.querySelector(
			"#ui > div.fixed.inset-0.flex.items-center.justify-center.pointer-events-none.mt-40 > div > div.bg-opacity-25.text-white.flex.flex-col.items-center.justify-center.relative"
		);
		if (!ui) return;
		clearInterval(interval);
		ui.appendChild(selector);
		selectionChanged(selected);
		document.getElementById("CML_mapSelector").addEventListener("change", function () {
			modConfig.set("custommaploader", { map: this.value });
			selectionChanged(this.value);
		});
	}, 100);
};
