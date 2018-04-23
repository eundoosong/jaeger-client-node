import { Counter, Gauge, register } from 'prom-client';

class CounterAdapter {
  counter: Counter;
  constructor(label: object, name: string, help: string, labels?: string[]) {
    this.label = label;
    this.counter = new Counter(name, help, labels);
  }

  increment(value: number) {
    console.log(this.label);
    console.log(value);
    this.counter.inc(this.label, value);
  }

  get() {
    return this.counter.get();
  }
}

class GaugeAdapter {
  gauge: Gauge;
  constructor(label: object, name: string, help: string, labels?: string[]) {
    this.label = label;
    this.gauge = new Gauge(name, help, labels);
  }

  increment(value: number) {
    this.gauge.inc(this.label, value);
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
      this.cache[key] = new CounterAdapter(tags, {
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
      this.cache[key] = new GaugeAdapter(tags, {
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
