import tilebelt from '@mapbox/tilebelt'
import distance from '@turf/distance'

type TileIndex = {
	x: number,
	y: number,
	z: number,
}

type VoxelIndex = {
	vx: number,
	vy: number,
	vz: number,
}


/**
 * 
 * @param tileIndex  On Which tile the voxel model will be rendered = space
 * @param resolution Resolution for space
 * @param voxelIndex Voxel area
 * @param properties Additional properties for the voxel
 * @returns 
 */
export const toVoxelFeature = (
	tileIndex: TileIndex,
	resolution: number,
	voxelIndex: VoxelIndex,
	properties: GeoJSON.GeoJsonProperties = {},
): GeoJSON.Feature<GeoJSON.Polygon> => {
	let counter = Math.floor(resolution)
	let vtile = [tileIndex.x, tileIndex.y, tileIndex.z]

	// TODO: calc directory for performance
	do {
		vtile = tilebelt.getChildren(vtile)[0]
		counter--
	} while (counter > 0);

	vtile[0] += voxelIndex.vx
	vtile[1] += voxelIndex.vy

	const polygonGeometry = tilebelt.tileToGeoJSON(vtile)

	const length1 = distance(
		polygonGeometry.coordinates[0][1],
		polygonGeometry.coordinates[0][2],
		{ units: 'meters' }
	)
	const length2 = distance(
		polygonGeometry.coordinates[0][3],
		polygonGeometry.coordinates[0][0],
		{ units: 'meters' }
	)
	const midLength = (length1 + length2) / 2

	const base = voxelIndex.vz * midLength;
	const height = base + midLength

	return {
		type: 'Feature',
		properties: {
			...properties,
			longEdge: Math.max(length1, length2),
			shortEdge: Math.min(length1, length2),
			units: 'meters',
			height,
			base,

		},
		geometry: polygonGeometry,
	}
}


// const voxelFeture = toVoxelFeature({x: 2,y: 2,z: 2}, 10, { vx: 10, vy: 10, vz: 10 })
// console.log(JSON.stringify(voxelFeture))

const voxel = [
	[ [1, 0, 1, 0, 1], [0, 1, 0, 1, 0], [1, 0, 1, 0, 1], [0, 1, 0, 1, 0] ],
	[ [0, 1, 0, 1 ,0], [1, 0, 1, 0, 1], [0, 1, 0, 1, 0], [1, 0, 1, 0, 1] ],
	[ [1, 0, 1, 0, 1], [0, 1, 0, 1, 0], [1, 0, 1, 0, 1], [0, 1, 0, 1, 0] ],
	[ [0, 1, 0, 1 ,0], [1, 0, 1, 0, 1], [0, 1, 0, 1, 0], [1, 0, 1, 0, 1] ],
]

const fc: GeoJSON.FeatureCollection = {
	type: 'FeatureCollection',
	features: []
}

for (let vz = 0; vz < voxel.length; vz++) {
	for (let vy = 0; vy < voxel.length; vy++) {
		for (let vx = 0; vx < voxel.length; vx++) {
			const value = voxel[vz][vy][vx]
			if(value) {
				const voxelFeture = toVoxelFeature(
					{ x: 2,y: 2,z: 2 },
					5,
					{ vx, vy, vz },
					{ color: `rgb(${Math.floor((Math.random() * 255)) + 1}, 20, 20)` },
				)
				fc.features.push(voxelFeture)
			}
		}
	}	
}

console.log(JSON.stringify(fc))