exports.modinfo = {
	name: "custommaploader",
	version: "3.0.3",
	dependencies: [],
	modauthor: "Electric131",
};

// Remove config from the config UI
exports.config = [];

const mapsFolder = "./mods/maps";

const templateColors = {
	elements: {
		// Basic color translations in switch statement
		Empty: "255, 255, 255",
		Bedrock: "170, 170, 170",
		SurfaceWater: "102, 0, 255",
		Ice: "102, 204, 255",
		RevealedFog: "153, 0, 0",
		// Advanced translations with table modification
		CaveSandSoil: "0, 0, 0",
		Grass: "0, 255, 0",
		Moss: "0, 224, 0",
		Divider: "0, 102, 0",
		SporeSoil: "255, 255, 0",
		FreezingIce: "204, 255, 255",
		CaveFreezingIce: "153, 255, 255",
		Fog: "153, 51, 0",
		JetpackFog: "255, 0, 153",
		JetpackFogWater: "102, 102, 255",
		BedrockFog: "102, 102, 102",
		FogWater: "153, 102, 255",
		FogLava: "255, 102, 0",
		Fluxite: "175, 0, 224",
		RedsandSoil: "255, 85, 0",
		Crackstone: "205, 139, 139",
		DarkFog: "51, 51, 51",
		RevealedFogWater: "0, 0, 255",
		Scoria: "38, 0, 0",
		GoldSoil: "127, 127, 0",
	},
};

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
	hash: null,
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
		colors: templateColors,
	},
	script: {
		raw: "",
	},
};

