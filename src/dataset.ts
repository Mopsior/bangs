import { bangs } from "./bang";

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
          </tr>
        </thead>
        <tbody id="user-bangs-table-body">
        </tbody>
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
        <tbody id="bangs-table-body">
        </tbody>
      </table>
      <button id="load-more" class="button" style="margin-top: 24px;">Load More</button>
    </div>
  `;

  const loadMoreButton = document.getElementById("load-more")!;
  const tableBody = document.getElementById("bangs-table-body")!;
  const userTableBody = document.getElementById("user-bangs-table-body")!;

  const loadMoreBangs = () => {
    const start = currentPage * BANGS_PER_PAGE;
    const end = start + BANGS_PER_PAGE;
    const currentBangs = bangs.slice(start, end);

    const tableRows = currentBangs.map(
      (bang) => `
        <tr>
          <td>
            <p>${bang.t}</p>
          </td>
          <td>
            <code>${bang.u}</code>
          </td>
          <td>
            <a href="${bang.d}" target="_blank">${bang.d}</a>
          </td>
        </tr>
      `,
    ).join("");

    tableBody.innerHTML += tableRows;

    currentPage++;

    if (end >= bangs.length) {
      loadMoreButton.style.display = "none"; // Hide the button when all items are loaded
    }
  };

  loadMoreButton.addEventListener("click", loadMoreBangs);

  const loadUserBangs = () => {
    const userBangs = JSON.parse(localStorage.getItem("custom-bangs") || "[]");
    const userTableRows = userBangs.map(
      (bang: { c: string, s: string, t: string; u: string; d: string; }) => `
        <tr>
          <td>
            <p>${bang.t}</p>
          </td>
          <td>
            <code>${bang.u}</code>
          </td>
          <td>
            <a href="${bang.d}" target="_blank">${bang.d}</a>
          </td>
        </tr>
      `,
    ).join("");

    userTableBody.innerHTML += userTableRows;
  }

  // Initial load
  loadUserBangs();
  loadMoreBangs();
};