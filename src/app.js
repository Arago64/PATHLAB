import { WIDTH, HEIGHT, generateGraph, euclidean } from './graph.js';
import { ALGORITHMS, solve, benchmark } from './algorithms.js';

const $ = id => document.getElementById(id);
const I18N = {
  en: {
    browser:'100% browser · no dependencies',graphConfig:'GRAPH CONFIGURATION',nodes:'Random nodes',connectivity:'Connections per node',sparse:'Sparse',dense:'Dense',seed:'Random seed',newGraph:'GENERATE NEW GRAPH',routeSetup:'ROUTE SETUP',chooseHelp:'Click a button, then select a point on the canvas.',selectStart:'SET POINT A',selectGoal:'SET POINT B',randomPair:'↝ Random A / B pair',algorithmTitle:'ALGORITHM',liveVis:'LIVE VISUALIZATION',networkTitle:'Geometric network',nodesShort:'nodes',edgesShort:'edges',clickToSelect:'CLICK A NODE TO SET A',pickA:'CLICK A NODE TO SET A',pickB:'CLICK A NODE TO SET B',allEdges:'Graph',visited:'Visited',frontier:'Discovered',foundRoute:'Route',run:'RUN SEARCH',pause:'PAUSE',resume:'RESUME',step:'STEP',speed:'Speed',liveStats:'LIVE STATISTICS',pathLength:'PATH LENGTH',coordinateUnits:'coordinate units',relativeToBest:'VS. OPTIMUM',hops:'HOPS',visitedCount:'VISITED NODES',edgesChecked:'EDGE CHECKS',coverage:'SEARCH COVERAGE',coverageNote:'Visited nodes as a share of the graph.',cpuTime:'MEDIAN ALGORITHM TIME',timingNote:'Measured without animation; browser-dependent, 25 runs.',explainTitle:'WHAT IS HAPPENING?',benchmarkEyebrow:'MEASURABLE PERFORMANCE',benchmarkTitle:'Algorithm benchmark',benchSubtitle:'All methods run on the same graph. Click a row to replay its search.',rerunBench:'RE-RUN BENCHMARK',algColumn:'ALGORITHM',lengthColumn:'LENGTH',deltaColumn:'VS. OPTIMUM',visitedColumn:'VISITED',checksColumn:'CHECKS',runtimeColumn:'MEDIAN TIME',resultColumn:'RESULT',tableNote:'Weighted shortest path = Dijkstra baseline. BFS minimizes edge count only. Custom one-step heuristics may get stuck. Times are approximate.',ready:'READY',running:'RUNNING',paused:'PAUSED',found:'PATH FOUND',failed:'LOCAL DEAD END',optimal:'OPTIMAL',success:'FOUND',stuck:'STUCK',readyLine:'Ready. Choose an algorithm and press Run.',runningLine:'Exploring network connections…',pauseLine:'Paused. Press Step or Resume.',foundLine:'Route complete.',failedLine:'This method got stuck before reaching B.',best:'Optimal',baseline:'Baseline',heuristic:'Heuristic',custom:'Custom',expReady:'Press Run to see which nodes the algorithm visits and how it chooses a route.',expRunning:'Cyan nodes have been expanded; orange nodes have been discovered. Edges are tested step by step.',expOptimal:'This method guarantees the minimum total edge length for this graph.',expNonoptimal:'The route is valid, but longer than the Dijkstra baseline.',expStuck:'The local-only rule cannot find a forward neighbor. A reachable route still exists via Dijkstra.',
    desc:{dijkstra:'Dijkstra expands the cheapest available weighted frontier. With positive edge lengths, the result is always shortest.',astar:'A* combines distance traveled with Euclidean distance to the goal. This heuristic is admissible, so the result is optimal.',bfs:'BFS minimizes the number of connections, not the total distance of weighted edges.',greedy:'Greedy best-first expands the frontier point closest to B, without accounting for the route already taken.',vector:'CUSTOM #1 — VECTOR CHASE: At each step, inspect only direct neighbors; choose the edge whose direction points most closely toward B, requiring a decrease in distance to B. No backtracking.',course:'CUSTOM #2 — COURSE LOCK: Establish an A→B heading; prioritize forward neighbors closest to that original line, strongly penalizing lateral deviation. No backtracking.'}
  },
  ru: {
    browser:'Работает в браузере · без библиотек',graphConfig:'ПАРАМЕТРЫ ГРАФА',nodes:'Случайные точки',connectivity:'Связи на точку',sparse:'Редко',dense:'Густо',seed:'Seed генератора',newGraph:'СОЗДАТЬ НОВЫЙ ГРАФ',routeSetup:'НАЧАЛО И КОНЕЦ',chooseHelp:'Нажми кнопку, затем выбери точку на графе.',selectStart:'ВЫБРАТЬ A',selectGoal:'ВЫБРАТЬ B',randomPair:'↝ Случайные A / B',algorithmTitle:'АЛГОРИТМ',liveVis:'АНИМАЦИЯ В РЕАЛЬНОМ ВРЕМЕНИ',networkTitle:'Геометрический граф',nodesShort:'узлов',edgesShort:'рёбер',clickToSelect:'НАЖМИ НА УЗЕЛ ДЛЯ A',pickA:'НАЖМИ НА УЗЕЛ ДЛЯ A',pickB:'НАЖМИ НА УЗЕЛ ДЛЯ B',allEdges:'Граф',visited:'Проверено',frontier:'Обнаружено',foundRoute:'Маршрут',run:'ЗАПУСК',pause:'ПАУЗА',resume:'ПРОДОЛЖИТЬ',step:'ШАГ',speed:'Скорость',liveStats:'СТАТИСТИКА',pathLength:'ДЛИНА ПУТИ',coordinateUnits:'условных единиц',relativeToBest:'К ОПТИМУМУ',hops:'ПЕРЕХОДОВ',visitedCount:'ПРОВЕРЕНО УЗЛОВ',edgesChecked:'ПРОВЕРОК РЁБЕР',coverage:'ОХВАТ ПОИСКА',coverageNote:'Доля узлов, извлечённых из очереди / посещённых.',cpuTime:'МЕДИАНА ВРЕМЕНИ',timingNote:'Без анимации, зависит от браузера; 25 прогонов.',explainTitle:'ЧТО ПРОИСХОДИТ?',benchmarkEyebrow:'ИЗМЕРИМАЯ ЭФФЕКТИВНОСТЬ',benchmarkTitle:'Сравнение алгоритмов',benchSubtitle:'Все методы проверяются на одном графе. Нажми на строку для анимации.',rerunBench:'ПОВТОРИТЬ ТЕСТЫ',algColumn:'АЛГОРИТМ',lengthColumn:'ДЛИНА',deltaColumn:'К ОПТИМУМУ',visitedColumn:'УЗЛОВ',checksColumn:'ПРОВЕРОК',runtimeColumn:'МЕДИАНА',resultColumn:'ИТОГ',tableNote:'Эталон кратчайшего пути — Dijkstra. BFS минимизирует число переходов. Авторские эвристики без возвратов могут застрять. Время приблизительно.',ready:'ГОТОВО',running:'РАБОТАЕТ',paused:'ПАУЗА',found:'ПУТЬ НАЙДЕН',failed:'АЛГОРИТМ ЗАСТРЯЛ',optimal:'ОПТИМУМ',success:'НАЙДЕН',stuck:'ТУПИК',readyLine:'Выбери алгоритм и нажми «Запуск».',runningLine:'Исследуем связи графа…',pauseLine:'Пауза. Нажми «Шаг» или «Продолжить».',foundLine:'Маршрут построен.',failedLine:'Алгоритм зашёл в тупик, хотя путь существует.',best:'Оптимальный',baseline:'Базовый',heuristic:'Эвристика',custom:'Авторский',expReady:'Нажми «Запуск», чтобы увидеть, как алгоритм ищет маршрут.',expRunning:'Голубые узлы уже обработаны, оранжевые обнаружены. Проверки рёбер показаны по шагам.',expOptimal:'Алгоритм гарантирует минимальную суммарную длину рёбер графа.',expNonoptimal:'Маршрут корректный, но длиннее оптимального пути Dijkstra.',expStuck:'В локальном правиле нет подходящего следующего шага. Dijkstra всё равно находит маршрут.',
    desc:{dijkstra:'Dijkstra выбирает ближайший по уже пройденной длине узел. Для положительных весов гарантированно находит кратчайший путь.',astar:'A* учитывает пройденный путь и расстояние по прямой до B. Такая оценка не завышает остаток, поэтому результат оптимален.',bfs:'BFS ищет маршрут с минимальным числом переходов, но не обязательно с минимальной общей длиной.',greedy:'Жадный поиск сначала проверяет обнаруженный узел, который ближе всего по прямой к B, не учитывая весь пройденный путь.',vector:'АВТОРСКИЙ №1 — VECTOR CHASE: На каждом шаге смотрим только соседей, выбираем направление, наиболее точно обращённое к B. Каждый шаг обязан сокращать расстояние до цели. Без возвратов.',course:'АВТОРСКИЙ №2 — COURSE LOCK: Сначала прокладываем прямой курс A→B. Далее выбираем соседа с движением вперёд и минимальным отклонением от этой линии. Без возвратов.'}
  },
  de: {
    browser:'100 % im Browser · keine Abhängigkeiten',graphConfig:'GRAPH-EINSTELLUNGEN',nodes:'Zufällige Knoten',connectivity:'Verbindungen pro Knoten',sparse:'Wenige',dense:'Viele',seed:'Zufalls-Seed',newGraph:'NEUEN GRAPH ERZEUGEN',routeSetup:'START UND ZIEL',chooseHelp:'Schaltfläche drücken und anschließend einen Knoten anklicken.',selectStart:'PUNKT A WÄHLEN',selectGoal:'PUNKT B WÄHLEN',randomPair:'↝ Zufälliges Paar A / B',algorithmTitle:'ALGORITHMUS',liveVis:'LIVE-VISUALISIERUNG',networkTitle:'Geometrischer Graph',nodesShort:'Knoten',edgesShort:'Kanten',clickToSelect:'KNOTEN FÜR A ANKLICKEN',pickA:'KNOTEN FÜR A ANKLICKEN',pickB:'KNOTEN FÜR B ANKLICKEN',allEdges:'Graph',visited:'Besucht',frontier:'Entdeckt',foundRoute:'Route',run:'STARTEN',pause:'PAUSE',resume:'FORTSETZEN',step:'SCHRITT',speed:'Tempo',liveStats:'LIVE-STATISTIK',pathLength:'WEGLÄNGE',coordinateUnits:'Koordinateneinheiten',relativeToBest:'ZUM OPTIMUM',hops:'SCHRITTE',visitedCount:'BESUCHTE KNOTEN',edgesChecked:'KANTENPRÜFUNGEN',coverage:'SUCHABDECKUNG',coverageNote:'Anteil der tatsächlich besuchten Knoten.',cpuTime:'MEDIAN DER LAUFZEIT',timingNote:'Ohne Animation; browserabhängig, 25 Durchläufe.',explainTitle:'WAS GESCHIEHT?',benchmarkEyebrow:'MESSBARE LEISTUNG',benchmarkTitle:'Algorithmenvergleich',benchSubtitle:'Alle Verfahren auf demselben Graphen. Zeile anklicken für Animation.',rerunBench:'BENCHMARK WIEDERHOLEN',algColumn:'ALGORITHMUS',lengthColumn:'LÄNGE',deltaColumn:'ZUM OPTIMUM',visitedColumn:'BESUCHT',checksColumn:'PRÜFUNGEN',runtimeColumn:'MEDIANZEIT',resultColumn:'ERGEBNIS',tableNote:'Dijkstra ist die Referenz für den kürzesten gewichteten Weg. BFS minimiert nur Kanten. Eigene Heuristiken ohne Rücksprung können scheitern. Zeiten sind Näherungen.',ready:'BEREIT',running:'LÄUFT',paused:'PAUSIERT',found:'WEG GEFUNDEN',failed:'SACKGASSE',optimal:'OPTIMAL',success:'GEFUNDEN',stuck:'SACKGASSE',readyLine:'Algorithmus auswählen und Starten drücken.',runningLine:'Verbindungen werden durchsucht…',pauseLine:'Pausiert. Schritt oder Fortsetzen drücken.',foundLine:'Route gefunden.',failedLine:'Die Heuristik bleibt trotz existierendem Weg stecken.',best:'Optimal',baseline:'Basis',heuristic:'Heuristik',custom:'Eigene',expReady:'Starten drücken, um die Suche Schritt für Schritt zu sehen.',expRunning:'Türkis = besuchte Knoten, Orange = entdeckte Knoten. Kanten werden einzeln geprüft.',expOptimal:'Dieses Verfahren garantiert die kürzeste Gesamtweglänge des Graphen.',expNonoptimal:'Die Route ist gültig, aber länger als die Dijkstra-Referenz.',expStuck:'Ohne Rücksprung kann die Heuristik keinen nächsten Vorwärtsschritt finden. Dijkstra findet dennoch einen Weg.',
    desc:{dijkstra:'Dijkstra untersucht den bisher günstigsten Knoten und garantiert bei positiven Kantengewichten den kürzesten Weg.',astar:'A* kombiniert zurückgelegte Strecke mit der Luftlinienentfernung nach B. Diese Heuristik ist zulässig, daher ist der Weg optimal.',bfs:'Die Breitensuche minimiert die Anzahl der Kanten, nicht deren aufsummierte Länge.',greedy:'Greedy Best-First bevorzugt den aktuell entdeckten Knoten mit der kleinsten Luftlinienentfernung zum Ziel.',vector:'EIGEN #1 — VECTOR CHASE: Betrachtet pro Schritt nur direkte Nachbarn und folgt der möglichst genauen Richtung nach B. Die Luftlinienentfernung muss sinken. Kein Zurückgehen.',course:'EIGEN #2 — COURSE LOCK: Legt zuerst eine Gerade A→B fest, bevorzugt dann vorwärtsgerichtete Nachbarn mit möglichst kleinem Abstand zur Kurslinie. Kein Zurückgehen.'}
  }
};

