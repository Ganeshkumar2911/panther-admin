export const downloadFile = (downloadUrl) => {
  if (!downloadUrl) {
    return false;
  }

  const link = document.createElement("a");
  link.href = downloadUrl;
  link.setAttribute("download", "");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  return true;
};
