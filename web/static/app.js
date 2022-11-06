
window.onload = function () {
  const incrBtn = document.getElementById('incrBtn');
  const resetBtn = document.getElementById('resetBtn');
  const counterEvents = new EventSource('/count');
  const counterElem = document.getElementById('counterValue');

  counterEvents.addEventListener('count', (e) => {
    counterElem.innerText = e.data;
  });

  incrBtn.onclick = async function () {
    await fetch('/incr');
  };

  resetBtn.onclick = async function () {
    await fetch('/reset');
  }
}