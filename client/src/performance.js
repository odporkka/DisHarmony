const { performance, PerformanceObserver } = require('perf_hooks')

const perfObserver = new PerformanceObserver((items) => {
    items.getEntries().forEach((entry) => {
        console.log(entry)
    })
})

perfObserver.observe({entryTypes: ["measure"], buffer: true})

module.exports = performance