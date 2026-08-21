// ============================================
// FilesFlex File Manager
// ============================================


// LOAD FILES
async function loadFiles() {

  const status =
    document.getElementById("status");

  const container =
    document.getElementById("files");


  status.textContent =
    "Loading files...";


  try {

    const response =
      await fetch("/api/files");


    if (!response.ok) {

      throw new Error(
        "API error: " + response.status
      );

    }


    const data =
      await response.json();


    container.innerHTML = "";


    if (
      !data.files ||
      data.files.length === 0
    ) {

      status.textContent =
        "No files found.";

      container.innerHTML = `
        <div class="empty">
          📂 Wala pang files.
        </div>
      `;

      return;

    }


    status.textContent =
      data.files.length +
      " file(s) found.";


    data.files.forEach(
      file => createFileCard(file)
    );


  } catch (error) {

    console.error(error);


    status.textContent =
      "❌ Error: " +
      error.message;


    container.innerHTML = `
      <div class="empty">
        ❌ Hindi makuha ang files.
        <br><br>
        ${escapeHtml(error.message)}
      </div>
    `;

  }

}



// CREATE FILE CARD
function createFileCard(file) {

  const container =
    document.getElementById("files");


  const card =
    document.createElement("div");

  card.className =
    "file";


  // FILE NAME
  const name =
    document.createElement("div");

  name.className =
    "file-name";

  name.textContent =
    "📄 " + file.key;


  // FILE SIZE
  const size =
    document.createElement("div");

  size.className =
    "file-size";

  size.textContent =
    "Size: " +
    formatSize(file.size);


  // DATE
  const date =
    document.createElement("div");

  date.className =
    "file-date";


  if (file.uploaded) {

    const uploadedDate =
      new Date(file.uploaded);

    date.textContent =
      "Uploaded: " +
      uploadedDate.toLocaleString();

  }


  // BUTTON CONTAINER
  const buttons =
    document.createElement("div");

  buttons.className =
    "buttons";


  // OPEN
  const open =
    document.createElement("a");

  open.className =
    "open-button";

  open.textContent =
    "▶ Open";

  open.href =
    "/api/download?key=" +
    encodeURIComponent(file.key);

  open.target =
    "_blank";


  // DOWNLOAD
  const download =
    document.createElement("a");

  download.className =
    "download-button";

  download.textContent =
    "⬇ Download";

  download.href =
    "/api/download?key=" +
    encodeURIComponent(file.key);

  download.download =
    file.key;


  // DELETE
  const deleteButton =
    document.createElement("button");

  deleteButton.className =
    "delete-button";

  deleteButton.textContent =
    "🗑 Delete";


  deleteButton.onclick =
    () => deleteFile(file.key);


  buttons.appendChild(open);

  buttons.appendChild(download);

  buttons.appendChild(deleteButton);


  card.appendChild(name);

  card.appendChild(size);

  card.appendChild(date);

  card.appendChild(buttons);


  // VIDEO PREVIEW
  if (isVideo(file.key)) {

    const video =
      document.createElement("video");

    video.className =
      "video-preview";

    video.controls =
      true;

    video.preload =
      "metadata";

    video.src =
      "/api/download?key=" +
      encodeURIComponent(file.key);

    card.appendChild(video);

  }


  container.appendChild(card);

}



// UPLOAD FILE
async function uploadFile() {

  const input =
    document.getElementById("fileInput");

  const button =
    document.getElementById("uploadButton");

  const status =
    document.getElementById("uploadStatus");


  if (
    !input.files ||
    input.files.length === 0
  ) {

    status.textContent =
      "⚠️ Pumili muna ng file.";

    return;

  }


  const file =
    input.files[0];


  button.disabled =
    true;


  status.textContent =
    "⏳ Uploading " +
    file.name +
    "...";


  try {

    const url =
      "/api/upload?name=" +
      encodeURIComponent(file.name);


    const response =
      await fetch(
        url,
        {
          method: "POST",
          body: file
        }
      );


    if (!response.ok) {

      throw new Error(
        "Upload error: " +
        response.status
      );

    }


    const data =
      await response.json();


    if (!data.success) {

      throw new Error(
        data.error ||
        "Upload failed"
      );

    }


    status.textContent =
      "✅ Upload successful!";


    input.value =
      "";


    await loadFiles();


  } catch (error) {

    console.error(error);


    status.textContent =
      "❌ " +
      error.message;

  }


  button.disabled =
    false;

}



// DELETE FILE
async function deleteFile(key) {

  const confirmed =
    confirm(
      "Delete this file?\n\n" +
      key
    );


  if (!confirmed) {

    return;

  }


  try {

    const response =
      await fetch(
        "/api/delete?key=" +
        encodeURIComponent(key),
        {
          method: "DELETE"
        }
      );


    if (!response.ok) {

      throw new Error(
        "Delete error: " +
        response.status
      );

    }


    const data =
      await response.json();


    if (!data.success) {

      throw new Error(
        data.error ||
        "Delete failed"
      );

    }


    await loadFiles();


  } catch (error) {

    console.error(error);


    alert(
      "❌ Hindi ma-delete ang file.\n\n" +
      error.message
    );

  }

}



// FORMAT FILE SIZE
function formatSize(bytes) {

  if (!bytes) {

    return "0 B";

  }


  if (bytes < 1024) {

    return bytes + " B";

  }


  if (bytes <
      1024 * 1024) {

    return (
      bytes / 1024
    ).toFixed(1) +
    " KB";

  }


  if (bytes <
      1024 * 1024 * 1024) {

    return (
      bytes /
      1024 /
      1024
    ).toFixed(1) +
    " MB";

  }


  return (
    bytes /
    1024 /
    1024 /
    1024
  ).toFixed(2) +
  " GB";

}



// CHECK VIDEO
function isVideo(filename) {

  const videoExtensions = [

    ".mp4",
    ".webm",
    ".ogg",
    ".mov",
    ".m4v"

  ];


  const lower =
    filename.toLowerCase();


  return videoExtensions.some(
    extension =>
      lower.endsWith(extension)
  );

}



// BASIC HTML ESCAPE
function escapeHtml(text) {

  const div =
    document.createElement("div");

  div.textContent =
    text;

  return div.innerHTML;

}



// UPLOAD BUTTON
document
  .getElementById("uploadButton")
  .addEventListener(
    "click",
    uploadFile
  );



// REFRESH BUTTON
document
  .getElementById("refreshButton")
  .addEventListener(
    "click",
    loadFiles
  );



// INITIAL LOAD
loadFiles();
