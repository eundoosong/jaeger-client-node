import { initTracer } from '../src';
import PrometheuMetrics from '../src/metrics/prometheus';
import express from 'express';
import { collectDefaultMetrics } from 'prom-client';

const app = express();

// See schema https://github.com/jaegertracing/jaeger-client-node/blob/master/src/configuration.js#L37
var config = {
  serviceName: 'my-awesome-service',
  sampler: {
    type: 'remote',
    param: 1,
    refreshIntervalMs: 1000,
  },
  reporter: {
    logSpans: true,
  },
};

var metrics = new PrometheuMetrics();
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
  //tracer._reporter.flush();
  cnt = cnt + 1;
});

app.get('/metrics', (req, res) => {
  res.set('Content-Type', metrics.register().contentType);
  res.end(metrics.register().metrics());
});

app.get('/metrics/counter', (req, res) => {
  res.set('Content-Type', metrics.register().contentType);
  res.end(metrics.register().getSingleMetricAsString('jaeger:traces'));
});

collectDefaultMetrics({ register: metrics.register() });

console.log('Server listening to 3000');
app.listen(3000);