const EXTRA_I18N = {
  en: {
    visualStyle:'VISUAL STYLE', labMode:'COMPARISON LAB', networkTitleCity:'Street network',
    manualBench:'Manual comparison', manualBenchDesc:'Single-map benchmark for the graph currently shown above.',
    autoTitle:'Automatic study', autoSubtitle:'Run the same algorithms on many random maps and aggregate the results.',
    autoMaps:'Maps', autoSeedStep:'Seed step', runAuto:'RUN AUTO STUDY', autoIdle:'Automatic study has not been run yet.', autoRunning:'Running automatic study…',
    successRate:'SUCCESS', avgDelta:'AVG Δ', avgVisited:'AVG VISITED', avgChecks:'AVG CHECKS',
    classicLabel:'Classic graph', cityLabel:'City blocks', modeManual:'Manual + benchmark', modeAuto:'Automatic study', modeBoth:'2-in-1',
    autoDone:'Automatic study complete.', autoSummary:'{maps} maps · {nodes} nodes · {neighbors} links/node · base seed {seed} · step {step}'
  },
  ru: {
    visualStyle:'СТИЛЬ ОТОБРАЖЕНИЯ', labMode:'РЕЖИМ СРАВНЕНИЯ', networkTitleCity:'Сеть улиц',
    manualBench:'Ручное сравнение', manualBenchDesc:'Тест на одной текущей карте.',
    autoTitle:'Автоматическое исследование', autoSubtitle:'Запуск всех алгоритмов на серии случайных карт с агрегированием результатов.',
    autoMaps:'Карт', autoSeedStep:'Шаг seed', runAuto:'ЗАПУСТИТЬ AUTO STUDY', autoIdle:'Автоматическое исследование ещё не запускалось.', autoRunning:'Выполняется автоматическое исследование…',
    successRate:'УСПЕХ', avgDelta:'СРЕДН. Δ', avgVisited:'СРЕДН. УЗЛОВ', avgChecks:'СРЕДН. ПРОВЕРОК',
    classicLabel:'Классический граф', cityLabel:'Городские кварталы', modeManual:'Ручной + benchmark', modeAuto:'Автоисследование', modeBoth:'2-в-1',
    autoDone:'Автоматическое исследование завершено.', autoSummary:'{maps} карт · {nodes} узлов · {neighbors} связей/узел · базовый seed {seed} · шаг {step}'
  },
  de: {
    visualStyle:'DARSTELLUNGSSTIL', labMode:'VERGLEICHSMODUS', networkTitleCity:'Straßennetz',
    manualBench:'Manueller Vergleich', manualBenchDesc:'Benchmark für genau den oben gezeigten Graphen.',
    autoTitle:'Automatische Studie', autoSubtitle:'Alle Algorithmen auf vielen Zufallsgraphen ausführen und Ergebnisse aggregieren.',
    autoMaps:'Karten', autoSeedStep:'Seed-Schritt', runAuto:'AUTO-STUDIE STARTEN', autoIdle:'Die automatische Studie wurde noch nicht ausgeführt.', autoRunning:'Automatische Studie läuft…',
    successRate:'ERFOLG', avgDelta:'Ø Δ', avgVisited:'Ø BESUCHT', avgChecks:'Ø PRÜFUNGEN',
    classicLabel:'Klassischer Graph', cityLabel:'Stadtblöcke', modeManual:'Manuell + Benchmark', modeAuto:'Automatische Studie', modeBoth:'2-in-1',
    autoDone:'Automatische Studie abgeschlossen.', autoSummary:'{maps} Karten · {nodes} Knoten · {neighbors} Verbindungen/Knoten · Start-Seed {seed} · Schritt {step}'
  }
};
for (const key of Object.keys(EXTRA_I18N)) Object.assign(I18N[key], EXTRA_I18N[key]);

