import { initTracer } from '../src';
import PrometheuMetrics from '../src/metrics/prometheus';
import express from 'express';
import { collectDefaultMetrics } from 'prom-client';

const app = express();

// See schema https://github.com/jaegertracing/jaeger-client-node/blob/master/src/configuration.js#L37
var config = {
  serviceName: 'my-awesome-service',
  sampler: {
    type: 'const',
    param: 1,
  },
};

var metrics = new PrometheuMetrics();
var options = {
  tags: {
    'my-awesome-service.version': '1.1.2',
  },
  metrics: metrics,
};

var tracer = initTracer(config, options);

var span = tracer.startSpan('test');
span.setTag('key', 'value');
span.finish();

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
