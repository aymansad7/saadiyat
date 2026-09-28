import { describe, expect, it } from "vitest";
import { masterDocumentOpenUrl } from "../AdminOneDriveDocuments";

describe("Master OneDrive document opening", () => {
  it("uses an anonymous link only when present, otherwise preserves the restricted OneDrive URL", () => {
    expect(masterDocumentOpenUrl({ shareUrl: "https://share.example/document", webUrl: "https://onedrive.example/document" })).toBe("https://share.example/document");
    expect(masterDocumentOpenUrl({ shareUrl: null, webUrl: "https://onedrive.example/restricted" })).toBe("https://onedrive.example/restricted");
    expect(masterDocumentOpenUrl({ shareUrl: null, webUrl: null })).toBeNull();
  });
});