let lang = 'en';
const tr = key => I18N[lang][key] ?? I18N.en[key] ?? key;
let graph, results = {}, selected = 'astar', pick = 'start', anim = null, autoStudy = null;
let playing = false, frameRequest = 0, lastTime = 0, budget = 0;
let visited = new Set(), discovered = new Set(), discoveredEdges = new Set(), checkedEdges = new Set();
let currentNode = -1, lastEdge = -1, hoverNode = -1, showPath = false;
let styleMode = 'classic', labMode = 'both';
const canvas = $('graphCanvas'), ctx = canvas.getContext('2d');
const format = v => Number.isFinite(v) ? v.toFixed(1) : '—';
const formatInt = v => Number.isFinite(v) ? Math.round(v).toString() : '—';
const formatPct = v => Number.isFinite(v) ? `${v.toFixed(1)}%` : '—';
const formatTime = v => Number.isFinite(v) ? (v < .01 ? v.toFixed(4) : v.toFixed(3)) + ' ms' : '—';

function fillTemplate(text, values) {
  return text.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? '');
}

function translate() {
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach(element => element.textContent = tr(element.dataset.i18n));
  $('language').value = lang;
  syncSelectLabels();
  updateModeUI();
  renderAlgorithms();
  renderBenchmark();
  renderAutoStudy();
  updatePick();
  updateInfo();
  updateTitles();
  updateResultUI();
}

