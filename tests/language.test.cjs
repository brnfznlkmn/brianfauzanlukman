const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '../language.js'), 'utf8');
const flush = () => new Promise(setImmediate);

function fixture({ saved = null, country = 'ID', languages = ['id-ID'], reduced = false, storageBlocked = false } = {}) {
    const frames = [];
    const created = [];
    const requests = [];
    const cache = new Map();
    let resolveCountry;
    const response = new Promise(resolve => { resolveCountry = resolve; });
    const button = {
        dataset: {}, attributes: {},
        addEventListener: (_, fn) => { button.click = fn; },
        setAttribute: (key, value) => { button.attributes[key] = value; },
        removeAttribute: key => { delete button.attributes[key]; }
    };
    const root = { lang: 'id' };
    const status = { textContent: '' };
    const parent = { closest: () => null, getBoundingClientRect: () => ({ top: 10, bottom: 70, width: 300, height: 60 }) };
    const node = {
        textContent: 'Sisi kreatif.', parentElement: parent,
        replaceWith: wrapper => { wrapper.parentElement = parent; node.wrapper = wrapper; }
    };
    const placeholder = {
        value: 'Masukkan nama Anda', getAttribute: key => key === 'placeholder' ? placeholder.value : null,
        setAttribute: (key, value) => { if (key === 'placeholder') placeholder.value = value; }
    };
    const document = {
        documentElement: root, body: {},
        getElementById: id => ({ 'language-toggle': button, 'language-status': status }[id]),
        querySelectorAll: selector => selector === '[data-translation]' ? [] : [placeholder],
        addEventListener: () => {},
        createTreeWalker: () => {
            let visited = false;
            return { currentNode: node, nextNode: () => { if (visited) return false; visited = true; return true; } };
        },
        createElement: () => {
            const element = {
                children: [], attributes: {}, style: {}, textContent: '',
                setAttribute: (key, value) => { element.attributes[key] = value; },
                append: (...children) => { element.children.push(...children); },
                replaceWith: original => { original.parentElement = parent; delete node.wrapper; }
            };
            created.push(element);
            return element;
        }
    };
    const context = vm.createContext({
        document, navigator: { languages }, NodeFilter: { SHOW_TEXT: 4 },
        window: { innerHeight: 800, matchMedia: () => ({ matches: reduced }) },
        localStorage: {
            getItem: () => { if (storageBlocked) throw Error('Blocked'); return saved; },
            setItem: (_, value) => { if (storageBlocked) throw Error('Blocked'); saved = value; }
        },
        sessionStorage: { getItem: key => cache.get(key) || null, setItem: (key, value) => cache.set(key, value) },
        AbortController, setTimeout, clearTimeout,
        requestAnimationFrame: callback => frames.push(callback),
        fetch: (url, options) => { requests.push({ url, options }); return response; }
    });
    vm.runInContext(source, context);
    const app = vm.runInContext('({ initLanguageToggle, detectVisitorLanguage, readLanguagePreference, browserLanguageDefault, portfolioTranslations })', context);
    return {
        app, root, node, button, placeholder, status, frames, created, requests, cache,
        saved: () => saved,
        resolveCountry: (code = country, ok = true) => resolveCountry({ ok, json: async () => ({ success: true, country_code: code }) }),
        finishAnimation: async () => {
            for (const time of [0, 200, 650, 750, 1400, 2300]) frames.shift()?.(time);
            await flush();
        }
    };
}

test('country sets the default independently of browser language', async () => {
    for (const [country, expected, languages] of [['ID', 'id', ['en-US']], ['US', 'en', ['id-ID']], ['JP', 'en', ['id-ID']]]) {
        const f = fixture({ country, languages });
        const detected = f.app.detectVisitorLanguage(); f.resolveCountry();
        assert.equal(await detected, expected);
        assert.match(f.requests[0].url, /fields=success,country_code/);
        assert.equal(f.requests[0].options.credentials, 'omit');
        assert.equal(await f.app.detectVisitorLanguage(), expected);
        assert.equal(f.requests.length, 1);
    }
});

test('failed or malformed lookup preserves the browser fallback', async () => {
    for (const [country, ok] of [['', true], ['bogus', true], ['US', false]]) {
        const f = fixture({country}); const detected = f.app.detectVisitorLanguage();
        f.resolveCountry(country, ok); assert.equal(await detected, null);
        assert.equal(f.app.browserLanguageDefault(), 'id');
    }
});

test('saved language skips country lookup and translates attributes', () => {
    const f = fixture({ saved: 'en' }); f.app.initLanguageToggle();
    assert.equal(f.root.lang, 'en'); assert.equal(f.node.textContent, 'Creative side.');
    assert.equal(f.placeholder.value, 'Enter your name'); assert.equal(f.requests.length, 0);
});

