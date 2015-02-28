var Benchmark = require('benchmark'),
    benchmarks = require('beautify-benchmark'),
    lib = require('../index'),
    uriRegex = lib.createUriRegex(),
    suite = new Benchmark.Suite,
    testUri = 'http://google.com/';

suite.add({
    name: 'createUriRegex#test(uri)',
    minSamples: 100,
    fn: function () {
        uriRegex.test(testUri);
    }
}).on('start', function onCycle() {
    process.stdout.write('  Testing URI "' + testUri + '"\n\n')
}).on('cycle', function onCycle(event) {
    benchmarks.add(event.target);
}).on('complete', function onComplete() {
    benchmarks.log();
}).run();