function syncSelectLabels() {
  const vs = $('visualStyle');
  if (vs) {
    vs.options[0].textContent = tr('classicLabel');
    vs.options[1].textContent = tr('cityLabel');
    vs.value = styleMode;
  }
  const lm = $('labMode');
  if (lm) {
    lm.options[0].textContent = tr('modeManual');
    lm.options[1].textContent = tr('modeAuto');
    lm.options[2].textContent = tr('modeBoth');
    lm.value = labMode;
  }
}

function updateTitles() {
  $('networkTitle').textContent = styleMode === 'city' ? tr('networkTitleCity') : tr('networkTitle');
}

function updateModeUI() {
  const manualBlock = $('manualBlock'), autoBlock = $('autoBlock');
  if (manualBlock) manualBlock.style.display = labMode === 'auto' ? 'none' : '';
  if (autoBlock) autoBlock.style.display = labMode === 'manual' ? 'none' : '';
}

function renderAlgorithms() {
  $('algorithms').replaceChildren();
  for (const a of ALGORITHMS) {
    const button = document.createElement('button');
    button.className = 'algorithm' + (selected === a.id ? ' active' : '');
    button.setAttribute('role', 'radio');
    button.setAttribute('aria-checked', String(selected === a.id));
    const radio = document.createElement('span'); radio.className = 'alg-dot';
    const label = document.createElement('span'); label.className = 'alg-label'; label.textContent = a.name;
    const badge = document.createElement('span'); badge.className = 'alg-badge' + (a.kind === 'custom' ? ' custom' : ''); badge.textContent = tr(a.kind);
    button.append(radio, label, badge);
    button.addEventListener('click', () => selectAlgorithm(a.id));
    $('algorithms').append(button);
  }
}

function updateInfo() { $('algorithmDescription').textContent = tr('desc')[selected] ?? I18N.en.desc[selected]; }
function selectAlgorithm(id, autorun = false) {
  selected = id;
  stopAnimation(); clearVis();
  renderAlgorithms(); renderBenchmark(); updateInfo(); updateResultUI(); draw();
  if (autorun) run();
}

