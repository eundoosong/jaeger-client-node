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

let CounterPromWrapper = class {
  _counter: Counter;
  _labels: any;

  constructor(counter: Counter, labels: any) {
    this._counter = counter;
    this._labels = labels;
  }

  increment(delta: number): void {
    this._counter.inc(this._labels, delta);
  }
};

let GaugePromWrapper = class {
  _gauge: Gauge;
  _labels: any;

  constructor(gauge: Gauge, labels: any) {
    this._gauge = gauge;
    this._labels = labels;
  }

  update(value: number): void {
    this._gauge.set(this._labels, value);
  }
};

export default class PrometheusFactory {
  _cache: any = {};
  _namespace: ?string;

  constructor(namespace: ?string) {
    this._namespace = namespace;
  }

  _getLabelsKeyList(tags: any = {}): Array<string> {
    let tagKeyList = [];
    for (let key in tags) {
      tagKeyList.push(key);
    }
    return tagKeyList;
  }

  _createMetric(metric: any, name: string, labels: any): any {
    let labelNames = this._getLabelsKeyList(labels);
    let key = name + ',' + labelNames.toString();
    let help = name;
    if(this._namespace != null)
      name = this._namespace + '_' + name;
    if (!(key in this._cache)) {
      let config = {
        name: name,
        help: help,
        labelNames: labelNames,
      };
      this._cache[key] = new metric(config);
    }
    return this._cache[key];
  }

  /**
   * Create a counter metric
   * @param {string} name - metric name
   * @param {any} tags - labels
   * @returns {Counter} - created counter metric
   */
  createCounter(name: string, tags: any = {}): Counter {
    return new CounterPromWrapper(this._createMetric(Counter, name, tags), tags);
  }

  /**
   * Create a gauge metric
   * @param {string} name - metric name
   * @param {any} tags - labels
   * @returns {Gauge} - created gauge metric
   */
  createGauge(name: string, tags: any = {}): Gauge {
    return new GaugePromWrapper(this._createMetric(Gauge, name, tags), tags);
  }
}
