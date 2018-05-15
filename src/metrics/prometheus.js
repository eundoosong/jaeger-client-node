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

const CounterAdapter = class {
  _labels: any;
  _counter: Counter;

  constructor(labels: any, config: any) {
    this._labels = labels;
    this._counter = new Counter(config);
  }

  increment(delta: number): void {
    this._counter.inc(this._labels, delta);
  }
}

const GaugeAdapter = class {
  _labels: any;
  _gauge: Gauge;

  constructor(labels: any, config: any) {
    this._labels = labels;
    this._gauge = new Gauge(config);
  }

  update(value: number): void {
    this._gauge.set(this._labels, value);
  }
}

export default class PrometheusFactory {
  _cache: any = {};

  _getTagNameList(tags: any = {}): Array<any> {
    let tagNameList = [];
    for (let key in tags) {
      tagNameList.push(key);
    }
    return tagNameList;
  }

  _createMetric(metric: any, name: string, tags: any = {}): Counter {
    let labelNameList = this._getTagNameList(tags);
    let key = name + ',' + labelNameList.toString();
    if (!(key in this._cache)) {
      let config = {
        name: name,
        help: name,
        labelNames: labelNameList,
      };
      this._cache[key] = new metric(tags, config);
    }
    return this._cache[key];
  }

  /**
   * Create counter metric
   * @param {string} name - metric name
   * @param {any} tags - labels
   * @returns {Counter} - created counter metric
   */
  createCounter(name: string, tags: any = {}): Counter {
    return this._createMetric(CounterAdapter, name, tags)
  }

  /**
   * Create gauge metric
   * @param {string} name - metric name
   * @param {any} tags - labels
   * @returns {Gauge} - created gauge metric
   */
  createGauge(name: string, tags: any = {}): Gauge {
    return this._createMetric(GaugeAdapter, name, tags)
  }
}