function renderBenchmark() {
  const tbody = $('benchmarkRows'); if (!tbody) return; tbody.replaceChildren();
  const optimum = results.dijkstra?.distance ?? Infinity;
  for (const a of ALGORITHMS) {
    const r = results[a.id];
    const row = document.createElement('tr');
    if (selected === a.id) row.className = 'selected';
    if (r) {
      const percent = r.found && Number.isFinite(optimum) && optimum > 0 ? (r.distance / optimum - 1) * 100 : NaN;
      const delta = r.found ? (Math.abs(percent) < 0.00001 ? '0.0%' : '+' + percent.toFixed(1) + '%') : '—';
      const good = r.found && Math.abs(percent) < .00001;
      row.innerHTML = `<td>${a.name}<div class="sub">${tr(a.kind)}</div></td><td>${format(r.distance)}</td><td class="${good ? 'num-green' : r.found ? 'num-yellow' : 'num-red'}">${delta}</td><td>${r.visited}</td><td>${r.checks}</td><td>${formatTime(r.ms)}</td><td><span class="pill ${r.found ? '' : 'miss'}">${r.found ? (good ? tr('optimal') : tr('success')) : tr('stuck')}</span></td>`;
    } else {
      row.innerHTML = `<td>${a.name}</td><td colspan="6">—</td>`;
    }
    row.addEventListener('click', () => selectAlgorithm(a.id, true));
    tbody.append(row);
  }
}

function renderAutoStudy() {
  const tbody = $('autoRows'), summary = $('autoSummary');
  if (!tbody || !summary) return;
  tbody.replaceChildren();
  if (!autoStudy?.data) {
    summary.textContent = tr(autoStudy?.running ? 'autoRunning' : 'autoIdle');
    return;
  }
  summary.textContent = fillTemplate(tr('autoSummary'), autoStudy.meta);
  for (const a of ALGORITHMS) {
    const r = autoStudy.data[a.id];
    const row = document.createElement('tr');
    row.innerHTML = `<td>${a.name}<div class="sub">${tr(a.kind)}</div></td><td>${formatPct(r.successRate)}</td><td class="${r.avgDelta <= 0.01 ? 'num-green' : r.avgDelta <= 10 ? 'num-yellow' : 'num-red'}">${r.successes ? '+' + r.avgDelta.toFixed(1) + '%' : '—'}</td><td>${formatInt(r.avgVisited)}</td><td>${formatInt(r.avgChecks)}</td><td>${formatTime(r.avgTime)}</td>`;
    tbody.append(row);
  }
}

