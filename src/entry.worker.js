globalThis.CML = {
	internals: {}, // Used internally by the mod to store info
	mapData: {},
};

// Allows requesting data, but resorts to defaults if not ready
CML.internals.tryGetData = function () {
	if (!CML.mapData) return JSON.parse(JSON.stringify(mapDataTemplate));
	return CML.mapData;
};

// Not for use by maps. Use `mapLoaded` instead
fluxloaderAPI.listenGameMessage("CML:mapDataReady", (data) => {
	CML.mapData = data;
	fluxloaderAPI.events.trigger("CML:mapLoaded", CML.mapData.id);
});

fluxloaderAPI.events.registerEvent("CML:mapLoaded");
