// «Коллоквиум» — timed multiple-choice test on dental anatomy & materials.

// [question, correct, ...wrong]
const POOL = [
  ['Сколько зубов у взрослого человека вместе с зубами мудрости?', '32', '28', '30', '36'],
  ['Сколько молочных зубов у ребёнка?', '20', '24', '16', '28'],
  ['Самая твёрдая ткань в организме человека — это…', 'Эмаль', 'Дентин', 'Кость челюсти', 'Цемент'],
  ['Какой зуб называют «восьмёркой»?', 'Зуб мудрости', 'Клык', 'Первый моляр', 'Боковой резец'],
  ['Ткань, которая лежит сразу под эмалью:', 'Дентин', 'Пульпа', 'Периодонт', 'Десна'],
  ['Мягкая ткань внутри зуба с нервами и сосудами:', 'Пульпа', 'Дентин', 'Цемент', 'Эмаль'],
  ['Чем покрыт корень зуба?', 'Цементом', 'Эмалью', 'Пульпой', 'Ничем'],
  ['Из чего отливают рабочую модель по слепку?', 'Из гипса', 'Из воска', 'Из пластилина', 'Из цемента'],
  ['Для чего зубному технику воск?', 'Моделировать будущую конструкцию', 'Полировать коронки', 'Склеивать модели', 'Отбеливать зубы'],
  ['Что делает артикулятор?', 'Повторяет движения челюсти', 'Измеряет цвет зуба', 'Обжигает керамику', 'Сканирует слепок'],
  ['Окклюзия — это…', 'Смыкание зубов', 'Воспаление десны', 'Вид коронки', 'Слепочная масса'],
  ['Мостовидный протез замещает…', 'Отсутствующий зуб с опорой на соседние', 'Только эмаль', 'Всю челюсть', 'Корень зуба'],
  ['Имплантат заменяет…', 'Корень зуба', 'Эмаль', 'Десну', 'Пульпу'],
  ['Винир — это…', 'Тонкая накладка на переднюю поверхность зуба', 'Съёмный протез', 'Пломба', 'Брекет'],
  ['Бюгельный протез — это…', 'Съёмный протез с металлической дугой', 'Керамическая коронка', 'Винир', 'Имплантат'],
  ['Металлокерамическая коронка состоит из…', 'Металлического каркаса и керамики', 'Только металла', 'Пластмассы и воска', 'Гипса и керамики'],
  ['CAD/CAM в зуботехнике — это…', 'Компьютерное моделирование и фрезеровка', 'Вид гипса', 'Шкала цвета', 'Ручная полировка'],
  ['Примерная температура обжига стоматологической керамики:', '≈ 900 °C', '≈ 100 °C', '≈ 300 °C', '≈ 2000 °C'],
  ['Зуб 11 по международной системе — это…', 'Верхний правый центральный резец', 'Нижний левый клык', 'Верхний левый моляр', 'Нижний правый резец'],
  ['Зуб 36 по международной системе — это…', 'Нижний левый первый моляр', 'Верхний правый клык', 'Нижний правый премоляр', 'Верхний левый резец'],
  ['Сколько резцов у взрослого человека?', '8', '4', '6', '12'],
  ['Сколько премоляров у взрослого человека?', '8', '4', '12', '10'],
  ['Сколько корней обычно у верхнего первого моляра?', '3', '1', '2', '4'],
  ['Сколько корней обычно у нижнего первого моляра?', '2', '1', '3', '4'],
  ['Какой зуб у ребёнка обычно прорезывается первым?', 'Нижний центральный резец', 'Верхний клык', 'Первый моляр', 'Верхний боковой резец'],
  ['Эмаль в основном состоит из минерала…', 'Гидроксиапатита', 'Кварца', 'Кальцита', 'Гипса'],
  ['Как подбирают цвет будущей коронки?', 'По шкале-расцветке (например, VITA)', 'На глаз по фото', 'По цвету десны', 'По цвету глаз пациента'],
  ['День стоматолога в России отмечают…', '9 февраля', '1 сентября', '5 октября', '8 марта'],
  ['Клык по счёту от центра в зубном ряду —', 'третий', 'второй', 'четвёртый', 'пятый'],
  ['Альгинатная масса нужна, чтобы…', 'Снять слепок', 'Обжечь керамику', 'Склеить коронку', 'Отполировать зуб'],
  ['Каркас коронки из диоксида циркония — это…', 'Керамика', 'Металл', 'Пластмасса', 'Воск'],
  ['Жевательные бугры есть у…', 'Премоляров и моляров', 'Только резцов', 'Только клыков', 'Молочных резцов'],
];

