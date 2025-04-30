import { bangs } from "./bang";
import { renderBangsPage } from "./dataset";
import "./global.css";

function noSearchDefaultPageRender() {
  const app = document.querySelector<HTMLDivElement>("#app")!;
  app.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh;">
      <div class="content-container">
        <h1>Better Und*ck</h1>
        <p>DuckDuckGo's bang redirects are too slow. Add the following URL as a custom search engine to your browser.</p>
        <p style="margin-top: 5px">Everythings works <b>offline</b> and allows for your <b>custom bangs</b>!</p>
        <div class="url-container"> 
          <input 
            type="text" 
            class="input"
            value="https://bangs.mopsior.pl?q=%s"
            readonly
            id="url-input"
          />
          <button class="copy-button">
            <img src="/clipboard.svg" alt="Copy" />
          </button>
        </div>
        <button class="button" style="margin-top: 24px;" id="open-dialog">Add custom bangs</button>
        <dialog id="add-dialog" closedby="any">
          <form>
            <div>
              <h2>Add custom bang</h2>
              <p class="sm" style="margin-top: 4px;">For list of all bangs, go to <a href="/dataset">bangs list</a></p>
            </div>
            <div class="inputs-grid">
              <div class="input-container">
                <label for="bang">Bang</label>
                <label class="sm" for="bang">This will override existing DuckDuckGo bangs</label>
                <input class="input" type="text" id="bang" placeholder="p" required />
              </div>
              <div class="input-container">
                <label for="domain">Domain</label>
                <label class="sm" for="domain">This will be used as a default domain</label>
                <input class="input" type="text" id="domain" placeholder="perplexity.ai" required />
              </div>
              <div class="input-container" style="grid-column: span 2;">
                <label for="bang">Search URL</label>
                <label class="sm" for="bang">URL with <code>{{{s}}}</code> as placeholder for the search query</label>
                <input class="input" type="text" id="search-url" placeholder="https://perplexity.ai/search?p={{{s}}}}" required />
              </div>
            </div>
            <div style="display: flex; justify-content: space-between; margin-top: 8px;">
              <button id="close" class="button">Close</button>
              <button type="submit" class="button">Add</button>
            </div>
            </form>
        </dialog>
      </div>
      <footer class="footer">
        <a href="/dataset">bangs list</a>
        •
        <a href="https://unduck.link" target="_blank">original und*ck</a>
        •
        <a href="https://github.com/Mopsior/bangs" target="_blank">github</a>
      </footer>
    </div>
  `;

  const dialog = app.querySelector<HTMLDialogElement>("#add-dialog")!;
  const closeButton = app.querySelector("#close")!;
  const openButton = app.querySelector("#open-dialog")!;
  const form = app.querySelector<HTMLFormElement>("form")!;

  const copyButton = app.querySelector<HTMLButtonElement>(".copy-button")!;
  const copyIcon = copyButton.querySelector("img")!;
  const urlInput = app.querySelector<HTMLInputElement>("#url-input")!;

  copyButton.addEventListener("click", async () => {
    await navigator.clipboard.writeText(urlInput.value);
    copyIcon.src = "/clipboard-check.svg";

    setTimeout(() => {
      copyIcon.src = "/clipboard.svg";
    }, 2000);
  });

  closeButton.addEventListener("click", (e) => {
    e.preventDefault();
    dialog.close();
  })

  openButton.addEventListener("click", (e) => {
    e.preventDefault();
    dialog.showModal();
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const bang = (e.target as HTMLFormElement).elements.namedItem("bang") as HTMLInputElement;
    const domain = (e.target as HTMLFormElement).elements.namedItem("domain") as HTMLInputElement;
    const searchUrl = (e.target as HTMLFormElement).elements.namedItem("search-url") as HTMLInputElement;

    if (!bang.value || !domain.value || !searchUrl.value) return;

    const customBangs = getCustomBangs();
    customBangs.push({
      c: "custom",
      d: domain.value,
      t: bang.value,
      u: searchUrl.value,
    });
    localStorage.setItem("custom-bangs", JSON.stringify(customBangs));
    dialog.close();
  })
}

function getCustomBangs() {
  const raw = localStorage.getItem("custom-bangs");
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (b) => b && typeof b.t === "string" && typeof b.u === "string" && typeof b.d === "string"
      );
    }
  } catch {}
  return [];
}


const allBangs = [...getCustomBangs(), ...bangs];

const LS_DEFAULT_BANG = localStorage.getItem("default-bang") ?? "g";
const defaultBang = allBangs.find((b) => b.t === LS_DEFAULT_BANG);

function getBangredirectUrl() {
  const url = new URL(window.location.href);
  const query = url.searchParams.get("q")?.trim() ?? "";
  if (!query) {
    noSearchDefaultPageRender();
    return null;
  }

  const match = query.match(/!(\S+)/i);
  
  const bangCandidate = match?.[1]?.toLowerCase();
  const selectedBang = allBangs.find((b) => b.t === bangCandidate) ?? defaultBang;
  console.log(getCustomBangs(), match, bangCandidate, selectedBang)

  // Remove the first bang from the query
  const cleanQuery = query.replace(/!\S+\s*/i, "").trim();

  // If the query is just `!gh`, use `github.com` instead of `github.com/search?q=`
  if (cleanQuery === "")
    return selectedBang ? `https://${selectedBang.d}` : null;

  // Format of the url is:
  // https://www.google.com/search?q={{{s}}}
  const searchUrl = selectedBang?.u.replace(
    "{{{s}}}",
    // Replace %2F with / to fix formats like "!ghr+t3dotgg/unduck"
    encodeURIComponent(cleanQuery).replace(/%2F/g, "/"),
  );
  if (!searchUrl) return null;

  return searchUrl;
}

function doRedirect() {
  if (window.location.pathname === "/dataset") {
    renderBangsPage();
    return;
  }

  const searchUrl = getBangredirectUrl();
  if (!searchUrl) return;
  window.location.replace(searchUrl);
}

doRedirect();