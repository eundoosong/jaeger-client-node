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

import { assert, expect } from 'chai'
import PrometheusFactory from '../../src/metrics/prometheus';
import { register as registry } from 'prom-client';

describe('prometheus', () => {
  let metrics;

  beforeEach(() => {
    try {
      metrics = new PrometheusFactory()
    } catch (e) {
      console.log('beforeEach failed', e)
      console.log(e.stack)
    }
  });

  afterEach(() => {

  });

  it('update counter metrics', () => {
    let counter = metrics.createCounter('jaeger:test_counter', {
      result: 'ok'
    })
    counter.increment(1)
    let result = registry.getSingleMetricAsString('jaeger:test_counter')
    console.log(result)
    assert.equal(result, 'test')
  });
})