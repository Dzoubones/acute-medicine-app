import './styles.css';
import { Network } from '@capacitor/network';

const app = document.querySelector('#app');

app.innerHTML = `
  <main class="shell">
    <section class="brand-card">
      <div class="logo-mark">AMT</div>
      <h1>Acute Medical Take</h1>
      <p>UK acute medicine clinical guide</p>
      <div id="status" class="status">Connecting to clinical content…</div>
      <a class="primary" href="https://www.acutemedicaltake.org">Open Acute Medical Take</a>
      <p class="small">If you are offline, reconnect to access the live clinical pathways. Offline emergency packs will be added in the next build.</p>
    </section>
  </main>
`;

async function refreshStatus() {
  const status = await Network.getStatus();
  const el = document.querySelector('#status');
  el.textContent = status.connected ? 'Online — live pathways available' : 'Offline — live pathways unavailable';
  el.dataset.online = String(status.connected);
}

refreshStatus();
Network.addListener('networkStatusChange', refreshStatus);
