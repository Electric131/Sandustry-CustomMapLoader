globalThis.CML = {
	internals: {}, // Used internally by the mod to store info
	mapData: {},
};

// DO NOT MODIFY DATA BELOW - IF YOU WANT TO MODIFY THESE, DO SO IN THE `meta.json` FILE
// ANY CHANGES TO THESE OBJECTS WILL BE MADE GLOBALLY TO EVERY INSTALLED MAP

const searchParams = new URLSearchParams(window.location.search);
const inMainMenu = searchParams.size === 0 || (searchParams.has("skip_version_check") && searchParams.size === 1);
if (!inMainMenu) {
	// Fetch map data and load it into the global scope
	CML.mapData = await fluxloaderAPI.invokeElectronIPC("CML:getMapData");
	if (!CML.mapData.valid) window.location.href = window.location.pathname; // Sends the player back to the main menu
	log("info", "Custom Map Loader", `Map data ready at ${performance.now()}`);
}

let config = await fluxloaderAPI.modConfig.get("custommaploader");
const mapDataTemplate = await fluxloaderAPI.invokeElectronIPC("CML:getMapDataTemplate");

// const particleCache = {};
// #region Internals
CML.internals.menuWarn = function (originalFunction) {
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
            <p style="color: white; max-width: 500px">${CML.internals.mapWarn}</p>
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
		delete CML.internals.mapWarn;
	} else {
		originalFunction();
	}
};

CML.internals.loadSave = async function (originalFunction, saveId) {
	const selected = CML.maps[CML.selectedMap];
	if (!selected || !selected.valid) {
		throw new Error("[Custom Map Loader] Tried to load save with an invalid map");
	}
	// Generic errors for ANY form of loading a save (whether new or old)
	if (selected.width / 1280 > 3) {
		CML.internals.mapWarn = `This map is ${selected.width / 1280}x scale (${selected.width}x${selected.height}). This map may not load on your machine or may cause other unexpected issues since it is bigger than 3x.`;
	}
	// If a save is given, check if the map and version match
	if (saveId) {
		try {
			// Check tag for only old saves
			const mapTag = JSON.parse((await fluxloaderAPI.invokeElectronIPC("CML:loadSave", saveId)).split("\n")[1]).world.mapTag;
			if (mapTag && `${selected.id}-v${selected.version}` !== mapTag) {
				CML.internals.mapWarn = `The save you are loading was created with '${mapTag}', but you are loading it with '${selected.id}-v${selected.version}'`;
			}
			CML.internals.menuWarn(originalFunction);
			res();
		} catch {
			log("warn", "Custom Map Loader", `Error when parsing info for save '${saveId}'`);
			rej();
		}
	} else {
		CML.internals.menuWarn(originalFunction);
	}
};

CML.internals.initColors = function () {
	let data = CML.internals.tryGetData();
	if (!data) throw new Error("[Custom Map Loader] Map data was not ready during color init");
	CML.internals.loadedColors = {
		elements: {},
		particles: data.meta.colors.particles || {},
	};
	// Load colors of elements (e.g. FogWater, Fog, SandSoil, etc.)
	let colors = data.meta.colors.elements;
	// Swap keys and values of colors
	for (const color of Object.keys(colors)) {
		if (Object.keys(CML.internals.loadedColors.elements).includes(colors[color])) {
			throw new Error(`[Custom Map Loader] Duplicate element color found during world creation: ${colors[color]}`);
		}
		if (typeof colors[color] != "object") CML.internals.loadedColors.elements[colors[color]] = color;
	}
};

// DO NOT MODIFY DATA BELOW - IF YOU WANT TO MODIFY THESE, DO SO IN THE `meta.json` FILE
// ANY CHANGES TO THESE COLOR MAPS WILL BE MADE GLOBALLY TO EVERY INSTALLED MAP

const basicColorMap = {
	Empty: "255, 255, 255",
	Bedrock: "170, 170, 170",
	SurfaceWater: "102, 0, 255",
	Ice: "102, 204, 255",
	RevealedFog: "153, 0, 0", // Not actually Fog, it's just Empty with a dirt background..?
};

// Converts basicColorMap - which is only basic colors in the switch statement
// isWall is just a weird way to detect if we should hide this color from the background
CML.internals.convertColor = function (color, isWall) {
	if (!CML.internals.loadedColors) CML.internals.initColors();
	// If the color is a particle, and we're rendering the wall, treat this as empty space
	if (Object.keys(CML.internals.loadedColors.particles).includes(color) && isWall) return "255, 255, 255";
	if (!Object.keys(CML.internals.loadedColors.elements).includes(color)) return color;
	if (!Object.keys(basicColorMap).includes(CML.internals.loadedColors.elements[color])) return color;
	return basicColorMap[CML.internals.loadedColors.elements[color]];
};

