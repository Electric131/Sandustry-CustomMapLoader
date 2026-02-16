// DO NOT MODIFY DATA BELOW - IF YOU WANT TO MODIFY THESE, DO SO IN THE `meta.json` FILE
// ANY CHANGES TO THESE OBJECTS WILL BE MADE GLOBALLY TO EVERY INSTALLED MAP

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
		JetpackFrostBed: "204, 255, 255",
		CaveFrostBed: "153, 255, 255",
		Fog: "153, 51, 0",
		JetpackFog: "255, 0, 153",
		JetpackFogWater: "102, 102, 255",
		BedrockFog: "102, 102, 102",
		FogWater: "153, 102, 255",
		FogLava: "255, 102, 0",
		Fluxite: "175, 0, 224",
		RedsandSoil: "255, 85, 0",
		Crackstone: "205, 139, 139",
		AlternateFog: "51, 51, 51",
		RevealedFogWater: "0, 0, 255",
	},
};

// The base map data for every map
const mapDataTemplate = {
	valid: true,
	error: undefined, // Error is only defined if `valid` is false and no other data will be present
	name: "Template",
	id: "template",
	version: "1.0.0",
	author: "exampleauthor",
	width: 1280,
	height: 1280,
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
			startY: 3400,
			endY: 4200,
			max: 700,
			min: 200,
		},
		colors: templateColors,
	},
};

let loadedMapData;

function loadMap(mapData) {
	log("debug", "Custom Map Loader", "Loading map..");
	// Make sure initial data exists (most likely taken from modinfo)
	if (!mapData) throw new Error("[Custom Map Loader] No map data provided");
	if (!mapData.name) throw new Error("[Custom Map Loader] Map data has no name");
	if (!mapData.id) throw new Error("[Custom Map Loader] Map data has no id");
	if (!mapData.version) throw new Error("[Custom Map Loader] Map data has no version");
	if (!mapData.author) throw new Error("[Custom Map Loader] Map data has no author");
	if (!mapData.path) throw new Error("[Custom Map Loader] Map data has no path");
	log("info", "Custom Map Loader", `Initial data ready; Loading files for map '${mapData.id}-v${mapData.version}' ('${mapData.name}')`);

	let finalData = {
		valid: true,
		name: mapData.name,
		id: mapData.id,
		version: mapData.version,
		author: mapData.author,
		path: mapData.path,
		meta: JSON.parse(JSON.stringify(mapDataTemplate.meta)), // Copy default meta
	};

	try {
		const mapFiles = ["map_blueprint_playtest.png", "map_blueprint_playtest_authorization.png", "map_blueprint_playtest_lights.png", "map_blueprint_playtest_sensors.png", "fog_playtest.png", "meta.json"];
		for (let file of mapFiles) {
			let exists = fs.existsSync(`${mapData.path}/${file}`);
			// Make sure file exists, unless it's the meta.json since that's optional
			if (!exists) {
				if (file === "meta.json") continue;
				throw new Error(`Could not find map file '${mapData.path}/${file}'`);
			}
			// Reads file or uses template if it's requesting the meta for the default map
			let data = mapData.id === "default" && file === "meta.json" ? JSON.stringify(mapDataTemplate.meta) : fs.readFileSync(`${mapData.path}/${file}`);
			switch (file) {
				case "meta.json":
					if (mapData.id === "default") break; // Default map doesn't need to check meta
					data = JSON.parse(data.toString());
					// List of paths that must be entirely defined if present (no sub-property can use the defaults)
					const skipDefaults = ["meta.introSequence"];
					recursiveMetaCheck(finalData.meta, data, mapDataTemplate.meta);
					function recursiveMetaCheck(modified, data, defaults, path = ["meta"]) {
						for (const [key, value] of Object.entries(data)) {
							let localPath = path.concat(key);
							const pathString = localPath.join(".");
							if (defaults.hasOwnProperty(key) && typeof value != typeof defaults[key]) {
								throw new Error(`Value at meta path '${pathString}' does not match the expected type.`);
							}
							if (typeof value == "object") {
								if (skipDefaults.includes(pathString)) {
									modified[key] = value;
									continue;
								}
								if (!defaults.hasOwnProperty(key)) modified[key] = value;
								recursiveMetaCheck(modified[key], value, defaults.hasOwnProperty(key) ? defaults[key] : {}, localPath);
							} else {
								modified[key] = value;
							}
						}
						return;
					}
					break;
				default:
					let width = data.readUInt32BE(16);
					let height = data.readUInt32BE(20);
					if (!finalData.hasOwnProperty("width")) {
						finalData.width = width;
						finalData.height = height;
					} else if (width != finalData.width || height != finalData.height) {
						if (mapData.id === "default" && file === "fog_playtest.png") continue; // Curse you lantto
						throw new Error(`Dimension mismatch: '${file}' was expected to be ${finalData.width}x${finalData.height}, but was ${width}x${height}`);
					}
			}
		}
	} catch (e) {
		log("error", "Custom Map Loader", e.message);
		return {
			valid: false,
			error: e.message,
			// I guess this is still useful information
			name: mapData.name,
			id: mapData.id,
			version: mapData.version,
			author: mapData.author,
			path: mapData.path,
		};
	}
	return finalData;
}

