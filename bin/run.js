const tester = require('../lib/tester.js')
const {getopt} = require('stdio')

const options = getopt({
	body: {key: 'b', args: 1, description: 'Body to send', default: ''},
	file: {key: 'f', args: 1, description: 'File with body to send', default: ''},
	number: {key: 'n', args: 1, description: 'Number of requests to send', default: 1},
	concurrency: {key: 'c', args: 1, description: 'Number of parallel invocations', default: 1},
	endpoint: {key: 'e', args: 1, mandatory: true, description: 'Endpoint for Lambda function'},
})

tester.run(options).catch(error => console.error(`Could not run tests for ${options.endpoint}: ${error}`))