const advancedColorMap = {
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
	AlternateFog: "51, 51, 51", // Only used in the artifact rooms from what I can tell, is just a darker version of BedrockFog
	SandSoil: "0, 0, 255", // Blame Lantto... apparently this is just SandSoil without dirt background
};

// Converts advancedColorMap - stored as `mapColors` (corelib) / `Fd` in the code
// Then also adds any custom element colors defined
CML.internals.addExtraColors = function () {
	if (!corelib.exposed.named.mapColors) throw new Error("[Custom Map Loader] Color table was not ready at world creation");
	const original = JSON.parse(JSON.stringify(corelib.exposed.named.mapColors));
	let data = CML.internals.tryGetData();
	if (!CML.internals.loadedColors) CML.internals.initColors();
	for (const tile of Object.values(CML.internals.loadedColors.elements)) {
		if (!advancedColorMap.hasOwnProperty(tile)) continue;
		corelib.exposed.named.mapColors[data.meta.colors.elements[tile]] = original[advancedColorMap[tile]];
	}

	for (const [color, elementData] of Object.entries(data.meta.colors.elements)) {
		if (typeof elementData == "object") {
			if (elementData.bg) {
				if (!corelib.exposed.named.soils.hasOwnProperty(elementData.bg)) {
					throw new Error(`[Custom Map Loader] Unknown background element '${elementData.bg}' in element color list`);
				}
				elementData.bg = corelib.exposed.named.soils[elementData.bg];
			}
			if (elementData.fg) {
				if (!corelib.exposed.named.soils.hasOwnProperty(elementData.fg)) {
					throw new Error(`[Custom Map Loader] Unknown foreground element '${elementData.fg}' in element color list`);
				}
				elementData.fg = corelib.exposed.named.soils[elementData.fg];
			}
			corelib.exposed.named.mapColors[color] = elementData;
		}
	}
};

// Check if the color given is a particle, and if so, spawn the particle instead
CML.internals.handleParticle = function (color) {
	if (!CML.internals.loadedColors) CML.internals.initColors();
	return CML.internals.loadedColors.particles[color];
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
	if (!CML.mapData) throw new Error("[Custom Map Loader] Map data was not ready when player unstuck was requested.");
	fluxloaderAPI.gameInstance.state.store.player.x = CML.mapData.meta.unstuck.x * constants.cellSize;
	fluxloaderAPI.gameInstance.state.store.player.y = CML.mapData.meta.unstuck.y * constants.cellSize;
	fluxloaderAPI.events.trigger("CML:playerUnstuck");
};