// Thank you StackOverflow for a purejs hashing function :)
// #region MD5 hashing.. don't look
var MD5 = function (d) {
	var r = M(V(Y(X(d), 8 * d.length)));
	return r.toLowerCase();
};
function M(d) {
	for (var _, m = "0123456789ABCDEF", f = "", r = 0; r < d.length; r++) (_ = d.charCodeAt(r)), (f += m.charAt((_ >>> 4) & 15) + m.charAt(15 & _));
	return f;
}
function X(d) {
	for (var _ = Array(d.length >> 2), m = 0; m < _.length; m++) _[m] = 0;
	for (m = 0; m < 8 * d.length; m += 8) _[m >> 5] |= (255 & d.charCodeAt(m / 8)) << m % 32;
	return _;
}
function V(d) {
	for (var _ = "", m = 0; m < 32 * d.length; m += 8) _ += String.fromCharCode((d[m >> 5] >>> m % 32) & 255);
	return _;
}
function Y(d, _) {
	(d[_ >> 5] |= 128 << _ % 32), (d[14 + (((_ + 64) >>> 9) << 4)] = _);
	for (var m = 1732584193, f = -271733879, r = -1732584194, i = 271733878, n = 0; n < d.length; n += 16) {
		var h = m,
			t = f,
			g = r,
			e = i;
		(f = md5_ii(
			(f = md5_ii(
				(f = md5_ii(
					(f = md5_ii(
						(f = md5_hh(
							(f = md5_hh(
								(f = md5_hh(
									(f = md5_hh(
										(f = md5_gg(
											(f = md5_gg(
												(f = md5_gg(
													(f = md5_gg(
														(f = md5_ff(
															(f = md5_ff(
																(f = md5_ff(
																	(f = md5_ff(
																		f,
																		(r = md5_ff(
																			r,
																			(i = md5_ff(i, (m = md5_ff(m, f, r, i, d[n + 0], 7, -680876936)), f, r, d[n + 1], 12, -389564586)),
																			m,
																			f,
																			d[n + 2],
																			17,
																			606105819
																		)),
																		i,
																		m,
																		d[n + 3],
																		22,
																		-1044525330
																	)),
																	(r = md5_ff(
																		r,
																		(i = md5_ff(i, (m = md5_ff(m, f, r, i, d[n + 4], 7, -176418897)), f, r, d[n + 5], 12, 1200080426)),
																		m,
																		f,
																		d[n + 6],
																		17,
																		-1473231341
																	)),
																	i,
																	m,
																	d[n + 7],
																	22,
																	-45705983
																)),
																(r = md5_ff(
																	r,
																	(i = md5_ff(i, (m = md5_ff(m, f, r, i, d[n + 8], 7, 1770035416)), f, r, d[n + 9], 12, -1958414417)),
																	m,
																	f,
																	d[n + 10],
																	17,
																	-42063
																)),
																i,
																m,
																d[n + 11],
																22,
																-1990404162
															)),
															(r = md5_ff(
																r,
																(i = md5_ff(i, (m = md5_ff(m, f, r, i, d[n + 12], 7, 1804603682)), f, r, d[n + 13], 12, -40341101)),
																m,
																f,
																d[n + 14],
																17,
																-1502002290
															)),
															i,
															m,
															d[n + 15],
															22,
															1236535329
														)),
														(r = md5_gg(
															r,
															(i = md5_gg(i, (m = md5_gg(m, f, r, i, d[n + 1], 5, -165796510)), f, r, d[n + 6], 9, -1069501632)),
															m,
															f,
															d[n + 11],
															14,
															643717713
														)),
														i,
														m,
														d[n + 0],
														20,
														-373897302
													)),
													(r = md5_gg(r, (i = md5_gg(i, (m = md5_gg(m, f, r, i, d[n + 5], 5, -701558691)), f, r, d[n + 10], 9, 38016083)), m, f, d[n + 15], 14, -660478335)),
													i,
													m,
													d[n + 4],
													20,
													-405537848
												)),
												(r = md5_gg(r, (i = md5_gg(i, (m = md5_gg(m, f, r, i, d[n + 9], 5, 568446438)), f, r, d[n + 14], 9, -1019803690)), m, f, d[n + 3], 14, -187363961)),
												i,
												m,
												d[n + 8],
												20,
												1163531501
											)),
											(r = md5_gg(r, (i = md5_gg(i, (m = md5_gg(m, f, r, i, d[n + 13], 5, -1444681467)), f, r, d[n + 2], 9, -51403784)), m, f, d[n + 7], 14, 1735328473)),
											i,
											m,
											d[n + 12],
											20,
											-1926607734
										)),
										(r = md5_hh(r, (i = md5_hh(i, (m = md5_hh(m, f, r, i, d[n + 5], 4, -378558)), f, r, d[n + 8], 11, -2022574463)), m, f, d[n + 11], 16, 1839030562)),
										i,
										m,
										d[n + 14],
										23,
										-35309556
									)),
									(r = md5_hh(r, (i = md5_hh(i, (m = md5_hh(m, f, r, i, d[n + 1], 4, -1530992060)), f, r, d[n + 4], 11, 1272893353)), m, f, d[n + 7], 16, -155497632)),
									i,
									m,
									d[n + 10],
									23,
									-1094730640
								)),
								(r = md5_hh(r, (i = md5_hh(i, (m = md5_hh(m, f, r, i, d[n + 13], 4, 681279174)), f, r, d[n + 0], 11, -358537222)), m, f, d[n + 3], 16, -722521979)),
								i,
								m,
								d[n + 6],
								23,
								76029189
							)),
							(r = md5_hh(r, (i = md5_hh(i, (m = md5_hh(m, f, r, i, d[n + 9], 4, -640364487)), f, r, d[n + 12], 11, -421815835)), m, f, d[n + 15], 16, 530742520)),
							i,
							m,
							d[n + 2],
							23,
							-995338651
						)),
						(r = md5_ii(r, (i = md5_ii(i, (m = md5_ii(m, f, r, i, d[n + 0], 6, -198630844)), f, r, d[n + 7], 10, 1126891415)), m, f, d[n + 14], 15, -1416354905)),
						i,
						m,
						d[n + 5],
						21,
						-57434055
					)),
					(r = md5_ii(r, (i = md5_ii(i, (m = md5_ii(m, f, r, i, d[n + 12], 6, 1700485571)), f, r, d[n + 3], 10, -1894986606)), m, f, d[n + 10], 15, -1051523)),
					i,
					m,
					d[n + 1],
					21,
					-2054922799
				)),
				(r = md5_ii(r, (i = md5_ii(i, (m = md5_ii(m, f, r, i, d[n + 8], 6, 1873313359)), f, r, d[n + 15], 10, -30611744)), m, f, d[n + 6], 15, -1560198380)),
				i,
				m,
				d[n + 13],
				21,
				1309151649
			)),
			(r = md5_ii(r, (i = md5_ii(i, (m = md5_ii(m, f, r, i, d[n + 4], 6, -145523070)), f, r, d[n + 11], 10, -1120210379)), m, f, d[n + 2], 15, 718787259)),
			i,
			m,
			d[n + 9],
			21,
			-343485551
		)),
			(m = safe_add(m, h)),
			(f = safe_add(f, t)),
			(r = safe_add(r, g)),
			(i = safe_add(i, e));
	}
	return Array(m, f, r, i);
}
function md5_cmn(d, _, m, f, r, i) {
	return safe_add(bit_rol(safe_add(safe_add(_, d), safe_add(f, i)), r), m);
}
function md5_ff(d, _, m, f, r, i, n) {
	return md5_cmn((_ & m) | (~_ & f), d, _, r, i, n);
}
function md5_gg(d, _, m, f, r, i, n) {
	return md5_cmn((_ & f) | (m & ~f), d, _, r, i, n);
}
function md5_hh(d, _, m, f, r, i, n) {
	return md5_cmn(_ ^ m ^ f, d, _, r, i, n);
}
function md5_ii(d, _, m, f, r, i, n) {
	return md5_cmn(m ^ (_ | ~f), d, _, r, i, n);
}
function safe_add(d, _) {
	var m = (65535 & d) + (65535 & _);
	return (((d >> 16) + (_ >> 16) + (m >> 16)) << 16) | (65535 & m);
}
function bit_rol(d, _) {
	return (d << _) | (d >>> (32 - _));
}
// #endregion

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
		mapName = config.map;
	}
	if (!fs.existsSync(mapsFolder)) {
		log(`[custommaploader] Creating directory: ${mapsFolder}`);
		fs.mkdirSync(mapsFolder, { recursive: true });
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
		folder: globalThis.resolvePathRelativeToModloader(mapFolder),
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
			"script.js",
		];
		let mainBuffer = Buffer.from("");
		for (const file of mapFiles) {
			logDebug(`[custommaploader] Checking if file '${tempData.folderRelative}/${file}' exists..`);
			const exists = fs.existsSync(`${tempData.folder}/${file}`);
			if (!exists) {
				if (file == "meta.json") {
					continue;
				}
				if (file == "script.js") {
					continue;
				}
				return loadingError(`Custom map files are missing from ${mapFolder}. Please make sure to place the custom map files in the correct location.`);
			}
			let data = fs.readFileSync(`${tempData.folderRelative}/${file}`);
			mainBuffer = Buffer.concat([mainBuffer, data]);
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
						for (const [key, value] of Object.entries(data)) {
							let localPath = path.concat(key);
							const pathString = localPath.join(".");
							if (defaults.hasOwnProperty(key) && typeof value != typeof defaults[key]) {
								return `Value at meta path '${pathString}' does not match the expected type.`;
							}
							if (typeof value == "object") {
								if (skipDefaults.includes(pathString)) {
									modified[key] = value;
									continue;
								}
								if (!defaults.hasOwnProperty(key)) modified[key] = value;
								let fail = recursiveMetaCheck(modified[key], value, defaults.hasOwnProperty(key) ? defaults[key] : {}, localPath);
								if (fail) return fail;
							} else {
								modified[key] = value;
							}
						}
						return;
					}
					break;
				case "script.js":
					tempData.script.raw = data.toString();
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
		tempData.hash = MD5(mainBuffer.toString("base64"));
	} else {
		log("[custommaploader] Using default map data..");
		// Yes, I'm forcing meta settings for specifically the default map.. I'm bad :(
		// I wanted to avoid this, but I prefer custom maps have different defaults while keeping the default map the same
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
		tempData.hash = "default";
	}
	if (tempData.images["map_blueprint_playtest.png"]) {
		tempData.width = tempData.images["map_blueprint_playtest.png"].width;
		for (const image of Object.keys(tempData.images)) {
			if (tempData.images[image].width != tempData.width) {
				return loadingError(`Image dimension mismatch: '${mapFolder}/${image}' is not the same width or height as main image.`);
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
	if (!mapData) throw new Error("[custommaploader] Map data was not ready when image was requested");
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
		const data = fs.readFileSync(newPath);
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
			if (!fs.existsSync(mapsFolder)) {
				log(`[custommaploader] Creating directory: ${mapsFolder}`);
				fs.mkdirSync(mapsFolder, { recursive: true });
			}
			const maps = (
				await fs.readdirSync(globalThis.resolvePathRelativeToModloader(mapsFolder), {
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
			if (!mapData) throw new Error("[custommaploader] FATAL: Map data was not ready after loading");
			const body = Buffer.from(JSON.stringify(mapData)).toString("base64");
			return { body, contentType: "application/json" };
		},
	},
	"custommaploader/inmenu": {
		requiresBaseResponse: false,
		getFinalResponse: async () => {
			inMenu = true;
			return { body: "", contentType: "text/plain" };
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
	"custommaploader/loadsave": {
		requiresBaseResponse: false,
		getFinalResponse: async ({ request }) => {
			try {
				file = request.url.match(/\/([^\s/]+)$/)[1]; // Finds only the save name at the end
			} catch {
				throw new Error(`[custommaploader] Error when parsing file name from ${request.url}`);
			}
			logDebug(`[custommaploader] Attempting to load save '${file}'`);
			let appDataPath;
			if (process.platform === "win32") {
				appDataPath = process.env.APPDATA;
			} else if (process.platform === "darwin") {
				appDataPath = path.join(process.env.HOME, "Library", "Application Support");
			} else {
				appDataPath = process.env.XDG_CONFIG_HOME || path.join(process.env.HOME, ".config");
			}
			if (!appDataPath) throw new Error(`[custommaploader] Could not find appData path`);
			try {
				let savePath = path.join(appDataPath, "sandustrydemo", "saves", file + ".save");
				logDebug(`[custommaploader] Located save file at '${savePath}'`);
				const body = fs.readFileSync(savePath).toString("base64");
				return { body, contentType: "application/json" };
			} catch {
				logError(`[custommaploader] Loading save '${file}' failed!`);
				return { body: "", contentType: "application/json" };
			}
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

// Injected to the start of bundle.js, and nothing local will be loaded yet
init = function () {
	globalThis.CML = {
		scriptAPI: {},
		internals: {}, // Used internally by the mod to store info
	};
	const searchParams = new URLSearchParams(window.location.search);
	const inMainMenu = searchParams.size === 0 || (searchParams.has("skip_version_check") && searchParams.size === 1);
	if (!inMainMenu) {
		// Fetch map data and load it into the global scope
		fetch("custommaploader/mapdata").then((response) => {
			response.json().then((data) => {
				if (!data.valid) window.location.href = window.location.pathname;
				CML.mapData = data;
				console.log(`[custommaploader] Map data ready at ${performance.now()}`);
			});
		});
	} else {
		// Tell api the player is in the main menu
		fetch("custommaploader/inmenu");
	}
};

const particleCache = {};

if (globalThis.CML) {
	// #region Internals
	globalThis.CML.internals.menuWarn = function (originalFunction) {
		if (CML.internals.mapWarn) {
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

	CML.internals.newGame = function (originalFunction, saveId) {
		// If a save is given check the map hash
		if (saveId && globalThis.CML_maps) {
			return new Promise(async (res, rej) => {
				try {
					const worldHash = JSON.parse((await (await fetch("custommaploader/loadsave/" + saveId)).text()).split("\n")[1]).world.mapHash;
					const selected = CML.maps[CML.selectedMap];
					if (worldHash && selected && selected.hash != worldHash) {
						CML.internals.mapWarn = "The save you are loading was created with a different map than the one that is currently active! This could cause potential errors!";
					}
					CML.internals.menuWarn(originalFunction);
					res();
				} catch {
					logError(`[custommaploader] Error when parsing info for save '${saveId}'`);
					rej();
				}
			});
		} else {
			CML.internals.menuWarn(originalFunction);
		}
	};

	CML.internals.initColors = function () {
		let data = CML.internals.tryGetData();
		if (window.location.href.endsWith("index.html")) {
			data = CML.internals.tryGetData(); // Grab defaults if in menu
		}
		if (!data) throw new Error("[custommaploader] Map data was not ready during color init");
		CML.internals.loadedColors = {};
		const colors = data.meta.colors.elements;
		// Swap keys and values of colors
		for (const tile of Object.keys(colors)) {
			if (Object.keys(CML.internals.loadedColors).includes(colors[tile])) {
				throw new Error(`[custommaploader] Duplicate color found during world creation: ${colors[tile]}`);
			}
			if (typeof colors[tile] != "object") CML.internals.loadedColors[colors[tile]] = tile;
		}
	};

	const basicColorMap = {
		Empty: "255, 255, 255",
		Bedrock: "170, 170, 170",
		SurfaceWater: "102, 0, 255",
		Ice: "102, 204, 255",
		RevealedFog: "153, 0, 0", // Not actually Fog, it's just Empty with a dirt background..?
	};

	// Converts basicColorMap - which is only basic colors in the switch statement
	CML.internals.convertColor = function (color) {
		if (!CML.internals.loadedColors) CML.internals.initColors();
		if (!Object.keys(CML.internals.loadedColors).includes(color)) return color;
		if (!Object.keys(basicColorMap).includes(CML.internals.loadedColors[color])) return color;
		return basicColorMap[CML.internals.loadedColors[color]];
	};

	const advancedColorMap = {
		CaveSandSoil: "0, 0, 0",
		Grass: "0, 255, 0",
		Moss: "0, 224, 0",
		Divider: "0, 102, 0",
		SporeSoil: "255, 255, 0",
		FreezingIce: "204, 255, 255",
		CaveFreezingIce: "153, 255, 255",
		Fog: "153, 51, 0",
		JetpackFog: "255, 0, 153",
		JetpackFogWater: "102, 102, 255",
		BedrockFog: "102, 102, 102",
		FogWater: "153, 102, 255",
		FogLava: "255, 102, 0",
		Fluxite: "175, 0, 224",
		RedsandSoil: "255, 85, 0",
		Crackstone: "205, 139, 139",
		DarkFog: "51, 51, 51", // Only used in the artifact rooms from what I can tell, is just a darker version of BedrockFog
		SandSoil: "0, 0, 255", // Blame Lantto... apparently this is just SandSoil without dirt background
	};

	function extraColorMap() {
		const solids = CML.internals.solids;
		return {
			Scoria: {
				bg: solids.SandSoil,
				fg: solids.Obsidian,
			},
			GoldSoil: {
				bg: solids.SandSoil,
				fg: solids.GoldSoil,
			},
		};
	}

	// Converts advancedColorMap - which is the extra list of colors stored as `Fd` currently
	// Then also adds any custom colors defined
	CML.internals.addExtraColors = function () {
		if (!CML.internals.colorTable) throw new Error("[custommodloader] Color table was not ready at world creation");
		const original = JSON.parse(JSON.stringify(CML.internals.colorTable));
		let data = CML.internals.tryGetData();
		if (!CML.internals.loadedColors) CML.internals.initColors();
		for (const tile of Object.values(CML.internals.loadedColors)) {
			if (!advancedColorMap[tile]) continue;
			CML.internals.colorTable[data.meta.colors.elements[tile]] = original[advancedColorMap[tile]];
		}

		const extraColorLookup = extraColorMap();
		for (const tile of Object.keys(extraColorLookup)) {
			CML.internals.colorTable[data.meta.colors.elements[tile]] = extraColorLookup[tile];
		}

		for (const [color, elementData] of Object.entries(data.meta.colors.elements)) {
			if (typeof elementData == "object") {
				if (elementData.bg) {
					if (!CML.internals.solids.hasOwnProperty(elementData.bg)) {
						throw new Error(`[custommaploader] Unknown background element '${elementData.bg}' in element color list`);
					}
					elementData.bg = CML.internals.solids[elementData.bg];
				}
				if (elementData.fg) {
					if (!CML.internals.solids.hasOwnProperty(elementData.fg)) {
						throw new Error(`[custommaploader] Unknown foreground element '${elementData.fg}' in element color list`);
					}
					elementData.fg = CML.internals.solids[elementData.fg];
				}
				CML.internals.colorTable[color] = elementData;
			}
		}
	};

	CML.internals.playerSpawnPos = function (constants) {
		const data = CML.internals.tryGetData();
		return {
			x: data.meta.spawn.x * constants.cellSize,
			y: data.meta.spawn.y * constants.cellSize,
		};
	};

	CML.internals.playerUnstuck = function (constants) {
		// Ok genuinely how at this point? How would map data not be ready?
		if (!CML.mapData) throw new Error("[custommaploader] Map data was not ready when player unstuck was requested.");
		gameInstance.state.store.player.x = CML.mapData.meta.unstuck.x * constants.cellSize;
		gameInstance.state.store.player.y = CML.mapData.meta.unstuck.y * constants.cellSize;
	};

	CML.internals.landingHelper = function (_) {
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
				_.callbackIntercept();
				break;
		}
	};

	CML.internals.playerLanding = function (playSound, stopSound, endCallback) {
		const callbackIntercept = () => {
			if (CML.internals.scriptExportsHas("onPlayerLanded")) {
				CML.mapData.script.exports.onPlayerLanded();
			}
			endCallback();
		};
		if (!CML.mapData) throw new Error("[custommaploader] Map data was not ready when player landing was requested.");
		const elapsedTime = gameInstance.state.store.scene.start + gameInstance.state.store.meta.time;
		if (elapsedTime >= 8000) return callbackIntercept(); // Cut off sequence at 8 seconds as a fallback
		if (!CML.internals.landingIndex) CML.internals.landingIndex = 0;
		const sequenceLength = Object.keys(CML.mapData.meta.introSequence).length;
		if (CML.mapData.meta.introSequence && sequenceLength > 0) {
			if (CML.internals.landingIndex >= sequenceLength) return callbackIntercept();
			let entry = Object.entries(CML.mapData.meta.introSequence)[CML.internals.landingIndex];
			if (elapsedTime >= entry[0]) {
				CML.internals.landingHelper({
					instruction: entry[1],
					playSound,
					stopSound,
					callbackIntercept,
				});
				CML.internals.landingIndex++;
			}
		}
	};

	CML.internals.playerFog = function (y) {
		// These are defined by the game
		const data = CML.internals.tryGetData().meta;
		const [start, end, max, min] = [data.fog.startY, data.fog.endY, data.fog.max, data.fog.min];
		if (min > max || min < 0 || start > end) throw new Error("[custommaploader] Invalid fog settings.");
		if (y <= start) return max;
		if (y >= end) return min;
		return max - (y - start) * ((max - min) / (end - start));
	};

	// Allows requesting data, but resorts to defaults if not ready
	CML.internals.tryGetData = function () {
		if (!CML.mapData) return JSON.parse(JSON.stringify(mapDataTemplate));
		return CML.mapData;
	};
	// #endregion
	// #region Script API + Related Internals
	CML.internals.scriptExportsHas = function (value) {
		return Object.hasOwn(CML.mapData.script.exports, value);
	};

	CML.internals.timerCallback = async function () {
		if (!CML.mapData || !CML.mapData.script) return; // Map data is not ready yet, so we can wait

		const scriptExports = CML.mapData.script.exports;
		if (CML.internals.scriptExportsHas("onUpdate")) {
			scriptExports.onUpdate();
		}
		if (CML.internals.scriptExportsHas("pixelListeners")) {
			if (typeof scriptExports.pixelListeners != "object") throw new Error("[custommaploader] Map script exported pixelListeners that is not of type object");
			let mapData;
			try {
				mapData = gameInstance.state.shared.mapData;
			} catch {
				throw new Error("[custommaploader] Pixel data was not ready when pixelListeners was run");
			}
			for (const [pixel, callback] of Object.entries(scriptExports.pixelListeners)) {
				let [x, y] = pixel.split(", ");
				[x, y] = [parseInt(x), parseInt(y)]; // Parse x and y to ints
				let pixelData = mapData.data[x + y * mapData.width];
				if (particleCache[pixel] && particleCache[pixel] != pixelData) {
					callback({
						oldTypeRaw: particleCache[pixel],
						newTypeRaw: pixelData,
						oldType: gameInstance.state.session.colors.cellTypeOrElementTypeByColorId[particleCache[pixel]],
						newType: gameInstance.state.session.colors.cellTypeOrElementTypeByColorId[pixelData],
					});
				}
				particleCache[pixel] = pixelData;
			}
		}
	};

	CML.scriptAPI.spawnBlock = function (x, y, type) {
		if (!Object.hasOwn(CML.internals.spawnBlockData.blocks, type)) {
			throw new Error("[custommaploader] Script attempted to spawn an invalid block type");
		}
		return CML.internals.spawnBlockData.spawnBlock(
			gameInstance.state,
			{
				x: x,
				y: y,
			},
			{
				structureType: CML.internals.spawnBlockData.blocks[type],
			}
		);
	};

	CML.scriptAPI.spawnMovingParticle = function (x, y, velx, vely, type) {
		if (!CML.internals.particles.hasOwnProperty(type)) throw new Error(`[custommaploader] Unknown particle type '${type}'`);
		const particle = CML.internals.createParticle(CML.internals.particles.Particle, x, y, {
			element: CML.internals.createParticle(CML.internals.particles[type], x, y),
			velocity: {
				x: velx,
				y: vely,
			},
		});
		CML.scriptAPI.setElement(x, y, particle);
	};

	CML.scriptAPI.spawnParticle = function (x, y, type, data = {}) {
		if (!CML.internals.particles.hasOwnProperty(type)) throw new Error(`[custommaploader] Unknown particle type '${type}'`);
		const particle = CML.internals.createParticle(CML.internals.particles[type], x, y, data);
		CML.scriptAPI.setElement(x, y, particle);
	};

	CML.scriptAPI.setElement = function (x, y, data) {
		if (CML.internals.solids.hasOwnProperty(data)) {
			data = CML.internals.solids[data];
		}
		CML.internals.setElement(gameInstance.state, x, y, data);
		if (Number.isInteger(data)) {
			// If data is an integer, tell thread to redraw neighboring cells
			// Warning: '22' must be updated to reflect 'f.RedrawSurroundingCells'
			gameInstance.state.environment.multithreading.simulation.post(
				gameInstance.state,
				CML.internals.threadHelpers.getThreadIndexFromCellX(x, gameInstance.state.environment.multithreading.simulation.threads.length),
				[22, [x, y]]
			);
		}
	};

	CML.scriptAPI.isPlaceable = function (x, y) {
		return CML.internals.positionClear(gameInstance.state, x, y);
	};

	CML.scriptAPI.revealFog = function (x, y) {
		gameInstance.state.environment.multithreading.simulation.postAll(gameInstance.state, [14, x, y]);
	};

	// Define some simple helper/util functions
	CML.scriptAPI.helpers = {
		// amount must be between 0 and 1
		lerp: (amount, a, b) => {
			return a + (b - a) * amount;
		},
		map: (num, inMin, inMax, outMin, outMax) => {
			return ((num - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
		},
		// Round num to a specified precision. e.g. 10.19 at precision of 10 = 10.2
		round: (num, precision) => Math.round(num * precision) / precision,
	};

	// Define some basic easing functions for the user
	CML.scriptAPI.basicEasing = {
		linear: (t) => t,
		in_out: (t) => {
			return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
		},
		in_out_custom: (inPercent = 0.2) => {
			if (inPercent > 1) throw new Error("[custommaploader] in_out_custom exceeds max range");
			outPercent = 1 - inPercent;
			return (t) => {
				if (t < inPercent) {
					t = CML.scriptAPI.helpers.map(t, 0, inPercent, 0, 1);
					return CML.scriptAPI.helpers.map(t * t, 0, 1, 0, inPercent);
				}
				t = CML.scriptAPI.helpers.map(t, 1 - outPercent, 1, 0, 1);
				return CML.scriptAPI.helpers.map(1 - Math.pow(1 - t, 2), 0, 1, 1 - outPercent, 1);
			};
		},
	};

	// Note: Amount should be normalized between 0 and 1
	CML.internals.interpolateCamera = function (startx, starty, endx, endy, amount, easing = CML.scriptAPI.basicEasing.linear) {
		const camera = gameInstance.state.session.camera;
		if (amount < 0 || amount > 1) return false;
		// Apply easing function
		amount = easing(amount);
		// Check if new amount is valid
		if (amount < 0 || amount > 1) return false;
		camera.x = (startx + (endx - startx) * amount) * 4 - Math.floor(gameInstance.state.session.rendering.canvas.width / 2);
		camera.y = (starty + (endy - starty) * amount) * 4 - Math.floor(gameInstance.state.session.rendering.canvas.height / 2);
		return true;
	};

	CML.internals.updateCamera = function () {
		const playerCam = {
			x: (gameInstance.state.store.player.x + gameInstance.state.store.player.width / 2) / 4,
			y: (gameInstance.state.store.player.y + gameInstance.state.store.player.height / 2) / 4,
		};
		if (CML.internals.activeCinematic) {
			const activeCinematic = CML.internals.activeCinematic;
			const delta = performance.now() - CML.internals.cinematicPhaseStart;
			let data = {};
			if (CML.internals.cinematicIndex == 0) {
				data = {
					startx: playerCam.x,
					starty: playerCam.y,
					endx: activeCinematic.data.start.x,
					endy: activeCinematic.data.start.y,
					easing: CML.scriptAPI.basicEasing.in_out,
					duration: 3000,
				};
			} else if (activeCinematic.data.path && CML.internals.cinematicIndex > activeCinematic.data.path.length) {
				if (CML.internals.cinematicIndex != activeCinematic.data.path.length + 1) {
					activeCinematic.res();
					return false;
				}
				data = {
					startx: CML.internals.lastCinematicData.endx,
					starty: CML.internals.lastCinematicData.endy,
					endx: playerCam.x,
					endy: playerCam.y,
					easing: CML.scriptAPI.basicEasing.in_out,
					duration: 3000,
				};
			} else {
				const pathPoint = activeCinematic.data.path[CML.internals.cinematicIndex - 1];
				data = {
					startx: CML.internals.lastCinematicData.endx,
					starty: CML.internals.lastCinematicData.endy,
					endx: pathPoint.x,
					endy: pathPoint.y,
					easing: pathPoint.easing,
					duration: pathPoint.duration,
				};
			}
			try {
				const result = CML.internals.interpolateCamera(data.startx, data.starty, data.endx, data.endy, delta / data.duration, data.easing);
				if (!result) {
					CML.internals.cinematicIndex++;
					CML.internals.cinematicPhaseStart = performance.now();
					CML.internals.lastCinematicData = data;
				}
			} catch {
				throw new Error("[custommaploader] Data was not ready when updating cinematic");
			}
			return true;
		}
	};

	CML.scriptAPI.playCinematic = function (data) {
		if (CML.internals.activeCinematic) {
			// Reject old cinematic when a new one is played
			CML.internals.activeCinematic.rej();
		}
		// Return promise to execute code when cinematic is done
		const promise = new Promise((res, rej) => {
			gameInstance.state.session.overrideCamera = false;
			globalThis.CML.internals.preventInput = true;
			// Store cinematic data for use in the updateCamera function
			globalThis.CML.internals.activeCinematic = { res, rej, data };
			globalThis.CML.internals.cinematicIndex = 0;
			globalThis.CML.internals.cinematicPhaseStart = performance.now();
			document.querySelector("#ui").hidden = true;
		});
		promise.then(() => {
			globalThis.CML.internals.preventInput = false;
			document.querySelector("#ui").hidden = false;
			// Remove traces of cinematic data
			delete globalThis.CML.internals.activeCinematic;
			delete globalThis.CML.internals.cinematicIndex;
			delete globalThis.CML.internals.cinematicPhaseStart;
			delete globalThis.CML.internals.lastCinematicData;
		});
		return promise;
	};
	// #endregion
}

exports.patches = [
	{
		// Very start of bundle.js - loads map data as long as path is not the main menu
		type: "replace",
		from: "(()=>{var e,t,n={8916:",
		to: `(${init.toString().replace("function ()", "() =>")})();(()=>{var e,t,n={8916:`,
	},
	{
		// Show x, y of invalid colors during world creation - helps debug map creation
		type: "replace",
		from: '"+"".concat(y,", ").concat(v,", ").concat(x)',
		to: '"+"".concat(y,", ").concat(v,", ").concat(x) + ` at {x: ${m}, y: ${p}}`',
		expectedMatches: 2,
	},
	{
		// Main menu 'Continue' button intercept
		type: "replace",
		from: 'b_("db_load=".concat(r))',
		to: 'CML.internals.newGame(()=>{b_("db_load=".concat(r))}, r)',
	},
	{
		// Main menu 'New' button intercept
		type: "replace",
		from: 'b_("new_game=true")',
		to: 'CML.internals.newGame(()=>{b_("new_game=true")})',
	},
	{
		// Main menu 'Load' button intercept
		type: "replace",
		from: 'e&&b_("db_load="+e.id)',
		to: 'CML.internals.newGame(() => {e&&b_("db_load="+e.id)}, e.id)',
	},
	{
		// Data tables created (too early for mapData to be loaded)
		type: "replace",
		from: "};l.Demolisher,",
		to: `};CML.internals.positionClear=tf;CML.internals.colorTable=Fd;CML.internals.setElement=Od;`,
	},
	{
		// Thread helping functions such as 'getThreadIndexFromCellX' are defined
		type: "replace",
		from: "const K=q;",
		to: `CML.internals.threadHelpers=q;const K=q;`,
	},
	{
		// World creation - pixel loop starting
		type: "replace",
		from: "for(var i=performance.now()",
		to: `CML.internals.addExtraColors();for(var i=performance.now()`,
	},
	{
		// Function where world creation starts
		type: "replace",
		from: "const KT=function(r,i)",
		to: `CML.internals.particles=n;CML.internals.solids=t;CML.internals.createParticle=Fh;const KT=function(r,i)`,
	},
	{
		// World creation - color conversion
		type: "replace",
		from: "switch(b)",
		to: "b=CML.internals.convertColor(b);switch(b)",
	},
	{
		// World creation - wall data
		type: "replace",
		from: 'f="".concat(c,", ").concat(h,", ").concat(d);',
		to: 'f="".concat(c,", ").concat(h,", ").concat(d);f=CML.internals.convertColor(f);',
	},
	{
		// World creation - player spawn
		type: "replace",
		from: "{x:363*e.cellSize,y:200*e.cellSize}",
		to: `CML.internals.playerSpawnPos(e)`,
	},
	{
		// Fixture parsing - spawns title card and starting collector
		type: "replace",
		from: "t.store.world.fixtures.forEach",
		to: "CML.internals.spawnBlockData = {spawnBlock:xd, blocks:d};t.store.world.fixtures.forEach",
	},
	{
		// Unstuck button
		type: "replace",
		from: "t.state.store.player.x=161*e.cellSize,t.state.store.player.y=616*e.cellSize",
		to: `CML.internals.playerUnstuck(e)`,
	},
	{
		// Intro timing sequence
		type: "regex",
		pattern:
			'case x\\.Intro:.*?if\\((.+?),!e\\.store\\.scene\\.triggers\\[0\\].+?(\\w+)\\(e\\.session\\.soundEngine,"boost"\\).+?(\\w+)\\(e\\.session\\.soundEngine,"boost"\\).+(e\\.store\\.scene\\.active=x\\.Game.+?)}break;case',
		replace: "case x.Intro:$1;CML.internals.playerLanding($2, $3, function(){$4});break;case",
	},
	{
		// Player fog change
		type: "replace",
		from: "(l=i.y)<=3400?700:l>=4200?200:700-(l-3400)/800*500",
		to: "CML.internals.playerFog(l=i.y)",
	},
	{
		// Parallax scale adjustment
		type: "regex",
		pattern: "n\\.session\\.camera\\.(x|y)\\/((?:1\\.5)|2)\\)",
		replace: `n.session.camera.$1/($2*CML.internals.tryGetData().scale))`,
		expectedMatches: 4,
	},
	{
		// Parallax vertical adjustment
		type: "replace",
		from: "Math.round(-n.session.camera.y",
		to: `Math.round(-(n.session.camera.y+CML.internals.tryGetData().meta.parallaxOffset)`,
		expectedMatches: 2,
	},
	{
		// Soft y limit
		type: "replace",
		from: "n.y<600",
		to: "n.y<CML.internals.tryGetData().meta.yLimit.soft",
	},
	{
		// Hard y limit
		type: "replace",
		from: "s<550?(s=550",
		to: "s<CML.internals.tryGetData().meta.yLimit.hard?(s=CML.internals.tryGetData().meta.yLimit.hard",
	},
	{
		// Define the script update timer name with id 100 to hopefully prevent conflicts
		type: "replace",
		from: 'e[e.PingPumpChunksFIX=8]="PingPumpChunksFIX"',
		to: 'e[e.PingPumpChunksFIX=8]="PingPumpChunksFIX",e[e.CML_Timer=100]="CML_Timer"',
	},
	{
		// Setup a callback for the script timer to run every 50ms
		type: "replace",
		from: "up[_.PingPumpChunksFIX]={",
		to: "up[_.CML_Timer]={interval:50,multithreading:!1,callback: async function() {await globalThis.CML.internals.timerCallback()}},up[_.PingPumpChunksFIX]={",
	},
	{
		// Return early from keydown event if preventInput is true
		type: "replace",
		from: "var s=sp(n);",
		to: "var s=sp(n);if (globalThis.CML.internals.preventInput) return;",
	},
	{
		// Call the update camera function when the camera is ready to be moved
		type: "replace",
		from: "var t=hf(e);",
		to: "if (CML.internals.updateCamera(hf)) return;var t=hf(e);",
	},
	{
		// Call the player moved scriptAPI callback when the player moves
		// Also yes this is incredibly repetetive but I didn't want to add an internal function for this
		type: "replace",
		from: "r.y=s,t.shared.playerPos[0]",
		to: "r.y=s;if(CML.internals.scriptExportsHas('onPlayerMoved')&&(CML.scriptAPI.helpers.round(t.shared.playerPos[0],1000)!=CML.scriptAPI.helpers.round(r.x,1000)||CML.scriptAPI.helpers.round(t.shared.playerPos[1],1000)!=CML.scriptAPI.helpers.round(r.y,1000))){CML.mapData.script.exports.onPlayerMoved({x:CML.scriptAPI.helpers.round(t.shared.playerPos[0],1000),y:CML.scriptAPI.helpers.round(t.shared.playerPos[1],1000)},{x:CML.scriptAPI.helpers.round(r.x,1000),y:CML.scriptAPI.helpers.round(r.y,1000)})};t.shared.playerPos[0]",
	},
];

exports.onGameLoaded = async function () {
	if (!gameInstance.state.store.world.mapHash) gameInstance.state.store.world.mapHash = CML.mapData.hash;

	const scriptExports = {};
	const scriptWrapper = new Function("exports", CML.mapData.script.raw);
	scriptWrapper(scriptExports);
	CML.mapData.script.exports = scriptExports;
};

exports.onMenuLoaded = async function () {
	// Exposes maps in case other mods want to use them without refetching
	CML.maps = await (await fetch("custommaploader/maps")).json();
	CML.selectedMap = (await modConfig.get("custommaploader")).map;
	if (!CML.maps.hasOwnProperty(CML.selectedMap)) {
		CML.selectedMap = "default";
	}
	const options = Object.keys(CML.maps).map((name) => {
		if (name == CML.selectedMap) return `<option value="${name}" selected>${name}</option>`;
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
		CML.internals.mapWarn = undefined;
		CML.selectedMap = newSelection;
		const map = CML.maps[newSelection];
		// Warnings are not for errors, those can be handled after.
		if (map && map.valid) {
			if (map.scale > 3) {
				return (CML.internals.mapWarn = `This map is ${map.scale}x scale (${map.width}x${map.width}). This map may not load on your machine or may cause other unexpected issues since it is bigger than 3x.`);
			}
		}
		modConfig.set("custommaploader", { map: newSelection });
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
</form>
<p style="font-size:12px">[CML v${exports.modinfo.version}]</p>`;
	let interval = setInterval(() => {
		const ui = document.querySelector(
			"#ui > div.fixed.inset-0.flex.items-center.justify-center.pointer-events-none.mt-40 > div > div.bg-opacity-25.text-white.flex.flex-col.items-center.justify-center.relative"
		);
		if (!ui) return;
		clearInterval(interval);
		ui.appendChild(selector);
		selectionChanged(CML.selectedMap);
		document.getElementById("CML_mapSelector").addEventListener("change", function () {
			selectionChanged(this.value);
		});
	}, 100);
};