const shuffle = (a) => {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export default {
  id: 'quiz',
  title: 'Коллоквиум',
  icon: '📝',
  scoreLabel: 'баллов',
  howto: '10 вопросов по анатомии зубов и материалам. На каждый — несколько секунд, быстрые ответы и серии дают больше баллов.\n⭐ 5 верных · ⭐⭐ 7 · ⭐⭐⭐ 9',
  create(api) {
    const { ctx } = api;
    const level = api.opts.level || 1;
    const total = 10;
    const perQ = Math.max(8, 13 - Math.floor(level / 2)); // faster as Lana gets better
    const qs = shuffle([...POOL]).slice(0, total);
    let i = -1;
    let left = perQ;
    let correct = 0;
    let score = 0;
    let streak = 0;
    let locked = true;
    let flash = 0;
    let flashCol = '#3fcfae';

    const box = document.createElement('div');
    box.className = 'mgq';
    box.innerHTML = `<div class="mgq-card"><div class="mgq-n"></div><div class="mgq-q"></div><div class="mgq-timer"><i></i></div></div><div class="mgq-opts"></div>`;
    api.root.appendChild(box);
    const nEl = box.querySelector('.mgq-n');
    const qEl = box.querySelector('.mgq-q');
    const tEl = box.querySelector('.mgq-timer i');
    const opts = box.querySelector('.mgq-opts');

    function next() {
      i++;
      if (i >= qs.length) return finish();
      const [q, right, ...wrong] = qs[i];
      const answers = shuffle([right, ...wrong]);
      nEl.textContent = `Вопрос ${i + 1} из ${qs.length}`;
      qEl.textContent = q;
      opts.innerHTML = '';
      answers.forEach((a, k) => {
        const b = document.createElement('button');
        b.className = 'mgq-opt';
        b.style.animationDelay = `${k * 0.06}s`;
        b.innerHTML = `<span>${'АБВГ'[k]}</span>${a}`;
        b.addEventListener('click', () => pick(b, a === right, right));
        opts.appendChild(b);
      });
      box.querySelector('.mgq-card').classList.remove('in');
      void box.offsetWidth;
      box.querySelector('.mgq-card').classList.add('in');
      left = perQ;
      locked = false;
    }

    function reveal(right) {
      opts.querySelectorAll('.mgq-opt').forEach((b) => {
        if (b.textContent.slice(1) === right) b.classList.add('right');
        b.disabled = true;
      });
    }

    function pick(b, ok, right) {
      if (locked || !api.playing) return;
      locked = true;
      if (ok) {
        correct++;
        streak++;
        const pts = 60 + Math.round((left / perQ) * 40) + Math.min(streak - 1, 4) * 10;
        score += pts;
        b.classList.add('right');
        api.sfx('success');
        flashCol = '#3fcfae';
      } else {
        streak = 0;
        b.classList.add('wrong');
        api.sfx('bad');
        api.vibrate && api.vibrate(60);
        flashCol = '#ff6f8a';
      }
      flash = 1;
      reveal(right);
      setTimeout(next, ok ? 750 : 1300);
    }

    function timeout() {
      locked = true;
      streak = 0;
      api.sfx('fail');
      flashCol = '#ffb35e';
      flash = 1;
      reveal(qs[i][1]);
      setTimeout(next, 1300);
    }

    function finish() {
      const stars = correct >= 9 ? 3 : correct >= 7 ? 2 : correct >= 5 ? 1 : 0;
      box.remove();
      api.end({ score, stars, correct, text: `Верных ответов: ${correct} из ${qs.length}` });
    }

    return {
      start() {
        next();
      },
      update(dt) {
        if (!locked && i >= 0 && i < qs.length) {
          left -= dt;
          if (left <= 0) {
            left = 0;
            timeout();
          }
        }
        tEl.style.width = `${(left / perQ) * 100}%`;
        tEl.style.background = left < 3 ? '#ff6f8a' : left < perQ / 2 ? '#ffb35e' : '#3fcfae';
        flash = Math.max(0, flash - dt * 2.5);
        api.setStats([`✅ ${correct}`, `🔥 ${streak}`, `⭐ ${score}`]);
      },
      draw() {
        const g = ctx.createLinearGradient(0, 0, 0, api.H);
        g.addColorStop(0, '#eef2ff');
        g.addColorStop(1, '#ffeef5');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, api.W, api.H);
        // notebook lines
        ctx.strokeStyle = 'rgba(154,123,255,.12)';
        ctx.lineWidth = 1;
        for (let y = 40; y < api.H; y += 28) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(api.W, y);
          ctx.stroke();
        }
        ctx.strokeStyle = 'rgba(255,111,156,.25)';
        ctx.beginPath();
        ctx.moveTo(36, 0);
        ctx.lineTo(36, api.H);
        ctx.stroke();
        ctx.font = '28px serif';
        ctx.globalAlpha = 0.18;
        ['🦷', '📚', '✏️', '🔬'].forEach((e, k) => ctx.fillText(e, (k * 0.27 + 0.08) * api.W, api.H - 30 - (k % 2) * 40));
        ctx.globalAlpha = 1;
        if (flash > 0) {
          ctx.fillStyle = flashCol;
          ctx.globalAlpha = flash * 0.25;
          ctx.fillRect(0, 0, api.W, api.H);
          ctx.globalAlpha = 1;
        }
      },
      destroy() {
        box.remove();
      },
    };
  },
};
