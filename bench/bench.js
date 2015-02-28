var Benchmark = require('benchmark'),
    benchmarks = require('beautify-benchmark'),
    lib = require('../index'),
    uriRegex = lib.createUriRegex(),
    uriRegexCustomScheme = lib.createUriRegex({scheme: 'http'}),
    uriRegexCustomArrayScheme = lib.createUriRegex({scheme: ['http', 'https']}),
    uriRegexCustomRegexScheme = lib.createUriRegex({scheme: /https?/}),
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
    suite = new Benchmark.Suite;
    benchmarks.reset();

    process.stdout.write('  Testing URI "' + testUri + '"\n\n');

    suite.add({
        name: 'createUriRegex()#test(uri)',
        fn: function () {
            uriRegex.test(testUri);
        }
    }).add({
        name: 'createUriRegex({ scheme: \'http\' })#test(uri)',
        fn: function () {
            uriRegexCustomScheme.test(testUri);
        }
    }).add({
        name: 'createUriRegex({ scheme: [\'http\', \'https\'] })#test(uri)',
        fn: function () {
            uriRegexCustomArrayScheme.test(testUri);
        }
    }).add({
        name: 'createUriRegex({ scheme: /https?/ })#test(uri)',
        fn: function () {
            uriRegexCustomRegexScheme.test(testUri);
        }
    }).on('cycle', function onCycle(event) {
        benchmarks.add(event.target);
    }).on('complete', function onComplete() {
        benchmarks.log();
    }).run();
});