test('manual toggle wins a delayed country response; typing erases then writes and restores nodes', async () => {
    const f = fixture(); f.app.initLanguageToggle(); f.button.click(); f.button.click();
    assert.equal(f.root.lang, 'en'); assert.equal(f.saved(), 'en');
    const visual = f.created.find(element => element.className === 'language-copy-visual');
    f.frames.shift()(0); assert.equal(visual.textContent, 'Sisi kreatif.');
    f.frames.shift()(200); assert.ok(visual.textContent.length < 'Sisi kreatif.'.length);
    assert.ok(Number(visual.style.opacity) > 0 && Number(visual.style.opacity) < 1);
    f.frames.shift()(650); assert.equal(visual.textContent, '\u200b');
    assert.equal(visual.style.opacity, '0');
    f.resolveCountry(); await flush(); assert.equal(f.root.lang, 'en');
    f.frames.shift()(1000); assert.ok('Creative side.'.startsWith(visual.textContent));
    assert.ok(Number(visual.style.opacity) > 0 && Number(visual.style.opacity) < 1);
    f.frames.shift()(1400); assert.ok(visual.textContent.length < 'Creative side.'.length);
    assert.equal(visual.style.opacity, '1');
    f.frames.shift()(2300); await flush();
    assert.equal(f.node.textContent, 'Creative side.'); assert.equal(f.node.wrapper, undefined);
    assert.equal(f.button.attributes['aria-busy'], undefined); assert.equal(f.status.textContent, 'English selected.');
    f.button.click(); await f.finishAnimation();
    assert.equal(f.node.textContent, 'Sisi kreatif.'); assert.equal(f.saved(), 'id');
    assert.equal(f.placeholder.value, 'Masukkan nama Anda');
});

test('reduced motion and blocked storage still allow language changes', () => {
    const f = fixture({ saved: 'id', reduced: true }); f.app.initLanguageToggle(); f.button.click();
    assert.equal(f.node.textContent, 'Creative side.'); assert.equal(f.frames.length, 0);
    const blocked = fixture({ storageBlocked: true, reduced: true }); blocked.app.initLanguageToggle();
    blocked.button.click(); assert.equal(blocked.root.lang, 'en'); blocked.resolveCountry();
});

test('all dictionary entries are nonempty and translation code does not initialize tracking', () => {
    const f = fixture();
    for (const [original, translated] of Object.entries(f.app.portfolioTranslations)) {
        assert.ok(original.trim() && translated.trim());
    }
    assert.ok(!source.includes('initDeviceTracking('));
});

test('English contact draft retains button nodes for later language changes', () => {
    const f = fixture();
    const script = fs.readFileSync(path.join(__dirname, '../script.js'), 'utf8');
    const formSource = script.slice(script.indexOf('function initContactForm()'), script.indexOf('function initDeviceTracking()'));
    const originalNode = { textContent: 'Open email app' };
    const button = { childNodes: [originalNode], replaceChildren: (...nodes) => { button.childNodes = nodes; } };
    const status = { style: {}, classList: { add: () => {} } };
    const form = { addEventListener: (_, handler) => { form.submit = handler; }, reset: () => {} };
    const fields = {
        'contact-form': form, 'form-submit-btn': button, 'form-status': status,
        name: { value: 'Local Test' }, email: { value: 'test@example.com' }, message: { value: 'Testing a draft' }
    };
    const location = {};
    vm.runInNewContext(formSource + ';initContactForm();', {
        document: { getElementById: id => fields[id] }, window: { location }, setTimeout: () => {},
        portfolioText: text => f.app.portfolioTranslations[text] || text
    });
    form.submit({ preventDefault: () => {} });
    const draft = new URL(location.href);
    assert.equal(draft.searchParams.get('subject'), 'Portfolio message from Local Test');
    assert.match(draft.searchParams.get('body'), /Name: Local Test.*Message:\nTesting a draft/s);
    assert.equal(button.childNodes[0], originalNode);
    assert.match(status.innerHTML, /Opening your email app/);
});

test('layout animation measures final nested sizes before animating and honors reduced motion', async () => {
    const helperSource = source.slice(source.indexOf('function animateLanguageLayout('), source.indexOf('function initLanguageToggle()'));
    const animations = [];
    let changed = false;
    const boxes = [
        { before: { width: 600, height: 700 }, after: { width: 600, height: 740 } },
        { before: { width: 500, height: 400 }, after: { width: 520, height: 440 } },
        { before: { width: 100, height: 20 }, after: { width: 110, height: 20 } }
    ].map((sizes, index) => ({
        getBoundingClientRect: () => changed ? sizes.after : sizes.before,
        animate: (frames, options) => {
            animations.push({ frames, options });
            if (index === 0) boxes[1].getBoundingClientRect = () => ({ width: 1, height: 1 });
            return { finished: Promise.resolve() };
        }
    }));
    const helper = vm.runInNewContext(helperSource + ';animateLanguageLayout;', { getComputedStyle: () => ({ display: 'grid' }) });
    await helper(new Set(boxes), () => { changed = true; }, true);
    assert.equal(animations[0].frames[0].height, '700px');
    assert.equal(animations[0].frames[1].height, '740px');
    assert.equal(animations[1].frames[1].height, '440px');
    assert.equal(animations[1].frames[1].width, '520px');
    assert.equal(animations[2].frames[0].height, '20px');
    assert.equal(animations[2].frames[1].height, '20px');
    assert.equal(animations[2].frames[1].overflow, 'clip');
    assert.equal(animations[0].options.duration, 650);
    await helper(new Set(boxes), () => { changed = false; }, false);
    assert.equal(changed, false);
    assert.equal(animations.length, 3);
});
