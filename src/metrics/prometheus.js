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

import { Counter, Gauge, register as GlobalRegistry } from 'prom-client';

class CounterAdapter {
  _counter: Counter;

  constructor(labels: any, config: any) {
    this._labels = labels;
    this._counter = new Counter(config);
  }

  increment(delta: number): void {
    this._counter.inc(this._labels, delta);
  }
}

class GaugeAdapter {
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

  /**
   * @param {Object} [registry] - registry used to hold all metrics.
   */
  constructor(registry: ?any) {
    this._registry = registry;
  }

  _getTagNameList(tags: any = {}): Array<any> {
    let tagNameList = [];
    for (let key in tags) {
      tagNameList.push(key);
    }
    return tagNameList;
  }

  createCounter(name: string, tags: any = {}): Counter {
    let labelNameList = this._getTagNameList(tags);
    let key = name + ',' + labelNameList.toString();
    if (!(key in this._cache)) {
      let config = {
        name: name,
        help: name,
        labelNames: labelNameList,
      };
      if (this._registry) {
        config['registers'] = [this._registry];
      }
      this._cache[key] = new CounterAdapter(tags, config);
    }
    return this._cache[key];
  }

  createGauge(name: string, tags: any = {}): Gauge {
    let labelNameList = this._getTagNameList(tags);
    let key = name + ',' + labelNameList.toString();
    if (!(key in this._cache)) {
      let config = {
        name: name,
        help: name,
        labelNames: labelNameList,
      };
      if (this._registry) {
        config['registers'] = [this._registry];
      }
      this._cache[key] = new GaugeAdapter(tags, config);
    }
    return this._cache[key];
  }

  get registry(): any {
    return this._registry || GlobalRegistry;
  }
}