const loadedMaps = {};

loadedMaps["default"] = loadMap({
	name: "Default",
	id: "default",
	version: "1.0.0",
	author: "Lantto",
	path: fluxloaderAPI.getGameAsarPath() + "/img",
});

fluxloaderAPI.events.on("fl:mod-loaded", (mod) => {
	if (mod.info.tags.includes("map")) {
		let mapData = loadMap({
			name: mod.info.name,
			id: mod.info.modID,
			version: mod.info.version,
			author: mod.info.author,
			path: mod.path,
		});
		loadedMaps[mod.info.modID] = mapData;
	}
});

fluxloaderAPI.events.on("fl:mod-unloaded", (mod) => {
	if (mod.info.tags.includes("map")) {
		delete loadedMaps[mod.info.modID];
	}
});

fluxloaderAPI.events.on("fl:pre-scene-loaded", async (scene) => {
	// Unload any loaded map when any scene change happens
	if (loadedMapData) {
		await fluxloaderAPI.events.trigger("CML:mapUnloaded", loadedMapData.id);
		unloadPatches();
		loadedMapData = undefined;
	}
	// Reload all maps data for hot reloading
	for (const map of Object.values(loadedMaps)) {
		loadedMaps[map.id] = loadMap({
			name: map.name,
			id: map.id,
			version: map.version,
			author: map.author,
			path: map.path,
		});
	}
	if (scene === "game" || scene === "intro") {
		const config = await fluxloaderAPI.modConfig.get("custommaploader");
		if (!config.map) throw new Error(`[Custom Map Loader] No map provided! Check config!`); // Hopefully fluxloader prevents this..
		if (!Object.keys(loadedMaps).includes(config.map)) throw new Error(`[Custom Map Loader] Invalid/Unknown map '${config.map}'`);
		loadedMapData = loadedMaps[config.map];
		const files = ["map_blueprint_playtest.png", "map_blueprint_playtest_authorization.png", "map_blueprint_playtest_lights.png", "map_blueprint_playtest_sensors.png", "fog_playtest.png"];
		for (const file of files) {
			const filePath = `${loadedMapData.path}/${file}`;
			if (fs.existsSync(filePath)) {
				fluxloaderAPI.setPatch(`img/${file}`, `CML:${file}`, {
					type: "overwrite",
					file: filePath,
				});
			}
		}
		loadPatches(config.map);
		await fluxloaderAPI.events.trigger("CML:mapLoaded", loadedMapData.id);
	}
});

fluxloaderAPI.handleGameIPC("CML:getMapDataTemplate", (event, args) => {
	return mapDataTemplate;
});

fluxloaderAPI.handleGameIPC("CML:getMapData", (event, args) => {
	return loadedMapData;
});

fluxloaderAPI.handleGameIPC("CML:getMaps", (event, args) => {
	return loadedMaps;
});

