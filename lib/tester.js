const aws = require('aws-sdk')
const fs = require('fs').promises
const http = require('http');
const https = require('https');
const {runInParallel} = require('./concurrent.js')
const {computeStats} = require('./stats.js')

aws.config.loadFromPath(__dirname + '/../aws-config.json')
const lambda = new aws.Lambda()
const billedMsRegexp = /Billed Duration: (\d*) ms/
const memoryMbRegexp = /Max Memory Used: (\d*) MB/

async function run(options) {
	// set max sockets for aws-sdk
	https.globalAgent.maxSockets = parseInt(options.concurrency)
	http.globalAgent.maxSockets = parseInt(options.concurrency)
	const results = await invokeAll(options)
	await formatAndWrite(options.output, results)
	const stats = computeStats(results)
	console.log(stats)
}

async function formatAndWrite(path, results) {
	if (!path) return
	const formatted = results.map(JSON.stringify)
	const output = `[\n  ${formatted.join(',\n  ')}\n]`
	await fs.writeFile(path, output)
}

async function invokeAll(options) {
	const start = Date.now()
	const body = await getBody(options)
	const calls = []
	for (let i = 0; i < options.number; i++) {
		calls.push(() => invokeLambda(body, options))
	}
	const result = await runInParallel(calls, options.concurrency)
	const elapsed = (Date.now() - start)/1000
	console.log(`${new Date().toISOString()} - Finished ${calls.length} calls in ${elapsed.toFixed(2)} seconds`)
	return result
}

async function getBody(options) {
	if (options.body) {
		return options.body
	}
	if (options.file) {
		const file = await fs.readFile(options.file)
		return file.toString()
	}
	return {}
}

function invokeLambda(body, options) {
	return new Promise(resolve => {
		const start = Date.now()
		const params = {
			FunctionName: options.endpoint,
			LogType: 'Tail',
			Payload: JSON.stringify(body),
		}
		lambda.invoke(params, function(error, data) {
			const elapsed = Date.now() - start
			if (error) {
				console.error(`Error in ${options.endpoint}: ${error}`)
				return resolve({start, elapsed, errorType: error})
			}
			const statusCode = data.StatusCode
			const log = Buffer.from(data.LogResult, 'base64').toString()
			const billedMs = readValue(log, billedMsRegexp)
			const memoryMb = readValue(log, memoryMbRegexp)
			const result = {start, elapsed, statusCode, billedMs, memoryMb}
			console.log(`${new Date().toISOString()} - Called ${options.endpoint} (${statusCode}): ${billedMs} ms at ${memoryMb} MB`)
			return resolve(result)
		})
	})
}

function readValue(string, regexp) {
	const match = string.match(regexp)
	if (!match) return 0
	return parseInt(match[1])
}

module.exports = {run}

