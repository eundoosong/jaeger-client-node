// @flow
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

import { Counter, Gauge } from 'prom-client';

let CounterAdapter = class {
  _counter: Counter;
  _labels: any;

  constructor(config: any) {
    this._counter = new Counter(config);
  }

  increment(delta: number): void {
    this._counter.inc(this._labels, delta);
  }

  labelValues(labels: any): void {
    this._labels = labels;
  }
};

let GaugeAdapter = class {
  _gauge: Gauge;
  _labels: any;

  constructor(config: any) {
    this._gauge = new Gauge(config);
  }

  update(value: number): void {
    this._gauge.set(this._labels, value);
  }

  labelValues(labels: any): void {
    this._labels = labels;
  }
};

export default class PrometheusFactory {
  _cache: any = {};

  _getTagKeyList(tags: any = {}): Array<any> {
    let tagKeyList = [];
    for (let key in tags) {
      tagKeyList.push(key);
    }
    return tagKeyList;
  }

  _createMetric(metric: any, name: string, labels: any = {}): Counter {
    let labelNames = this._getTagKeyList(labels);
    let key = name + ',' + labelNames.toString();
    if (!(key in this._cache)) {
      let config = {
        name: name,
        help: name,
        labelNames: labelNames,
      };
      this._cache[key] = new metric(config);
    }
    this._cache[key].labelValues(labels);
    return this._cache[key];
  }

  /**
   * Create a counter metric
   * @param {string} name - metric name
   * @param {any} tags - labels
   * @returns {Counter} - created counter metric
   */
  createCounter(name: string, tags: any = {}): Counter {
    return this._createMetric(CounterAdapter, name, tags);
  }

  /**
   * Create a gauge metric
   * @param {string} name - metric name
   * @param {any} tags - labels
   * @returns {Gauge} - created gauge metric
   */
  createGauge(name: string, tags: any = {}): Gauge {
    return this._createMetric(GaugeAdapter, name, tags);
  }
}
