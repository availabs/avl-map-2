import colorbrewer from "colorbrewer"

import get from "lodash.get"

const ColorRanges = {};
const ColorRangesByType = {};

for (const type in colorbrewer.schemeGroups) {
  ColorRangesByType[type] = {};
	colorbrewer.schemeGroups[type].forEach(name => {
		const group = colorbrewer[name];
    ColorRangesByType[type][name] = group;
		for (const length in group) {
			if (!(length in ColorRanges)) {
				ColorRanges[length] = [];
			}
			ColorRanges[length].push({
				type: `${ type[0].toUpperCase() }${ type.slice(1) }`,
				name,
				category: "Colorbrewer",
				colors: group[length]
			})
		}
	})
}

export { ColorRanges, ColorRangesByType };

console.log("ColorRanges:", ColorRanges)

export const getColorRange = (size, name, reverse=false) => {
	let range = get(ColorRanges, [size], [])
		.reduce((a, c) => c.name === name ? c.colors : a, []).slice();
	if (reverse) {
		return [...range].reverse();
	}
	return range
}

export const ColorBar = ({ colors, height = 4 }) => {
  return (
    <div className="flex rounded overflow-hidden"
      style={ { height: `${ height * 0.25 }rem`} }
    >
      { colors.map(c => (
          <div key={ c } className="flex-1"
            style={ {
              backgroundColor: c
            } }/>
        ))
      }
    </div>
  )
}
