const TB_TOKEN = import.meta.env.VITE_TB_TOKEN;

if (!TB_TOKEN) {
  alert(
    "go to https://ui.tinybird.co/tokens fill your public_read_token in your local .env file"
  );
}

const TB_API_URL = "https://api.tinybird.co";

const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 500;

const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

const colorpicker = document.getElementById("colorpicker");
const datepicker = document.getElementById("datepicker");
const removeDatepicker = document.getElementById("remove-datepicker");

let pixels = [];
let isPressed = false;
let realtime = true;

const draw = function ({ x, y, color }) {
  ctx.beginPath();
  ctx.fillStyle = color;
  ctx.fillRect(x, y, 1, 1);
  ctx.fill();
};

const printSnapshot = function ({ dateStart, dateEnd } = {}) {
  const dateParam = dateStart
    ? `?start_date=${dateStart}`
    : dateEnd
    ? `?historic_date=${dateEnd}`
    : "";

  fetch(`${TB_API_URL}/v0/pipes/get_snapshot.json${dateParam}`, {
    method: "GET",
    headers: new Headers({
      Authorization: `Bearer ${TB_TOKEN}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    }),
  })
    .then(function (response) {
      return response.json();
    })
    .then(function ({ data }) {
      data.forEach(function (item) {
        draw(item);
      });
    });
};

const ingestPixels = function (pixels) {
  const ndjson = pixels
    .map((item) => ({ ...item, date: now() }))
    .reduce(
      (prev, current) =>
        `${prev}
${JSON.stringify(current)}`,
      ""
    );

  fetch(`${TB_API_URL}/v0/events?name=pixels_table`, {
    method: "POST",
    headers: new Headers({
      Authorization: `Bearer ${TB_TOKEN}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    }),
    body: ndjson,
  });
};

const init = function () {
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  canvas.style.width = `${CANVAS_WIDTH}px`;
  canvas.style.height = `${CANVAS_HEIGHT}px`;

  printSnapshot();
};

const getPixelClicked = function (canvas, event) {
  let rect = canvas.getBoundingClientRect();

  return {
    x: Math.floor(event.clientX - rect.left),
    y: Math.floor(event.clientY - rect.top),
    color: colorpicker.value,
  };
};

const now = function (lag = 0) {
  const MILISECONDS = 1000;
  const format = (number) => (number < 10 ? `0${number}` : number);

  const d = new Date(Date.now() - lag * MILISECONDS);

  const day = format(d.getUTCDate());
  const month = format(d.getUTCMonth() + 1);
  const year = format(d.getUTCFullYear());

  const hour = format(d.getUTCHours());
  const minutes = format(d.getUTCMinutes());
  const seconds = format(d.getUTCSeconds());

  const date = `${year}-${month}-${day}`;
  const time = `${hour}:${minutes}:${seconds}`;

  return `${date} ${time}`;
};

const onPressBrush = function (event) {
  isPressed = true;
  useBrush(event);
};

const onRaiseBrush = function () {
  isPressed = false;
  ingestPixels(pixels);
  pixels = [];
};

const useBrush = function (event) {
  if (isPressed) {
    const pixel = getPixelClicked(canvas, event);
    if (!pixels.find((item) => pixel.x === item.x && pixel.y === item.y)) {
      pixels.push(pixel);
    }
    draw(pixel);
  }
};

canvas.onmousedown = realtime ? onPressBrush : () => {};
canvas.ontouchstart = realtime ? onPressBrush : () => {};

canvas.ontouchmove = realtime ? useBrush : () => {};
canvas.onmousemove = realtime ? useBrush : () => {};

canvas.ontouchend = realtime ? onRaiseBrush : () => {};
canvas.onmouseup = realtime ? onRaiseBrush : () => {};

window.setInterval(function () {
  if (realtime) {
    printSnapshot({ dateStart: now(10) });
  }
}, 1000);

// colorPicker ui
colorpicker.oninput = function () {
  const colorBox = document.getElementById("color-box");
  colorBox.style.backgroundColor = this.value;
};

// datePicker
datepicker.oninput = function () {
  removeDatepicker.style = "display: inline";
  canvas.style = "cursor: not-allowed";
  realtime = false;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const dateSelected = datepicker.value; // format yyyy-mm-ddThh:mm
  printSnapshot({ dateEnd: dateSelected.replace("T", " ").concat(":00") });
};

removeDatepicker.onclick = function () {
  removeDatepicker.style = "display: none";
  canvas.style = "cursor: crosshair";
  realtime = true;

  datepicker.value = null;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  printSnapshot({});
};

init();