fluxloaderAPI.handleGameIPC("CML:loadSave", (event, args) => {
	log("debug", "Custom Map Loader", `Attempting to load save '${args}'`);
	let appDataPath;
	if (process.platform === "win32") {
		appDataPath = process.env.APPDATA;
	} else if (process.platform === "darwin") {
		appDataPath = path.join(process.env.HOME, "Library", "Application Support");
	} else {
		appDataPath = process.env.XDG_CONFIG_HOME || path.join(process.env.HOME, ".config");
	}
	if (!appDataPath) throw new Error(`[Custom Map Loader] Could not find appData path`);
	try {
		let savePath = path.join(appDataPath, "sandustrydemo", "saves", args + ".save");
		log("debug", "Custom Map Loader", `Located save file at '${savePath}'`);
		return fs.readFileSync(savePath).toString();
	} catch {
		log("error", "Custom Map Loader", `Loading save '${args}' failed!`);
	}
});

var mapPatches = {};
var trackedPatches = {};

function loadPatches(mapID) {
	log("debug", "Custom Map Loader", `Loading patches for map: '${mapID}'`);
	if (mapID !== "default") {
		// Load patches that are used for meta files
		if (!trackedPatches.hasOwnProperty("js/bundle.js")) trackedPatches["js/bundle.js"] = [];
		for (let [tag, patch] of Object.entries(customOnlyPatches)) {
			fluxloaderAPI.setPatch("js/bundle.js", `CML:core-map:${tag}`, patch);
			trackedPatches["js/bundle.js"].push(`CML:core-map:${tag}`);
		}
	}
	if (!mapPatches.hasOwnProperty(mapID)) return; // No patches for this map
	for (let [file, patches] of Object.entries(mapPatches[mapID])) {
		if (!trackedPatches.hasOwnProperty(file)) trackedPatches[file] = [];
		let patchIndex = 0;
		for (let patch of patches) {
			let tag = `CML:map-${mapID}:patch${patchIndex++}`;
			fluxloaderAPI.setPatch(file, tag, patch);
			trackedPatches[file].push(tag);
		}
	}
}

function unloadPatches() {
	for (let [file, patches] of Object.entries(trackedPatches)) {
		for (let patch of patches) {
			fluxloaderAPI.removePatch(file, patch);
		}
	}
	trackedPatches = {};
}

globalThis.CML = {
	registerMapPatches: (mapID, data) => {
		mapPatches[mapID] = data;
	},
};