function stopAnimation() {
  playing = false;
  if (frameRequest) cancelAnimationFrame(frameRequest);
  frameRequest = 0;
}
function clearVis() {
  anim = null; visited.clear(); discovered.clear(); discoveredEdges.clear(); checkedEdges.clear();
  currentNode = -1; lastEdge = -1; showPath = false; budget = 0; lastTime = 0;
  $('timelineFill').style.width = '0%'; $('stepCounter').textContent = '0 / 0';
}
function clearAutoStudy() {
  autoStudy = null;
  renderAutoStudy();
}
function regen() {
  stopAnimation(); clearVis(); clearAutoStudy();
  const count = +$('nodeRange').value, neighbors = +$('edgeRange').value;
  const seed = (Number($('seed').value) >>> 0);
  $('seed').value = String(seed);
  graph = generateGraph({count,neighbors,seed});
  $('nodeCount').textContent = graph.nodes.length;
  $('edgeCount').textContent = graph.edges.length;
  $('startLabel').textContent = String(graph.start).padStart(3,'0');
  $('goalLabel').textContent = String(graph.goal).padStart(3,'0');
  results = benchmark(graph,graph.start,graph.goal);
  renderBenchmark(); updateResultUI(); draw();
}
function recompute() {
  stopAnimation(); clearVis();
  results = benchmark(graph,graph.start,graph.goal);
  $('startLabel').textContent = String(graph.start).padStart(3,'0');
  $('goalLabel').textContent = String(graph.goal).padStart(3,'0');
  renderBenchmark(); updateResultUI(); draw();
}
function randomEnds() {
  const rng = Math.random;
  const n = graph.nodes.length;
  const a = Math.floor(rng()*n);
  let best = (a+1)%n, dist = 0;
  for (let i=0;i<60;i++) {
    const b=Math.floor(rng()*n), d=euclidean(graph.nodes[a],graph.nodes[b]);
    if (b!==a && d>dist) {best=b;dist=d;}
  }
  graph.start=a; graph.goal=best; recompute();
}
function updatePick() {
  $('pickStart').classList.toggle('active',pick==='start'); $('pickGoal').classList.toggle('active',pick==='goal');
  $('pickStatus').textContent = tr(pick === 'start' ? 'pickA' : 'pickB');
}
function updateResultUI() {
  const r = anim && showPath ? anim.result : null;
  const best = results.dijkstra?.distance ?? Infinity;
  $('routeLength').textContent = r?.found ? format(r.distance) : '—';
  $('relativeBest').textContent = r?.found ? (best ? '+'+Math.max(0,((r.distance/best)-1)*100).toFixed(1)+'%' : '0%') : '—';
  $('hopCount').textContent = r?.found ? String(r.hops) : '—';
  $('visitedCount').textContent = String(visited.size);
  $('checkedCount').textContent = String(anim?.processedChecks || 0);
  const ratio = graph ? 100 * visited.size / graph.nodes.length : 0;
  $('coverageValue').textContent = ratio.toFixed(0) + '%';
  $('coverageFill').style.width = ratio + '%';
  $('timeValue').textContent = formatTime(results[selected]?.ms);
  const status = $('resultStatus'); status.className = 'result-status';
  let statusKey = 'ready', lineKey = 'readyLine', expKey = 'expReady';
  if (anim) {
    if (showPath) {
      statusKey = r.found ? 'found' : 'failed'; lineKey = r.found ? 'foundLine' : 'failedLine';
      expKey = !r.found ? 'expStuck' : r.distance <= best + 1e-7 ? 'expOptimal' : 'expNonoptimal';
      status.classList.add(r.found ? 'success' : 'failed');
    } else {
      statusKey = playing ? 'running' : 'paused'; lineKey = playing ? 'runningLine' : 'pauseLine'; expKey = 'expRunning';
    }
  }
  $('statusText').textContent = tr(statusKey);
  $('runState').textContent = tr(lineKey);
  $('liveExplanation').textContent = tr(expKey);
  $('pause').querySelector('span').textContent = tr(!playing && anim && !showPath ? 'resume' : 'pause');
  $('pause').disabled = !anim || showPath;
  $('step').disabled = !!(anim && showPath);
  $('stepCounter').textContent = anim ? `${anim.position} / ${anim.trace.length}` : '0 / 0';
  $('timelineFill').style.width = anim && anim.trace.length ? `${100 * anim.position / anim.trace.length}%` : '0%';
}
function prepare() {
  stopAnimation(); clearVis();
  const result = solve(graph,graph.start,graph.goal,selected,{record:true});
  anim = {result,trace:result.trace,position:0,processedChecks:0};
}
function run() {
  prepare();
  playing=true; lastTime=0; budget=0;
  updateResultUI();
  frameRequest=requestAnimationFrame(tick);
}
function advance() {
  if (!anim || anim.position >= anim.trace.length) return;
  const step = anim.trace[anim.position++];
  if (step.type === 'visit') {
    visited.add(step.node); discovered.delete(step.node); currentNode = step.node;
  } else if (step.type === 'check') {
    lastEdge = step.edge; checkedEdges.add(step.edge); anim.processedChecks++;
  } else if (step.type === 'discover') {
    discovered.add(step.node); discoveredEdges.add(step.edge);
  }
  if (anim.position === anim.trace.length) finish();
}
function finish() {
  playing = false; showPath = true;
  if (frameRequest) cancelAnimationFrame(frameRequest);
  frameRequest=0;
  draw(); updateResultUI();
}
function tick(now) {
  if (!playing || !anim) return;
  if (!lastTime) lastTime=now;
  const dt=Math.min(100,now-lastTime); lastTime=now;
  budget += dt*Number($('speed').value)/1000;
  const available=Math.min(120, Math.floor(budget));
  budget -= available;
  for(let i=0;i<available && playing;i++) advance();
  draw(); updateResultUI();
  if (playing) frameRequest=requestAnimationFrame(tick);
}
function singleStep() {
  if (!anim || showPath) prepare();
  stopAnimation();
  advance(); draw(); updateResultUI();
}
function togglePause() {
  if (!anim || showPath) return;
  if (playing) { stopAnimation(); updateResultUI(); }
  else { playing = true; lastTime=0; frameRequest=requestAnimationFrame(tick); updateResultUI(); }
}
function canvasScale() {
  const dpr=Math.max(1,Math.min(2,window.devicePixelRatio||1));
  const rect=canvas.getBoundingClientRect();
  const w=Math.round(rect.width*dpr),h=Math.round(rect.height*dpr);
  if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
  ctx.setTransform(canvas.width/WIDTH,0,0,canvas.height/HEIGHT,0,0);
}
function segment(a,b,color,width=1,dash=[]) {
  ctx.save();ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);
  ctx.strokeStyle=color;ctx.lineWidth=width;ctx.setLineDash(dash);ctx.stroke();ctx.restore();
}
function circle(node,r,color,stroke=null) {
  ctx.beginPath();ctx.arc(node.x,node.y,r,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();
  if(stroke){ctx.lineWidth=1.5;ctx.strokeStyle=stroke;ctx.stroke();}
}
function square(x,y,w,h,fill,stroke=null,r=0){
  ctx.beginPath();
  if (ctx.roundRect && r>0) ctx.roundRect(x,y,w,h,r); else ctx.rect(x,y,w,h);
  ctx.fillStyle=fill; ctx.fill();
  if (stroke) { ctx.strokeStyle=stroke; ctx.lineWidth=1.1; ctx.stroke(); }
}
function drawHouse(node, state='base') {
  const palette = {
    base:['#f9f7f1','#dbcfb9'],
    frontier:['#ffe9c5','#df9f4f'],
    visited:['#dffbff','#67bccf'],
    route:['#e9fff1','#57b47f'],
    start:['#dff5ff','#70d9fc'],
    goal:['#fff0da','#ffcd83']
  }[state];
  const size = state === 'route' ? 12 : 10;
  const x = node.x - size/2, y = node.y - size/2;
  ctx.save();
  square(x, y, size, size*0.72, palette[0], palette[1], 1.4);
  ctx.beginPath();
  ctx.moveTo(node.x - size*0.62, y + size*0.1);
  ctx.lineTo(node.x, y - size*0.45);
  ctx.lineTo(node.x + size*0.62, y + size*0.1);
  ctx.closePath();
  ctx.fillStyle = palette[1];
  ctx.fill();
  ctx.beginPath();
  ctx.fillStyle = '#856f4e';
  ctx.fillRect(node.x - 1.2, y + size*0.18, 2.4, 3.4);
  ctx.restore();
}
function drawCityBackdrop(nodes) {
  ctx.fillStyle = '#d8c9a8';
  ctx.fillRect(0,0,WIDTH,HEIGHT);
  for (const node of nodes) {
    const w = 22 + (node.id % 4) * 5;
    const h = 16 + (node.id % 3) * 6;
    const dx = ((node.id * 17) % 18) - 9;
    const dy = ((node.id * 13) % 16) - 8;
    const x = Math.max(6, Math.min(WIDTH - w - 6, node.x + dx - w/2));
    const y = Math.max(6, Math.min(HEIGHT - h - 6, node.y + dy - h/2));
    square(x, y, w, h, '#efe5d0', '#decfac', 2);
  }
}
function drawClassic(nodes, edges, start, goal) {
  if(selected==='course') segment(nodes[start],nodes[goal],'#eab46755',1.6,[9,8]);
  for(const e of edges) segment(nodes[e.u],nodes[e.v],'#35506a77',1.05);
  for(const id of checkedEdges){const e=edges[id];segment(nodes[e.u],nodes[e.v],'#9f79475a',1.5);}
  for(const id of discoveredEdges){const e=edges[id];segment(nodes[e.u],nodes[e.v],'#4ebce388',2.2);}
  if(lastEdge>=0 && !showPath){const e=edges[lastEdge];segment(nodes[e.u],nodes[e.v],'#ffc16c',3);}
  if(showPath && anim?.result.found) {
    ctx.save();ctx.shadowColor='#53f2a8';ctx.shadowBlur=14;
    for(const id of anim.result.pathEdges){const e=edges[id];segment(nodes[e.u],nodes[e.v],'#79f9ae',4.7);}
    ctx.restore();
  }
  for(const node of nodes){
    const isVisited=visited.has(node.id), isFrontier=discovered.has(node.id);
    const c=isVisited?'#55d8dc':isFrontier?'#ffba72':'#54718b';
    circle(node,isVisited?3.9:isFrontier?3.8:3.0,c);
  }
  if(showPath && anim?.result.found){
    for(const id of anim.result.path) if(id!==start && id!==goal) circle(nodes[id],5.1,'#87ffd0');
  }
  if(currentNode!==-1 && !showPath) { ctx.save();ctx.shadowColor='#7bcfff';ctx.shadowBlur=18;circle(nodes[currentNode],8,'#c1f1ff','#77d7ff');ctx.restore(); }
  if(hoverNode!==-1 && hoverNode!==start && hoverNode!==goal){ ctx.beginPath();ctx.arc(nodes[hoverNode].x,nodes[hoverNode].y,12,0,Math.PI*2);ctx.strokeStyle='#c6e7fa66';ctx.lineWidth=1.5;ctx.stroke(); }
  for(const [id,label,color] of [[start,'A','#70d9fc'],[goal,'B','#ffcd83']]) {
    const n=nodes[id];
    ctx.save();ctx.shadowColor=color;ctx.shadowBlur=20;circle(n,11,'#10283b',color);circle(n,6,color);ctx.restore();
    ctx.fillStyle='#f6fbff';ctx.font='700 13px system-ui';ctx.textAlign='center';ctx.fillText(label,n.x,n.y-19);
  }
}
function drawCity(nodes, edges, start, goal) {
  drawCityBackdrop(nodes);
  if(selected==='course') segment(nodes[start],nodes[goal],'#7f6d4ca8',2,[8,7]);
  for(const e of edges) segment(nodes[e.u],nodes[e.v],'#b08956a6',6.5);
  for(const id of checkedEdges){const e=edges[id];segment(nodes[e.u],nodes[e.v],'#9d7745a0',7.5);}
  for(const id of discoveredEdges){const e=edges[id];segment(nodes[e.u],nodes[e.v],'#d3b071b8',8.5);}
  if(lastEdge>=0 && !showPath){const e=edges[lastEdge];segment(nodes[e.u],nodes[e.v],'#f3d08c',9.5);}
  if(showPath && anim?.result.found) {
    ctx.save();ctx.shadowColor='#65c58f';ctx.shadowBlur=10;
    for(const id of anim.result.pathEdges){const e=edges[id];segment(nodes[e.u],nodes[e.v],'#5cb980',10.5);}
    ctx.restore();
  }
  for(const node of nodes) {
    let state='base';
    if (visited.has(node.id)) state='visited';
    else if (discovered.has(node.id)) state='frontier';
    drawHouse(node, state);
  }
  if(showPath && anim?.result.found){
    for(const id of anim.result.path) if(id!==start && id!==goal) drawHouse(nodes[id], 'route');
  }
  if(currentNode!==-1 && !showPath) {
    const n = nodes[currentNode];
    ctx.save(); ctx.strokeStyle='#54d3e0'; ctx.lineWidth=2; ctx.strokeRect(n.x-11, n.y-11, 22, 22); ctx.restore();
  }
  if(hoverNode!==-1 && hoverNode!==start && hoverNode!==goal){ const n=nodes[hoverNode]; ctx.save(); ctx.strokeStyle='#8d7e59'; ctx.setLineDash([4,4]); ctx.lineWidth=1.5; ctx.strokeRect(n.x-12,n.y-12,24,24); ctx.restore(); }
  drawHouse(nodes[start], 'start');
  drawHouse(nodes[goal], 'goal');
  for(const [id,label,color] of [[start,'A','#1f6f89'],[goal,'B','#9b6a1b']]) {
    const n=nodes[id];
    ctx.fillStyle=color; ctx.font='700 13px system-ui'; ctx.textAlign='center'; ctx.fillText(label,n.x,n.y-18);
  }
}
function draw() {
  if (!graph) return;
  canvasScale();ctx.clearRect(0,0,WIDTH,HEIGHT);
  const {nodes,edges,start,goal} = graph;
  if (styleMode === 'city') drawCity(nodes, edges, start, goal);
  else drawClassic(nodes, edges, start, goal);
}
function pointFromEvent(event) {
  const r=canvas.getBoundingClientRect();
  return {x:(event.clientX-r.left)/r.width*WIDTH,y:(event.clientY-r.top)/r.height*HEIGHT};
}
function nearest(pt) {
  let min=Infinity,id=-1;
  for(const node of graph.nodes) { const d=euclidean(pt,node);if(d<min){min=d;id=node.id;} }
  return min<=(styleMode==='city'?22:19)?id:-1;
}

async function runAutoStudy() {
  const button = $('runAuto');
  button.disabled = true;
  autoStudy = { running: true };
  renderAutoStudy();
  const maps = Math.max(5, Math.min(250, Number($('autoMaps').value) || 40));
  const step = Math.max(1, Number($('autoSeedStep').value) || 97);
  const count = +$('nodeRange').value, neighbors = +$('edgeRange').value;
  const seedBase = (Number($('seed').value) >>> 0);
  const acc = Object.fromEntries(ALGORITHMS.map(a => [a.id, {maps:0, successes:0, deltaSum:0, deltaCount:0, visitedSum:0, checksSum:0, timeSum:0}]));
  for (let i = 0; i < maps; i++) {
    const g = generateGraph({ count, neighbors, seed: (seedBase + i * step) >>> 0 });
    const res = benchmark(g, g.start, g.goal, 9);
    const optimum = res.dijkstra.distance;
    for (const a of ALGORITHMS) {
      const r = res[a.id], bucket = acc[a.id];
      bucket.maps++; bucket.visitedSum += r.visited; bucket.checksSum += r.checks; bucket.timeSum += r.ms;
      if (r.found) { bucket.successes++; bucket.deltaSum += Math.max(0, (r.distance / optimum - 1) * 100); bucket.deltaCount++; }
    }
    if (i % 5 === 4) {
      $('autoSummary').textContent = `${tr('autoRunning')} ${i + 1} / ${maps}`;
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }
  const data = {};
  for (const a of ALGORITHMS) {
    const r = acc[a.id];
    data[a.id] = {
      successes: r.successes,
      successRate: r.maps ? r.successes / r.maps * 100 : 0,
      avgDelta: r.deltaCount ? r.deltaSum / r.deltaCount : NaN,
      avgVisited: r.maps ? r.visitedSum / r.maps : NaN,
      avgChecks: r.maps ? r.checksSum / r.maps : NaN,
      avgTime: r.maps ? r.timeSum / r.maps : NaN
    };
  }
  autoStudy = { running: false, data, meta: { maps, nodes: count, neighbors, seed: seedBase, step } };
  renderAutoStudy();
  button.disabled = false;
}

canvas.addEventListener('mousemove',e=>{const id=nearest(pointFromEvent(e));if(id!==hoverNode){hoverNode=id;draw();}});
canvas.addEventListener('mouseleave',()=>{hoverNode=-1;draw();});
canvas.addEventListener('click',e=>{
  const id=nearest(pointFromEvent(e));if(id<0)return;
  if(pick==='start') { if(id===graph.goal)return;graph.start=id;pick='goal'; }
  else {if(id===graph.start)return;graph.goal=id;pick='start';}
  updatePick();recompute();
});
$('generate').addEventListener('click',()=>{$('seed').value=String(Math.floor(Math.random()*4294967295));regen();});
$('nodeRange').addEventListener('input',e=>$('nodeValue').textContent=e.target.value);
$('edgeRange').addEventListener('input',e=>$('edgeValue').textContent=e.target.value);
for (const id of ['nodeRange','edgeRange','seed']) $(id).addEventListener('change',regen);
$('visualStyle').addEventListener('change', e => { styleMode = e.target.value; updateTitles(); draw(); });
$('labMode').addEventListener('change', e => { labMode = e.target.value; updateModeUI(); });
$('pickStart').addEventListener('click',()=>{pick='start';updatePick();});
$('pickGoal').addEventListener('click',()=>{pick='goal';updatePick();});
$('randomEnds').addEventListener('click',randomEnds);
$('run').addEventListener('click',run);
$('pause').addEventListener('click',togglePause);
$('step').addEventListener('click',singleStep);
$('benchmark').addEventListener('click',recompute);
$('runAuto').addEventListener('click',runAutoStudy);
$('speed').addEventListener('input',e=>$('speedValue').textContent=e.target.value);
$('language').addEventListener('change',e=>{lang=e.target.value;translate();});
window.addEventListener('resize',draw);
window.addEventListener('keydown',e=>{
  if(/INPUT|SELECT|TEXTAREA/.test(document.activeElement?.tagName)) return;
  if(e.key===' '){e.preventDefault(); if(anim && !showPath) togglePause();else run();}
  if(e.key==='ArrowRight'){e.preventDefault();singleStep();}
});
renderAlgorithms();regen();translate();
