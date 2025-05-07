import { bangs } from "./bang";
import { CustomBang } from "./main";

const BANGS_PER_PAGE = 50;
let currentPage = 0;

export const renderBangsPage = () => {
  const app = document.querySelector<HTMLDivElement>("#app")!;
  app.innerHTML = `
    <div class="bangs-container relative">
      <a class="back" href="/">back</a>
      <h1>Bangs List</h1>
      <p style="margin-top: 10px;">User bangs</p>
      <table>
        <thead>
          <tr>
            <th>Bang</th>
            <th>Search URL</th>
            <th>Domain</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="user-bangs-table-body" />
      </table>
      <p style="margin-top: 10px;">Static bangs</p>
      <table>
        <thead>
          <tr>
            <th>Bang</th>
            <th>Search URL</th>
            <th>Domain</th>
          </tr>
        </thead>
        <tbody id="bangs-table-body" />
      </table>
      <button id="load-more" class="button" style="margin-top: 24px;">Load More</button>
    </div>
  `;

  const loadMoreButton = document.getElementById("load-more");
  const tableBody = document.getElementById("bangs-table-body");
  const userTableBody = document.getElementById("user-bangs-table-body");

  if (!loadMoreButton || !tableBody || !userTableBody) return;

  // Reset state on render
  currentPage = 0;
  tableBody.innerHTML = "";
  userTableBody.innerHTML = "";

  const loadMoreBangs = () => {
    const start = currentPage * BANGS_PER_PAGE;
    const end = start + BANGS_PER_PAGE;
    const currentBangs = bangs.slice(start, end);

    const tableRows = currentBangs.map(
      (bang) => `
        <tr>
          <td><p>${bang.t}</p></td>
          <td><code>${bang.u}</code></td>
          <td><a href="${bang.d}" target="_blank">${bang.d}</a></td>
        </tr>
      `
    ).join("");

    tableBody.innerHTML += tableRows;
    currentPage++;

    if (end >= bangs.length) {
      loadMoreButton.style.display = "none"; // Hide the button when all items are loaded
    }
  };

  loadMoreButton.addEventListener("click", loadMoreBangs);

    (window as any).removeUserBang = (index: number) => {
      const userBangs: CustomBang[] = (() => {
        try {
          const raw = localStorage.getItem("custom-bangs");
          if (!raw) return [];
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            return parsed.filter(
              (b): b is CustomBang =>
                b && typeof b.t === "string" && typeof b.u === "string" && typeof b.d === "string"
            );
          }
        } catch {}
        return [];
      })();

      userBangs.splice(index, 1);
      localStorage.setItem("custom-bangs", JSON.stringify(userBangs));
      loadUserBangs();
    }

  const loadUserBangs = () => {
    const userBangs: CustomBang[] = (() => {
      try {
        const raw = localStorage.getItem("custom-bangs");
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed.filter(
            (b): b is CustomBang =>
              b && typeof b.t === "string" && typeof b.u === "string" && typeof b.d === "string"
          );
        }
      } catch {}
      return [];
    })();

    const userTableRows = userBangs.map(
      (bang, index) => `
        <tr>
          <td><p>${bang.t}</p></td>
          <td><code>${bang.u}</code></td>
          <td><a href="${bang.d}" target="_blank">${bang.d}</a></td>
          <td><button class="button" onclick="removeUserBang(${index})"><img src="/trash.svg" /></button></td>
        </tr>
      `
    ).join("");

    userTableBody.innerHTML = userTableRows;
  };

  // Initial load
  loadUserBangs();
  loadMoreBangs();
};