// Patches that will only be added if a map other than the default map is being loaded
const customOnlyPatches = {
	customColors: {
		// World creation - pixel loop starting
		type: "replace",
		from: "for(var i=performance.now()",
		to: `CML.internals.addExtraColors();~`,
		token: "~",
	},
	colorReplacements: {
		// World creation - color conversion
		type: "replace",
		from: "switch(b)",
		to: "b=CML.internals.convertColor(b,false);switch(b)",
	},
	particleSpawning: {
		// World creation - color lookup
		type: "replace",
		from: `var w=Fd["".concat(y,", ").concat(v,", ").concat(x)];`,
		to: `var w=Fd[b];let res=CML.internals.handleParticle(b);if(res){let pixel=Fh(n[res],m,p);pixel.bg=5;h[p][m]=pixel;break;}`,
	},
	replaceWallColors: {
		// World creation - wall data
		type: "replace",
		from: 'f="".concat(c,", ").concat(h,", ").concat(d);',
		to: "~f=CML.internals.convertColor(f,true);",
		token: "~",
	},
	fixForegroundCheck: {
		// World creation - color lookup case 2
		type: "replace",
		from: "(Number.isInteger(w)||(w=w.fg),!w)",
		to: "(Number.isInteger(w)||(w=w.fg),w==undefined)",
	},
	playerSpawn: {
		// World creation - player spawn
		type: "replace",
		from: "{x:363*e.cellSize,y:200*e.cellSize}",
		to: `CML.internals.playerSpawnPos(e)`,
	},
	unstuckButton: {
		// Unstuck button
		type: "replace",
		from: "t.state.store.player.x=161*e.cellSize,t.state.store.player.y=616*e.cellSize",
		to: `CML.internals.playerUnstuck(e)`,
	},
	landingSequence: {
		// Intro timing sequence
		type: "regex",
		pattern: 'case x\\.Intro:.*?if\\((.+?),!e\\.store\\.scene\\.triggers\\[0\\].+?(\\w+)\\(e\\.session\\.soundEngine,"boost"\\).+?(\\w+)\\(e\\.session\\.soundEngine,"boost"\\).+(e\\.store\\.scene\\.active=x\\.Game.+?)}break;case',
		replace: "case x.Intro:$1;CML.internals.playerLanding($2,$3,function(){fluxloaderAPI.events.trigger('CML:playerLanded');$4});break;case",
	},
	mapTag: {
		// World loading - game version tag added
		type: "regex",
		pattern: `transformOrigin:"bottom right"}},{children:"(v\\S+)"`,
		replace: `transformOrigin:"bottom right",whiteSpace:"pre-wrap"}},{children:CML.internals.appendDisplayTag("$1")`,
	},
	fogAdjustment: {
		// Player fog change
		type: "replace",
		from: "(l=i.y)<=3400?700:l>=4200?200:700-(l-3400)/800*500",
		to: "CML.internals.playerFog(l=i.y)",
	},
	parallaxScale: {
		// Parallax scale adjustment
		type: "regex",
		pattern: "n\\.session\\.camera\\.(x|y)\\/((?:1\\.5)|2)\\)",
		replace: `n.session.camera.$1/($2*(CML.internals.tryGetData().width/1280)))`,
		expectedMatches: 4,
	},
	parallaxShift: {
		// Parallax vertical adjustment
		type: "replace",
		from: "Math.round(-n.session.camera.y",
		to: `Math.round(-(n.session.camera.y+CML.internals.tryGetData().meta.parallaxOffset)`,
		expectedMatches: 2,
	},
	softYLimit: {
		// Soft y limit
		type: "replace",
		from: "n.y<600",
		to: "n.y<CML.internals.tryGetData().meta.yLimit.soft",
	},
	hardYLimit: {
		// Hard y limit
		type: "replace",
		from: "s<550?(s=550",
		to: "s<CML.internals.tryGetData().meta.yLimit.hard?(s=CML.internals.tryGetData().meta.yLimit.hard",
	},
};

// return e.state.store.scene.active!==x.MainMenu

// Other patches that are needed for core behaviors and don't modify gameplay
const patches = {
	mainMenuUI: {
		type: "replace",
		from: "children:[(0,bm.jsx)(G_,{})",
		to: "~,CML.internals.createMenuUI()",
		token: "~",
	},
	colorXYLogFix: {
		// Show x, y of invalid colors during world creation - helps debug map creation
		type: "replace",
		from: '"+"".concat(y,", ").concat(v,", ").concat(x)',
		to: "~ + ` at {x: ${m}, y: ${p}}`",
		token: "~",
		expectedMatches: 2,
	},
	continueIntercept: {
		// Main menu 'Continue' button intercept
		type: "replace",
		from: 'b_("db_load=".concat(r))',
		to: "CML.internals.loadSave(()=>{~}, r)",
		token: "~",
	},
	newIntercept: {
		// Main menu 'New' button intercept
		type: "replace",
		from: 'b_("new_game=true")',
		to: "CML.internals.loadSave(()=>{~})",
		token: "~",
	},
	loadIntercept: {
		// Main menu 'Load' button intercept
		type: "replace",
		from: 'e&&b_("db_load="+e.id)',
		to: "CML.internals.loadSave(() => {~}, e.id)",
		token: "~",
	},
};

for (const [tag, patch] of Object.entries(patches)) {
	fluxloaderAPI.setPatch("js/bundle.js", `CML:core:${tag}`, patch);
}

// mapLoaded(mapID)
fluxloaderAPI.events.registerEvent("CML:mapLoaded");
// mapUnloaded(mapID)
fluxloaderAPI.events.registerEvent("CML:mapUnloaded");
