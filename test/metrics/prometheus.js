// Copyright (c) 2018 Jaeger Author.
//
// Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
// in compliance with the License. You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software distributed under the License
// is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
// or implied. See the License for the specific language governing permissions and limitations under
// the License.

import { assert } from 'chai';
import PrometheusFactory from '../../src/metrics/prometheus';
import { register as globalRegistry } from 'prom-client';

describe('Prometheus metrics', () => {
  let metrics;

  beforeEach(() => {
    try {
      metrics = new PrometheusFactory();
    } catch (e) {
      console.log('beforeEach failed', e);
      console.log(e.stack);
    }
  });

  afterEach(() => {
    globalRegistry.clear();
  });

  it('should increment a counter with a provided value', () => {
    let name = 'jaeger:test_counter';

    metrics.createCounter(name).increment(1);

    let metric = globalRegistry.getSingleMetric(name).get();
    assert.equal(metric['type'], 'counter');
    assert.equal(metric['name'], name);
    assert.equal(metric.values[0].value, 1);
  });

  it('should increment a tagged counter with a provided value', () => {
    let name = 'jaeger:test_counter';

    let tags1 = { result: 'ok' };
    let counter1 = metrics.createCounter(name, tags1);
    counter1.increment(1);
    counter1.increment(1);

    let tags2 = { result: 'err' };
    let counter2 = metrics.createCounter(name, tags2);
    counter2.increment(); // increment by 1

    assert.equal(globalRegistry.getMetricsAsArray().length, 1);
    let metric = globalRegistry.getSingleMetric(name).get();
    assert.equal(metric['type'], 'counter');
    assert.equal(metric['name'], name);
    assert.equal(metric.values.length, 2);
    assert.equal(metric.values[0].labels, tags1);
    assert.equal(metric.values[0].value, 2);
    assert.equal(metric.values[1].labels, tags2);
    assert.equal(metric.values[1].value, 1);
  });

  it('should update a gauge to a provided value', () => {
    let name = 'jaeger:test_gauge';

    metrics.createGauge(name).update(10);

    let metric = globalRegistry.getSingleMetric(name).get();
    assert.equal(metric['type'], 'gauge');
    assert.equal(metric['name'], name);
    assert.equal(metric.values[0].value, 10);
  });

  it('should update a tagged gauge to a provided value', () => {
    let name = 'jaeger:test_gauge';

    let tags1 = { result: 'ok' };
    let gauge1 = metrics.createGauge(name, tags1);
    gauge1.update(10);
    gauge1.update(20);
    let tags2 = { result: 'err' };
    let gauge2 = metrics.createGauge(name, tags2);
    gauge2.update(10);

    assert.equal(globalRegistry.getMetricsAsArray().length, 1);
    let metric = globalRegistry.getSingleMetric(name).get();
    assert.equal(metric['type'], 'gauge');
    assert.equal(metric['name'], name);
    assert.equal(metric.values.length, 2);
    assert.equal(metric.values[0].labels, tags1);
    assert.equal(metric.values[0].value, 20);
    assert.equal(metric.values[1].labels, tags2);
    assert.equal(metric.values[1].value, 10);
  });

  it('should update metrics to a provided value', () => {
    metrics.createCounter('jaeger:test_counter', { result: 'ok' }).increment(1);
    metrics.createCounter('jaeger:test_counter', { result: 'err' }).increment(1);
    metrics.createGauge('jaeger:test_gauge', { result: 'ok' }).update(10);
    metrics.createGauge('jaeger:test_gauge', { result: 'err' }).update(10);
    assert.equal(globalRegistry.getMetricsAsArray().length, 2);
  });
});
