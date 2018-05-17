import { initTracer } from '../src';
import PrometheusFactory from '../src/metrics/prometheus';
import express from 'express';
import { register as globalRegistry } from 'prom-client';

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

//globalRegistry.setDefaultLabels({ service_name: config.serviceName });
var metrics: MectricsFactory = new PrometheusFactory(config.serviceName);
var options = {
  tags: {
    'version': '0.0.1',
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
