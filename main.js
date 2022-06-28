const TB_TOKEN =
  "p.eyJ1IjogIjM0YmRiNTJkLTRiYjYtNDljZi04ZjdjLWI4MmM3MjVmNjRmNSIsICJpZCI6ICJiYzYwZjYzOC1lYzAwLTQxYTgtODhkNS05ZmNhZmNhNmI0MDUifQ.BBKGRtAlvq_cFP-anEaaYi6WSViUWQuVAvB_kSY4qig";
const TB_API_URL = "https://api.tinybird.co";

const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 500;

const colorpicker = document.getElementById("colorpicker");
const datepicker = document.getElementById("datepicker");
const removeDatepicker = document.getElementById("remove-datepicker");

const canvas = document.getElementById("board");
const colorBox = document.getElementById("color-box");
const ctx = canvas.getContext("2d");

let pixels = [];
let isPressed = false;
let realtime = true;

const printSnapshot = function ({ dateStart, dateEnd } = {}) {
  const dateParam = dateStart
    ? `?date_start=${dateStart}`
    : dateEnd
    ? `?date_end=${dateEnd}`
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

const ingestPixels = function (pixels) {
  const ndjson = pixels
    .map((item) => ({ ...item, timestamp: now() }))
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

const draw = function ({ x, y, color }) {
  ctx.beginPath();
  ctx.fillStyle = color;
  ctx.fillRect(x, y, 1, 1);
  ctx.fill();
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
    pixels.push(pixel);
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

// colorPicker
colorpicker.oninput = function () {
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