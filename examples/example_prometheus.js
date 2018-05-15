import { initTracer } from '../src';
import PrometheusFactory from '../src/metrics/prometheus';
import express from 'express';
import { register as registry } from 'prom-client';

const app = express();

var config = {
  serviceName: 'my-awesome-service',
  sampler: {
    type: 'remote',
    param: 1,
    refreshIntervalMs: 10000,
  },
  reporter: {
    logSpans: true,
  },
};

registry.setDefaultLabels({ service_name: config.serviceName });
var metrics = new PrometheusFactory();
var options = {
  tags: {
    'my-awesome-service.version': '1.1.2',
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
  res.set('Content-Type', registry.contentType);
  res.end(registry.metrics());
});

console.log('Server listening to 3000');
app.listen(3000);
