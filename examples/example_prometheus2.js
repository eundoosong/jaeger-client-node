var initTracer = require('jaeger-client').initTracer;
var PrometheusMetricsFactory = require('jaeger-client').PrometheusMetricsFactory;
//import PrometheusFactory from '../src/metrics/prometheus';
var express = require('express');
var globalRegistry = require('prom-client').register;

const app = express();

var config = {
  serviceName: 'prometheus_test',
  sampler: {
    type: 'remote',
    param: 1,
    refreshIntervalMs: 10000,
  },
  reporter: {
    logSpans: true,
  },
};

var metrics = new PrometheusMetricsFactory();
var options = {
  tags: {
    version: '0.0.1',
  },
  metrics: metrics,
  logger: console,
};

var tracer = initTracer(config, options);

var cnt = 1;
app.get('/log', (req, res) => {
  var span = tracer.startSpan('test:' + cnt);
  span.setTag('key', 'value');

  res.end('log');

  span.finish();
  cnt = cnt + 1;
});

app.get('/metrics', (req, res) => {
  res.set('Content-Type', globalRegistry.contentType);
  res.end(globalRegistry.metrics());
});

console.log('Server listening to 3000');
app.listen(3000);
