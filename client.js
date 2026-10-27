window.__ModuleLoader__.load({
  id: 'dsh-quota-wallpaper',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const {
      useEffect,
      useMemo,
      useRef,
      useState,
      useSyncExternalStore,
    } = React;

    const NS = 'ui-quota-wallpaper';
    const PANEL_ID = 'quota-wallpaper';
    const API_PATH = '/api/dsh-quota/summary';
    const SETTINGS_KEY = 'dsh-quota-wallpaper/settings/v1';
    const HISTORY_KEY = 'dsh-quota-wallpaper/history/v1';
    const POSITION_KEY = 'dsh-quota-wallpaper/position/v1';
    const SCHOLAR_LIVE_KEY = 'dsh-quota-wallpaper/campus-live/v1';
    const STYLE_ID = 'dsh-quota-wallpaper/styles';
    const MAX_IMAGE_BYTES = 2.5 * 1024 * 1024;
    const TOP_UP_URL = 'https://platform.deepseek.com/top_up';
    const USAGE_URL = 'https://platform.deepseek.com/usage';
    const WEATHER_ENDPOINT = 'https://api.open-meteo.com/v1/forecast';
    const WEATHER_POINT = { latitude: 31.2989, longitude: 121.5033 };
    const WEATHER_REFRESH_MS = 15 * 60 * 1000;
    const EMBLEM_SRC = 'data:image/webp;base64,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';

    // ---------------------------------------------------------------------
    // Locale dictionaries
    // ---------------------------------------------------------------------

    const ZH = {
      'meta.title': '复旦 · 状态栏 & 壁纸',
      'meta.description': '右下角复旦风格额度与天气状态卡（余额看板、峰谷时段、余额走势、校徽、天气与降雨），以及可调透明度、模糊、暗化与适配方式的全屏壁纸。',
      'nav.label': '复旦 · 状态栏',
      'page.title': '复旦 · 状态栏 & 壁纸',
      'page.subtitle': '右下角状态卡一眼看清余额、峰谷、天气与下次降雨；壁纸铺满整个界面，颜色、透明度、模糊与暗化都能调。',
      'page.kicker': '日月光华 · 旦复旦兮',
      'fudan.english': 'FUDAN · 1905',
      'fudan.title': '日月光华',
      'fudan.subtitle': '旦复旦兮 · 额度看板',
      'fudan.motto1': '博学而笃志',
      'fudan.motto2': '切问而近思',
      'weather.place': '上海 · 邯郸',
      'weather.cond.clear': '晴',
      'weather.cond.partly': '多云',
      'weather.cond.cloud': '阴',
      'weather.cond.fog': '雾',
      'weather.cond.rain': '雨',
      'weather.cond.storm': '雷雨',
      'weather.cond.snow': '雪',
      'weather.feels': '体感',
      'weather.humidity': '湿度',
      'weather.wind': '风速',
      'weather.rainNow': '正在下雨',
      'weather.rainSoon': '即将有雨',
      'weather.rainAt': '有雨',
      'weather.noRain': '24 小时内无雨',
      'weather.unavailable': '天气暂不可用',
      'weather.tomorrow': '明天',
      'weather.rainUntil': '预计到',
      'weather.updated': '天气更新于',
      'weather.error.timeout': '天气接口超时',
      'weather.error.network': '天气接口无法连接',
      'weather.error.http': '天气接口返回 HTTP',
      'weather.error.payload': '天气接口返回内容异常',
      'common.refresh': '刷新',
      'common.reset': '恢复默认',
      'common.close': '关闭',
      'common.open': '打开面板',
      'common.enabled': '已开启',
      'common.disabled': '已关闭',
      'common.loading': '读取中…',
      'common.updated': '更新于',
      'common.on': '开',
      'common.off': '关',
      'quota.title': '额度看板',
      'quota.balance': '账户余额',
      'quota.granted': '赠送余额',
      'quota.topped': '充值余额',
      'quota.available': '账户可用',
      'quota.unavailable': '账户暂不可用',
      'quota.today': '今日消耗',
      'quota.avg': '日均消耗',
      'quota.eta': '预计可用',
      'quota.usageHint': '消耗统计从插件运行后开始累计；多运行一段时间，「今日消耗」和「日均消耗」就会显示出来。',
      'quota.ample': '充足',
      'quota.lessDay': '不足 1 天',
      'quota.peak': '高峰时段',
      'quota.offPeak': '空闲时段',
      'quota.nextPeak': '距进入高峰',
      'quota.nextOffPeak': '距进入空闲',
      'quota.in': '输入',
      'quota.cache': '缓存命中',
      'quota.out': '输出',
      'quota.unit': '元 / 百万 tokens',
      'quota.noPrice': '当前模型不在内置价格表中，单价与峰谷折扣不适用。',
      'quota.usage': '用量明细',
      'quota.topUp': '去充值',
      'quota.emptyHint': '在「设置 → 模型」里配置 DeepSeek API Key 后，这里会显示余额。',
      'quota.error.noKey': '未配置 DEEPSEEK_API_KEY',
      'quota.error.badKey': 'DEEPSEEK_API_KEY 含非法字符',
      'quota.error.timeout': '额度接口超时',
      'quota.error.network': '额度接口无法连接',
      'quota.error.http': '额度接口返回 HTTP',
      'quota.error.payload': '额度接口返回内容异常',
      'quota.error.empty': '额度接口没有返回余额',
      'quota.error.internal': '插件内部错误',
      'quota.error.forbidden': '仅允许本机访问',
      'quota.error.unavailable': '账户当前不可用',
      'pill.openLabel': '打开额度看板',
      'pill.school': '复旦 · 额度',
      'pill.today': '今日已用',
      'pill.loadingShort': '读取中',
      'pill.offlineShort': '未连接',
      'pill.dragHint': '拖动移动 · 点击打开额度看板',
      'pill.resetPosition': '重置位置',
      'pill.peakShort': '峰',
      'pill.offPeakShort': '谷',
      'pill.loading': '额度…',
      'pill.unavailable': '额度 —',
      'wall.title': '壁纸',
      'wall.enable': '启用壁纸',
      'wall.source': '选择壁纸',
      'wall.none': '无壁纸',
      'wall.custom': '自定义图片',
      'wall.customHint': '支持 http(s) 图片链接，或从本机选择图片（≤2.5MB）。图片只保存在当前浏览器里。',
      'wall.urlPlaceholder': '粘贴图片链接，例如 https://…/photo.jpg',
      'wall.apply': '应用链接',
      'wall.upload': '选择图片',
      'wall.invalidUrl': '请填写以 http(s) 或 data:image 开头的图片地址。',
      'wall.notImage': '请选择图片文件。',
      'wall.tooLarge': '图片超过 2.5MB，请换一张更小的。',
      'wall.readFailed': '读取图片失败，请重试。',
      'wall.storageFull': '浏览器本地存储已满，壁纸设置未能保存。请换一张更小的图片。',
      'wall.preview': '预览',
      'wall.previewTitle': '界面文字',
      'wall.previewSub': '壁纸会铺在界面之后，卡片与文字保持可读。',
      'wall.previewEmpty': '选择一个壁纸后在这里预览',
      'wall.opacity': '壁纸不透明度',
      'wall.blur': '模糊',
      'wall.scrim': '暗化遮罩',
      'wall.scrimHint': '亮色主题用白纱、暗色主题用黑纱，让文字始终清晰。',
      'wall.fit': '适配方式',
      'wall.cover': '铺满',
      'wall.contain': '完整显示',
      'wall.currentCustom': '当前使用自定义图片',
      'wall.disabledHint': '壁纸已关闭，设置会被保留。',
      'time.day': '天',
      'time.hour': '小时',
      'time.minute': '分钟',
    };

    const EN = {
      'meta.title': 'Fudan · Status Bar & Wallpaper',
      'meta.description': 'A Fudan-inspired bottom-right quota and weather status card with a balance board, peak/off-peak pricing, sparkline, campus weather and next rain, plus a full-frame wallpaper.',
      'nav.label': 'Fudan · Status',
      'page.title': 'Fudan · Status Bar & Wallpaper',
      'page.subtitle': 'A bottom-right card for balance, peak/off-peak, campus weather and next rain, plus a full-frame wallpaper whose opacity, blur, scrim and fit you control.',
      'page.kicker': 'LIGHT OF SUN & MOON · DAY AFTER DAY',
      'fudan.english': 'FUDAN · 1905',
      'fudan.title': 'Light of Sun & Moon',
      'fudan.subtitle': 'Day after day · Quota board',
      'fudan.motto1': 'Learn broadly',
      'fudan.motto2': 'Ask earnestly',
      'weather.place': 'Shanghai · Handan',
      'weather.cond.clear': 'Clear',
      'weather.cond.partly': 'Partly cloudy',
      'weather.cond.cloud': 'Overcast',
      'weather.cond.fog': 'Fog',
      'weather.cond.rain': 'Rain',
      'weather.cond.storm': 'Thunderstorm',
      'weather.cond.snow': 'Snow',
      'weather.feels': 'Feels',
      'weather.humidity': 'Humidity',
      'weather.wind': 'Wind',
      'weather.rainNow': 'Raining now',
      'weather.rainSoon': 'Rain soon',
      'weather.rainAt': 'rain',
      'weather.noRain': 'No rain in 24h',
      'weather.unavailable': 'Weather unavailable',
      'weather.tomorrow': 'Tomorrow',
      'weather.rainUntil': 'Until',
      'weather.updated': 'Weather updated',
      'weather.error.timeout': 'Weather request timed out',
      'weather.error.network': 'Weather endpoint unreachable',
      'weather.error.http': 'Weather endpoint returned HTTP',
      'weather.error.payload': 'Weather endpoint returned an unexpected payload',
      'common.refresh': 'Refresh',
      'common.reset': 'Reset',
      'common.close': 'Close',
      'common.open': 'Open panel',
      'common.enabled': 'On',
      'common.disabled': 'Off',
      'common.loading': 'Loading…',
      'common.updated': 'Updated',
      'common.on': 'On',
      'common.off': 'Off',
      'quota.title': 'Quota board',
      'quota.balance': 'Balance',
      'quota.granted': 'Granted',
      'quota.topped': 'Topped up',
      'quota.available': 'Account available',
      'quota.unavailable': 'Account unavailable',
      'quota.today': 'Spent today',
      'quota.avg': 'Daily average',
      'quota.eta': 'Lasts about',
      'quota.usageHint': 'Spend is accumulated while the plugin runs; today and the daily average appear after a little history builds up.',
      'quota.ample': 'Ample',
      'quota.lessDay': '< 1 day',
      'quota.peak': 'Peak hours',
      'quota.offPeak': 'Off-peak',
      'quota.nextPeak': 'Peak starts in',
      'quota.nextOffPeak': 'Off-peak starts in',
      'quota.in': 'Input',
      'quota.cache': 'Cache hit',
      'quota.out': 'Output',
      'quota.unit': 'CNY / million tokens',
      'quota.noPrice': 'The active model is not in the built-in price table, so unit prices and the peak discount do not apply.',
      'quota.usage': 'Usage details',
      'quota.topUp': 'Top up',
      'quota.emptyHint': 'Add a DeepSeek API key under Settings → Models and the balance appears here.',
      'quota.error.noKey': 'DEEPSEEK_API_KEY is not configured',
      'quota.error.badKey': 'DEEPSEEK_API_KEY contains illegal characters',
      'quota.error.timeout': 'Balance request timed out',
      'quota.error.network': 'Balance endpoint unreachable',
      'quota.error.http': 'Balance endpoint returned HTTP',
      'quota.error.payload': 'Balance endpoint returned an unexpected payload',
      'quota.error.empty': 'Balance endpoint returned no balance',
      'quota.error.internal': 'Plugin internal error',
      'quota.error.forbidden': 'Local access only',
      'quota.error.unavailable': 'Account is currently unavailable',
      'pill.openLabel': 'Open the quota board',
      'pill.school': 'FUDAN · QUOTA',
      'pill.today': 'Used today',
      'pill.loadingShort': 'Loading',
      'pill.offlineShort': 'Offline',
      'pill.dragHint': 'Drag to move · click to open the quota board',
      'pill.resetPosition': 'Reset position',
      'pill.peakShort': 'Peak',
      'pill.offPeakShort': 'Off',
      'pill.loading': 'Quota…',
      'pill.unavailable': 'Quota —',
      'wall.title': 'Wallpaper',
      'wall.enable': 'Enable wallpaper',
      'wall.source': 'Choose a wallpaper',
      'wall.none': 'None',
      'wall.custom': 'Custom image',
      'wall.customHint': 'Paste an http(s) image link, or pick a local image (≤2.5MB). It stays in this browser only.',
      'wall.urlPlaceholder': 'Paste an image link, e.g. https://…/photo.jpg',
      'wall.apply': 'Apply link',
      'wall.upload': 'Choose image',
      'wall.invalidUrl': 'Use an image address starting with http(s) or data:image.',
      'wall.notImage': 'Please choose an image file.',
      'wall.tooLarge': 'That image is over 2.5MB; pick a smaller one.',
      'wall.readFailed': 'Could not read the image. Try again.',
      'wall.storageFull': 'Browser storage is full, so the wallpaper setting was not saved. Try a smaller image.',
      'wall.preview': 'Preview',
      'wall.previewTitle': 'Interface text',
      'wall.previewSub': 'The wallpaper sits behind the UI; cards and text stay readable.',
      'wall.previewEmpty': 'Pick a wallpaper to preview it here',
      'wall.opacity': 'Wallpaper opacity',
      'wall.blur': 'Blur',
      'wall.scrim': 'Dimming scrim',
      'wall.scrimHint': 'A white veil in the light theme and a black one in the dark theme keep text legible.',
      'wall.fit': 'Fit',
      'wall.cover': 'Cover',
      'wall.contain': 'Contain',
      'wall.currentCustom': 'Using a custom image',
      'wall.disabledHint': 'Wallpaper is off; your settings are kept.',
      'time.day': 'd',
      'time.hour': 'h',
      'time.minute': 'm',
    };

    // ---------------------------------------------------------------------
    // Wallpaper presets (original CSS artwork; no external assets)
    // ---------------------------------------------------------------------

    // An original line-art scene for the Fudan preset: a sun and a crescent
    // over the twin towers of Guanghua Tower, with the campus horizon and a few
    // "qingyun" cloud arcs. It is deliberately abstract, not the official seal.
    const FUDAN_SCENE = [
      "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1600 900'>",
      "<g fill='none' stroke='#d9bd82' stroke-opacity='.13' stroke-width='2' stroke-linecap='round'>",
      "<path d='M120 700h1360'/>",
      "<path d='M190 250c110-62 240-62 350 0M250 315c90-44 190-44 280 0'/>",
      "</g>",
      "<path d='M940 180a78 78 0 1 0 0 156a98 98 0 1 1 0-156' fill='#d9bd82' fill-opacity='.07'/>",
      "<circle cx='1150' cy='258' r='132' fill='none' stroke='#d9bd82' stroke-opacity='.16' stroke-width='2.5'/>",
      "<circle cx='1150' cy='258' r='76' fill='#d9bd82' fill-opacity='.055' stroke='#d9bd82' stroke-opacity='.18' stroke-width='2'/>",
      "<g fill='none' stroke='#d9bd82' stroke-opacity='.20' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'>",
      "<path d='M980 900V430h104v470M1216 900V430h104v470M1084 900V566h132v334'/>",
      "<path d='M980 472h104M980 516h104M980 560h104M980 604h104M980 648h104M980 692h104M980 736h104M980 780h104M980 824h104M980 868h104'/>",
      "<path d='M1216 472h104M1216 516h104M1216 560h104M1216 604h104M1216 648h104M1216 692h104M1216 736h104M1216 780h104M1216 824h104M1216 868h104'/>",
      "<path d='M1084 598h132M1084 642h132M1084 686h132M1084 730h132M1084 774h132M1084 818h132M1084 862h132'/>",
      "<path d='M1032 430v-46M1268 430v-46M1006 384h52M1242 384h52'/>",
      "</g>",
      "<g fill='#d9bd82' fill-opacity='.22'>",
      "<circle cx='280' cy='150' r='2.2'/><circle cx='410' cy='210' r='1.6'/><circle cx='520' cy='160' r='1.8'/><circle cx='640' cy='110' r='1.4'/><circle cx='720' cy='190' r='2'/><circle cx='860' cy='130' r='1.5'/>",
      "</g>",
      "</svg>",
    ].join('');
    const FUDAN_SCENE_URL = `url("data:image/svg+xml,${encodeURIComponent(FUDAN_SCENE)}")`;
    const FUDAN_SCHOLAR_SRC = 'data:image/webp;base64,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';

    const PRESETS = [
      {
        id: 'fudan-scholar',
        labelKey: 'wall.preset.fudan-scholar',
        css: `url("${FUDAN_SCHOLAR_SRC}")`,
      },
      {
        id: 'fudan',
        labelKey: 'wall.preset.fudan',
        css: `${FUDAN_SCENE_URL},`
          + 'radial-gradient(1000px 760px at 14% 8%, rgba(32,92,158,.62), transparent 64%),'
          + 'radial-gradient(920px 760px at 92% 96%, rgba(6,24,48,.72), transparent 62%),'
          + 'linear-gradient(155deg, #061527 0%, #0a2b56 54%, #05111f 100%)',
      },
      {
        id: 'aurora',
        labelKey: 'wall.preset.aurora',
        css: 'radial-gradient(1200px 820px at 12% 8%, rgba(103,96,232,.62), transparent 62%),'
          + 'radial-gradient(900px 700px at 88% 2%, rgba(34,191,190,.46), transparent 58%),'
          + 'radial-gradient(800px 700px at 58% 100%, rgba(224,120,220,.28), transparent 62%),'
          + 'linear-gradient(160deg, #0a1022 0%, #101a36 55%, #080d1a 100%)',
      },
      {
        id: 'ocean',
        labelKey: 'wall.preset.ocean',
        css: 'radial-gradient(1000px 720px at 72% 16%, rgba(28,116,188,.55), transparent 62%),'
          + 'radial-gradient(760px 620px at 18% 88%, rgba(18,58,96,.6), transparent 60%),'
          + 'linear-gradient(200deg, #04121f 0%, #082238 58%, #02080f 100%)',
      },
      {
        id: 'mist',
        labelKey: 'wall.preset.mist',
        css: 'radial-gradient(920px 640px at 18% 12%, rgba(255,214,176,.72), transparent 62%),'
          + 'radial-gradient(860px 620px at 84% 4%, rgba(176,206,255,.7), transparent 58%),'
          + 'linear-gradient(150deg, #f7f1e9 0%, #e9eff8 55%, #dfe8f4 100%)',
      },
      {
        id: 'sakura',
        labelKey: 'wall.preset.sakura',
        css: 'radial-gradient(980px 700px at 14% 18%, rgba(255,178,203,.66), transparent 62%),'
          + 'radial-gradient(880px 600px at 86% 8%, rgba(255,227,238,.85), transparent 58%),'
          + 'linear-gradient(160deg, #fff7f9 0%, #fbe8f0 52%, #f2e7ff 100%)',
      },
      {
        id: 'night',
        labelKey: 'wall.preset.night',
        css: 'radial-gradient(1.6px 1.6px at 18% 26%, rgba(255,255,255,.95), transparent 60%),'
          + 'radial-gradient(1.4px 1.4px at 32% 62%, rgba(255,255,255,.8), transparent 60%),'
          + 'radial-gradient(1.7px 1.7px at 55% 18%, rgba(255,255,255,.9), transparent 60%),'
          + 'radial-gradient(1.3px 1.3px at 72% 48%, rgba(255,255,255,.75), transparent 60%),'
          + 'radial-gradient(1.6px 1.6px at 86% 24%, rgba(255,255,255,.85), transparent 60%),'
          + 'radial-gradient(1.2px 1.2px at 46% 82%, rgba(255,255,255,.7), transparent 60%),'
          + 'radial-gradient(900px 700px at 70% 100%, rgba(72,90,190,.4), transparent 60%),'
          + 'linear-gradient(180deg, #070b1a 0%, #0d1530 58%, #05070f 100%)',
      },
      {
        id: 'mint',
        labelKey: 'wall.preset.mint',
        css: 'radial-gradient(900px 640px at 16% 14%, rgba(172,240,214,.78), transparent 62%),'
          + 'radial-gradient(820px 600px at 88% 10%, rgba(190,222,255,.72), transparent 58%),'
          + 'linear-gradient(150deg, #f2fdf9 0%, #e2f5ee 52%, #e8f2fd 100%)',
      },
      {
        id: 'dusk',
        labelKey: 'wall.preset.dusk',
        css: 'radial-gradient(860px 620px at 20% 86%, rgba(231,111,131,.55), transparent 60%),'
          + 'radial-gradient(900px 680px at 78% 10%, rgba(92,72,178,.6), transparent 60%),'
          + 'linear-gradient(160deg, #241634 0%, #3c2a63 46%, #7a3a58 100%)',
      },
      {
        id: 'ink',
        labelKey: 'wall.preset.ink',
        css: 'radial-gradient(900px 600px at 16% 12%, rgba(255,255,255,.7), transparent 60%),'
          + 'radial-gradient(760px 560px at 82% 78%, rgba(148,163,184,.35), transparent 62%),'
          + 'linear-gradient(150deg, #f4f6f8 0%, #e5eaf0 46%, #d4dde7 100%)',
      },
    ];

    const PRESET_IDS = new Set(PRESETS.map((preset) => preset.id));
    // Add the preset names to both dictionaries without repeating the tables.
    const PRESET_NAMES = {
      'fudan-scholar': ['复旦 · 校园', 'Fudan · Campus'],
      fudan: ['复旦 · 光华', 'Fudan · Guanghua'],
      aurora: ['极光', 'Aurora'],
      ocean: ['深海', 'Deep sea'],
      mist: ['晨雾', 'Morning mist'],
      sakura: ['樱粉', 'Sakura'],
      night: ['星夜', 'Starry night'],
      mint: ['薄荷', 'Mint'],
      dusk: ['暮色', 'Dusk'],
      ink: ['墨白', 'Ink'],
    };
    for (const [id, names] of Object.entries(PRESET_NAMES)) {
      ZH[`wall.preset.${id}`] = names[0];
      EN[`wall.preset.${id}`] = names[1];
    }

    // ---------------------------------------------------------------------
    // Wallpaper settings store
    // ---------------------------------------------------------------------

    const DEFAULT_SETTINGS = {
      enabled: true,
      source: 'fudan-scholar',
      image: '',
      opacity: 0.8,
      blur: 0,
      scrim: 0.5,
      fit: 'cover',
    };

    function clampNumber(value, min, max, fallback) {
      const number = Number(value);
      if (!Number.isFinite(number)) return fallback;
      return Math.min(max, Math.max(min, number));
    }

    function normalizeSettings(raw) {
      const source = raw && typeof raw === 'object' ? raw : {};
      let id = typeof source.source === 'string' ? source.source : DEFAULT_SETTINGS.source;
      if (id !== 'none' && id !== 'custom' && !PRESET_IDS.has(id)) id = DEFAULT_SETTINGS.source;
      return {
        enabled: source.enabled !== false,
        source: id,
        image: typeof source.image === 'string' ? source.image : '',
        opacity: clampNumber(source.opacity, 0.05, 1, DEFAULT_SETTINGS.opacity),
        blur: clampNumber(source.blur, 0, 40, DEFAULT_SETTINGS.blur),
        scrim: clampNumber(source.scrim, 0, 0.85, DEFAULT_SETTINGS.scrim),
        fit: source.fit === 'contain' ? 'contain' : 'cover',
      };
    }

    function readJson(key) {
      try {
        const raw = window.localStorage.getItem(key);
        return raw === null ? null : JSON.parse(raw);
      } catch {
        return null;
      }
    }

    function readStoredPosition() {
      const stored = readJson(POSITION_KEY);
      if (stored === null || typeof stored !== 'object') return null;
      const left = Number(stored.left);
      const top = Number(stored.top);
      return Number.isFinite(left) && Number.isFinite(top) ? { left, top } : null;
    }

    function saveStoredPosition(position) {
      try {
        window.localStorage.setItem(POSITION_KEY, JSON.stringify(position));
      } catch {
        // Position memory is a convenience; dragging still works without it.
      }
    }

    function clearStoredPosition() {
      try {
        window.localStorage.removeItem(POSITION_KEY);
      } catch {
        // Ignore.
      }
    }

    let settingsState = {
      value: normalizeSettings(readJson(SETTINGS_KEY)),
      storageError: null,
    };
    let saveTimer = null;
    const settingsListeners = new Set();

    function getSettingsState() {
      return settingsState;
    }

    function emitSettings() {
      for (const listener of settingsListeners) listener();
    }

    function subscribeSettings(listener) {
      settingsListeners.add(listener);
      return () => settingsListeners.delete(listener);
    }

    function persistSettings(value) {
      try {
        window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(value));
        if (settingsState.storageError !== null) {
          settingsState = { value: settingsState.value, storageError: null };
          emitSettings();
        }
      } catch {
        settingsState = { value: settingsState.value, storageError: 'full' };
        emitSettings();
      }
    }

    function commitSettings(patch) {
      const value = normalizeSettings({ ...settingsState.value, ...patch });
      settingsState = { value, storageError: settingsState.storageError };
      applyWallpaper(value);
      emitSettings();
      if (saveTimer !== null) clearTimeout(saveTimer);
      saveTimer = setTimeout(() => {
        saveTimer = null;
        persistSettings(value);
      }, 160);
    }

    /**
     * One-time launch of the new paper wallpaper for the current profile.
     * The marker means later manual choices are never overridden again.
     */
    function activateScholarOnce() {
      try {
        if (window.localStorage.getItem(SCHOLAR_LIVE_KEY) === '1') return;
        const current = getSettingsState().value;
        const value = normalizeSettings({
          ...current,
          source: 'fudan-scholar',
          enabled: true,
          scrim: current.scrim > 0.3 ? 0.22 : current.scrim,
        });
        settingsState = { value, storageError: settingsState.storageError };
        applyWallpaper(value);
        emitSettings();
        persistSettings(value);
        window.localStorage.setItem(SCHOLAR_LIVE_KEY, '1');
      } catch {
        // A blocked storage still leaves the normal default; never break apply.
      }
    }

    function onStorageEvent(event) {
      if (event.key !== SETTINGS_KEY) return;
      let parsed = null;
      try {
        parsed = event.newValue === null ? null : JSON.parse(event.newValue);
      } catch {
        return;
      }
      settingsState = { value: normalizeSettings(parsed), storageError: null };
      applyWallpaper(settingsState.value);
      emitSettings();
    }

    // ---------------------------------------------------------------------
    // Wallpaper engine
    // ---------------------------------------------------------------------

    let wallLayer = null;
    let wallScrim = null;

    function backgroundFor(value) {
      if (!value.enabled || value.source === 'none') return null;
      if (value.source === 'custom') {
        return value.image === '' ? null : `url(${JSON.stringify(value.image)})`;
      }
      const preset = PRESETS.find((item) => item.id === value.source);
      return preset === undefined ? null : preset.css;
    }

    function ensureWallElements() {
      if (!document.body) return false;
      if (wallLayer === null) {
        wallLayer = document.createElement('div');
        wallLayer.className = 'dqw-wall-layer';
        wallLayer.setAttribute('aria-hidden', 'true');
        document.body.appendChild(wallLayer);
      }
      if (wallScrim === null) {
        wallScrim = document.createElement('div');
        wallScrim.className = 'dqw-wall-scrim';
        wallScrim.setAttribute('aria-hidden', 'true');
        document.body.appendChild(wallScrim);
      }
      return true;
    }

    function applyWallpaper(value) {
      if (!document.body) return;
      const background = backgroundFor(value);
      if (background === null) {
        document.body.removeAttribute('data-dqw-wallpaper');
        if (wallLayer !== null) wallLayer.style.display = 'none';
        if (wallScrim !== null) wallScrim.style.display = 'none';
        return;
      }
      ensureWallElements();
      wallLayer.style.display = 'block';
      wallScrim.style.display = 'block';
      wallLayer.style.backgroundImage = background;
      wallLayer.style.backgroundSize = value.fit === 'contain' ? 'contain' : 'cover';
      wallLayer.style.opacity = String(value.opacity);
      wallLayer.style.filter = value.blur > 0 ? `blur(${value.blur}px)` : 'none';
      wallLayer.style.transform = value.blur > 0 ? `scale(${1 + value.blur * 0.004})` : 'none';
      wallScrim.style.setProperty('--dqw-scrim', String(value.scrim));
      document.body.setAttribute('data-dqw-wallpaper', 'on');
    }

    function disposeWallpaper() {
      if (document.body) document.body.removeAttribute('data-dqw-wallpaper');
      if (wallLayer !== null) {
        wallLayer.remove();
        wallLayer = null;
      }
      if (wallScrim !== null) {
        wallScrim.remove();
        wallScrim = null;
      }
    }

    // ---------------------------------------------------------------------
    // Quota store
    // ---------------------------------------------------------------------

    let quotaState = {
      status: 'loading',
      data: null,
      error: null,
      refreshing: false,
      at: 0,
    };
    const quotaListeners = new Set();
    let quotaInFlight = null;
    let quotaTimer = null;

    function getQuotaState() {
      return quotaState;
    }

    function emitQuota(next) {
      quotaState = next;
      for (const listener of quotaListeners) listener();
    }

    function subscribeQuota(listener) {
      quotaListeners.add(listener);
      return () => quotaListeners.delete(listener);
    }

    function localDayKey(ms) {
      const date = new Date(ms);
      return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    }

    function readHistory() {
      const stored = readJson(HISTORY_KEY);
      if (!Array.isArray(stored)) return [];
      const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
      return stored.filter((point) => point
        && Number.isFinite(point.t)
        && Number.isFinite(point.total)
        && point.t >= cutoff
        && typeof point.currency === 'string').slice(-800);
    }

    let balanceHistory = readHistory();

    function rememberBalance(data) {
      const at = Number.isFinite(data.fetchedAt) ? data.fetchedAt : Date.now();
      const last = balanceHistory[balanceHistory.length - 1];
      const point = { t: at, total: data.total, currency: data.currency };
      // One sample per five-minute bucket keeps two weeks of history small
      // while still giving "spent today" and a daily average enough resolution.
      if (last !== undefined
        && last.currency === point.currency
        && at - last.t < 5 * 60 * 1000) {
        balanceHistory[balanceHistory.length - 1] = point;
      } else {
        balanceHistory.push(point);
      }
      if (balanceHistory.length > 4000) balanceHistory = balanceHistory.slice(-4000);
      try {
        window.localStorage.setItem(HISTORY_KEY, JSON.stringify(balanceHistory));
      } catch {
        // History is a convenience only; the quota itself still works.
      }
    }

    function usageStats(data) {
      if (data === null || !Number.isFinite(data.total)) {
        return { today: null, average: null, days: null };
      }
      const points = balanceHistory
        .filter((point) => point.currency === data.currency)
        .slice()
        .sort((a, b) => a.t - b.t);
      const todayKey = localDayKey(Date.now());
      const byDay = new Map();
      for (const point of points) {
        const key = localDayKey(point.t);
        const list = byDay.get(key);
        if (list === undefined) byDay.set(key, [point]);
        else list.push(point);
      }
      const todayPoints = byDay.get(todayKey) ?? [];
      const today = todayPoints.length >= 2
        ? Math.max(0, todayPoints[0].total - todayPoints[todayPoints.length - 1].total)
        : null;
      const dailySpends = [];
      for (const [key, list] of byDay) {
        if (key === todayKey || list.length < 2) continue;
        dailySpends.push(Math.max(0, list[0].total - list[list.length - 1].total));
      }
      let average = null;
      if (dailySpends.length > 0) {
        average = dailySpends.reduce((sum, value) => sum + value, 0) / dailySpends.length;
      } else if (today !== null && today > 0) {
        average = today;
      }
      const days = average !== null && average > 0 ? data.total / average : null;
      return { today, average, days };
    }

    async function refreshQuota() {
      if (quotaInFlight !== null) return quotaInFlight;
      const previous = quotaState;
      emitQuota({ ...previous, refreshing: true });
      quotaInFlight = (async () => {
        let next;
        try {
          const response = await fetch(`${API_PATH}?t=${Date.now()}`, {
            cache: 'no-store',
            headers: { accept: 'application/json' },
          });
          let body = null;
          try {
            body = await response.json();
          } catch {
            body = null;
          }
          if (!response.ok || body === null || body.ok !== true) {
            next = {
              status: previous.data === null ? 'error' : 'ready',
              data: previous.data,
              error: {
                code: body !== null && typeof body.code === 'string' ? body.code : 'http',
                status: body !== null && Number.isFinite(body.status) ? body.status : response.status,
              },
              refreshing: false,
              at: Date.now(),
            };
          } else if (!Number.isFinite(body.total)) {
            next = {
              status: previous.data === null ? 'error' : 'ready',
              data: previous.data,
              error: { code: 'payload' },
              refreshing: false,
              at: Date.now(),
            };
          } else {
            rememberBalance(body);
            next = {
              status: 'ready',
              data: body,
              error: null,
              refreshing: false,
              at: Date.now(),
            };
          }
        } catch {
          next = {
            status: previous.data === null ? 'error' : 'ready',
            data: previous.data,
            error: { code: 'network' },
            refreshing: false,
            at: Date.now(),
          };
        } finally {
          quotaInFlight = null;
        }
        emitQuota(next);
        return next;
      })();
      return quotaInFlight;
    }

    function onVisibilityChange() {
      if (document.visibilityState === 'visible') {
        refreshQuota();
        refreshWeather();
      }
    }

    function startQuotaPolling() {
      if (quotaTimer !== null) return;
      refreshQuota();
      quotaTimer = setInterval(() => {
        if (document.visibilityState !== 'hidden') refreshQuota();
      }, 60_000);
      document.addEventListener('visibilitychange', onVisibilityChange);
    }

    function stopQuotaPolling() {
      if (quotaTimer !== null) {
        clearInterval(quotaTimer);
        quotaTimer = null;
      }
      document.removeEventListener('visibilitychange', onVisibilityChange);
    }

    function useQuota() {
      return useSyncExternalStore(subscribeQuota, getQuotaState);
    }

    // ---------------------------------------------------------------------
    // Weather store (Open-Meteo, Fudan Handan campus)
    // ---------------------------------------------------------------------

    const WEATHER_RAIN_CODES = new Set([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99]);
    const WEATHER_SNOW_CODES = new Set([71, 73, 75, 77, 85, 86]);

    function weatherKindOf(code) {
      if (code === 0 || code === 1) return 'clear';
      if (code === 2) return 'partly';
      if (code === 3) return 'cloud';
      if (code === 45 || code === 48) return 'fog';
      if (WEATHER_SNOW_CODES.has(code)) return 'snow';
      if (code === 95 || code === 96 || code === 99) return 'storm';
      if (WEATHER_RAIN_CODES.has(code)) return 'rain';
      return 'cloud';
    }

    function isRainCode(code) {
      return WEATHER_RAIN_CODES.has(code);
    }

    function numberOrNull(value) {
      const number = Number(value);
      return Number.isFinite(number) ? number : null;
    }

    function roundOne(value) {
      return Math.round(value * 10) / 10;
    }

    let weatherState = {
      status: 'loading',
      data: null,
      error: null,
      refreshing: false,
      at: 0,
    };
    const weatherListeners = new Set();
    let weatherInFlight = null;
    let weatherTimer = null;

    function getWeatherState() {
      return weatherState;
    }

    function emitWeather(next) {
      weatherState = next;
      for (const listener of weatherListeners) listener();
    }

    function subscribeWeather(listener) {
      weatherListeners.add(listener);
      return () => weatherListeners.delete(listener);
    }

    /** Parse Open-Meteo into the small shape the card renders. */
    function parseWeather(payload) {
      const current = payload?.current;
      const hourly = payload?.hourly;
      if (current === null || typeof current !== 'object'
        || hourly === null || typeof hourly !== 'object'
        || !Array.isArray(hourly.time)) {
        return null;
      }
      const temperature = numberOrNull(current.temperature_2m);
      if (temperature === null) return null;

      const now = Date.now();
      const times = hourly.time;
      const probabilities = Array.isArray(hourly.precipitation_probability) ? hourly.precipitation_probability : [];
      const amounts = Array.isArray(hourly.precipitation) ? hourly.precipitation : [];
      const codes = Array.isArray(hourly.weather_code) ? hourly.weather_code : [];
      const timeAt = (index) => {
        const raw = times[index];
        if (typeof raw !== 'string') return Number.NaN;
        return Date.parse(raw.length === 16 ? `${raw}:00+08:00` : `${raw}+08:00`);
      };
      const isRainHour = (index) => {
        const probability = numberOrNull(probabilities[index]);
        const amount = numberOrNull(amounts[index]);
        const code = numberOrNull(codes[index]);
        if (probability !== null && probability >= 50) return true;
        if (amount !== null && amount >= 0.1) return true;
        return code !== null && isRainCode(code) && amount !== null && amount > 0;
      };

      const code = numberOrNull(current.weather_code) ?? 3;
      const precipitation = numberOrNull(current.precipitation);
      const rainingNow = isRainCode(code) || (precipitation !== null && precipitation >= 0.05);
      const WINDOW_BEFORE = 30 * 60 * 1000;
      const HORIZON = 24 * 60 * 60 * 1000;
      let firstRainIndex = -1;
      for (let index = 0; index < times.length; index += 1) {
        const at = timeAt(index);
        if (!Number.isFinite(at)) continue;
        if (at < now - WINDOW_BEFORE) continue;
        if (at > now + HORIZON) break;
        if (isRainHour(index)) {
          firstRainIndex = index;
          break;
        }
      }

      let rain = null;
      if (rainingNow) {
        let endsAt = null;
        for (let index = 0; index < times.length; index += 1) {
          const at = timeAt(index);
          if (!Number.isFinite(at) || at <= now) continue;
          if (at > now + HORIZON) break;
          if (!isRainHour(index)) {
            endsAt = at;
            break;
          }
        }
        rain = {
          rainingNow: true,
          startsAt: now,
          endsAt,
          probability: null,
          amount: precipitation,
        };
      } else if (firstRainIndex !== -1) {
        const startsAt = Math.max(timeAt(firstRainIndex), now);
        let endsAt = null;
        for (let index = firstRainIndex; index < times.length; index += 1) {
          const at = timeAt(index);
          if (!Number.isFinite(at)) continue;
          if (at > now + HORIZON) break;
          if (!isRainHour(index) && at > startsAt) {
            endsAt = at;
            break;
          }
        }
        rain = {
          rainingNow: false,
          startsAt,
          endsAt,
          probability: numberOrNull(probabilities[firstRainIndex]),
          amount: numberOrNull(amounts[firstRainIndex]),
        };
      }

      return {
        fetchedAt: now,
        current: {
          temperature: roundOne(temperature),
          apparent: (() => {
            const value = numberOrNull(current.apparent_temperature);
            return value === null ? null : roundOne(value);
          })(),
          humidity: (() => {
            const value = numberOrNull(current.relative_humidity_2m);
            return value === null ? null : Math.round(value);
          })(),
          precipitation,
          code,
          kind: weatherKindOf(code),
          isDay: current.is_day === 1 || current.is_day === '1',
          windSpeed: (() => {
            const value = numberOrNull(current.wind_speed_10m);
            return value === null ? null : roundOne(value);
          })(),
        },
        rain,
        withinHours: 24,
      };
    }

    async function refreshWeather() {
      if (weatherInFlight !== null) return weatherInFlight;
      const previous = weatherState;
      emitWeather({ ...previous, refreshing: true });
      weatherInFlight = (async () => {
        let next;
        try {
          const params = new URLSearchParams({
            latitude: String(WEATHER_POINT.latitude),
            longitude: String(WEATHER_POINT.longitude),
            current: 'temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,is_day,wind_speed_10m',
            hourly: 'precipitation_probability,precipitation,weather_code',
            timezone: 'Asia/Shanghai',
            forecast_days: '2',
          });
          const signal = typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function'
            ? AbortSignal.timeout(12_000)
            : undefined;
          const response = await fetch(`${WEATHER_ENDPOINT}?${params.toString()}`, {
            cache: 'no-store',
            headers: { accept: 'application/json' },
            signal,
          });
          let payload = null;
          try {
            payload = await response.json();
          } catch {
            payload = null;
          }
          if (!response.ok || payload === null) {
            next = {
              status: previous.data === null ? 'error' : 'ready',
              data: previous.data,
              error: { code: 'http', status: response.status },
              refreshing: false,
              at: Date.now(),
            };
          } else {
            const data = parseWeather(payload);
            next = data === null
              ? {
                status: previous.data === null ? 'error' : 'ready',
                data: previous.data,
                error: { code: 'payload' },
                refreshing: false,
                at: Date.now(),
              }
              : {
                status: 'ready',
                data,
                error: null,
                refreshing: false,
                at: Date.now(),
              };
          }
        } catch (error) {
          const timedOut = error?.name === 'TimeoutError' || error?.name === 'AbortError';
          next = {
            status: previous.data === null ? 'error' : 'ready',
            data: previous.data,
            error: { code: timedOut ? 'timeout' : 'network' },
            refreshing: false,
            at: Date.now(),
          };
        } finally {
          weatherInFlight = null;
        }
        emitWeather(next);
        return next;
      })();
      return weatherInFlight;
    }

    function startWeatherPolling() {
      if (weatherTimer !== null) return;
      refreshWeather();
      weatherTimer = setInterval(() => {
        if (document.visibilityState !== 'hidden') refreshWeather();
      }, WEATHER_REFRESH_MS);
    }

    function stopWeatherPolling() {
      if (weatherTimer !== null) {
        clearInterval(weatherTimer);
        weatherTimer = null;
      }
    }

    function useWeather() {
      return useSyncExternalStore(subscribeWeather, getWeatherState);
    }

    function useSettings() {
      return useSyncExternalStore(subscribeSettings, getSettingsState);
    }

    // ---------------------------------------------------------------------
    // Formatting helpers
    // ---------------------------------------------------------------------

    function currencySymbol(currency) {
      return currency === 'USD' ? '$' : '¥';
    }

    function formatMoney(value, currency, digits = 2) {
      if (!Number.isFinite(value)) return '—';
      const fixed = Math.abs(value) >= 1000 ? 2 : digits;
      return `${currencySymbol(currency)}${value.toLocaleString(undefined, {
        minimumFractionDigits: fixed,
        maximumFractionDigits: fixed,
      })}`;
    }

    function formatCountdown(ms, t) {
      if (!Number.isFinite(ms) || ms <= 0) return '';
      const minutes = Math.max(1, Math.ceil(ms / 60_000));
      const days = Math.floor(minutes / 1440);
      const hours = Math.floor((minutes % 1440) / 60);
      const rest = minutes % 60;
      if (days > 0) return `${days}${t('time.day')} ${hours}${t('time.hour')}`;
      if (hours > 0) return `${hours}${t('time.hour')} ${rest}${t('time.minute')}`;
      return `${rest}${t('time.minute')}`;
    }

    function formatDays(days, t) {
      if (days === null) return '—';
      if (days > 365) return t('quota.ample');
      if (days < 1) return t('quota.lessDay');
      return `${Math.round(days)}${t('time.day')}`;
    }

    function errorText(t, error) {
      if (error === null || error === undefined) return '';
      switch (error.code) {
        case 'noKey': return t('quota.error.noKey');
        case 'badKey': return t('quota.error.badKey');
        case 'timeout': return t('quota.error.timeout');
        case 'network': return t('quota.error.network');
        case 'http': return `${t('quota.error.http')} ${error.status ?? ''}`.trim();
        case 'payload': return t('quota.error.payload');
        case 'empty': return t('quota.error.empty');
        case 'internal': return t('quota.error.internal');
        case 'forbidden': return t('quota.error.forbidden');
        case 'unavailable': return t('quota.error.unavailable');
        default: return t('quota.error.network');
      }
    }

    const WEATHER_KIND_KEYS = {
      clear: 'weather.cond.clear',
      partly: 'weather.cond.partly',
      cloud: 'weather.cond.cloud',
      fog: 'weather.cond.fog',
      rain: 'weather.cond.rain',
      storm: 'weather.cond.storm',
      snow: 'weather.cond.snow',
    };

    function weatherLabel(t, kind) {
      return t(WEATHER_KIND_KEYS[kind] ?? 'weather.cond.cloud');
    }

    function formatClock(ms) {
      if (!Number.isFinite(ms)) return '';
      return new Date(ms).toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    }

    function formatRainTime(t, ms) {
      if (!Number.isFinite(ms)) return '';
      const date = new Date(ms);
      const now = new Date();
      const sameDay = date.getFullYear() === now.getFullYear()
        && date.getMonth() === now.getMonth()
        && date.getDate() === now.getDate();
      return sameDay
        ? formatClock(ms)
        : `${t('weather.tomorrow')} ${formatClock(ms)}`;
    }

    function rainSummary(t, weather) {
      if (weather === null || weather === undefined) return t('weather.unavailable');
      const rain = weather.rain;
      if (rain === null) return t('weather.noRain');
      if (rain.rainingNow) return t('weather.rainNow');
      if (rain.startsAt - Date.now() <= 30 * 60 * 1000) return t('weather.rainSoon');
      const probability = Number.isFinite(rain.probability) ? ` · ${rain.probability}%` : '';
      return `${formatRainTime(t, rain.startsAt)} ${t('weather.rainAt')}${probability}`;
    }

    function rainDetail(t, weather) {
      if (weather === null || weather === undefined) return t('weather.unavailable');
      const rain = weather.rain;
      if (rain === null) return t('weather.noRain');
      if (rain.rainingNow) {
        return rain.endsAt === null
          ? t('weather.rainNow')
          : `${t('weather.rainNow')} · ${t('weather.rainUntil')} ${formatClock(rain.endsAt)}`;
      }
      const probability = Number.isFinite(rain.probability) ? ` · ${rain.probability}%` : '';
      const start = `${formatRainTime(t, rain.startsAt)} ${t('weather.rainAt')}${probability}`;
      return rain.endsAt === null
        ? start
        : `${start} · ${t('weather.rainUntil')} ${formatClock(rain.endsAt)}`;
    }

    function weatherErrorText(t, error) {
      if (error === null || error === undefined) return '';
      switch (error.code) {
        case 'timeout': return t('weather.error.timeout');
        case 'http': return `${t('weather.error.http')} ${error.status ?? ''}`.trim();
        case 'payload': return t('weather.error.payload');
        default: return t('weather.error.network');
      }
    }

    function useTick(active) {
      const [, setTick] = useState(0);
      useEffect(() => {
        if (!active) return undefined;
        const timer = setInterval(() => setTick((value) => value + 1), 20_000);
        return () => clearInterval(timer);
      }, [active]);
    }

    function cx(...parts) {
      return parts.filter(Boolean).join(' ');
    }

    function readFileAsDataUrl(file) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : null);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      });
    }

    // ---------------------------------------------------------------------
    // Small icons
    // ---------------------------------------------------------------------

    function IconRefresh({ size = 14 }) {
      return h('svg', {
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 2,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': true,
      },
        h('path', { d: 'M20 11a8 8 0 1 0-2.6 6' }),
        h('path', { d: 'M20 4v7h-7' }),
      );
    }

    function IconCheck({ size = 12 }) {
      return h('svg', {
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 3,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': true,
      }, h('path', { d: 'M4 12.5 9.5 18 20 6.5' }));
    }

    function IconExternal({ size = 12 }) {
      return h('svg', {
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 2,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': true,
      },
        h('path', { d: 'M14 4h6v6' }),
        h('path', { d: 'M20 4 11 13' }),
        h('path', { d: 'M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5' }),
      );
    }

    function IconLocate({ size = 14 }) {
      return h('svg', {
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.8,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': true,
      },
        h('circle', { cx: '12', cy: '12', r: '6.2' }),
        h('circle', { cx: '12', cy: '12', r: '1.6', fill: 'currentColor', stroke: 'none' }),
        h('path', { d: 'M12 2.2v3.2M12 18.6v3.2M2.2 12h3.2M18.6 12h3.2' }),
      );
    }

    // ---------------------------------------------------------------------
    // Primitive controls
    // ---------------------------------------------------------------------

    /**
     * An original Fudan-inspired seal: a gold sun over an ivory horizon inside
     * a deep-blue ring, with 1905 at the foot. It reads as "旦" and the
     * "日月光华" motif without reproducing the official university emblem.
     */
    function SealMark({ size = 44 }) {
      return h('svg', {
        width: size,
        height: size,
        viewBox: '0 0 44 44',
        fill: 'none',
        'aria-hidden': true,
        className: 'dqw-sealSvg',
      },
        h('defs', null,
          h('linearGradient', { id: 'dqw-seal-rim', x1: '0', y1: '0', x2: '1', y2: '1' },
            h('stop', { offset: '0', stopColor: '#ecd8a9' }),
            h('stop', { offset: '.55', stopColor: '#c8a96a' }),
            h('stop', { offset: '1', stopColor: '#8d6f3c' }),
          ),
          h('radialGradient', { id: 'dqw-seal-sun', cx: '.5', cy: '.35', r: '.7' },
            h('stop', { offset: '0', stopColor: '#fff8e6' }),
            h('stop', { offset: '.55', stopColor: '#e8cd8b' }),
            h('stop', { offset: '1', stopColor: '#c8a96a' }),
          ),
          h('linearGradient', { id: 'dqw-seal-bg', x1: '0', y1: '0', x2: '1', y2: '1' },
            h('stop', { offset: '0', stopColor: '#103a6c' }),
            h('stop', { offset: '1', stopColor: '#06182f' }),
          ),
        ),
        h('circle', { cx: 22, cy: 22, r: 20.4, fill: 'url(#dqw-seal-bg)', stroke: 'url(#dqw-seal-rim)', strokeWidth: 1.25 }),
        h('circle', { cx: 22, cy: 22, r: 17.2, fill: 'none', stroke: 'rgba(236,216,169,.28)', strokeWidth: .7, strokeDasharray: '1 2.4' }),
        h('circle', { cx: 22, cy: 16.9, r: 4.35, fill: 'url(#dqw-seal-sun)' }),
        h('path', { d: 'M13.4 24.1h17.2', stroke: '#f3ead7', strokeWidth: 1.4, strokeLinecap: 'round' }),
        h('text', {
          x: 22,
          y: 35.4,
          textAnchor: 'middle',
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: '3.8',
          letterSpacing: '.55',
          fill: '#d9bd82',
        }, '1905'),
      );
    }

    /**
     * The university emblem on a white lapel-pin disc. The bitmap is embedded
     * so the badge works without a second network route; if it cannot decode,
     * the original seal above is the fallback.
     */
    function Emblem({ size = 46 }) {
      const [failed, setFailed] = useState(false);
      if (failed || EMBLEM_SRC.startsWith('__')) return h(SealMark, { size });
      return h('span', {
        className: 'dqw-emblem',
        style: { width: size, height: size },
      }, h('img', {
        src: EMBLEM_SRC,
        alt: '',
        draggable: false,
        onError: () => setFailed(true),
      }));
    }

    function WeatherIcon({ kind = 'cloud', isDay = true, size = 18 }) {
      const props = {
        viewBox: '0 0 24 24',
        width: size,
        height: size,
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.6,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': true,
        className: cx('dqw-weatherIcon', `is-${kind}`),
      };
      if (kind === 'clear' && isDay) {
        return h('svg', props,
          h('circle', { cx: 12, cy: 12, r: 3.6 }),
          h('path', { d: 'M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M18.7 5.3l-1.4 1.4M6.7 17.3l-1.4 1.4' }),
        );
      }
      if (kind === 'clear') {
        return h('svg', props,
          h('path', { d: 'M20.2 14.3A8.4 8.4 0 1 1 9.7 3.8a7 7 0 0 0 10.5 10.5Z' }),
          h('path', { d: 'M17.5 4.5v2M16.5 5.5h2' }),
        );
      }
      if (kind === 'partly') {
        return h('svg', props,
          isDay
            ? h(React.Fragment, null,
              h('circle', { cx: 8.6, cy: 8.2, r: 2.7 }),
              h('path', { d: 'M8.6 2.8v1.4M3.2 8.2h1.4M4.8 4.4l1 1M12.4 4.4l-1 1' }),
            )
            : h('path', { d: 'M14 11.2A5.6 5.6 0 1 1 7 4.2a4.7 4.7 0 0 0 7 7Z' }),
          h('path', { d: 'M10 18h6.4a2.8 2.8 0 0 0 .3-5.58A4.4 4.4 0 0 0 8.6 11.2A3 3 0 0 0 10 18Z' }),
        );
      }
      if (kind === 'rain') {
        return h('svg', props,
          h('path', { d: 'M7 16.5h9.5a3.5 3.5 0 0 0 .4-6.98A5.5 5.5 0 0 0 6.4 8.9A3.8 3.8 0 0 0 7 16.5Z' }),
          h('path', { d: 'M9 18.5l-1 2.4M13 18.5l-1 2.4M17 18.5l-1 2.4' }),
        );
      }
      if (kind === 'storm') {
        return h('svg', props,
          h('path', { d: 'M7 15.5h9.5a3.5 3.5 0 0 0 .4-6.98A5.5 5.5 0 0 0 6.4 7.9A3.8 3.8 0 0 0 7 15.5Z' }),
          h('path', { d: 'M13 17l-1.8 3h2.8l-1.6 2.8' }),
        );
      }
      if (kind === 'snow') {
        return h('svg', props,
          h('path', { d: 'M7 15.5h9.5a3.5 3.5 0 0 0 .4-6.98A5.5 5.5 0 0 0 6.4 7.9A3.8 3.8 0 0 0 7 15.5Z' }),
          h('path', { d: 'M9 18.2v2.4M7.9 19l2.2 1M10.1 19l-2.2 1M15 18.2v2.4M13.9 19l2.2 1M16.1 19l-2.2 1' }),
        );
      }
      if (kind === 'fog') {
        return h('svg', props,
          h('path', { d: 'M5 9h14M3.5 13h17M5 17h14' }),
          h('circle', { cx: 17, cy: 5.4, r: 2.1, opacity: '.65' }),
        );
      }
      return h('svg', props,
        h('path', { d: 'M7 16.5h9.5a3.5 3.5 0 0 0 .4-6.98A5.5 5.5 0 0 0 6.4 8.9A3.8 3.8 0 0 0 7 16.5Z' }),
      );
    }


    /** A faint line drawing of the twin towers for the popover watermark. */
    function CampusMark() {
      return h('svg', {
        className: 'dqw-popCampus',
        viewBox: '0 0 240 130',
        fill: 'none',
        'aria-hidden': true,
      },
        h('g', {
          stroke: 'currentColor',
          strokeWidth: '1.1',
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        },
          h('path', { d: 'M78 128V30h30v98M132 128V30h30v98M108 128V62h24v66' }),
          h('path', { d: 'M78 44h30M78 58h30M78 72h30M78 86h30M78 100h30M78 114h30' }),
          h('path', { d: 'M132 44h30M132 58h30M132 72h30M132 86h30M132 100h30M132 114h30' }),
          h('path', { d: 'M108 74h24M108 88h24M108 102h24M108 116h24' }),
          h('path', { d: 'M93 30v-10M147 30v-10' }),
          h('path', { d: 'M22 116h196' }),
        ),
        h('circle', { cx: 120, cy: 20, r: 9, stroke: 'currentColor', strokeWidth: '1.1', strokeOpacity: '.8' }),
        h('circle', { cx: 120, cy: 20, r: 2.6, fill: 'currentColor', fillOpacity: '.5' }),
      );
    }

    function sparkGeometry(data) {
      if (data === null || data === undefined || !Number.isFinite(data.total)) return null;
      const cutoff = Date.now() - 24 * 60 * 60 * 1000;
      let points = balanceHistory.filter((point) => point.currency === data.currency && point.t >= cutoff);
      if (points.length < 2) return null;
      if (points.length > 36) {
        const step = Math.ceil(points.length / 36);
        const reduced = points.filter((_, index) => index % step === 0);
        if (reduced[reduced.length - 1] !== points[points.length - 1]) reduced.push(points[points.length - 1]);
        points = reduced;
      }
      const width = 72;
      const height = 32;
      const pad = 3.5;
      const values = points.map((point) => point.total);
      let min = Math.min(...values);
      let max = Math.max(...values);
      if (max - min < 0.0001) {
        min -= 0.5;
        max += 0.5;
      }
      const range = max - min;
      const coords = points.map((point, index) => ({
        x: pad + (index / (points.length - 1)) * (width - pad * 2),
        y: pad + (1 - (point.total - min) / range) * (height - pad * 2),
      }));
      const line = coords.map((coord, index) => `${index === 0 ? 'M' : 'L'}${coord.x.toFixed(1)} ${coord.y.toFixed(1)}`).join(' ');
      const first = coords[0];
      const last = coords[coords.length - 1];
      const area = `${line} L${last.x.toFixed(1)} ${height - pad} L${first.x.toFixed(1)} ${height - pad} Z`;
      return { line, area, last };
    }

    function Sparkline({ data }) {
      const geometry = useMemo(() => sparkGeometry(data), [data]);
      return h('svg', {
        className: 'dqw-spark',
        viewBox: '0 0 72 32',
        fill: 'none',
        'aria-hidden': true,
      },
        h('defs', null,
          h('linearGradient', { id: 'dqw-spark-fill', x1: '0', y1: '0', x2: '0', y2: '1' },
            h('stop', { offset: '0', stopColor: '#d9bd82', stopOpacity: '.34' }),
            h('stop', { offset: '1', stopColor: '#d9bd82', stopOpacity: '0' }),
          ),
        ),
        geometry === null
          ? h(React.Fragment, null,
            h('path', {
              d: 'M3 21C14 18 24 24 36 17S58 19 69 13',
              stroke: '#d9bd82',
              strokeWidth: '1.2',
              strokeDasharray: '2 4',
              strokeLinecap: 'round',
              opacity: '.42',
            }),
            h('circle', { cx: 69, cy: 13, r: 1.8, fill: '#d9bd82', opacity: '.55' }),
          )
          : h(React.Fragment, null,
            h('path', { d: geometry.area, fill: 'url(#dqw-spark-fill)' }),
            h('path', {
              d: geometry.line,
              stroke: '#d9bd82',
              strokeWidth: '1.6',
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
            }),
            h('circle', {
              cx: geometry.last.x,
              cy: geometry.last.y,
              r: 2.3,
              fill: '#f4eedf',
              stroke: '#c8a96a',
              strokeWidth: '1.2',
            }),
          ),
      );
    }

    function IconButton({ label, onClick, busy, children }) {
      return h('button', {
        type: 'button',
        className: cx('dqw-iconBtn', busy && 'is-busy'),
        onClick,
        'aria-label': label,
        title: label,
        disabled: busy,
      }, busy ? h('span', { className: 'dqw-spinner' }) : children);
    }

    function Switch({ checked, onChange, label }) {
      return h('button', {
        type: 'button',
        role: 'switch',
        'aria-checked': checked,
        'aria-label': label,
        className: cx('dqw-switch', checked && 'is-on'),
        onClick: () => onChange(!checked),
        title: label,
      }, h('span', { className: 'dqw-switchKnob' }));
    }

    function Slider({ label, value, min, max, step, onChange, format, disabled }) {
      const fill = ((value - min) / (max - min)) * 100;
      return h('label', { className: cx('dqw-sliderRow', disabled && 'is-disabled') },
        h('span', { className: 'dqw-sliderLabel' }, label),
        h('input', {
          type: 'range',
          className: 'dqw-slider',
          min,
          max,
          step,
          value,
          disabled,
          'aria-label': label,
          style: { '--dqw-fill': `${fill}%` },
          onChange: (event) => onChange(Number(event.currentTarget.value)),
        }),
        h('span', { className: 'dqw-sliderValue' }, format(value)),
      );
    }

    function Segmented({ label, value, options, onChange }) {
      return h('div', { className: 'dqw-sliderRow' },
        h('span', { className: 'dqw-sliderLabel' }, label),
        h('div', { className: 'dqw-seg', role: 'group', 'aria-label': label },
          options.map((option) => h('button', {
            key: option.value,
            type: 'button',
            className: cx('dqw-segBtn', value === option.value && 'is-active'),
            'aria-pressed': value === option.value,
            onClick: () => onChange(option.value),
          }, option.label))
        ),
      );
    }

    // ---------------------------------------------------------------------
    // Quota fragments
    // ---------------------------------------------------------------------

    function PeakChip({ t, peak, dark }) {
      return h('span', { className: cx('dqw-chip', peak ? 'is-peak' : 'is-off', dark && 'is-dark') },
        h('span', { className: 'dqw-chipDot' }),
        peak ? t('quota.peak') : t('quota.offPeak'),
      );
    }

    function WalletBar({ t, data, dark }) {
      const granted = Number.isFinite(data.granted) ? data.granted : 0;
      const topped = Number.isFinite(data.toppedUp) ? data.toppedUp : 0;
      const sum = granted + topped;
      if (sum <= 0) return null;
      const grantedPct = (granted / sum) * 100;
      return h('div', { className: cx('dqw-wallet', dark && 'is-dark') },
        h('div', { className: 'dqw-walletBar', role: 'img', 'aria-label': `${t('quota.granted')} ${formatMoney(granted, data.currency)} / ${t('quota.topped')} ${formatMoney(topped, data.currency)}` },
          h('span', { className: 'dqw-walletTopped', style: { width: `${100 - grantedPct}%` } }),
          h('span', { className: 'dqw-walletGranted', style: { width: `${grantedPct}%` } }),
        ),
        h('div', { className: 'dqw-walletLegend' },
          h('span', { className: 'dqw-legendItem' },
            h('span', { className: 'dqw-legendDot is-topped' }),
            t('quota.topped'),
            h('b', null, formatMoney(topped, data.currency)),
          ),
          h('span', { className: 'dqw-legendItem' },
            h('span', { className: 'dqw-legendDot is-granted' }),
            t('quota.granted'),
            h('b', null, formatMoney(granted, data.currency)),
          ),
        ),
      );
    }

    function PriceRow({ t, data }) {
      if (data.price === null || data.price === undefined) {
        return h('p', { className: 'dqw-hint' }, t('quota.noPrice'));
      }
      const price = data.price;
      return h('div', { className: 'dqw-price' },
        h('div', { className: 'dqw-priceHead' },
          h('span', { className: 'dqw-priceModel' }, price.model),
          h('span', { className: 'dqw-hint' }, t('quota.unit')),
        ),
        h('div', { className: 'dqw-priceGrid' },
          h('span', null, t('quota.in'), h('b', null, formatMoney(price.input, price.currency))),
          h('span', null, t('quota.cache'), h('b', null, formatMoney(price.cacheRead, price.currency))),
          h('span', null, t('quota.out'), h('b', null, formatMoney(price.output, price.currency))),
        ),
      );
    }

    function QuotaError({ t, quota }) {
      if (quota.error === null) return null;
      return h('div', { className: 'dqw-errorBox', role: 'status' },
        h('div', { className: 'dqw-errorTitle' }, errorText(t, quota.error)),
        quota.error.code === 'noKey' && h('div', { className: 'dqw-hint' }, t('quota.emptyHint')),
      );
    }

    // ---------------------------------------------------------------------
    // Quota board (page)
    // ---------------------------------------------------------------------

    function QuotaPanel({ t, quota }) {
      useTick(true);
      const weather = useWeather();
      const weatherData = weather.data;
      const weatherCurrent = weatherData !== null ? weatherData.current : null;
      const data = quota.data;
      const stats = useMemo(() => usageStats(data), [data, quota.at]);
      const updated = data !== null && Number.isFinite(data.fetchedAt)
        ? new Date(data.fetchedAt).toLocaleTimeString()
        : '—';
      return h('section', { className: 'dqw-card' },
        h('div', { className: 'dqw-cardHead' },
          h('div', null,
            h('h2', { className: 'dqw-cardTitle' }, t('quota.title')),
            h('p', { className: 'dqw-cardSub' }, t('common.updated'), ' ', updated),
          ),
          h(IconButton, {
            label: t('common.refresh'),
            onClick: () => {
              refreshQuota();
              refreshWeather();
            },
            busy: quota.refreshing,
          }, h(IconRefresh, { size: 14 })),
        ),

        h(QuotaError, { t, quota }),

        data === null
          ? (quota.error === null
            ? h('div', { className: 'dqw-skeleton' }, t('common.loading'))
            : null)
          : h(React.Fragment, null,
            h('div', { className: 'dqw-balance' },
              h('div', { className: 'dqw-balanceLabel' }, t('quota.balance')),
              h('div', { className: 'dqw-balanceRow' },
                h('span', { className: 'dqw-balanceValue' }, formatMoney(data.total, data.currency)),
                h('span', { className: cx('dqw-badge', data.available === false ? 'is-warn' : 'is-ok') },
                  data.available === false ? t('quota.unavailable') : t('quota.available'),
                ),
              ),
            ),

            h(WalletBar, { t, data }),

            h('div', { className: 'dqw-stats' },
              h('div', { className: 'dqw-stat' },
                h('span', { className: 'dqw-statLabel' }, t('quota.today')),
                h('b', { className: 'dqw-statValue' }, stats.today === null ? '—' : formatMoney(stats.today, data.currency)),
              ),
              h('div', { className: 'dqw-stat' },
                h('span', { className: 'dqw-statLabel' }, t('quota.avg')),
                h('b', { className: 'dqw-statValue' }, stats.average === null ? '—' : formatMoney(stats.average, data.currency)),
              ),
              h('div', { className: 'dqw-stat' },
                h('span', { className: 'dqw-statLabel' }, t('quota.eta')),
                h('b', { className: 'dqw-statValue' }, formatDays(stats.days, t)),
              ),
            ),
            stats.today === null && data.available !== false
              ? h('p', { className: 'dqw-hint dqw-usageHint' }, t('quota.usageHint'))
              : null,

            h('div', { className: 'dqw-peakRow' },
              h(PeakChip, { t, peak: data.peak }),
              data.next !== null && data.next !== undefined && data.next.at !== null
                ? h('span', { className: 'dqw-hint' },
                  data.next.peak ? t('quota.nextPeak') : t('quota.nextOffPeak'),
                  ' ',
                  formatCountdown(data.next.at - Date.now(), t),
                )
                : null,
            ),

            h(PriceRow, { t, data }),

            weatherData !== null
              ? h('div', { className: 'dqw-pageWeather' },
                h(WeatherIcon, {
                  kind: weatherCurrent !== null ? weatherCurrent.kind : 'cloud',
                  isDay: weatherCurrent !== null ? weatherCurrent.isDay : true,
                  size: 18,
                }),
                h('span', { className: 'dqw-pageWeatherNow' },
                  weatherCurrent !== null
                    ? `${Math.round(weatherCurrent.temperature)}° ${weatherLabel(t, weatherCurrent.kind)}`
                    : '—'),
                h('span', { className: 'dqw-pageWeatherMeta' },
                  `${t('weather.place')} · ${t('weather.feels')} ${weatherCurrent !== null && weatherCurrent.apparent !== null ? `${Math.round(weatherCurrent.apparent)}°` : '—'}`),
                h('span', { className: 'dqw-pageWeatherRain' }, rainSummary(t, weatherData)),
              )
              : null,

            h('div', { className: 'dqw-links' },
              h('a', { className: 'dqw-btn', href: USAGE_URL, target: '_blank', rel: 'noreferrer noopener' },
                t('quota.usage'), h(IconExternal, { size: 11 })),
              h('a', { className: 'dqw-btn', href: TOP_UP_URL, target: '_blank', rel: 'noreferrer noopener' },
                t('quota.topUp'), h(IconExternal, { size: 11 })),
            ),
          ),
      );
    }

    // ---------------------------------------------------------------------
    // Wallpaper board (page)
    // ---------------------------------------------------------------------

    function WallpaperPreview({ t, value }) {
      const background = backgroundFor(value);
      return h('div', { className: 'dqw-preview' },
        background === null
          ? h('div', { className: 'dqw-previewEmpty' }, t('wall.previewEmpty'))
          : h(React.Fragment, null,
            h('div', {
              className: 'dqw-previewArt',
              style: {
                backgroundImage: background,
                backgroundSize: value.fit === 'contain' ? 'contain' : 'cover',
                opacity: value.opacity,
                filter: value.blur > 0 ? `blur(${value.blur}px)` : 'none',
              },
            }),
            h('div', { className: 'dqw-previewScrim', style: { '--dqw-scrim': String(value.scrim) } }),
            h('div', { className: 'dqw-previewContent' },
              h('span', { className: 'dqw-previewChip' }, t('wall.preview')),
              h('div', { className: 'dqw-previewTitle' }, t('wall.previewTitle')),
              h('div', { className: 'dqw-previewSub' }, t('wall.previewSub')),
            ),
          ),
      );
    }

    function PresetTile({ t, preset, active, onSelect }) {
      return h('button', {
        type: 'button',
        className: cx('dqw-preset', active && 'is-active'),
        onClick: () => onSelect(preset.id),
        title: t(preset.labelKey),
        'aria-pressed': active,
      },
        h('span', { className: 'dqw-presetSwatch', style: { backgroundImage: preset.css } }),
        h('span', { className: 'dqw-presetName' }, t(preset.labelKey)),
        active ? h('span', { className: 'dqw-presetCheck' }, h(IconCheck, { size: 11 })) : null,
      );
    }

    function WallpaperPanel({ t }) {
      const settings = useSettings();
      const value = settings.value;
      const fileInput = useRef(null);
      const [urlText, setUrlText] = useState(value.source === 'custom' && !value.image.startsWith('data:') ? value.image : '');
      const [notice, setNotice] = useState('');

      useEffect(() => {
        if (value.source === 'custom' && !value.image.startsWith('data:')) setUrlText(value.image);
      }, [value.source, value.image]);

      const selectPreset = (id) => {
        setNotice('');
        // The scholar paper is deliberately pale; a heavy veil would erase it.
        const nextScrim = id === 'fudan-scholar' && value.scrim > 0.3 ? 0.22 : value.scrim;
        commitSettings({ source: id, enabled: true, scrim: nextScrim });
      };

      const selectNone = () => {
        setNotice('');
        commitSettings({ source: 'none', enabled: false });
      };

      const applyUrl = () => {
        const url = urlText.trim();
        if (!/^(https?:\/\/|data:image\/)/i.test(url)) {
          setNotice(t('wall.invalidUrl'));
          return;
        }
        setNotice('');
        commitSettings({ source: 'custom', image: url, enabled: true });
      };

      const handleFile = async (file) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
          setNotice(t('wall.notImage'));
          return;
        }
        if (file.size > MAX_IMAGE_BYTES) {
          setNotice(t('wall.tooLarge'));
          return;
        }
        const dataUrl = await readFileAsDataUrl(file);
        if (dataUrl === null) {
          setNotice(t('wall.readFailed'));
          return;
        }
        setNotice('');
        commitSettings({ source: 'custom', image: dataUrl, enabled: true });
      };

      const storageWarning = settings.storageError !== null
        ? h('div', { className: 'dqw-warnBox' }, t('wall.storageFull'))
        : null;

      return h('section', { className: 'dqw-card' },
        h('div', { className: 'dqw-cardHead' },
          h('div', null,
            h('h2', { className: 'dqw-cardTitle' }, t('wall.title')),
            h('p', { className: 'dqw-cardSub' }, value.enabled ? t('common.enabled') : t('wall.disabledHint')),
          ),
          h(Switch, {
            checked: value.enabled,
            label: t('wall.enable'),
            onChange: (next) => {
              setNotice('');
              commitSettings({
                enabled: next,
                source: next && value.source === 'none' ? DEFAULT_SETTINGS.source : value.source,
              });
            },
          }),
        ),

        storageWarning,
        h(WallpaperPreview, { t, value }),

        h('div', { className: 'dqw-subHead' }, t('wall.source')),
        h('div', { className: 'dqw-presets' },
          h('button', {
            type: 'button',
            className: cx('dqw-preset', 'is-none', !value.enabled || value.source === 'none' ? 'is-active' : null),
            onClick: selectNone,
            'aria-pressed': !value.enabled || value.source === 'none',
            title: t('wall.none'),
          },
            h('span', { className: 'dqw-presetSwatch is-none' }),
            h('span', { className: 'dqw-presetName' }, t('wall.none')),
            (!value.enabled || value.source === 'none')
              ? h('span', { className: 'dqw-presetCheck' }, h(IconCheck, { size: 11 }))
              : null,
          ),
          PRESETS.map((preset) => h(PresetTile, {
            key: preset.id,
            t,
            preset,
            active: value.enabled && value.source === preset.id,
            onSelect: selectPreset,
          })),
        ),

        h('div', { className: 'dqw-subHead' }, t('wall.custom')),
        h('div', { className: 'dqw-custom' },
          h('div', { className: 'dqw-urlRow' },
            h('input', {
              type: 'text',
              className: 'dqw-input',
              value: urlText,
              placeholder: t('wall.urlPlaceholder'),
              'aria-label': t('wall.custom'),
              onChange: (event) => setUrlText(event.currentTarget.value),
              onKeyDown: (event) => {
                if (event.key === 'Enter') applyUrl();
              },
            }),
            h('button', {
              type: 'button',
              className: 'dqw-btn dqw-btnPrimary',
              onClick: applyUrl,
              disabled: urlText.trim() === '',
            }, t('wall.apply')),
          ),
          h('div', { className: 'dqw-customRow' },
            h('input', {
              type: 'file',
              ref: fileInput,
              accept: 'image/jpeg,image/png,image/webp,image/gif,image/avif',
              hidden: true,
              onChange: (event) => {
                const file = event.currentTarget.files && event.currentTarget.files[0];
                handleFile(file);
                event.currentTarget.value = '';
              },
            }),
            h('button', {
              type: 'button',
              className: 'dqw-btn',
              onClick: () => fileInput.current && fileInput.current.click(),
            }, t('wall.upload')),
            value.source === 'custom' && value.enabled && value.image !== ''
              ? h('span', { className: 'dqw-badge is-ok' }, t('wall.currentCustom'))
              : null,
          ),
          h('p', { className: 'dqw-hint' }, t('wall.customHint')),
          notice !== '' ? h('p', { className: 'dqw-errorText' }, notice) : null,
        ),

        h('div', { className: 'dqw-subHead' }, t('wall.fit')),
        h(Segmented, {
          label: t('wall.fit'),
          value: value.fit,
          options: [
            { value: 'cover', label: t('wall.cover') },
            { value: 'contain', label: t('wall.contain') },
          ],
          onChange: (fit) => commitSettings({ fit }),
        }),

        h('div', { className: 'dqw-subHead' }, t('wall.opacity')),
        h(Slider, {
          label: t('wall.opacity'),
          value: value.opacity,
          min: 0.05,
          max: 1,
          step: 0.01,
          disabled: !value.enabled || value.source === 'none',
          format: (number) => `${Math.round(number * 100)}%`,
          onChange: (opacity) => commitSettings({ opacity }),
        }),
        h(Slider, {
          label: t('wall.blur'),
          value: value.blur,
          min: 0,
          max: 40,
          step: 1,
          disabled: !value.enabled || value.source === 'none',
          format: (number) => `${number}px`,
          onChange: (blur) => commitSettings({ blur }),
        }),
        h(Slider, {
          label: t('wall.scrim'),
          value: value.scrim,
          min: 0,
          max: 0.85,
          step: 0.01,
          disabled: !value.enabled || value.source === 'none',
          format: (number) => `${Math.round(number * 100)}%`,
          onChange: (scrim) => commitSettings({ scrim }),
        }),
        h('p', { className: 'dqw-hint' }, t('wall.scrimHint')),

        h('div', { className: 'dqw-footer' },
          h('button', {
            type: 'button',
            className: 'dqw-btn',
            onClick: () => {
              setNotice('');
              setUrlText('');
              commitSettings({ ...DEFAULT_SETTINGS });
            },
          }, t('common.reset')),
        ),
      );
    }

    // ---------------------------------------------------------------------
    // Main panel
    // ---------------------------------------------------------------------

    function Page({ t }) {
      const quota = useQuota();
      return h('div', { className: 'dqw-page' },
        h('header', { className: 'dqw-hero' },
          h('div', { className: 'dqw-logo dqw-logoEmblem' }, h(Emblem, { size: 48 })),
          h('div', { className: 'dqw-heroText' },
            h('div', { className: 'dqw-kicker' }, t('page.kicker')),
            h('h1', { className: 'dqw-h1' }, t('page.title')),
            h('p', { className: 'dqw-lede' }, t('page.subtitle')),
          ),
        ),
        h('div', { className: 'dqw-columns' },
          h(QuotaPanel, { t, quota }),
          h(WallpaperPanel, { t }),
        ),
      );
    }

    // ---------------------------------------------------------------------
    // Status bar + popover
    // ---------------------------------------------------------------------

    function PillPopover({ t, quota, weather, alignLeft, maxHeight, onResetPosition, onClose, openPanel }) {
      useTick(true);
      const data = quota.data;
      const stats = useMemo(() => usageStats(data), [data, quota.at]);
      const peakText = data !== null && data.next !== null && data.next !== undefined && data.next.at !== null
        ? `${data.next.peak ? t('quota.nextPeak') : t('quota.nextOffPeak')} ${formatCountdown(data.next.at - Date.now(), t)}`
        : '';
      const weatherData = weather.data;
      const weatherCurrent = weatherData !== null ? weatherData.current : null;
      const weatherMeta = [];
      if (weatherCurrent !== null) {
        if (weatherCurrent.apparent !== null) weatherMeta.push(`${t('weather.feels')} ${Math.round(weatherCurrent.apparent)}°`);
        if (weatherCurrent.humidity !== null) weatherMeta.push(`${t('weather.humidity')} ${weatherCurrent.humidity}%`);
      }
      weatherMeta.push(t('weather.place'));
      return h('div', {
        className: cx('dqw-pop', alignLeft && 'is-left'),
        style: { maxHeight: `${maxHeight}px` },
        role: 'dialog',
        'aria-label': t('quota.title'),
      },
        h(CampusMark, null),
        h('div', { className: 'dqw-popHead' },
          h('span', { className: 'dqw-popSeal' }, h(Emblem, { size: 42 })),
          h('span', { className: 'dqw-popHeadText' },
            h('span', { className: 'dqw-popKicker' }, t('fudan.english')),
            h('span', { className: 'dqw-popTitle' }, t('fudan.title')),
            h('span', { className: 'dqw-popSub' }, t('fudan.subtitle')),
          ),
          h('button', {
            type: 'button',
            className: 'dqw-popIconBtn',
            onClick: onResetPosition,
            'aria-label': t('pill.resetPosition'),
            title: t('pill.resetPosition'),
          }, h(IconLocate, { size: 14 })),
          h('button', {
            type: 'button',
            className: cx('dqw-popIconBtn', quota.refreshing && 'is-busy'),
            onClick: () => {
              refreshQuota();
              refreshWeather();
            },
            'aria-label': t('common.refresh'),
            title: t('common.refresh'),
          }, quota.refreshing ? h('span', { className: 'dqw-spinner is-gold' }) : h(IconRefresh, { size: 14 })),
        ),

        quota.error !== null
          ? h('div', { className: 'dqw-popError', role: 'status' },
            h('div', { className: 'dqw-popErrorTitle' }, errorText(t, quota.error)),
            quota.error.code === 'noKey' ? h('div', { className: 'dqw-popErrorHint' }, t('quota.emptyHint')) : null,
          )
          : null,

        data === null
          ? (quota.error === null
            ? h('div', { className: 'dqw-popSkeleton' }, t('common.loading'))
            : null)
          : h(React.Fragment, null,
            h('div', { className: 'dqw-popBody' },
              h('div', { className: 'dqw-popBalanceBlock' },
                h('div', { className: 'dqw-popBalanceLabel' }, t('quota.balance')),
                h('div', { className: 'dqw-popBalanceRow' },
                  h('span', { className: 'dqw-popBalanceValue' }, formatMoney(data.total, data.currency)),
                  h('span', { className: 'dqw-popBadge ' + (data.available === false ? 'is-warn' : 'is-ok') },
                    data.available === false ? t('quota.unavailable') : t('quota.available')),
                ),
              ),
              h(WalletBar, { t, data, dark: true }),
              h('div', { className: 'dqw-popStats' },
                h('div', { className: 'dqw-popStat' },
                  h('span', { className: 'dqw-popStatLabel' }, t('quota.today')),
                  h('b', { className: 'dqw-popStatValue' }, stats.today === null ? '—' : formatMoney(stats.today, data.currency)),
                ),
                h('div', { className: 'dqw-popStat' },
                  h('span', { className: 'dqw-popStatLabel' }, t('quota.avg')),
                  h('b', { className: 'dqw-popStatValue' }, stats.average === null ? '—' : formatMoney(stats.average, data.currency)),
                ),
                h('div', { className: 'dqw-popStat' },
                  h('span', { className: 'dqw-popStatLabel' }, t('quota.eta')),
                  h('b', { className: 'dqw-popStatValue' }, formatDays(stats.days, t)),
                ),
              ),
              h('div', { className: 'dqw-popPeakRow' },
                h(PeakChip, { t, peak: data.peak, dark: true }),
                peakText === '' ? null : h('span', { className: 'dqw-popPeakHint' }, peakText),
              ),
            ),
            h('div', { className: 'dqw-popMotto' },
              h('span', null, t('fudan.motto1')),
              h('i'),
              h('span', null, t('fudan.motto2')),
            ),
          ),

        h('div', { className: cx('dqw-popWeather', weatherData === null && 'is-muted') },
          h(WeatherIcon, {
            kind: weatherCurrent !== null ? weatherCurrent.kind : 'cloud',
            isDay: weatherCurrent !== null ? weatherCurrent.isDay : true,
            size: 28,
          }),
          h('span', { className: 'dqw-popWeatherText' },
            h('span', { className: 'dqw-popWeatherNow' },
              weatherCurrent !== null
                ? `${Math.round(weatherCurrent.temperature)}° ${weatherLabel(t, weatherCurrent.kind)}`
                : t('weather.unavailable')),
            h('span', { className: 'dqw-popWeatherMeta' },
              weatherData !== null
                ? weatherMeta.join(' · ')
                : (weather.error !== null ? weatherErrorText(t, weather.error) : t('common.loading'))),
          ),
          weatherData !== null
            ? h('span', { className: 'dqw-popWeatherRain' }, rainDetail(t, weatherData))
            : null,
        ),

        h('div', { className: 'dqw-popActions' },
          h('button', {
            type: 'button',
            className: 'dqw-popBtn dqw-popBtnPrimary',
            onClick: () => {
              onClose();
              openPanel();
            },
          }, t('common.open')),
          h('a', { className: 'dqw-popBtn', href: TOP_UP_URL, target: '_blank', rel: 'noreferrer noopener' },
            t('quota.topUp'), h(IconExternal, { size: 11 })),
        ),
      );
    }

    function Pill({ t, openPanel }) {
      const quota = useQuota();
      const weather = useWeather();
      const [open, setOpen] = useState(false);
      const [position, setPosition] = useState(readStoredPosition);
      const [dragging, setDragging] = useState(false);
      const [openBelow, setOpenBelow] = useState(false);
      const [popoverLeft, setPopoverLeft] = useState(false);
      const [popoverMax, setPopoverMax] = useState(560);
      const rootRef = useRef(null);
      const statusRef = useRef(null);
      const positionRef = useRef(position);
      const dragRef = useRef(null);
      const suppressClickRef = useRef(false);

      useEffect(() => {
        if (!open) return undefined;
        const onPointerDown = (event) => {
          if (rootRef.current !== null && !rootRef.current.contains(event.target)) setOpen(false);
        };
        const onKeyDown = (event) => {
          if (event.key === 'Escape') setOpen(false);
        };
        document.addEventListener('pointerdown', onPointerDown, true);
        document.addEventListener('keydown', onKeyDown);
        return () => {
          document.removeEventListener('pointerdown', onPointerDown, true);
          document.removeEventListener('keydown', onKeyDown);
        };
      }, [open]);

      const clampPosition = (left, top) => {
        const element = statusRef.current;
        const width = element === null ? 360 : element.offsetWidth;
        const height = element === null ? 96 : element.offsetHeight;
        const margin = 8;
        const maxLeft = Math.max(margin, window.innerWidth - width - margin);
        const maxTop = Math.max(margin, window.innerHeight - height - margin);
        return {
          left: Math.min(Math.max(margin, left), maxLeft),
          top: Math.min(Math.max(margin, top), maxTop),
        };
      };

      const applyPosition = (next) => {
        positionRef.current = next;
        setPosition(next);
      };

      const resetPosition = () => {
        positionRef.current = null;
        setPosition(null);
        clearStoredPosition();
        setOpen(false);
      };

      const onPointerDown = (event) => {
        if (event.button !== undefined && event.button !== 0) return;
        const element = event.currentTarget;
        const rect = element.getBoundingClientRect();
        dragRef.current = {
          pointerId: event.pointerId,
          startX: event.clientX,
          startY: event.clientY,
          originLeft: rect.left,
          originTop: rect.top,
          moved: false,
        };
        suppressClickRef.current = false;
        try {
          element.setPointerCapture(event.pointerId);
        } catch {
          // Pointer capture is an enhancement; dragging still works without it.
        }
      };

      const onPointerMove = (event) => {
        const drag = dragRef.current;
        if (drag === null || drag.pointerId !== event.pointerId) return;
        const dx = event.clientX - drag.startX;
        const dy = event.clientY - drag.startY;
        if (!drag.moved && Math.abs(dx) + Math.abs(dy) < 6) return;
        if (!drag.moved) {
          drag.moved = true;
          setDragging(true);
          setOpen(false);
        }
        event.preventDefault();
        applyPosition(clampPosition(drag.originLeft + dx, drag.originTop + dy));
      };

      const finishDrag = (event) => {
        const drag = dragRef.current;
        if (drag === null || drag.pointerId !== event.pointerId) return;
        dragRef.current = null;
        setDragging(false);
        try {
          event.currentTarget.releasePointerCapture(event.pointerId);
        } catch {
          // Already released.
        }
        if (drag.moved) {
          suppressClickRef.current = true;
          if (positionRef.current !== null) saveStoredPosition(positionRef.current);
        }
      };

      const onToggle = () => {
        if (suppressClickRef.current) {
          suppressClickRef.current = false;
          return;
        }
        if (!open) {
          const element = statusRef.current;
          if (element !== null) {
            const rect = element.getBoundingClientRect();
            const spaceAbove = rect.top;
            const spaceBelow = window.innerHeight - rect.bottom;
            const below = spaceAbove < 500 && spaceBelow > spaceAbove;
            setOpenBelow(below);
            setPopoverMax(Math.max(220, Math.min(560, (below ? spaceBelow : spaceAbove) - 14)));
            const spaceLeft = rect.left;
            const spaceRight = window.innerWidth - rect.right;
            setPopoverLeft(spaceLeft < 420 && spaceRight > spaceLeft);
          }
        }
        setOpen((current) => !current);
      };

      useEffect(() => {
        const stored = positionRef.current;
        if (stored === null) return;
        const clamped = clampPosition(stored.left, stored.top);
        if (clamped.left !== stored.left || clamped.top !== stored.top) {
          applyPosition(clamped);
          saveStoredPosition(clamped);
        }
      }, []);

      useEffect(() => {
        const onResize = () => {
          const current = positionRef.current;
          if (current === null) return;
          const clamped = clampPosition(current.left, current.top);
          if (clamped.left !== current.left || clamped.top !== current.top) {
            applyPosition(clamped);
            saveStoredPosition(clamped);
          }
        };
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
      }, []);

      const data = quota.data;
      const stats = useMemo(() => usageStats(data), [data, quota.at]);
      const total = data !== null && Number.isFinite(data.total) ? data.total : null;
      const low = total !== null && total <= 5;
      const state = data === null
        ? (quota.error !== null ? 'error' : 'loading')
        : quota.error !== null
          ? 'error'
          : low
            ? 'low'
            : 'ok';
      const value = total !== null ? formatMoney(total, data.currency) : '—';
      const today = data !== null && stats.today !== null
        ? `${t('pill.today')} ${formatMoney(stats.today, data.currency)}`
        : `${t('pill.today')} —`;
      const peakLabel = data !== null
        ? (data.peak ? t('quota.peak') : t('quota.offPeak'))
        : quota.error !== null
          ? t('pill.offlineShort')
          : t('pill.loadingShort');

      const weatherData = weather.data;
      const weatherCurrent = weatherData !== null ? weatherData.current : null;
      const weatherTemp = weatherCurrent !== null ? `${Math.round(weatherCurrent.temperature)}°` : '—';
      const weatherCond = weatherCurrent !== null
        ? weatherLabel(t, weatherCurrent.kind)
        : weather.error !== null
          ? t('weather.unavailable')
          : t('common.loading');
      const weatherRain = weatherData !== null ? rainSummary(t, weatherData) : '';
      const rootStyle = position === null
        ? undefined
        : { left: `${position.left}px`, top: `${position.top}px`, right: 'auto', bottom: 'auto' };

      return h('div', {
        className: cx('dqw-pillRoot', openBelow && 'is-below', dragging && 'is-dragging'),
        ref: rootRef,
        style: rootStyle,
      },
        open ? h(PillPopover, {
          t,
          quota,
          weather,
          alignLeft: popoverLeft,
          maxHeight: popoverMax,
          onResetPosition: resetPosition,
          openPanel,
          onClose: () => setOpen(false),
        }) : null,
        h('button', {
          type: 'button',
          ref: statusRef,
          className: cx('dqw-status', open && 'is-open', quota.refreshing && 'is-busy', `is-${state}`),
          onClick: onToggle,
          onPointerDown,
          onPointerMove,
          onPointerUp: finishDrag,
          onPointerCancel: finishDrag,
          onLostPointerCapture: () => {
            if (dragRef.current === null) return;
            const moved = dragRef.current.moved;
            dragRef.current = null;
            setDragging(false);
            if (moved) {
              suppressClickRef.current = true;
              if (positionRef.current !== null) saveStoredPosition(positionRef.current);
            }
          },
          'aria-expanded': open,
          'aria-haspopup': 'dialog',
          'aria-label': `${t('pill.openLabel')} · ${t('pill.school')} ${value}`,
          title: t('pill.dragHint'),
        },
          h('span', { className: 'dqw-statusProgress' }),
          h('span', { className: 'dqw-statusMain' },
            h('span', { className: 'dqw-statusSeal' }, h(Emblem, { size: 56 })),
            h('span', { className: 'dqw-statusBody' },
              h('span', { className: 'dqw-statusTop' },
                h('span', { className: cx('dqw-statusDot', `is-${state}`) }),
                h('span', { className: 'dqw-statusSchool' }, t('pill.school')),
                h('span', { className: cx('dqw-statusPeak', data === null ? 'is-muted' : data.peak ? 'is-peak' : 'is-off') },
                  data !== null ? h('i') : null,
                  peakLabel,
                ),
              ),
              h('span', { className: 'dqw-statusBottom' },
                h('b', { className: 'dqw-statusBalance' }, value),
                h('span', { className: 'dqw-statusToday' }, today),
              ),
            ),
            h('span', { className: 'dqw-statusSpark' }, h(Sparkline, { data })),
          ),
          h('span', {
            className: 'dqw-statusWeather',
            title: weatherData !== null ? rainDetail(t, weatherData) : undefined,
          },
            h(WeatherIcon, {
              kind: weatherCurrent !== null ? weatherCurrent.kind : 'cloud',
              isDay: weatherCurrent !== null ? weatherCurrent.isDay : true,
              size: 22,
            }),
            h('span', { className: 'dqw-weatherTemp' }, weatherTemp),
            h('span', { className: 'dqw-weatherCond' }, weatherCond),
            h('span', { className: 'dqw-weatherRain' }, weatherRain),
            h('span', { className: 'dqw-weatherPlace' }, t('weather.place')),
          ),
        ),
      );
    }

    // ---------------------------------------------------------------------
    // Navigation icon
    // ---------------------------------------------------------------------

    function NavIcon({ size = 20, active }) {
      return h('span', {
        className: cx('dqw-navIcon', active && 'is-active'),
        style: { width: size, height: size },
      }, h(Emblem, { size }));
    }

    // ---------------------------------------------------------------------
    // Styles
    // ---------------------------------------------------------------------

    const CSS = `
      body[data-dqw-wallpaper] { background-color: transparent; --dsw-alias-bg-base: transparent !important; --dsw-specific-sidebar-fill: transparent !important; }
      .dqw-wall-layer { position: fixed; inset: 0; z-index: -2; pointer-events: none; background-repeat: no-repeat; background-position: center; background-size: cover; will-change: opacity; }
      .dqw-wall-scrim { position: fixed; inset: 0; z-index: -1; pointer-events: none; background: rgba(255,255,255,var(--dqw-scrim,.5)); }
      body[data-ds-dark-theme] .dqw-wall-scrim { background: rgba(0,0,0,var(--dqw-scrim,.5)); }
      body > .dqw-wall-layer, body > .dqw-wall-scrim { -webkit-app-region: initial !important; }

      .dqw-navIcon { display: flex; align-items: center; justify-content: center; border-radius: 50%; }
      .dqw-navIcon .dqw-emblem { box-shadow: 0 0 0 1px rgba(217,189,130,.52), 0 1px 3px rgba(0,0,0,.22); }
      .dqw-navIcon.is-active .dqw-emblem { box-shadow: 0 0 0 1.5px var(--dsw-alias-brand-primary), 0 2px 6px rgba(0,0,0,.24); }
      .dqw-navIcon svg { display: block; }

      .dqw-page { box-sizing: border-box; height: 100%; min-height: 100%; overflow-y: auto; padding: 28px 32px 80px; color: var(--dsw-alias-label-primary); font-family: inherit; background: transparent; }
      .dqw-page *, .dqw-pillRoot *, .dqw-pop * { box-sizing: border-box; }
      .dqw-hero { display: flex; align-items: flex-start; gap: 14px; max-width: 1120px; margin: 0 auto 20px; }
      .dqw-logo { width: 46px; height: 46px; flex: none; border-radius: 14px; overflow: hidden; box-shadow: 0 8px 24px rgba(79,124,247,.28); }
      .dqw-logo svg { display: block; }
      .dqw-heroText { min-width: 0; }
      .dqw-h1 { margin: 0 0 6px; font-size: 24px; line-height: 1.25; font-weight: 600; letter-spacing: -.01em; }
      .dqw-lede { margin: 0; max-width: 760px; font-size: 13px; line-height: 1.65; color: var(--dsw-alias-label-secondary); }

      .dqw-columns { display: grid; grid-template-columns: minmax(0,.92fr) minmax(0,1.08fr); align-items: start; gap: 16px; max-width: 1120px; margin: 0 auto; }
      .dqw-columns > * { min-width: 0; }
      @media (max-width: 980px) { .dqw-columns { grid-template-columns: minmax(0,1fr); } }

      .dqw-card { border: 1px solid var(--dsw-alias-border-l1); border-radius: 16px; background: var(--dsw-alias-bg-layer-1); box-shadow: 0 1px 2px rgba(15,23,42,.04), 0 14px 36px rgba(15,23,42,.07); padding: 18px; }
      .dqw-cardHead { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 14px; }
      .dqw-cardTitle { margin: 0; font-size: 15px; line-height: 1.3; font-weight: 600; }
      .dqw-cardSub { margin: 4px 0 0; font-size: 11.5px; line-height: 1.5; color: var(--dsw-alias-label-secondary); }

      .dqw-balance { margin-top: 2px; }
      .dqw-balanceLabel { font-size: 12px; color: var(--dsw-alias-label-secondary); }
      .dqw-balanceRow { display: flex; align-items: baseline; flex-wrap: wrap; gap: 10px; margin-top: 2px; }
      .dqw-balanceValue { font-size: 30px; line-height: 1.15; font-weight: 650; letter-spacing: -.02em; font-variant-numeric: tabular-nums; }
      .dqw-badge { display: inline-flex; align-items: center; height: 20px; padding: 0 8px; border-radius: 999px; font-size: 11px; font-weight: 500; white-space: nowrap; }
      .dqw-badge.is-ok { background: color-mix(in srgb, var(--dsw-alias-state-success-primary) 14%, transparent); color: var(--dsw-alias-state-success-primary); }
      .dqw-badge.is-warn { background: color-mix(in srgb, var(--dsw-alias-state-warn-primary) 16%, transparent); color: var(--dsw-alias-state-warn-primary); }

      .dqw-wallet { margin-top: 16px; }
      .dqw-walletBar { display: flex; height: 8px; border-radius: 999px; overflow: hidden; background: color-mix(in srgb, var(--dsw-alias-label-secondary) 14%, transparent); }
      .dqw-walletTopped { display: block; height: 100%; background: var(--dsw-alias-brand-primary); }
      .dqw-walletGranted { display: block; height: 100%; background: var(--dsw-alias-state-success-primary); }
      .dqw-walletLegend { display: flex; flex-wrap: wrap; gap: 6px 16px; margin-top: 8px; }
      .dqw-legendItem { display: inline-flex; align-items: center; gap: 6px; font-size: 11.5px; color: var(--dsw-alias-label-secondary); }
      .dqw-legendItem b { font-weight: 500; color: var(--dsw-alias-label-primary); font-variant-numeric: tabular-nums; }
      .dqw-legendDot { width: 7px; height: 7px; border-radius: 50%; }
      .dqw-legendDot.is-topped { background: var(--dsw-alias-brand-primary); }
      .dqw-legendDot.is-granted { background: var(--dsw-alias-state-success-primary); }

      .dqw-stats { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 8px; margin-top: 16px; }
      .dqw-stat { border: 1px solid var(--dsw-alias-border-l1); border-radius: 10px; padding: 8px 10px; min-width: 0; }
      .dqw-statLabel { display: block; font-size: 11px; line-height: 1.4; color: var(--dsw-alias-label-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .dqw-statValue { display: block; margin-top: 2px; font-size: 14px; line-height: 1.3; font-weight: 600; font-variant-numeric: tabular-nums; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

      .dqw-chip { display: inline-flex; align-items: center; gap: 5px; height: 22px; padding: 0 8px; border-radius: 999px; font-size: 11.5px; font-weight: 500; white-space: nowrap; }
      .dqw-chip.is-peak { background: color-mix(in srgb, var(--dsw-alias-state-warn-primary) 15%, transparent); color: var(--dsw-alias-state-warn-primary); }
      .dqw-chip.is-off { background: color-mix(in srgb, var(--dsw-alias-state-success-primary) 14%, transparent); color: var(--dsw-alias-state-success-primary); }
      .dqw-chipDot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
      .dqw-peakRow { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
      .dqw-usageHint { margin-top: 8px; }

      .dqw-price { margin-top: 14px; border-top: 1px solid var(--dsw-alias-border-l1); padding-top: 12px; }
      .dqw-priceHead { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; }
      .dqw-priceModel { font-size: 12px; font-weight: 600; }
      .dqw-priceGrid { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 8px; margin-top: 8px; }
      .dqw-priceGrid span { display: flex; flex-direction: column; gap: 2px; font-size: 11px; color: var(--dsw-alias-label-secondary); }
      .dqw-priceGrid b { font-size: 12.5px; font-weight: 600; color: var(--dsw-alias-label-primary); font-variant-numeric: tabular-nums; }
      .dqw-pageWeather { display: flex; align-items: center; gap: 7px; margin-top: 13px; padding-top: 11px; border-top: 1px solid var(--dsw-alias-border-l1); }
      .dqw-pageWeather .dqw-weatherIcon { color: var(--dsw-alias-label-secondary); }
      .dqw-pageWeatherNow { font-size: 12.5px; line-height: 1.2; font-weight: 600; white-space: nowrap; }
      .dqw-pageWeatherMeta { font-size: 11px; line-height: 1.4; color: var(--dsw-alias-label-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .dqw-pageWeatherRain { margin-left: auto; font-size: 11px; line-height: 1.4; color: var(--dsw-alias-label-secondary); white-space: nowrap; }
      .dqw-links { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
      .dqw-footer { display: flex; justify-content: flex-end; margin-top: 16px; }

      .dqw-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 30px; padding: 0 12px; border: 1px solid var(--dsw-alias-border-l2); border-radius: 999px; background: transparent; color: var(--dsw-alias-label-primary); font: inherit; font-size: 12px; line-height: 1; text-decoration: none; cursor: pointer; white-space: nowrap; transition: background-color .15s ease, border-color .15s ease; }
      .dqw-btn:hover { background: color-mix(in srgb, var(--dsw-alias-label-primary) 6%, transparent); }
      .dqw-btn:disabled { opacity: .45; cursor: default; }
      .dqw-btn:disabled:hover { background: transparent; }
      .dqw-btnPrimary { background: var(--dsw-alias-brand-primary); border-color: transparent; color: #fff; }
      .dqw-btnPrimary:hover { background: color-mix(in srgb, var(--dsw-alias-brand-primary) 86%, #000); }
      .dqw-btn:focus-visible, .dqw-iconBtn:focus-visible, .dqw-preset:focus-visible, .dqw-segBtn:focus-visible, .dqw-switch:focus-visible, .dqw-status:focus-visible, .dqw-input:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: 2px; }

      .dqw-iconBtn { display: inline-flex; align-items: center; justify-content: center; width: 26px; height: 26px; flex: none; padding: 0; border: 1px solid var(--dsw-alias-border-l1); border-radius: 50%; background: transparent; color: var(--dsw-alias-label-secondary); cursor: pointer; }
      .dqw-iconBtn:hover { color: var(--dsw-alias-label-primary); background: color-mix(in srgb, var(--dsw-alias-label-primary) 6%, transparent); }
      .dqw-iconBtn:disabled { cursor: default; opacity: .6; }
      .dqw-spinner { width: 11px; height: 11px; border: 1.6px solid color-mix(in srgb, var(--dsw-alias-label-secondary) 35%, transparent); border-top-color: var(--dsw-alias-label-primary); border-radius: 50%; animation: dqw-spin .8s linear infinite; }
      @keyframes dqw-spin { to { transform: rotate(360deg); } }

      .dqw-switch { position: relative; width: 40px; height: 23px; flex: none; padding: 0; border: none; border-radius: 999px; background: color-mix(in srgb, var(--dsw-alias-label-secondary) 28%, transparent); cursor: pointer; transition: background-color .16s ease; }
      .dqw-switch[aria-checked="true"] { background: var(--dsw-alias-brand-primary); }
      .dqw-switchKnob { position: absolute; top: 3px; left: 3px; width: 17px; height: 17px; border-radius: 50%; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,.28); transition: transform .16s ease; }
      .dqw-switch[aria-checked="true"] .dqw-switchKnob { transform: translateX(17px); }

      .dqw-preview { position: relative; height: 172px; margin-top: 4px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 12px; overflow: hidden; background: var(--dsw-alias-bg-layer-2); }
      .dqw-previewArt { position: absolute; inset: 0; background-position: center; background-repeat: no-repeat; }
      .dqw-previewScrim { position: absolute; inset: 0; background: rgba(255,255,255,var(--dqw-scrim,.5)); }
      body[data-ds-dark-theme] .dqw-previewScrim { background: rgba(0,0,0,var(--dqw-scrim,.5)); }
      .dqw-previewEmpty { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; padding: 16px; text-align: center; font-size: 12px; color: var(--dsw-alias-label-secondary); }
      .dqw-previewContent { position: absolute; left: 14px; right: 14px; bottom: 12px; color: var(--dsw-alias-label-primary); }
      .dqw-previewChip { display: inline-block; margin-bottom: 6px; padding: 1px 7px; border-radius: 999px; background: color-mix(in srgb, var(--dsw-alias-bg-layer-1) 78%, transparent); font-size: 10px; letter-spacing: .02em; color: var(--dsw-alias-label-secondary); }
      .dqw-previewTitle { font-size: 14px; font-weight: 600; }
      .dqw-previewSub { margin-top: 2px; font-size: 11px; line-height: 1.5; color: var(--dsw-alias-label-secondary); }

      .dqw-subHead { margin: 18px 0 8px; font-size: 12px; font-weight: 600; color: var(--dsw-alias-label-primary); }
      .dqw-presets { display: grid; grid-template-columns: repeat(auto-fill, minmax(104px, 1fr)); gap: 8px; }
      .dqw-preset { position: relative; display: flex; flex-direction: column; gap: 6px; padding: 5px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 10px; background: transparent; color: inherit; font: inherit; text-align: left; cursor: pointer; transition: border-color .15s ease, transform .15s ease; }
      .dqw-preset:hover { border-color: var(--dsw-alias-border-l2); transform: translateY(-1px); }
      .dqw-preset.is-active { border-color: var(--dsw-alias-brand-primary); box-shadow: 0 0 0 1px var(--dsw-alias-brand-primary) inset; }
      .dqw-presetSwatch { display: block; height: 48px; border-radius: 7px; background-size: cover; background-position: center; }
      .dqw-presetSwatch.is-none { background-color: color-mix(in srgb, var(--dsw-alias-label-secondary) 8%, transparent); background-image: linear-gradient(135deg, transparent 45%, color-mix(in srgb, var(--dsw-alias-label-secondary) 28%, transparent) 45%, color-mix(in srgb, var(--dsw-alias-label-secondary) 28%, transparent) 55%, transparent 55%); }
      .dqw-presetName { display: block; padding: 0 2px 1px; font-size: 11.5px; line-height: 1.4; color: var(--dsw-alias-label-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .dqw-preset.is-active .dqw-presetName { color: var(--dsw-alias-label-primary); }
      .dqw-presetCheck { position: absolute; top: 9px; right: 9px; display: flex; align-items: center; justify-content: center; width: 18px; height: 18px; border-radius: 50%; background: var(--dsw-alias-brand-primary); color: #fff; box-shadow: 0 1px 4px rgba(0,0,0,.25); }

      .dqw-custom { display: flex; flex-direction: column; gap: 8px; }
      .dqw-urlRow { display: flex; gap: 8px; }
      .dqw-input { flex: 1; min-width: 0; height: 32px; padding: 0 10px; border: 1px solid var(--dsw-alias-border-l2); border-radius: 9px; background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-primary); font: inherit; font-size: 12.5px; }
      .dqw-input::placeholder { color: color-mix(in srgb, var(--dsw-alias-label-secondary) 72%, transparent); }
      .dqw-customRow { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; }

      .dqw-sliderRow { display: flex; align-items: center; gap: 10px; margin-top: 8px; }
      .dqw-sliderRow.is-disabled { opacity: .5; }
      .dqw-sliderLabel { flex: 0 0 108px; font-size: 12px; line-height: 1.5; color: var(--dsw-alias-label-primary); }
      .dqw-slider { -webkit-appearance: none; appearance: none; flex: 1; min-width: 0; height: 18px; margin: 0; background: transparent; cursor: pointer; }
      .dqw-slider::-webkit-slider-runnable-track { height: 4px; border-radius: 2px; background: linear-gradient(90deg, var(--dsw-alias-brand-primary) var(--dqw-fill,0%), color-mix(in srgb, var(--dsw-alias-label-secondary) 22%, transparent) var(--dqw-fill,0%)); }
      .dqw-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 14px; height: 14px; margin-top: -5px; border: 2px solid var(--dsw-alias-brand-primary); border-radius: 50%; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,.24); }
      .dqw-slider::-moz-range-track { height: 4px; border-radius: 2px; background: color-mix(in srgb, var(--dsw-alias-label-secondary) 22%, transparent); }
      .dqw-slider::-moz-range-progress { height: 4px; border-radius: 2px; background: var(--dsw-alias-brand-primary); }
      .dqw-slider::-moz-range-thumb { width: 12px; height: 12px; border: 2px solid var(--dsw-alias-brand-primary); border-radius: 50%; background: #fff; }
      .dqw-sliderValue { flex: 0 0 46px; text-align: right; font-size: 12px; color: var(--dsw-alias-label-secondary); font-variant-numeric: tabular-nums; }

      .dqw-seg { display: inline-flex; flex: 0 0 auto; gap: 2px; padding: 2px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 9px; background: var(--dsw-alias-bg-layer-2); }
      .dqw-segBtn { height: 24px; padding: 0 14px; border: none; border-radius: 7px; background: transparent; color: var(--dsw-alias-label-secondary); font: inherit; font-size: 11.5px; cursor: pointer; }
      .dqw-segBtn:hover { color: var(--dsw-alias-label-primary); }
      .dqw-segBtn.is-active { background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-primary); font-weight: 600; box-shadow: 0 1px 2px rgba(15,23,42,.12); }

      .dqw-hint { margin: 0; font-size: 11.5px; line-height: 1.6; color: var(--dsw-alias-label-secondary); }
      .dqw-errorText { margin: 0; font-size: 11.5px; line-height: 1.5; color: var(--dsw-alias-state-error-primary); }
      .dqw-errorBox, .dqw-warnBox { margin: 0 0 12px; padding: 9px 11px; border-radius: 9px; font-size: 12px; line-height: 1.5; }
      .dqw-errorBox { border: 1px solid color-mix(in srgb, var(--dsw-alias-state-error-primary) 30%, transparent); background: color-mix(in srgb, var(--dsw-alias-state-error-primary) 9%, transparent); }
      .dqw-errorTitle { font-weight: 600; color: var(--dsw-alias-state-error-primary); }
      .dqw-warnBox { border: 1px solid color-mix(in srgb, var(--dsw-alias-state-warn-primary) 34%, transparent); background: color-mix(in srgb, var(--dsw-alias-state-warn-primary) 10%, transparent); color: var(--dsw-alias-state-warn-primary); }
      .dqw-skeleton { display: flex; align-items: center; justify-content: center; min-height: 96px; border-radius: 10px; background: color-mix(in srgb, var(--dsw-alias-label-secondary) 5%, transparent); font-size: 12px; color: var(--dsw-alias-label-secondary); }

      /* ---- Fudan status bar ---- */
      .dqw-pillRoot { position: fixed; right: 18px; bottom: 118px; z-index: 30; pointer-events: auto; font-family: inherit; }
      .dqw-pillRoot.is-dragging { z-index: 31; }
      .dqw-status { position: relative; display: flex; flex-direction: column; align-items: stretch; gap: 10px; width: 480px; max-width: calc(100vw - 32px); min-height: 136px; padding: 14px 16px 12px; border: 1px solid rgba(204,176,116,.36); border-radius: 20px; background: radial-gradient(130% 160% at 98% -20%, rgba(217,189,130,.22), transparent 55%), linear-gradient(135deg, #0c2f5e 0%, #0a2548 52%, #071a33 100%); color: #f4eedf; font: inherit; -webkit-appearance: none; appearance: none; box-shadow: 0 18px 42px rgba(4,16,34,.34), 0 2px 6px rgba(4,16,34,.2), inset 0 1px 0 rgba(255,255,255,.09); cursor: grab; user-select: none; -webkit-user-select: none; touch-action: none; text-align: left; overflow: hidden; isolation: isolate; transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease; }
      .dqw-pillRoot.is-dragging .dqw-status { cursor: grabbing; transform: none; transition: none; }
      .dqw-statusMain { display: flex; align-items: center; gap: 14px; width: 100%; min-width: 0; position: relative; z-index: 1; }
      .dqw-status::before { content: ''; position: absolute; top: 0; left: 16px; right: 16px; height: 1px; background: linear-gradient(90deg, transparent, rgba(236,216,169,.75), transparent); z-index: 2; }
      .dqw-status::after { content: ''; position: absolute; right: -18px; top: -32px; width: 130px; height: 130px; border-radius: 50%; border: 1px solid rgba(217,189,130,.12); pointer-events: none; z-index: 0; }
      .dqw-status:hover { transform: translateY(-2px); border-color: rgba(222,196,142,.66); box-shadow: 0 24px 54px rgba(4,16,34,.4), 0 0 0 1px rgba(217,189,130,.12), inset 0 1px 0 rgba(255,255,255,.12); }
      .dqw-status.is-open { border-color: rgba(236,216,169,.8); box-shadow: 0 0 0 1px rgba(217,189,130,.28), 0 24px 54px rgba(4,16,34,.42); }
      .dqw-status.is-error { border-color: rgba(217,139,139,.36); }
      .dqw-status.is-low { border-color: rgba(226,184,109,.42); }
      .dqw-status.is-error::before { background: linear-gradient(90deg, transparent, rgba(217,139,139,.55), transparent); }
      .dqw-status:focus-visible { outline: 2px solid #d9bd82; outline-offset: 3px; }
      .dqw-statusProgress { position: absolute; left: 16px; right: 16px; bottom: 0; height: 2px; opacity: 0; background: linear-gradient(90deg, transparent, #d9bd82, transparent); transform: translateX(-100%); }
      .dqw-status.is-busy .dqw-statusProgress { opacity: 1; animation: dqw-status-scan 1.3s linear infinite; }
      @keyframes dqw-status-scan { to { transform: translateX(100%); } }
      .dqw-statusSeal { position: relative; z-index: 1; flex: none; width: 56px; height: 56px; display: flex; align-items: center; justify-content: center; filter: drop-shadow(0 4px 10px rgba(0,0,0,.28)); transition: transform .2s ease, filter .2s ease; }
      .dqw-status:hover .dqw-statusSeal { transform: scale(1.03); filter: drop-shadow(0 4px 14px rgba(217,189,130,.3)); }
      .dqw-emblem { display: flex; align-items: center; justify-content: center; flex: none; border-radius: 50%; background: #fff; overflow: hidden; box-shadow: 0 0 0 1px rgba(217,189,130,.62), 0 0 0 3px rgba(9,34,66,.5), 0 5px 14px rgba(0,0,0,.3); }
      .dqw-emblem img { display: block; width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
      .dqw-sealSvg { display: block; }
      .dqw-statusBody { position: relative; z-index: 1; flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 6px; }
      .dqw-statusTop { display: flex; align-items: center; gap: 7px; min-width: 0; }
      .dqw-statusDot { width: 6px; height: 6px; border-radius: 50%; flex: none; background: #8d9bb0; }
      .dqw-statusDot.is-ok { background: #9ec9bd; box-shadow: 0 0 0 3px rgba(158,201,189,.14); }
      .dqw-statusDot.is-low { background: #e2b86d; box-shadow: 0 0 0 3px rgba(226,184,109,.16); }
      .dqw-statusDot.is-error { background: #d98b8b; box-shadow: 0 0 0 3px rgba(217,139,139,.15); }
      .dqw-statusSchool { font-size: 13px; line-height: 1; letter-spacing: .12em; color: rgba(244,238,223,.7); white-space: nowrap; }
      .dqw-statusPeak { margin-left: auto; display: inline-flex; align-items: center; gap: 5px; height: 22px; padding: 0 9px; border-radius: 999px; font-size: 12px; line-height: 1; letter-spacing: .04em; white-space: nowrap; border: 1px solid transparent; }
      .dqw-statusPeak i { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }
      .dqw-statusPeak.is-off i { background: transparent; box-shadow: inset -2px 0 0 currentColor; }
      .dqw-statusPeak.is-peak { color: #e8c98c; background: rgba(226,184,109,.12); border-color: rgba(226,184,109,.24); }
      .dqw-statusPeak.is-off { color: #a8d3c5; background: rgba(158,201,189,.1); border-color: rgba(158,201,189,.22); }
      .dqw-statusPeak.is-muted { color: rgba(244,238,223,.42); background: rgba(244,238,223,.05); border-color: rgba(244,238,223,.1); }
      .dqw-statusBottom { display: flex; align-items: baseline; gap: 10px; min-width: 0; }
      .dqw-statusBalance { font-size: 32px; line-height: 1.05; font-weight: 650; letter-spacing: -.015em; font-variant-numeric: tabular-nums; white-space: nowrap; color: #fbf7ec; }
      .dqw-statusToday { margin-left: auto; font-size: 14px; line-height: 1.2; color: rgba(244,238,223,.58); white-space: nowrap; font-variant-numeric: tabular-nums; }
      .dqw-statusSpark { position: relative; z-index: 1; flex: none; width: 88px; height: 40px; opacity: .92; }
      .dqw-spark { display: block; width: 88px; height: 40px; overflow: visible; }

      .dqw-statusWeather { position: relative; z-index: 1; display: flex; align-items: center; gap: 8px; width: 100%; min-width: 0; padding-top: 10px; border-top: 1px solid rgba(217,189,130,.16); color: rgba(244,238,223,.78); }
      .dqw-weatherIcon { flex: none; display: block; }
      .dqw-weatherIcon.is-clear { color: #e2b86d; }
      .dqw-weatherIcon.is-partly { color: #d6c39a; }
      .dqw-weatherIcon.is-cloud { color: #b9c6d8; }
      .dqw-weatherIcon.is-fog { color: #b9c6d8; }
      .dqw-weatherIcon.is-rain { color: #9cc6df; }
      .dqw-weatherIcon.is-storm { color: #c7b3e0; }
      .dqw-weatherIcon.is-snow { color: #cfe6f5; }
      .dqw-weatherTemp { flex: none; font-size: 18px; line-height: 1; font-weight: 650; color: #f8f2e4; font-variant-numeric: tabular-nums; }
      .dqw-weatherCond { flex: none; font-size: 13px; line-height: 1; color: rgba(244,238,223,.66); white-space: nowrap; }
      .dqw-weatherRain { min-width: 0; margin-left: 3px; font-size: 13px; line-height: 1.2; color: #e0c68e; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .dqw-weatherPlace { margin-left: auto; flex: none; font-size: 11px; line-height: 1; letter-spacing: .05em; color: rgba(244,238,223,.38); white-space: nowrap; }

      .dqw-chip.is-dark.is-peak { background: rgba(226,184,109,.14); border: 1px solid rgba(226,184,109,.28); color: #e8c98c; }
      .dqw-chip.is-dark.is-off { background: rgba(158,201,189,.12); border: 1px solid rgba(158,201,189,.26); color: #a8d3c5; }
      .dqw-chip.is-dark.is-off .dqw-chipDot { background: transparent; box-shadow: inset -2px 0 0 currentColor; }
      .dqw-wallet.is-dark { margin-top: 12px; }
      .dqw-wallet.is-dark .dqw-walletBar { background: rgba(244,238,223,.12); }
      .dqw-wallet.is-dark .dqw-walletTopped { background: linear-gradient(90deg, #e2c58e, #c8a96a); }
      .dqw-wallet.is-dark .dqw-walletGranted { background: #8fc4b6; }
      .dqw-wallet.is-dark .dqw-legendItem { color: rgba(244,238,223,.55); }
      .dqw-wallet.is-dark .dqw-legendItem b { color: #f4efe2; }
      .dqw-wallet.is-dark .dqw-legendDot.is-topped { background: #d9bd82; }
      .dqw-wallet.is-dark .dqw-legendDot.is-granted { background: #8fc4b6; }

      .dqw-pop { position: absolute; right: 0; bottom: calc(100% + 10px); z-index: 2; width: 420px; max-width: calc(100vw - 32px); max-height: calc(100vh - 210px); overflow-y: auto; overflow-x: hidden; border: 1px solid rgba(204,176,116,.44); border-radius: 20px; background: radial-gradient(120% 110% at 100% 0%, rgba(217,189,130,.16), transparent 55%), linear-gradient(160deg, #0b2c57 0%, #08213f 58%, #06172d 100%); color: #f4eedf; box-shadow: 0 28px 70px rgba(3,12,26,.5), 0 2px 8px rgba(3,12,26,.3), inset 0 1px 0 rgba(255,255,255,.08); animation: dqw-pop-in .16s ease-out; }
      .dqw-pop.is-left { left: 0; right: auto; }
      .dqw-pillRoot.is-below .dqw-pop { top: calc(100% + 10px); bottom: auto; }
      .dqw-pop::before { content: ''; position: absolute; top: 0; left: 18px; right: 18px; height: 1px; background: linear-gradient(90deg, transparent, rgba(236,216,169,.75), transparent); z-index: 2; }
      @keyframes dqw-pop-in { from { opacity: 0; transform: translateY(5px) scale(.985); } to { opacity: 1; transform: translateY(0) scale(1); } }
      .dqw-popCampus { position: absolute; right: -16px; bottom: -12px; width: 214px; height: 116px; color: #d9bd82; opacity: .09; pointer-events: none; z-index: 0; }
      .dqw-popHead, .dqw-popBody, .dqw-popActions, .dqw-popMotto, .dqw-popError, .dqw-popSkeleton, .dqw-popWeather { position: relative; z-index: 1; }
      .dqw-popHead { display: flex; align-items: center; gap: 10px; padding: 18px 18px 13px; }
      .dqw-popSeal { flex: none; width: 42px; height: 42px; display: flex; align-items: center; justify-content: center; filter: drop-shadow(0 4px 10px rgba(0,0,0,.28)); }
      .dqw-popHeadText { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
      .dqw-popKicker { font-size: 9px; line-height: 1.2; letter-spacing: .2em; color: rgba(244,238,223,.42); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .dqw-popTitle { font-family: "Songti SC", "STSong", "Noto Serif SC", Georgia, serif; font-size: 19px; line-height: 1.25; font-weight: 600; letter-spacing: .08em; color: #f8f2e4; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .dqw-popSub { font-size: 10.5px; line-height: 1.35; letter-spacing: .1em; color: rgba(217,189,130,.85); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .dqw-popIconBtn { flex: none; display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; padding: 0; border: 1px solid rgba(217,189,130,.28); border-radius: 50%; background: rgba(244,238,223,.04); color: rgba(244,238,223,.7); cursor: pointer; transition: background-color .15s ease, color .15s ease; }
      .dqw-popIconBtn:hover { background: rgba(217,189,130,.14); color: #f8f2e4; }
      .dqw-popIconBtn:focus-visible { outline: 2px solid #d9bd82; outline-offset: 2px; }
      .dqw-spinner.is-gold { border-color: rgba(217,189,130,.25); border-top-color: #d9bd82; }
      .dqw-popError { margin: 0 16px 12px; padding: 9px 11px; border: 1px solid rgba(217,139,139,.32); border-radius: 10px; background: rgba(160,60,60,.18); }
      .dqw-popErrorTitle { font-size: 13px; line-height: 1.45; font-weight: 600; color: #f0cccc; }
      .dqw-popErrorHint { margin-top: 4px; font-size: 11px; line-height: 1.55; color: rgba(240,204,204,.65); }
      .dqw-popSkeleton { display: flex; align-items: center; justify-content: center; height: 86px; margin: 0 18px 14px; border-radius: 12px; background: rgba(244,238,223,.05); color: rgba(244,238,223,.45); font-size: 13px; }
      .dqw-popBody { padding: 0 18px; }
      .dqw-popBalanceBlock { margin-top: 2px; }
      .dqw-popBalanceLabel { font-size: 12px; line-height: 1.3; letter-spacing: .12em; color: rgba(244,238,223,.5); }
      .dqw-popBalanceRow { display: flex; align-items: baseline; flex-wrap: wrap; gap: 10px; margin-top: 4px; }
      .dqw-popBalanceValue { font-size: 37px; line-height: 1.1; font-weight: 650; letter-spacing: -.02em; font-variant-numeric: tabular-nums; color: #fbf7ec; text-shadow: 0 1px 0 rgba(0,0,0,.18); }
      .dqw-popBadge { display: inline-flex; align-items: center; height: 22px; padding: 0 9px; border-radius: 999px; font-size: 11px; font-weight: 500; white-space: nowrap; }
      .dqw-popBadge.is-ok { background: rgba(158,201,189,.14); color: #a8d3c5; }
      .dqw-popBadge.is-warn { background: rgba(226,184,109,.14); color: #e8c98c; }
      .dqw-popStats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); margin-top: 13px; border-top: 1px solid rgba(217,189,130,.14); border-bottom: 1px solid rgba(217,189,130,.14); }
      .dqw-popStat { min-width: 0; padding: 9px 8px 9px 0; }
      .dqw-popStat + .dqw-popStat { padding-left: 10px; border-left: 1px solid rgba(217,189,130,.12); }
      .dqw-popStatLabel { display: block; font-size: 10px; line-height: 1.3; letter-spacing: .08em; color: rgba(244,238,223,.44); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .dqw-popStatValue { display: block; margin-top: 2px; font-size: 16px; line-height: 1.25; font-weight: 600; font-variant-numeric: tabular-nums; color: #f4efe2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .dqw-popPeakRow { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
      .dqw-popPeakHint { font-size: 10.5px; line-height: 1.4; color: rgba(244,238,223,.55); }
      .dqw-popMotto { display: flex; align-items: center; gap: 10px; margin: 14px 18px 0; padding: 10px 12px; border: 1px solid rgba(217,189,130,.2); border-radius: 10px; background: rgba(217,189,130,.065); color: #ecd9ae; font-family: "Songti SC", "STSong", "Noto Serif SC", Georgia, serif; font-size: 15px; font-weight: 500; line-height: 1.5; letter-spacing: .07em; white-space: nowrap; }
      .dqw-popMotto i { flex: 1; height: 1px; background: linear-gradient(90deg, transparent, rgba(217,189,130,.5), transparent); }
      .dqw-popWeather { display: flex; align-items: center; gap: 9px; margin: 13px 18px 0; padding-top: 12px; border-top: 1px solid rgba(217,189,130,.16); }
      .dqw-popWeather.is-muted { opacity: .72; }
      .dqw-popWeather .dqw-weatherIcon { color: #d9bd82; }
      .dqw-popWeatherText { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
      .dqw-popWeatherNow { font-size: 16px; line-height: 1.25; font-weight: 600; color: #f8f2e4; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .dqw-popWeatherMeta { font-size: 10.5px; line-height: 1.4; color: rgba(244,238,223,.48); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .dqw-popWeatherRain { flex: none; max-width: 136px; text-align: right; font-size: 10.5px; line-height: 1.35; color: #d9bd82; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .dqw-popActions { display: flex; align-items: center; gap: 8px; padding: 13px 18px 17px; }
      .dqw-popBtn { flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 38px; padding: 0 12px; border: 1px solid rgba(244,238,223,.16); border-radius: 10px; background: rgba(244,238,223,.04); color: #f4eedf; font: inherit; font-size: 13px; line-height: 1; text-decoration: none; white-space: nowrap; cursor: pointer; transition: background-color .15s ease, border-color .15s ease; }
      .dqw-popBtn:hover { background: rgba(244,238,223,.09); border-color: rgba(244,238,223,.26); }
      .dqw-popBtnPrimary { background: linear-gradient(135deg, #e6cd98, #c8a96a); border-color: transparent; color: #081e39; font-weight: 600; box-shadow: 0 4px 14px rgba(200,169,106,.22); }
      .dqw-popBtnPrimary:hover { background: linear-gradient(135deg, #efd9a8, #d4b578); border-color: transparent; }
      .dqw-popBtn:focus-visible { outline: 2px solid #d9bd82; outline-offset: 2px; }

      .dqw-kicker { margin: 0 0 4px; max-width: 100%; font-size: 9.5px; line-height: 1.4; letter-spacing: .2em; text-transform: uppercase; color: #a9854a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      body[data-ds-dark-theme] .dqw-kicker { color: #d9bd82; }
      .dqw-logoEmblem { width: 48px; height: 48px; overflow: visible; border-radius: 50%; box-shadow: 0 10px 24px rgba(6,22,45,.24); }

      @media (max-width: 640px) {
        .dqw-page { padding: 20px 16px 72px; }
        .dqw-h1 { font-size: 21px; }
        .dqw-card { padding: 14px; }
        .dqw-balanceValue { font-size: 26px; }
        .dqw-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .dqw-sliderLabel { flex-basis: 92px; }
        .dqw-pillRoot { right: 12px; bottom: 100px; }
        .dqw-status { width: 380px; padding-right: 12px; }
        .dqw-statusSpark { display: none; }
        .dqw-statusSchool { font-size: 12.5px; letter-spacing: .1em; }
        .dqw-weatherPlace { display: none; }
      }

      @media (max-width: 380px) {
        .dqw-status { width: calc(100vw - 24px); }
        .dqw-weatherCond { display: none; }
        .dqw-statusBalance { font-size: 28px; }
        .dqw-statusToday { font-size: 12.5px; }
        .dqw-popMotto { font-size: 13px; letter-spacing: .04em; padding: 9px 10px; }
      }

      @media (prefers-reduced-motion: reduce) {
        .dqw-status, .dqw-statusSeal, .dqw-preset, .dqw-switch, .dqw-switchKnob { transition: none; }
        .dqw-pop { animation: none; }
      }
    `;

    function injectStyles() {
      if (typeof document === 'undefined') return;
      if (document.querySelector(`style[data-plugin-css="${STYLE_ID}"]`) !== null) return;
      const style = document.createElement('style');
      style.dataset.pluginCss = STYLE_ID;
      style.textContent = CSS;
      document.head.appendChild(style);
    }

    function removeStyles() {
      if (typeof document === 'undefined') return;
      const style = document.querySelector(`style[data-plugin-css="${STYLE_ID}"]`);
      if (style !== null) style.remove();
    }

    // ---------------------------------------------------------------------
    // Plugin entry
    // ---------------------------------------------------------------------

    const inject = ['slots', 'locale'];

    function apply(ctx) {
      injectStyles();

      ctx.effect(
        () => ctx.locale.register(NS, { zh: ZH, en: EN }),
        'dsh-quota-wallpaper: dictionaries',
      );
      const translate = ctx.locale.bind(NS);

      activateScholarOnce();
      applyWallpaper(getSettingsState().value);
      const unsubscribeSettings = subscribeSettings(() => {
        applyWallpaper(getSettingsState().value);
      });
      window.addEventListener('storage', onStorageEvent);
      startQuotaPolling();
      startWeatherPolling();

      const openPanel = () => {
        const layout = ctx.get('layout');
        if (layout === undefined) return;
        try {
          layout.selectPanel(PANEL_ID);
        } catch {
          // The panel may not be registered yet during a reload; a second
          // click after activation succeeds, and nothing else breaks.
        }
      };

      const PillEntry = (props) => h(Pill, {
        ...props,
        t: props.t ?? ((key) => ZH[key] ?? key),
        openPanel,
      });
      const NavEntry = (props) => h(NavIcon, props);
      const PageEntry = (props) => h(Page, {
        ...props,
        t: props.t ?? ((key) => ZH[key] ?? key),
      });

      ctx.slots.inject('shell.overlay', () => ctx.slots.register({
        name: 'shell.overlay',
        id: 'quota-wallpaper.pill',
        order: 80,
        locale: NS,
      }, PillEntry));

      ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
        name: 'sidebar.panellist',
        id: PANEL_ID,
        order: 30,
        label: () => translate('nav.label'),
        locale: NS,
      }, NavEntry));

      ctx.slots.inject('main', () => ctx.slots.register({
        name: 'main',
        key: PANEL_ID,
        locale: NS,
      }, PageEntry));

      ctx.effect(() => () => {
        unsubscribeSettings();
        window.removeEventListener('storage', onStorageEvent);
        stopQuotaPolling();
        stopWeatherPolling();
        disposeWallpaper();
        removeStyles();
        if (saveTimer !== null) {
          clearTimeout(saveTimer);
          saveTimer = null;
        }
      }, 'dsh-quota-wallpaper: surfaces');
    }

    return { inject, apply };
  },
});
