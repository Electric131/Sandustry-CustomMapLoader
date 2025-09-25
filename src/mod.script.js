export function modifySchema(schema) {
	const maps = Object.values(fluxloaderAPI.getEnabledMods()).filter((mod) => mod.info.tags.includes("map"));
	schema.map.options = schema.map.options.concat(maps.map((mod) => mod.info.modID));
}
