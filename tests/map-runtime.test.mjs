import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { mountMap } from '../src/view/components/maps/mapRuntime.ts';
const dom = new JSDOM('<div id="map"></div>');
globalThis.document = dom.window.document;
const handlers = {};
const locations = [];
class MapFake {
  constructor(options) {
    this.options = options;
  }
  addControl() {}
  on(event, fn) {
    handlers[event] = fn;
  }
  fitBounds() {}
  remove() {}
}
class Marker {
  constructor(options) {
    this.element = options.element;
  }
  setLngLat(coords) {
    locations.push(coords);
    return this;
  }
  addTo() {
    if (this.element) document.body.appendChild(this.element);
    return this;
  }
  remove() {
    this.element?.remove();
  }
}
class Bounds {
  extend() {}
}
const sdk = { Map: MapFake, Marker, LngLatBounds: Bounds, NavigationControl: class {} };
test('runtime serializado da WebView conserva marcadores, fallback e eventos sem executar título como HTML', () => {
  const events = [];
  const create = (0, eval)(`(${mountMap.toString()})`);
  const markers = [
    {
      id: 'grupo',
      latitude: -4,
      longitude: -41,
      title: '<script>throw 1</script>',
      label: '2 livros — Biblioteca',
      coverUrl: 'javascript:alert(1)',
      count: 2,
    },
  ];
  const runtime = create(
    sdk,
    document.getElementById('map'),
    { token: 'pk.teste', markers, point: null, selectable: true, css: '', color: 'green' },
    (event) => events.push(event),
  );
  handlers.load();
  const button = document.querySelector('button');
  assert.equal(button.getAttribute('aria-label'), '2 livros — Biblioteca');
  assert.equal(button.querySelectorAll('script,img').length, 0);
  button.click();
  assert.deepEqual(events.at(-1), { type: 'select', id: 'grupo' });
  handlers.click({ lngLat: { lat: -4, wrap: () => ({ lng: -41 }) } });
  assert.deepEqual(events.at(-1), { type: 'point', latitude: -4, longitude: -41 });
  assert.deepEqual(locations[0], [-41, -4]);
  runtime.update({ markers: [], point: null });
  assert.equal(document.querySelectorAll('.ipe-map-book').length, 0);
  runtime.destroy();
});
