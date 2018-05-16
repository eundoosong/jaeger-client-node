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
    globalRegistry.clear()
  });

  it('should increment a counter with a provided value', () => {
    let name = 'jaeger:test_counter';

    let counter = metrics.createCounter(name);
    counter.increment(1);

    let metric = globalRegistry.getSingleMetric(name).get();
    assert.equal(metric['type'], 'counter');
    assert.equal(metric['name'], name);
    assert.equal(metric.values[0].value, 1);
  });

  it('should increment a tagged counter with a provided value', () => {
    let name = 'jaeger:test_counter';
    let tags = { result: 'ok' }

    let counter = metrics.createCounter(name, tags);
    counter.increment(1);
    counter.increment(1);

    let metric = globalRegistry.getSingleMetric(name).get();
    assert.equal(metric['type'], 'counter');
    assert.equal(metric['name'], name);
    assert.equal(metric.values[0].labels, tags);
    assert.equal(metric.values[0].value, 2);
  });

  it('should update a gauge to a provided value', () => {
    let name = 'jaeger:test_gauge';

    let counter = metrics.createGauge(name);
    counter.update(10);

    let metric = globalRegistry.getSingleMetric(name).get();
    assert.equal(metric['type'], 'gauge');
    assert.equal(metric['name'], name);
    assert.equal(metric.values[0].value, 10);
  });

  it('should update a tagged gauge to a provided value', () => {
    let name = 'jaeger:test_gauge';
    let tags = { result: 'ok' };

    let counter = metrics.createGauge(name, tags);
    counter.update(10);
    counter.update(20);

    let metric = globalRegistry.getSingleMetric(name).get();
    assert.equal(metric['type'], 'gauge');
    assert.equal(metric['name'], name);
    assert.equal(metric.values[0].labels, tags);
    assert.equal(metric.values[0].value, 20);
  });
});