CML.internals.landingHelper = function (_) {
	const input = fluxloaderAPI.gameInstance.state.session.input;
	const soundEngine = fluxloaderAPI.gameInstance.state.session.soundEngine;
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

CML.internals.playerLanding = function (playSound, stopSound, endCallback) {
	if (!CML.mapData) throw new Error("[Custom Map Loader] Map data was not ready when player landing was requested.");
	const elapsedTime = fluxloaderAPI.gameInstance.state.store.scene.start + fluxloaderAPI.gameInstance.state.store.meta.time;
	if (elapsedTime >= 8000) return endCallback(); // Cut off sequence at 8 seconds as a fallback
	if (!CML.internals.landingIndex) CML.internals.landingIndex = 0;
	const sequenceLength = Object.keys(CML.mapData.meta.introSequence).length;
	if (CML.mapData.meta.introSequence && sequenceLength > 0) {
		if (CML.internals.landingIndex >= sequenceLength) return endCallback();
		let entry = Object.entries(CML.mapData.meta.introSequence)[CML.internals.landingIndex];
		if (elapsedTime >= entry[0]) {
			CML.internals.landingHelper({
				instruction: entry[1],
				playSound,
				stopSound,
				endCallback,
			});
			CML.internals.landingIndex++;
		}
	}
};

CML.internals.playerFog = function (y) {
	// These are defined by the game
	const data = CML.internals.tryGetData().meta;
	const [start, end, max, min] = [data.fog.startY, data.fog.endY, data.fog.max, data.fog.min];
	if (min > max || min < 0 || start > end) throw new Error("[Custom Map Loader] Invalid fog settings.");
	if (y <= start) return max;
	if (y >= end) return min;
	return max - (y - start) * ((max - min) / (end - start));
};

CML.internals.appendDisplayTag = function (version) {
	if (!CML.mapData) return version;
	let formattedName = "";
	switch (config.mapNameFormat) {
		case "Name (v1.0.0) [1x]":
			formattedName = `${CML.mapData.name} (v${CML.mapData.version}) [${CML.mapData.width / 1280}x]`;
			break;
		case "Name (v1.0.0) [1280x1280]":
			formattedName = `${CML.mapData.name} (v${CML.mapData.version}) [${CML.mapData.width}x${CML.mapData.height}]`;
			break;
		case "Name (v1.0.0)":
			formattedName = `${CML.mapData.name} (v${CML.mapData.version})`;
			break;
	}
	return `${formattedName}\n${version}`;
};

CML.internals.createMenuUI = function () {
	CML.selectedMap = config.map;
	if (!CML.maps.hasOwnProperty(CML.selectedMap)) {
		CML.selectedMap = "default";
	}
	const options = Object.values(CML.maps)
		.filter((map) => map.valid)
		.map((map) => {
			let formattedName = map.name; // Fallback name
			switch (config.mapNameFormat) {
				case "Name (v1.0.0) [1x]":
					formattedName = `${map.name} (v${map.version}) [${map.width / 1280}x]`;
					break;
				case "Name (v1.0.0) [1280x1280]":
					formattedName = `${map.name} (v${map.version}) [${map.width}x${map.height}]`;
					break;
				case "Name (v1.0.0)":
					formattedName = `${map.name} (v${map.version})`;
					break;
			}
			return React.createElement(
				"option",
				{
					selected: map.id == CML.selectedMap,
					value: map.id,
				},
				formattedName,
			);
		});

	const loadingErrors = document.createElement("div");
	loadingErrors.id = "CML_loadingErrors";
	loadingErrors.style.position = "absolute";
	loadingErrors.style.top = "0";
	loadingErrors.style.left = "0";
	loadingErrors.style.pointerEvents = "auto";
	loadingErrors.style.color = "rgb(255, 0, 0)";
	loadingErrors.style.maxWidth = "calc(100% - 20vh)";
	loadingErrors.style.fontSize = "1.5h";
	loadingErrors.innerHTML = "";

	let errors = Object.values(CML.maps)
		.filter((map) => !map.valid)
		.map((map) => `${map.name}: ${map.error}`);
	if (errors.length > 0) {
		loadingErrors.innerHTML = `Errors while loading maps:<br>${errors.join("<br>")}<br>Check log for more details`;
	}

	document.body.appendChild(loadingErrors);

	async function selectionChanged(newSelection) {
		delete CML.internals.mapWarn;
		CML.selectedMap = newSelection;
		let config = await fluxloaderAPI.modConfig.get("custommaploader");
		config.map = newSelection;
		fluxloaderAPI.modConfig.set("custommaploader", config);
	}

	delete CML.internals.mapWarn;

	return React.createElement(
		"div",
		{
			style: {
				position: "absolute",
				pointerEvents: "auto",
				transform: "translate(-15rem, -4rem)",
				color: "rgb(0,0,0)",
			},
		},
		[
			React.createElement("form", { className: "max-w-sm mx-auto" }, [
				React.createElement("label", { htmlFor: "CML_mapSelector", className: "block mb-2 text-base font-medium text-gray-900 dark:text-white" }, "Select Map"),
				React.createElement(
					"select",
					{
						id: "CML_mapSelector",
						onChange: async (e) => {
							await selectionChanged(e.target.value);
						},
						className:
							"bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500",
						style: {
							"max-width": "10rem",
							width: "10rem",
						},
					},
					options,
				),
			]),
			React.createElement("p", { style: { fontSize: "12px" } }, "[CML v4.1.1]"),
		],
	);
};

// Allows requesting data, but resorts to defaults if not ready
CML.internals.tryGetData = function () {
	if (!CML.mapData) return JSON.parse(JSON.stringify(mapDataTemplate));
	return CML.mapData;
};

fluxloaderAPI.events.on("fl:scene-loaded", async (scene) => {
	if (scene !== "mainmenu") {
		fluxloaderAPI.gameInstance.state.store.world.mapTag = `${CML.mapData.id}-v${CML.mapData.version}`;
		fluxloaderAPI.events.trigger("CML:mapLoaded", CML.mapData.id);
		fluxloaderAPI.sendWorkerMessage("CML:mapDataReady", CML.mapData);
		return;
	}
	// Exposes maps in case other mods want to use them
	CML.maps = await fluxloaderAPI.invokeElectronIPC("CML:getMaps");
	config = await fluxloaderAPI.modConfig.get("custommaploader");
});

fluxloaderAPI.events.registerEvent("CML:mapLoaded");
fluxloaderAPI.events.registerEvent("CML:playerLanded");
fluxloaderAPI.events.registerEvent("CML:playerUnstuck");
