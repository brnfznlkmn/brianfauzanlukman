const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../script.js'), 'utf8');
const trackerSource = source.slice(source.indexOf('function initDeviceTracking()'));
const flush = () => new Promise(setImmediate);

function fixture({ language = 'en', ip = '203.0.113.7', primary = 'success', backup = 'success', geo = 'pending', postFails = false, readyState = 'interactive', ua } = {}) {
    let now = 0;
    let timerId = 0;
    const timers = new Map();
    const requests = [];
    const warnings = [];
    const listeners = {};
    let geoSuccess;
    const root = { lang: language, dataset: {} };
    const navigator = {
        userAgent: ua || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130.0.0.0 Safari/537.36',
        platform: 'Win32', deviceMemory: 8,
        geolocation: geo === 'unsupported' ? undefined : {
            getCurrentPosition: (success, error, options) => {
                geoSuccess = success;
                if (geo === 'denied') error({ code: 1 });
                if (geo === 'throws') throw Error('Blocked');
                navigator.geoOptions = options;
            }
        }
    };
    const fetch = (url, options = {}) => {
        requests.push({ url, options });
        if (url.startsWith('https://script.google.com/')) return postFails
            ? Promise.reject(new TypeError('Failed to fetch'))
            : Promise.resolve({ type: 'opaque', status: 0, ok: false });
        const outcome = url.includes('ipify.org') ? primary : backup;
        if (outcome === 'failure') return Promise.reject(new TypeError('Blocked'));
        if (outcome === 'hang') return new Promise((_, reject) => options.signal?.addEventListener('abort', () => reject(new Error('Aborted'))));
        return Promise.resolve({ ok: outcome !== 'http-error', json: async () => outcome === 'malformed'
            ? { ip: '' } : { success: true, ip } });
    };
    const context = vm.createContext({
        document: { readyState, documentElement: root, addEventListener: (event, fn) => { (listeners[event] ||= []).push(fn); } },
        navigator, window: { screen: { width: 1920, height: 1080 }, addEventListener: (event, fn) => { (listeners[event] ||= []).push(fn); } },
        AbortController, fetch, console: { warn: (...args) => warnings.push(args) },
        setTimeout: (fn, delay) => { const id = ++timerId; timers.set(id, { at: now + delay, fn }); return id; },
        clearTimeout: id => timers.delete(id)
    });
    vm.runInContext(trackerSource, context);
    return {
        root, requests, warnings, context, navigator,
        start: () => vm.runInContext('initDeviceTracking()', context),
        posts: () => requests.filter(request => request.options.method === 'POST'),
        gps: () => geoSuccess({ coords: { latitude: -6.2, longitude: 106.8 } }),
        advance: async milliseconds => {
            const end = now + milliseconds;
            await flush();
            while (true) {
                const next = [...timers.entries()].filter(([, timer]) => timer.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
                if (!next) break;
                now = next[1].at; timers.delete(next[0]); next[1].fn(); await flush();
            }
            now = end; await flush();
        },
        listeners
    };
}

test('Indonesian and English both post resolved visitor IP without waiting for window load or GPS', async () => {
    for (const language of ['id', 'en']) {
        const f = fixture({ language }); f.start(); await f.advance(0);
        assert.equal(f.posts().length, 1);
        const data = JSON.parse(f.posts()[0].options.body);
        assert.equal(data.ip, '203.0.113.7'); assert.equal(data.lat, null);
        assert.equal(f.posts()[0].options.keepalive, true);
        assert.equal(f.posts()[0].options.mode, 'no-cors');
        assert.equal(f.root.dataset.trackingStatus, 'request-complete');
    }
});

test('hanging primary lookup falls back even while location permission remains unanswered', async () => {
    const f = fixture({ primary: 'hang' }); f.start(); await f.advance(3000);
    assert.equal(f.posts().length, 1);
    assert.equal(JSON.parse(f.posts()[0].options.body).ip, '203.0.113.7');
    assert.equal(f.root.dataset.trackingIpSource, 'ipwhois');
});

test('all IP services hanging still sends a fallback after a bounded wait', async () => {
    const f = fixture({ primary: 'hang', backup: 'hang' }); f.start(); await f.advance(6000);
    assert.equal(f.posts().length, 1);
    assert.equal(JSON.parse(f.posts()[0].options.body).ip, 'Hidden/VPN');
});

test('blocked, invalid and HTTP-error IP responses use a backup', async () => {
    for (const primary of ['failure', 'malformed', 'http-error']) {
        const f = fixture({ primary }); f.start(); await f.advance(0);
        assert.equal(f.posts().length, 1);
        assert.equal(JSON.parse(f.posts()[0].options.body).ip, '203.0.113.7');
    }
});

test('denied, missing or throwing geolocation does not duplicate or prevent the base request', async () => {
    for (const geo of ['denied', 'unsupported', 'throws']) {
        const f = fixture({ geo }); f.start(); await f.advance(0);
        assert.equal(f.posts().length, 1);
    }
});

test('GPS update waits for a resolved IP and follows the base request', async () => {
    const f = fixture({ primary: 'hang' }); f.start(); f.gps(); await f.advance(3000);
    assert.equal(f.posts().length, 2);
    const [base, location] = f.posts().map(post => JSON.parse(post.options.body));
    assert.equal(base.ip, '203.0.113.7'); assert.equal(base.lat, null);
    assert.equal(location.ip, '203.0.113.7'); assert.equal(location.lat, -6.2);
    assert.equal(f.navigator.geoOptions.timeout, 8000);
});

test('network failure is reported without treating an opaque response as a confirmed sheet write', async () => {
    const f = fixture({ postFails: true }); f.start(); await f.advance(0);
    assert.equal(f.posts().length, 1);
    assert.equal(f.root.dataset.trackingStatus, 'network-error');
    assert.equal(f.warnings.length, 1);
});

test('tracker initializes once and handles incomplete Apple user-agent strings', async () => {
    const f = fixture({ ua: 'Mozilla/5.0 (iPhone) AppleWebKit/605.1.15 Safari/604.1' });
    f.start(); f.start(); await f.advance(0); assert.equal(f.posts().length, 1);
});

test('tracking has a separate startup handler and survives a failing UI initializer', async () => {
    const f = fixture({ readyState: 'loading' });
    vm.runInContext(source, f.context);
    for (const name of ['initThemeToggle', 'initNavbar', 'initMobileNav', 'initBackToTop', 'initContactForm']) {
        f.context[name] = () => { throw Error('UI failure'); };
    }
    for (const listener of f.listeners.DOMContentLoaded) {
        try { listener(); } catch {}
    }
    await f.advance(0); assert.equal(f.posts().length, 1);
});

test('blocked browser storage does not crash theme initialization or the early theme script', () => {
    const attributes = new Map();
    const root = { setAttribute: (key, value) => attributes.set(key, value) };
    const context = vm.createContext({
        document: { documentElement: root, getElementById: () => null },
        localStorage: { getItem: () => { throw Error('Storage blocked'); } }
    });
    const themeSource = source.slice(source.indexOf('function initThemeToggle()'), source.indexOf('function initNavbar()'));
    vm.runInContext(themeSource + ';initThemeToggle();', context);
    assert.equal(attributes.get('data-theme'), 'light');
    const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
    const inlineScript = html.match(/<script>\s*([\s\S]*?)<\/script>/)[1];
    assert.doesNotThrow(() => vm.runInContext(inlineScript, context));
});
