import { Counter, Gauge, register } from 'prom-client';

class CounterAdapter {
  counter: Counter;
  constructor(name: string, help: string, labels?: string[]) {
    this.counter = new Counter(name, help, labels);
  }

  increment(value: number) {
    this.counter.inc(value);
  }

  get() {
    return this.counter.get();
  }
}

class GaugeAdapter {
  gauge: Gauge;
  constructor(name: string, help: string, labels?: string[]) {
    this.gauge = new Gauge(name, help, labels);
  }

  increment(value: number) {
    this.gauge.inc(value);
  }

  get() {
    return this.gauge.get();
  }
}

export default class PrometheusMetrics {
  cache: any = {};

  getTagNameList(tags) {
    var tagNameList = new Array();
    for (var key in tags) {
      tagNameList.push(key);
    }
    return tagNameList;
  }

  createCounter(name, tags) {
    var labelNameList = this.getTagNameList(tags);
    var key = name + ',' + labelNameList.toString();
    if (!(key in this.cache)) {
      this.cache[key] = new CounterAdapter({
        name: name,
        help: name,
        labelNames: labelNameList,
      });
    }
    return this.cache[key];
  }

  createGauge(name, tags) {
    var labelNameList = this.getTagNameList(tags);
    var key = name + ',' + labelNameList.toString();
    if (!(key in this.cache)) {
      this.cache[key] = new GaugeAdapter({
        name: name,
        help: name,
        labelNames: labelNameList,
      });
    }
    return this.cache[key];
  }

  register() {
    return register;
  }
}
