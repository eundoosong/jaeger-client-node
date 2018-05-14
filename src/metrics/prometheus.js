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

import { Counter, Gauge, register } from 'prom-client';

class CounterAdapter {
  counter: Counter;
  constructor(label: object, name: string, help: string, label_keys: string[]) {
    this.label = label;
    this.name = name;
    this.counter = new Counter({
      name: name,
      help: help,
      labelNames: label_keys,
      registers: [],
    });
  }

  increment(value: number): void {
    console.log('counter updated');
    console.log(this.name);
    console.log(this.label);
    this.counter.inc(this.label, value);
  }
}

class GaugeAdapter {
  gauge: Gauge;
  constructor(label: object, name: string, help: string, label_keys: string[]) {
    this.label = label;
    this.gauge = new Gauge({
      name: name,
      help: help,
      labelNames: label_keys,
    });
  }

  update(value: number): void {
    this.gauge.set(this.label, value);
  }
}

export default class PrometheusMetrics {
  cache: any = {};

  constructor(registry) {
    this._registry = registry;
  }

  getTagNameList(tags: ?any): Array<any> {
    var tagNameList = new Array();
    for (let key in tags) {
      tagNameList.push(key);
    }
    return tagNameList;
  }

  createCounter(name: string, tags: ?any): Counter {
    var labelNameList = this.getTagNameList(tags);
    var key = name + ',' + labelNameList.toString();
    if (!(key in this.cache)) {
      this.cache[key] = new CounterAdapter(tags, name, name, labelNameList);
    }
    this._registry.registerMetric(this.cache[key].counter);
    return this.cache[key];
  }

  createGauge(name: string, tags: ?any): Gauge {
    var labelNameList = this.getTagNameList(tags);
    var key = name + ',' + labelNameList.toString();
    if (!(key in this.cache)) {
      this.cache[key] = new GaugeAdapter(tags, name, name, labelNameList);
    }
    return this.cache[key];
  }

  globalRegistry() {
    return register;
  }
}
