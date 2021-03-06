'use strict';

var assert = require('chai').assert;
var metrix = require('metrix');

var startEchoServer = require('../common/startEchoServer');
var ReactiveSocketFactory =
    require('../../lib/connection/reactiveSocketFactory');

describe('ReactiveSocketFactory', function () {
    it('Create a factory from ip:port', function (done) {
        this.timeout(30 * 1000);

        var recorder = metrix.createRecorder();
        var aggregator = metrix.createAggregator(recorder);

        var port = 8080;
        var server = startEchoServer({port: 8080, host: 'localhost'});
        var factory = new ReactiveSocketFactory({
            port: port,
            host: 'localhost',
            recorder: recorder
        });

        factory.build().on('reactivesocket', function (rs) {
            rs.request({data: 'Hey'}).on('response', function (res) {
                server.close();
                var report = aggregator.report();

                assert(report.counters['rs/requests']);
                assert(report.counters['rs/responses']);
                assert(report.histograms['rs/requestLatency']);
                assert(report.histograms['rs/setupLatency']);
                done();
            });
        });
    });
});
