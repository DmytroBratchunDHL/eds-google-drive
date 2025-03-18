// add delayed functionality here
import marketoForm from '../blocks/marketo-form/MarketoForm.js';

marketoForm.init();

const prodLaunch = 'https://assets.adobedtm.com/cd52279ef3fa/3cec625096bb/launch-f5a07920ff7f.min.js';
const stageLaunch = 'https://assets.adobedtm.com/cd52279ef3fa/3cec625096bb/launch-8022e0cc7c33-staging.min.js';

function isProd() {
  return window.location.host.includes('www.dhl.com');
}

function loadLaunch() {
  const launch = document.createElement('script');
  launch.src = isProd() ? prodLaunch : stageLaunch;
  launch.onload = function onEvergageLoad() {};
  launch.onerror = function onEvergageError() {};
  document.head.appendChild(launch);
}

loadLaunch();
