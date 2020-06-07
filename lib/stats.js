
function computeStats(results) {
	const map = new Map()
	for (const result of results) {
		for (const key of Object.keys(result)) {
			const value = result[key]
			if (value) {
				if (!map.has(key)) {
					map.set(key, [])
				}
				map.get(key).push(value)
			}
		}
	}
	const result = {}
	for (const key of map.keys()) {
		result[key] = getStats(map.get(key))
	}
	return result
}

function getStats(array) {
	if (!array.length) return {}
	let sum = 0
	let min = Number.MAX_SAFE_INTEGER
	let max = 0
	for (const element of array) {
		if (typeof element == 'number') {
			sum += element
			if (element > max) max = element
			if (element < min) min = element
		}
	}
	if (!sum) return countElements(array)
	const average = sum / array.length
	if (array.length == 1) return {number: array.length, average, stdev: 0}
	let squares = 0
	for (const element of array) {
		squares += (element - average) ** 2
	}
	const stdev = Math.round(Math.sqrt(squares / (array.length - 1)))
	return {number: array.length, average: Math.round(average), stdev, min, max, sum}
}

function countElements(array) {
	const occurrences = {}
	for (const element of array) {
		if (!occurrences[element]) occurrences[element] = 0
		occurrences[element] += 1
	}
	if (Object.keys(occurrences).length > array.length / 10) return {number: array.length}
	return {number: array.length, ...occurrences}
}

module.exports = {computeStats}

