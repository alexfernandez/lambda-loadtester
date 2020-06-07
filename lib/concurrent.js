
function runInParallel(calls, concurrency) {
	if (!concurrency) return Promise.all(calls)
	return new ParallelRunner(calls, concurrency).run()
}

class ParallelRunner {
	constructor(calls, concurrency) {
		this.calls = calls
		this.concurrency = concurrency
		this.start = 0
		this.inFlight = 0
		this.finished = 0
		this.results = []
		this.resolve = null
		this.reject = null
	}

	run() {
		return new Promise((resolve, reject) => {
			this.resolve = resolve
			this.reject = reject
			this.runSome()
		})
	}

	runSome() {
		while (this.start < this.calls.length && this.inFlight < this.concurrency) {
			const current = this.start
			const call = this.calls[current]
			console.log(`${new Date().toISOString()} - Running function #${current}`)
			call().then(result => {
				this.results[current] = result
				this.inFlight -= 1
				this.finished += 1
				if (this.finished == this.calls.length) {
					return this.resolve(this.results)
				}
				this.runSome()
			}).catch(error => {
				console.error(`Could not run function #${current}: ${error}`)
				this.start = this.calls.length
				this.reject(error)
			})
			this.start += 1
			this.inFlight += 1
		}
	}
}

module.exports = {runInParallel}

