var Benchmark = require('benchmark'),
    benchmarks = require('beautify-benchmark'),
    lib = require('../index'),
    uriRegex = lib.createUriRegex(),
    uriRegexImproved = lib.createUriRegexImproved(),
    uriRegexCustomScheme = lib.createUriRegex('https?'),
    uriRegexCustomSchemeImproved = lib.createUriRegexImproved('https?'),
    suite,
    testUris = [
        'http://mail.google.com/',
        'http://asdf:qw%20er@mail.google.com',
        'http://asdf:qw%20er@mail.google.com:8000',
        'http://asdf:qw%20er@mail.google.com:8000/',
        'http://asdf:qw%20er@mail.google.com:8000/path/one/two/three/four',
        'http://asdf:qw%20er@mail.google.com:8000/path/one/two/three/four?asdf=12345&asda=fc%2F',
        'http://asdf:qw%20er@mail.google.com:8000/path/one/two/three/four?asdf=12345&asda=fc%2F#bacon',
        'http://google.com', // Registered Name
        'http://127.0.0.1/', // IPv4
        'http://[FEDC:BA98:7654:3210:FEDC:BA98:7654:3210]/', // IPv6
        'http://[a:b:c:d:e::1.2.3.4]/', //IPv6 with IPv4 mixed
        'http://[v1.09azAZ-._~!$&\'()*+,;=:]/' // IPvFuture
    ];

testUris.forEach(function (testUri) {
    process.stdout.write('  Testing URI "' + testUri + '"\n\n');

    suite = new Benchmark.Suite;
    benchmarks.reset();

    suite.add({
        name: 'createUriRegex()#test(uri)',
        fn: function () {
            if (!uriRegex.test(testUri)) {
                throw new Error('Should have been true');
            }
        }
    }).add({
        name: 'createUriRegexImproved()#test(uri)',
        fn: function () {
            if (!uriRegexImproved.test(testUri)) {
                throw new Error('Should have been true');
            }
        }
    }).on('cycle', function onCycle(event) {
        benchmarks.add(event.target);
    }).on('complete', function onComplete() {
        benchmarks.log();
    }).run();

    suite = new Benchmark.Suite;
    benchmarks.reset();

    suite.add({
        name: 'createUriRegex(\'https?\')#test(uri)',
        fn: function () {
            if (!uriRegexCustomScheme.test(testUri)) {
                throw new Error('Should have been true');
            }
        }
    }).add({
        name: 'createUriRegexImproved(\'https?\')#test(uri)',
        fn: function () {
            if (!uriRegexCustomSchemeImproved.test(testUri)) {
                throw new Error('Should have been true');
            }
        }
    }).on('cycle', function onCycle(event) {
        benchmarks.add(event.target);
    }).on('complete', function onComplete() {
        benchmarks.log();
    }).run();
});
