import './style.css';

// @ts-expect-error - DevDocs.ai types have not been included here
window.devdocsai = {
  projectKey: import.meta.env.VITE_PROJECT_API_KEY,
  options: {
    search: { enabled: true },
  },
};

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <p>Open the DevDocs.ai dialog ↘️</p>
  </div>
`;
